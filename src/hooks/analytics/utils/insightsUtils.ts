/**
 * Pure utility functions for analytics insights and trends
 */

interface Transaction {
  id: string;
  date: string | Date;
  amount: number;
  category?: string;
  envelopeId?: string;
  type?: string;
}

interface CategoryData {
  income: number;
  expenses: number;
  net: number;
  count: number;
  transactions: Transaction[];
  avgTransactionSize: number;
  percentOfTotal: number;
}

interface TimeSeriesData {
  date: Date;
  income: number;
  expenses: number;
  net: number;
  transactionCount: number;
}

interface CategoryBreakdown {
  [category: string]: CategoryData;
}

/**
 * Calculate top spending categories
 */
export const calculateTopSpendingCategories = (
  categoryBreakdown: CategoryBreakdown,
  limit: number = 5
) => {
  return Object.entries(categoryBreakdown)
    .filter(([, data]) => data.expenses > 0)
    .sort(([, a], [, b]) => b.expenses - a.expenses)
    .slice(0, limit)
    .map(([category, data]) => ({ category, ...data }));
};

/**
 * Calculate top income categories
 */
export const calculateTopIncomeCategories = (
  categoryBreakdown: CategoryBreakdown,
  limit: number = 5
) => {
  return Object.entries(categoryBreakdown)
    .filter(([, data]) => data.income > 0)
    .sort(([, a], [, b]) => b.income - a.income)
    .slice(0, limit)
    .map(([category, data]) => ({ category, ...data }));
};

/**
 * Calculate daily averages from time series data
 */
export const calculateDailyAverages = (timeSeriesData: TimeSeriesData[]) => {
  if (timeSeriesData.length === 0) {
    return {
      income: 0,
      expenses: 0,
      net: 0,
    };
  }

  const totalIncome = timeSeriesData.reduce((sum, day) => sum + day.income, 0);
  const totalExpenses = timeSeriesData.reduce((sum, day) => sum + day.expenses, 0);
  const totalNet = timeSeriesData.reduce((sum, day) => sum + day.net, 0);

  return {
    income: totalIncome / timeSeriesData.length,
    expenses: totalExpenses / timeSeriesData.length,
    net: totalNet / timeSeriesData.length,
  };
};

/**
 * Calculate transaction frequency insights
 */
export const calculateTransactionFrequency = (transactions: Transaction[]) => {
  const incomeCount = transactions.filter((t) => t.amount > 0).length;
  const expenseCount = transactions.filter((t) => t.amount < 0).length;

  return {
    total: transactions.length,
    income: incomeCount,
    expense: expenseCount,
  };
};

/**
 * Calculate spending trends and patterns
 */
export const calculateSpendingTrends = (
  categoryBreakdown: CategoryBreakdown,
  timeSeriesData: TimeSeriesData[]
) => {
  const dailyAverages = calculateDailyAverages(timeSeriesData);
  const topSpendingCategories = calculateTopSpendingCategories(categoryBreakdown);
  const topIncomeCategories = calculateTopIncomeCategories(categoryBreakdown);
  const transactionFrequency = calculateTransactionFrequency(
    timeSeriesData.flatMap((day) => Array(day.transactionCount).fill({}))
  );

  return {
    topSpendingCategories,
    topIncomeCategories,
    dailyAverage: dailyAverages,
    transactionFrequency,
  };
};
