/**
 * Transaction Operations Hook
 * Focused hook for CRUD operations on transactions
 * Created for Issue #508 - extracted from useTransactions.js
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { queryKeys } from "../../utils/common/queryClient.ts";
import logger from "../../utils/common/logger.ts";
import {
  addTransactionToDB,
  updateTransactionInDB,
  deleteTransactionFromDB,
  splitTransactionInDB,
  transferFundsInDB,
  bulkOperationOnTransactions,
} from "./helpers/transactionOperationsHelpers.ts";

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
    mutationFn: async (transactionData) => addTransactionToDB(transactionData, categoryRules),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactionsList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopesList() });
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
    mutationFn: async ({ id, updates }) => updateTransactionInDB(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactionsList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopesList() });
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
    mutationFn: async (transactionId) => deleteTransactionFromDB(transactionId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactionsList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopesList() });
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
    mutationFn: async ({ originalTransaction, splitTransactions }) =>
      splitTransactionInDB(originalTransaction, splitTransactions),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactionsList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopesList() });
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
    mutationFn: async (transferData) => transferFundsInDB(transferData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactionsList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopesList() });
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
    mutationFn: async ({ operation, transactions, updates = {} }) =>
      bulkOperationOnTransactions(operation, transactions, updates, categoryRules),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactionsList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopesList() });
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
      return splitTransactionMutation.mutateAsync({
        originalTransaction,
        splitTransactions,
      });
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
      return bulkOperationMutation.mutateAsync({
        operation,
        transactions,
        updates,
      });
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

export { useTransactionOperations };
