/**
 * Transactions Hook Compatibility Layer
 * Provides backward compatibility with the original useTransactions interface
 * Maps old API to new useTransactionsV2 implementation
 * Created for Issue #508 to ensure zero regressions
 */
import useTransactionsV2 from "../transactions/useTransactionsV2.js";
import _logger from "../../utils/common/logger.js";

/**
 * Compatibility wrapper that maintains the exact same API as the original useTransactions
 * @param {Object} options - Hook options
 * @returns {Object} Original useTransactions API interface
 */
const useTransactionsCompat = (options = {}) => {
  const v2Hook = useTransactionsV2(options);

  // Create compatibility layer that maps old API to new implementation
  return {
    // Query state - exact same names and meanings
    isLoading: v2Hook.isLoading,
    isError: v2Hook.isError,
    error: v2Hook.error,
    isSuccess: v2Hook.isSuccess,
    isFetching: v2Hook.isFetching,

    // Data - exact same structure
    transactions: v2Hook.transactions,
    allTransactions: v2Hook.allTransactions,
    recentTransactions: v2Hook.recentTransactions,

    // Additional computed data maintained for backward compatibility
    get incomeTransactions() {
      return v2Hook.incomeTransactions;
    },

    get expenseTransactions() {
      return v2Hook.expenseTransactions;
    },

    get transferTransactions() {
      return v2Hook.transferTransactions;
    },

    // Operations - maintain original method signatures
    addTransactionMutation: v2Hook.addTransactionMutation,
    updateTransactionMutation: v2Hook.updateTransactionMutation,
    deleteTransactionMutation: v2Hook.deleteTransactionMutation,

    // Original convenience methods
    addTransaction: v2Hook.addTransactionWithRefresh,
    updateTransaction: v2Hook.updateTransactionWithRefresh,
    deleteTransaction: v2Hook.deleteTransactionWithRefresh,

    // Additional methods that may be used
    splitTransaction: v2Hook.splitTransactionWithRefresh,
    transferFunds: v2Hook.transferFundsWithRefresh,
    bulkOperation: v2Hook.bulkOperationWithRefresh,

    // Loading states
    isAdding: v2Hook.isAdding,
    isUpdating: v2Hook.isUpdating,
    isDeleting: v2Hook.isDeleting,
    isProcessing: v2Hook.isProcessing,

    // Error states
    addError: v2Hook.addError,
    updateError: v2Hook.updateError,
    deleteError: v2Hook.deleteError,

    // Filter/search methods
    getTransactionsByDateRange: v2Hook.getTransactionsByDateRange,
    getTransactionsByEnvelope: v2Hook.getTransactionsByEnvelope,
    getTransactionsByCategory: v2Hook.getTransactionsByCategory,
    searchTransactions: v2Hook.searchTransactions,

    // Statistics
    get statistics() {
      return v2Hook.statistics;
    },

    // Utility methods
    refetch: v2Hook.refetch,

    // Filter state
    hasActiveFilters: v2Hook.hasActiveFilters,
    isFilteredResult: v2Hook.isFilteredResult,

    // Enhanced V2 features (optional, won't break existing code)
    v2: {
      // Provide access to all V2 features for gradual migration
      ...v2Hook,

      // Migration helpers
      isUsingV2: true,
      version: "2.0.0",

      // Enhanced operations
      splitTransactionWithRefresh: v2Hook.splitTransactionWithRefresh,
      transferFundsWithRefresh: v2Hook.transferFundsWithRefresh,
      bulkOperationWithRefresh: v2Hook.bulkOperationWithRefresh,

      // Sub-hooks access
      dataHook: v2Hook._internal?.dataHook,
      operationsHook: v2Hook._internal?.operationsHook,
    },
  };
};

export default useTransactionsCompat;

// Named export for backward compatibility
export const useTransactions = useTransactionsCompat;
