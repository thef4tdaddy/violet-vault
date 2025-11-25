// Main transaction hook that combines all focused hooks
import { useQueryClient } from "@tanstack/react-query";
import { useTransactionQuery } from "../transactions/useTransactionQuery.ts";
import { useTransactionMutations } from "../transactions/useTransactionMutations.ts";
import { useTransactionAnalytics } from "../transactions/useTransactionAnalytics.ts";
import { useTransactionUtils } from "../transactions/useTransactionUtils.ts";
import { queryKeys } from "../../utils/common/queryClient.ts";

/**
 * Specialized hook for transaction management
 * Provides transaction operations with smart filtering, date range support, and analytics
 */
const useTransactions = (options = {}) => {
  const queryClient = useQueryClient();

  // Core data query
  const { transactions, isLoading, isFetching, isError, error, refetch } =
    useTransactionQuery(options);

  // Mutation operations
  const {
    addTransaction,
    addTransactionAsync,
    reconcileTransaction,
    reconcileTransactionAsync,
    deleteTransaction,
    deleteTransactionAsync,
    updateTransaction,
    updateTransactionAsync,
    onDelete,
    onUpdate,
    isAdding,
    isReconciling,
    isDeleting,
    isUpdating,
  } = useTransactionMutations();

  // Analytics computation
  const analyticsData = useTransactionAnalytics(transactions);

  // Utility functions
  const utilityFunctions = useTransactionUtils(
    transactions as unknown as import("@/types/finance").Transaction[]
  );

  return {
    // Data
    transactions,
    ...analyticsData,
    ...utilityFunctions,

    // Loading states
    isLoading,
    isFetching,
    isError,
    error,

    // Mutation functions
    addTransaction,
    addTransactionAsync,
    reconcileTransaction,
    reconcileTransactionAsync,
    deleteTransaction,
    deleteTransactionAsync,
    updateTransaction,
    updateTransactionAsync,

    // Convenience functions for common patterns
    onDelete, // Common prop name used by components
    onUpdate, // Common prop name used by components

    // Mutation states
    isAdding,
    isReconciling,
    isDeleting,
    isUpdating,

    // Query controls
    refetch,
    invalidate: () => queryClient.invalidateQueries({ queryKey: queryKeys.transactions }),
  };
};

// Re-export focused hooks for direct use
export { useTransactionQuery } from "../transactions/useTransactionQuery.ts";
export { useTransactionMutations } from "../transactions/useTransactionMutations.ts";
export { useTransactionAnalytics } from "../transactions/useTransactionAnalytics.ts";
export { useTransactionUtils } from "../transactions/useTransactionUtils.ts";
export { useTransactionBalanceUpdater } from "../transactions/useTransactionBalanceUpdater.ts";

// Export the main hook as both named and default
export { useTransactions };
export default useTransactions;
