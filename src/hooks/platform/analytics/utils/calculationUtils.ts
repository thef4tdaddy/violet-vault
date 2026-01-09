/**
 * Pure calculation utilities for analytics
 * Optimized for performance with large datasets (200+ transactions)
 */

// Constants for calculations
const SPENDING_TREND_THRESHOLD = 5; // Percent change to consider a trend
const VELOCITY_PROJECTION_FACTOR = 0.5; // Dampening factor for next month projection

// Budget health score constants
const HEALTH_SCORE_NEGATIVE_NET_PENALTY = 30;
const HEALTH_SCORE_LOW_SAVINGS_PENALTY = 20;
const HEALTH_SCORE_MED_SAVINGS_PENALTY = 10;
const HEALTH_SCORE_OVER_UTIL_PENALTY = 5;
const HEALTH_SCORE_UNDER_UTIL_BONUS = 2;
const HEALTH_SCORE_MAX_BONUS = 10;
const SAVINGS_RATE_LOW_THRESHOLD = 10;
const SAVINGS_RATE_MED_THRESHOLD = 20;
const ENVELOPE_OVER_UTIL_THRESHOLD = 90;
const ENVELOPE_UNDER_UTIL_THRESHOLD = 70;

/**
 * Generate month key from date
 * Utility to ensure consistent month key format across calculations
 */
const getMonthKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

interface Transaction {
  id: string;
  date: string | Date;
  amount: number;
  category?: string;
  envelopeId?: string;
  type?: string;
}

interface Envelope {
  id: string;
  name: string;
  currentBalance?: number;
  targetAmount?: number;
}

interface CategoryBreakdown {
  [category: string]: {
    income: number;
    expenses: number;
    net: number;
    count: number;
    transactions: Transaction[];
    avgTransactionSize: number;
    percentOfTotal: number;
  };
}

interface EnvelopeBreakdown {
  [envelopeName: string]: {
    income: number;
    expenses: number;
    net: number;
    count: number;
    envelopeId: string;
    monthlyBudget?: number;
    spent?: number;
    remaining?: number;
    utilizationRate?: number;
  };
}

/**
 * Calculate comprehensive financial summary from transactions
 * Optimized: Single pass through transactions array
 */
export const calculateFinancialSummary = (transactions: Transaction[]) => {
  let totalIncome = 0;
  let totalExpenses = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  // Single pass optimization
  for (const t of transactions) {
    if (t.amount > 0) {
      totalIncome += t.amount;
      incomeCount++;
    } else if (t.amount < 0) {
      totalExpenses += Math.abs(t.amount);
      expenseCount++;
    }
  }

  const netAmount = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netAmount / totalIncome) * 100 : 0;

  return {
    totalIncome,
    totalExpenses,
    netAmount,
    transactionCount: transactions.length,
    incomeTransactionCount: incomeCount,
    expenseTransactionCount: expenseCount,
    avgIncome: incomeCount > 0 ? totalIncome / incomeCount : 0,
    avgExpense: expenseCount > 0 ? totalExpenses / expenseCount : 0,
    savingsRate,
    expenseRatio: totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0,
  };
};

/**
 * Generate enhanced category breakdown from transactions
 * Optimized: Don't store full transaction arrays for performance
 * Added: Average transaction size and percentage of total
 */
export const calculateCategoryBreakdown = (transactions: Transaction[]): CategoryBreakdown => {
  const breakdown = transactions.reduce((acc, transaction) => {
    const category = transaction.category || "uncategorized";
    if (!acc[category]) {
      acc[category] = {
        income: 0,
        expenses: 0,
        net: 0,
        count: 0,
        transactions: [],
        avgTransactionSize: 0,
        percentOfTotal: 0,
      };
    }

    if (transaction.amount > 0) {
      acc[category].income += transaction.amount;
    } else {
      acc[category].expenses += Math.abs(transaction.amount);
    }

    acc[category].net += transaction.amount;
    acc[category].count += 1;
    // Only store transaction reference for small datasets
    if (transactions.length < 1000) {
      acc[category].transactions.push(transaction);
    }

    return acc;
  }, {} as CategoryBreakdown);

  // Calculate totals for percentages
  const totalExpenses = Object.values(breakdown).reduce((sum, cat) => sum + cat.expenses, 0);

  // Post-process: Calculate averages and percentages
  Object.keys(breakdown).forEach((category) => {
    const cat = breakdown[category];
    cat.avgTransactionSize = cat.count > 0 ? cat.expenses / cat.count : 0;
    cat.percentOfTotal = totalExpenses > 0 ? (cat.expenses / totalExpenses) * 100 : 0;
  });

  return breakdown;
};

