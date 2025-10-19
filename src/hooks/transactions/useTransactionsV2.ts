/**
 * Transactions Hook V2 (Refactored)
 * Modern hook combining focused sub-hooks for transaction management
 * Created for Issue #508 - replaces the monolithic useTransactions.js
 */
import { useEffect } from "react";
import { useBudgetStore } from "../../stores/ui/uiStore.ts";
import { useTransactionData } from "./useTransactionData.ts";
import { useTransactionOperations } from "./useTransactionOperations.ts";
import logger from "../../utils/common/logger.ts";

/**
 * Enhanced transactions hook with focused separation of concerns
 * @param {Object} options - Hook options
 * @returns {Object} Complete transaction management interface
 */
const useTransactionsV2 = (options = {}) => {
  const {
    // Data query options
    dateRange,
    envelopeId,
    category,
    type,
    searchQuery,
    sortBy = "date",
    sortOrder = "desc",
    limit = 100,

    // Operation options
    categoryRules = [],

    // Query options
    enabled = true,
    staleTime = 5 * 60 * 1000,
    refetchInterval = null,
  } = options;

  // Get UI state from Zustand (for legacy compatibility)
  const budgetStore = useBudgetStore((state) => ({
    updateTransactions: state.updateTransactions,
  }));

  // Data management hook
  const dataHook = useTransactionData({
    dateRange,
    envelopeId,
    category,
    type,
    searchQuery,
    sortBy,
    sortOrder,
    limit,
    enabled,
    staleTime,
    refetchInterval,
  });

  // Operations management hook
  const operationsHook = useTransactionOperations({
    categoryRules,
  });

  // Sync with Zustand store for backward compatibility
  useEffect(() => {
    if (dataHook.isSuccess && dataHook.allTransactions) {
      // Update Zustand store with fresh data
      budgetStore.updateTransactions?.(dataHook.allTransactions);

      logger.debug("Synced transaction data with Zustand store", {
        count: dataHook.allTransactions.length,
      });
    }
  }, [dataHook.isSuccess, dataHook.allTransactions, budgetStore]);

  // Enhanced convenience methods that combine data + operations
  const enhancedOperations = {
    /**
     * Add transaction with automatic data refresh
     */
    addTransactionWithRefresh: async (transactionData) => {
      try {
        const result = await operationsHook.addTransaction(transactionData);
        await dataHook.refetch();
        return result;
      } catch (error) {
        logger.error("Failed to add transaction with refresh", error);
        throw error;
      }
    },

    /**
     * Update transaction with automatic data refresh
     */
    updateTransactionWithRefresh: async (id, updates) => {
      try {
        const result = await operationsHook.updateTransaction(id, updates);
        await dataHook.refetch();
        return result;
      } catch (error) {
        logger.error("Failed to update transaction with refresh", error);
        throw error;
      }
    },

    /**
     * Delete transaction with automatic data refresh
     */
    deleteTransactionWithRefresh: async (transactionId) => {
      try {
        const result = await operationsHook.deleteTransaction(transactionId);
        await dataHook.refetch();
        return result;
      } catch (error) {
        logger.error("Failed to delete transaction with refresh", error);
        throw error;
      }
    },

    /**
     * Split transaction with automatic data refresh
     */
    splitTransactionWithRefresh: async (originalTransaction, splitTransactions) => {
      try {
        const result = await operationsHook.splitTransaction(
          originalTransaction,
          splitTransactions
        );
        await dataHook.refetch();
        return result;
      } catch (error) {
        logger.error("Failed to split transaction with refresh", error);
        throw error;
      }
    },

    /**
     * Transfer funds with automatic data refresh
     */
    transferFundsWithRefresh: async (transferData) => {
      try {
        const result = await operationsHook.transferFunds(transferData);
        await dataHook.refetch();
        return result;
      } catch (error) {
        logger.error("Failed to transfer funds with refresh", error);
        throw error;
      }
    },

    /**
     * Bulk operation with automatic data refresh
     */
    bulkOperationWithRefresh: async (operation, transactions, updates) => {
      try {
        const result = await operationsHook.bulkOperation(operation, transactions, updates);
        await dataHook.refetch();
        return result;
      } catch (error) {
        logger.error(`Failed to perform bulk ${operation} with refresh`, error);
        throw error;
      }
    },
  };

  return {
    // === Data Hook Properties ===
    // Query state
    isLoading: dataHook.isLoading,
    isError: dataHook.isError,
    error: dataHook.error,
    isSuccess: dataHook.isSuccess,
    isFetching: dataHook.isFetching,
    isRefetching: dataHook.isRefetching,

    // Data
    transactions: dataHook.transactions,
    allTransactions: dataHook.allTransactions,
    statistics: dataHook.statistics,

    // Filtered views
    recentTransactions: dataHook.recentTransactions,
    incomeTransactions: dataHook.incomeTransactions,
    expenseTransactions: dataHook.expenseTransactions,
    transferTransactions: dataHook.transferTransactions,
    splitTransactions: dataHook.splitTransactions,
    uncategorizedTransactions: dataHook.uncategorizedTransactions,

    // Helper methods
    getTransactionsByDateRange: dataHook.getTransactionsByDateRange,
    getTransactionsByEnvelope: dataHook.getTransactionsByEnvelope,
    getTransactionsByCategory: dataHook.getTransactionsByCategory,
    searchTransactions: dataHook.searchTransactions,

    // Filter state
    hasActiveFilters: dataHook.hasActiveFilters,
    isFilteredResult: dataHook.isFilteredResult,

    // === Operations Hook Properties ===
    // CRUD operations
    addTransaction: operationsHook.addTransaction,
    updateTransaction: operationsHook.updateTransaction,
    deleteTransaction: operationsHook.deleteTransaction,
    splitTransaction: operationsHook.splitTransaction,
    transferFunds: operationsHook.transferFunds,
    bulkOperation: operationsHook.bulkOperation,

    // Enhanced operations (with auto-refresh)
    ...enhancedOperations,

    // Loading states
    isAdding: operationsHook.isAdding,
    isUpdating: operationsHook.isUpdating,
    isDeleting: operationsHook.isDeleting,
    isSplitting: operationsHook.isSplitting,
    isTransferring: operationsHook.isTransferring,
    isBulkProcessing: operationsHook.isBulkProcessing,
    isProcessing: operationsHook.isProcessing,

    // Error states
    addError: operationsHook.addError,
    updateError: operationsHook.updateError,
    deleteError: operationsHook.deleteError,
    splitError: operationsHook.splitError,
    transferError: operationsHook.transferError,
    bulkError: operationsHook.bulkError,

    // === Utility Methods ===
    refetch: dataHook.refetch,

    // Mutation objects for advanced use (backward compatibility)
    addTransactionMutation: operationsHook.addTransactionMutation,
    updateTransactionMutation: operationsHook.updateTransactionMutation,
    deleteTransactionMutation: operationsHook.deleteTransactionMutation,
    splitTransactionMutation: operationsHook.splitTransactionMutation,
    transferFundsMutation: operationsHook.transferFundsMutation,
    bulkOperationMutation: operationsHook.bulkOperationMutation,

    // Hook metadata
    hookVersion: "2.0.0",
    isV2: true,

    // Sub-hooks access (for debugging/advanced usage)
    _internal: {
      dataHook,
      operationsHook,
    },
  };
};

export default useTransactionsV2;
