import { useState, useCallback } from "react";
import logger from "@/utils/core/common/logger";
import type { Suggestion } from "@/utils/features/analytics/categoryHelpers";

type CategoryTabId = "suggestions" | "analysis" | "settings";

interface AnalysisSettings {
  minTransactionCount: number;
  minAmount: number;
  similarityThreshold: number;
  unusedCategoryThreshold: number;
  consolidationThreshold: number;
}

type ApplyToTransactionsHandler = (
  suggestion: Suggestion,
  updates?: Record<string, unknown>
) => Promise<void>;
type ApplyToBillsHandler = (
  suggestion: Suggestion,
  updates?: Record<string, unknown>
) => Promise<void>;

/**
 * Hook for managing Smart Category Manager UI state and interactions
 * Extracts UI logic from SmartCategoryManager component
 */
export const useSmartCategoryManager = (initialDateRange: string = "6months") => {
  const [activeTab, setActiveTab] = useState<CategoryTabId>("suggestions");
  const [showSettings, setShowSettings] = useState(false);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState(initialDateRange);

  const [analysisSettings, setAnalysisSettings] = useState<AnalysisSettings>({
    minTransactionCount: 5,
    minAmount: 25,
    similarityThreshold: 0.7,
    unusedCategoryThreshold: 3, // months
    consolidationThreshold: 0.8,
  });

  const handleTabChange = useCallback((tabId: CategoryTabId) => {
    setActiveTab(tabId);
  }, []);

  const handleDateRangeChange = useCallback((newDateRange: string) => {
    setDateRange(newDateRange);
  }, []);

  const handleDismissSuggestion = useCallback((suggestionId: string) => {
    setDismissedSuggestions((prev) => new Set([...prev, suggestionId]));
  }, []);

  const handleUndismissSuggestion = useCallback((suggestionId: string) => {
    setDismissedSuggestions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(suggestionId);
      return newSet;
    });
  }, []);

  const handleSettingsChange = useCallback((newSettings: Partial<AnalysisSettings>) => {
    setAnalysisSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const toggleSettings = useCallback(() => {
    setShowSettings((prev) => !prev);
  }, []);

  const applySuggestion = useCallback(
    async (
      suggestion: Suggestion,
      onApplyToTransactions?: ApplyToTransactionsHandler,
      onApplyToBills?: ApplyToBillsHandler
    ) => {
      try {
        if (suggestion.category === "transaction" && onApplyToTransactions) {
          await onApplyToTransactions(suggestion);
        } else if (suggestion.category === "bill" && onApplyToBills) {
          await onApplyToBills(suggestion);
        }

        handleDismissSuggestion(suggestion.id);
        return true;
      } catch (error) {
        logger.error("Failed to apply suggestion:", error);
        return false;
      }
    },
    [handleDismissSuggestion]
  );

  return {
    activeTab,
    showSettings,
    dismissedSuggestions,
    dateRange,
    analysisSettings,
    handleTabChange,
    handleDateRangeChange,
    handleDismissSuggestion,
    handleUndismissSuggestion,
    handleSettingsChange,
    toggleSettings,
    applySuggestion,
  };
};
