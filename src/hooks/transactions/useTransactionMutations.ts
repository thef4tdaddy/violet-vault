import { useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import {
  queryKeys,
  optimisticHelpers,
} from "../../utils/common/queryClient.js";
import { budgetDb } from "../../db/budgetDb.js";
import { useTransactionBalanceUpdater } from "./useTransactionBalanceUpdater.js";
import logger from "../../utils/common/logger.js";
import { Transaction, TransactionMutationData } from "../../types/transactions";

// Helper to trigger sync for transaction changes
const triggerTransactionSync = (changeType: string): void => {
  if (typeof window !== "undefined" && window.cloudSyncService) {
    window.cloudSyncService.triggerSyncForCriticalChange(
      `transaction_${changeType}`,
    );
  }
};

interface UpdateTransactionVariables {
  id: string;
  updates: TransactionMutationData;
}

interface TransactionMutations {
  // Mutation functions
  addTransaction: (transactionData: TransactionMutationData) => void;
  addTransactionAsync: (transactionData: TransactionMutationData) => Promise<Transaction>;
  reconcileTransaction: (transactionData: TransactionMutationData) => void;
  reconcileTransactionAsync: (transactionData: TransactionMutationData) => Promise<Transaction>;
  deleteTransaction: (transactionId: string) => void;
  deleteTransactionAsync: (transactionId: string) => Promise<string>;
  updateTransaction: (variables: UpdateTransactionVariables) => void;
  updateTransactionAsync: (variables: UpdateTransactionVariables) => Promise<{ id: string; updates: TransactionMutationData }>;

  // Convenience functions for common patterns
  onDelete: (transactionId: string) => void;
  onUpdate: (variables: UpdateTransactionVariables) => void;

  // Mutation states  
  isAdding: boolean;
  isReconciling: boolean;
  isDeleting: boolean;
  isUpdating: boolean;
}

export const useTransactionMutations = (): TransactionMutations => {
  const queryClient = useQueryClient();
  const { updateBalancesForTransaction } = useTransactionBalanceUpdater();

  // Add transaction mutation
  const addTransactionMutation: UseMutationResult<Transaction, Error, TransactionMutationData> = useMutation({
    mutationKey: ["transactions", "add"],
    mutationFn: async (transactionData: TransactionMutationData): Promise<Transaction> => {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        type: "expense",
        category: "other",
        createdAt: new Date().toISOString(),
        lastModified: Date.now(),
        ...transactionData,
        amount: transactionData.amount || 0,
        description: transactionData.description || '',
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
    onError: (error: Error) => {
      logger.error("Failed to add transaction", error, {
        source: "addTransactionMutation",
      });
      // TODO: Implement rollback logic
    },
  });

  // Reconcile transaction mutation (for balance reconciliation)
  const reconcileTransactionMutation: UseMutationResult<Transaction, Error, TransactionMutationData> = useMutation({
    mutationKey: ["transactions", "reconcile"],
    mutationFn: async (transactionData: TransactionMutationData): Promise<Transaction> => {
      const reconciledTransaction: Transaction = {
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        type: "expense",
        category: transactionData.category || "other",
        createdAt: new Date().toISOString(),
        lastModified: Date.now(),
        description: transactionData.description || '',
        amount: transactionData.amount || 0,
        ...transactionData,
        reconciledAt: new Date().toISOString(),
      };

      // Apply optimistic update and save to Dexie
      await optimisticHelpers.addTransaction(
        queryClient,
        reconciledTransaction,
      );

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
    onError: (error: Error) => {
      logger.error("Failed to reconcile transaction", error, {
        source: "reconcileTransactionMutation",
      });
    },
  });

  // Delete transaction mutation
  const deleteTransactionMutation: UseMutationResult<string, Error, string> = useMutation({
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
    onError: (error: Error) => {
      logger.error("Failed to delete transaction", error, {
        source: "deleteTransactionMutation",
      });
      // Rollback optimistic update
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
    },
  });

  // Update transaction mutation
  const updateTransactionMutation: UseMutationResult<{ id: string; updates: TransactionMutationData }, Error, UpdateTransactionVariables> = useMutation({
    mutationKey: ["transactions", "update"],
    mutationFn: async ({ id, updates }: UpdateTransactionVariables): Promise<{ id: string; updates: TransactionMutationData }> => {
      const updatedTransaction: TransactionMutationData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Apply optimistic update using helper
      await optimisticHelpers.updateTransaction(
        queryClient,
        id,
        updatedTransaction,
      );

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
    onError: (error: Error) => {
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