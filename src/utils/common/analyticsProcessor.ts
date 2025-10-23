import logger from "../common/logger";
import { validateTransactionSafe, validateEnvelopeSafe } from "../../domain/schemas/index.ts";

/**
 * Analytics data processing utilities
 * Extracted from ChartsAndAnalytics.jsx for better reusability
 * Issue #151 - ChartsAndAnalytics refactoring
 * Now using Zod schemas for validation (Issue #412)
 */

/**
 * Validate transaction using Zod schema
 * Used as filter predicate for analytics data
 */
export const validateTransaction = (transaction) => {
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
export const validateEnvelope = (envelope) => {
  if (!envelope || typeof envelope !== "object") {
    return false;
  }
  const result = validateEnvelopeSafe(envelope);
  return result.success;
};

// Date utilities
export const isValidDate = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && date.getFullYear() > 1900;
};

export const getDateRangeFilter = (timeFilter) => {
  const now = new Date();
  const ranges = {
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
export const safeDivision = (numerator, denominator, fallback = 0) => {
  return denominator === 0 ? fallback : numerator / denominator;
};

export const calculatePercentage = (value, total, decimals = 1) => {
  return total === 0 ? 0 : ((value / total) * 100).toFixed(decimals);
};

export const calculateGrowthRate = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
};

// Transaction processing
export const _filterTransactionsByDateRange = (transactions, timeFilter) => {
  const dateRange = getDateRangeFilter(timeFilter);

  return transactions.filter((transaction) => {
    if (!validateTransaction(transaction)) return false;

    try {
      return new Date(transaction.date) >= dateRange;
    } catch {
      logger.warn("Invalid date in transaction:", transaction.date);
      return false;
    }
  });
};

export const groupTransactionsByMonth = (transactions) => {
  const grouped = {};

  transactions.forEach((transaction) => {
    if (!validateTransaction(transaction)) return;

    try {
      const date = new Date(transaction.date);
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

      if (transaction.amount > 0) {
        grouped[monthKey].income += transaction.amount;
      } else {
        grouped[monthKey].expenses += Math.abs(transaction.amount);
      }

      grouped[monthKey].net = grouped[monthKey].income - grouped[monthKey].expenses;
      grouped[monthKey].transactionCount++;
      grouped[monthKey].transactions.push(transaction);
    } catch (error) {
      logger.warn("Error processing transaction in grouping:", transaction, error);
    }
  });

  return Object.values(grouped).sort((a, b) => a.month.localeCompare(b.month));
};

export const groupTransactionsByCategory = (transactions) => {
  const categories = {};

  transactions.forEach((transaction) => {
    if (!validateTransaction(transaction)) return;

    const category = transaction.category || "Uncategorized";

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

    if (transaction.amount > 0) {
      categories[category].income += transaction.amount;
    } else {
      categories[category].expenses += Math.abs(transaction.amount);
    }

    categories[category].net = categories[category].income - categories[category].expenses;
    categories[category].count++;
    categories[category].transactions.push(transaction);
  });

  return Object.values(categories).sort((a, b) => b.expenses - a.expenses);
};

export const groupTransactionsByWeekday = (transactions) => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const patterns = days.map((day, index) => ({
    day,
    dayIndex: index,
    income: 0,
    expenses: 0,
    net: 0,
    count: 0,
    transactions: [],
  }));

  transactions.forEach((transaction) => {
    if (!validateTransaction(transaction)) return;

    try {
      const dayIndex = new Date(transaction.date).getDay();
      if (dayIndex >= 0 && dayIndex < 7) {
        if (transaction.amount > 0) {
          patterns[dayIndex].income += transaction.amount;
        } else {
          patterns[dayIndex].expenses += Math.abs(transaction.amount);
        }

        patterns[dayIndex].net = patterns[dayIndex].income - patterns[dayIndex].expenses;
        patterns[dayIndex].count++;
        patterns[dayIndex].transactions.push(transaction);
      }
    } catch {
      logger.warn("Invalid date in weekday patterns:", transaction.date);
    }
  });

  return patterns;
};

