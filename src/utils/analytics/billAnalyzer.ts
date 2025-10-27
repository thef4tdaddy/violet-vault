/**
 * Bill pattern analysis utilities
 * Extracted from useSmartCategoryAnalysis.js to reduce complexity
 */
import { suggestBillCategory } from "./categoryPatterns";

interface Bill {
  name: string;
  category?: string;
  amount?: number;
  [key: string]: unknown;
}

interface BillCategorySuggestion {
  id: string;
  type: string;
  priority: string;
  category: string;
  title: string;
  description: string;
  reasoning: string;
  suggestedCategory: string;
  affectedTransactions: number;
  estimatedImpact: string;
}

interface AnalysisSettings {
  minAmount?: number;
  [key: string]: unknown;
}

/**
 * Analyze bill categorization gaps and suggest improvements
 */
export const analyzeBillCategorization = (bills: Bill[], settings: AnalysisSettings): BillCategorySuggestion[] => {
  const suggestions: BillCategorySuggestion[] = [];

  // Group bills by category
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

  // Analyze uncategorized bills for category suggestions
  if (billsByCategory["Uncategorized"] && billsByCategory["Uncategorized"].count >= 3) {
    const uncategorizedBills = billsByCategory["Uncategorized"].bills;

    // Group by suggested bill type
    const billTypePatterns = {};
    uncategorizedBills.forEach((bill) => {
      const suggestedType = suggestBillCategory(bill.name);
      if (suggestedType) {
        if (!billTypePatterns[suggestedType]) {
          billTypePatterns[suggestedType] = [];
        }
        billTypePatterns[suggestedType].push(bill);
      }
    });

    // Create suggestions for each bill type with multiple bills
    Object.entries(billTypePatterns).forEach(([categoryType, billsInType]) => {
      const typedBills = billsInType as Bill[];
      if (typedBills.length >= 2) {
        const totalAmount = typedBills.reduce((sum, bill) => sum + (bill.amount || 0), 0);

        suggestions.push({
          id: `bill_category_${categoryType}`,
          type: "add_category",
          priority: totalAmount > 100 ? "high" : "medium",
          category: "bill",
          title: `Add "${categoryType}" Bill Category`,
          description: `${typedBills.length} bills need this category`,
          reasoning: `Bills: ${typedBills.map((b) => b.name).join(", ")}`,
          suggestedCategory: categoryType,
          affectedTransactions: typedBills.length,
          impact: totalAmount,
          action: "add_bill_category",
          data: {
            categoryName: categoryType,
            billIds: billsInType.map((b) => b.id),
          },
        });
      }
    });
  }

  return suggestions;
};

/**
 * Analyze bill category optimization opportunities
 */
export const analyzeBillCategoryOptimization = (bills, settings) => {
  const suggestions = [];
  const { minAmount } = settings;

  // Group bills by category
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

  // Suggest removing categories with single small bills
  Object.entries(billsByCategory).forEach(([category, data]) => {
    if (category !== "Uncategorized" && data.count === 1 && data.totalAmount < minAmount) {
      suggestions.push({
        id: `optimize_bill_category_${category}`,
        type: "remove_category",
        priority: "low",
        category: "bill",
        title: `Remove "${category}" Bill Category`,
        description: "Only one small bill uses this category",
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
};
