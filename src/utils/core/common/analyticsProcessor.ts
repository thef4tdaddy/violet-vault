import logger from "@/utils/core/common/logger";
import { validateTransactionSafe, validateEnvelopeSafe } from "@/domain/schemas/index.ts";

/**
 * Analytics data processing utilities
 * Extracted from ChartsAndAnalytics.jsx for better reusability
 * Issue #151 - ChartsAndAnalytics refactoring
 * Now using Zod schemas for validation (Issue #412)
 */

// Type definitions
interface MonthlyGroupData {
  month: string;
  income: number;
  expenses: number;
  net: number;
  transactionCount: number;
  transactions: unknown[];
}

interface CategoryGroupData {
  name: string;
  income: number;
  expenses: number;
  net: number;
  count: number;
  transactions: unknown[];
}

interface EnvelopeSpendingData {
  name: string;
  envelopeId: string;
  amount: number;
  count: number;
  budget: number;
  color: string;
  transactions: unknown[];
  utilizationRate?: number;
  remainingBudget?: number;
}

/**
 * Validate transaction using Zod schema
 * Used as filter predicate for analytics data
 */
export const validateTransaction = (transaction: unknown): boolean => {
  if (!transaction || typeof transaction !== "object") {
    return false;
  }
  const result = validateTransactionSafe(transaction);
  return result.success;
};

/**
 * Validate envelope using Zod schema
 * Used as filter predicate for analytics data
 */
export const validateEnvelope = (envelope: unknown): boolean => {
  if (!envelope || typeof envelope !== "object") {
    return false;
  }
  const result = validateEnvelopeSafe(envelope);
  return result.success;
};

// Date utilities
export const isValidDate = (dateString: string | Date | undefined | null): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) && date.getFullYear() > 1900;
};

export const getDateRangeFilter = (timeFilter: string): Date => {
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
    last3Months: new Date(now.getFullYear(), now.getMonth() - 3, 1),
    last6Months: new Date(now.getFullYear(), now.getMonth() - 6, 1),
    thisYear: new Date(now.getFullYear(), 0, 1),
    lastYear: new Date(now.getFullYear() - 1, 0, 1),
    all: new Date(2020, 0, 1),
  };
  return ranges[timeFilter] || ranges["thisMonth"];
};

// Math utilities
export const safeDivision = (numerator: number, denominator: number, fallback = 0): number => {
  return denominator === 0 ? fallback : numerator / denominator;
};

export const calculatePercentage = (value: number, total: number, decimals = 1): string => {
  return total === 0 ? "0" : ((value / total) * 100).toFixed(decimals);
};

export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
};

// Transaction processing
export const _filterTransactionsByDateRange = (
  transactions: unknown[],
  timeFilter: string
): unknown[] => {
  const dateRange = getDateRangeFilter(timeFilter);

  return transactions.filter((transaction) => {
    if (!validateTransaction(transaction)) return false;

    try {
      const txn = transaction as { date: string | Date };
      return new Date(txn.date) >= dateRange;
    } catch {
      const date = (transaction as { date?: unknown }).date;
      logger.warn("Invalid date in transaction:", { date: String(date) });
      return false;
    }
  });
};

export const groupTransactionsByMonth = (transactions: unknown[]): MonthlyGroupData[] => {
  const grouped: Record<string, MonthlyGroupData> = {};

  transactions.forEach((transaction) => {
    if (!validateTransaction(transaction)) return;

    try {
      const txn = transaction as { date: string | Date; amount: number };
      const date = new Date(txn.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          month: monthKey,
          income: 0,
          expenses: 0,
          net: 0,
          transactionCount: 0,
          transactions: [],
        };
      }

      if (txn.amount > 0) {
        grouped[monthKey].income += txn.amount;
      } else {
        grouped[monthKey].expenses += Math.abs(txn.amount);
      }

      grouped[monthKey].net = grouped[monthKey].income - grouped[monthKey].expenses;
      grouped[monthKey].transactionCount++;
      grouped[monthKey].transactions.push(transaction);
    } catch (error) {
      logger.warn("Error processing transaction in grouping:", { error: String(error) });
    }
  });

  return Object.values(grouped).sort((a, b) => a.month.localeCompare(b.month));
};

export const groupTransactionsByCategory = (transactions: unknown[]): CategoryGroupData[] => {
  const categories: Record<string, CategoryGroupData> = {};

  transactions.forEach((transaction) => {
    if (!validateTransaction(transaction)) return;

    const txn = transaction as { category?: string; amount: number };
    const category = txn.category || "Uncategorized";

    if (!categories[category]) {
      categories[category] = {
        name: category,
        income: 0,
        expenses: 0,
        net: 0,
        count: 0,
        transactions: [],
      };
    }

    if (txn.amount > 0) {
      categories[category].income += txn.amount;
    } else {
      categories[category].expenses += Math.abs(txn.amount);
    }

    categories[category].net = categories[category].income - categories[category].expenses;
    categories[category].count++;
    categories[category].transactions.push(transaction);
  });

  return Object.values(categories).sort((a, b) => b.expenses - a.expenses);
};

