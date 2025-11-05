import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/utils/common/queryClient";
import { useTransactionQuery } from "@/hooks/transactions/useTransactionQuery";
import { useEnvelopesQuery } from "@/hooks/budgeting/useEnvelopesQuery";
import { getDateRange } from "../utils/dateRangeUtils";
import {
  calculateFinancialSummary,
  calculateCategoryBreakdown,
  calculateEnvelopeBreakdown,
  calculateTimeSeriesData,
  filterTransactionsByDateRange,
  filterTransferTransactions,
  calculateSpendingVelocity,
  identifyTopSpendingCategories,
  calculateBudgetHealthScore,
} from "../utils/calculationUtils";
import { calculateSpendingTrends } from "../utils/insightsUtils";

interface SpendingAnalyticsOptions {
  period?: string;
  customDateRange?: { start: string | Date; end: string | Date };
  includeTransfers?: boolean;
  groupBy?: string;
}

/**
 * Hook for spending analytics data fetching and calculations
 * Updated to use TanStack Query hooks instead of Zustand store
 * This ensures data is fetched from Dexie (single source of truth)
 */
export const useSpendingAnalyticsQuery = (options: SpendingAnalyticsOptions = {}) => {
  const {
    period = "thisMonth",
    customDateRange,
    includeTransfers = false,
    groupBy = "category",
  } = options;

  // Get data from TanStack Query (Dexie as source of truth)
  const { transactions } = useTransactionQuery({ limit: 10000 }); // Get all transactions for analytics
  const { envelopes } = useEnvelopesQuery();

  return useQuery({
    queryKey: queryKeys.analyticsSpending({
      period,
      customDateRange,
      includeTransfers,
      groupBy,
    }),
    queryFn: async () => {
      const dateRange = getDateRange({ period, customDateRange });
      const { startDate, endDate } = dateRange;

      // Filter transactions for the period
      const periodTransactions = filterTransactionsByDateRange(
        transactions || [],
        startDate,
        endDate
      );

      // Filter out transfers if not included
      const analysisTransactions = filterTransferTransactions(periodTransactions, includeTransfers);

      // Basic calculations (enhanced with more metrics)
      const summary = calculateFinancialSummary(analysisTransactions);

      // Category breakdown (enhanced with percentages and averages)
      const categoryBreakdown = calculateCategoryBreakdown(analysisTransactions);

      // Envelope breakdown (enhanced with budget tracking)
      const envelopeBreakdown = calculateEnvelopeBreakdown(analysisTransactions, envelopes || []);

      // Time series data for charts (optimized monthly grouping)
      const timeSeriesData = calculateTimeSeriesData(analysisTransactions, startDate, endDate);

      // Spending trends and insights
      const insights = calculateSpendingTrends(categoryBreakdown, timeSeriesData);

      // NEW: Enhanced analytics for better insights
      const velocity = calculateSpendingVelocity(timeSeriesData);
      const topCategories = identifyTopSpendingCategories(categoryBreakdown, 5);
      const healthScore = calculateBudgetHealthScore(summary, envelopeBreakdown);

      return {
        period,
        dateRange: { startDate, endDate },
        summary,
        categoryBreakdown,
        envelopeBreakdown,
        timeSeriesData,
        insights,
        transactions: analysisTransactions,
        // NEW: Enhanced insights
        velocity,
        topCategories,
        healthScore,
        // Additional metadata for debugging
        _meta: {
          totalTransactions: transactions?.length || 0,
          filteredTransactions: analysisTransactions.length,
          envelopeCount: envelopes?.length || 0,
          hasData: analysisTransactions.length > 0,
        },
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    enabled: true,
  });
};
