import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

  // Smart query function with filtering and analytics
  const queryFunction = async () => {
    let transactions = [];

    console.log("useTransactions queryFunction debug:", {
      zustandTransactionsLength: zustandTransactions?.length || 0,
      hasDateRange: !!dateRange,
    });

    // Try Zustand first for real-time data - check both arrays
    if (zustandAllTransactions && zustandAllTransactions.length > 0) {
      transactions = [...zustandAllTransactions];
      console.log("Using Zustand allTransactions:", transactions.length);
    } else if (zustandTransactions && zustandTransactions.length > 0) {
      transactions = [...zustandTransactions];
      console.log("Using Zustand transactions:", transactions.length);
    } else {
      // Fallback to Dexie for offline support
      if (dateRange) {
        transactions = await budgetDb.getTransactionsByDateRange(
          dateRange.start,
          dateRange.end,
        );
      } else {
        transactions = await budgetDb.transactions
          .orderBy("date")
          .reverse()
          .toArray();
      }
      console.log("Using Dexie transactions:", transactions.length);
    }

    // Apply filters
    let filteredTransactions = transactions;

    if (dateRange) {
      const { start, end } = dateRange;
      filteredTransactions = filteredTransactions.filter((t) => {
        const transactionDate = new Date(t.date);
        return transactionDate >= start && transactionDate <= end;
      });
    }

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
        filteredTransactions = filteredTransactions.filter((t) => t.amount > 0);
      } else if (type === "expense") {
        filteredTransactions = filteredTransactions.filter((t) => t.amount < 0);
      } else if (type === "transfer") {
        filteredTransactions = filteredTransactions.filter(
          (t) => t.type === "transfer",
        );
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
    if (limit > 0) {
      filteredTransactions = filteredTransactions.slice(0, limit);
    }

    return filteredTransactions;
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
    staleTime: 60 * 1000, // 1 minute
    enabled: true,
  });

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

  // Analytics computation
  const transactions = transactionsQuery.data || [];

  const analytics = {
    totalIncome: transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: Math.abs(
      transactions
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0),
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

  const getTransactionsByEnvelope = (envId) =>
    transactions.filter((t) => t.envelopeId === envId);

  const getTransactionsByCategory = (cat) =>
    transactions.filter((t) => t.category === cat);

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

    // Mutation states
    isAdding: addTransactionMutation.isPending,
    isReconciling: reconcileTransactionMutation.isPending,

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
    invalidate: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions }),
  };
};

export { useTransactions };
export default useTransactions;
