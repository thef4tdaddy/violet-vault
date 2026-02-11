/**
 * Hook for transaction pattern analysis
 * Extracted from useSmartCategoryAnalysis.js to reduce complexity
 */
import { useMemo } from "react";
import type { TransactionForStats } from "@/utils/features/analytics/categoryHelpers";
import {
  analyzeUncategorizedTransactions,
  analyzeUnusedCategories,
} from "@/utils/features/analytics/transactionAnalyzer";

interface AnalysisSettings {
  [key: string]: unknown;
}

export const useTransactionAnalysis = (
  filteredTransactions: TransactionForStats[],
  allTransactions: TransactionForStats[],
  settings: AnalysisSettings
) => {
  return useMemo(() => {
    const uncategorizedSuggestions = analyzeUncategorizedTransactions(
      filteredTransactions,
      settings
    );
    const unusedCategorySuggestions = analyzeUnusedCategories(
      allTransactions,
      filteredTransactions,
      settings
    );

    return [...uncategorizedSuggestions, ...unusedCategorySuggestions];
  }, [filteredTransactions, allTransactions, settings]);
};
