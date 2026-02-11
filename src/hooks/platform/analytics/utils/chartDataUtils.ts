/**
 * Utility functions for formatting chart data
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

interface EnvelopeData {
  income: number;
  expenses: number;
  net: number;
  count: number;
  envelopeId: string;
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

interface EnvelopeBreakdown {
  [envelopeName: string]: EnvelopeData;
}

/**
 * Format category data for pie charts
 */
export const formatCategoryPieData = (categoryBreakdown: CategoryBreakdown) => {
  return Object.entries(categoryBreakdown)
    .filter(([, categoryData]) => categoryData.expenses > 0)
    .map(([category, categoryData]) => ({
      name: category,
      value: categoryData.expenses,
      count: categoryData.count,
    }));
};

/**
 * Format time series data for line charts
 */
export const formatTimeSeriesLineData = (timeSeriesData: TimeSeriesData[]) => {
  return timeSeriesData.map((day) => ({
    date: day.date.toISOString().split("T")[0],
    income: day.income,
    expenses: day.expenses,
    net: day.net,
  }));
};

/**
 * Format envelope data for bar charts
 */
export const formatEnvelopeBarData = (envelopeBreakdown: EnvelopeBreakdown) => {
  return Object.entries(envelopeBreakdown).map(([name, envelopeData]) => ({
    name,
    expenses: envelopeData.expenses,
    income: envelopeData.income,
    net: envelopeData.net,
  }));
};

/**
 * Get chart data based on type
 */
export const getChartData = (
  type: string,
  data: {
    categoryBreakdown?: CategoryBreakdown;
    envelopeBreakdown?: EnvelopeBreakdown;
    timeSeriesData?: TimeSeriesData[];
  }
) => {
  switch (type) {
    case "categoryPie":
      return data.categoryBreakdown ? formatCategoryPieData(data.categoryBreakdown) : [];

    case "dailyLine":
      return data.timeSeriesData ? formatTimeSeriesLineData(data.timeSeriesData) : [];

    case "envelopeBar":
      return data.envelopeBreakdown ? formatEnvelopeBarData(data.envelopeBreakdown) : [];

    default:
      return [];
  }
};
