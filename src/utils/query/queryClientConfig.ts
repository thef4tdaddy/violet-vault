// Query Client Configuration - TanStack Query setup with Dexie integration
import { QueryClient, MutationCache, QueryCache, type Query } from "@tanstack/react-query";
import * as Sentry from "@sentry/react";
// Import H safely to avoid circular dependency issues
import logger from "../common/logger";

interface ErrorWithStatus {
  status?: number;
}

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
        retry: (failureCount: number, error: unknown) => {
          // Don't retry auth errors
          const errorWithStatus = error as ErrorWithStatus;
          if (errorWithStatus?.status === 401 || errorWithStatus?.status === 403) {
            return false;
          }
          return failureCount < 3;
        },
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),

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
        onError: (error: unknown, variables: unknown, context: unknown) => {
          logger.error("Mutation error", error, {
            variables,
            context,
            source: "queryClient",
          });
          // Error logging is handled by logger, no need for direct H usage
        },
      },
    },

    // Query cache with global error handling and performance tracking
    queryCache: new QueryCache({
      onError: (error: Error, query: Query<unknown, unknown, unknown, readonly unknown[]>) => {
        logger.error("Query error", error, {
          queryKey: query.queryKey,
          source: "queryClient",
        });
        // Error logging is handled by logger, no need for direct H usage
      },
      onSuccess: (data: unknown, query: Query<unknown, unknown, unknown, readonly unknown[]>) => {
        // Track query performance with Sentry spans
        // Use dataUpdateCount as an indicator of fresh data (count increases on each fetch)
        const queryState = query.state;

        // Only track queries that have been fetched (not from cache)
        // We use the query hash and a simple check to avoid tracking cached results
        if (queryState.dataUpdateCount > 0) {
          const queryKeyString = Array.isArray(query.queryKey)
            ? query.queryKey.join(":")
            : String(query.queryKey);

          // Estimate fetch time based on fetchStatus changes
          // Since we can't directly measure, we track that the query completed
          // The actual timing will be captured by Sentry's automatic tracing
          Sentry.startSpan(
            {
              op: "db.query",
              name: `Query: ${queryKeyString}`,
            },
            (span) => {
              span.setAttribute("query_key", queryKeyString);
              span.setAttribute("data_update_count", queryState.dataUpdateCount);
              span.setAttribute(
                "result_type",
                Array.isArray(data) ? "array" : typeof data === "object" ? "object" : typeof data
              );

              if (Array.isArray(data)) {
                span.setAttribute("result_count", data.length);
              }

              span.setStatus({ code: 1 }); // OK status
            }
          );
        }

        // Optional: Track successful queries in development
        if (import.meta.env.DEV) {
          logger.debug("Query success", {
            queryKey: query.queryKey,
            source: "queryClient",
          });
        }
      },
    }),

    // Mutation cache with global handling and automatic invalidations
    mutationCache: new MutationCache({
      onSuccess: (_data: unknown, _variables: unknown, _context: unknown, mutation) => {
        // Get the query client instance
        const mutationQueryClient = queryClient;

        // Invalidate related queries based on mutation type
        if (mutation.options.mutationKey?.[0]) {
          const entityType = mutation.options.mutationKey[0] as string;

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
      onError: (error: unknown, variables: unknown, context: unknown, mutation) => {
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
  clearEntityCache: (entityType: string) => {
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
      fetchingQueries: queries.filter((q) => q.state.fetchStatus === "fetching").length,
      errorQueries: queries.filter((q) => q.state.error).length,
    };
  },

  /**
   * Prefetch with automatic error handling
   */
  safePrefetch: async <T>(
    queryKey: unknown[],
    queryFn: () => Promise<T>,
    options: Record<string, unknown> = {}
  ): Promise<void | null> => {
    try {
      return await queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: 60 * 1000, // 1 minute default
        ...options,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn("Safe prefetch failed", {
        queryKey,
        error: errorMessage,
        source: "queryClientUtils",
      });
      return null;
    }
  },

  /**
   * Batch invalidate multiple query keys
   */
  batchInvalidate: (queryKeys: unknown[][]) => {
    queryKeys.forEach((queryKey) => {
      queryClient.invalidateQueries({ queryKey });
    });
    logger.info(`Batch invalidated ${queryKeys.length} query patterns`);
  },

  /**
   * Check if query data exists in cache
   */
  hasQueryData: (queryKey: unknown[]) => {
    return queryClient.getQueryData(queryKey) !== undefined;
  },

  /**
   * Set query data with automatic error handling
   */
  safeSetQueryData: (
    queryKey: unknown[],
    data: unknown,
    options: Record<string, unknown> = {}
  ): boolean => {
    try {
      queryClient.setQueryData(queryKey, data, options);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn("Safe set query data failed", {
        queryKey,
        error: errorMessage,
        source: "queryClientUtils",
      });
      return false;
    }
  },
};

// Export the configured query client as default
export default queryClient;
