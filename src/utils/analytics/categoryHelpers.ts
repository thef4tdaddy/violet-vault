/**
 * Utility functions for category analysis and management
 * Handles calculations, statistics, and data transformations
 */

export interface CategoryStat {
  name: string;
  type: string;
  transactionCount: number;
  totalAmount: number;
  avgAmount: number;
  lastUsed: Date | null;
  frequency: number;
}

export interface TransactionForStats {
  category?: string;
  amount: number;
  date: string;
}

/**
 * Calculate category statistics from filtered transactions
 */
export const calculateCategoryStats = (
  filteredTransactions: TransactionForStats[]
): CategoryStat[] => {
  const stats: Record<string, CategoryStat> = {};

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
        const monthsAgo =
          (new Date().getTime() - stat.lastUsed.getTime()) / (1000 * 60 * 60 * 24 * 30);
        stat.frequency = stat.transactionCount / Math.max(1, monthsAgo);
      }
    }
  });

  return Object.values(stats).sort((a, b) => b.totalAmount - a.totalAmount);
};

export interface Suggestion {
  id: string;
  priority: "high" | "medium" | "low";
  impact: number;
  category: string;
  title?: string;
  description?: string;
  action?: string;
  data?: {
    totalAmount?: number;
    transactionCount?: number;
    categoryName?: string;
    billIds?: (string | undefined)[];
  };
}

/**
 * Combine and filter suggestions based on dismissed list
 */
export const processSuggestions = (
  transactionAnalysis: Suggestion[],
  billAnalysis: Suggestion[],
  dismissedSuggestions: Set<string>,
  maxResults = 12
): Suggestion[] => {
  return [...transactionAnalysis, ...billAnalysis]
    .filter((s) => !dismissedSuggestions.has(s.id))
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.impact - a.impact;
    })
    .slice(0, maxResults);
};

/**
 * Apply suggestion to appropriate data source
 */
export const applySuggestionToData = async (
  suggestion: Suggestion,
  onApplyToTransactions?: (suggestion: Suggestion) => Promise<void>,
  onApplyToBills?: (suggestion: Suggestion) => Promise<void>
): Promise<boolean> => {
  try {
    if (suggestion.category === "transactions" && onApplyToTransactions) {
      await onApplyToTransactions(suggestion);
    } else if (suggestion.category === "bills" && onApplyToBills) {
      await onApplyToBills(suggestion);
    }
    return true;
  } catch {
    return false;
  }
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount == null || isNaN(amount)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Math.abs(amount));
};

/**
 * Format frequency as readable text
 */
export const formatFrequency = (frequency: number): string => {
  if (frequency >= 1) {
    return `${frequency.toFixed(1)}/month`;
  } else if (frequency >= 0.1) {
    return `${(frequency * 12).toFixed(1)}/year`;
  } else {
    return "Rarely used";
  }
};

/**
 * Get frequency category for styling
 */
export const getFrequencyCategory = (frequency: number): string => {
  if (frequency > 2) return "high";
  if (frequency < 0.5) return "low";
  return "medium";
};

/**
 * Calculate suggestion impact score
 */
export const calculateSuggestionImpact = (suggestion: Suggestion): number => {
  let impact = 0;

  if (suggestion.data?.totalAmount) {
    impact += suggestion.data.totalAmount * 0.1;
  }

  if (suggestion.data?.transactionCount) {
    impact += suggestion.data.transactionCount * 0.5;
  }

  // Priority multiplier
  const priorityMultiplier: Record<string, number> = { high: 3, medium: 2, low: 1 };
  impact *= priorityMultiplier[suggestion.priority] || 1;

  return Math.round(impact * 10) / 10;
};

/**
 * Validate category name
 */
export const validateCategoryName = (name: string) => {
  const errors = [];

  if (!name || name.trim() === "") {
    errors.push("Category name is required");
  }

  if (name && name.length > 50) {
    errors.push("Category name must be 50 characters or less");
  }

  if (name && !/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
    errors.push(
      "Category name can only contain letters, numbers, spaces, hyphens, and underscores"
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Generate category suggestion ID
 */
export const generateSuggestionId = (
  action: string,
  categoryName: string,
  type: string
): string => {
  const timestamp = Date.now();
  return `${action}_${categoryName.toLowerCase().replace(/\s+/g, "_")}_${type}_${timestamp}`;
};
