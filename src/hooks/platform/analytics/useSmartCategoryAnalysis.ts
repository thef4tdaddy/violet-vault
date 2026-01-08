import { useMemo } from "react";
import { useTransactionFiltering } from "./useTransactionFiltering";
import { useTransactionAnalysis } from "./useTransactionAnalysis";
import { useBillAnalysis } from "./useBillAnalysis";
import { extractMerchantName, suggestBillCategory } from "@/utils/analytics/categoryPatterns";
import type { Suggestion, TransactionForStats } from "@/utils/analytics/categoryHelpers";

interface AnalysisSettingsInput {
  minTransactionCount: number;
  minAmount: number;
  similarityThreshold: number;
  unusedCategoryThreshold: number;
  consolidationThreshold: number;
}

interface SmartCategoryAnalysisResult {
  filteredTransactions: TransactionForStats[];
  transactionAnalysis: Suggestion[];
  billAnalysis: Suggestion[];
  extractMerchantName: typeof extractMerchantName;
  suggestBillCategory: typeof suggestBillCategory;
}

/**
 * Hook for analyzing transaction patterns and suggesting categories
 * Refactored to use focused sub-hooks for better maintainability
 */
export const useSmartCategoryAnalysis = (
  transactions: TransactionForStats[] = [],
  bills: Array<Record<string, unknown>> = [],
  dateRange: string = "6months",
  analysisSettings: Partial<AnalysisSettingsInput> = {}
): SmartCategoryAnalysisResult => {
  const settings = useMemo(() => {
    const defaultSettings: AnalysisSettingsInput = {
      minTransactionCount: 5,
      minAmount: 25,
      similarityThreshold: 0.7,
      unusedCategoryThreshold: 3, // months
      consolidationThreshold: 0.8,
    };
    return { ...defaultSettings, ...analysisSettings };
  }, [analysisSettings]);

  const filteredTransactions = useTransactionFiltering(transactions, dateRange);
  const transactionAnalysis = useTransactionAnalysis(
    filteredTransactions,
    transactions,
    settings
  ) as Suggestion[];
  const billAnalysis = useBillAnalysis(
    bills as unknown as import("@/types/bills").Bill[],
    settings
  ) as Suggestion[];

  return {
    filteredTransactions,
    transactionAnalysis,
    billAnalysis,
    extractMerchantName,
    suggestBillCategory,
  };
};
