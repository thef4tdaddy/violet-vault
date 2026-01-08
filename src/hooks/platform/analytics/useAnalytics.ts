import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/utils/common/queryClient";
import { useSpendingAnalyticsQuery } from "./queries/useSpendingAnalyticsQuery";
import { useBalanceAnalyticsQuery } from "./queries/useBalanceAnalyticsQuery";
import { usePaycheckTrendsQuery } from "./queries/usePaycheckTrendsQuery";
import { getChartData } from "./utils/chartDataUtils";
import { getDateRange } from "./utils/dateRangeUtils";

interface AnalyticsOptions {
  period?: string;
  customDateRange?: { start: string | Date; end: string | Date };
  includeTransfers?: boolean;
  groupBy?: string;
}

/**
 * Specialized hook for analytics and reporting
 * Orchestrates multiple analytics queries with unified API
 */
const useAnalytics = (options: AnalyticsOptions = {}) => {
  const queryClient = useQueryClient();

  // Extract individual analytics queries
  const spendingQuery = useSpendingAnalyticsQuery(options);
  const balanceQuery = useBalanceAnalyticsQuery();
  const paycheckQuery = usePaycheckTrendsQuery();

  return {
    // Data
    analytics: spendingQuery.data,
    balanceAnalytics: balanceQuery.data,
    paycheckTrends: paycheckQuery.data,

    // Loading states
    isLoading: spendingQuery.isLoading || balanceQuery.isLoading,
    isFetching: spendingQuery.isFetching || balanceQuery.isFetching,
    isError: spendingQuery.isError || balanceQuery.isError,
    error: spendingQuery.error || balanceQuery.error,

    // Individual query states
    spendingLoading: spendingQuery.isLoading,
    balanceLoading: balanceQuery.isLoading,
    paycheckLoading: paycheckQuery.isLoading,

    // Chart data helpers
    getChartData: (type: string) => getChartData(type, spendingQuery.data || {}),

    // Utility functions
    getDateRange: () => getDateRange(options),

    // Query controls
    refetch: () => {
      spendingQuery.refetch();
      balanceQuery.refetch();
      paycheckQuery.refetch();
    },
    invalidate: () => queryClient.invalidateQueries({ queryKey: queryKeys.analytics }),
  };
};

export default useAnalytics;
