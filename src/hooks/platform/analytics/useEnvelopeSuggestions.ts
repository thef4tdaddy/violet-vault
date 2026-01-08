import { useState, useEffect, useCallback, useMemo } from "react";
import {
  DEFAULT_ANALYSIS_SETTINGS,
  generateAllSuggestions,
} from "@/utils/budgeting/suggestionUtils";
import { globalToast } from "@/stores/ui/toastStore";
import logger from "@/utils/common/logger";
import localStorageService from "@/services/storage/localStorageService";
import type { Transaction, Envelope } from "@/db/types";
import { useSuggestionActions } from "./useSuggestionActions";

// Helper to calculate suggestion statistics
const calculateSuggestionStats = (
  suggestions: Array<{
    priority: string;
    type: string;
    data?: { currentAmount?: number; suggestedAmount?: number };
  }>,
  dismissedCount: number
) => {
  const total = suggestions.length;
  const priorityInit = { high: 0, medium: 0, low: 0 };
  const priority = suggestions.reduce(
    (acc, s) => {
      const key = s.priority as keyof typeof priorityInit;
      if (key in acc) {
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    },
    { ...priorityInit }
  );
  const type = suggestions.reduce((acc: Record<string, number>, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1;
    return acc;
  }, {});
  const savings = suggestions.reduce(
    (sum: number, s) =>
      s.type === "decrease_envelope" && s.data?.currentAmount && s.data?.suggestedAmount
        ? sum + (Number(s.data.currentAmount) - Number(s.data.suggestedAmount))
        : sum,
    0
  );
  return {
    totalSuggestions: total,
    priorityCounts: priority,
    typeCounts: type,
    potentialSavings: savings,
    dismissedCount,
  };
};

interface UseEnvelopeSuggestionsParams {
  transactions?: Transaction[];
  envelopes?: Envelope[];
  onCreateEnvelope?: (data: unknown) => void | Promise<void>;
  onUpdateEnvelope?: (envelopeId: string, updates: Record<string, unknown>) => void | Promise<void>;
  onDismissSuggestion?: (suggestionId: string) => void;
  dateRange?: string;
  showDismissed?: boolean;
}

/**
 * Custom hook for managing smart envelope suggestions
 * Handles analysis settings, suggestion generation, and user interactions
 */
const useEnvelopeSuggestions = ({
  transactions = [],
  envelopes = [],
  onCreateEnvelope,
  onUpdateEnvelope,
  onDismissSuggestion,
  dateRange = "6months",
  showDismissed = false,
}: UseEnvelopeSuggestionsParams) => {
  // Settings and state
  const [analysisSettings, setAnalysisSettings] = useState(DEFAULT_ANALYSIS_SETTINGS);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
  const [showSettings, setShowSettings] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() =>
    localStorageService.getSmartSuggestionsCollapsed()
  );
  useEffect(() => {
    localStorageService.setSmartSuggestionsCollapsed(isCollapsed);
  }, [isCollapsed]);

  const suggestions = useMemo(() => {
    try {
      const txns = transactions.map((t: Transaction) => ({
        amount: t.amount,
        envelopeId: t.envelopeId,
        category: t.category,
        description: t.description,
        date: typeof t.date === "string" ? t.date : t.date.toISOString().split("T")[0],
      }));
      const envs = envelopes.map((e: Envelope) => ({
        id: e.id,
        name: e.name,
        category: e.category,
        monthlyAmount: e.monthlyBudget,
        currentBalance: e.currentBalance,
      }));
      return generateAllSuggestions(txns, envs, analysisSettings, dateRange, {
        dismissedSuggestions,
        showDismissed,
      });
    } catch (error) {
      logger.error("Error generating smart suggestions:", error);
      return [];
    }
  }, [transactions, envelopes, analysisSettings, dateRange, dismissedSuggestions, showDismissed]);

  const toggleCollapse = useCallback(() => setIsCollapsed((prev) => !prev), []);
  const updateAnalysisSettings = useCallback(
    (newSettings: Partial<typeof DEFAULT_ANALYSIS_SETTINGS>) =>
      setAnalysisSettings((prev) => ({ ...prev, ...newSettings })),
    []
  );
  const resetAnalysisSettings = useCallback(
    () => setAnalysisSettings(DEFAULT_ANALYSIS_SETTINGS),
    []
  );
  const handleDismissSuggestion = useCallback(
    (suggestionId: string) => {
      setDismissedSuggestions((prev) => new Set([...prev, suggestionId]));
      onDismissSuggestion?.(suggestionId);
      globalToast.showInfo("Suggestion dismissed", "Dismissed", 5000);
    },
    [onDismissSuggestion]
  );

  const { handleApplySuggestion } = useSuggestionActions({
    onCreateEnvelope,
    onUpdateEnvelope,
    onDismissSuggestion: handleDismissSuggestion,
  });

  const clearDismissedSuggestions = useCallback(() => {
    setDismissedSuggestions(new Set());
    globalToast.showInfo("All dismissed suggestions cleared", "Cleared", 5000);
  }, []);
  const refreshSuggestions = useCallback(() => {
    setDismissedSuggestions(new Set());
    globalToast.showInfo("Suggestions refreshed", "Refreshed", 5000);
  }, []);
  const toggleSettings = useCallback(() => setShowSettings((prev) => !prev), []);

  const suggestionStats = useMemo(
    () => calculateSuggestionStats(suggestions, dismissedSuggestions.size),
    [suggestions, dismissedSuggestions.size]
  );

  return {
    suggestions,
    analysisSettings,
    dismissedSuggestions,
    showSettings,
    isCollapsed,
    suggestionStats,
    toggleCollapse,
    updateAnalysisSettings,
    resetAnalysisSettings,
    handleApplySuggestion,
    handleDismissSuggestion,
    clearDismissedSuggestions,
    refreshSuggestions,
    toggleSettings,
    hasSuggestions: suggestions.length > 0,
    highPrioritySuggestions: suggestions.filter((s) => s.priority === "high"),
    mediumPrioritySuggestions: suggestions.filter((s) => s.priority === "medium"),
    lowPrioritySuggestions: suggestions.filter((s) => s.priority === "low"),
  };
};

export default useEnvelopeSuggestions;
