import React, { useMemo, useState, useEffect } from "react";
import {
  Zap,
  Plus,
  TrendingUp,
  TrendingDown,
  Target,
  Eye,
  X,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Settings,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const SmartEnvelopeSuggestions = ({
  transactions = [],
  envelopes = [],
  onCreateEnvelope,
  onUpdateEnvelope,
  onDismissSuggestion,
  dateRange = "6months", // How far back to analyze
  minAmount = 50, // Minimum spending to suggest envelope
  minTransactions = 3, // Minimum transaction count
  showDismissed = false,
  className = "",
}) => {
  const [dismissedSuggestions, setDismissedSuggestions] = useState(new Set());
  const [showSettings, setShowSettings] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Initialize from localStorage, default to expanded (false)
    const saved = localStorage.getItem("smartSuggestions_collapsed");
    return saved ? JSON.parse(saved) : false;
  });
  const [analysisSettings, setAnalysisSettings] = useState({
    minAmount: minAmount,
    minTransactions: minTransactions,
    overspendingThreshold: 1.2, // 120% of budget
    overfundingThreshold: 3.0, // 3x monthly budget in balance
    bufferPercentage: 1.1, // 110% for suggestions
  });

  // Persist collapse state to localStorage
  useEffect(() => {
    localStorage.setItem("smartSuggestions_collapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const ranges = {
      7: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      30: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      90: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
    };
    const startDate = ranges[dateRange];
    return transactions.filter((t) => new Date(t.date) >= startDate);
  }, [transactions, dateRange]);

  // Calculate months of data for accurate monthly averages
  const monthsOfData = useMemo(() => {
    if (filteredTransactions.length === 0) return 1;

    const dates = filteredTransactions.map((t) => new Date(t.date));
    const earliest = new Date(Math.min(...dates));
    const latest = new Date(Math.max(...dates));

    const monthsDiff =
      (latest.getFullYear() - earliest.getFullYear()) * 12 +
      (latest.getMonth() - earliest.getMonth()) +
      1;

    return Math.max(1, monthsDiff);
  }, [filteredTransactions]);

  // Main suggestion analysis engine
  const suggestions = useMemo(() => {
    const suggestions = [];
    const {
      minAmount,
      minTransactions,
      overspendingThreshold,
      overfundingThreshold,
      bufferPercentage,
    } = analysisSettings;

    // Chart colors for new envelope suggestions
    const chartColors = [
      "#a855f7",
      "#06b6d4",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#14b8a6",
      "#f97316",
      "#84cc16",
      "#6366f1",
    ];

    // 1. UNASSIGNED TRANSACTION ANALYSIS
    const unassignedTransactions = filteredTransactions.filter(
      (t) => t.amount < 0 && (!t.envelopeId || t.envelopeId === "")
    );

    // Group by category
    const unassignedByCategory = {};
    unassignedTransactions.forEach((transaction) => {
      const category = transaction.category || "Uncategorized";
      if (!unassignedByCategory[category]) {
        unassignedByCategory[category] = {
          category,
          amount: 0,
          count: 0,
          transactions: [],
        };
      }
      unassignedByCategory[category].amount += Math.abs(transaction.amount);
      unassignedByCategory[category].count++;
      unassignedByCategory[category].transactions.push(transaction);
    });

    // Suggest envelopes for significant unassigned categories
    Object.values(unassignedByCategory).forEach((categoryData) => {
      if (categoryData.amount >= minAmount && categoryData.count >= minTransactions) {
        const monthlyAverage = categoryData.amount / monthsOfData;
        const suggestedAmount = Math.ceil(monthlyAverage * bufferPercentage);

        suggestions.push({
          id: `unassigned_${categoryData.category}`,
          type: "new_envelope",
          priority: categoryData.amount > 200 ? "high" : "medium",
          title: `Create "${categoryData.category}" Envelope`,
          description: `$${categoryData.amount.toFixed(2)} spent in ${categoryData.count} unassigned transactions`,
          suggestedAmount: suggestedAmount,
          reasoning: `Based on ${categoryData.count} transactions, averaging $${monthlyAverage.toFixed(2)}/month`,
          action: "create_envelope",
          impact: "organization",
          data: {
            name: categoryData.category,
            monthlyAmount: suggestedAmount,
            category: categoryData.category,
            color: chartColors[suggestions.length % chartColors.length],
          },
        });
      }
    });

    // 2. MERCHANT PATTERN ANALYSIS
    const merchantPatterns = {
      "Online Shopping": /amazon|amzn|ebay|etsy|online/i,
      "Coffee & Drinks": /starbucks|coffee|cafe|dunkin|dutch|brew/i,
      "Gas Stations": /shell|exxon|chevron|bp|mobil|gas|fuel/i,
      Subscriptions: /netflix|spotify|hulu|disney|prime|subscription/i,
      Rideshare: /uber|lyft|taxi|ride/i,
      Pharmacy: /cvs|walgreens|pharmacy|drug/i,
      "Fast Food": /mcdonald|burger|taco|pizza|subway|kfc|wendy/i,
      "Grocery Delivery": /instacart|shipt|fresh|delivery/i,
      Streaming: /netflix|hulu|disney|hbo|paramount|apple.*tv/i,
      Fitness: /gym|fitness|planet|la.*fitness|crossfit/i,
    };

    const merchantSpending = {};
    unassignedTransactions.forEach((transaction) => {
      const desc = transaction.description.toLowerCase();

      Object.entries(merchantPatterns).forEach(([category, regex]) => {
        if (regex.test(desc)) {
          if (!merchantSpending[category]) {
            merchantSpending[category] = {
              amount: 0,
              count: 0,
              transactions: [],
            };
          }
          merchantSpending[category].amount += Math.abs(transaction.amount);
          merchantSpending[category].count++;
          merchantSpending[category].transactions.push(transaction);
        }
      });
    });

    // Suggest envelopes for merchant patterns
    Object.entries(merchantSpending).forEach(([category, data]) => {
      if (data.amount >= minAmount && data.count >= minTransactions) {
        const monthlyAverage = data.amount / monthsOfData;
        const suggestedAmount = Math.ceil(monthlyAverage * bufferPercentage);

        // Check if similar envelope already exists
        const existingEnvelope = envelopes.find(
          (e) =>
            e.name.toLowerCase().includes(category.toLowerCase()) ||
            e.category?.toLowerCase().includes(category.toLowerCase())
        );

        if (!existingEnvelope) {
          suggestions.push({
            id: `merchant_${category}`,
            type: "merchant_pattern",
            priority: data.amount > 200 ? "high" : "medium",
            title: `Create "${category}" Envelope`,
            description: `$${data.amount.toFixed(2)} spent across ${data.count} ${category.toLowerCase()} transactions`,
            suggestedAmount: suggestedAmount,
            reasoning: `Detected spending pattern averaging $${monthlyAverage.toFixed(2)}/month`,
            action: "create_envelope",
            impact: "tracking",
            data: {
              name: category,
              monthlyAmount: suggestedAmount,
              category: category,
              color: chartColors[suggestions.length % chartColors.length],
            },
          });
        }
      }
    });

    // 3. ENVELOPE OPTIMIZATION ANALYSIS
    envelopes.forEach((envelope) => {
      const envelopeTransactions = filteredTransactions.filter(
        (t) => t.amount < 0 && t.envelopeId === envelope.id
      );

      if (envelopeTransactions.length === 0) return;

      const totalSpent = envelopeTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const monthlySpent = totalSpent / monthsOfData;
      const monthlyBudget = envelope.monthlyAmount || 0;

      // Overspending detection
      if (monthlySpent > monthlyBudget * overspendingThreshold && monthlyBudget > 0) {
        const overage = monthlySpent - monthlyBudget;
        const suggestedAmount = Math.ceil(monthlySpent * bufferPercentage);

        suggestions.push({
          id: `overspend_${envelope.id}`,
          type: "increase_envelope",
          priority: monthlySpent > monthlyBudget * 1.5 ? "high" : "medium",
          title: `Increase "${envelope.name}" Budget`,
          description: `Spending $${monthlySpent.toFixed(2)}/month vs $${monthlyBudget.toFixed(2)} budgeted`,
          suggestedAmount: suggestedAmount,
          reasoning: `Overspending by $${overage.toFixed(2)}/month consistently`,
          action: "increase_budget",
          impact: "accuracy",
          data: {
            envelopeId: envelope.id,
            currentAmount: monthlyBudget,
            suggestedAmount: suggestedAmount,
          },
        });
      }

      // Overfunding detection
      const currentBalance = envelope.currentBalance || 0;
      if (
        currentBalance > monthlyBudget * overfundingThreshold &&
        monthlyBudget > 0 &&
        monthlySpent < monthlyBudget * 0.6
      ) {
        const suggestedAmount = Math.ceil(monthlySpent * 1.3); // 30% buffer for low-usage

        suggestions.push({
          id: `overfund_${envelope.id}`,
          type: "decrease_envelope",
          priority: "low",
          title: `Reduce "${envelope.name}" Budget`,
          description: `Using only $${monthlySpent.toFixed(2)}/month of $${monthlyBudget.toFixed(2)} budget`,
          suggestedAmount: suggestedAmount,
          reasoning: `Balance of $${currentBalance.toFixed(2)} suggests overfunding`,
          action: "decrease_budget",
          impact: "efficiency",
          data: {
            envelopeId: envelope.id,
            currentAmount: monthlyBudget,
            suggestedAmount: suggestedAmount,
          },
        });
      }
    });

    // Sort by priority and filter dismissed
    return suggestions
      .filter((s) => showDismissed || !dismissedSuggestions.has(s.id))
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return b.suggestedAmount - a.suggestedAmount;
      })
      .slice(0, 10); // Limit to top 10
  }, [
    filteredTransactions,
    envelopes,
    monthsOfData,
    analysisSettings,
    dismissedSuggestions,
    showDismissed,
  ]);

  const handleApplySuggestion = (suggestion) => {
    switch (suggestion.action) {
      case "create_envelope":
        onCreateEnvelope?.(suggestion.data);
        break;
      case "increase_budget":
        onUpdateEnvelope?.(suggestion.data.envelopeId, {
          monthlyAmount: suggestion.data.suggestedAmount,
        });
        break;
      case "decrease_budget":
        onUpdateEnvelope?.(suggestion.data.envelopeId, {
          monthlyAmount: suggestion.data.suggestedAmount,
        });
        break;
    }

    // Auto-dismiss after applying
    handleDismissSuggestion(suggestion.id);
  };

  const handleDismissSuggestion = (suggestionId) => {
    setDismissedSuggestions((prev) => new Set([...prev, suggestionId]));
    onDismissSuggestion?.(suggestionId);
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <Lightbulb className="h-4 w-4 text-amber-500" />;
      case "low":
        return <Target className="h-4 w-4 text-blue-500" />;
      default:
        return <Zap className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "new_envelope":
      case "merchant_pattern":
        return <Plus className="h-3 w-3" />;
      case "increase_envelope":
        return <TrendingUp className="h-3 w-3" />;
      case "decrease_envelope":
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Eye className="h-3 w-3" />;
    }
  };

  return (
    <div
      className={`glassmorphism rounded-xl transition-all duration-200 ${isCollapsed ? "p-3" : "p-6"} ${className}`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between ${isCollapsed ? "mb-0" : "mb-4"}`}>
        <button
          onClick={toggleCollapse}
          className={`flex items-center font-semibold text-gray-900 hover:text-gray-700 transition-colors group ${isCollapsed ? "text-base" : "text-lg"}`}
        >
          <div className={`relative ${isCollapsed ? "mr-2" : "mr-3"}`}>
            <div className={`absolute inset-0 bg-amber-500 rounded-xl blur-lg opacity-30`}></div>
            <div className={`relative bg-amber-500 rounded-xl ${isCollapsed ? "p-1.5" : "p-2"}`}>
              <Zap className={`text-white ${isCollapsed ? "h-3 w-3" : "h-4 w-4"}`} />
            </div>
          </div>
          Smart Suggestions
          <div className="ml-2 transition-transform duration-200 group-hover:scale-110">
            {isCollapsed ? (
              <ChevronDown className={`text-gray-400 ${isCollapsed ? "h-4 w-4" : "h-5 w-5"}`} />
            ) : (
              <ChevronUp className={`text-gray-400 ${isCollapsed ? "h-4 w-4" : "h-5 w-5"}`} />
            )}
          </div>
        </button>

        <div className="flex items-center gap-2">
          <span className={`text-gray-600 ${isCollapsed ? "text-xs" : "text-sm"}`}>
            {suggestions.length} recommendation
            {suggestions.length !== 1 ? "s" : ""}
          </span>
          {!isCollapsed && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isCollapsed ? "max-h-0 opacity-0" : "max-h-[800px] opacity-100"
        }`}
      >
        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-3">Analysis Settings</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-gray-700 mb-1">Min Amount ($)</label>
                <input
                  type="number"
                  value={analysisSettings.minAmount}
                  onChange={(e) =>
                    setAnalysisSettings((prev) => ({
                      ...prev,
                      minAmount: parseInt(e.target.value) || 50,
                    }))
                  }
                  className="w-full px-2 py-1 border rounded"
                  min="10"
                  max="500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Min Transactions</label>
                <input
                  type="number"
                  value={analysisSettings.minTransactions}
                  onChange={(e) =>
                    setAnalysisSettings((prev) => ({
                      ...prev,
                      minTransactions: parseInt(e.target.value) || 3,
                    }))
                  }
                  className="w-full px-2 py-1 border rounded"
                  min="1"
                  max="20"
                />
              </div>
            </div>
          </div>
        )}

        {/* Suggestions List */}
        {suggestions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-400" />
            <p className="font-medium">No suggestions right now</p>
            <p className="text-sm mt-1">Your budget looks well-optimized!</p>
            {dismissedSuggestions.size > 0 && (
              <button
                onClick={() => setDismissedSuggestions(new Set())}
                className="text-xs text-blue-600 hover:text-blue-700 mt-2 flex items-center mx-auto"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Show dismissed suggestions
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className={`p-3 rounded-lg border-l-3 transition-all hover:shadow-sm ${
                  suggestion.priority === "high"
                    ? "bg-red-50 border-red-400"
                    : suggestion.priority === "medium"
                      ? "bg-amber-50 border-amber-400"
                      : "bg-blue-50 border-blue-400"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      {getPriorityIcon(suggestion.priority)}
                      <h4 className="font-medium text-gray-900 text-sm ml-2">{suggestion.title}</h4>
                      <span
                        className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
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

                    <p className="text-sm text-gray-600 mb-1">{suggestion.description}</p>
                    <p className="text-xs text-gray-500 italic">{suggestion.reasoning}</p>
                  </div>

                  <div className="text-right ml-4">
                    <div className="font-bold text-lg text-gray-900">
                      ${suggestion.suggestedAmount}
                    </div>
                    <div className="text-xs text-gray-500">per month</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center text-xs text-gray-500">
                    {getTypeIcon(suggestion.type)}
                    <span className="ml-1 capitalize">{suggestion.action.replace("_", " ")}</span>
                    <span className="mx-2">•</span>
                    <span className="capitalize">{suggestion.impact} impact</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDismissSuggestion(suggestion.id)}
                      className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleApplySuggestion(suggestion)}
                      className={`text-xs px-3 py-1 rounded-lg text-white transition-colors ${
                        suggestion.priority === "high"
                          ? "bg-red-500 hover:bg-red-600"
                          : suggestion.priority === "medium"
                            ? "bg-amber-500 hover:bg-amber-600"
                            : "bg-blue-500 hover:bg-blue-600"
                      }`}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartEnvelopeSuggestions;
