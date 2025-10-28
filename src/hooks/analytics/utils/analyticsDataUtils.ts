/**
 * Utility functions for analytics data processing
 * Extracted from useAnalyticsData hook to reduce complexity
 */

import logger from "../../../utils/common/logger";
import { isValidDate } from "../../../utils/validation/dateValidation";

/**
 * Safe division helper
 */
export const safeDivision = (numerator: number, denominator: number, fallback = 0): number => {
  return denominator === 0 ? fallback : numerator / denominator;
};

/**
 * Calculate date range start date for timeFilter
 */
export const getDateRangeStart = (timeFilter: string): Date => {
  const now = new Date();
  const ranges: Record<string, Date> = {
    thisWeek: (() => {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return startOfWeek;
    })(),
    thisMonth: new Date(now.getFullYear(), now.getMonth(), 1),
    lastMonth: new Date(now.getFullYear(), now.getMonth() - 1, 1),
    thisYear: new Date(now.getFullYear(), 0, 1),
    "6months": new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()),
    all: new Date(2020, 0, 1),
  };
  return ranges[timeFilter] || ranges["thisMonth"];
};

interface Transaction {
  date?: string;
  amount?: number;
  envelopeId?: string;
  category?: string;
}

/**
 * Filter transactions by date range
 */
export const filterTransactionsByDate = (
  transactions: Transaction[],
  dateRange: Date
): Transaction[] => {
  return transactions.filter((t) => {
    if (!t || !isValidDate(t.date)) return false;
    try {
      return new Date(t.date!) >= dateRange;
    } catch {
      logger.warn("Invalid date in transaction:", { date: t.date });
      return false;
    }
  });
};

interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  net: number;
  transactionCount: number;
}

/**
 * Calculate monthly spending trends
 */
export const calculateMonthlyTrends = (transactions: Transaction[]): MonthlyTrend[] => {
  const grouped: Record<string, MonthlyTrend> = {};

  transactions.forEach((transaction) => {
    if (!transaction || !isValidDate(transaction.date) || typeof transaction.amount !== "number") {
      return; // Skip invalid transactions
    }

    try {
      const date = new Date(transaction.date!);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          month: monthKey,
          income: 0,
          expenses: 0,
          net: 0,
          transactionCount: 0,
        };
      }

      if (transaction.amount > 0) {
        grouped[monthKey].income += transaction.amount;
      } else {
        grouped[monthKey].expenses += Math.abs(transaction.amount);
      }

      grouped[monthKey].net = grouped[monthKey].income - grouped[monthKey].expenses;
      grouped[monthKey].transactionCount++;
    } catch {
      logger.warn("Error processing transaction in monthlyTrends:", { transaction });
      return;
    }
  });

  const results = Object.values(grouped).sort((a, b) => a.month.localeCompare(b.month));

  // Ensure we always return an array, even if empty
  return results.length > 0
    ? results
    : [
        {
          month: new Date().toISOString().slice(0, 7),
          income: 0,
          expenses: 0,
          net: 0,
          transactionCount: 0,
        },
      ];
};

interface Envelope {
  id: string;
  name: string;
  color?: string;
}

interface EnvelopeSpending {
  name: string;
  amount: number;
  count: number;
  color: string;
}

/**
 * Calculate envelope spending breakdown
 */
export const calculateEnvelopeSpending = (
  transactions: Transaction[],
  envelopes: Envelope[]
): EnvelopeSpending[] => {
  const spending: Record<string, EnvelopeSpending> = {};

  transactions.forEach((transaction) => {
    if (transaction.amount && transaction.amount < 0 && transaction.envelopeId) {
      const envelope = envelopes.find((e) => e.id === transaction.envelopeId);
      const envelopeName = envelope ? envelope.name : "Unknown Envelope";

      if (!spending[envelopeName]) {
        spending[envelopeName] = {
          name: envelopeName,
          amount: 0,
          count: 0,
          color: envelope?.color || "#8B5CF6",
        };
      }

      spending[envelopeName].amount += Math.abs(transaction.amount);
      spending[envelopeName].count++;
    }
  });

  const results = Object.values(spending).sort((a, b) => b.amount - a.amount);
  return results.length > 0 ? results : [];
};

interface CategoryData {
  name: string;
  amount: number;
  count: number;
}

/**
 * Calculate category breakdown
 */
export const calculateCategoryBreakdown = (transactions: Transaction[]): CategoryData[] => {
  const categories: Record<string, CategoryData> = {};

  transactions.forEach((transaction) => {
    if (transaction.amount && transaction.amount < 0) {
      const category = transaction.category || "Uncategorized";

      if (!categories[category]) {
        categories[category] = {
          name: category,
          amount: 0,
          count: 0,
        };
      }

      categories[category].amount += Math.abs(transaction.amount);
      categories[category].count++;
    }
  });

  return Object.values(categories).sort((a, b) => b.amount - a.amount);
};

interface WeeklyPattern {
  day: string;
  amount: number;
  count: number;
}

/**
 * Calculate weekly spending patterns
 */
export const calculateWeeklyPatterns = (transactions: Transaction[]): WeeklyPattern[] => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const patterns = days.map((day) => ({ day, amount: 0, count: 0 }));

  transactions.forEach((transaction) => {
    if (
      transaction &&
      transaction.amount &&
      transaction.amount < 0 &&
      isValidDate(transaction.date)
    ) {
      try {
        const dayIndex = new Date(transaction.date!).getDay();
        if (dayIndex >= 0 && dayIndex < 7) {
          patterns[dayIndex].amount += Math.abs(transaction.amount);
          patterns[dayIndex].count++;
        }
      } catch {
        logger.warn("Invalid date in weeklyPatterns:", { date: transaction.date });
      }
    }
  });

  return patterns;
};
