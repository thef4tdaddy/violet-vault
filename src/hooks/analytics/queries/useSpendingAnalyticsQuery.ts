import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/utils/common/queryClient";
import { useBudgetStore } from "@/stores/ui/uiStore";
import { getDateRange } from "../utils/dateRangeUtils";
import {
  calculateFinancialSummary,
  calculateCategoryBreakdown,
  calculateEnvelopeBreakdown,
  calculateTimeSeriesData,
  filterTransactionsByDateRange,
  filterTransferTransactions,
} from "../utils/calculationUtils";
import { calculateSpendingTrends } from "../utils/insightsUtils";

interface SpendingAnalyticsOptions {
  period?: string;
  customDateRange?: { start: string | Date; end: string | Date };
  includeTransfers?: boolean;
  groupBy?: string;
}

interface StoreSelector {
  transactions?: unknown[];
  envelopes?: unknown[];
}

/**
 * Hook for spending analytics data fetching and calculations
 */
export const useSpendingAnalyticsQuery = (options: SpendingAnalyticsOptions = {}) => {
  const {
    period = "thisMonth",
    customDateRange,
    includeTransfers = false,
    groupBy = "category",
  } = options;

  // Get data from Zustand store
  const { transactions, envelopes } = useBudgetStore((state: StoreSelector) => ({
    transactions: state.transactions,
    envelopes: state.envelopes,
  }));

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
      const analysisTransactions = filterTransferTransactions(
        periodTransactions,
        includeTransfers
      );

      // Basic calculations
      const summary = calculateFinancialSummary(analysisTransactions);

      // Category breakdown
      const categoryBreakdown = calculateCategoryBreakdown(analysisTransactions);

      // Envelope breakdown
      const envelopeBreakdown = calculateEnvelopeBreakdown(analysisTransactions, envelopes);

      // Time series data for charts
      const timeSeriesData = calculateTimeSeriesData(analysisTransactions, startDate, endDate);

      // Spending trends and insights
      const insights = calculateSpendingTrends(categoryBreakdown, timeSeriesData);

      return {
        period,
        dateRange: { startDate, endDate },
        summary,
        categoryBreakdown,
        envelopeBreakdown,
        timeSeriesData,
        insights,
        transactions: analysisTransactions,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: true,
  });
};
