/**
 * Hook for filtering transactions by date range
 * Extracted from useSmartCategoryAnalysis.js to reduce complexity
 */
import { useMemo } from "react";
import { getDateRanges } from "../../utils/analytics/categoryPatterns";
import type { TransactionForStats } from "../../utils/analytics/categoryHelpers";

export const useTransactionFiltering = (
  transactions: TransactionForStats[],
  dateRange: string
): TransactionForStats[] => {
  return useMemo(() => {
    const ranges = getDateRanges();
    const startDate = ranges[dateRange];
    return transactions.filter((t) => new Date(t.date) >= startDate);
  }, [transactions, dateRange]);
};
