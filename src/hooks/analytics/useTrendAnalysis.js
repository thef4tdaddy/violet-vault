import { useMemo } from "react";

/**
 * Generate historical spending trends data
 */
const generateSpendingTrends = (analyticsData) => {
  if (!analyticsData) return [];

  // Mock historical data - in real implementation, this would come from analytics
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const currentMonth = new Date().getMonth();
  const trends = [];

  for (let i = 0; i < 12; i++) {
    const monthIndex = (currentMonth - 11 + i + 12) % 12;
    const month = months[monthIndex];

    // Simulate trending data with some variability
    const baseSpending = 2500 + Math.sin(i * 0.5) * 500;
    const variance = (Math.random() - 0.5) * 400;
    const spending = Math.max(0, baseSpending + variance);

    const baseIncome = 3000 + Math.sin(i * 0.3) * 200;
    const incomeVariance = (Math.random() - 0.5) * 300;
    const income = Math.max(0, baseIncome + incomeVariance);

    trends.push({
      month,
      spending: Math.round(spending),
      income: Math.round(income),
      net: Math.round(income - spending),
      forecast: i >= 9, // Last 3 months are forecasted
    });
  }

  return trends;
};

/**
 * Calculate spending velocity (rate of change)
 */
const calculateSpendingVelocity = (spendingTrends) => {
  if (!spendingTrends || spendingTrends.length < 2) return [];

  const velocity = [];
  for (let i = 1; i < spendingTrends.length; i++) {
    const current = spendingTrends[i];
    const previous = spendingTrends[i - 1];

    const spendingChange = current.spending - previous.spending;
    const percentChange =
      previous.spending > 0 ? (spendingChange / previous.spending) * 100 : 0;

    velocity.push({
      month: current.month,
      change: spendingChange,
      percentChange: Math.round(percentChange * 10) / 10,
    });
  }
  return velocity;
};

/**
 * Generate category trends data
 */
const generateCategoryTrends = (analyticsData) => {
  if (!analyticsData) return [];

  return [
    { name: "Groceries", current: 850, previous: 780, trend: "increasing" },
    {
      name: "Transportation",
      current: 320,
      previous: 380,
      trend: "decreasing",
    },
    { name: "Utilities", current: 245, previous: 250, trend: "stable" },
    { name: "Entertainment", current: 180, previous: 120, trend: "increasing" },
    { name: "Healthcare", current: 95, previous: 110, trend: "decreasing" },
  ];
};

/**
 * Generate seasonal patterns data
 */
const generateSeasonalPatterns = (analyticsData) => {
  if (!analyticsData) return [];

  return [
    {
      season: "Winter",
      avgSpending: 2850,
      categories: ["Utilities", "Healthcare"],
    },
    {
      season: "Spring",
      avgSpending: 2650,
      categories: ["Groceries", "Transportation"],
    },
    {
      season: "Summer",
      avgSpending: 2950,
      categories: ["Entertainment", "Transportation"],
    },
    {
      season: "Fall",
      avgSpending: 2750,
      categories: ["Groceries", "Utilities"],
    },
  ];
};

/**
 * Generate forecast insights
 */
const generateForecastInsights = (spendingTrends) => {
  if (!spendingTrends || spendingTrends.length < 4) return {};

  const currentMonthData = spendingTrends[spendingTrends.length - 4];
  const forecastData = spendingTrends.slice(-3);

  const avgForecastSpending =
    forecastData.reduce((sum, month) => sum + month.spending, 0) /
    forecastData.length;

  return {
    projectedMonthlySpending: Math.round(avgForecastSpending),
    projectedSavings: Math.round(forecastData[2].net),
    confidenceLevel: 85,
    trendDirection:
      avgForecastSpending > currentMonthData.spending ? "up" : "down",
  };
};

/**
 * Generate actionable insights
 */
const generateInsights = (_categoryTrends, _seasonalPatterns) => [
  {
    type: "warning",
    title: "Increasing Entertainment Spending",
    description:
      "Entertainment costs have increased by 50% compared to last month.",
    action: "Consider setting a monthly entertainment budget limit.",
  },
  {
    type: "success",
    title: "Transportation Savings",
    description: "You've saved $60 on transportation this month.",
    action: "Great job! Consider investing these savings.",
  },
  {
    type: "info",
    title: "Seasonal Pattern Detected",
    description:
      "Your spending typically increases by 15% during summer months.",
    action:
      "Plan ahead for higher summer expenses in categories like entertainment.",
  },
];

/**
 * Custom hook for trend analysis calculations and data processing
 * Extracts all computational logic from TrendAnalysisCharts component
 */
export const useTrendAnalysis = (analyticsData, _timeFilter) => {
  const spendingTrends = useMemo(
    () => generateSpendingTrends(analyticsData),
    [analyticsData],
  );

  const spendingVelocity = useMemo(
    () => calculateSpendingVelocity(spendingTrends),
    [spendingTrends],
  );

  const categoryTrends = useMemo(
    () => generateCategoryTrends(analyticsData),
    [analyticsData],
  );

  const seasonalPatterns = useMemo(
    () => generateSeasonalPatterns(analyticsData),
    [analyticsData],
  );

  const forecastInsights = useMemo(
    () => generateForecastInsights(spendingTrends),
    [spendingTrends],
  );

  const insights = useMemo(
    () => generateInsights(categoryTrends, seasonalPatterns),
    [categoryTrends, seasonalPatterns],
  );

  return {
    spendingTrends,
    spendingVelocity,
    categoryTrends,
    seasonalPatterns,
    forecastInsights,
    insights,
  };
};

export default useTrendAnalysis;
