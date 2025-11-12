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
import { calculateWeeklyPatterns } from "../utils/analyticsDataUtils";
import { calculateBudgetVsActual } from "../utils/envelopeAnalysisUtils";
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
  // Dynamic limit based on period to optimize performance
  const transactionLimit = period === "allTime" || period === "thisYear" ? 5000 : 2000;
  const { transactions } = useTransactionQuery({ limit: transactionLimit });
  const { envelopes } = useEnvelopesQuery();

  const queryKeySeed = JSON.stringify({
    period,
    customDateRange,
    includeTransfers,
    groupBy,
  });

  return useQuery({
    queryKey: queryKeys.analyticsSpending(queryKeySeed),
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
      const normalizedTransactionsForInsights = analysisTransactions.map((transaction) => ({
        ...transaction,
        date:
          transaction.date instanceof Date
            ? transaction.date.toISOString()
            : (transaction.date as string | undefined),
      }));
      const weeklyPatterns = calculateWeeklyPatterns(
        normalizedTransactionsForInsights as Array<{ amount?: number; date?: string }>
      );
      const budgetVsActual = calculateBudgetVsActual(
        normalizedTransactionsForInsights as Array<{ amount?: number; envelopeId?: string }>,
        envelopes || []
      );

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
        weeklyPatterns,
        budgetVsActual,
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
