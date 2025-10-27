// Prefetch Helpers - Utilities for pre-loading data with Dexie fallback
import { budgetDb } from "@/db/budgetDb";
import { budgetDatabaseService } from "@/services/budgetDatabaseService";
import { queryKeys } from "./queryKeys";
import logger from "@/utils/common/logger";

interface EnvelopeFilters {
  category?: string;
  includeArchived?: boolean;
  useCache?: boolean;
}

interface TransactionFilters {
  limit?: number;
  envelopeId?: string;
  startDate?: Date;
  endDate?: Date;
  useCache?: boolean;
}

interface BillFilters {
  category?: string;
  isPaid?: boolean;
  daysAhead?: number;
  useCache?: boolean;
}

interface SavingsGoalFilters {
  isCompleted?: boolean;
  category?: string;
  useCache?: boolean;
}

/**
 * Enhanced prefetch utilities with Dexie fallback for offline support.
 * These helpers intelligently use cached data when available.
 */
export const prefetchHelpers = {
  /**
   * Prefetch envelopes with optional filtering
   */
  prefetchEnvelopes: async (queryClient: any, filters: EnvelopeFilters = {}) => {
    try {
      return await queryClient.prefetchQuery({
        queryKey: queryKeys.envelopesList(filters),
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
            filters.category,
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
        error: error.message,
        filters,
        source: "prefetchHelpers",
      });
      return null;
    }
  },

  /**
   * Prefetch transactions for date range
   */
  prefetchTransactions: async (queryClient: any, dateRange?: { start: Date; end: Date }, options: TransactionFilters = {}) => {
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
        error: error.message,
        dateRange,
        source: "prefetchHelpers",
      });
      return null;
    }
  },

  /**
   * Prefetch bills with filtering options
   */
  prefetchBills: async (queryClient: any, options: BillFilters = {}) => {
    try {
      const { category, isPaid, daysAhead = 30 } = options;

      return await queryClient.prefetchQuery({
        queryKey: queryKeys.billsList(options),
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
        error: error.message,
        options,
        source: "prefetchHelpers",
      });
      return null;
    }
  },

  /**
   * Prefetch savings goals
   */
  prefetchSavingsGoals: async (queryClient: any, options: SavingsGoalFilters = {}) => {
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
        error: error.message,
        options,
        source: "prefetchHelpers",
      });
      return null;
    }
  },

  /**
   * Prefetch dashboard summary data
   */
  prefetchDashboard: async (queryClient: any) => {
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
            totalEnvelopes: envelopes.length,
            activeEnvelopes: envelopes.filter((e: any) => !e.archived).length,
            recentTransactionCount: recentTransactions.length,
            upcomingBillsCount: upcomingBills.length,
            unassignedCash: (metadata as any)?.unassignedCash || 0,
            actualBalance: (metadata as any)?.actualBalance || 0,
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
        error: error.message,
        source: "prefetchHelpers",
      });
      return null;
    }
  },

  /**
   * Prefetch analytics data for a period
   */
  prefetchAnalytics: async (queryClient: any, period: string = "month") => {
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
        error: error.message,
        period,
        source: "prefetchHelpers",
      });
      return null;
    }
  },

  /**
   * Batch prefetch common dashboard queries
   */
  prefetchDashboardBundle: async (queryClient: any) => {
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

  /**
   * Smart prefetch based on user navigation patterns
   */
  smartPrefetch: async (queryClient, currentRoute, _userHistory = []) => {
    const prefetchMap = {
      "/": ["dashboard", "envelopes", "bills"],
      "/envelopes": ["envelopes", "transactions"],
      "/transactions": ["transactions", "analytics"],
      "/bills": ["bills", "dashboard"],
      "/analytics": ["analytics", "transactions"],
      "/goals": ["savingsGoals", "dashboard"],
    };

    const entityPrefetchMap = {
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

    const toPrefetch = prefetchMap[currentRoute] || [];

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
        error: error.message,
      });
    }
  },
};
