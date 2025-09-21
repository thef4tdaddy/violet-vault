import { useState, useEffect, useCallback, useMemo } from "react";
import {
  DEFAULT_ANALYSIS_SETTINGS,
  generateAllSuggestions,
} from "../../utils/budgeting/suggestionUtils";
import { globalToast } from "../../stores/ui/toastStore";
import logger from "../../utils/common/logger";

/**
 * Custom hook for managing smart envelope suggestions
 * Handles analysis settings, suggestion generation, and user interactions
 */
const useSmartSuggestions = ({
  transactions = [],
  envelopes = [],
  onCreateEnvelope,
  onUpdateEnvelope,
  onDismissSuggestion,
  dateRange = "6months",
  showDismissed = false,
}) => {
  // Settings and state
  const [analysisSettings, setAnalysisSettings] = useState(
    DEFAULT_ANALYSIS_SETTINGS,
  );
  const [dismissedSuggestions, setDismissedSuggestions] = useState(new Set());
  const [showSettings, setShowSettings] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Initialize from localStorage, default to expanded (false)
    const saved = localStorage.getItem("smartSuggestions_collapsed");
    return saved ? JSON.parse(saved) : false;
  });

  // Persist collapse state to localStorage
  useEffect(() => {
    localStorage.setItem(
      "smartSuggestions_collapsed",
      JSON.stringify(isCollapsed),
    );
  }, [isCollapsed]);

  // Generate suggestions based on current data and settings
  const suggestions = useMemo(() => {
    try {
      return generateAllSuggestions(
        transactions,
        envelopes,
        analysisSettings,
        dateRange,
        dismissedSuggestions,
        showDismissed,
      );
    } catch (error) {
      logger.error("Error generating smart suggestions:", error);
      return [];
    }
  }, [
    transactions,
    envelopes,
    analysisSettings,
    dateRange,
    dismissedSuggestions,
    showDismissed,
  ]);

  // Toggle collapse state
  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  // Update analysis settings
  const updateAnalysisSettings = useCallback((newSettings) => {
    setAnalysisSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // Reset analysis settings to defaults
  const resetAnalysisSettings = useCallback(() => {
    setAnalysisSettings(DEFAULT_ANALYSIS_SETTINGS);
  }, []);

  // Dismiss suggestion
  const handleDismissSuggestion = useCallback(
    (suggestionId) => {
      setDismissedSuggestions((prev) => new Set([...prev, suggestionId]));
      onDismissSuggestion?.(suggestionId);

      globalToast.showInfo("Suggestion dismissed", "Dismissed");
    },
    [onDismissSuggestion],
  );

  // Apply suggestion action
  const handleApplySuggestion = useCallback(
    async (suggestion) => {
      try {
        switch (suggestion.action) {
          case "create_envelope":
            if (onCreateEnvelope) {
              await onCreateEnvelope(suggestion.data);
              globalToast.showSuccess(
                `Created "${suggestion.data.name}" envelope`,
                "Suggestion Applied",
              );
            }
            break;

          case "increase_budget":
            if (onUpdateEnvelope) {
              await onUpdateEnvelope(suggestion.data.envelopeId, {
                monthlyAmount: suggestion.data.suggestedAmount,
              });
              globalToast.showSuccess(
                `Increased budget to $${suggestion.data.suggestedAmount}`,
                "Budget Updated",
              );
            }
            break;

          case "decrease_budget":
            if (onUpdateEnvelope) {
              await onUpdateEnvelope(suggestion.data.envelopeId, {
                monthlyAmount: suggestion.data.suggestedAmount,
              });
              globalToast.showSuccess(
                `Reduced budget to $${suggestion.data.suggestedAmount}`,
                "Budget Updated",
              );
            }
            break;

          default:
            logger.warn("Unknown suggestion action:", suggestion.action);
            return;
        }

        // Auto-dismiss after applying
        handleDismissSuggestion(suggestion.id);
      } catch (error) {
        logger.error("Error applying suggestion:", error);
        globalToast.showError(
          error.message || "Failed to apply suggestion",
          "Application Error",
        );
      }
    },
    [onCreateEnvelope, onUpdateEnvelope, handleDismissSuggestion],
  );

  // Clear all dismissed suggestions
  const clearDismissedSuggestions = useCallback(() => {
    setDismissedSuggestions(new Set());
    globalToast.showInfo("All dismissed suggestions cleared", "Cleared");
  }, []);

  // Refresh suggestions (useful for manual refresh)
  const refreshSuggestions = useCallback(() => {
    // Force re-render by updating a timestamp or clearing dismissed
    setDismissedSuggestions(new Set());
    globalToast.showInfo("Suggestions refreshed", "Refreshed");
  }, []);

  // Toggle settings panel
  const toggleSettings = useCallback(() => {
    setShowSettings((prev) => !prev);
  }, []);

  // Get suggestion statistics
  const suggestionStats = useMemo(() => {
    const totalSuggestions = suggestions.length;
    const priorityCounts = suggestions.reduce(
      (acc, s) => {
        acc[s.priority] = (acc[s.priority] || 0) + 1;
        return acc;
      },
      { high: 0, medium: 0, low: 0 },
    );

    const typeCounts = suggestions.reduce((acc, s) => {
      acc[s.type] = (acc[s.type] || 0) + 1;
      return acc;
    }, {});

    const potentialSavings = suggestions.reduce((sum, s) => {
      if (
        s.type === "decrease_envelope" &&
        s.data.currentAmount &&
        s.data.suggestedAmount
      ) {
        return sum + (s.data.currentAmount - s.data.suggestedAmount);
      }
      return sum;
    }, 0);

    return {
      totalSuggestions,
      priorityCounts,
      typeCounts,
      potentialSavings,
      dismissedCount: dismissedSuggestions.size,
    };
  }, [suggestions, dismissedSuggestions.size]);

  return {
    // State
    suggestions,
    analysisSettings,
    dismissedSuggestions,
    showSettings,
    isCollapsed,
    suggestionStats,

    // Actions
    toggleCollapse,
    updateAnalysisSettings,
    resetAnalysisSettings,
    handleApplySuggestion,
    handleDismissSuggestion,
    clearDismissedSuggestions,
    refreshSuggestions,
    toggleSettings,

    // Computed values
    hasSuggestions: suggestions.length > 0,
    highPrioritySuggestions: suggestions.filter((s) => s.priority === "high"),
    mediumPrioritySuggestions: suggestions.filter(
      (s) => s.priority === "medium",
    ),
    lowPrioritySuggestions: suggestions.filter((s) => s.priority === "low"),
  };
};

export default useSmartSuggestions;
