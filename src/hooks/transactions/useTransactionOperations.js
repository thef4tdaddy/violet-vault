/**
 * Transaction Operations Hook
 * Focused hook for CRUD operations on transactions
 * Created for Issue #508 - extracted from useTransactions.js
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  validateTransactionData,
  prepareTransactionForStorage,
  createTransferPair,
  categorizeTransaction,
} from "../../utils/transactions/operations.js";
import { budgetDb } from "../../db/budgetDb.js";
import { queryKeys } from "../../utils/common/queryClient.js";
import logger from "../../utils/common/logger.js";

// Helper to trigger sync for transaction changes
const triggerTransactionSync = (changeType) => {
  if (typeof window !== "undefined" && window.cloudSyncService) {
    window.cloudSyncService.triggerSyncForCriticalChange(`transaction_${changeType}`);
  }
};

/**
 * Hook for transaction CRUD operations
 * @param {Object} options - Hook options
 * @returns {Object} Transaction operations and state
 */
const useTransactionOperations = (options = {}) => {
  const queryClient = useQueryClient();
  const { categoryRules = [] } = options;

  /**
   * Add transaction mutation
   */
  const addTransactionMutation = useMutation({
    mutationKey: ["transactions", "add"],
    mutationFn: async (transactionData) => {
      logger.debug("Adding transaction", { id: transactionData.id });

      // Validate transaction data
      const validation = validateTransactionData(transactionData);
      if (!validation.isValid) {
        throw new Error("Invalid transaction data: " + validation.errors.join(", "));
      }

      // Auto-categorize if no category provided
      const categorized = categorizeTransaction(transactionData, categoryRules);

      // Prepare for storage
      const prepared = prepareTransactionForStorage(categorized);

      // Save to database
      const result = await budgetDb.addTransaction(prepared);
      triggerTransactionSync("add");

      return result;
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes.all() });

      logger.info("Transaction added successfully", { id: data.id });
    },
    onError: (error) => {
      logger.error("Failed to add transaction", error);
    },
  });

  /**
   * Update transaction mutation
   */
  const updateTransactionMutation = useMutation({
    mutationKey: ["transactions", "update"],
    mutationFn: async ({ id, updates }) => {
      logger.debug("Updating transaction", { id, updates });

      // Get current transaction
      const current = await budgetDb.getTransaction(id);
      if (!current) {
        throw new Error(`Transaction not found: ${id}`);
      }

      // Prepare updated data
      const updatedData = { ...current, ...updates };

      // Validate updated data
      const validation = validateTransactionData(updatedData);
      if (!validation.isValid) {
        throw new Error("Invalid transaction data: " + validation.errors.join(", "));
      }

      // Prepare for storage
      const prepared = prepareTransactionForStorage(updatedData);

      // Update in database
      const result = await budgetDb.updateTransaction(id, prepared);
      triggerTransactionSync("update");

      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes.all() });

      logger.info("Transaction updated successfully", { id: variables.id });
    },
    onError: (error, variables) => {
      logger.error("Failed to update transaction", { error, id: variables.id });
    },
  });

  /**
   * Delete transaction mutation
   */
  const deleteTransactionMutation = useMutation({
    mutationKey: ["transactions", "delete"],
    mutationFn: async (transactionId) => {
      logger.debug("Deleting transaction", { id: transactionId });

      // Delete from database
      await budgetDb.deleteTransaction(transactionId);
      triggerTransactionSync("delete");

      return { id: transactionId };
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes.all() });

      logger.info("Transaction deleted successfully", { id: data.id });
    },
    onError: (error, variables) => {
      logger.error("Failed to delete transaction", { error, id: variables });
    },
  });

  /**
   * Split transaction mutation
   */
  const splitTransactionMutation = useMutation({
    mutationKey: ["transactions", "split"],
    mutationFn: async ({ originalTransaction, splitTransactions }) => {
      logger.debug("Splitting transaction", {
        originalId: originalTransaction.id,
        splitCount: splitTransactions.length,
      });

      // Validate all split transactions
      for (const splitTxn of splitTransactions) {
        const validation = validateTransactionData(splitTxn);
        if (!validation.isValid) {
          throw new Error(`Invalid split transaction data: ${validation.errors.join(", ")}`);
        }
      }

      // Start transaction
      const results = [];

      try {
        // Mark original transaction as split
        const updatedOriginal = {
          ...originalTransaction,
          isSplit: true,
          splitInto: splitTransactions.map((t) => t.id),
          metadata: {
            ...originalTransaction.metadata,
            splitAt: new Date().toISOString(),
            splitIntoTransactions: splitTransactions.length,
          },
        };

        await budgetDb.updateTransaction(originalTransaction.id, updatedOriginal);

        // Add all split transactions
        for (const splitTxn of splitTransactions) {
          const prepared = prepareTransactionForStorage(splitTxn);
          const result = await budgetDb.addTransaction(prepared);
          results.push(result);
        }

        triggerTransactionSync("split");

        return {
          originalTransaction: updatedOriginal,
          splitTransactions: results,
        };
      } catch (error) {
        // If anything fails, we should rollback, but for simplicity we'll just throw
        logger.error("Transaction split failed", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes.all() });

      logger.info("Transaction split successfully", {
        originalId: data.originalTransaction.id,
        splitCount: data.splitTransactions.length,
      });
    },
    onError: (error) => {
      logger.error("Failed to split transaction", error);
    },
  });

  /**
   * Transfer funds mutation
   */
  const transferFundsMutation = useMutation({
    mutationKey: ["transactions", "transfer"],
    mutationFn: async (transferData) => {
      logger.debug("Creating transfer", transferData);

      // Create transfer pair
      const [outgoingTxn, incomingTxn] = createTransferPair(transferData);

      // Add both transactions
      const outgoingResult = await budgetDb.addTransaction(
        prepareTransactionForStorage(outgoingTxn)
      );
      const incomingResult = await budgetDb.addTransaction(
        prepareTransactionForStorage(incomingTxn)
      );

      triggerTransactionSync("transfer");

      return {
        outgoing: outgoingResult,
        incoming: incomingResult,
        transferId: outgoingTxn.metadata.transferId,
      };
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes.all() });

      logger.info("Transfer created successfully", {
        transferId: data.transferId,
        amount: data.outgoing.amount,
      });
    },
    onError: (error) => {
      logger.error("Failed to create transfer", error);
    },
  });

  /**
   * Bulk operations mutation
   */
  const bulkOperationMutation = useMutation({
    mutationKey: ["transactions", "bulk"],
    mutationFn: async ({ operation, transactions, updates = {} }) => {
      logger.debug(`Bulk ${operation} operation`, { count: transactions.length });

      const results = [];

      switch (operation) {
        case "delete":
          for (const txn of transactions) {
            await budgetDb.deleteTransaction(txn.id);
            results.push({ id: txn.id, operation: "deleted" });
          }
          break;

        case "update":
          for (const txn of transactions) {
            const updatedData = { ...txn, ...updates };
            const prepared = prepareTransactionForStorage(updatedData);
            const result = await budgetDb.updateTransaction(txn.id, prepared);
            results.push(result);
          }
          break;

        case "categorize":
          for (const txn of transactions) {
            const categorized = categorizeTransaction({ ...txn, ...updates }, categoryRules);
            const prepared = prepareTransactionForStorage(categorized);
            const result = await budgetDb.updateTransaction(txn.id, prepared);
            results.push(result);
          }
          break;

        default:
          throw new Error(`Unknown bulk operation: ${operation}`);
      }

      triggerTransactionSync(`bulk_${operation}`);
      return results;
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes.all() });

      logger.info(`Bulk ${variables.operation} completed`, { count: data.length });
    },
    onError: (error, variables) => {
      logger.error(`Bulk ${variables.operation} failed`, error);
    },
  });

  // Convenience methods
  const addTransaction = useCallback(
    (transactionData) => {
      return addTransactionMutation.mutateAsync(transactionData);
    },
    [addTransactionMutation]
  );

  const updateTransaction = useCallback(
    (id, updates) => {
      return updateTransactionMutation.mutateAsync({ id, updates });
    },
    [updateTransactionMutation]
  );

  const deleteTransaction = useCallback(
    (transactionId) => {
      return deleteTransactionMutation.mutateAsync(transactionId);
    },
    [deleteTransactionMutation]
  );

  const splitTransaction = useCallback(
    (originalTransaction, splitTransactions) => {
      return splitTransactionMutation.mutateAsync({ originalTransaction, splitTransactions });
    },
    [splitTransactionMutation]
  );

  const transferFunds = useCallback(
    (transferData) => {
      return transferFundsMutation.mutateAsync(transferData);
    },
    [transferFundsMutation]
  );

  const bulkOperation = useCallback(
    (operation, transactions, updates) => {
      return bulkOperationMutation.mutateAsync({ operation, transactions, updates });
    },
    [bulkOperationMutation]
  );

  return {
    // Mutations
    addTransactionMutation,
    updateTransactionMutation,
    deleteTransactionMutation,
    splitTransactionMutation,
    transferFundsMutation,
    bulkOperationMutation,

    // Convenience methods
    addTransaction,
    updateTransaction,
    deleteTransaction,
    splitTransaction,
    transferFunds,
    bulkOperation,

    // Loading states
    isAdding: addTransactionMutation.isPending,
    isUpdating: updateTransactionMutation.isPending,
    isDeleting: deleteTransactionMutation.isPending,
    isSplitting: splitTransactionMutation.isPending,
    isTransferring: transferFundsMutation.isPending,
    isBulkProcessing: bulkOperationMutation.isPending,

    // Overall loading state
    isProcessing: [
      addTransactionMutation,
      updateTransactionMutation,
      deleteTransactionMutation,
      splitTransactionMutation,
      transferFundsMutation,
      bulkOperationMutation,
    ].some((mutation) => mutation.isPending),

    // Error states
    addError: addTransactionMutation.error,
    updateError: updateTransactionMutation.error,
    deleteError: deleteTransactionMutation.error,
    splitError: splitTransactionMutation.error,
    transferError: transferFundsMutation.error,
    bulkError: bulkOperationMutation.error,
  };
};

export default useTransactionOperations;
