/**
 * Transaction Filtering and Sorting Utilities
 * Pure functions for transaction data processing
 * Extracted from useTransactions.js for Issue #508
 */
import logger from "@/utils/core/common/logger";
import type { Transaction } from "@/types/finance";

interface DateRange {
  start?: string;
  end?: string;
}

/**
 * Filter transactions by date range
 * @param {Array} transactions - Transactions to filter
 * @param {Object} dateRange - Date range object with start and end dates
 * @returns {Array} Filtered transactions
 */
export const filterByDateRange = (transactions: Transaction[] = [], dateRange?: DateRange) => {
  if (!dateRange || (!dateRange.start && !dateRange.end)) {
    return transactions;
  }

  try {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);

      if (dateRange.start && transactionDate < new Date(dateRange.start)) {
        return false;
      }

      if (dateRange.end && transactionDate > new Date(dateRange.end)) {
        return false;
      }

      return true;
    });
  } catch (error) {
    logger.error("Error filtering transactions by date range", error);
    return transactions;
  }
};

/**
 * Filter transactions by envelope ID
 * @param {Array} transactions - Transactions to filter
 * @param {string} envelopeId - Envelope ID to filter by
 * @returns {Array} Filtered transactions
 */
export const filterByEnvelope = (
  transactions: Transaction[] = [],
  envelopeId?: string | number
) => {
  if (!envelopeId) return transactions;

  try {
    return transactions.filter((transaction) => transaction.envelopeId === envelopeId);
  } catch (error) {
    logger.error("Error filtering transactions by envelope", error);
    return transactions;
  }
};

/**
 * Filter transactions by category
 * @param {Array} transactions - Transactions to filter
 * @param {string} category - Category to filter by
 * @returns {Array} Filtered transactions
 */
export const filterByCategory = (transactions: Transaction[] = [], category?: string) => {
  if (!category) return transactions;

  try {
    return transactions.filter(
      (transaction) => transaction.category?.toLowerCase() === category.toLowerCase()
    );
  } catch (error) {
    logger.error("Error filtering transactions by category", error);
    return transactions;
  }
};

/**
 * Filter transactions by type (income, expense, transfer)
 * @param {Array} transactions - Transactions to filter
 * @param {string} type - Transaction type to filter by
 * @returns {Array} Filtered transactions
 */
export const filterByType = (transactions: Transaction[] = [], type?: string) => {
  if (!type) return transactions;

  try {
    return transactions.filter((transaction) => {
      switch (type) {
        case "income":
          return transaction.amount > 0;
        case "expense":
          return transaction.amount < 0;
        case "transfer":
          return transaction.type === "transfer";
        default:
          return true;
      }
    });
  } catch (error) {
    logger.error("Error filtering transactions by type", error);
    return transactions;
  }
};

/**
 * Filter transactions by search query
 * @param {Array} transactions - Transactions to filter
 * @param {string} searchQuery - Search query string
 * @returns {Array} Filtered transactions
 */
export const filterBySearch = (transactions: Transaction[] = [], searchQuery?: string) => {
  if (!searchQuery || !searchQuery.trim()) return transactions;

  try {
    const query = searchQuery.toLowerCase().trim();

    return transactions.filter((transaction) => {
      const description = (transaction.description || "").toLowerCase();
      const category = (transaction.category || "").toLowerCase();
      const account = (transaction.account || "").toLowerCase();
      const amount = Math.abs(transaction.amount).toString();

      return (
        description.includes(query) ||
        category.includes(query) ||
        account.includes(query) ||
        amount.includes(query)
      );
    });
  } catch (error) {
    logger.error("Error filtering transactions by search", error);
    return transactions;
  }
};

/**
 * Get sortable value from transaction based on field
 */
const getSortValue = (transaction: Transaction, sortBy: string): string | number | Date => {
  switch (sortBy) {
    case "date":
      return new Date(transaction.date);
    case "amount":
      return Math.abs(transaction.amount);
    case "description":
      return (transaction.description || "").toLowerCase();
    case "category":
      return (transaction.category || "").toLowerCase();
    case "account":
      return (transaction.account || "").toLowerCase();
    default:
      // Default to date sorting for unknown fields
      return new Date(transaction.date);
  }
};

