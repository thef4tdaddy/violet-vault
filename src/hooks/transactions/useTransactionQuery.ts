import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { queryKeys } from "../../utils/common/queryClient.ts";
import { budgetDb } from "../../db/budgetDb.ts";
import logger from "../../utils/common/logger.ts";
import type { Transaction } from "../../db/types.ts";
import {
  applyFilters,
  applySorting,
  applyLimit,
  seedDexieFromZustand,
} from "./helpers/transactionQueryHelpers.ts";

interface UseTransactionQueryOptions {
  dateRange?: { start: Date; end: Date };
  envelopeId?: string;
  category?: string;
  type?: "income" | "expense" | "transfer";
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const useTransactionQuery = (options: UseTransactionQueryOptions = {}) => {
  const queryClient = useQueryClient();
  const {
    dateRange,
    envelopeId,
    category,
    type, // 'income' | 'expense' | 'transfer'
    limit = 100,
    sortBy = "date",
    sortOrder = "desc",
  } = options;

  // No longer accessing Zustand store for transaction data
  // Transaction data is now managed entirely by TanStack Query → Dexie
  const zustandTransactions = useMemo<Transaction[]>(() => [], []);
  const zustandAllTransactions = useMemo<Transaction[]>(() => [], []);

  // TanStack Query function - hydrates from Dexie, Dexie syncs with Firebase
  const queryFunction = async (): Promise<Transaction[]> => {
    logger.debug("TanStack Query: Fetching transactions from Dexie", {
      source: "useTransactionQuery",
    });

    try {
      // Always fetch from Dexie (single source of truth for local data)
      let transactions = await budgetDb.transactions.orderBy("date").reverse().toArray();

      logger.debug("TanStack Query: Loaded from Dexie", {
        count: transactions.length,
        source: "useTransactionQuery",
      });

      // If Dexie is empty and we have Zustand data, seed Dexie
      transactions = await seedDexieFromZustand(
        transactions,
        zustandAllTransactions,
        zustandTransactions,
        budgetDb
      );

      // Apply date range filtering if specified
      if (dateRange) {
        const { start, end } = dateRange;
        transactions = transactions.filter((t) => {
          const transactionDate = new Date(t.date);
          return transactionDate >= start && transactionDate <= end;
        });
      }

      // Apply additional filters
      let filteredTransactions = applyFilters(transactions, {
        envelopeId,
        category,
        type,
      });

      // Apply sorting
      filteredTransactions = applySorting(filteredTransactions, {
        sortBy,
        sortOrder,
      });

      // Apply limit
      filteredTransactions = applyLimit(filteredTransactions, limit);

      return filteredTransactions;
    } catch (error) {
      logger.error("TanStack Query: Dexie fetch failed", error, {
        source: "useTransactionQuery",
      });
      // Emergency fallback only when Dexie completely fails
      const zustandData =
        zustandAllTransactions?.length > 0 ? zustandAllTransactions : zustandTransactions;
      return zustandData || [];
    }
  };

  // Main transactions query
  const transactionsQuery = useQuery({
    queryKey: queryKeys.transactionsList({
      dateRange,
      envelopeId,
      category,
      type,
      limit,
      sortBy,
      sortOrder,
    }),
    queryFn: queryFunction,
    staleTime: 5 * 60 * 1000, // 5 minutes - reduce refetches
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
    refetchOnMount: false, // Don't refetch if data is fresh
    refetchOnWindowFocus: false, // Don't refetch on window focus
    placeholderData: (previousData: Transaction[] | undefined) => previousData, // Use previous data during refetch
    initialData: undefined, // Remove initialData to prevent persister errors
    enabled: true,
  });

  // Listen for import completion to force refresh
  useEffect(() => {
    const handleImportCompleted = () => {
      logger.debug("Import detected, invalidating transactions cache", {
        source: "useTransactionQuery",
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
    };

    const handleInvalidateAll = () => {
      logger.debug("Invalidating all transaction queries", {
        source: "useTransactionQuery",
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactionsList() });
    };

    window.addEventListener("importCompleted", handleImportCompleted);
    window.addEventListener("invalidateAllQueries", handleInvalidateAll);

    return () => {
      window.removeEventListener("importCompleted", handleImportCompleted);
      window.removeEventListener("invalidateAllQueries", handleInvalidateAll);
    };
  }, [queryClient]);

  return {
    transactions: transactionsQuery.data || [],
    isLoading: transactionsQuery.isLoading,
    isFetching: transactionsQuery.isFetching,
    isError: transactionsQuery.isError,
    error: transactionsQuery.error,
    refetch: transactionsQuery.refetch,
  };
};