export const groupTransactionsByWeekday = (transactions: unknown[]): unknown[] => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const patterns = days.map((day, index) => ({
    day,
    dayIndex: index,
    income: 0,
    expenses: 0,
    net: 0,
    count: 0,
    transactions: [] as unknown[],
  }));

  transactions.forEach((transaction) => {
    if (!validateTransaction(transaction)) return;

    try {
      const txn = transaction as { date: string | Date; amount: number };
      const dayIndex = new Date(txn.date).getDay();
      if (dayIndex >= 0 && dayIndex < 7) {
        if (txn.amount > 0) {
          patterns[dayIndex].income += txn.amount;
        } else {
          patterns[dayIndex].expenses += Math.abs(txn.amount);
        }

        patterns[dayIndex].net = patterns[dayIndex].income - patterns[dayIndex].expenses;
        patterns[dayIndex].count++;
        patterns[dayIndex].transactions.push(transaction);
      }
    } catch {
      const date = (transaction as { date?: unknown }).date;
      logger.warn("Invalid date in weekday patterns:", { date: String(date) });
    }
  });

  return patterns;
};

// Envelope processing
export const analyzeEnvelopeSpending = (
  transactions: unknown[],
  envelopes: unknown[]
): EnvelopeSpendingData[] => {
  const spending: Record<string, EnvelopeSpendingData> = {};

  transactions.forEach((transaction) => {
    if (!validateTransaction(transaction)) return;

    const txn = transaction as { amount: number; envelopeId?: string };
    if (txn.amount >= 0 || !txn.envelopeId) {
      return;
    }

    const envelope = envelopes.find((e) => (e as { id?: string }).id === txn.envelopeId) as
      | { name?: string; monthlyAmount?: number; color?: string }
      | undefined;
    const envelopeName = envelope ? envelope.name || "Unknown Envelope" : "Unknown Envelope";

    if (!spending[envelopeName]) {
      spending[envelopeName] = {
        name: envelopeName,
        envelopeId: txn.envelopeId,
        amount: 0,
        count: 0,
        budget: envelope?.monthlyAmount || 0,
        color: envelope?.color || "#8B5CF6",
        transactions: [],
      };
    }

    spending[envelopeName].amount += Math.abs(txn.amount);
    spending[envelopeName].count++;
    spending[envelopeName].transactions.push(transaction);
  });

  // Calculate utilization rates
  return Object.values(spending)
    .map((env) => ({
      ...env,
      utilizationRate: safeDivision(env.amount, env.budget, 0) * 100,
      remainingBudget: Math.max(0, env.budget - env.amount),
    }))
    .sort((a, b) => b.amount - a.amount);
};

export const analyzeEnvelopeHealth = (envelopes: unknown[]): unknown[] => {
  return envelopes.filter(validateEnvelope).map((envelope) => {
    const env = envelope as {
      id?: string;
      name?: string;
      monthlyAmount?: number;
      currentBalance?: number;
      color?: string;
      spendingHistory?: Array<{ amount: number }>;
    };
    const monthlyBudget = env.monthlyAmount || 0;
    const currentBalance = env.currentBalance || 0;
    const spent = env.spendingHistory?.reduce((sum, s) => sum + s.amount, 0) || 0;

    const healthScore = safeDivision(currentBalance, monthlyBudget, 1) * 100;
    let status = "healthy";

    if (healthScore < 20) status = "critical";
    else if (healthScore < 50) status = "warning";
    else if (healthScore > 150) status = "overfunded";

    return {
      id: env.id,
      name: env.name,
      currentBalance,
      monthlyBudget,
      spent,
      healthScore: Math.max(0, Math.min(200, healthScore)),
      status,
      color: env.color,
      utilizationRate: safeDivision(spent, monthlyBudget, 0) * 100,
    };
  });
};

