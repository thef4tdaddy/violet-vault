import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, optimisticHelpers } from "../../utils/common/queryClient.ts";
import { budgetDb } from "../../db/budgetDb.ts";
import { useTransactionBalanceUpdater } from "./useTransactionBalanceUpdater.ts";
import logger from "../../utils/common/logger.ts";
import type { Transaction } from "../../db/types.ts";

export interface TransactionInput {
  date?: string;
  amount?: number;
  type?: "income" | "expense" | "transfer";
  category?: string;
  description?: string;
  envelopeId?: string;
  merchant?: string;
  receiptUrl?: string;
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

export const useTransactionMutations = () => {
  const queryClient = useQueryClient();
  const { updateBalancesForTransaction } = useTransactionBalanceUpdater();

  // Add transaction mutation
  const addTransactionMutation = useMutation({
    mutationKey: ["transactions", "add"],
    mutationFn: async (transactionData: TransactionInput): Promise<Transaction> => {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        date: new Date(transactionData.date || new Date().toISOString().split("T")[0]),
        type: transactionData.type || "expense",
        category: transactionData.category || "other",
        createdAt: Date.now(),
        amount: transactionData.amount || 0,
        envelopeId: transactionData.envelopeId || "",
        lastModified: Date.now(),
        description: transactionData.description,
        merchant: transactionData.merchant,
        receiptUrl: transactionData.receiptUrl,
      };

      // Apply optimistic update and save to Dexie
      await optimisticHelpers.addTransaction(queryClient, newTransaction);

      // Save to Dexie (single source of truth for transactions)
      await budgetDb.transactions.put(newTransaction);

      // Update balances based on transaction
      await updateBalancesForTransaction(newTransaction);

      return newTransaction;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
      // Trigger immediate sync for transaction addition
      triggerTransactionSync("added");
    },
    onError: (error) => {
      logger.error("Failed to add transaction", error, {
        source: "addTransactionMutation",
      });
      // TODO: Implement rollback logic
    },
  });

  // Reconcile transaction mutation (for balance reconciliation)
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
        reconciledAt: new Date().toISOString(),
        description: transactionData.description,
      };

      // Apply optimistic update and save to Dexie
      await optimisticHelpers.addTransaction(queryClient, reconciledTransaction);

      // Save to Dexie (single source of truth for transactions)
      await budgetDb.transactions.put(reconciledTransaction);

      return reconciledTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      // Trigger immediate sync for transaction reconciliation
      triggerTransactionSync("reconciled");
    },
    onError: (error) => {
      logger.error("Failed to reconcile transaction", error, {
        source: "reconcileTransactionMutation",
      });
    },
  });

  // Delete transaction mutation
  const deleteTransactionMutation = useMutation({
    mutationKey: ["transactions", "delete"],
    mutationFn: async (transactionId: string): Promise<string> => {
      // Get transaction data before deleting (needed for balance updates)
      const transaction = await budgetDb.transactions.get(transactionId);

      // Apply optimistic update using helper
      await optimisticHelpers.removeTransaction(queryClient, transactionId);

      // Delete from Dexie (single source of truth for transactions)
      await budgetDb.transactions.delete(transactionId);

      // Reverse the balance changes
      if (transaction) {
        await updateBalancesForTransaction(transaction, true);
      }

      return transactionId;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
      // Trigger immediate sync for transaction deletion
      triggerTransactionSync("deleted");
    },
    onError: (error) => {
      logger.error("Failed to delete transaction", error, {
        source: "deleteTransactionMutation",
      });
      // Rollback optimistic update
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
    },
  });

  // Update transaction mutation
  const updateTransactionMutation = useMutation({
    mutationKey: ["transactions", "update"],
    mutationFn: async ({ id, updates }: TransactionUpdateInput): Promise<TransactionUpdateInput> => {
      const updatedTransaction = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Apply optimistic update using helper
      await optimisticHelpers.updateTransaction(queryClient, id, updatedTransaction);

      // Update in Dexie (single source of truth for transactions)
      await budgetDb.transactions.update(id, updatedTransaction);

      return { id, updates: updatedTransaction };
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
      // Trigger immediate sync for transaction update
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
