/**
 * Transaction Data Hook
 * Focused hook for querying and filtering transaction data
 * Created for Issue #508 - extracted from useTransactions.js
 */
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { budgetDb } from "@/db/budgetDb";
import { queryKeys } from "@/utils/common/queryClient";
import {
  processTransactions,
  calculateTransactionStats,
} from "@/utils/transactions/filtering";
import logger from "@/utils/common/logger";
import {
  fetchTransactionsFromDb,
  getRecentTransactions,
  getIncomeTransactions,
  getExpenseTransactions,
  getTransferTransactions,
  getSplitTransactions,
  getUncategorizedTransactions,
  filterByDateRange,
  filterByEnvelope,
  filterByCategory,
  searchTransactionsHelper,
  getEmptyStats,
} from "./helpers/transactionDataHelpers";

interface UseTransactionDataOptions {
  // Filter options
  dateRange?: { start?: string; end?: string };
  envelopeId?: string;
  category?: string;
  type?: string; // 'income' | 'expense' | 'transfer'
  searchQuery?: string;

  // Sort options
  sortBy?: string;
  sortOrder?: string;
  limit?: number;

  // Query options
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number | null;
}

/**
 * Hook for querying and filtering transaction data
 * @param {Object} options - Query and filter options
 * @returns {Object} Query state and processed transactions
 */
const useTransactionData = (options: UseTransactionDataOptions = {}) => {
  const {
    // Filter options
    dateRange,
    envelopeId,
    category,
    type, // 'income' | 'expense' | 'transfer'
    searchQuery,

    // Sort options
    sortBy = "date",
    sortOrder = "desc",
    limit = 100,

    // Query options
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    refetchInterval = null,
  } = options;

  /**
   * Main transactions query
   */
  const transactionsQuery = useQuery({
    queryKey: queryKeys.transactionsList({
      dateRange,
      envelopeId,
      category,
      type,
      searchQuery,
      sortBy,
      sortOrder,
      limit,
    }),
    queryFn: () => fetchTransactionsFromDb(budgetDb, logger),
    enabled,
    staleTime,
    refetchInterval,
  });

  /**
   * Process and filter transactions based on options
   */
  const processedTransactions = useMemo(() => {
    if (!transactionsQuery.data) return [];

    try {
      const processed = processTransactions(transactionsQuery.data, {
        dateRange,
        envelopeId,
        category,
        type,
        searchQuery,
        sortBy,
        sortOrder,
        limit,
      });

      logger.debug(`Processed ${processed.length} transactions after filtering`);
      return processed;
    } catch (error) {
      logger.error("Error processing transactions", error);
      return transactionsQuery.data || [];
    }
  }, [
    transactionsQuery.data,
    dateRange,
    envelopeId,
    category,
    type,
    searchQuery,
    sortBy,
    sortOrder,
    limit,
  ]);

  /**
   * Calculate statistics for processed transactions
   */
  const statistics = useMemo(() => {
    if (!processedTransactions.length) return getEmptyStats();

    try {
      return calculateTransactionStats(processedTransactions);
    } catch (error) {
      logger.error("Error calculating transaction statistics", error);
      return {
        ...getEmptyStats(),
        total: processedTransactions.length,
        error: error.message,
      };
    }
  }, [processedTransactions]);

  // Filtered views using extracted helpers
  const recentTransactions = useMemo(
    () => getRecentTransactions(processedTransactions, 10),
    [processedTransactions]
  );
  const incomeTransactions = useMemo(
    () => getIncomeTransactions(processedTransactions),
    [processedTransactions]
  );
  const expenseTransactions = useMemo(
    () => getExpenseTransactions(processedTransactions),
    [processedTransactions]
  );
  const transferTransactions = useMemo(
    () => getTransferTransactions(processedTransactions),
    [processedTransactions]
  );
  const splitTransactions = useMemo(
    () => getSplitTransactions(processedTransactions),
    [processedTransactions]
  );
  const uncategorizedTransactions = useMemo(
    () => getUncategorizedTransactions(processedTransactions),
    [processedTransactions]
  );

  // Helper methods using extracted functions
  const getTransactionsByDateRange = useMemo(
    () => (startDate, endDate) => filterByDateRange(processedTransactions, startDate, endDate),
    [processedTransactions]
  );
  const getTransactionsByEnvelope = useMemo(
    () => (envelopeId) => filterByEnvelope(processedTransactions, envelopeId),
    [processedTransactions]
  );
  const getTransactionsByCategory = useMemo(
    () => (categoryName) => filterByCategory(processedTransactions, categoryName),
    [processedTransactions]
  );
  const searchTransactions = useMemo(
    () => (query) => searchTransactionsHelper(processedTransactions, query),
    [processedTransactions]
  );

  /**
   * Filter state helpers
   */
  const hasActiveFilters = !!(dateRange || envelopeId || category || type || searchQuery);
  const isFilteredResult = processedTransactions.length !== transactionsQuery.data?.length;

  return {
    // Query state
    isLoading: transactionsQuery.isLoading,
    isError: transactionsQuery.isError,
    error: transactionsQuery.error,
    isSuccess: transactionsQuery.isSuccess,
    isFetching: transactionsQuery.isFetching,
    isRefetching: transactionsQuery.isRefetching,

    // Data
    transactions: processedTransactions,
    allTransactions: transactionsQuery.data || [],
    statistics,

    // Filtered views
    recentTransactions,
    incomeTransactions,
    expenseTransactions,
    transferTransactions,
    splitTransactions,
    uncategorizedTransactions,

    // Helper methods
    getTransactionsByDateRange,
    getTransactionsByEnvelope,
    getTransactionsByCategory,
    searchTransactions,

    // Filter state
    hasActiveFilters,
    isFilteredResult,

    // Query utilities
    refetch: transactionsQuery.refetch,
    invalidate: () => {
      // This would need access to queryClient, but we'll keep the hook focused
      logger.debug("Invalidate called - implement in parent component");
    },
  };
};

export { useTransactionData };