// Envelope processing
export const analyzeEnvelopeSpending = (transactions, envelopes) => {
  const spending = {};

  transactions.forEach((transaction) => {
    if (!validateTransaction(transaction) || transaction.amount >= 0 || !transaction.envelopeId) {
      return;
    }

    const envelope = envelopes.find((e) => e.id === transaction.envelopeId);
    const envelopeName = envelope ? envelope.name : "Unknown Envelope";

    if (!spending[envelopeName]) {
      spending[envelopeName] = {
        name: envelopeName,
        envelopeId: transaction.envelopeId,
        amount: 0,
        count: 0,
        budget: envelope?.monthlyAmount || 0,
        color: envelope?.color || "#8B5CF6",
        transactions: [],
      };
    }

    spending[envelopeName].amount += Math.abs(transaction.amount);
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

export const analyzeEnvelopeHealth = (envelopes) => {
  return envelopes.filter(validateEnvelope).map((envelope) => {
    const monthlyBudget = envelope.monthlyAmount || 0;
    const currentBalance = envelope.currentBalance || 0;
    const spent = envelope.spendingHistory?.reduce((sum, s) => sum + s.amount, 0) || 0;

    const healthScore = safeDivision(currentBalance, monthlyBudget, 1) * 100;
    let status = "healthy";

    if (healthScore < 20) status = "critical";
    else if (healthScore < 50) status = "warning";
    else if (healthScore > 150) status = "overfunded";

    return {
      id: envelope.id,
      name: envelope.name,
      currentBalance,
      monthlyBudget,
      spent,
      healthScore: Math.max(0, Math.min(200, healthScore)),
      status,
      color: envelope.color,
      utilizationRate: safeDivision(spent, monthlyBudget, 0) * 100,
    };
  });
};

// Financial metrics calculation
export const _calculateFinancialMetrics = (transactions, envelopes) => {
  const validTransactions = transactions.filter(validateTransaction);

  const totalIncome = validTransactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = validTransactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netCashFlow = totalIncome - totalExpenses;
  const savingsRate = safeDivision(netCashFlow, totalIncome, 0) * 100;

  // Monthly averages
  const monthlyData = groupTransactionsByMonth(validTransactions);
  const avgMonthlyIncome =
    monthlyData.length > 0
      ? safeDivision(
          monthlyData.reduce((sum, m) => sum + m.income, 0),
          monthlyData.length,
          0
        )
      : 0;

  const avgMonthlyExpenses =
    monthlyData.length > 0
      ? safeDivision(
          monthlyData.reduce((sum, m) => sum + m.expenses, 0),
          monthlyData.length,
          0
        )
      : 0;

  // Envelope metrics
  const totalEnvelopeBudget = envelopes
    .filter(validateEnvelope)
    .reduce((sum, env) => sum + (env.monthlyAmount || 0), 0);

  const totalEnvelopeBalance = envelopes
    .filter(validateEnvelope)
    .reduce((sum, env) => sum + (env.currentBalance || 0), 0);

  const budgetUtilization = safeDivision(totalExpenses, totalEnvelopeBudget, 0) * 100;

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
export const calculateTrends = (monthlyData) => {
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
export const prepareDataForExport = (analyticsData, format = "csv") => {
  const { monthlyTrends, categoryBreakdown, envelopeSpending, metrics } = analyticsData;

  if (format === "csv") {
    const csvData = [];

    // Headers
    csvData.push(["Type", "Period/Name", "Income", "Expenses", "Net", "Count", "Category"]);

    // Monthly data
    monthlyTrends.forEach((month) => {
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
    categoryBreakdown.forEach((category) => {
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
    envelopeSpending.forEach((envelope) => {
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
