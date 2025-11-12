/**
 * Transaction Data Hook
 * Focused hook for querying and filtering transaction data
 * Created for Issue #508 - extracted from useTransactions.js
 */
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { budgetDb } from "@/db/budgetDb";
import { queryKeys } from "@/utils/common/queryClient";
import { processTransactions, calculateTransactionStats } from "@/utils/transactions/filtering";
import logger from "@/utils/common/logger";
import type { Transaction } from "@/types/finance";
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

// Type for transaction statistics
interface TransactionStats {
  total: number;
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  averageTransaction: number;
  categories: Record<string, { count: number; total: number }>;
  accounts: Record<string, { count: number; total: number }>;
  dateRange: { earliest: Date | null; latest: Date | null };
  error?: string;
}

// Type for transaction filter options
interface TransactionFilterOptions {
  dateRange?: { start?: string; end?: string };
  envelopeId?: string;
  category?: string;
  type?: string; // 'income' | 'expense' | 'transfer'
  searchQuery?: string;
  sortBy?: string;
  sortOrder?: string;
  limit?: number;
}

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

// Type for helper functions
type GetTransactionsByDateRangeFn = (
  startDate: Date | string,
  endDate: Date | string
) => Transaction[];
type GetTransactionsByEnvelopeFn = (envelopeId: string) => Transaction[];
type GetTransactionsByCategoryFn = (categoryName: string) => Transaction[];
type SearchTransactionsFn = (query: string) => Transaction[];

/**
 * Hook for querying and filtering transaction data
 * @param options - Query and filter options
 * @returns Query state and processed transactions
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
  const processedTransactions = useMemo((): Transaction[] => {
    if (!transactionsQuery.data) return [];

    try {
      const filterOptions: TransactionFilterOptions = {
        dateRange,
        envelopeId,
        category,
        type,
        searchQuery,
        sortBy,
        sortOrder,
        limit,
      };

      const processed = processTransactions(transactionsQuery.data, filterOptions);

      logger.debug(`Processed ${processed.length} transactions after filtering`);
      return processed;
    } catch (error) {
      logger.error("Error processing transactions", { error });
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
  const statistics = useMemo((): TransactionStats => {
    if (!processedTransactions.length) return getEmptyStats();

    try {
      return calculateTransactionStats(processedTransactions);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("Error calculating transaction statistics", { error });
      return {
        ...getEmptyStats(),
        total: processedTransactions.length,
        error: errorMessage,
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
    (): GetTransactionsByDateRangeFn => (startDate, endDate) =>
      filterByDateRange(processedTransactions, startDate, endDate),
    [processedTransactions]
  );
  const getTransactionsByEnvelope = useMemo(
    (): GetTransactionsByEnvelopeFn => (envelopeId) =>
      filterByEnvelope(processedTransactions, envelopeId),
    [processedTransactions]
  );
  const getTransactionsByCategory = useMemo(
    (): GetTransactionsByCategoryFn => (categoryName) =>
      filterByCategory(processedTransactions, categoryName),
    [processedTransactions]
  );
  const searchTransactions = useMemo(
    (): SearchTransactionsFn => (query) => searchTransactionsHelper(processedTransactions, query),
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
      // This would need access to queryClient, but we'll keep hook focused
      logger.debug("Invalidate called - implement in parent component");
    },
  };
};

export { useTransactionData };
