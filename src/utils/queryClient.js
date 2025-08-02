import { QueryClient, MutationCache, QueryCache } from "@tanstack/react-query";
import { H } from "./highlight";

// Optimized TanStack Query configuration
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

  // Mutation cache with global handling
  mutationCache: new MutationCache({
    onSuccess: (data, variables, context, mutation) => {
      // Optimistic updates and invalidations
      const queryClient = mutation.options.queryClient || queryClient;

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

export default queryClient;