/**
 * Generate enhanced envelope breakdown from transactions
 * Optimized: Create envelope lookup map for O(1) access
 * Added: Budget tracking, utilization rate, and remaining balance
 */
export const calculateEnvelopeBreakdown = (
  transactions: Transaction[],
  envelopes: Envelope[] = []
): EnvelopeBreakdown => {
  // Create envelope lookup map for performance
  const envelopeMap = new Map(envelopes.map((env) => [env.id, env]));

  const breakdown = transactions.reduce((acc, transaction) => {
    if (!transaction.envelopeId) return acc;

    const envelope = envelopeMap.get(transaction.envelopeId);
    const envelopeName = envelope?.name || "Unknown Envelope";

    if (!acc[envelopeName]) {
      acc[envelopeName] = {
        income: 0,
        expenses: 0,
        net: 0,
        count: 0,
        envelopeId: transaction.envelopeId,
        monthlyBudget: envelope?.targetAmount || 0,
        spent: 0,
        remaining: envelope?.currentBalance || 0,
        utilizationRate: 0,
      };
    }

    if (transaction.amount > 0) {
      acc[envelopeName].income += transaction.amount;
    } else {
      acc[envelopeName].expenses += Math.abs(transaction.amount);
    }

    acc[envelopeName].net += transaction.amount;
    acc[envelopeName].count += 1;

    return acc;
  }, {} as EnvelopeBreakdown);

  // Post-process: Calculate utilization rates and remaining balances
  Object.keys(breakdown).forEach((envelopeName) => {
    const env = breakdown[envelopeName];
    env.spent = env.expenses;
    env.remaining = (env.monthlyBudget || 0) - env.spent;
    env.utilizationRate =
      env.monthlyBudget && env.monthlyBudget > 0 ? (env.spent / env.monthlyBudget) * 100 : 0;
  });

  return breakdown;
};

/**
 * Generate optimized time series data for charts
 * Optimized: Group by month instead of day for better performance and readability
 * Added: Cumulative tracking and trend indicators
 */
export const calculateTimeSeriesData = (
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
) => {
  // Group transactions by month for performance
  const monthlyData = new Map<string, { income: number; expenses: number; count: number }>();

  transactions.forEach((t) => {
    const tDate = new Date(t.date);
    if (tDate >= startDate && tDate <= endDate) {
      const monthKey = getMonthKey(tDate);

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { income: 0, expenses: 0, count: 0 });
      }

      const data = monthlyData.get(monthKey)!;
      if (t.amount > 0) {
        data.income += t.amount;
      } else {
        data.expenses += Math.abs(t.amount);
      }
      data.count += 1;
    }
  });

  // Convert to sorted array with cumulative tracking
  let cumulativeNet = 0;
  const timeSeriesData = Array.from(monthlyData.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([monthKey, data]) => {
      const net = data.income - data.expenses;
      cumulativeNet += net;

      // Calculate actual days in month for accurate daily averages
      const [year, month] = monthKey.split("-").map(Number);
      const daysInMonth = new Date(year, month, 0).getDate();

      return {
        month: monthKey,
        date: new Date(monthKey + "-01"),
        income: data.income,
        expenses: data.expenses,
        net,
        cumulativeNet,
        transactionCount: data.count,
        avgDailyExpenses: data.expenses / daysInMonth,
        savingsRate: data.income > 0 ? (net / data.income) * 100 : 0,
      };
    });

  return timeSeriesData;
};

/**
 * Filter transactions by date range
 */
export const filterTransactionsByDateRange = (
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): Transaction[] => {
  return transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });
};

/**
 * Filter out transfer transactions if not included
 */
export const filterTransferTransactions = (
  transactions: Transaction[],
  includeTransfers: boolean
): Transaction[] => {
  if (includeTransfers) return transactions;
  return transactions.filter((t) => t.type !== "transfer");
};

