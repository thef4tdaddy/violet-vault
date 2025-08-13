import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useBudgetStore } from "../stores/budgetStore";
import { queryKeys, optimisticHelpers } from "../utils/queryClient";
import { budgetDb } from "../db/budgetDb";

/**
 * Specialized hook for transaction management
 * Provides transaction operations with smart filtering, date range support, and analytics
 */
const useTransactions = (options = {}) => {
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

  // Get Zustand store for mutations
  const {
    transactions: zustandTransactions,
    allTransactions: zustandAllTransactions,
    addTransaction: zustandAddTransaction,
    reconcileTransaction: zustandReconcileTransaction,
  } = useBudgetStore();

  console.log("useTransactions Zustand data debug:", {
    zustandTransactionsLength: zustandTransactions?.length || 0,
    zustandAllTransactionsLength: zustandAllTransactions?.length || 0,
    firstZustandTransaction: zustandTransactions?.[0],
    firstAllTransaction: zustandAllTransactions?.[0],
  });

  // TanStack Query function - hydrates from Dexie, Dexie syncs with Firebase
  const queryFunction = async () => {
    console.log("🔄 TanStack Query: Fetching transactions from Dexie...");

    try {
      let transactions = [];

      // Always fetch from Dexie (single source of truth for local data)
      transactions = await budgetDb.transactions.orderBy("date").reverse().toArray();

      console.log("✅ TanStack Query: Loaded from Dexie:", transactions.length);

      // If Dexie is empty and we have Zustand data, seed Dexie
      const zustandData =
        zustandAllTransactions?.length > 0 ? zustandAllTransactions : zustandTransactions;
      if (transactions.length === 0 && zustandData && zustandData.length > 0) {
        console.log("🌱 TanStack Query: Seeding Dexie from Zustand...");
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
        filteredTransactions = filteredTransactions.filter((t) => t.envelopeId === envelopeId);
      }

      if (category) {
        filteredTransactions = filteredTransactions.filter((t) => t.category === category);
      }

      if (type) {
        if (type === "income") {
          filteredTransactions = filteredTransactions.filter((t) => t.amount > 0);
        } else if (type === "expense") {
          filteredTransactions = filteredTransactions.filter((t) => t.amount < 0);
        } else if (type === "transfer") {
          filteredTransactions = filteredTransactions.filter((t) => t.type === "transfer");
        }
      }

      // Apply sorting
      filteredTransactions.sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];

        // Handle date fields
        if (sortBy === "date") {
          aVal = new Date(aVal);
          bVal = new Date(bVal);
        }

        // Handle numeric fields
        if (sortBy === "amount") {
          aVal = parseFloat(aVal) || 0;
          bVal = parseFloat(bVal) || 0;
        }

        if (sortOrder === "desc") {
          return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
        } else {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        }
      });

      // Apply limit
      if (limit) {
        filteredTransactions = filteredTransactions.slice(0, limit);
      }

      return filteredTransactions;
    } catch (error) {
      console.error("❌ TanStack Query: Dexie fetch failed:", error);
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
    placeholderData: (previousData) => previousData, // Use previous data during refetch
    initialData: undefined, // Remove initialData to prevent persister errors
    enabled: true,
  });

  // Listen for import completion to force refresh
  useEffect(() => {
    const handleImportCompleted = () => {
      console.log("🔄 Import detected, invalidating transactions cache");
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
    };

    const handleInvalidateAll = () => {
      console.log("🔄 Invalidating all transaction queries");
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

  // Add transaction mutation
  const addTransactionMutation = useMutation({
    mutationKey: ["transactions", "add"],
    mutationFn: async (transactionData) => {
      const newTransaction = {
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        type: "expense",
        category: "other",
        createdAt: new Date().toISOString(),
        ...transactionData,
        amount: transactionData.amount || 0,
      };

      // Apply optimistic update
      await optimisticHelpers.addTransaction(newTransaction);

      // Call Zustand mutation
      zustandAddTransaction(newTransaction);

      return newTransaction;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
    },
    onError: (error) => {
      console.error("Failed to add transaction:", error);
      // TODO: Implement rollback logic
    },
  });

  // Reconcile transaction mutation (for balance reconciliation)
  const reconcileTransactionMutation = useMutation({
    mutationKey: ["transactions", "reconcile"],
    mutationFn: async (transactionData) => {
      const reconciledTransaction = {
        ...transactionData,
        id: Date.now().toString(),
        reconciledAt: new Date().toISOString(),
      };

      // Call Zustand mutation
      zustandReconcileTransaction(reconciledTransaction);

      // Apply optimistic update
      await optimisticHelpers.addTransaction(reconciledTransaction);

      return reconciledTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error) => {
      console.error("Failed to reconcile transaction:", error);
    },
  });

  // Delete transaction mutation
  const deleteTransactionMutation = useMutation({
    mutationKey: ["transactions", "delete"],
    mutationFn: async (transactionId) => {
      // Apply optimistic update using helper
      await optimisticHelpers.removeTransaction(transactionId);

      return transactionId;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
    },
    onError: (error, transactionId) => {
      console.error("Failed to delete transaction:", error);
      // Rollback optimistic update
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
    },
  });

  // Update transaction mutation
  const updateTransactionMutation = useMutation({
    mutationKey: ["transactions", "update"],
    mutationFn: async ({ id, updates }) => {
      // Apply optimistic update using helper
      await optimisticHelpers.updateTransaction(id, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      return { id, updates };
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
    },
    onError: (error) => {
      console.error("Failed to update transaction:", error);
      // Rollback optimistic update
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
    },
  });

  // Analytics computation
  const transactions = transactionsQuery.data || [];

  const analytics = {
    totalIncome: transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: Math.abs(
      transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)
    ),
    netAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
    transactionCount: transactions.length,

    // Category breakdown
    categoryBreakdown: transactions.reduce((acc, t) => {
      const category = t.category || "uncategorized";
      if (!acc[category]) {
        acc[category] = { income: 0, expenses: 0, count: 0 };
      }

      if (t.amount > 0) {
        acc[category].income += t.amount;
      } else {
        acc[category].expenses += Math.abs(t.amount);
      }
      acc[category].count += 1;

      return acc;
    }, {}),

    // Daily breakdown (for charts)
    dailyBreakdown: transactions.reduce((acc, t) => {
      const date = t.date;
      if (!acc[date]) {
        acc[date] = { income: 0, expenses: 0, count: 0 };
      }

      if (t.amount > 0) {
        acc[date].income += t.amount;
      } else {
        acc[date].expenses += Math.abs(t.amount);
      }
      acc[date].count += 1;

      return acc;
    }, {}),

    // Recent transactions (last 7 days)
    recentTransactions: (() => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      return transactions.filter((t) => new Date(t.date) >= sevenDaysAgo);
    })(),
  };

  // Utility functions
  const getTransactionById = (id) => transactions.find((t) => t.id === id);

  const getTransactionsByEnvelope = (envId) => transactions.filter((t) => t.envelopeId === envId);

  const getTransactionsByCategory = (cat) => transactions.filter((t) => t.category === cat);

  const getAvailableCategories = () => {
    const categories = new Set(transactions.map((t) => t.category));
    return Array.from(categories).filter(Boolean).sort();
  };

  // Date range helpers
  const getThisMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start, end };
  };

  const getLastMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { start, end };
  };

  const getLast30Days = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return { start, end };
  };

  return {
    // Data
    transactions,
    ...analytics,
    availableCategories: getAvailableCategories(),

    // Loading states
    isLoading: transactionsQuery.isLoading,
    isFetching: transactionsQuery.isFetching,
    isError: transactionsQuery.isError,
    error: transactionsQuery.error,

    // Mutation functions
    addTransaction: addTransactionMutation.mutate,
    addTransactionAsync: addTransactionMutation.mutateAsync,
    reconcileTransaction: reconcileTransactionMutation.mutate,
    reconcileTransactionAsync: reconcileTransactionMutation.mutateAsync,
    deleteTransaction: deleteTransactionMutation.mutate,
    deleteTransactionAsync: deleteTransactionMutation.mutateAsync,
    updateTransaction: updateTransactionMutation.mutate,
    updateTransactionAsync: updateTransactionMutation.mutateAsync,

    // Convenience functions for common patterns
    onDelete: deleteTransactionMutation.mutate, // Common prop name used by components
    onUpdate: updateTransactionMutation.mutate, // Common prop name used by components

    // Mutation states
    isAdding: addTransactionMutation.isPending,
    isReconciling: reconcileTransactionMutation.isPending,
    isDeleting: deleteTransactionMutation.isPending,
    isUpdating: updateTransactionMutation.isPending,

    // Utility functions
    getTransactionById,
    getTransactionsByEnvelope,
    getTransactionsByCategory,

    // Date range helpers
    getThisMonth,
    getLastMonth,
    getLast30Days,

    // Query controls
    refetch: transactionsQuery.refetch,
    invalidate: () => queryClient.invalidateQueries({ queryKey: queryKeys.transactions }),
  };
};

export { useTransactions };
export default useTransactions;
