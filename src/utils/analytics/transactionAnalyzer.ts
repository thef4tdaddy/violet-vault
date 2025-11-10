/**
 * Transaction pattern analysis utilities
 * Extracted from useSmartCategoryAnalysis.js to reduce complexity
 */
import { MERCHANT_CATEGORY_PATTERNS, TRANSACTION_CATEGORIES } from "../../constants/categories";
import { extractMerchantName } from "./categoryPatterns";
import type { Transaction } from "../../db/types";
import type { Suggestion } from "./categoryHelpers";

interface MerchantPattern {
  merchant: string;
  transactions: Transaction[];
  totalAmount: number;
  avgAmount: number;
}

interface AnalysisSettings {
  minTransactionCount?: number;
  minAmount?: number;
  unusedCategoryThreshold?: number;
}

/**
 * Analyze uncategorized transactions and suggest categories
 */
export const analyzeUncategorizedTransactions = (
  transactions: Transaction[],
  settings: AnalysisSettings
): Suggestion[] => {
  const suggestions: Suggestion[] = [];
  const { minTransactionCount, minAmount } = settings;

  // Group uncategorized transactions by merchant
  const uncategorizedTransactions = transactions.filter(
    (t) => !t.category || t.category === "Uncategorized" || t.category === ""
  );

  const merchantPatterns: Record<string, MerchantPattern> = {};
  uncategorizedTransactions.forEach((transaction) => {
    const merchant = extractMerchantName(transaction.description);

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

  // Generate suggestions for qualifying merchant patterns
  Object.values(merchantPatterns).forEach((pattern) => {
    if (pattern.transactions.length >= minTransactionCount && pattern.totalAmount >= minAmount) {
      pattern.avgAmount = pattern.totalAmount / pattern.transactions.length;

      // Find suggested category from merchant patterns
      let suggestedCategory = "General";
      for (const [category, regexPattern] of Object.entries(MERCHANT_CATEGORY_PATTERNS)) {
        if (regexPattern.test(pattern.merchant)) {
          suggestedCategory = category;
          break;
        }
      }

      suggestions.push({
        id: `transaction_${pattern.merchant}`,
        type: "add_category",
        priority: pattern.totalAmount > 200 ? "high" : pattern.totalAmount > 50 ? "medium" : "low",
        category: "transaction",
        title: `Categorize "${pattern.merchant}" transactions`,
        description: `${pattern.transactions.length} transactions totaling $${pattern.totalAmount.toFixed(2)}`,
        reasoning: `Average: $${pattern.avgAmount.toFixed(2)} per transaction`,
        suggestedCategory,
        affectedTransactions: pattern.transactions.length,
        impact: pattern.totalAmount,
        action: "categorize_transactions",
        suggestedAmount: pattern.avgAmount,
        data: {
          merchant: pattern.merchant,
          transactionIds: pattern.transactions.map((t) => t.id),
          suggestedCategory,
        },
      });
    }
  });

  return suggestions;
};

/**
 * Analyze unused categories and suggest removal
 */
export const analyzeUnusedCategories = (
  transactions: Transaction[],
  filteredTransactions: Transaction[],
  settings: AnalysisSettings
): Suggestion[] => {
  const suggestions: Suggestion[] = [];
  const { unusedCategoryThreshold } = settings;

  const recentDate = new Date();
  recentDate.setMonth(recentDate.getMonth() - unusedCategoryThreshold);

  TRANSACTION_CATEGORIES.forEach((category) => {
    const recentUsage = filteredTransactions.filter(
      (t) => t.category === category && new Date(t.date) >= recentDate
    );
    const totalUsage = transactions.filter((t) => t.category === category);

    if (recentUsage.length === 0 && totalUsage.length > 0 && totalUsage.length < 10) {
      suggestions.push({
        id: `unused_category_${category}`,
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
        suggestedAmount: 0,
        data: {
          categoryName: category,
          transactionIds: totalUsage.map((t) => t.id),
        },
      });
    }
  });

  return suggestions;
};
