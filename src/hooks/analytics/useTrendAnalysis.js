import { useMemo } from "react";

/**
 * Custom hook for trend analysis calculations and data processing
 * Extracts all computational logic from TrendAnalysisCharts component
 */
export const useTrendAnalysis = (analyticsData, timeFilter) => {
  // Generate historical spending trends
  const spendingTrends = useMemo(() => {
    if (!analyticsData) return [];

    // Mock historical data - in real implementation, this would come from analytics
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
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
  }, [analyticsData]);

  // Calculate spending velocity (rate of change)
  const spendingVelocity = useMemo(() => {
    const velocity = [];
    for (let i = 1; i < spendingTrends.length; i++) {
      const current = spendingTrends[i];
      const previous = spendingTrends[i - 1];
      const change = current.spending - previous.spending;
      const percentChange =
        previous.spending > 0 ? (change / previous.spending) * 100 : 0;

      velocity.push({
        month: current.month,
        change,
        percentChange: Math.round(percentChange * 10) / 10,
        direction: change > 0 ? "increase" : "decrease",
      });
    }
    return velocity;
  }, [spendingTrends]);

  // Generate category trend analysis
  const categoryTrends = useMemo(() => {
    if (!analyticsData?.categoryBreakdown) return [];

    const categories = Object.entries(analyticsData.categoryBreakdown)
      .map(([name, data]) => ({
        name,
        current: data.expenses || 0,
        // Simulate historical data for trending
        trend: Array.from({ length: 6 }, (_, i) => ({
          month: new Date(
            Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000,
          ).toLocaleDateString("en-US", { month: "short" }),
          amount: Math.max(
            0,
            (data.expenses || 0) * (0.8 + Math.random() * 0.4),
          ),
        })),
      }))
      .sort((a, b) => b.current - a.current)
      .slice(0, 5); // Top 5 categories

    return categories;
  }, [analyticsData]);

  // Calculate seasonal patterns
  const seasonalPatterns = useMemo(() => {
    const seasons = [
      { name: "Winter", months: ["Dec", "Jan", "Feb"], color: "#3B82F6" },
      { name: "Spring", months: ["Mar", "Apr", "May"], color: "#10B981" },
      { name: "Summer", months: ["Jun", "Jul", "Aug"], color: "#F59E0B" },
      { name: "Fall", months: ["Sep", "Oct", "Nov"], color: "#EF4444" },
    ];

    return seasons.map((season) => {
      const seasonData = spendingTrends.filter((trend) =>
        season.months.includes(trend.month),
      );

      const avgSpending =
        seasonData.reduce((sum, data) => sum + data.spending, 0) /
        seasonData.length;
      const avgIncome =
        seasonData.reduce((sum, data) => sum + data.income, 0) /
        seasonData.length;

      return {
        ...season,
        avgSpending: Math.round(avgSpending),
        avgIncome: Math.round(avgIncome),
        avgNet: Math.round(avgIncome - avgSpending),
      };
    });
  }, [spendingTrends]);

  // Generate forecasting insights
  const forecastInsights = useMemo(() => {
    const recentTrends = spendingTrends.slice(-6, -3); // Last 3 months of actual data
    const avgSpending =
      recentTrends.reduce((sum, data) => sum + data.spending, 0) /
      recentTrends.length;
    const avgGrowth =
      spendingVelocity.slice(-3).reduce((sum, v) => sum + v.percentChange, 0) /
      3;

    const projectedNext = avgSpending * (1 + avgGrowth / 100);
    const confidence = Math.max(60, 90 - Math.abs(avgGrowth) * 2); // Lower confidence for higher volatility

    return {
      projectedSpending: Math.round(projectedNext),
      growthRate: Math.round(avgGrowth * 10) / 10,
      confidence: Math.round(confidence),
      trend:
        avgGrowth > 2 ? "increasing" : avgGrowth < -2 ? "decreasing" : "stable",
    };
  }, [spendingTrends, spendingVelocity]);

  // Calculate derived insights
  const insights = useMemo(() => {
    const highestSpendingSeason = seasonalPatterns.reduce((max, season) =>
      season.avgSpending > max.avgSpending ? season : max,
    );

    const avgVelocity =
      spendingVelocity.reduce((sum, v) => sum + v.percentChange, 0) /
      spendingVelocity.length;

    const hasHighGrowth = forecastInsights.growthRate > 5;

    return {
      highestSpendingSeason: highestSpendingSeason.name,
      avgVelocity: Math.round(avgVelocity * 10) / 10,
      hasHighGrowth,
    };
  }, [seasonalPatterns, spendingVelocity, forecastInsights]);

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