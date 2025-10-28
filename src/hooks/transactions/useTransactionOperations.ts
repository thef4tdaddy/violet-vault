/**
 * Transaction Operations Hook
 * Focused hook for CRUD operations on transactions
 * Created for Issue #508 - extracted from useTransactions.js
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type { Transaction } from "@/types/finance";
import {
  createAddTransactionMutationConfig,
  createUpdateTransactionMutationConfig,
  createDeleteTransactionMutationConfig,
  createSplitTransactionMutationConfig,
  createTransferFundsMutationConfig,
  createBulkOperationMutationConfig,
} from "./useTransactionOperationsHelpers";

interface UseTransactionOperationsOptions {
  categoryRules?: Array<{
    pattern: string;
    category: string;
    envelopeId?: string | number;
  }>;
}

/**
 * Hook for transaction CRUD operations
 * @param options - Hook options
 * @returns Transaction operations and state
 */
const useTransactionOperations = (options: UseTransactionOperationsOptions = {}) => {
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
    (transactionData: Partial<Transaction>) => {
      return addTransactionMutation.mutateAsync(transactionData);
    },
    [addTransactionMutation]
  );

  const updateTransaction = useCallback(
    (id: string | number, updates: Partial<Transaction>) => {
      return updateTransactionMutation.mutateAsync({ id, updates });
    },
    [updateTransactionMutation]
  );

  const deleteTransaction = useCallback(
    (transactionId: string | number) => {
      return deleteTransactionMutation.mutateAsync(transactionId);
    },
    [deleteTransactionMutation]
  );

  const splitTransaction = useCallback(
    (originalTransaction: Transaction, splitTransactions: Partial<Transaction>[]) => {
      return splitTransactionMutation.mutateAsync({
        originalTransaction,
        splitTransactions,
      });
    },
    [splitTransactionMutation]
  );

  const transferFunds = useCallback(
    (transferData: {
      fromEnvelopeId: string | number;
      toEnvelopeId: string | number;
      amount: number;
      date: string;
      description?: string;
    }) => {
      return transferFundsMutation.mutateAsync(transferData);
    },
    [transferFundsMutation]
  );

  const bulkOperation = useCallback(
    (
      operation: "delete" | "update" | "categorize",
      transactions: Transaction[],
      updates?: Partial<Transaction>
    ) => {
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
