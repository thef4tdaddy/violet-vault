import { useMemo } from "react";
import { useSmartCategoryAnalysis } from "@/hooks/platform/analytics/useSmartCategoryAnalysis";
import { useSmartCategoryManager } from "@/hooks/platform/analytics/useSmartCategoryManager";
import {
  calculateCategoryStats,
  processSuggestions,
  Suggestion,
  TransactionForStats,
} from "@/utils/analytics/categoryHelpers";
import CategoryManagerHeader from "./CategoryManagerHeader";
import CategorySettingsPanel from "./CategorySettingsPanel";
import CategoryNavigationTabs from "./CategoryNavigationTabs";
import CategorySuggestionsTab from "./CategorySuggestionsTab";
import CategoryAnalysisTab from "./CategoryAnalysisTab";
import CategoryAdvancedTab from "./CategoryAdvancedTab";

interface SmartCategoryManagerProps {
  transactions?: TransactionForStats[];
  bills?: Array<Record<string, unknown>>;
  onAddCategory: (name: string, category: string) => void;
  onRemoveCategory: (name: string, category: string) => void;
  onApplyToTransactions: (
    suggestion: Suggestion,
    updates?: Record<string, unknown>
  ) => Promise<void>;
  onApplyToBills: (suggestion: Suggestion, updates?: Record<string, unknown>) => Promise<void>;
  dateRange?: string;
  className?: string;
}

const SmartCategoryManager = ({
  transactions = [],
  bills = [],
  onAddCategory: _onAddCategory,
  onRemoveCategory: _onRemoveCategory,
  onApplyToTransactions,
  onApplyToBills,
  dateRange: initialDateRange = "6months",
  className = "",
}: SmartCategoryManagerProps) => {
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

  const allSuggestions = useMemo<Suggestion[]>(
    () => processSuggestions(transactionAnalysis, billAnalysis, dismissedSuggestions, 12),
    [transactionAnalysis, billAnalysis, dismissedSuggestions]
  );

  const categoryStats = useMemo(
    () => calculateCategoryStats(filteredTransactions),
    [filteredTransactions]
  );

  const handleApplySuggestion = (suggestion: Suggestion) => {
    void applySuggestion(suggestion, onApplyToTransactions, onApplyToBills);
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
            dismissedSuggestions={Array.from(dismissedSuggestions)}
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
