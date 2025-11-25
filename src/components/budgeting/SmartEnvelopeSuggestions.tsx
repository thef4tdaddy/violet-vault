import React from "react";
import { getIcon } from "../../utils";
import { Button } from "@/components/ui";
import useSmartSuggestions from "../../hooks/budgeting/useSmartSuggestions";
import SuggestionsList, { type Suggestion } from "./suggestions/SuggestionsList";
import SuggestionSettings from "./suggestions/SuggestionSettings";
import { globalToast } from "../../stores/ui/toastStore";
import type { Envelope, Transaction } from "../../db/types";
import type { SuggestionStats } from "./suggestions/SuggestionSettings";

interface IconBadgeProps {
  isCollapsed: boolean;
}

interface SuggestionBadgeProps {
  count: number;
  hasSuggestions: boolean;
}

interface SettingsButtonProps {
  onClick: () => void;
}

interface SuggestionsHeaderProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  hasSuggestions: boolean;
  suggestions: Suggestion[];
  toggleSettings: () => void;
}

interface CollapsedViewProps {
  suggestions: Suggestion[];
}

interface AnalysisSettings {
  minAmount: number;
  minTransactions: number;
  overspendingThreshold: number;
  bufferPercentage: number;
  [key: string]: unknown;
}

interface ExpandedViewProps {
  showSettings: boolean;
  analysisSettings: AnalysisSettings;
  updateAnalysisSettings: (settings: Partial<AnalysisSettings>) => void;
  resetAnalysisSettings: () => void;
  refreshSuggestions: () => void;
  suggestionStats: SuggestionStats;
  suggestions: Suggestion[];
  handleApplySuggestion: (suggestion: Suggestion) => void;
  handleDismissSuggestion: (suggestionId: string) => void;
}

interface SmartEnvelopeSuggestionsProps {
  transactions?: Transaction[];
  envelopes?: Envelope[];
  onCreateEnvelope: (envelope: Partial<Envelope>) => void;
  onUpdateEnvelope: (envelopeId: string, updates: Record<string, unknown>) => void;
  onDismissSuggestion: (suggestionId: string) => void;
  dateRange?: string;
  showDismissed?: boolean;
  className?: string;
}

// Icon badge component
const IconBadge = ({ isCollapsed }: IconBadgeProps) => (
  <div className={`relative ${isCollapsed ? "mr-2" : "mr-3"}`}>
    <div className="absolute inset-0 bg-amber-500 rounded-xl blur-lg opacity-30"></div>
    <div className={`relative bg-amber-500 rounded-xl ${isCollapsed ? "p-1.5" : "p-2"}`}>
      {React.createElement(getIcon("Zap"), {
        className: `text-white ${isCollapsed ? "h-3 w-3" : "h-4 w-4"}`,
      })}
    </div>
  </div>
);

// Suggestion count badge
const SuggestionBadge = ({ count, hasSuggestions }: SuggestionBadgeProps) => {
  if (!hasSuggestions) return null;

  return (
    <span className="ml-2 bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded-full">
      {count}
    </span>
  );
};

// Settings button component
const SettingsButton = ({ onClick }: SettingsButtonProps) => {
  return (
    <Button onClick={onClick} variant="icon" size="sm" title="Settings">
      {React.createElement(getIcon("Settings"), {
        className: "h-4 w-4",
      })}
    </Button>
  );
};

// Header component
const SuggestionsHeader = ({
  isCollapsed,
  toggleCollapse,
  hasSuggestions,
  suggestions,
  toggleSettings,
}: SuggestionsHeaderProps) => (
  <div className={`flex items-center justify-between ${isCollapsed ? "mb-0" : "mb-4"}`}>
    <Button
      onClick={toggleCollapse}
      variant="icon"
      className={`flex items-center font-semibold text-gray-900 hover:text-gray-700 transition-colors group p-0 h-auto ${
        isCollapsed ? "text-base" : "text-lg"
      }`}
    >
      <IconBadge isCollapsed={isCollapsed} />
      Smart Suggestions
      <SuggestionBadge count={suggestions.length} hasSuggestions={hasSuggestions} />
      <div className="ml-2 transition-transform duration-200 group-hover:scale-110">
        {React.createElement(getIcon(isCollapsed ? "ChevronDown" : "ChevronUp"), {
          className: "h-4 w-4",
        })}
      </div>
    </Button>

    {!isCollapsed && (
      <div className="flex items-center space-x-2">
        <SettingsButton onClick={toggleSettings} />
      </div>
    )}
  </div>
);

