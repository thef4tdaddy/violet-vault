import { useState, useCallback } from "react";

/**
 * Hook for managing Smart Category Manager UI state and interactions
 * Extracts UI logic from SmartCategoryManager component
 */
export const useSmartCategoryManager = (initialDateRange = "6months") => {
  const [activeTab, setActiveTab] = useState("suggestions");
  const [showSettings, setShowSettings] = useState(false);
  const [dismissedSuggestions, setDismissedSuggestions] = useState(new Set());
  const [dateRange, setDateRange] = useState(initialDateRange);

  const [analysisSettings, setAnalysisSettings] = useState({
    minTransactionCount: 5,
    minAmount: 25,
    similarityThreshold: 0.7,
    unusedCategoryThreshold: 3, // months
    consolidationThreshold: 0.8,
  });

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  const handleDateRangeChange = useCallback((newDateRange) => {
    setDateRange(newDateRange);
  }, []);

  const handleDismissSuggestion = useCallback((suggestionId) => {
    setDismissedSuggestions((prev) => new Set([...prev, suggestionId]));
  }, []);

  const handleUndismissSuggestion = useCallback((suggestionId) => {
    setDismissedSuggestions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(suggestionId);
      return newSet;
    });
  }, []);

  const handleSettingsChange = useCallback((newSettings) => {
    setAnalysisSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const toggleSettings = useCallback(() => {
    setShowSettings((prev) => !prev);
  }, []);

  const applySuggestion = useCallback(
    async (suggestion, onApplyToTransactions, onApplyToBills) => {
      try {
        if (suggestion.category === "transaction" && onApplyToTransactions) {
          await onApplyToTransactions(suggestion);
        } else if (suggestion.category === "bill" && onApplyToBills) {
          await onApplyToBills(suggestion);
        }

        // Mark as dismissed after successful application
        handleDismissSuggestion(suggestion.id);
        return true;
      } catch (error) {
        console.error("Failed to apply suggestion:", error);
        return false;
      }
    },
    [handleDismissSuggestion]
  );

  return {
    // State
    activeTab,
    showSettings,
    dismissedSuggestions,
    dateRange,
    analysisSettings,

    // Actions
    handleTabChange,
    handleDateRangeChange,
    handleDismissSuggestion,
    handleUndismissSuggestion,
    handleSettingsChange,
    toggleSettings,
    applySuggestion,
  };
};
