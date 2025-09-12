import { useMemo } from "react";
import { useTransactionFiltering } from "./useTransactionFiltering";
import { useTransactionAnalysis } from "./useTransactionAnalysis";
import { useBillAnalysis } from "./useBillAnalysis";
import {
  extractMerchantName,
  suggestBillCategory,
} from "../../utils/analytics/categoryPatterns";

/**
 * Hook for analyzing transaction patterns and suggesting categories
 * Refactored to use focused sub-hooks for better maintainability
 */
export const useSmartCategoryAnalysis = (
  transactions = [],
  bills = [],
  dateRange = "6months",
  analysisSettings = {},
) => {
  // Memoize settings to fix dependency issues
  const settings = useMemo(() => {
    const defaultSettings = {
      minTransactionCount: 5,
      minAmount: 25,
      similarityThreshold: 0.7,
      unusedCategoryThreshold: 3, // months
      consolidationThreshold: 0.8,
    };
    return { ...defaultSettings, ...analysisSettings };
  }, [analysisSettings]);

  // Use focused hooks for analysis
  const filteredTransactions = useTransactionFiltering(transactions, dateRange);
  const transactionAnalysis = useTransactionAnalysis(
    filteredTransactions,
    transactions,
    settings,
  );
  const billAnalysis = useBillAnalysis(bills, settings);

  return {
    filteredTransactions,
    transactionAnalysis,
    billAnalysis,
    extractMerchantName,
    suggestBillCategory,
  };
};
