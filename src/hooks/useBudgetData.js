import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBudgetStore } from "../stores/budgetStore";
import {
  queryKeys,
  optimisticHelpers,
  prefetchHelpers,
} from "../utils/queryClient";
import { budgetDb } from "../db/budgetDb";

/**
 * Unified budget data hook combining TanStack Query, Zustand, and Dexie
 * This hook provides a single interface for all budget data operations with:
 * - Smart caching via TanStack Query
 * - Real-time state via Zustand
 * - Offline persistence via Dexie
 * - Optimistic updates for better UX
 */
const useBudgetData = () => {
  const queryClient = useQueryClient();

  // Get Zustand store for real-time state and mutations
  const budgetStore = useBudgetStore();
  const {
    // Data
    envelopes,
    transactions,
    bills,
    savingsGoals,
    paycheckHistory,
    unassignedCash,
    actualBalance,

    // Mutations
    addEnvelope: zustandAddEnvelope,
    updateEnvelope: zustandUpdateEnvelope,
    deleteEnvelope: zustandDeleteEnvelope,
    addTransaction: zustandAddTransaction,
    processPaycheck: zustandProcessPaycheck,
    reconcileTransaction: zustandReconcileTransaction,
  } = budgetStore;

  // Query functions that use Zustand as data source with Dexie fallback
  const queryFunctions = {
    envelopes: async () => {
      // Try Zustand first (real-time data)
      if (envelopes && envelopes.length > 0) {
        return envelopes;
      }

      // Fallback to Dexie for offline support
      const cachedEnvelopes = await budgetDb.envelopes.toArray();
      if (cachedEnvelopes.length > 0) {
        return cachedEnvelopes;
      }

      // Return empty array as final fallback
      return [];
    },

    transactions: async (filters = {}) => {
      // Try Zustand first
      let result = transactions || [];

      // Apply filters if provided
      if (filters.dateRange) {
        const { start, end } = filters.dateRange;
        result = result.filter((t) => {
          const transactionDate = new Date(t.date);
          return transactionDate >= start && transactionDate <= end;
        });
      }

      if (filters.envelopeId) {
        result = result.filter((t) => t.envelopeId === filters.envelopeId);
      }

      if (result.length > 0) {
        return result;
      }

      // Fallback to Dexie
      if (filters.dateRange) {
        const { start, end } = filters.dateRange;
        return await budgetDb.getTransactionsByDateRange(start, end);
      }

      const cachedTransactions = await budgetDb.transactions
        .orderBy("date")
        .reverse()
        .toArray();
      return cachedTransactions;
    },

    bills: async () => {
      if (bills && bills.length > 0) {
        return bills;
      }

      const cachedBills = await budgetDb.bills.toArray();
      return cachedBills;
    },

    savingsGoals: async () => {
      if (savingsGoals && savingsGoals.length > 0) {
        return savingsGoals;
      }

      // Note: Need to add savingsGoals to Dexie schema in future enhancement
      return [];
    },

    paycheckHistory: async () => {
      if (paycheckHistory && paycheckHistory.length > 0) {
        return paycheckHistory;
      }

      // Note: Need to add paycheckHistory to Dexie schema in future enhancement
      return [];
    },

    dashboardSummary: async () => {
      const summary = {
        totalEnvelopeBalance:
          envelopes?.reduce((sum, env) => sum + env.currentBalance, 0) || 0,
        totalSavingsBalance:
          savingsGoals?.reduce((sum, goal) => sum + goal.currentAmount, 0) || 0,
        unassignedCash: unassignedCash || 0,
        actualBalance: actualBalance || 0,
        recentTransactions: transactions?.slice(0, 10) || [],
        upcomingBills:
          bills?.filter((bill) => {
            const dueDate = new Date(bill.dueDate);
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
            return dueDate <= thirtyDaysFromNow;
          }) || [],
      };

      // Calculate difference for balance reconciliation
      summary.virtualBalance =
        summary.totalEnvelopeBalance +
        summary.totalSavingsBalance +
        summary.unassignedCash;
      summary.difference = summary.actualBalance - summary.virtualBalance;
      summary.isBalanced = Math.abs(summary.difference) < 0.01;

      return summary;
    },
  };

  // TanStack Query hooks for cached data
  const envelopesQuery = useQuery({
    queryKey: queryKeys.envelopesList(),
    queryFn: queryFunctions.envelopes,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  });

  const transactionsQuery = useQuery({
    queryKey: queryKeys.transactionsList(),
    queryFn: () => queryFunctions.transactions(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: true,
  });

  const billsQuery = useQuery({
    queryKey: queryKeys.billsList(),
    queryFn: queryFunctions.bills,
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: true,
  });

  const dashboardQuery = useQuery({
    queryKey: queryKeys.dashboardSummary(),
    queryFn: queryFunctions.dashboardSummary,
    staleTime: 30 * 1000, // 30 seconds
    enabled: true,
  });

  // Enhanced mutations with optimistic updates and Dexie persistence
  const addEnvelopeMutation = useMutation({
    mutationKey: ["envelopes", "add"],
    mutationFn: async (newEnvelope) => {
      // Call Zustand mutation
      zustandAddEnvelope(newEnvelope);

      // Persist to Dexie
      await optimisticHelpers.addEnvelope(newEnvelope);

      return newEnvelope;
    },
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error) => {
      console.error("Failed to add envelope:", error);
      // TODO: Implement rollback logic
    },
  });

  const updateEnvelopeMutation = useMutation({
    mutationKey: ["envelopes", "update"],
    mutationFn: async ({ envelopeId, updates }) => {
      // Call Zustand mutation
      zustandUpdateEnvelope(envelopeId, updates);

      // Apply optimistic update with Dexie persistence
      await optimisticHelpers.updateEnvelope(envelopeId, updates);

      return { envelopeId, updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });

  const deleteEnvelopeMutation = useMutation({
    mutationKey: ["envelopes", "delete"],
    mutationFn: async (envelopeId) => {
      // Call Zustand mutation
      zustandDeleteEnvelope(envelopeId);

      // Remove from cache and Dexie
      await optimisticHelpers.removeEnvelope(envelopeId);

      return envelopeId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });

  const addTransactionMutation = useMutation({
    mutationKey: ["transactions", "add"],
    mutationFn: async (newTransaction) => {
      // Call Zustand mutation
      zustandAddTransaction(newTransaction);

      // Apply optimistic update with Dexie persistence
      await optimisticHelpers.addTransaction(newTransaction);

      return newTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });

  const processPaycheckMutation = useMutation({
    mutationKey: ["paychecks", "process"],
    mutationFn: async (paycheckData) => {
      // Call Zustand mutation
      const result = zustandProcessPaycheck(paycheckData);

      // Persist paycheck history to Dexie
      // TODO: Add paycheck table to Dexie schema

      return result;
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.paychecks });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });

  // Utility functions
  const prefetchData = {
    envelopes: (filters) => prefetchHelpers.prefetchEnvelopes(filters),
    dashboard: () => prefetchHelpers.prefetchDashboard(),
    transactions: (dateRange) =>
      prefetchHelpers.prefetchTransactions(dateRange),
  };

  const syncStatus = {
    isOnline: navigator.onLine,
    lastSyncTime: localStorage.getItem("lastSyncTime"),
    hasPendingChanges: false, // TODO: Implement pending changes tracking
  };

  // Force sync function
  const forceSync = async () => {
    try {
      await queryClient.refetchQueries();
      localStorage.setItem("lastSyncTime", new Date().toISOString());
      console.log("Force sync completed");
    } catch (error) {
      console.error("Force sync failed:", error);
      throw error;
    }
  };

  // Clear cache function
  const clearCache = async () => {
    try {
      await queryClient.clear();
      await budgetDb.cache.clear();
      console.log("Cache cleared successfully");
    } catch (error) {
      console.error("Failed to clear cache:", error);
      throw error;
    }
  };

  return {
    // Data (from queries with Zustand fallback)
    envelopes: envelopesQuery.data || envelopes || [],
    transactions: transactionsQuery.data || transactions || [],
    bills: billsQuery.data || bills || [],
    savingsGoals: savingsGoals || [],
    paycheckHistory: paycheckHistory || [],
    dashboardSummary: dashboardQuery.data,

    // Computed values
    unassignedCash,
    actualBalance,

    // Loading states
    isLoading:
      envelopesQuery.isLoading ||
      transactionsQuery.isLoading ||
      billsQuery.isLoading,
    isFetching:
      envelopesQuery.isFetching ||
      transactionsQuery.isFetching ||
      billsQuery.isFetching,
    isOffline: !navigator.onLine,

    // Individual query states for fine-grained loading
    envelopesLoading: envelopesQuery.isLoading,
    transactionsLoading: transactionsQuery.isLoading,
    billsLoading: billsQuery.isLoading,
    dashboardLoading: dashboardQuery.isLoading,

    // Mutations
    addEnvelope: addEnvelopeMutation.mutate,
    updateEnvelope: updateEnvelopeMutation.mutate,
    deleteEnvelope: deleteEnvelopeMutation.mutate,
    addTransaction: addTransactionMutation.mutate,
    processPaycheck: processPaycheckMutation.mutate,
    reconcileTransaction: zustandReconcileTransaction, // Direct Zustand call for now

    // Mutation states
    isAddingEnvelope: addEnvelopeMutation.isPending,
    isUpdatingEnvelope: updateEnvelopeMutation.isPending,
    isDeletingEnvelope: deleteEnvelopeMutation.isPending,
    isAddingTransaction: addTransactionMutation.isPending,
    isProcessingPaycheck: processPaycheckMutation.isPending,

    // Sync utilities
    syncStatus,
    forceSync,
    clearCache,
    prefetchData,

    // Error states
    envelopesError: envelopesQuery.error,
    transactionsError: transactionsQuery.error,
    billsError: billsQuery.error,
    dashboardError: dashboardQuery.error,
  };
};

export default useBudgetData;
