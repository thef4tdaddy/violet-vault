import { QueryClient, MutationCache, QueryCache } from "@tanstack/react-query";
import { H } from "./highlight";
import { budgetDb } from "../db/budgetDb";

// Enhanced TanStack Query configuration with Dexie integration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Performance optimizations
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
      retry: (failureCount, error) => {
        // Don't retry auth errors
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Background refetching
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: "always",

      // Network mode for offline support
      networkMode: "offlineFirst",

      // Remove persister - handle persistence in individual hooks instead
    },
    mutations: {
      // Mutation defaults
      retry: 1,
      networkMode: "offlineFirst",

      // Global error handling
      onError: (error, variables, context) => {
        console.error("Mutation error:", error);
        H.consumeError(error, {
          metadata: { variables, context },
          tags: { type: "mutation_error" },
        });
      },
    },
  },

  // Query cache with global error handling
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error("Query error:", error);
      H.consumeError(error, {
        metadata: { queryKey: query.queryKey },
        tags: { type: "query_error" },
      });
    },
    onSuccess: (data, query) => {
      // Optional: Track successful queries
      if (process.env.NODE_ENV === "development") {
        console.log("Query success:", query.queryKey);
      }
    },
  }),

  // Mutation cache with global handling and automatic invalidations
  mutationCache: new MutationCache({
    onSuccess: (data, variables, context, mutation) => {
      // Optimistic updates and invalidations
      const mutationQueryClient = mutation.options.queryClient || queryClient;

      // Invalidate related queries based on mutation type
      if (mutation.options.mutationKey?.[0]) {
        const entityType = mutation.options.mutationKey[0];
        mutationQueryClient.invalidateQueries({ queryKey: [entityType] });

        // Invalidate dashboard and analytics queries
        mutationQueryClient.invalidateQueries({ queryKey: ["dashboard"] });
        mutationQueryClient.invalidateQueries({ queryKey: ["analytics"] });
      }
    },
  }),
});

// Comprehensive query key factories for consistency
export const queryKeys = {
  // Budget data
  budget: ["budget"],
  budgetData: () => [...queryKeys.budget, "data"],
  budgetSummary: () => [...queryKeys.budget, "summary"],

  // Envelopes
  envelopes: ["envelopes"],
  envelopesList: (filters = {}) => [...queryKeys.envelopes, "list", filters],
  envelopeById: (id) => [...queryKeys.envelopes, "detail", id],
  envelopesByCategory: (category) => [...queryKeys.envelopes, "category", category],
  envelopeBalances: () => [...queryKeys.envelopes, "balances"],

  // Transactions
  transactions: ["transactions"],
  transactionsList: (filters = {}) => [...queryKeys.transactions, "list", filters],
  transactionById: (id) => [...queryKeys.transactions, "detail", id],
  transactionsByDateRange: (start, end) => [...queryKeys.transactions, "dateRange", start, end],
  transactionsByEnvelope: (envelopeId) => [...queryKeys.transactions, "envelope", envelopeId],

  // Bills
  bills: ["bills"],
  billsList: (filters = {}) => [...queryKeys.bills, "list", filters],
  billById: (id) => [...queryKeys.bills, "detail", id],
  upcomingBills: (days = 30) => [...queryKeys.bills, "upcoming", days],

  // Savings Goals
  savingsGoals: ["savingsGoals"],
  savingsGoalsList: () => [...queryKeys.savingsGoals, "list"],
  savingsGoalById: (id) => [...queryKeys.savingsGoals, "detail", id],

  // Analytics
  analytics: ["analytics"],
  analyticsSpending: (period) => [...queryKeys.analytics, "spending", period],
  analyticsTrends: (period) => [...queryKeys.analytics, "trends", period],
  analyticsCategories: (period) => [...queryKeys.analytics, "categories", period],
  analyticsBalance: () => [...queryKeys.analytics, "balance"],

  // Dashboard
  dashboard: ["dashboard"],
  dashboardSummary: () => [...queryKeys.dashboard, "summary"],
  dashboardOverview: () => [...queryKeys.dashboard, "overview"],

  // Debt tracking
  debts: ["debts"],
  debtsList: () => [...queryKeys.debts, "list"],
  debtById: (id) => [...queryKeys.debts, "detail", id],
  debtPaymentPlan: (id) => [...queryKeys.debts, "paymentPlan", id],

  // Paycheck history
  paychecks: ["paychecks"],
  paycheckHistory: () => [...queryKeys.paychecks, "history"],
  paycheckPredictions: () => [...queryKeys.paychecks, "predictions"],
};

