// Query Client Configuration - TanStack Query setup with Dexie integration
import { QueryClient, MutationCache, QueryCache } from "@tanstack/react-query";
import { H } from "../common/highlight";
import logger from "../common/logger";

/**
 * Enhanced TanStack Query configuration with optimized caching,
 * error handling, and offline support
 */
export const createQueryClient = () => {
  return new QueryClient({
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
        // Optional: Track successful queries in development
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
        // Get the query client instance
        const mutationQueryClient = mutation.options.queryClient || queryClient;

        // Invalidate related queries based on mutation type
        if (mutation.options.mutationKey?.[0]) {
          const entityType = mutation.options.mutationKey[0];

          // Invalidate specific entity queries
          mutationQueryClient.invalidateQueries({ queryKey: [entityType] });

          // Invalidate dashboard and analytics queries
          mutationQueryClient.invalidateQueries({ queryKey: ["dashboard"] });
          mutationQueryClient.invalidateQueries({ queryKey: ["analytics"] });

          // Invalidate budget metadata if applicable
          if (["transactions", "envelopes", "bills"].includes(entityType)) {
            mutationQueryClient.invalidateQueries({
              queryKey: ["budgetMetadata"],
            });
          }
        }
      },
      onError: (error, variables, context, mutation) => {
        logger.error("Mutation cache error", error, {
          mutationKey: mutation.options.mutationKey,
          variables,
          context,
          source: "mutationCache",
        });
      },
    }),
  });
};

// Create the default query client instance
const queryClient = createQueryClient();

// Enhanced query client utilities
export const queryClientUtils = {
  /**
   * Clear all cached data
   */
  clearAllCache: () => {
    queryClient.clear();
    logger.info("All query cache cleared");
  },

  /**
   * Clear cache for specific entity type
   */
  clearEntityCache: (entityType) => {
    queryClient.invalidateQueries({ queryKey: [entityType] });
    logger.info(`Cache cleared for entity: ${entityType}`);
  },

  /**
   * Get cache statistics
   */
  getCacheStats: () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();

    return {
      totalQueries: queries.length,
      activeQueries: queries.filter((q) => q.isActive()).length,
      staleQueries: queries.filter((q) => q.isStale()).length,
      fetchingQueries: queries.filter((q) => q.isFetching()).length,
      errorQueries: queries.filter((q) => q.state.error).length,
    };
  },

  /**
   * Prefetch with automatic error handling
   */
  safePrefetch: async (queryKey, queryFn, options = {}) => {
    try {
      return await queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: 60 * 1000, // 1 minute default
        ...options,
      });
    } catch (error) {
      logger.warn("Safe prefetch failed", {
        queryKey,
        error: error.message,
        source: "queryClientUtils",
      });
      return null;
    }
  },

  /**
   * Batch invalidate multiple query keys
   */
  batchInvalidate: (queryKeys) => {
    queryKeys.forEach((queryKey) => {
      queryClient.invalidateQueries({ queryKey });
    });
    logger.info(`Batch invalidated ${queryKeys.length} query patterns`);
  },

  /**
   * Check if query data exists in cache
   */
  hasQueryData: (queryKey) => {
    return queryClient.getQueryData(queryKey) !== undefined;
  },

  /**
   * Set query data with automatic error handling
   */
  safeSetQueryData: (queryKey, data, options = {}) => {
    try {
      queryClient.setQueryData(queryKey, data, options);
      return true;
    } catch (error) {
      logger.warn("Safe set query data failed", {
        queryKey,
        error: error.message,
        source: "queryClientUtils",
      });
      return false;
    }
  },
};

// Export the configured query client as default
export default queryClient;
