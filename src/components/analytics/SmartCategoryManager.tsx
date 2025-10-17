import React, { useMemo } from "react";
import { useSmartCategoryAnalysis } from "../../hooks/analytics/useSmartCategoryAnalysis";
import { useSmartCategoryManager } from "../../hooks/analytics/useSmartCategoryManager";
import { calculateCategoryStats, processSuggestions } from "../../utils/analytics/categoryHelpers";
import logger from "../../utils/common/logger";
import CategoryManagerHeader from "./CategoryManagerHeader";
import CategorySettingsPanel from "./CategorySettingsPanel";
import CategoryNavigationTabs from "./CategoryNavigationTabs";
import CategorySuggestionsTab from "./CategorySuggestionsTab";
import CategoryAnalysisTab from "./CategoryAnalysisTab";
import CategoryAdvancedTab from "./CategoryAdvancedTab";

const SmartCategoryManager = ({
  transactions = [],
  bills = [],
  _currentCategories = [],
  onAddCategory,
  onRemoveCategory,
  onUpdateCategory, // eslint-disable-line no-unused-vars
  onApplyToTransactions,
  onApplyToBills,
  dateRange: initialDateRange = "6months",
  className = "",
}) => {
  const {
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
  } = useSmartCategoryManager(initialDateRange);

  const { filteredTransactions, transactionAnalysis, billAnalysis } = useSmartCategoryAnalysis(
    transactions,
    bills,
    dateRange,
    analysisSettings
  );

  // Process all suggestions
  const allSuggestions = useMemo(
    () => processSuggestions(transactionAnalysis, billAnalysis, dismissedSuggestions, 12),
    [transactionAnalysis, billAnalysis, dismissedSuggestions]
  );

  // Calculate category statistics
  const categoryStats = useMemo(
    () => calculateCategoryStats(filteredTransactions),
    [filteredTransactions]
  );

  const handleApplySuggestion = async (suggestion) => {
    try {
      const success = await applySuggestion(suggestion, onApplyToTransactions, onApplyToBills);
      if (success && suggestion.action.includes("add")) {
        onAddCategory?.(suggestion.data.categoryName, suggestion.category);
      } else if (success && suggestion.action.includes("remove")) {
        onRemoveCategory?.(suggestion.data.categoryName, suggestion.category);
      }
    } catch (error) {
      logger.error("Failed to apply category suggestion:", error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "suggestions":
        return (
          <CategorySuggestionsTab
            suggestions={allSuggestions}
            onApplySuggestion={handleApplySuggestion}
            onDismissSuggestion={handleDismissSuggestion}
          />
        );
      case "analysis":
        return <CategoryAnalysisTab categoryStats={categoryStats} />;
      case "settings":
        return (
          <CategoryAdvancedTab
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            dismissedSuggestions={dismissedSuggestions}
            onUndismissSuggestion={handleUndismissSuggestion}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`rounded-xl p-6 border-2 border-black bg-purple-100/40 backdrop-blur-sm shadow-xl ${className}`}
    >
      <CategoryManagerHeader
        suggestionCount={allSuggestions.length}
        onToggleSettings={toggleSettings}
      />

      <CategorySettingsPanel
        isVisible={showSettings}
        analysisSettings={analysisSettings}
        onSettingsChange={handleSettingsChange}
      />

      <CategoryNavigationTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        suggestionCount={allSuggestions.length}
        categoryCount={categoryStats.length}
      />

      {renderTabContent()}
    </div>
  );
};

export default SmartCategoryManager;
