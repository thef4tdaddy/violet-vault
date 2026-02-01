/**
 * Allocation Analytics Query Hook
 * Created for Issue: Allocation Analytics Dashboard - Visual Trends & Heatmaps
 * 
 * TanStack Query hook for fetching and caching allocation analytics data.
 * Manages server state for the analytics dashboard.
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { AllocationAnalyticsService } from '@/services/analytics/allocationAnalyticsService';
import { useAuth } from '@/contexts/AuthContext';
import logger from '@/utils/core/common/logger';
import type {
  AllocationAnalytics,
  AllocationAnalyticsParams,
  AllocationAnalyticsFilters,
} from '@/types/allocationAnalytics';

/**
 * Hook options for useAllocationAnalytics
 */
export interface UseAllocationAnalyticsOptions {
  startDate: string;
  endDate: string;
  includeHeatmap?: boolean;
  includeTrends?: boolean;
  includeDistribution?: boolean;
  includeStrategyAnalysis?: boolean;
  includeHealthScore?: boolean;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

/**
 * Query key factory for allocation analytics
 */
export const allocationAnalyticsKeys = {
  all: ['allocationAnalytics'] as const,
  lists: () => [...allocationAnalyticsKeys.all, 'list'] as const,
  list: (filters: AllocationAnalyticsFilters) =>
    [...allocationAnalyticsKeys.lists(), filters] as const,
  details: () => [...allocationAnalyticsKeys.all, 'detail'] as const,
  detail: (userId: string, startDate: string, endDate: string) =>
    [...allocationAnalyticsKeys.details(), userId, startDate, endDate] as const,
};

/**
 * Main hook for fetching allocation analytics
 * 
 * @param options - Query options including date range and sections to include
 * @returns Query result with analytics data
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useAllocationAnalytics({
 *   startDate: '2026-01-01',
 *   endDate: '2026-01-31',
 *   includeHeatmap: true,
 *   includeTrends: true,
 * });
 * 
 * if (isLoading) return <Loading />;
 * if (error) return <Error error={error} />;
 * if (data) return <Dashboard analytics={data} />;
 * ```
 */
export function useAllocationAnalytics(
  options: UseAllocationAnalyticsOptions
): UseQueryResult<AllocationAnalytics, Error> {
  const { user } = useAuth();

  return useQuery({
    queryKey: allocationAnalyticsKeys.detail(
      user?.uid || 'anonymous',
      options.startDate,
      options.endDate
    ),
    queryFn: async (): Promise<AllocationAnalytics> => {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      logger.info('Fetching allocation analytics', {
        userId: user.uid,
        dateRange: `${options.startDate} to ${options.endDate}`,
      });

      const params: AllocationAnalyticsParams = {
        userId: user.uid,
        startDate: options.startDate,
        endDate: options.endDate,
        includeHeatmap: options.includeHeatmap,
        includeTrends: options.includeTrends,
        includeDistribution: options.includeDistribution,
        includeStrategyAnalysis: options.includeStrategyAnalysis,
        includeHealthScore: options.includeHealthScore,
      };

      const analytics = await AllocationAnalyticsService.getAnalytics(params);

      logger.info('Analytics fetched successfully', {
        totalPaychecks: analytics.heatmap.totalAllocations,
        healthScore: analytics.healthScore.totalScore,
      });

      return analytics;
    },
    enabled: options.enabled !== false && !!user?.uid,
    staleTime: options.staleTime || 5 * 60 * 1000, // 5 minutes default
    gcTime: options.cacheTime || 10 * 60 * 1000, // 10 minutes default (formerly cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook for fetching only heatmap data (optimized)
 * 
 * @param startDate - Start date (ISO format)
 * @param endDate - End date (ISO format)
 * @returns Query result with heatmap data only
 */
export function useAllocationHeatmap(startDate: string, endDate: string) {
  return useAllocationAnalytics({
    startDate,
    endDate,
    includeHeatmap: true,
    includeTrends: false,
    includeDistribution: false,
    includeStrategyAnalysis: false,
    includeHealthScore: false,
  });
}

/**
 * Hook for fetching only trend data (optimized)
 * 
 * @param startDate - Start date (ISO format)
 * @param endDate - End date (ISO format)
 * @returns Query result with trend data only
 */
export function useAllocationTrends(startDate: string, endDate: string) {
  return useAllocationAnalytics({
    startDate,
    endDate,
    includeHeatmap: false,
    includeTrends: true,
    includeDistribution: false,
    includeStrategyAnalysis: false,
    includeHealthScore: false,
  });
}

/**
 * Hook for fetching only distribution data (optimized)
 * 
 * @param startDate - Start date (ISO format)
 * @param endDate - End date (ISO format)
 * @returns Query result with distribution data only
 */
export function useAllocationDistribution(startDate: string, endDate: string) {
  return useAllocationAnalytics({
    startDate,
    endDate,
    includeHeatmap: false,
    includeTrends: false,
    includeDistribution: true,
    includeStrategyAnalysis: false,
    includeHealthScore: false,
  });
}

/**
 * Hook for fetching only strategy analysis (optimized)
 * 
 * @param startDate - Start date (ISO format)
 * @param endDate - End date (ISO format)
 * @returns Query result with strategy analysis only
 */
export function useAllocationStrategyAnalysis(startDate: string, endDate: string) {
  return useAllocationAnalytics({
    startDate,
    endDate,
    includeHeatmap: false,
    includeTrends: false,
    includeDistribution: false,
    includeStrategyAnalysis: true,
    includeHealthScore: false,
  });
}

/**
 * Hook for fetching only health score (optimized)
 * 
 * @param startDate - Start date (ISO format)
 * @param endDate - End date (ISO format)
 * @returns Query result with health score only
 */
export function useAllocationHealthScore(startDate: string, endDate: string) {
  return useAllocationAnalytics({
    startDate,
    endDate,
    includeHeatmap: false,
    includeTrends: false,
    includeDistribution: false,
    includeStrategyAnalysis: false,
    includeHealthScore: true,
  });
}

/**
 * Utility hook for getting default date range (last 3 months)
 */
export function useDefaultAnalyticsDateRange(): { startDate: string; endDate: string } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 3);

  return {
    startDate: startDate.toISOString().split('T')[0]!,
    endDate: endDate.toISOString().split('T')[0]!,
  };
}
