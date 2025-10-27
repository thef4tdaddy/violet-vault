import React from "react";
import { getIcon } from "../../utils";
import { Button } from "@/components/ui";
import useSmartSuggestions from "../../hooks/budgeting/useSmartSuggestions";
import SuggestionsList from "./suggestions/SuggestionsList";
import SuggestionSettings from "./suggestions/SuggestionSettings";

// Icon badge component
const IconBadge = ({ isCollapsed }) => (
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
const SuggestionBadge = ({ count, hasSuggestions }) => {
  if (!hasSuggestions) return null;

  return (
    <span className="ml-2 bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded-full">
      {count}
    </span>
  );
};

// Settings button component
const SettingsButton = ({ _showSettings, onClick }) => {
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
  showSettings,
  toggleSettings,
}) => (
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
        <SettingsButton showSettings={showSettings} onClick={toggleSettings} />
      </div>
    )}
  </div>
);

// Collapsed view component
const CollapsedView = ({ suggestions }) => {
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
}) => (
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
      onDismissSuggestion={handleDismissSuggestion}
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
}) => {
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

  const containerPadding = isCollapsed ? "p-3" : "p-6";

  return (
    <div
      className={`glassmorphism rounded-xl transition-all duration-200 ${containerPadding} ${className}`}
    >
      <SuggestionsHeader
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
        hasSuggestions={hasSuggestions}
        suggestions={suggestions}
        showSettings={showSettings}
        toggleSettings={toggleSettings}
      />

      {isCollapsed ? (
        <CollapsedView suggestions={suggestions} />
      ) : (
        <ExpandedView
          showSettings={showSettings}
          analysisSettings={analysisSettings}
          updateAnalysisSettings={updateAnalysisSettings}
          resetAnalysisSettings={resetAnalysisSettings}
          refreshSuggestions={refreshSuggestions}
          suggestionStats={suggestionStats}
          suggestions={suggestions}
          handleApplySuggestion={handleApplySuggestion}
          handleDismissSuggestion={handleDismissSuggestion}
        />
      )}
    </div>
  );
};

export default SmartEnvelopeSuggestions;
