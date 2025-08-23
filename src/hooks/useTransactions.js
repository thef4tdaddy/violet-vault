import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useBudgetStore } from "../stores/uiStore";
import { queryKeys, optimisticHelpers } from "../utils/queryClient";
import { budgetDb, getBudgetMetadata, setBudgetMetadata } from "../db/budgetDb";
import logger from "../utils/logger.js";

// Helper to trigger sync for transaction changes
const triggerTransactionSync = (changeType) => {
  if (typeof window !== "undefined" && window.cloudSyncService) {
    window.cloudSyncService.triggerSyncForCriticalChange(
      `transaction_${changeType}`,
    );
  }
};

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

  // Get Zustand store for UI state only (transactions are managed by TanStack Query → Dexie)
  const {
    transactions: zustandTransactions,
    allTransactions: zustandAllTransactions,
  } = useBudgetStore();

  // TanStack Query function - hydrates from Dexie, Dexie syncs with Firebase
  const queryFunction = async () => {
    logger.debug("TanStack Query: Fetching transactions from Dexie", {
      source: "useTransactions",
    });

    try {
      let transactions = [];

      // Always fetch from Dexie (single source of truth for local data)
      transactions = await budgetDb.transactions
        .orderBy("date")
        .reverse()
        .toArray();

      logger.debug("TanStack Query: Loaded from Dexie", {
        count: transactions.length,
        source: "useTransactions",
      });

      // If Dexie is empty and we have Zustand data, seed Dexie
      const zustandData =
        zustandAllTransactions?.length > 0
          ? zustandAllTransactions
          : zustandTransactions;
      if (transactions.length === 0 && zustandData && zustandData.length > 0) {
        logger.debug("TanStack Query: Seeding Dexie from Zustand", {
          zustandDataLength: zustandData.length,
          source: "useTransactions",
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
      logger.error("TanStack Query: Dexie fetch failed", error, {
        source: "useTransactions",
      });
      // Emergency fallback only when Dexie completely fails
      const zustandData =
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
        source: "useTransactions",
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
    };

    const handleInvalidateAll = () => {
      logger.debug("Invalidating all transaction queries", {
        source: "useTransactions",
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

  // Helper function to update balances when transactions are added/removed
  const updateBalancesForTransaction = async (
    transaction,
    isRemoving = false,
  ) => {
    const { envelopeId, amount, type } = transaction;
    const multiplier = isRemoving ? -1 : 1; // Reverse the effect when removing

    try {
      // Get current metadata
      const metadata = await getBudgetMetadata();
      const currentActualBalance = metadata?.actualBalance || 0;
      const currentUnassignedCash = metadata?.unassignedCash || 0;

      // Calculate actual balance change (income increases, expenses decrease)
      let actualBalanceChange = 0;
      if (type === "income") {
        actualBalanceChange = amount * multiplier;
      } else if (type === "expense") {
        actualBalanceChange = -Math.abs(amount) * multiplier;
      }

      // Update envelope balance or unassigned cash
      if (envelopeId === "unassigned" || !envelopeId) {
        // Update unassigned cash
        const unassignedChange =
          type === "income"
            ? amount * multiplier
            : -Math.abs(amount) * multiplier;

        await setBudgetMetadata({
          actualBalance: currentActualBalance + actualBalanceChange,
          unassignedCash: currentUnassignedCash + unassignedChange,
        });
      } else {
        // Update specific envelope balance
        const envelope = await budgetDb.envelopes.get(envelopeId);
        if (envelope) {
          const balanceChange =
            type === "income"
              ? amount * multiplier
              : -Math.abs(amount) * multiplier;

          const newBalance = (envelope.currentBalance || 0) + balanceChange;
          await budgetDb.envelopes.update(envelopeId, {
            currentBalance: newBalance,
            updatedAt: new Date().toISOString(),
          });
        }

        // Still update actual balance
        await setBudgetMetadata({
          actualBalance: currentActualBalance + actualBalanceChange,
        });
      }

      logger.debug("Balance updated for transaction", {
        transactionId: transaction.id,
        envelopeId,
        amount,
        type,
        actualBalanceChange,
        isRemoving,
      });
    } catch (error) {
      logger.error("Failed to update balances for transaction", error, {
        transactionId: transaction.id,
        envelopeId,
        amount,
        type,
      });
    }
  };

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

      // Apply optimistic update and save to Dexie
      await optimisticHelpers.addTransaction(newTransaction);

      // Save to Dexie (single source of truth for transactions)
      await budgetDb.transactions.put(newTransaction);

      // Update balances based on transaction
      await updateBalancesForTransaction(newTransaction);

      return newTransaction;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
      // Trigger immediate sync for transaction addition
      triggerTransactionSync("added");
    },
    onError: (error) => {
      logger.error("Failed to add transaction", error, {
        source: "addTransactionMutation",
      });
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

      // Apply optimistic update and save to Dexie
      await optimisticHelpers.addTransaction(reconciledTransaction);

      // Save to Dexie (single source of truth for transactions)
      await budgetDb.transactions.put(reconciledTransaction);

      return reconciledTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      // Trigger immediate sync for transaction reconciliation
      triggerTransactionSync("reconciled");
    },
    onError: (error) => {
      logger.error("Failed to reconcile transaction", error, {
        source: "reconcileTransactionMutation",
      });
    },
  });

  // Delete transaction mutation
  const deleteTransactionMutation = useMutation({
    mutationKey: ["transactions", "delete"],
    mutationFn: async (transactionId) => {
      // Get transaction data before deleting (needed for balance updates)
      const transaction = await budgetDb.transactions.get(transactionId);

      // Apply optimistic update using helper
      await optimisticHelpers.removeTransaction(transactionId);

      // Delete from Dexie (single source of truth for transactions)
      await budgetDb.transactions.delete(transactionId);

      // Reverse the balance changes
      if (transaction) {
        await updateBalancesForTransaction(transaction, true);
      }

      return transactionId;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
      // Trigger immediate sync for transaction deletion
      triggerTransactionSync("deleted");
    },
    onError: (error, transactionId) => {
      logger.error("Failed to delete transaction", error, {
        source: "deleteTransactionMutation",
      });
      // Rollback optimistic update
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
    },
  });

  // Update transaction mutation
  const updateTransactionMutation = useMutation({
    mutationKey: ["transactions", "update"],
    mutationFn: async ({ id, updates }) => {
      const updatedTransaction = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Apply optimistic update using helper
      await optimisticHelpers.updateTransaction(id, updatedTransaction);

      // Update in Dexie (single source of truth for transactions)
      await budgetDb.transactions.update(id, updatedTransaction);

      return { id, updates: updatedTransaction };
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
      // Trigger immediate sync for transaction update
      triggerTransactionSync("updated");
    },
    onError: (error) => {
      logger.error("Failed to update transaction", error, {
        source: "updateTransactionMutation",
      });
      // Rollback optimistic update
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
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
    invalidate: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions }),
  };
};

export { useTransactions };
export default useTransactions;
