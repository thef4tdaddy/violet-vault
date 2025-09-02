import { useMemo } from "react";
import {
  TRANSACTION_CATEGORIES,
  MERCHANT_CATEGORY_PATTERNS,
} from "../../constants/categories";

/**
 * Hook for analyzing transaction patterns and suggesting categories
 * Extracts complex analysis logic from SmartCategoryManager component
 */
export const useSmartCategoryAnalysis = (
  transactions = [],
  bills = [],
  dateRange = "6months",
  analysisSettings = {},
) => {
  const defaultSettings = {
    minTransactionCount: 5,
    minAmount: 25,
    similarityThreshold: 0.7,
    unusedCategoryThreshold: 3, // months
    consolidationThreshold: 0.8,
  };

  const settings = { ...defaultSettings, ...analysisSettings };

  // Filter transactions by date range
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

  // Extract merchant names from transaction descriptions
  const extractMerchantName = (description) => {
    const desc = description.toLowerCase();
    const merchantMatch = desc.match(/^([a-zA-Z\s&'-]+)/);
    return merchantMatch ? merchantMatch[1].trim() : desc;
  };

  // Suggest bill category based on name patterns
  const suggestBillCategory = (billName) => {
    const name = billName.toLowerCase();

    if (
      name.includes("electric") ||
      name.includes("power") ||
      name.includes("utility")
    ) {
      return "Utilities";
    }
    if (name.includes("gas") || name.includes("heating")) {
      return "Utilities";
    }
    if (name.includes("water") || name.includes("sewer")) {
      return "Utilities";
    }
    if (
      name.includes("internet") ||
      name.includes("cable") ||
      name.includes("phone")
    ) {
      return "Communications";
    }
    if (name.includes("insurance")) {
      return "Insurance";
    }
    if (
      name.includes("loan") ||
      name.includes("mortgage") ||
      name.includes("rent")
    ) {
      return "Housing";
    }
    if (
      name.includes("netflix") ||
      name.includes("spotify") ||
      name.includes("subscription")
    ) {
      return "Entertainment";
    }

    return null;
  };

  // Analyze transaction patterns for category suggestions
  const transactionAnalysis = useMemo(() => {
    const suggestions = [];
    const { minTransactionCount, minAmount, unusedCategoryThreshold } =
      settings;

    // 1. UNCATEGORIZED TRANSACTION ANALYSIS
    const uncategorizedTransactions = filteredTransactions.filter(
      (t) => !t.category || t.category === "Uncategorized" || t.category === "",
    );

    // Group by merchant/description patterns
    const merchantPatterns = {};
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

    // Calculate averages and suggest categories
    Object.values(merchantPatterns).forEach((pattern) => {
      if (
        pattern.transactions.length >= minTransactionCount &&
        pattern.totalAmount >= minAmount
      ) {
        pattern.avgAmount = pattern.totalAmount / pattern.transactions.length;

        // Try to match with known merchant patterns
        let suggestedCategory = "General";
        for (const [category, patterns] of Object.entries(
          MERCHANT_CATEGORY_PATTERNS,
        )) {
          if (
            patterns.some((p) => pattern.merchant.includes(p.toLowerCase()))
          ) {
            suggestedCategory = category;
            break;
          }
        }

        suggestions.push({
          id: `transaction_${pattern.merchant}`,
          type: "add_category",
          priority:
            pattern.totalAmount > 200
              ? "high"
              : pattern.totalAmount > 50
                ? "medium"
                : "low",
          category: "transaction",
          title: `Categorize "${pattern.merchant}" transactions`,
          description: `${pattern.transactions.length} transactions totaling $${pattern.totalAmount.toFixed(2)}`,
          reasoning: `Average: $${pattern.avgAmount.toFixed(2)} per transaction`,
          suggestedCategory,
          affectedTransactions: pattern.transactions.length,
          impact: pattern.totalAmount,
          action: "categorize_transactions",
          data: {
            merchant: pattern.merchant,
            transactionIds: pattern.transactions.map((t) => t.id),
            suggestedCategory,
          },
        });
      }
    });

    // 2. UNUSED CATEGORY ANALYSIS
    const recentDate = new Date();
    recentDate.setMonth(recentDate.getMonth() - unusedCategoryThreshold);

    TRANSACTION_CATEGORIES.forEach((category) => {
      const recentUsage = filteredTransactions.filter(
        (t) => t.category === category && new Date(t.date) >= recentDate,
      );
      const totalUsage = transactions.filter((t) => t.category === category);

      if (
        recentUsage.length === 0 &&
        totalUsage.length > 0 &&
        totalUsage.length < 10
      ) {
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
          data: {
            categoryName: category,
            transactionIds: totalUsage.map((t) => t.id),
          },
        });
      }
    });

    return suggestions;
  }, [filteredTransactions, transactions, settings]);

  // Analyze bill patterns for category suggestions
  const billAnalysis = useMemo(() => {
    const suggestions = [];
    const { minAmount } = settings;

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
  }, [bills, settings]);

  return {
    filteredTransactions,
    transactionAnalysis,
    billAnalysis,
    extractMerchantName,
    suggestBillCategory,
  };
};
