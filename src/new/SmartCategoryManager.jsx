import React, { useState, useMemo } from "react";
import {
  TRANSACTION_CATEGORIES,
  DEFAULT_CATEGORY,
  MERCHANT_CATEGORY_PATTERNS,
} from "../constants/categories";
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

const SmartCategoryManager = ({
  transactions = [],
  bills = [],
  currentCategories = TRANSACTION_CATEGORIES,
  onAddCategory,
  onRemoveCategory,
  onUpdateCategory, // eslint-disable-line no-unused-vars
  onApplyToTransactions,
  onApplyToBills,
  dateRange = "6months",
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState("suggestions"); // suggestions, analysis, settings
  const [showSettings, setShowSettings] = useState(false);
  const [dismissedSuggestions, setDismissedSuggestions] = useState(new Set());

  const [analysisSettings, setAnalysisSettings] = useState({
    minTransactionCount: 5,
    minAmount: 25,
    similarityThreshold: 0.7,
    unusedCategoryThreshold: 3, // months
    consolidationThreshold: 0.8,
  });

  // Filter data by date range
  const getDateRange = () => {
    const now = new Date();
    const ranges = {
      "1month": new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
      "3months": new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()),
      "6months": new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()),
      "1year": new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
      all: new Date(2020, 0, 1),
    };
    return ranges[dateRange];
  };

  const filteredTransactions = useMemo(() => {
    const startDate = getDateRange();
    return transactions.filter((t) => new Date(t.date) >= startDate);
  }, [transactions, dateRange]);

  // Analyze transaction patterns for category suggestions
  const transactionAnalysis = useMemo(() => {
    const suggestions = [];
    const {
      minTransactionCount,
      minAmount,
      similarityThreshold,
      unusedCategoryThreshold,
    } = // eslint-disable-line no-unused-vars
      analysisSettings;

    // 1. UNCATEGORIZED TRANSACTION ANALYSIS
    const uncategorizedTransactions = filteredTransactions.filter(
      (t) => !t.category || t.category === "Uncategorized" || t.category === "",
    );

    // Group by merchant/description patterns
    const merchantPatterns = {};
    uncategorizedTransactions.forEach((transaction) => {
      const desc = transaction.description.toLowerCase();

      // Extract potential merchant names (first part before numbers/symbols)
      const merchantMatch = desc.match(/^([a-zA-Z\s&'-]+)/);
      const merchant = merchantMatch ? merchantMatch[1].trim() : desc;

      if (merchant.length > 2) {
        if (!merchantPatterns[merchant]) {
          merchantPatterns[merchant] = {
            merchant,
            transactions: [],
            totalAmount: 0,
            avgAmount: 0,
          };
        }
        merchantPatterns[merchant].transactions.push(transaction);
        merchantPatterns[merchant].totalAmount += Math.abs(transaction.amount);
      }
    });

    // Calculate averages and suggest categories
    Object.values(merchantPatterns).forEach((pattern) => {
      if (
        pattern.transactions.length >= minTransactionCount &&
        pattern.totalAmount >= minAmount
      ) {
        pattern.avgAmount = pattern.totalAmount / pattern.transactions.length;

        // Suggest category based on merchant patterns
        const suggestedCategory = suggestCategoryFromMerchant(pattern.merchant);

        if (
          suggestedCategory &&
          !currentCategories.includes(suggestedCategory)
        ) {
          suggestions.push({
            id: `new_category_${pattern.merchant}`,
            type: "add_category",
            priority: pattern.totalAmount > 200 ? "high" : "medium",
            category: "transaction",
            title: `Add "${suggestedCategory}" Category`,
            description: `${pattern.transactions.length} transactions from ${pattern.merchant}`,
            reasoning: `$${pattern.totalAmount.toFixed(2)} total, averaging $${pattern.avgAmount.toFixed(2)} per transaction`,
            suggestedCategory: suggestedCategory,
            affectedTransactions: pattern.transactions.length,
            impact: pattern.totalAmount,
            action: "add_transaction_category",
            data: {
              categoryName: suggestedCategory,
              merchantPattern: pattern.merchant,
              transactionIds: pattern.transactions.map((t) => t.id),
            },
          });
        }
      }
    });

    // 2. CATEGORY CONSOLIDATION ANALYSIS
    const categoryUsage = {};
    filteredTransactions.forEach((transaction) => {
      if (transaction.category && transaction.category !== "Uncategorized") {
        if (!categoryUsage[transaction.category]) {
          categoryUsage[transaction.category] = {
            count: 0,
            amount: 0,
            transactions: [],
          };
        }
        categoryUsage[transaction.category].count++;
        categoryUsage[transaction.category].amount += Math.abs(
          transaction.amount,
        );
        categoryUsage[transaction.category].transactions.push(transaction);
      }
    });

    // Find similar categories for consolidation
    const categoryNames = Object.keys(categoryUsage);
    for (let i = 0; i < categoryNames.length; i++) {
      for (let j = i + 1; j < categoryNames.length; j++) {
        const cat1 = categoryNames[i];
        const cat2 = categoryNames[j];
        const similarity = calculateStringSimilarity(cat1, cat2);

        if (similarity > analysisSettings.consolidationThreshold) {
          const usage1 = categoryUsage[cat1];
          const usage2 = categoryUsage[cat2];
          const primaryCategory = usage1.count >= usage2.count ? cat1 : cat2;
          const secondaryCategory = primaryCategory === cat1 ? cat2 : cat1;

          suggestions.push({
            id: `consolidate_${cat1}_${cat2}`,
            type: "consolidate_categories",
            priority: "medium",
            category: "transaction",
            title: `Consolidate "${secondaryCategory}" into "${primaryCategory}"`,
            description: `Similar categories detected with ${similarity * 100}% similarity`,
            reasoning: `Combine ${usage1.count + usage2.count} transactions under one category`,
            suggestedCategory: primaryCategory,
            affectedTransactions: usage1.count + usage2.count,
            impact: usage1.amount + usage2.amount,
            action: "consolidate_transaction_categories",
            data: {
              primaryCategory,
              secondaryCategory,
              transactionIds: [
                ...usage1.transactions,
                ...usage2.transactions,
              ].map((t) => t.id),
            },
          });
        }
      }
    }

    // 3. UNUSED CATEGORY DETECTION
    const now = new Date();
    const thresholdDate = new Date(
      now.getFullYear(),
      now.getMonth() - unusedCategoryThreshold,
      now.getDate(),
    );

    currentCategories.forEach((category) => {
      const recentUsage = filteredTransactions.filter(
        (t) => t.category === category && new Date(t.date) >= thresholdDate,
      );

      const totalUsage = filteredTransactions.filter(
        (t) => t.category === category,
      );

      if (recentUsage.length === 0 && totalUsage.length < 3) {
        suggestions.push({
          id: `remove_category_${category}`,
          type: "remove_category",
          priority: "low",
          category: "transaction",
          title: `Remove "${category}" Category`,
          description: `No recent usage in ${unusedCategoryThreshold} months`,
          reasoning: `Only ${totalUsage.length} total transactions ever used this category`,
          suggestedCategory: category,
          affectedTransactions: totalUsage.length,
          impact: totalUsage.reduce((sum, t) => sum + Math.abs(t.amount), 0),
          action: "remove_transaction_category",
          data: {
            categoryName: category,
            transactionIds: totalUsage.map((t) => t.id),
          },
        });
      }
    });

    return suggestions;
  }, [filteredTransactions, currentCategories, analysisSettings]);

  // Analyze bill patterns for category suggestions
  const billAnalysis = useMemo(() => {
    const suggestions = [];
    const { minAmount } = analysisSettings;

    // 1. BILL CATEGORY GAPS
    const billsByCategory = {};
    bills.forEach((bill) => {
      const category = bill.category || "Uncategorized";
      if (!billsByCategory[category]) {
        billsByCategory[category] = {
          bills: [],
          totalAmount: 0,
          count: 0,
        };
      }
      billsByCategory[category].bills.push(bill);
      billsByCategory[category].totalAmount += bill.amount || 0;
      billsByCategory[category].count++;
    });

    // Suggest specific bill categories if many bills are uncategorized
    if (
      billsByCategory["Uncategorized"] &&
      billsByCategory["Uncategorized"].count >= 3
    ) {
      const uncategorizedBills = billsByCategory["Uncategorized"].bills;

      // Analyze bill types
      const billTypePatterns = {};
      uncategorizedBills.forEach((bill) => {
        const suggestedType = suggestBillCategory(bill.name);
        if (suggestedType && !billTypePatterns[suggestedType]) {
          billTypePatterns[suggestedType] = [];
        }
        if (suggestedType) {
          billTypePatterns[suggestedType].push(bill);
        }
      });

      Object.entries(billTypePatterns).forEach(
        ([categoryType, billsInType]) => {
          if (billsInType.length >= 2) {
            const totalAmount = billsInType.reduce(
              (sum, bill) => sum + (bill.amount || 0),
              0,
            );

            suggestions.push({
              id: `bill_category_${categoryType}`,
              type: "add_category",
              priority: totalAmount > 100 ? "high" : "medium",
              category: "bill",
              title: `Add "${categoryType}" Bill Category`,
              description: `${billsInType.length} bills need this category`,
              reasoning: `Bills: ${billsInType.map((b) => b.name).join(", ")}`,
              suggestedCategory: categoryType,
              affectedTransactions: billsInType.length,
              impact: totalAmount,
              action: "add_bill_category",
              data: {
                categoryName: categoryType,
                billIds: billsInType.map((b) => b.id),
              },
            });
          }
        },
      );
    }

    // 2. BILL CATEGORY OPTIMIZATION
    Object.entries(billsByCategory).forEach(([category, data]) => {
      if (
        category !== "Uncategorized" &&
        data.count === 1 &&
        data.totalAmount < minAmount
      ) {
        suggestions.push({
          id: `optimize_bill_category_${category}`,
          type: "remove_category",
          priority: "low",
          category: "bill",
          title: `Remove "${category}" Bill Category`,
          description: `Only one small bill uses this category`,
          reasoning: `${data.bills[0].name} ($${data.totalAmount.toFixed(2)}) could use a more general category`,
          suggestedCategory: "General",
          affectedTransactions: 1,
          impact: data.totalAmount,
          action: "remove_bill_category",
          data: {
            categoryName: category,
            billIds: data.bills.map((b) => b.id),
          },
        });
      }
    });

    return suggestions;
  }, [bills, analysisSettings]);

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
      if (
        !stats[category].lastUsed ||
        transactionDate > stats[category].lastUsed
      ) {
        stats[category].lastUsed = transactionDate;
      }
    });

    // Calculate averages and frequency
    Object.values(stats).forEach((stat) => {
      if (stat.transactionCount > 0) {
        stat.avgAmount = stat.totalAmount / stat.transactionCount;

        // Calculate frequency (transactions per month)
        if (stat.lastUsed) {
          const monthsAgo =
            (new Date() - stat.lastUsed) / (1000 * 60 * 60 * 24 * 30);
          stat.frequency = stat.transactionCount / Math.max(1, monthsAgo);
        }
      }
    });

    return Object.values(stats).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [filteredTransactions]);

  // Utility functions
  const suggestCategoryFromMerchant = (merchant) => {
    for (const [category, regex] of Object.entries(
      MERCHANT_CATEGORY_PATTERNS,
    )) {
      if (regex.test(merchant)) {
        return category;
      }
    }
    return DEFAULT_CATEGORY;
  };

  const suggestBillCategory = (billName) => {
    for (const [category, regex] of Object.entries(
      MERCHANT_CATEGORY_PATTERNS,
    )) {
      if (regex.test(billName)) {
        return category;
      }
    }
    return DEFAULT_CATEGORY;
  };

  const calculateStringSimilarity = (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = levenshteinDistance(
      longer.toLowerCase(),
      shorter.toLowerCase(),
    );
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1, str2) => {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + substitutionCost,
        );
      }
    }

    return matrix[str2.length][str1.length];
  };

  const handleApplySuggestion = (suggestion) => {
    switch (suggestion.action) {
      case "add_transaction_category":
        onAddCategory?.(suggestion.data.categoryName, "transaction");
        if (onApplyToTransactions) {
          onApplyToTransactions(
            suggestion.data.transactionIds,
            suggestion.data.categoryName,
          );
        }
        break;
      case "add_bill_category":
        onAddCategory?.(suggestion.data.categoryName, "bill");
        if (onApplyToBills) {
          onApplyToBills(suggestion.data.billIds, suggestion.data.categoryName);
        }
        break;
      case "consolidate_transaction_categories":
        if (onApplyToTransactions) {
          onApplyToTransactions(
            suggestion.data.transactionIds,
            suggestion.data.primaryCategory,
          );
        }
        onRemoveCategory?.(suggestion.data.secondaryCategory, "transaction");
        break;
      case "remove_transaction_category":
      case "remove_bill_category":
        onRemoveCategory?.(suggestion.data.categoryName, suggestion.category);
        break;
    }

    setDismissedSuggestions((prev) => new Set([...prev, suggestion.id]));
  };

  const handleDismissSuggestion = (suggestionId) => {
    setDismissedSuggestions((prev) => new Set([...prev, suggestionId]));
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
          <span className="text-sm text-gray-600">
            {allSuggestions.length} suggestions
          </span>
          <button
            onClick={() => setShowSettings(!showSettings)}
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
              <label className="block text-gray-700 mb-1">
                Min Transactions
              </label>
              <input
                type="number"
                value={analysisSettings.minTransactionCount}
                onChange={(e) =>
                  setAnalysisSettings((prev) => ({
                    ...prev,
                    minTransactionCount: parseInt(e.target.value) || 5,
                  }))
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
                  setAnalysisSettings((prev) => ({
                    ...prev,
                    minAmount: parseInt(e.target.value) || 25,
                  }))
                }
                className="w-full px-2 py-1 border rounded"
                min="5"
                max="500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">
                Similarity Threshold
              </label>
              <input
                type="range"
                min="0.5"
                max="1"
                step="0.1"
                value={analysisSettings.similarityThreshold}
                onChange={(e) =>
                  setAnalysisSettings((prev) => ({
                    ...prev,
                    similarityThreshold: parseFloat(e.target.value),
                  }))
                }
                className="w-full"
              />
              <span className="text-xs text-gray-500">
                {(analysisSettings.similarityThreshold * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { id: "suggestions", name: "Suggestions", icon: Lightbulb },
          { id: "analysis", name: "Category Analysis", icon: BarChart3 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab.id
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-600 hover:text-emerald-600"
            }`}
          >
            <tab.icon className="h-4 w-4 inline mr-2" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "suggestions" && (
        <div>
          {allSuggestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-400" />
              <p className="font-medium">No optimization suggestions</p>
              <p className="text-sm mt-1">
                Your categories look well-organized!
              </p>
              {dismissedSuggestions.size > 0 && (
                <button
                  onClick={() => setDismissedSuggestions(new Set())}
                  className="text-xs text-emerald-600 hover:text-emerald-700 mt-2 flex items-center mx-auto"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Show dismissed suggestions
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {allSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-sm ${
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
                        <h4 className="font-medium text-gray-900 text-sm ml-2">
                          {suggestion.title}
                        </h4>
                        <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          {suggestion.category === "transaction" ? (
                            <FileText className="h-3 w-3 inline mr-1" />
                          ) : (
                            <CreditCard className="h-3 w-3 inline mr-1" />
                          )}
                          {suggestion.category}
                        </span>
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

                      <p className="text-sm text-gray-600 mb-1">
                        {suggestion.description}
                      </p>
                      <p className="text-xs text-gray-500 italic">
                        {suggestion.reasoning}
                      </p>

                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <span>
                          Impact: {suggestion.affectedTransactions} items
                        </span>
                        <span className="mx-2">•</span>
                        <span>${suggestion.impact.toFixed(2)} total</span>
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <div className="font-medium text-gray-900">
                        {suggestion.suggestedCategory}
                      </div>
                      <div className="text-xs text-gray-500">suggested</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center text-xs text-gray-500">
                      {getActionIcon(suggestion.type)}
                      <span className="ml-1 capitalize">
                        {suggestion.type.replace(/_/g, " ")}
                      </span>
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
      )}

      {activeTab === "analysis" && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryStats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/60 rounded-lg p-4 border border-white/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{stat.name}</h4>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {stat.type}
                  </span>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transactions:</span>
                    <span className="font-medium">{stat.transactionCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-medium">
                      ${stat.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Amount:</span>
                    <span className="font-medium">
                      ${stat.avgAmount.toFixed(2)}
                    </span>
                  </div>
                  {stat.lastUsed && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Used:</span>
                      <span className="font-medium text-xs">
                        {stat.lastUsed.toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frequency:</span>
                    <span className="font-medium text-xs">
                      {stat.frequency.toFixed(1)}/month
                    </span>
                  </div>
                </div>

                {/* Usage indicator */}
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Usage</span>
                    <span className="text-xs text-gray-500">
                      {stat.frequency > 2
                        ? "Active"
                        : stat.frequency > 0.5
                          ? "Moderate"
                          : "Low"}
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        stat.frequency > 2
                          ? "bg-green-500"
                          : stat.frequency > 0.5
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }`}
                      style={{
                        width: `${Math.min(100, (stat.frequency / 3) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {categoryStats.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No category data available</p>
              <p className="text-sm mt-1">
                Add some transactions to see analysis
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartCategoryManager;
