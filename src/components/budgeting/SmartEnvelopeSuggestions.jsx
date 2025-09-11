import React from "react";
import { Zap, Settings, ChevronDown, ChevronUp } from "lucide-react";
import useSmartSuggestions from "../../hooks/budgeting/useSmartSuggestions";
import SuggestionsList from "./suggestions/SuggestionsList";
import SuggestionSettings from "./suggestions/SuggestionSettings";

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
    // State
    suggestions,
    analysisSettings,
    showSettings,
    isCollapsed,
    suggestionStats,

    // Actions
    toggleCollapse,
    updateAnalysisSettings,
    resetAnalysisSettings,
    handleApplySuggestion,
    handleDismissSuggestion,
    refreshSuggestions,
    toggleSettings,

    // Computed values
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

  return (
    <div
      className={`glassmorphism rounded-xl transition-all duration-200 ${
        isCollapsed ? "p-3" : "p-6"
      } ${className}`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between ${isCollapsed ? "mb-0" : "mb-4"}`}>
        <button
          onClick={toggleCollapse}
          className={`flex items-center font-semibold text-gray-900 hover:text-gray-700 transition-colors group ${
            isCollapsed ? "text-base" : "text-lg"
          }`}
        >
          <div className={`relative ${isCollapsed ? "mr-2" : "mr-3"}`}>
            <div className="absolute inset-0 bg-amber-500 rounded-xl blur-lg opacity-30"></div>
            <div className={`relative bg-amber-500 rounded-xl ${isCollapsed ? "p-1.5" : "p-2"}`}>
              <Zap className={`text-white ${isCollapsed ? "h-3 w-3" : "h-4 w-4"}`} />
            </div>
          </div>
          Smart Suggestions
          {hasSuggestions && (
            <span className="ml-2 bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded-full">
              {suggestions.length}
            </span>
          )}
          <div className="ml-2 transition-transform duration-200 group-hover:scale-110">
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </div>
        </button>

        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleSettings}
              className={`p-2 rounded-lg transition-colors ${
                showSettings
                  ? "bg-amber-100 text-amber-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Collapsed state - show count only */}
      {isCollapsed ? (
        <div className="text-center">
          <span className="text-sm text-gray-600">
            {suggestions.length === 0 ? (
              "No suggestions"
            ) : (
              <span className="flex items-center justify-center space-x-1">
                <span>
                  {suggestions.length} suggestion
                  {suggestions.length !== 1 ? "s" : ""}
                </span>
                {suggestions.some((s) => s.priority === "high") && (
                  <span className="text-red-500 font-medium">!</span>
                )}
              </span>
            )}
          </span>
        </div>
      ) : (
        <>
          {/* Settings Panel */}
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

          {/* Suggestions List */}
          <SuggestionsList
            suggestions={suggestions}
            onApplySuggestion={handleApplySuggestion}
            onDismissSuggestion={handleDismissSuggestion}
            isCompact={false}
          />
        </>
      )}
    </div>
  );
};

export default SmartEnvelopeSuggestions;
