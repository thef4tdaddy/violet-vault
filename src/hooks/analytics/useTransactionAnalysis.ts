/**
 * Hook for transaction pattern analysis
 * Extracted from useSmartCategoryAnalysis.js to reduce complexity
 */
import { useMemo } from "react";
import {
  analyzeUncategorizedTransactions,
  analyzeUnusedCategories,
} from "../../utils/analytics/transactionAnalyzer";

export const useTransactionAnalysis = (filteredTransactions, allTransactions, settings) => {
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
