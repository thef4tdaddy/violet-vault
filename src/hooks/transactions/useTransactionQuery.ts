import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useBudgetStore } from "../../stores/ui/uiStore.js";
import { queryKeys } from "../../utils/common/queryClient.js";
import { budgetDb } from "../../db/budgetDb.js";
import logger from "../../utils/common/logger.js";
import { Transaction, TransactionQueryOptions } from "../../types/transactions";
import { QueryResult } from "../../types/query";

interface TransactionQueryResult extends QueryResult<Transaction[]> {
  transactions: Transaction[];
}

export const useTransactionQuery = (options: TransactionQueryOptions = {}): TransactionQueryResult => {
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

  // Get Zustand store for UI state only (transactions are managed by TanStack Query → Dexie)
  const {
    transactions: zustandTransactions,
    allTransactions: zustandAllTransactions,
  } = useBudgetStore();

  // TanStack Query function - hydrates from Dexie, Dexie syncs with Firebase
  const queryFunction = async (): Promise<Transaction[]> => {
    logger.debug("TanStack Query: Fetching transactions from Dexie", {
      source: "useTransactionQuery",
    });

    try {
      let transactions: Transaction[] = [];

      // Always fetch from Dexie (single source of truth for local data)
      transactions = await budgetDb.transactions
        .orderBy("date")
        .reverse()
        .toArray();

      logger.debug("TanStack Query: Loaded from Dexie", {
        count: transactions.length,
        source: "useTransactionQuery",
      });

      // If Dexie is empty and we have Zustand data, seed Dexie
      const zustandData: Transaction[] =
        zustandAllTransactions?.length > 0
          ? zustandAllTransactions
          : zustandTransactions;
      if (transactions.length === 0 && zustandData && zustandData.length > 0) {
        logger.debug("TanStack Query: Seeding Dexie from Zustand", {
          zustandDataLength: zustandData.length,
          source: "useTransactionQuery",
        });
        await budgetDb.bulkUpsertTransactions(zustandData);
        transactions = [...zustandData];
      }

      // Apply date range filtering if specified
      if (dateRange) {
        const { start, end } = dateRange;
        transactions = transactions.filter((t) => {
          const transactionDate = new Date(t.date);
          return transactionDate >= start && transactionDate <= end;
        });
      }

      // Apply additional filters
      let filteredTransactions = transactions;

      if (envelopeId) {
        filteredTransactions = filteredTransactions.filter(
          (t) => t.envelopeId === envelopeId,
        );
      }

      if (category) {
        filteredTransactions = filteredTransactions.filter(
          (t) => t.category === category,
        );
      }

      if (type) {
        if (type === "income") {
          filteredTransactions = filteredTransactions.filter(
            (t) => t.amount > 0,
          );
        } else if (type === "expense") {
          filteredTransactions = filteredTransactions.filter(
            (t) => t.amount < 0,
          );
        } else if (type === "transfer") {
          filteredTransactions = filteredTransactions.filter(
            (t) => t.type === "transfer",
          );
        }
      }

      // Apply sorting
      filteredTransactions.sort((a, b) => {
        let aVal: unknown = a[sortBy as keyof Transaction];
        let bVal: unknown = b[sortBy as keyof Transaction];

        // Handle date fields
        if (sortBy === "date") {
          aVal = new Date(aVal as string);
          bVal = new Date(bVal as string);
        }

        // Handle numeric fields
        if (sortBy === "amount") {
          aVal = parseFloat(aVal as string) || 0;
          bVal = parseFloat(bVal as string) || 0;
        }

        if (sortOrder === "desc") {
          return (bVal as number | Date) > (aVal as number | Date) ? 1 : (bVal as number | Date) < (aVal as number | Date) ? -1 : 0;
        } else {
          return (aVal as number | Date) > (bVal as number | Date) ? 1 : (aVal as number | Date) < (bVal as number | Date) ? -1 : 0;
        }
      });

      // Apply limit
      if (limit) {
        filteredTransactions = filteredTransactions.slice(0, limit);
      }

      return filteredTransactions;
    } catch (error) {
      logger.error("TanStack Query: Dexie fetch failed", error, {
        source: "useTransactionQuery",
      });
      // Emergency fallback only when Dexie completely fails
      const zustandData: Transaction[] =
        zustandAllTransactions?.length > 0
          ? zustandAllTransactions
          : zustandTransactions;
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
    placeholderData: (previousData) => previousData, // Use previous data during refetch
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
      queryClient.invalidateQueries({ queryKey: queryKeys.transactionsList });
    };

    window.addEventListener("importCompleted", handleImportCompleted);
    window.addEventListener("invalidateAllQueries", handleInvalidateAll);

    return () => {
      window.removeEventListener("importCompleted", handleImportCompleted);
      window.removeEventListener("invalidateAllQueries", handleInvalidateAll);
    };
  }, [queryClient]);

  return {
    ...transactionsQuery,
    transactions: transactionsQuery.data || [],
  };
};