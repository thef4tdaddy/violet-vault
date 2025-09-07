import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  queryKeys,
  optimisticHelpers,
} from "../../utils/common/queryClient.js";
import { budgetDb } from "../../db/budgetDb.js";
import { useTransactionBalanceUpdater } from "./useTransactionBalanceUpdater.js";
import logger from "../../utils/common/logger.js";

// Helper to trigger sync for transaction changes
const triggerTransactionSync = (changeType) => {
  if (typeof window !== "undefined" && window.cloudSyncService) {
    window.cloudSyncService.triggerSyncForCriticalChange(
      `transaction_${changeType}`,
    );
  }
};

export const useTransactionMutations = () => {
  const queryClient = useQueryClient();
  const { updateBalancesForTransaction } = useTransactionBalanceUpdater();

  // Add transaction mutation
  const addTransactionMutation = useMutation({
    mutationKey: ["transactions", "add"],
    mutationFn: async (transactionData) => {
      const newTransaction = {
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        type: "expense",
        category: "other",
        createdAt: new Date().toISOString(),
        ...transactionData,
        amount: transactionData.amount || 0,
      };

      // Apply optimistic update and save to Dexie
      await optimisticHelpers.addTransaction(newTransaction);

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
    mutationFn: async (transactionData) => {
      const reconciledTransaction = {
        ...transactionData,
        id: Date.now().toString(),
        reconciledAt: new Date().toISOString(),
      };

      // Apply optimistic update and save to Dexie
      await optimisticHelpers.addTransaction(reconciledTransaction);

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
    mutationFn: async (transactionId) => {
      // Get transaction data before deleting (needed for balance updates)
      const transaction = await budgetDb.transactions.get(transactionId);

      // Apply optimistic update using helper
      await optimisticHelpers.removeTransaction(transactionId);

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
    mutationFn: async ({ id, updates }) => {
      const updatedTransaction = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Apply optimistic update using helper
      await optimisticHelpers.updateTransaction(id, updatedTransaction);

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
