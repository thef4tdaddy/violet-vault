import { useMemo } from "react";
import { SEASON_COLORS } from "@/utils/analytics/trendHelpers";
import {
  AnalyticsData,
  SpendingTrend,
  SpendingVelocity,
  CategoryTrend,
  SeasonalPattern,
  ForecastInsights,
  Insights,
} from "@/types/analytics";

/**
 * Generate historical spending trends data
 */
const generateSpendingTrends = (analyticsData: AnalyticsData): SpendingTrend[] => {
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
  const trends: SpendingTrend[] = [];

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
const calculateSpendingVelocity = (spendingTrends: SpendingTrend[]): SpendingVelocity[] => {
  if (!spendingTrends || spendingTrends.length < 2) return [];

  const velocity: SpendingVelocity[] = [];
  for (let i = 1; i < spendingTrends.length; i++) {
    const current = spendingTrends[i];
    const previous = spendingTrends[i - 1];

    const spendingChange = current.spending - previous.spending;
    const percentChange = previous.spending > 0 ? (spendingChange / previous.spending) * 100 : 0;

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
const generateCategoryTrends = (analyticsData: AnalyticsData): CategoryTrend[] => {
  if (!analyticsData) return [];

  const categories = [
    { name: "Groceries", base: 800 },
    { name: "Transportation", base: 350 },
    { name: "Utilities", base: 250 },
    { name: "Entertainment", base: 200 },
    { name: "Healthcare", base: 100 },
  ];

  return categories.map((cat) => {
    const trend = [];
    for (let i = 0; i < 6; i++) {
      trend.push({
        month: `M${i + 1}`,
        amount: Math.round(cat.base + (Math.random() - 0.5) * 100),
      });
    }
    return {
      name: cat.name,
      trend,
      current: trend[5].amount,
      previous: trend[4].amount,
    };
  });
};

/**
 * Generate seasonal patterns data
 */
const generateSeasonalPatterns = (analyticsData: AnalyticsData): SeasonalPattern[] => {
  if (!analyticsData) return [];

  return [
    {
      name: "Winter",
      color: SEASON_COLORS.Winter,
      avgSpending: 2850,
      avgIncome: 3200,
      avgNet: 350,
      categories: ["Utilities", "Healthcare"],
    },
    {
      name: "Spring",
      color: SEASON_COLORS.Spring,
      avgSpending: 2650,
      avgIncome: 3100,
      avgNet: 450,
      categories: ["Groceries", "Transportation"],
    },
    {
      name: "Summer",
      color: SEASON_COLORS.Summer,
      avgSpending: 2950,
      avgIncome: 3100,
      avgNet: 150,
      categories: ["Entertainment", "Transportation"],
    },
    {
      name: "Fall",
      color: SEASON_COLORS.Fall,
      avgSpending: 2750,
      avgIncome: 3150,
      avgNet: 400,
      categories: ["Groceries", "Utilities"],
    },
  ];
};

/**
 * Generate forecast insights
 */
const generateForecastInsights = (spendingTrends: SpendingTrend[]): ForecastInsights => {
  if (!spendingTrends || spendingTrends.length < 4)
    return {
      trend: "stable",
      projectedSpending: 0,
      growthRate: 0,
      confidence: 0,
    };

  const currentMonthData = spendingTrends[spendingTrends.length - 4];
  const forecastData = spendingTrends.slice(-3);

  const avgForecastSpending =
    forecastData.reduce((sum, month) => sum + month.spending, 0) / forecastData.length;

  const growthRate =
    ((avgForecastSpending - currentMonthData.spending) / currentMonthData.spending) * 100;

  return {
    trend: avgForecastSpending > currentMonthData.spending ? "increasing" : "decreasing",
    projectedSpending: Math.round(avgForecastSpending),
    growthRate: Math.round(growthRate * 10) / 10,
    confidence: 85,
  };
};

/**
 * Generate actionable insights
 */
const generateInsights = (
  _categoryTrends: CategoryTrend[],
  _seasonalPatterns: SeasonalPattern[]
): Insights => {
  return {
    highestSpendingSeason: "Summer",
    avgVelocity: 5.2,
    hasHighGrowth: true,
    details: [
      {
        type: "warning",
        title: "Increasing Entertainment Spending",
        description: "Entertainment costs have increased by 50% compared to last month.",
        action: "Consider setting a monthly entertainment budget limit.",
      },
      {
        type: "success",
        title: "Transportation Savings",
        description: "You've saved $60 on transportation this month.",
        action: "Great job! Consider investing these savings.",
      },
    ],
  };
};

/**
 * Custom hook for trend analysis calculations and data processing
 * Extracts all computational logic from TrendAnalysisCharts component
 */
export const useTrendAnalysis = (analyticsData: AnalyticsData, _timeFilter: string) => {
  const spendingTrends = useMemo(() => generateSpendingTrends(analyticsData), [analyticsData]);

  const spendingVelocity = useMemo(
    () => calculateSpendingVelocity(spendingTrends),
    [spendingTrends]
  );

  const categoryTrends = useMemo(() => generateCategoryTrends(analyticsData), [analyticsData]);

  const seasonalPatterns = useMemo(() => generateSeasonalPatterns(analyticsData), [analyticsData]);

  const forecastInsights = useMemo(
    () => generateForecastInsights(spendingTrends),
    [spendingTrends]
  );

  const insights = useMemo(
    () => generateInsights(categoryTrends, seasonalPatterns),
    [categoryTrends, seasonalPatterns]
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
