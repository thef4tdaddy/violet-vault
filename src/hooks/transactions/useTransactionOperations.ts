/**
 * Transaction Operations Hook
 * Focused hook for CRUD operations on transactions
 * Created for Issue #508 - extracted from useTransactions.js
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  createAddTransactionMutationConfig,
  createUpdateTransactionMutationConfig,
  createDeleteTransactionMutationConfig,
  createSplitTransactionMutationConfig,
  createTransferFundsMutationConfig,
  createBulkOperationMutationConfig,
} from "./useTransactionOperationsHelpers";

/**
 * Hook for transaction CRUD operations
 * @param {Object} options - Hook options
 * @returns {Object} Transaction operations and state
 */
const useTransactionOperations = (options = {}) => {
  const queryClient = useQueryClient();
  const { categoryRules = [] } = options;

  // Create mutation configurations
  const addTransactionMutation = useMutation(
    createAddTransactionMutationConfig(queryClient, categoryRules)
  );
  const updateTransactionMutation = useMutation(
    createUpdateTransactionMutationConfig(queryClient)
  );
  const deleteTransactionMutation = useMutation(
    createDeleteTransactionMutationConfig(queryClient)
  );
  const splitTransactionMutation = useMutation(
    createSplitTransactionMutationConfig(queryClient)
  );
  const transferFundsMutation = useMutation(createTransferFundsMutationConfig(queryClient));
  const bulkOperationMutation = useMutation(
    createBulkOperationMutationConfig(queryClient, categoryRules)
  );

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
