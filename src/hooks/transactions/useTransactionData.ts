/**
 * Transaction Data Hook
 * Focused hook for querying and filtering transaction data
 * Created for Issue #508 - extracted from useTransactions.js
 */
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { budgetDb } from "../../db/budgetDb.ts";
import { queryKeys } from "../../utils/common/queryClient.ts";
import {
  processTransactions,
  calculateTransactionStats,
} from "../../utils/transactions/filtering.ts";
import logger from "../../utils/common/logger.ts";

/**
 * Hook for querying and filtering transaction data
 * @param {Object} options - Query and filter options
 * @returns {Object} Query state and processed transactions
 */
const useTransactionData = (options = {}) => {
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
    queryFn: async () => {
      logger.debug("Fetching transactions from database", {
        filters: { dateRange, envelopeId, category, type, searchQuery },
        sort: { sortBy, sortOrder },
        limit,
      });

      try {
        // Get all transactions from database
        const allTransactions = await budgetDb.transactions.orderBy("date").reverse().toArray();

        if (!Array.isArray(allTransactions)) {
          logger.warn("No transactions returned from database");
          return [];
        }

        logger.debug(`Retrieved ${allTransactions.length} transactions from database`);
        return allTransactions;
      } catch (error) {
        logger.error("Error fetching transactions", error);
        throw error;
      }
    },
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
    if (!processedTransactions.length) {
      return {
        total: 0,
        totalIncome: 0,
        totalExpenses: 0,
        netAmount: 0,
        averageTransaction: 0,
        categories: {},
        accounts: {},
        dateRange: { earliest: null, latest: null },
      };
    }

    try {
      return calculateTransactionStats(processedTransactions);
    } catch (error) {
      logger.error("Error calculating transaction statistics", error);
      return {
        total: processedTransactions.length,
        totalIncome: 0,
        totalExpenses: 0,
        netAmount: 0,
        averageTransaction: 0,
        categories: {},
        accounts: {},
        dateRange: { earliest: null, latest: null },
        error: error.message,
      };
    }
  }, [processedTransactions]);

  /**
   * Recent transactions (last 10)
   */
  const recentTransactions = useMemo(() => {
    if (!processedTransactions.length) return [];

    try {
      return processedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
    } catch (error) {
      logger.error("Error getting recent transactions", error);
      return processedTransactions.slice(0, 10);
    }
  }, [processedTransactions]);

  /**
   * Income transactions only
   */
  const incomeTransactions = useMemo(() => {
    return processedTransactions.filter((txn) => txn.amount > 0);
  }, [processedTransactions]);

  /**
   * Expense transactions only
   */
  const expenseTransactions = useMemo(() => {
    return processedTransactions.filter((txn) => txn.amount < 0);
  }, [processedTransactions]);

  /**
   * Transfer transactions only
   */
  const transferTransactions = useMemo(() => {
    return processedTransactions.filter((txn) => txn.type === "transfer");
  }, [processedTransactions]);

  /**
   * Split transactions only
   */
  const splitTransactions = useMemo(() => {
    return processedTransactions.filter((txn) => txn.isSplit || txn.parentTransactionId);
  }, [processedTransactions]);

  /**
   * Uncategorized transactions
   */
  const uncategorizedTransactions = useMemo(() => {
    return processedTransactions.filter(
      (txn) => !txn.category || txn.category.toLowerCase() === "uncategorized"
    );
  }, [processedTransactions]);

  /**
   * Get transactions by date range
   */
  const getTransactionsByDateRange = useMemo(() => {
    return (startDate, endDate) => {
      return processedTransactions.filter((txn) => {
        const txnDate = new Date(txn.date);
        return txnDate >= new Date(startDate) && txnDate <= new Date(endDate);
      });
    };
  }, [processedTransactions]);

  /**
   * Get transactions by envelope
   */
  const getTransactionsByEnvelope = useMemo(() => {
    return (envelopeId) => {
      return processedTransactions.filter((txn) => txn.envelopeId === envelopeId);
    };
  }, [processedTransactions]);

  /**
   * Get transactions by category
   */
  const getTransactionsByCategory = useMemo(() => {
    return (categoryName) => {
      return processedTransactions.filter(
        (txn) => txn.category?.toLowerCase() === categoryName.toLowerCase()
      );
    };
  }, [processedTransactions]);

  /**
   * Search transactions
   */
  const searchTransactions = useMemo(() => {
    return (query) => {
      if (!query || !query.trim()) return processedTransactions;

      const searchTerm = query.toLowerCase().trim();
      return processedTransactions.filter((txn) => {
        const description = (txn.description || "").toLowerCase();
        const category = (txn.category || "").toLowerCase();
        const account = (txn.account || "").toLowerCase();
        const amount = Math.abs(txn.amount).toString();

        return (
          description.includes(searchTerm) ||
          category.includes(searchTerm) ||
          account.includes(searchTerm) ||
          amount.includes(searchTerm)
        );
      });
    };
  }, [processedTransactions]);

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

export default useTransactionData;
