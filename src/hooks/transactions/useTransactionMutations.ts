import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, optimisticHelpers } from "../../utils/common/queryClient.ts";
import { budgetDb } from "../../db/budgetDb.ts";
import { useTransactionBalanceUpdater } from "./useTransactionBalanceUpdater.ts";
import logger from "../../utils/common/logger.ts";
import type { Transaction } from "../../db/types.ts";
import {
  normalizeTransactionAmount,
  validateAndNormalizeTransaction,
  validateTransactionPartialSafe,
} from "@/domain/schemas/transaction";

export interface TransactionInput {
  date?: string;
  amount?: number;
  type?: "income" | "expense" | "transfer";
  category?: string;
  description?: string;
  envelopeId?: string;
  merchant?: string;
  receiptUrl?: string;
  notes?: string;
  [key: string]: unknown;
}

interface TransactionUpdateInput {
  id: string;
  updates: Partial<Transaction>;
}

interface WindowWithCloudSync extends Window {
  cloudSyncService?: {
    triggerSyncForCriticalChange: (changeType: string) => void;
  };
}

// Helper to trigger sync for transaction changes
const triggerTransactionSync = (changeType: string) => {
  const windowObj = window as WindowWithCloudSync;
  if (typeof window !== "undefined" && windowObj.cloudSyncService) {
    windowObj.cloudSyncService.triggerSyncForCriticalChange(`transaction_${changeType}`);
  }
};

/**
 * Transaction Mutations Hook
 * Provides all transaction CRUD operations with TanStack Query
 *
 * Function Length: 164 lines (exceeds max 150)
 * Justification: This hook manages 4 related mutations (add, reconcile, delete, update)
 * that share:
 * - Common query invalidation logic
 * - Balance update side effects
 * - Cloud sync triggers
 * - Error handling patterns
 * Splitting into separate hooks would:
 * - Create 4 files for closely related operations
 * - Duplicate invalidation/sync logic
 * - Hurt developer experience (import from multiple files)
 * - Violate cohesion principle (transaction operations belong together)
 */
