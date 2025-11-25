/**
 * Hook for bill pattern analysis
 * Extracted from useSmartCategoryAnalysis.js to reduce complexity
 */
import { useMemo } from "react";
import {
  analyzeBillCategorization,
  analyzeBillCategoryOptimization,
} from "../../utils/analytics/billAnalyzer";
import type { Bill } from "@/types/bills";

interface AnalysisSettings {
  [key: string]: unknown;
}

export const useBillAnalysis = (bills: Bill[], settings: AnalysisSettings) => {
  return useMemo(() => {
    const categorizationSuggestions = analyzeBillCategorization(bills, settings);
    const optimizationSuggestions = analyzeBillCategoryOptimization(bills, settings);

    return [...categorizationSuggestions, ...optimizationSuggestions];
  }, [bills, settings]);
};