// Financial metrics calculation
export const _calculateFinancialMetrics = (
  transactions: unknown[],
  envelopes: unknown[]
): unknown => {
  const validTransactions = transactions.filter(validateTransaction);

  const totalIncome: number = validTransactions
    .filter((t) => (t as { amount: number }).amount > 0)
    .reduce((sum: number, t) => sum + (t as { amount: number }).amount, 0) as number;

  const totalExpenses: number = validTransactions
    .filter((t) => (t as { amount: number }).amount < 0)
    .reduce((sum: number, t) => sum + Math.abs((t as { amount: number }).amount), 0) as number;

  const netCashFlow: number = totalIncome - totalExpenses;
  const savingsRate: number = safeDivision(netCashFlow, totalIncome, 0) * 100;

  // Monthly averages
  const monthlyData = groupTransactionsByMonth(validTransactions);
  const avgMonthlyIncome: number =
    monthlyData.length > 0
      ? safeDivision(
          monthlyData.reduce((sum: number, m) => sum + m.income, 0),
          monthlyData.length,
          0
        )
      : 0;

  const avgMonthlyExpenses: number =
    monthlyData.length > 0
      ? safeDivision(
          monthlyData.reduce((sum: number, m) => sum + m.expenses, 0),
          monthlyData.length,
          0
        )
      : 0;

  // Envelope metrics
  const totalEnvelopeBudget: number = envelopes
    .filter(validateEnvelope)
    .reduce(
      (sum: number, env) => sum + ((env as { monthlyAmount?: number }).monthlyAmount || 0),
      0
    ) as number;

  const totalEnvelopeBalance: number = envelopes
    .filter(validateEnvelope)
    .reduce(
      (sum: number, env) => sum + ((env as { currentBalance?: number }).currentBalance || 0),
      0
    ) as number;

  const budgetUtilization: number = safeDivision(totalExpenses, totalEnvelopeBudget, 0) * 100;

  return {
    totalIncome,
    totalExpenses,
    netCashFlow,
    savingsRate,
    avgMonthlyIncome,
    avgMonthlyExpenses,
    transactionCount: validTransactions.length,
    // Envelope metrics
    totalEnvelopeBudget,
    totalEnvelopeBalance,
    budgetUtilization,
    // Derived metrics
    incomeToExpenseRatio: safeDivision(totalIncome, totalExpenses, 0),
    expenseGrowthRate: 0, // Would require historical comparison
    // Time-based metrics
    dailyAverageIncome: safeDivision(totalIncome, 30, 0), // Approximate
    dailyAverageExpense: safeDivision(totalExpenses, 30, 0), // Approximate
  };
};

// Trend analysis
export const calculateTrends = (monthlyData: MonthlyGroupData[]): unknown => {
  if (monthlyData.length < 2) {
    return {
      incomeGrowth: 0,
      expenseGrowth: 0,
      netGrowth: 0,
      trend: "stable",
    };
  }

  const latest = monthlyData[monthlyData.length - 1];
  const previous = monthlyData[monthlyData.length - 2];

  const incomeGrowth = calculateGrowthRate(latest.income, previous.income);
  const expenseGrowth = calculateGrowthRate(latest.expenses, previous.expenses);
  const netGrowth = calculateGrowthRate(latest.net, previous.net);

  let trend = "stable";
  if (netGrowth > 5) trend = "improving";
  else if (netGrowth < -5) trend = "declining";

  return {
    incomeGrowth: Number(incomeGrowth.toFixed(1)),
    expenseGrowth: Number(expenseGrowth.toFixed(1)),
    netGrowth: Number(netGrowth.toFixed(1)),
    trend,
    latest,
    previous,
  };
};

// Export processing
export const prepareDataForExport = (
  analyticsData: {
    monthlyTrends: unknown[];
    categoryBreakdown: unknown[];
    envelopeSpending: unknown[];
    metrics: unknown;
  },
  format = "csv"
): unknown => {
  const { monthlyTrends, categoryBreakdown, envelopeSpending, metrics } = analyticsData;

  if (format === "csv") {
    const csvData: unknown[] = [];

    // Headers
    csvData.push(["Type", "Period/Name", "Income", "Expenses", "Net", "Count", "Category"]);

    // Monthly data
    (monthlyTrends as MonthlyGroupData[]).forEach((month) => {
      csvData.push([
        "Monthly",
        month.month,
        month.income,
        month.expenses,
        month.net,
        month.transactionCount,
        "Timeline",
      ]);
    });

    // Category data
    (categoryBreakdown as CategoryGroupData[]).forEach((category) => {
      csvData.push([
        "Category",
        category.name,
        category.income || 0,
        category.expenses,
        category.net || (category.income || 0) - category.expenses,
        category.count,
        "Spending",
      ]);
    });

    // Envelope data
    (envelopeSpending as EnvelopeSpendingData[]).forEach((envelope) => {
      csvData.push([
        "Envelope",
        envelope.name,
        0,
        envelope.amount,
        -envelope.amount,
        envelope.count,
        "Budget",
      ]);
    });

    return csvData;
  }

  // JSON format
  return {
    summary: metrics,
    monthly: monthlyTrends,
    categories: categoryBreakdown,
    envelopes: envelopeSpending,
    exportedAt: new Date().toISOString(),
  };
};
