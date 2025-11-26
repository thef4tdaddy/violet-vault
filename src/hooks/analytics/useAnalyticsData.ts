import { useMemo } from "react";
import { isValidDate } from "../../utils/validation/dateValidation";
import {
  safeDivision,
  getDateRangeStart,
  filterTransactionsByDate,
  calculateMonthlyTrends,
  calculateEnvelopeSpending,
  calculateCategoryBreakdown,
  calculateWeeklyPatterns,
} from "./utils/analyticsDataUtils";
import {
  calculateEnvelopeHealth,
  calculateBudgetVsActual,
  calculateFinancialMetrics,
} from "./utils/envelopeAnalysisUtils";

import { Transaction as BaseTransaction } from "../../types/finance";

interface AnalyticsTransaction extends Omit<Partial<BaseTransaction>, "envelopeId"> {
  date?: string;
  amount?: number;
  envelopeId?: string;
  category?: string;
}

interface AnalyticsEnvelope {
  id: string;
  name: string;
  monthlyAmount?: number;
  currentBalance?: number;
  spendingHistory?: Array<{ amount: number }>;
  color?: string;
}

/**
 * Input parameters for useAnalyticsData hook
 */
interface UseAnalyticsDataInput {
  transactions?: unknown[];
  envelopes?: unknown[];
  timeFilter?: string;
}

/**
 * Custom hook for analytics data processing
 * Extracted from ChartsAndAnalytics.jsx for better reusability
 * Issue #151 - ChartsAndAnalytics refactoring
 */
export const useAnalyticsData = ({
  transactions = [],
  envelopes = [],
  timeFilter = "thisMonth",
}: UseAnalyticsDataInput) => {
  // Validate and sanitize props to prevent runtime errors
  const safeTransactions = useMemo(
    () =>
      Array.isArray(transactions)
        ? (transactions.map((t) => {
            const tx = t as Record<string, unknown>;
            return {
              ...tx,
              envelopeId: tx.envelopeId ? String(tx.envelopeId) : undefined,
            };
          }) as AnalyticsTransaction[])
        : [],
    [transactions]
  );
  const safeEnvelopes = useMemo(
    () =>
      Array.isArray(envelopes)
        ? (envelopes.map((e) => {
            const env = e as Record<string, unknown>;
            return {
              ...env,
              id: env.id ? String(env.id) : "",
            };
          }) as AnalyticsEnvelope[])
        : [],
    [envelopes]
  );

  // Memoized date range calculations using timeFilter
  const getDateRange = useMemo(() => getDateRangeStart(timeFilter), [timeFilter]);

  // Filter transactions by date range
  const filteredTransactions = useMemo(
    () => filterTransactionsByDate(safeTransactions, getDateRange),
    [safeTransactions, getDateRange]
  );

  // Monthly spending trends
  const monthlyTrends = useMemo(
    () => calculateMonthlyTrends(filteredTransactions),
    [filteredTransactions]
  );

  // Envelope spending breakdown
  const envelopeSpending = useMemo(
    () => calculateEnvelopeSpending(filteredTransactions, safeEnvelopes),
    [filteredTransactions, safeEnvelopes]
  );

  // Category breakdown
  const categoryBreakdown = useMemo(
    () => calculateCategoryBreakdown(filteredTransactions),
    [filteredTransactions]
  );

  // Weekly spending patterns
  const weeklyPatterns = useMemo(
    () => calculateWeeklyPatterns(filteredTransactions),
    [filteredTransactions]
  );

  // Envelope health analysis
  const envelopeHealth = useMemo(() => calculateEnvelopeHealth(safeEnvelopes), [safeEnvelopes]);

  // Budget vs actual analysis
  const budgetVsActual = useMemo(
    () => calculateBudgetVsActual(filteredTransactions, safeEnvelopes),
    [filteredTransactions, safeEnvelopes]
  );

  // Financial metrics
  const metrics = useMemo(
    () => calculateFinancialMetrics(filteredTransactions, monthlyTrends),
    [filteredTransactions, monthlyTrends]
  );

  return {
    // Raw data
    filteredTransactions,
    // Processed analytics
    monthlyTrends,
    envelopeSpending,
    categoryBreakdown,
    weeklyPatterns,
    envelopeHealth,
    budgetVsActual,
    metrics,
    // Utilities
    isValidDate,
    safeDivision,
  };
};

export default useAnalyticsData;
