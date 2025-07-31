import { QueryClient, MutationCache, QueryCache } from "@tanstack/react-query";
import { Sentry } from "./sentry";

// Optimized TanStack Query configuration
const budgetQueryClient = new QueryClient({
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
    },
    mutations: {
      // Mutation defaults
      retry: 1,
      networkMode: "offlineFirst",

      // Global error handling
      onError: (error, variables, context) => {
        console.error("Mutation error:", error);
        Sentry.captureException(error, {
          tags: { type: "mutation_error" },
          extra: { variables, context },
        });
      },
    },
  },

  // Query cache with global error handling
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error("Query error:", error);
      Sentry.captureException(error, {
        tags: { type: "query_error" },
        extra: { queryKey: query.queryKey },
      });
    },
    onSuccess: (data, query) => {
      // Optional: Track successful queries
      if (process.env.NODE_ENV === "development") {
        console.log("Query success:", query.queryKey);
      }
    },
  }),

  // Mutation cache with global handling
  mutationCache: new MutationCache({
    onSuccess: (data, variables, context, mutation) => {
      // Optimistic updates and invalidations
      const queryClient = mutation.options.queryClient || budgetQueryClient;

      // Invalidate related queries based on mutation type
      if (mutation.options.mutationKey?.[0]) {
        const entityType = mutation.options.mutationKey[0];
        queryClient.invalidateQueries({ queryKey: [entityType] });

        // Invalidate dashboard and analytics queries
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["analytics"] });
      }
    },
  }),
});

// Query key factories for consistency
export const queryKeys = {
  // Budget data
  budget: ["budget"],
  budgetData: () => [...queryKeys.budget, "data"],

  // Envelopes
  envelopes: ["envelopes"],
  envelopesList: () => [...queryKeys.envelopes, "list"],
  envelopeById: (id) => [...queryKeys.envelopes, "detail", id],
  envelopesByCategory: (category) => [...queryKeys.envelopes, "category", category],

  // Transactions
  transactions: ["transactions"],
  transactionsList: (filters) => [...queryKeys.transactions, "list", filters],
  transactionById: (id) => [...queryKeys.transactions, "detail", id],
  transactionsByDateRange: (start, end) => [...queryKeys.transactions, "dateRange", start, end],

  // Bills
  bills: ["bills"],
  billsList: () => [...queryKeys.bills, "list"],
  billById: (id) => [...queryKeys.bills, "detail", id],

  // Analytics
  analytics: ["analytics"],
  analyticsSpending: (period) => [...queryKeys.analytics, "spending", period],
  analyticsTrends: (period) => [...queryKeys.analytics, "trends", period],

  // Dashboard
  dashboard: ["dashboard"],
  dashboardSummary: () => [...queryKeys.dashboard, "summary"],
};

// Prefetch utilities
export const prefetchHelpers = {
  prefetchEnvelopes: () => {
    return budgetQueryClient.prefetchQuery({
      queryKey: queryKeys.envelopesList(),
      queryFn: () => {
        /* fetch envelopes */
      },
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  },

  prefetchDashboard: () => {
    return budgetQueryClient.prefetchQuery({
      queryKey: queryKeys.dashboardSummary(),
      queryFn: () => {
        /* fetch dashboard data */
      },
      staleTime: 30 * 1000, // 30 seconds
    });
  },
};

// Optimistic update helpers
export const optimisticHelpers = {
  updateEnvelope: (envelopeId, updates) => {
    budgetQueryClient.setQueryData(queryKeys.envelopeById(envelopeId), (old) => ({
      ...old,
      ...updates,
    }));

    // Also update the list if it exists
    budgetQueryClient.setQueryData(queryKeys.envelopesList(), (old) => {
      if (!old) return old;
      return old.map((envelope) =>
        envelope.id === envelopeId ? { ...envelope, ...updates } : envelope
      );
    });
  },

  addEnvelope: (newEnvelope) => {
    budgetQueryClient.setQueryData(queryKeys.envelopesList(), (old) => {
      if (!old) return [newEnvelope];
      return [...old, newEnvelope];
    });
  },

  removeEnvelope: (envelopeId) => {
    budgetQueryClient.setQueryData(queryKeys.envelopesList(), (old) => {
      if (!old) return old;
      return old.filter((envelope) => envelope.id !== envelopeId);
    });

    // Remove individual query
    budgetQueryClient.removeQueries({
      queryKey: queryKeys.envelopeById(envelopeId),
    });
  },
};

// Background sync utilities
export const backgroundSync = {
  syncAllData: async () => {
    const queries = [
      queryKeys.envelopesList(),
      queryKeys.transactionsList(),
      queryKeys.billsList(),
      queryKeys.dashboardSummary(),
    ];

    return Promise.allSettled(
      queries.map((queryKey) => budgetQueryClient.refetchQueries({ queryKey }))
    );
  },

  invalidateStaleData: () => {
    // Mark all data as stale to trigger background refetch
    budgetQueryClient.invalidateQueries();
  },
};

export default budgetQueryClient;
