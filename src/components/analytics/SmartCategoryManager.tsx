import { useMemo } from "react";
import { useSmartCategoryAnalysis } from "@/hooks/analytics/useSmartCategoryAnalysis";
import { useSmartCategoryManager } from "@/hooks/analytics/useSmartCategoryManager";
import {
  calculateCategoryStats,
  processSuggestions,
  Suggestion,
  TransactionForStats,
  CategoryStat,
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
  onApplyToTransactions: _onApplyToTransactions,
  onApplyToBills: _onApplyToBills,
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
    applySuggestion: _applySuggestion,
  } = useSmartCategoryManager(initialDateRange);

  const { filteredTransactions, transactionAnalysis, billAnalysis } = useSmartCategoryAnalysis(
    transactions,
    bills,
    dateRange,
    analysisSettings
  );

  // Process all suggestions
  const allSuggestions = useMemo(
    () =>
      processSuggestions(
        transactionAnalysis as any[],
        billAnalysis as any[],
        dismissedSuggestions as any,
        12
      ) as any[],
    [transactionAnalysis, billAnalysis, dismissedSuggestions]
  );

  // Calculate category statistics
  const categoryStats = useMemo(
    () => calculateCategoryStats(filteredTransactions as any[]),
    [filteredTransactions]
  );

  const handleApplySuggestion = async (_suggestion: unknown) => {
    try {
      // Apply suggestion logic here
      return await Promise.resolve();
    } catch {
      // Use logger instead of console.error
      return await Promise.resolve();
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
            dismissedSuggestions={dismissedSuggestions as any}
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