/**
 * Compare two values for sorting
 */
const compareValues = (
  aValue: string | number | Date,
  bValue: string | number | Date,
  sortOrder: string
) => {
  if (aValue < bValue) {
    return sortOrder === "asc" ? -1 : 1;
  }
  if (aValue > bValue) {
    return sortOrder === "asc" ? 1 : -1;
  }
  return 0;
};

/**
 * Sort transactions by field and order
 * @param {Array} transactions - Transactions to sort
 * @param {string} sortBy - Field to sort by (date, amount, description, category)
 * @param {string} sortOrder - Sort order (asc or desc)
 * @returns {Array} Sorted transactions
 */
export const sortTransactions = (
  transactions: Transaction[] = [],
  sortBy: string = "date",
  sortOrder: string = "desc"
) => {
  try {
    return [...transactions].sort((a, b) => {
      const aValue = getSortValue(a, sortBy);
      const bValue = getSortValue(b, sortBy);
      return compareValues(aValue, bValue, sortOrder);
    });
  } catch (error) {
    logger.error("Error sorting transactions", error);
    return transactions;
  }
};

interface ProcessTransactionsOptions {
  dateRange?: { start?: string; end?: string };
  envelopeId?: string;
  category?: string;
  type?: string;
  searchQuery?: string;
  sortBy?: string;
  sortOrder?: string;
  limit?: number;
}

/**
 * Apply multiple filters and sorting to transactions
 * @param {Array} transactions - Transactions to process
 * @param {ProcessTransactionsOptions} options - Filter and sort options
 * @returns {Array} Processed transactions
 */
export const processTransactions = (
  transactions: Transaction[] = [],
  options: ProcessTransactionsOptions = {}
) => {
  try {
    const {
      dateRange,
      envelopeId,
      category,
      type,
      searchQuery,
      sortBy = "date",
      sortOrder = "desc",
      limit,
    } = options;

    let processed = [...transactions];

    // Apply filters in sequence
    if (dateRange) {
      processed = filterByDateRange(processed, dateRange);
    }

    if (envelopeId) {
      processed = filterByEnvelope(processed, envelopeId);
    }

    if (category) {
      processed = filterByCategory(processed, category);
    }

    if (type) {
      processed = filterByType(processed, type);
    }

    if (searchQuery) {
      processed = filterBySearch(processed, searchQuery);
    }

    // Sort transactions
    processed = sortTransactions(processed, sortBy, sortOrder);

    // Apply limit
    if (limit && limit > 0) {
      processed = processed.slice(0, limit);
    }

    return processed;
  } catch (error) {
    logger.error("Error processing transactions", error);
    return transactions;
  }
};

/**
 * Group transactions by date (day, week, month, year)
 * @param {Array} transactions - Transactions to group
 * @param {string} groupBy - Grouping period (day, week, month, year)
 * @returns {Object} Grouped transactions
 */
export const groupTransactionsByDate = (
  transactions: Transaction[] = [],
  groupBy: string = "month"
): Record<string, Transaction[]> => {
  try {
    const groups: Record<string, Transaction[]> = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      let groupKey: string;

      switch (groupBy) {
        case "day":
          groupKey = date.toISOString().split("T")[0];
          break;
        case "week": {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          groupKey = weekStart.toISOString().split("T")[0];
          break;
        }
        case "month":
          groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          break;
        case "year":
          groupKey = date.getFullYear().toString();
          break;
        default:
          groupKey = "all";
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }

      groups[groupKey].push(transaction);
    });

    return groups;
  } catch (error) {
    logger.error("Error grouping transactions by date", error);
    return { all: transactions };
  }
};

/**
 * Group transactions by category
 * @param {Array} transactions - Transactions to group
 * @returns {Object} Grouped transactions by category
 */
