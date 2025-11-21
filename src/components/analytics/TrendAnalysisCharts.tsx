import React from "react";
import ForecastSummaryCard from "./trends/ForecastSummaryCard";
import HistoricalTrendsChart from "./trends/HistoricalTrendsChart";
import VelocityChart from "./trends/VelocityChart";
import CategoryTrendsSection from "./trends/CategoryTrendsSection";
import SeasonalPatternsSection from "./trends/SeasonalPatternsSection";
import InsightsPanel from "./trends/InsightsPanel";

import { useTrendAnalysis } from "../../hooks/analytics/useTrendAnalysis";

import { AnalyticsData } from "@/types/analytics";

interface TrendAnalysisChartsProps {
  analyticsData: AnalyticsData;
  timeFilter: string;
}

/**
 * Advanced Trend Analysis Charts for v1.10.0
 * Refactored with component extraction and UI standards compliance
 * Features:
 * - Historical trend analysis
 * - Spending velocity tracking
 * - Seasonal pattern detection
 * - Predictive forecasting
 * - Comparative analysis
 */
const TrendAnalysisCharts: React.FC<TrendAnalysisChartsProps> = ({ analyticsData, timeFilter }) => {
  const {
    spendingTrends,
    spendingVelocity,
    categoryTrends,
    seasonalPatterns,
    forecastInsights,
    insights,
  } = useTrendAnalysis(analyticsData, timeFilter);

  return (
    <div className="space-y-8">
      {/* Forecast Summary */}
      <ForecastSummaryCard forecastInsights={forecastInsights} />

      {/* Historical Trends Chart */}
      <HistoricalTrendsChart spendingTrends={spendingTrends} />

      {/* Spending Velocity Chart */}
      <VelocityChart spendingVelocity={spendingVelocity} />

      {/* Category Trends */}
      <CategoryTrendsSection categoryTrends={categoryTrends} />

      {/* Seasonal Patterns */}
      <SeasonalPatternsSection seasonalPatterns={seasonalPatterns} />

      {/* Insights Panel */}
      <InsightsPanel forecastInsights={forecastInsights} insights={insights} />
    </div>
  );
};

export default TrendAnalysisCharts;