/**
 * Calculate spending velocity and trends
 * NEW: Provides insights into spending patterns over time
 */
export const calculateSpendingVelocity = (
  timeSeriesData: Array<{ date: Date; expenses: number; income: number }>
) => {
  if (timeSeriesData.length < 2) {
    return {
      averageMonthlyExpenses: 0,
      averageMonthlyIncome: 0,
      trendDirection: "stable" as const,
      velocityChange: 0,
      projectedNextMonth: 0,
    };
  }

  const totalExpenses = timeSeriesData.reduce((sum, d) => sum + d.expenses, 0);
  const totalIncome = timeSeriesData.reduce((sum, d) => sum + d.income, 0);
  const avgExpenses = totalExpenses / timeSeriesData.length;
  const avgIncome = totalIncome / timeSeriesData.length;

  // Calculate trend (comparing last month to average)
  const lastMonth = timeSeriesData[timeSeriesData.length - 1];
  const velocityChange = lastMonth.expenses - avgExpenses;
  const percentChange = avgExpenses > 0 ? (velocityChange / avgExpenses) * 100 : 0;

  let trendDirection: "increasing" | "decreasing" | "stable" = "stable";
  if (percentChange > SPENDING_TREND_THRESHOLD) trendDirection = "increasing";
  else if (percentChange < -SPENDING_TREND_THRESHOLD) trendDirection = "decreasing";

  return {
    averageMonthlyExpenses: avgExpenses,
    averageMonthlyIncome: avgIncome,
    trendDirection,
    velocityChange,
    percentChange,
    projectedNextMonth: lastMonth.expenses + velocityChange * VELOCITY_PROJECTION_FACTOR,
  };
};

/**
 * Identify top spending categories and outliers
 * NEW: Helps identify where most money is going
 */
export const identifyTopSpendingCategories = (categoryBreakdown: CategoryBreakdown, limit = 5) => {
  const categories = Object.entries(categoryBreakdown)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.expenses - a.expenses)
    .slice(0, limit);

  const totalExpenses = Object.values(categoryBreakdown).reduce(
    (sum, cat) => sum + cat.expenses,
    0
  );

  return categories.map((cat) => ({
    ...cat,
    percentOfTotal: totalExpenses > 0 ? (cat.expenses / totalExpenses) * 100 : 0,
  }));
};

/**
 * Calculate budget health score
 * NEW: Single metric to understand overall financial health (0-100)
 */
export const calculateBudgetHealthScore = (
  summary: { totalIncome: number; totalExpenses: number; netAmount: number },
  envelopeBreakdown: EnvelopeBreakdown
) => {
  let score = 100;

  // Penalty for negative net (spending more than earning)
  if (summary.netAmount < 0) {
    score -= HEALTH_SCORE_NEGATIVE_NET_PENALTY;
  }

  // Penalty for low savings rate
  const savingsRate = summary.totalIncome > 0 ? (summary.netAmount / summary.totalIncome) * 100 : 0;
  if (savingsRate < SAVINGS_RATE_LOW_THRESHOLD) score -= HEALTH_SCORE_LOW_SAVINGS_PENALTY;
  else if (savingsRate < SAVINGS_RATE_MED_THRESHOLD) score -= HEALTH_SCORE_MED_SAVINGS_PENALTY;

  // Penalty for over-utilized envelopes (overspending in categories)
  const envelopes = Object.values(envelopeBreakdown);
  const overUtilized = envelopes.filter(
    (env) => (env.utilizationRate || 0) > ENVELOPE_OVER_UTIL_THRESHOLD
  ).length;
  score -= overUtilized * HEALTH_SCORE_OVER_UTIL_PENALTY;

  // Bonus for under-utilized envelopes (good budgeting practices)
  const underUtilized = envelopes.filter(
    (env) => (env.utilizationRate || 0) < ENVELOPE_UNDER_UTIL_THRESHOLD
  ).length;
  score += Math.min(underUtilized * HEALTH_SCORE_UNDER_UTIL_BONUS, HEALTH_SCORE_MAX_BONUS);

  return Math.max(0, Math.min(100, score));
};
