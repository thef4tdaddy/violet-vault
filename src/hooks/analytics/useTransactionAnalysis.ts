/**
 * Hook for transaction pattern analysis
 * Extracted from useSmartCategoryAnalysis.js to reduce complexity
 */
import { useMemo } from "react";
import {
  analyzeUncategorizedTransactions,
  analyzeUnusedCategories,
} from "../../utils/analytics/transactionAnalyzer";

export const useTransactionAnalysis = (
  filteredTransactions: unknown,
  allTransactions: unknown,
  settings: unknown
) => {
  return useMemo(() => {
    // Cast to proper types for analysis functions
    const uncategorizedSuggestions = analyzeUncategorizedTransactions(
      filteredTransactions as never[],
      settings as never
    );
    const unusedCategorySuggestions = analyzeUnusedCategories(
      allTransactions as never[],
      filteredTransactions as never[],
      settings as never
    );

    return [...uncategorizedSuggestions, ...unusedCategorySuggestions];
  }, [filteredTransactions, allTransactions, settings]);
};