// Collapsed view component
const CollapsedView = ({ suggestions }: CollapsedViewProps) => {
  const hasHighPriority = suggestions.some((s) => s.priority === "high");
  const suggestionText =
    suggestions.length === 0
      ? "No suggestions"
      : `${suggestions.length} suggestion${suggestions.length !== 1 ? "s" : ""}`;

  return (
    <div className="text-center">
      <span className="text-sm text-gray-600">
        {suggestions.length === 0 ? (
          suggestionText
        ) : (
          <span className="flex items-center justify-center space-x-1">
            <span>{suggestionText}</span>
            {hasHighPriority && <span className="text-red-500 font-medium">!</span>}
          </span>
        )}
      </span>
    </div>
  );
};

// Expanded view component
const ExpandedView = ({
  showSettings,
  analysisSettings,
  updateAnalysisSettings,
  resetAnalysisSettings,
  refreshSuggestions,
  suggestionStats,
  suggestions,
  handleApplySuggestion,
  handleDismissSuggestion,
}: ExpandedViewProps) => (
  <>
    {showSettings && (
      <div className="mb-6">
        <SuggestionSettings
          settings={analysisSettings}
          onUpdateSettings={updateAnalysisSettings}
          onResetSettings={resetAnalysisSettings}
          onRefresh={refreshSuggestions}
          suggestionStats={suggestionStats}
        />
      </div>
    )}
    <SuggestionsList
      suggestions={suggestions}
      onApplySuggestion={handleApplySuggestion}
      onDismissSuggestion={(suggestion: Suggestion) => handleDismissSuggestion(suggestion.id)}
      isCompact={false}
    />
  </>
);

const SmartEnvelopeSuggestions = ({
  transactions = [],
  envelopes = [],
  onCreateEnvelope,
  onUpdateEnvelope,
  onDismissSuggestion,
  dateRange = "6months",
  showDismissed = false,
  className = "",
}: SmartEnvelopeSuggestionsProps) => {
  const {
    suggestions,
    analysisSettings,
    showSettings,
    isCollapsed,
    suggestionStats,
    toggleCollapse,
    updateAnalysisSettings,
    resetAnalysisSettings,
    handleApplySuggestion,
    handleDismissSuggestion,
    refreshSuggestions,
    toggleSettings,
    hasSuggestions,
  } = useSmartSuggestions({
    transactions,
    envelopes,
    onCreateEnvelope,
    onUpdateEnvelope,
    onDismissSuggestion,
    dateRange,
    showDismissed,
  });

  // Auto-collapse when no suggestions available
  const effectiveIsCollapsed = hasSuggestions ? isCollapsed : true;

  // When collapsed and no suggestions, just show a button
  if (effectiveIsCollapsed && !hasSuggestions) {
    const handleClickNoSuggestions = () => {
      globalToast.showInfo(
        "No suggestions available yet. Add more transactions to see smart envelope recommendations!",
        "Smart Suggestions",
        5000
      );
    };

    return (
      <Button
        onClick={handleClickNoSuggestions}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border-2 border-black hover:bg-amber-100 transition-colors"
      >
        <IconBadge isCollapsed={true} />
        <span className="text-sm font-medium text-gray-900">Smart Suggestions</span>
      </Button>
    );
  }

  // When has suggestions, show full container
  const containerPadding = effectiveIsCollapsed ? "p-3" : "p-6";
  const typedSuggestions = suggestions as unknown as Suggestion[];

  return (
    <div
      className={`glassmorphism border-0 ring-1 ring-gray-800/10 rounded-xl transition-all duration-200 ${containerPadding} ${className}`}
    >
      <SuggestionsHeader
        isCollapsed={effectiveIsCollapsed}
        toggleCollapse={toggleCollapse}
        hasSuggestions={hasSuggestions}
        suggestions={typedSuggestions}
        toggleSettings={toggleSettings}
      />

      {effectiveIsCollapsed ? (
        <CollapsedView suggestions={typedSuggestions} />
      ) : (
        <ExpandedView
          showSettings={showSettings}
          analysisSettings={analysisSettings as AnalysisSettings}
          updateAnalysisSettings={
            updateAnalysisSettings as (settings: Partial<AnalysisSettings>) => void
          }
          resetAnalysisSettings={resetAnalysisSettings}
          refreshSuggestions={refreshSuggestions}
          suggestionStats={suggestionStats as unknown as SuggestionStats}
          suggestions={typedSuggestions}
          handleApplySuggestion={
            handleApplySuggestion as unknown as (suggestion: Suggestion) => void
          }
          handleDismissSuggestion={handleDismissSuggestion as (suggestionId: string) => void}
        />
      )}
    </div>
  );
};

export default SmartEnvelopeSuggestions;
