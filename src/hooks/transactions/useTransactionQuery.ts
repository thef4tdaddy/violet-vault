import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useCallback } from "react";
import { queryKeys } from "../../utils/common/queryClient.ts";
import { budgetDb } from "../../db/budgetDb.ts";
import logger from "../../utils/common/logger.ts";
import type { Transaction } from "../../db/types.ts";
import { seedDexieFromZustand } from "./helpers/transactionQueryHelpers.ts";
import { processTransactions, calculateTransactionStats } from "@/utils/transactions/filtering";

/**
 * Filter and query options for transactions
 */
export interface UseTransactionQueryOptions {
  // Filter options
  dateRange?: { start?: Date | string; end?: Date | string };
  envelopeId?: string;
  category?: string;
  type?: "income" | "expense" | "transfer";
  searchQuery?: string;
  hideInternalTransfers?: boolean;

  // Sort and limit
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";

  // Query configuration
  enabled?: boolean;
  staleTime?: number;
}

/**
 * Consolidated Transaction Query Hook
 * Provides data fetching from Dexie, filtering, statistics, and convenience views.
 */
export const useTransactionQuery = (options: UseTransactionQueryOptions = {}) => {
  const queryClient = useQueryClient();
  const {
    dateRange,
    envelopeId,
    category,
    type,
    searchQuery,
    hideInternalTransfers = false,
    limit = 100,
    sortBy = "date",
    sortOrder = "desc",
    enabled = true,
    staleTime = 5 * 60 * 1000,
  } = options;

  // Main fetch function - hydrates from Dexie, handles legacy Zustand seeding
  const queryFunction = async (): Promise<Transaction[]> => {
    logger.debug("Fetching transactions from Dexie", { source: "useTransactionQuery" });

    try {
      let transactions = await budgetDb.transactions.orderBy("date").reverse().toArray();

      // Seed from legacy store if needed (Dexie is empty)
      transactions = await seedDexieFromZustand(
        transactions,
        [], // zustandAllTransactions (deprecated)
        [], // zustandTransactions (deprecated)
        budgetDb
      );

      return transactions;
    } catch (error) {
      logger.error("Dexie fetch failed", error, { source: "useTransactionQuery" });
      return [];
    }
  };

  const transactionsQuery = useQuery({
    queryKey: queryKeys.transactionsList({
      dateRange,
      envelopeId,
      category,
      type,
      searchQuery,
      limit,
      sortBy,
      sortOrder,
      hideInternalTransfers,
    }),
    queryFn: queryFunction,
    staleTime,
    enabled,
    placeholderData: (previousData) => previousData,
  });

  // Pure logic for processing data (Filtering, Sorting, Limiting)
  const processedTransactions = useMemo(() => {
    const rawData = transactionsQuery.data || [];

    // Adapt dateRange for processTransactions utility
    const internalDateRange = dateRange
      ? {
          start: dateRange.start instanceof Date ? dateRange.start.toISOString() : dateRange.start,
          end: dateRange.end instanceof Date ? dateRange.end.toISOString() : dateRange.end,
        }
      : undefined;

    // Apply internal transfer filter (specific to this app's logic)
    let baseData = rawData;
    if (hideInternalTransfers) {
      baseData = rawData.filter((t) => !t.isInternalTransfer);
    }

    // Use shared utility for complex filtering/sorting
    return processTransactions(baseData as unknown as import("@/types/finance").Transaction[], {
      dateRange: internalDateRange,
      envelopeId,
      category,
      type,
      searchQuery,
      sortBy,
      sortOrder,
      limit,
    }) as unknown as Transaction[];
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
    hideInternalTransfers,
  ]);

  // Statistics calculation
  const statistics = useMemo(() => {
    return calculateTransactionStats(
      processedTransactions as unknown as import("@/types/finance").Transaction[]
    );
  }, [processedTransactions]);

  // Specialized views for common UI patterns
  const recentTransactions = useMemo(
    () => processedTransactions.slice(0, 10),
    [processedTransactions]
  );
  const incomeTransactions = useMemo(
    () => processedTransactions.filter((t) => t.amount > 0),
    [processedTransactions]
  );
  const expenseTransactions = useMemo(
    () => processedTransactions.filter((t) => t.amount < 0),
    [processedTransactions]
  );
  const transferTransactions = useMemo(
    () => processedTransactions.filter((t) => t.type === "transfer"),
    [processedTransactions]
  );

  // Helper methods for dynamic filtering at the component level
  const getTransactionsByEnvelope = useCallback(
    (envId: string) => processedTransactions.filter((t) => t.envelopeId === envId),
    [processedTransactions]
  );

  const searchTransactions = useCallback(
    (query: string) => {
      if (!query?.trim()) return processedTransactions;
      const term = query.toLowerCase().trim();
      return processedTransactions.filter(
        (t) =>
          t.description?.toLowerCase().includes(term) || t.category?.toLowerCase().includes(term)
      );
    },
    [processedTransactions]
  );

  // Listen for external invalidation events
  useEffect(() => {
    const handleInvalidate = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
    };

    window.addEventListener("importCompleted", handleInvalidate);
    window.addEventListener("invalidateAllQueries", handleInvalidate);

    return () => {
      window.removeEventListener("importCompleted", handleInvalidate);
      window.removeEventListener("invalidateAllQueries", handleInvalidate);
    };
  }, [queryClient]);

  return {
    // Data & Stats
    transactions: processedTransactions,
    allTransactions: transactionsQuery.data || [],
    statistics,

    // Views
    recentTransactions,
    incomeTransactions,
    expenseTransactions,
    transferTransactions,

    // Status
    isLoading: transactionsQuery.isLoading,
    isFetching: transactionsQuery.isFetching,
    isError: transactionsQuery.isError,
    error: transactionsQuery.error,

    // Methods
    getTransactionsByEnvelope,
    searchTransactions,
    refetch: transactionsQuery.refetch,
    invalidate: () => queryClient.invalidateQueries({ queryKey: queryKeys.transactions }),
  };
};

export default useTransactionQuery;
