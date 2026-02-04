/**
 * Mock Data Transformation Utilities
 * Created to support Allocation Analytics Dashboard
 */

import { useAllocationAnalytics } from "@/hooks/platform/analytics/useAllocationAnalytics";

type AnalyticsData = ReturnType<typeof useAllocationAnalytics>["data"];

export const transformAnalyticsData = (data: AnalyticsData) => {
  if (!data) return null;

  // Mock ML Insights
  const mockMLInsights = [
    {
      type: "success" as const,
      title: "Consistent Allocation Pattern",
      description: "Your allocation patterns are consistent and predictable.",
      confidence: 92,
    },
  ];

  const mockAnomalies: Array<{
    date: string;
    severity: "high" | "medium" | "low";
    description: string;
  }> = [];

  const mockHeatmapData = data.heatmap.dataPoints.map((point) => ({
    date: point.date,
    intensity: point.intensity,
    amount: point.amountCents,
    count: point.allocationCount,
  }));

  const mockSimpleHeatmapData = data.heatmap.dataPoints.map((point) => ({
    date: point.date,
    amount: point.amountCents,
    intensity: point.intensity,
  }));

  const mockTrendData =
    data.trends.envelopes[0]?.dataPoints.map((point) => ({
      date: point.date,
      [data.trends.envelopes[0]!.id]: point.amountCents,
    })) || [];

  const mockEnvelopeSparklines = data.trends.envelopes.map((env) => ({
    envelopeId: env.id,
    envelopeName: env.name,
    data: env.dataPoints.map((point) => ({
      value: point.amountCents,
      label: point.date,
    })),
    color: env.color || "#8884d8",
  }));

  const mockDistributionData = data.distribution.categories.map((cat) => ({
    name: cat.name,
    value: cat.totalCents,
    percentage: cat.percentage,
    color: cat.color || "#8884d8",
  }));

  const mockCategoryDistribution = data.distribution.categories.map((cat) => ({
    category: cat.name,
    amount: cat.totalCents / 100,
    percentage: cat.percentage,
    transactionCount: cat.envelopeIds.length,
  }));

  const mockStrategyData = data.strategyAnalysis.strategies.map((s) => ({
    strategy: s.strategy,
    avgAmount: s.averageCompletionTimeMs,
    successRate: s.successRate,
    recommendation: (s.successRate >= 90 ? "good" : s.successRate >= 70 ? "fair" : "poor") as
      | "good"
      | "fair"
      | "poor",
  }));

  const mockHealthComponents = data.healthScore.components.map((c) => ({
    component: c.name,
    score: c.score,
    weight: c.weight,
    description: c.description,
  }));

  const mockHealthTrend = [{ date: "2024-01-01", score: data.healthScore.totalScore }];

  return {
    mockMLInsights,
    mockAnomalies,
    mockHeatmapData,
    mockSimpleHeatmapData,
    mockTrendData,
    mockEnvelopeSparklines,
    mockDistributionData,
    mockCategoryDistribution,
    mockStrategyData,
    mockHealthComponents,
    mockHealthTrend,
  };
};