// Enhanced prefetch utilities with Dexie fallback
export const prefetchHelpers = {
  prefetchEnvelopes: async (filters = {}) => {
    try {
      return await queryClient.prefetchQuery({
        queryKey: queryKeys.envelopesList(filters),
        queryFn: async () => {
          // Try to get from Dexie first for offline support
          const cached = await budgetDb.getEnvelopesByCategory(filters.category);
          if (cached && cached.length > 0) {
            return cached;
          }
          // Fallback to network or Zustand store
          throw new Error("No cached data available");
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
      });
    } catch (error) {
      console.warn("Failed to prefetch envelopes:", error);
    }
  },

  prefetchTransactions: async (dateRange) => {
    try {
      return await queryClient.prefetchQuery({
        queryKey: queryKeys.transactionsByDateRange(dateRange.start, dateRange.end),
        queryFn: async () => {
          const cached = await budgetDb.getTransactionsByDateRange(dateRange.start, dateRange.end);
          if (cached && cached.length > 0) {
            return cached;
          }
          throw new Error("No cached data available");
        },
        staleTime: 60 * 1000, // 1 minute
      });
    } catch (error) {
      console.warn("Failed to prefetch transactions:", error);
    }
  },

  prefetchDashboard: async () => {
    try {
      return await queryClient.prefetchQuery({
        queryKey: queryKeys.dashboardSummary(),
        queryFn: async () => {
          const cached = await budgetDb.getCachedValue("dashboard_summary");
          if (cached) {
            return cached;
          }
          throw new Error("No cached dashboard data");
        },
        staleTime: 30 * 1000, // 30 seconds
      });
    } catch (error) {
      console.warn("Failed to prefetch dashboard:", error);
    }
  },
};

// Enhanced optimistic update helpers with Dexie persistence
export const optimisticHelpers = {
  updateEnvelope: async (envelopeId, updates) => {
    // Update TanStack Query cache
    queryClient.setQueryData(queryKeys.envelopeById(envelopeId), (old) => ({
      ...old,
      ...updates,
    }));

    // Update list cache
    queryClient.setQueryData(queryKeys.envelopesList(), (old) => {
      if (!old) return old;
      return old.map((envelope) =>
        envelope.id === envelopeId ? { ...envelope, ...updates } : envelope
      );
    });

    // Persist to Dexie for offline access
    try {
      await budgetDb.envelopes.put({ id: envelopeId, ...updates });
    } catch (error) {
      console.warn("Failed to persist envelope update to Dexie:", error);
    }
  },

  addEnvelope: async (newEnvelope) => {
    // Update TanStack Query cache
    queryClient.setQueryData(queryKeys.envelopesList(), (old) => {
      if (!old) return [newEnvelope];
      return [...old, newEnvelope];
    });

    // Persist to Dexie
    try {
      await budgetDb.envelopes.add(newEnvelope);
    } catch (error) {
      console.warn("Failed to persist new envelope to Dexie:", error);
    }
  },

  removeEnvelope: async (envelopeId) => {
    // Update TanStack Query cache
    queryClient.setQueryData(queryKeys.envelopesList(), (old) => {
      if (!old) return old;
      return old.filter((envelope) => envelope.id !== envelopeId);
    });

    // Remove individual query
    queryClient.removeQueries({
      queryKey: queryKeys.envelopeById(envelopeId),
    });

    // Remove from Dexie
    try {
      await budgetDb.envelopes.delete(envelopeId);
    } catch (error) {
      console.warn("Failed to remove envelope from Dexie:", error);
    }
  },

  addTransaction: async (newTransaction) => {
    // Update relevant caches
    queryClient.setQueryData(queryKeys.transactionsList(), (old) => {
      if (!old) return [newTransaction];
      return [newTransaction, ...old];
    });

    // Update envelope-specific cache
    if (newTransaction.envelopeId) {
      queryClient.setQueryData(
        queryKeys.transactionsByEnvelope(newTransaction.envelopeId),
        (old) => {
          if (!old) return [newTransaction];
          return [newTransaction, ...old];
        }
      );
    }

    // Persist to Dexie
    try {
      await budgetDb.transactions.add(newTransaction);
    } catch (error) {
      console.warn("Failed to persist transaction to Dexie:", error);
    }
  },

  removeTransaction: async (transactionId) => {
    // Update TanStack Query cache
    queryClient.setQueryData(queryKeys.transactionsList(), (old) => {
      if (!old) return old;
      return old.filter((transaction) => transaction.id !== transactionId);
    });

    // Remove from Dexie
    try {
      await budgetDb.transactions.delete(transactionId);
    } catch (error) {
      console.warn("Failed to remove transaction from Dexie:", error);
    }
  },

  updateTransaction: async (transactionId, updates) => {
    // Update TanStack Query cache
    queryClient.setQueryData(queryKeys.transactionsList(), (old) => {
      if (!old) return old;
      return old.map((transaction) =>
        transaction.id === transactionId ? { ...transaction, ...updates } : transaction
      );
    });

    // Update in Dexie
    try {
      await budgetDb.transactions.put({ id: transactionId, ...updates });
    } catch (error) {
      console.warn("Failed to update transaction in Dexie:", error);
    }
  },

  // Bill optimistic helpers
  addBill: async (newBill) => {
    queryClient.setQueryData(queryKeys.billsList(), (old) => {
      if (!old) return [newBill];
      return [...old, newBill];
    });

    try {
      await budgetDb.bills.add(newBill);
    } catch (error) {
      console.warn("Failed to persist bill to Dexie:", error);
    }
  },

  updateBill: async (billId, updates) => {
    queryClient.setQueryData(queryKeys.billsList(), (old) => {
      if (!old) return old;
      return old.map((bill) => (bill.id === billId ? { ...bill, ...updates } : bill));
    });

    try {
      await budgetDb.bills.put({ id: billId, ...updates });
    } catch (error) {
      console.warn("Failed to persist bill update to Dexie:", error);
    }
  },

  removeBill: async (billId) => {
    queryClient.setQueryData(queryKeys.billsList(), (old) => {
      if (!old) return old;
      return old.filter((bill) => bill.id !== billId);
    });

    try {
      await budgetDb.bills.delete(billId);
    } catch (error) {
      console.warn("Failed to remove bill from Dexie:", error);
    }
  },

  // Savings goal optimistic helpers
  addSavingsGoal: async (newGoal) => {
    queryClient.setQueryData(queryKeys.savingsGoalsList(), (old) => {
      if (!old) return [newGoal];
      return [...old, newGoal];
    });

    try {
      await budgetDb.savingsGoals.add(newGoal);
    } catch (error) {
      console.warn("Failed to persist savings goal to Dexie:", error);
    }
  },

  updateSavingsGoal: async (goalId, updates) => {
    queryClient.setQueryData(queryKeys.savingsGoalsList(), (old) => {
      if (!old) return old;
      return old.map((goal) => (goal.id === goalId ? { ...goal, ...updates } : goal));
    });

    try {
      await budgetDb.savingsGoals.put({ id: goalId, ...updates });
    } catch (error) {
      console.warn("Failed to persist savings goal update to Dexie:", error);
    }
  },

  removeSavingsGoal: async (goalId) => {
    queryClient.setQueryData(queryKeys.savingsGoalsList(), (old) => {
      if (!old) return old;
      return old.filter((goal) => goal.id !== goalId);
    });

    try {
      await budgetDb.savingsGoals.delete(goalId);
    } catch (error) {
      console.warn("Failed to remove savings goal from Dexie:", error);
    }
  },

  // Debt optimistic helpers
  addDebt: async (newDebt) => {
    queryClient.setQueryData(queryKeys.debtsList(), (old) => {
      if (!old) return [newDebt];
      return [...old, newDebt];
    });

    try {
      await budgetDb.debts.add(newDebt);
    } catch (error) {
      console.warn("Failed to persist debt to Dexie:", error);
    }
  },

  updateDebt: async (debtId, updates) => {
    queryClient.setQueryData(queryKeys.debtsList(), (old) => {
      if (!old) return old;
      return old.map((debt) => (debt.id === debtId ? { ...debt, ...updates } : debt));
    });

    try {
      await budgetDb.debts.put({ id: debtId, ...updates });
    } catch (error) {
      console.warn("Failed to persist debt update to Dexie:", error);
    }
  },

  removeDebt: async (debtId) => {
    queryClient.setQueryData(queryKeys.debtsList(), (old) => {
      if (!old) return old;
      return old.filter((debt) => debt.id !== debtId);
    });

    try {
      await budgetDb.debts.delete(debtId);
    } catch (error) {
      console.warn("Failed to remove debt from Dexie:", error);
    }
  },
};

// Enhanced background sync utilities
export const backgroundSync = {
  syncAllData: async () => {
    const queries = [
      queryKeys.envelopesList(),
      queryKeys.transactionsList(),
      queryKeys.billsList(),
      queryKeys.dashboardSummary(),
      queryKeys.savingsGoalsList(),
      queryKeys.paycheckHistory(),
    ];

    const results = await Promise.allSettled(
      queries.map((queryKey) => queryClient.refetchQueries({ queryKey }))
    );

    // Log sync results in development
    if (process.env.NODE_ENV === "development") {
      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;
      console.log(`Background sync completed: ${successful} successful, ${failed} failed`);
    }

    return results;
  },

  invalidateStaleData: () => {
    // Mark all data as stale to trigger background refetch
    queryClient.invalidateQueries();
  },

  syncWithDexie: async () => {
    try {
      // Sync TanStack Query cache with Dexie for persistence
      const queries = queryClient.getQueryCache().getAll();
      const syncPromises = queries.map(async (query) => {
        if (query.state.data) {
          const cacheKey = JSON.stringify(query.queryKey);
          await budgetDb.setCachedValue(cacheKey, query.state.data);
        }
      });

      await Promise.all(syncPromises);
      console.log("Successfully synced query cache with Dexie");
    } catch (error) {
      console.error("Failed to sync cache with Dexie:", error);
    }
  },

  restoreFromDexie: async () => {
    try {
      // Restore cache from Dexie on app startup
      const cachedEntries = await budgetDb.cache.toArray();
      const restorePromises = cachedEntries.map(async (entry) => {
        try {
          const queryKey = JSON.parse(entry.key);
          queryClient.setQueryData(queryKey, entry.value);
        } catch (parseError) {
          console.warn("Failed to parse cached query key:", entry.key, parseError);
        }
      });

      await Promise.all(restorePromises);
      console.log("Successfully restored query cache from Dexie");
    } catch (error) {
      console.error("Failed to restore cache from Dexie:", error);
    }
  },
};

// Network state management
export const networkManager = {
  onOnline: () => {
    // Trigger background sync when coming online
    backgroundSync.syncAllData();
    console.log("Network online - triggering background sync");
  },

  onOffline: () => {
    // Save current state to Dexie when going offline
    backgroundSync.syncWithDexie();
    console.log("Network offline - persisting cache to Dexie");
  },
};

// Initialize network listeners
if (typeof window !== "undefined") {
  window.addEventListener("online", networkManager.onOnline);
  window.addEventListener("offline", networkManager.onOffline);

  // Initial cache restore on page load
  backgroundSync.restoreFromDexie();
}

export default queryClient;
