import React, { useMemo } from "react";
import {
  Zap,
  Plus,
  Minus,
  Tag,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Settings,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  BarChart3,
  Filter,
  Target,
  Lightbulb,
  Archive,
  FileText,
  CreditCard,
} from "lucide-react";
import { useSmartCategoryAnalysis } from "../../hooks/analytics/useSmartCategoryAnalysis";
import { useSmartCategoryManager } from "../../hooks/analytics/useSmartCategoryManager";

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

  // Combine all suggestions
  const allSuggestions = useMemo(() => {
    return [...transactionAnalysis, ...billAnalysis]
      .filter((s) => !dismissedSuggestions.has(s.id))
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return b.impact - a.impact;
      })
      .slice(0, 12);
  }, [transactionAnalysis, billAnalysis, dismissedSuggestions]);

  // Category analysis for existing categories
  const categoryStats = useMemo(() => {
    const stats = {};

    // Transaction category stats
    filteredTransactions.forEach((transaction) => {
      const category = transaction.category || "Uncategorized";
      if (!stats[category]) {
        stats[category] = {
          name: category,
          type: "transaction",
          transactionCount: 0,
          totalAmount: 0,
          avgAmount: 0,
          lastUsed: null,
          frequency: 0,
        };
      }

      stats[category].transactionCount++;
      stats[category].totalAmount += Math.abs(transaction.amount);

      const transactionDate = new Date(transaction.date);
      if (!stats[category].lastUsed || transactionDate > stats[category].lastUsed) {
        stats[category].lastUsed = transactionDate;
      }
    });

    // Calculate averages and frequency
    Object.values(stats).forEach((stat) => {
      if (stat.transactionCount > 0) {
        stat.avgAmount = stat.totalAmount / stat.transactionCount;

        // Calculate frequency (transactions per month)
        if (stat.lastUsed) {
          const monthsAgo = (new Date() - stat.lastUsed) / (1000 * 60 * 60 * 24 * 30);
          stat.frequency = stat.transactionCount / Math.max(1, monthsAgo);
        }
      }
    });

    return Object.values(stats).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [filteredTransactions]);

  const handleApplySuggestion = async (suggestion) => {
    const success = await applySuggestion(suggestion, onApplyToTransactions, onApplyToBills);
    if (success && suggestion.action.includes("add")) {
      onAddCategory?.(suggestion.data.categoryName, suggestion.category);
    } else if (success && suggestion.action.includes("remove")) {
      onRemoveCategory?.(suggestion.data.categoryName, suggestion.category);
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <Lightbulb className="h-4 w-4 text-amber-500" />;
      case "low":
        return <Target className="h-4 w-4 text-blue-500" />;
      default:
        return <Zap className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionIcon = (type) => {
    switch (type) {
      case "add_category":
        return <Plus className="h-3 w-3" />;
      case "remove_category":
        return <Minus className="h-3 w-3" />;
      case "consolidate_categories":
        return <Archive className="h-3 w-3" />;
      default:
        return <Tag className="h-3 w-3" />;
    }
  };

  return (
    <div className={`glassmorphism rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <div className="relative mr-3">
              <div className="absolute inset-0 bg-emerald-500 rounded-xl blur-lg opacity-30"></div>
              <div className="relative bg-emerald-500 p-2 rounded-xl">
                <Zap className="h-5 w-5 text-white" />
              </div>
            </div>
            Smart Category Manager
          </h3>
          <p className="text-gray-600 mt-1">
            AI-powered category optimization for bills and transactions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{allSuggestions.length} suggestions</span>
          <button
            onClick={toggleSettings}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-medium text-gray-900 mb-4">Analysis Settings</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="block text-gray-700 mb-1">Min Transactions</label>
              <input
                type="number"
                value={analysisSettings.minTransactionCount}
                onChange={(e) =>
                  handleSettingsChange({
                    minTransactionCount: parseInt(e.target.value) || 5,
                  })
                }
                className="w-full px-2 py-1 border rounded"
                min="1"
                max="20"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Min Amount ($)</label>
              <input
                type="number"
                value={analysisSettings.minAmount}
                onChange={(e) =>
                  handleSettingsChange({
                    minAmount: parseInt(e.target.value) || 25,
                  })
                }
                className="w-full px-2 py-1 border rounded"
                min="1"
                max="500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Unused Threshold (months)</label>
              <input
                type="number"
                value={analysisSettings.unusedCategoryThreshold}
                onChange={(e) =>
                  handleSettingsChange({
                    unusedCategoryThreshold: parseInt(e.target.value) || 3,
                  })
                }
                className="w-full px-2 py-1 border rounded"
                min="1"
                max="12"
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          {
            id: "suggestions",
            name: "Suggestions",
            icon: Lightbulb,
            count: allSuggestions.length,
          },
          {
            id: "analysis",
            name: "Analysis",
            icon: BarChart3,
            count: categoryStats.length,
          },
          { id: "settings", name: "Advanced", icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-2 ${
              activeTab === tab.id
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.name}
            {tab.count !== undefined && (
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "suggestions" && (
        <div className="space-y-4">
          {allSuggestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium">All optimized!</p>
              <p>No category suggestions at this time.</p>
            </div>
          ) : (
            allSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="bg-white/60 rounded-lg p-4 border border-white/20 hover:bg-white/80 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(suggestion.priority)}
                    <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                      {suggestion.category}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApplySuggestion(suggestion)}
                      className="flex items-center gap-1 px-3 py-1 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600"
                    >
                      {getActionIcon(suggestion.type)}
                      Apply
                    </button>
                    <button
                      onClick={() => handleDismissSuggestion(suggestion.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-2">{suggestion.description}</p>
                <p className="text-gray-500 text-xs mb-3">{suggestion.reasoning}</p>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">Impact: ${suggestion.impact.toFixed(2)}</span>
                    <span className="text-gray-600">
                      Affects: {suggestion.affectedTransactions} items
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full ${
                      suggestion.priority === "high"
                        ? "bg-red-100 text-red-800"
                        : suggestion.priority === "medium"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {suggestion.priority}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "analysis" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryStats.map((stat, index) => (
              <div key={index} className="bg-white/60 rounded-lg p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{stat.name}</h4>
                  <span className="text-xs text-gray-500">{stat.type}</span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-medium">${stat.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transactions:</span>
                    <span className="font-medium">{stat.transactionCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Amount:</span>
                    <span className="font-medium">${stat.avgAmount.toFixed(2)}</span>
                  </div>
                  {stat.lastUsed && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Used:</span>
                      <span className="font-medium">
                        {new Date(stat.lastUsed).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-6">
          <div className="bg-white/60 rounded-lg p-4 border border-white/20">
            <h4 className="font-medium text-gray-900 mb-4">Date Range</h4>
            <div className="flex gap-2 flex-wrap">
              {["7", "30", "90", "6months"].map((range) => (
                <button
                  key={range}
                  onClick={() => handleDateRangeChange(range)}
                  className={`px-3 py-2 text-sm rounded-lg ${
                    dateRange === range
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {range === "6months" ? "6 Months" : `${range} Days`}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/60 rounded-lg p-4 border border-white/20">
            <h4 className="font-medium text-gray-900 mb-4">Dismissed Suggestions</h4>
            {dismissedSuggestions.size === 0 ? (
              <p className="text-gray-500 text-sm">No dismissed suggestions</p>
            ) : (
              <div className="space-y-2">
                {Array.from(dismissedSuggestions).map((suggestionId) => (
                  <div
                    key={suggestionId}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm text-gray-600">{suggestionId}</span>
                    <button
                      onClick={() => handleUndismissSuggestion(suggestionId)}
                      className="text-emerald-600 hover:text-emerald-800 text-sm"
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartCategoryManager;