export const groupTransactionsByCategory = (
  transactions: Transaction[] = []
): Record<string, Transaction[]> => {
  try {
    const groups: Record<string, Transaction[]> = {};

    transactions.forEach((transaction) => {
      const category = transaction.category || "Uncategorized";

      if (!groups[category]) {
        groups[category] = [];
      }

      groups[category].push(transaction);
    });

    return groups;
  } catch (error) {
    logger.error("Error grouping transactions by category", error);
    return { all: transactions };
  }
};

interface TransactionStats {
  total: number;
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  averageTransaction: number;
  categories: Record<string, { income: number; expenses: number; count: number }>;
  accounts: Record<string, { count: number; total: number }>;
  dailyBreakdown: Record<string, { income: number; expenses: number; count: number }>;
  dateRange: {
    earliest: Date | null;
    latest: Date | null;
  };
  error?: string;
}

/**
 * Calculate comprehensive transaction statistics and analytics
 * @param {Array} transactions - Transactions to analyze
 * @returns {Object} Transaction statistics
 */
export const calculateTransactionStats = (transactions: Transaction[] = []): TransactionStats => {
  try {
    const stats: TransactionStats = {
      total: transactions.length,
      totalIncome: 0,
      totalExpenses: 0,
      netAmount: 0,
      averageTransaction: 0,
      categories: {},
      accounts: {},
      dailyBreakdown: {},
      dateRange: {
        earliest: null,
        latest: null,
      },
    };

    if (transactions.length === 0) return stats;

    let totalAbsoluteAmount = 0;
    const dates: Date[] = [];

    transactions.forEach((transaction) => {
      const amount = transaction.amount;
      totalAbsoluteAmount += Math.abs(amount);

      const date = new Date(transaction.date);
      dates.push(date);
      const dateKey = date.toISOString().split("T")[0];

      // Income vs Expense
      if (amount > 0) {
        stats.totalIncome += amount;
      } else {
        stats.totalExpenses += Math.abs(amount);
      }
      stats.netAmount += amount;

      // Category stats
      const category = transaction.category || "Uncategorized";
      if (!stats.categories[category]) {
        stats.categories[category] = { income: 0, expenses: 0, count: 0 };
      }
      stats.categories[category].count++;
      if (amount > 0) stats.categories[category].income += amount;
      else stats.categories[category].expenses += Math.abs(amount);

      // Account stats
      const account = transaction.account || "Unknown";
      if (!stats.accounts[account]) {
        stats.accounts[account] = { count: 0, total: 0 };
      }
      stats.accounts[account].count++;
      stats.accounts[account].total += Math.abs(amount);

      // Daily breakdown
      if (!stats.dailyBreakdown[dateKey]) {
        stats.dailyBreakdown[dateKey] = { income: 0, expenses: 0, count: 0 };
      }
      if (amount > 0) stats.dailyBreakdown[dateKey].income += amount;
      else stats.dailyBreakdown[dateKey].expenses += Math.abs(amount);
      stats.dailyBreakdown[dateKey].count++;
    });

    stats.averageTransaction = totalAbsoluteAmount / transactions.length;

    if (dates.length > 0) {
      dates.sort((a, b) => a.getTime() - b.getTime());
      stats.dateRange.earliest = dates[0];
      stats.dateRange.latest = dates[dates.length - 1];
    }

    return stats;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("Error calculating transaction statistics", error);
    return {
      total: 0,
      totalIncome: 0,
      totalExpenses: 0,
      netAmount: 0,
      averageTransaction: 0,
      categories: {},
      accounts: {},
      dailyBreakdown: {},
      dateRange: { earliest: null, latest: null },
      error: errorMessage,
    };
  }
};

/**
 * Common date range helpers
 */
export const getDateRanges = () => {
  const now = new Date();

  const getThisMonth = () => ({
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
  });

  const getLastMonth = () => ({
    start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
    end: new Date(now.getFullYear(), now.getMonth(), 0),
  });

  const getLast30Days = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return { start, end };
  };

  return { getThisMonth, getLastMonth, getLast30Days };
};
