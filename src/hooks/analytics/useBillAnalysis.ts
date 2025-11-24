/**
 * Hook for bill pattern analysis
 * Extracted from useSmartCategoryAnalysis.js to reduce complexity
 */
import { useMemo } from "react";
import {
  analyzeBillCategorization,
  analyzeBillCategoryOptimization,
} from "../../utils/analytics/billAnalyzer";

export const useBillAnalysis = (bills: unknown[], settings: unknown) => {
  return useMemo(() => {
    const categorizationSuggestions = analyzeBillCategorization(bills, settings);
    const optimizationSuggestions = analyzeBillCategoryOptimization(bills, settings);

    return [...categorizationSuggestions, ...optimizationSuggestions];
  }, [bills, settings]);
};
