import { QueryClient } from "@tanstack/react-query";
import { budgetDb } from "@/db/budgetDb";
import { budgetDatabaseService } from "@/services/budgetDatabaseService";
import { queryKeys } from "./queryKeys";
import type { FilterParams } from "./queryKeys";
import logger from "@/utils/common/logger";
import type { DateRange } from "@/db/types";

interface EnvelopeFilters {
  category?: string;
  includeArchived?: boolean;
}

interface TransactionOptions {
  limit?: number;
}

interface BillOptions {
  category?: string;
  isPaid?: boolean;
  daysAhead?: number;
}

interface GoalOptions {
  isCompleted?: boolean;
  category?: string;
}

/**
 * Enhanced prefetch utilities with Dexie fallback for offline support.
 * These helpers intelligently use cached data when available.
 */
export const prefetchHelpers = {
  /**
   * Prefetch envelopes with optional filtering
   */
  prefetchEnvelopes: async (queryClient: QueryClient, filters: EnvelopeFilters = {}) => {
    try {
      return await queryClient.prefetchQuery({
        queryKey: queryKeys.envelopesList(filters as FilterParams),
        queryFn: async () => {
          // Try to get from database service first
          const envelopes = await budgetDatabaseService.getEnvelopes({
            category: filters.category,
            includeArchived: filters.includeArchived,
            useCache: true,
          });

          if (envelopes && envelopes.length > 0) {
            return envelopes;
          }

          // Fallback to direct database query
          const cached = await budgetDb.getEnvelopesByCategory(
            filters.category ?? undefined,
            filters.includeArchived
          );

          if (cached && cached.length > 0) {
            return cached;
          }

          throw new Error("No cached envelope data available");
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
      });
    } catch (error) {
      logger.warn("Failed to prefetch envelopes", {
        error: (error as Error).message,
        filters,
        source: "prefetchHelpers",
      });
      return null;
    }
  },

  /**
   * Prefetch transactions for date range
   */
  prefetchTransactions: async (
    queryClient: QueryClient,
    dateRange: DateRange,
    options: TransactionOptions = {}
  ) => {
    try {
      return await queryClient.prefetchQuery({
        queryKey: queryKeys.transactionsByDateRange(dateRange.start, dateRange.end),
        queryFn: async () => {
          // Use database service for consistent querying
          const transactions = await budgetDatabaseService.getTransactions({
            dateRange,
            limit: options.limit || 1000,
            useCache: true,
          });

          if (transactions && transactions.length > 0) {
            return transactions;
          }

          // Fallback to direct database query
          const cached = await budgetDb.getTransactionsByDateRange(dateRange.start, dateRange.end);

          if (cached && cached.length > 0) {
            return cached.slice(0, options.limit || 1000);
          }

          throw new Error("No cached transaction data available");
        },
        staleTime: 60 * 1000, // 1 minute
      });
    } catch (error) {
      logger.warn("Failed to prefetch transactions", {
        error: (error as Error).message,
        dateRange,
        source: "prefetchHelpers",
      });
      return null;
    }
  },

  /**
   * Prefetch bills with filtering options
   */
  prefetchBills: async (queryClient: QueryClient, options: BillOptions = {}) => {
    try {
      const { category, isPaid, daysAhead = 30 } = options;

      return await queryClient.prefetchQuery({
        queryKey: queryKeys.billsList(options as FilterParams),
        queryFn: async () => {
          // Use database service for bill queries
          const bills = await budgetDatabaseService.getBills({
            category,
            isPaid,
            daysAhead,
          });

          if (bills && bills.length >= 0) {
            return bills;
          }

          throw new Error("No cached bill data available");
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    } catch (error) {
      logger.warn("Failed to prefetch bills", {
        error: (error as Error).message,
        options,
        source: "prefetchHelpers",
      });
      return null;
    }
  },

  /**
   * Prefetch savings goals
   */
  prefetchSavingsGoals: async (queryClient: QueryClient, options: GoalOptions = {}) => {
    try {
      return await queryClient.prefetchQuery({
        queryKey: queryKeys.savingsGoalsList(),
        queryFn: async () => {
          // Use database service for savings goals
          const goals = await budgetDatabaseService.getSavingsGoals({
            isCompleted: options.isCompleted,
            category: options.category,
          });

          if (goals && goals.length >= 0) {
            return goals;
          }

          throw new Error("No cached savings goals data available");
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
      });
    } catch (error) {
      logger.warn("Failed to prefetch savings goals", {
        error: (error as Error).message,
        options,
        source: "prefetchHelpers",
      });
      return null;
    }
  },

  /**
   * Prefetch dashboard summary data
   */
  prefetchDashboard: async (queryClient: QueryClient) => {
    try {
      return await queryClient.prefetchQuery({
        queryKey: queryKeys.dashboardSummary(),
        queryFn: async () => {
          // Try to get from database cache
          const cached = await budgetDb.getCachedValue("dashboard_summary");
          if (cached) {
            return cached;
          }

          // Generate dashboard data from current database state
          const [envelopes, recentTransactions, upcomingBills, metadata] = await Promise.all([
            budgetDatabaseService.getEnvelopes({ useCache: false }),
            budgetDatabaseService.getTransactions({
              limit: 10,
              useCache: false,
            }),
            budgetDatabaseService.getBills({
              isPaid: false,
              daysAhead: 7,
            }),
            budgetDatabaseService.getBudgetMetadata(),
          ]);

          const dashboardData = {
            totalEnvelopes: (envelopes as unknown[]).length,
            activeEnvelopes: (envelopes as Array<{ archived?: boolean }>).filter((e) => !e.archived)
              .length,
            recentTransactionCount: (recentTransactions as unknown[]).length,
            upcomingBillsCount: (upcomingBills as unknown[]).length,
            unassignedCash: (metadata as { unassignedCash?: number })?.unassignedCash || 0,
            actualBalance: (metadata as { actualBalance?: number })?.actualBalance || 0,
            lastUpdated: Date.now(),
          };

          // Cache the result
          await budgetDb.setCachedValue(
            "dashboard_summary",
            dashboardData,
            60 * 1000 // 1 minute TTL
          );

          return dashboardData;
        },
        staleTime: 30 * 1000, // 30 seconds
      });
    } catch (error) {
      logger.warn("Failed to prefetch dashboard", {
        error: (error as Error).message,
        source: "prefetchHelpers",
      });
      return null;
    }
  },

  /**
   * Prefetch analytics data for a period
   */
  prefetchAnalytics: async (queryClient: QueryClient, period = "month") => {
    try {
      return await queryClient.prefetchQuery({
        queryKey: queryKeys.analyticsReport("spending", { period }),
        queryFn: async () => {
          // Calculate date range based on period
          const now = new Date();
          let startDate = new Date();

          switch (period) {
            case "week":
              startDate.setDate(now.getDate() - 7);
              break;
            case "month":
              startDate.setMonth(now.getMonth() - 1);
              break;
            case "year":
              startDate.setFullYear(now.getFullYear() - 1);
              break;
            default:
              startDate.setMonth(now.getMonth() - 1);
          }

          const analyticsData = await budgetDatabaseService.getAnalyticsData(
            { start: startDate, end: now },
            { includeTransfers: false, useCache: true }
          );

          if (analyticsData) {
            return analyticsData;
          }

          throw new Error("No analytics data available");
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    } catch (error) {
      logger.warn("Failed to prefetch analytics", {
        error: (error as Error).message,
        period,
        source: "prefetchHelpers",
      });
      return null;
    }
  },

  /**
   * Batch prefetch common dashboard queries
   */
  prefetchDashboardBundle: async (queryClient: QueryClient) => {
    try {
      const prefetchPromises = [
        prefetchHelpers.prefetchDashboard(queryClient),
        prefetchHelpers.prefetchEnvelopes(queryClient, {
          includeArchived: false,
        }),
        prefetchHelpers.prefetchBills(queryClient, {
          isPaid: false,
          daysAhead: 7,
        }),
        prefetchHelpers.prefetchTransactions(
          queryClient,
          {
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            end: new Date(),
          },
          { limit: 20 }
        ),
      ];

      const results = await Promise.allSettled(prefetchPromises);
      const successful = results.filter((r) => r.status === "fulfilled").length;

      logger.info(
        `Dashboard bundle prefetch completed: ${successful}/${results.length} successful`
      );
      return results;
    } catch (error) {
      logger.error("Failed to prefetch dashboard bundle", error);
      return null;
    }
  },
};

type RouteKey = "/" | "/envelopes" | "/transactions" | "/bills" | "/analytics" | "/goals";
type EntityKey =
  | "dashboard"
  | "envelopes"
  | "transactions"
  | "bills"
  | "analytics"
  | "savingsGoals";

/**
 * Smart prefetch based on user navigation patterns
 */
export const smartPrefetch = async (
  queryClient: QueryClient,
  currentRoute: string,
  _userHistory: string[] = []
) => {
  const prefetchMap: Record<RouteKey, EntityKey[]> = {
    "/": ["dashboard", "envelopes", "bills"],
    "/envelopes": ["envelopes", "transactions"],
    "/transactions": ["transactions", "analytics"],
    "/bills": ["bills", "dashboard"],
    "/analytics": ["analytics", "transactions"],
    "/goals": ["savingsGoals", "dashboard"],
  };

  const entityPrefetchMap: Record<EntityKey, () => Promise<void | null>> = {
    dashboard: () => prefetchHelpers.prefetchDashboard(queryClient),
    envelopes: () => prefetchHelpers.prefetchEnvelopes(queryClient),
    transactions: () =>
      prefetchHelpers.prefetchTransactions(queryClient, {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(),
      }),
    bills: () => prefetchHelpers.prefetchBills(queryClient),
    analytics: () => prefetchHelpers.prefetchAnalytics(queryClient),
    savingsGoals: () => prefetchHelpers.prefetchSavingsGoals(queryClient),
  };

  const toPrefetch = prefetchMap[currentRoute as RouteKey] || [];

  try {
    const prefetchPromises = toPrefetch
      .map((entity) => entityPrefetchMap[entity])
      .filter(Boolean)
      .map((fn) => fn());

    await Promise.allSettled(prefetchPromises);
    logger.debug(`Smart prefetch completed for route: ${currentRoute}`, {
      entities: toPrefetch,
    });
  } catch (error) {
    logger.warn("Smart prefetch failed", {
      currentRoute,
      error: (error as Error).message,
    });
  }
};
