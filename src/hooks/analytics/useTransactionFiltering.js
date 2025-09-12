/**
 * Hook for filtering transactions by date range
 * Extracted from useSmartCategoryAnalysis.js to reduce complexity
 */
import { useMemo } from "react";
import { getDateRanges } from "../../utils/analytics/categoryPatterns";

export const useTransactionFiltering = (transactions, dateRange) => {
  return useMemo(() => {
    const ranges = getDateRanges();
    const startDate = ranges[dateRange];
    return transactions.filter((t) => new Date(t.date) >= startDate);
  }, [transactions, dateRange]);
};
