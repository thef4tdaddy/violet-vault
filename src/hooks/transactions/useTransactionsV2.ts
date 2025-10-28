/**
 * Transactions Hook V2 (Refactored)
 * Modern hook combining focused sub-hooks for transaction management
 * Created for Issue #508 - replaces the monolithic useTransactions.js
 */
import { useEffect } from "react";
import { useBudgetStore } from "@/stores/ui/uiStore";
import { useShallow } from "zustand/react/shallow";
import { useTransactionData } from "./useTransactionData";
import { useTransactionOperations } from "./useTransactionOperations";
import { createEnhancedOperations } from "./useTransactionsV2Helpers";
import logger from "@/utils/common/logger";

interface UseTransactionsV2Options {
  dateRange?: { start: string; end: string };
  envelopeId?: string;
  category?: string;
  type?: string;
  searchQuery?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  categoryRules?: Array<{ pattern: string; category: string; envelopeId?: string | number }>;
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number | null;
}

/**
 * Enhanced transactions hook with focused separation of concerns
 * @param options - Hook options
 * @returns Complete transaction management interface
 */
const useTransactionsV2 = (options: UseTransactionsV2Options = {}) => {
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
  const budgetStore = useBudgetStore(
    useShallow((state) => ({
      updateTransactions: (state as Record<string, unknown>).updateTransactions,
    }))
  );

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
  const enhancedOperations = createEnhancedOperations(operationsHook, dataHook);

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

export { useTransactionsV2 };
export default useTransactionsV2;
