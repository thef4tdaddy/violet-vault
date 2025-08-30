import { QueryClient, MutationCache, QueryCache } from "@tanstack/react-query";
import { H } from "./highlight.js";
import { budgetDb } from "../../db/budgetDb.js";
import logger from "./logger.js";

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
        logger.error("Mutation error", error, {
          variables,
          context,
          source: "queryClient",
        });
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
      logger.error("Query error", error, {
        queryKey: query.queryKey,
        source: "queryClient",
      });
      H.consumeError(error, {
        metadata: { queryKey: query.queryKey },
        tags: { type: "query_error" },
      });
    },
    onSuccess: (data, query) => {
      // Optional: Track successful queries
      if (process.env.NODE_ENV === "development") {
        logger.debug("Query success", {
          queryKey: query.queryKey,
          source: "queryClient",
        });
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

  // Budget metadata (unassigned cash, actual balance, etc.)
  budgetMetadata: ["budgetMetadata"],
  unassignedCash: () => [...queryKeys.budgetMetadata, "unassignedCash"],
  actualBalance: () => [...queryKeys.budgetMetadata, "actualBalance"],

  // Envelopes
  envelopes: ["envelopes"],
  envelopesList: (filters = {}) => [...queryKeys.envelopes, "list", filters],
  envelopeById: (id) => [...queryKeys.envelopes, "detail", id],
  envelopesByCategory: (category) => [
    ...queryKeys.envelopes,
    "category",
    category,
  ],
  envelopeBalances: () => [...queryKeys.envelopes, "balances"],

  // Transactions
  transactions: ["transactions"],
  transactionsList: (filters = {}) => [
    ...queryKeys.transactions,
    "list",
    filters,
  ],
  transactionById: (id) => [...queryKeys.transactions, "detail", id],
  transactionsByDateRange: (start, end) => [
    ...queryKeys.transactions,
    "dateRange",
    start,
    end,
  ],
  transactionsByEnvelope: (envelopeId) => [
    ...queryKeys.transactions,
    "envelope",
    envelopeId,
  ],

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
  analyticsCategories: (period) => [
    ...queryKeys.analytics,
    "categories",
    period,
  ],
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

  // Budget History (version control)
  budgetHistory: ["budgetHistory"],
  budgetCommits: (options = {}) => [
    ...queryKeys.budgetHistory,
    "commits",
    options,
  ],
  budgetCommit: (hash) => [...queryKeys.budgetHistory, "commit", hash],
  budgetChanges: (commitHash) => [
    ...queryKeys.budgetHistory,
    "changes",
    commitHash,
  ],
  budgetHistoryStats: () => [...queryKeys.budgetHistory, "stats"],
};

// Enhanced prefetch utilities with Dexie fallback
export const prefetchHelpers = {
  prefetchEnvelopes: async (filters = {}) => {
    try {
      return await queryClient.prefetchQuery({
        queryKey: queryKeys.envelopesList(filters),
        queryFn: async () => {
          // Try to get from Dexie first for offline support
          const cached = await budgetDb.getEnvelopesByCategory(
            filters.category,
          );
          if (cached && cached.length > 0) {
            return cached;
          }
          // Fallback to network or Zustand store
          throw new Error("No cached data available");
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
      });
    } catch (error) {
      logger.warn("Failed to prefetch envelopes", {
        error: error.message,
        source: "prefetchHelpers",
      });
    }
  },

  prefetchTransactions: async (dateRange) => {
    try {
      return await queryClient.prefetchQuery({
        queryKey: queryKeys.transactionsByDateRange(
          dateRange.start,
          dateRange.end,
        ),
        queryFn: async () => {
          const cached = await budgetDb.getTransactionsByDateRange(
            dateRange.start,
            dateRange.end,
          );
          if (cached && cached.length > 0) {
            return cached;
          }
          throw new Error("No cached data available");
        },
        staleTime: 60 * 1000, // 1 minute
      });
    } catch (error) {
      logger.warn("Failed to prefetch transactions", {
        error: error.message,
        source: "prefetchHelpers",
      });
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
      logger.warn("Failed to prefetch dashboard", {
        error: error.message,
        source: "prefetchHelpers",
      });
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
        envelope.id === envelopeId ? { ...envelope, ...updates } : envelope,
      );
    });

    // Persist to Dexie for offline access
    try {
      // Fix for #540: Use update to preserve existing envelope data
      await budgetDb.envelopes.update(envelopeId, updates);
    } catch (error) {
      logger.warn("Failed to persist envelope update to Dexie", {
        error: error.message,
        envelopeId,
        source: "optimisticHelpers",
      });
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
      logger.warn("Failed to persist new envelope to Dexie", {
        error: error.message,
        envelopeId: newEnvelope.id,
        source: "optimisticHelpers",
      });
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
      logger.warn("Failed to remove envelope from Dexie", {
        error: error.message,
        envelopeId,
        source: "optimisticHelpers",
      });
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
        },
      );
    }

    // Persist to Dexie (use put to handle duplicate IDs gracefully)
    try {
      await budgetDb.transactions.put(newTransaction);
    } catch (error) {
      logger.warn("Failed to persist transaction to Dexie", {
        error: error.message,
        transactionId: newTransaction.id,
        source: "optimisticHelpers",
      });
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
      logger.warn("Failed to remove transaction from Dexie", {
        error: error.message,
        transactionId,
        source: "optimisticHelpers",
      });
    }
  },

  updateTransaction: async (transactionId, updates) => {
    // Update TanStack Query cache
    queryClient.setQueryData(queryKeys.transactionsList(), (old) => {
      if (!old) return old;
      return old.map((transaction) =>
        transaction.id === transactionId
          ? { ...transaction, ...updates }
          : transaction,
      );
    });

    // Update in Dexie
    try {
      // Fix for #540: Use update to preserve existing transaction data
      await budgetDb.transactions.update(transactionId, updates);
    } catch (error) {
      logger.warn("Failed to update transaction in Dexie", {
        error: error.message,
        transactionId,
        source: "optimisticHelpers",
      });
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
      logger.warn("Failed to persist bill to Dexie", {
        error: error.message,
        billId: newBill.id,
        source: "optimisticHelpers",
      });
    }
  },

  updateBill: async (billId, updates) => {
    queryClient.setQueryData(queryKeys.billsList(), (old) => {
      if (!old) return old;
      return old.map((bill) =>
        bill.id === billId ? { ...bill, ...updates } : bill,
      );
    });

    try {
      // Fix for #540: Use update instead of put to preserve existing bill data
      await budgetDb.bills.update(billId, updates);
    } catch (error) {
      logger.warn("Failed to persist bill update to Dexie", {
        error: error.message,
        billId,
        source: "optimisticHelpers",
      });
    }
  },

  removeBill: async (billId) => {
    // Get the bill before deletion for debugging
    let billToDelete = null;
    try {
      const currentBills =
        queryClient.getQueryData(queryKeys.billsList()) || [];
      billToDelete = currentBills.find((bill) => bill.id === billId);
      logger.info(
        "Deleting bill - associated envelope should remain unchanged",
        {
          billId,
          billName: billToDelete?.name || billToDelete?.provider,
          associatedEnvelopeId: billToDelete?.envelopeId,
          source: "optimisticHelpers",
        },
      );
    } catch (debugError) {
      logger.warn("Could not get bill info for debugging", {
        billId,
        error: debugError.message,
      });
    }

    queryClient.setQueryData(queryKeys.billsList(), (old) => {
      if (!old) return old;
      return old.filter((bill) => bill.id !== billId);
    });

    try {
      await budgetDb.bills.delete(billId);
      logger.info("Bill deleted successfully - envelope should be unaffected", {
        billId,
      });
    } catch (error) {
      logger.warn("Failed to remove bill from Dexie", {
        error: error.message,
        billId,
        source: "optimisticHelpers",
      });
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
      logger.warn("Failed to persist savings goal to Dexie", {
        error: error.message,
        goalId: newGoal.id,
        source: "optimisticHelpers",
      });
    }
  },

  updateSavingsGoal: async (goalId, updates) => {
    queryClient.setQueryData(queryKeys.savingsGoalsList(), (old) => {
      if (!old) return old;
      return old.map((goal) =>
        goal.id === goalId ? { ...goal, ...updates } : goal,
      );
    });

    try {
      // Fix for #540: Use update to preserve existing savings goal data
      await budgetDb.savingsGoals.update(goalId, updates);
    } catch (error) {
      logger.warn("Failed to persist savings goal update to Dexie", {
        error: error.message,
        goalId,
        source: "optimisticHelpers",
      });
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
      logger.warn("Failed to remove savings goal from Dexie", {
        error: error.message,
        goalId,
        source: "optimisticHelpers",
      });
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
      logger.warn("Failed to persist debt to Dexie", {
        error: error.message,
        debtId: newDebt.id,
        source: "optimisticHelpers",
      });
    }
  },

  updateDebt: async (debtId, updates) => {
    queryClient.setQueryData(queryKeys.debtsList(), (old) => {
      if (!old) return old;
      return old.map((debt) =>
        debt.id === debtId ? { ...debt, ...updates } : debt,
      );
    });

    try {
      // Fix for #540: Use update to preserve existing debt data
      await budgetDb.debts.update(debtId, updates);
    } catch (error) {
      logger.warn("Failed to persist debt update to Dexie", {
        error: error.message,
        debtId,
        source: "optimisticHelpers",
      });
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
      logger.warn("Failed to remove debt from Dexie", {
        error: error.message,
        debtId,
        source: "optimisticHelpers",
      });
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
      queries.map((queryKey) => queryClient.refetchQueries({ queryKey })),
    );

    // Log sync results in development
    if (process.env.NODE_ENV === "development") {
      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;
      logger.info(
        `Background sync completed: ${successful} successful, ${failed} failed`,
        {
          successful,
          failed,
          source: "backgroundSync",
        },
      );
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
      logger.info("Successfully synced query cache with Dexie", {
        source: "backgroundSync",
      });
    } catch (error) {
      logger.error("Failed to sync cache with Dexie", error, {
        source: "backgroundSync",
      });
    }
  },

  restoreFromDexie: async () => {
    try {
      // Restore cache from Dexie on app startup
      const cachedEntries = await budgetDb.cache.toArray();
      const restorePromises = cachedEntries.map(async (entry) => {
        try {
          // Only attempt to restore TanStack Query cache entries
          // Skip simple cache entries (like lastSyncTime, etc.)
          let queryKey;
          try {
            queryKey = JSON.parse(entry.key);
          } catch {
            // If it's not valid JSON, it's likely a simple cache entry, not a query key
            // Skip these entries as they're not TanStack Query cache
            return;
          }

          // Only restore if it's an array (valid TanStack Query key format)
          if (Array.isArray(queryKey)) {
            queryClient.setQueryData(queryKey, entry.value);
          }
        } catch (restoreError) {
          logger.warn("Failed to restore cached query", {
            key: entry.key,
            error: restoreError.message,
            source: "backgroundSync",
          });
        }
      });

      await Promise.all(restorePromises);
      logger.info("Successfully restored query cache from Dexie", {
        source: "backgroundSync",
      });
    } catch (error) {
      logger.error("Failed to restore cache from Dexie", error, {
        source: "backgroundSync",
      });
    }
  },
};

// Network state management
export const networkManager = {
  onOnline: () => {
    // Trigger background sync when coming online
    backgroundSync.syncAllData();
    logger.info("Network online - triggering background sync", {
      source: "networkManager",
    });
  },

  onOffline: () => {
    // Save current state to Dexie when going offline
    backgroundSync.syncWithDexie();
    logger.info("Network offline - persisting cache to Dexie", {
      source: "networkManager",
    });
  },
};

// Initialize network listeners
if (typeof window !== "undefined") {
  window.addEventListener("online", networkManager.onOnline);
  window.addEventListener("offline", networkManager.onOffline);

  // Initial cache restore on page load
  backgroundSync.restoreFromDexie();
}

export { queryClient };
export default queryClient;
