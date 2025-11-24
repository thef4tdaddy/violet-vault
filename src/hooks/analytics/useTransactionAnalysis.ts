/**
 * Hook for transaction pattern analysis
 * Extracted from useSmartCategoryAnalysis.js to reduce complexity
 */
import { useMemo } from "react";
import type { Transaction } from "@/types/finance";
import {
  analyzeUncategorizedTransactions,
  analyzeUnusedCategories,
} from "../../utils/analytics/transactionAnalyzer";

interface AnalysisSettings {
  [key: string]: unknown;
}

export const useTransactionAnalysis = (
  filteredTransactions: Transaction[],
  allTransactions: Transaction[],
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