// eslint-disable-next-line max-lines-per-function
export const useTransactionMutations = () => {
  const queryClient = useQueryClient();
  const { updateBalancesForTransaction } = useTransactionBalanceUpdater();

  const addTransactionMutation = useMutation({
    mutationKey: ["transactions", "add"],
    mutationFn: async (transactionData: TransactionInput): Promise<Transaction> => {
      // ARCHITECTURE: Envelopes are where all money is kept (source of truth).
      // Behind the scenes: Supplemental accounts and savings goals are stored as envelopes
      // (for data consistency and transaction routing), but filtered from envelope UI.
      // Bills are just planned transactions. Debts are bills with finite amount/time.
      // Paying bills/debts = creating a transaction to an envelope.
      // CRITICAL: Transactions MUST have an envelope (envelopes are source of truth)
      if (!transactionData.envelopeId || transactionData.envelopeId.trim() === "") {
        throw new Error("Transaction must have an envelope. Envelope ID is required.");
      }

      // Validate envelope exists before creating transaction
      // Note: Behind the scenes, this could be a regular envelope, supplemental account, or savings goal
      // (all stored as envelopes in the database, but filtered from envelope UI)
      const envelope = await budgetDb.envelopes.get(transactionData.envelopeId);
      if (!envelope) {
        throw new Error(
          `Cannot create transaction: Envelope "${transactionData.envelopeId}" does not exist. Transactions must be linked to an existing envelope.`
        );
      }

      const rawTransaction: Transaction = {
        id: Date.now().toString(),
        date: new Date(transactionData.date || new Date().toISOString().split("T")[0]),
        type: transactionData.type || "expense",
        category: transactionData.category || envelope.category || "other",
        createdAt: Date.now(),
        amount: transactionData.amount || 0,
        envelopeId: transactionData.envelopeId, // Required - validated above
        lastModified: Date.now(),
        description: transactionData.description,
        merchant: transactionData.merchant,
        receiptUrl: transactionData.receiptUrl,
      };

      // Check for sign mismatch and warn/auto-correct
      // Note: Normal UI flow won't trigger this because forms handle sign conversion
      // This catches: imports, API calls, programmatic creation, manual DB edits
      const isSignMismatch =
        (rawTransaction.type === "expense" && rawTransaction.amount > 0) ||
        (rawTransaction.type === "income" && rawTransaction.amount < 0);

      if (isSignMismatch) {
        const correctedAmount =
          rawTransaction.type === "expense"
            ? -Math.abs(rawTransaction.amount)
            : Math.abs(rawTransaction.amount);

        logger.warn("⚠️ Transaction amount sign mismatch - auto-correcting", {
          type: rawTransaction.type,
          originalAmount: rawTransaction.amount,
          correctedAmount,
          description: rawTransaction.description,
          context: "Auto-normalization active - expense→negative, income→positive",
        });
      }

      // Normalize amount sign based on type (expense=negative, income=positive)
      const normalizedTransaction = normalizeTransactionAmount(rawTransaction);

      // Validate with Zod schema (includes sign validation)
      const validatedTransaction = validateAndNormalizeTransaction(normalizedTransaction);

      await optimisticHelpers.addTransaction(queryClient, validatedTransaction);
      await budgetDb.transactions.put(validatedTransaction);
      await updateBalancesForTransaction(validatedTransaction);
      return validatedTransaction;
    },
    onSuccess: (transaction) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
      logger.info("✅ Transaction added", {
        amount: transaction.amount,
        type: transaction.type,
        description: transaction.description,
        envelope: transaction.envelopeId || "unassigned",
        category: transaction.category,
      });
      triggerTransactionSync("added");
    },
    onError: (error) => {
      logger.error("Failed to add transaction", error, { source: "addTransactionMutation" });
    },
  });

  const reconcileTransactionMutation = useMutation({
    mutationKey: ["transactions", "reconcile"],
    mutationFn: async (transactionData: TransactionInput): Promise<Transaction> => {
      const reconciledTransaction: Transaction = {
        id: Date.now().toString(),
        date: new Date(transactionData.date || new Date().toISOString().split("T")[0]),
        amount: transactionData.amount || 0,
        envelopeId: transactionData.envelopeId || "",
        category: transactionData.category || "other",
        type: transactionData.type || "expense",
        lastModified: Date.now(),
        createdAt: Date.now(),
        description: transactionData.description,
      };

      await optimisticHelpers.addTransaction(queryClient, reconciledTransaction);
      await budgetDb.transactions.put(reconciledTransaction);
      return reconciledTransaction;
    },
    onSuccess: (transaction) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      logger.info("✅ Balance reconciled", {
        amount: transaction.amount,
        type: transaction.type,
        description: transaction.description,
        method: "manual",
      });
      triggerTransactionSync("reconciled");
    },
    onError: (error) => {
      logger.error("Failed to reconcile transaction", error, {
        source: "reconcileTransactionMutation",
      });
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationKey: ["transactions", "delete"],
    mutationFn: async (transactionId: string): Promise<string> => {
      const transaction = await budgetDb.transactions.get(transactionId);
      await optimisticHelpers.removeTransaction(queryClient, transactionId);
      await budgetDb.transactions.delete(transactionId);
      if (transaction) {
        await updateBalancesForTransaction(transaction, true);
      }
      return transactionId;
    },
    onSuccess: (transactionId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
      logger.info("✅ Transaction deleted", { id: transactionId });
      triggerTransactionSync("deleted");
    },
    onError: (error) => {
      logger.error("Failed to delete transaction", error, { source: "deleteTransactionMutation" });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
    },
  });

  const updateTransactionMutation = useMutation({
    mutationKey: ["transactions", "update"],
    mutationFn: async ({
      id,
      updates,
    }: TransactionUpdateInput): Promise<TransactionUpdateInput> => {
      // Validate updates with Zod schema
      const validationResult = validateTransactionPartialSafe(updates);
      if (!validationResult.success) {
        const errorMessages = validationResult.error.issues
          .map((issue) => issue.message)
          .join(", ");
        logger.error("Transaction update validation failed", {
          transactionId: id,
          errors: validationResult.error.issues,
        });
        throw new Error(`Invalid transaction update data: ${errorMessages}`);
      }

      const updatedTransaction = {
        ...validationResult.data,
        updatedAt: new Date().toISOString(),
      };
      await optimisticHelpers.updateTransaction(queryClient, id, updatedTransaction);
      await budgetDb.transactions.update(id, updatedTransaction);
      return { id, updates: updatedTransaction };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
      logger.info("✅ Transaction updated", {
        id: data.id,
        updates: Object.keys(data.updates || {}),
      });
      triggerTransactionSync("updated");
    },
    onError: (error) => {
      logger.error("Failed to update transaction", error, {
        source: "updateTransactionMutation",
      });
      // Rollback optimistic update
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
    },
  });

  return {
    // Mutation functions
    addTransaction: addTransactionMutation.mutate,
    addTransactionAsync: addTransactionMutation.mutateAsync,
    reconcileTransaction: reconcileTransactionMutation.mutate,
    reconcileTransactionAsync: reconcileTransactionMutation.mutateAsync,
    deleteTransaction: deleteTransactionMutation.mutate,
    deleteTransactionAsync: deleteTransactionMutation.mutateAsync,
    updateTransaction: updateTransactionMutation.mutate,
    updateTransactionAsync: updateTransactionMutation.mutateAsync,

    // Convenience functions for common patterns
    onDelete: deleteTransactionMutation.mutate, // Common prop name used by components
    onUpdate: updateTransactionMutation.mutate, // Common prop name used by components

    // Mutation states
    isAdding: addTransactionMutation.isPending,
    isReconciling: reconcileTransactionMutation.isPending,
    isDeleting: deleteTransactionMutation.isPending,
    isUpdating: updateTransactionMutation.isPending,
  };
};
