/**
 * Utility functions for analytics integration
 * Extracted from useAnalyticsIntegration hook to reduce complexity
 */

interface EnhancedMetrics {
  budgetAdherence: number;
  savingsRate: number;
}

interface Recommendation {
  type: string;
  priority: string;
  title: string;
  description: string;
  action: string;
}

/**
 * Generate recommendations based on enhanced metrics
 */
export const generateRecommendationsFromMetrics = (
  enhancedMetrics: EnhancedMetrics & { diversityScore: number }
): Recommendation[] => {
  const recs: Recommendation[] = [];

  // Budget recommendations
  if (enhancedMetrics.budgetAdherence < 70) {
    recs.push({
      type: "budget",
      priority: "high",
      title: "Review Budget Allocations",
      description: "Several envelopes are consistently over budget",
      action: "Consider increasing budgets for frequently overspent categories",
    });
  }

  // Savings recommendations
  if (enhancedMetrics.savingsRate < 15) {
    recs.push({
      type: "savings",
      priority: "medium",
      title: "Increase Savings Rate",
      description: "Current savings rate is below recommended 15-20%",
      action: "Look for opportunities to reduce expenses or increase income",
    });
  }

  // Diversification recommendations
  if (enhancedMetrics.diversityScore < 50) {
    recs.push({
      type: "organization",
      priority: "low",
      title: "Improve Expense Categorization",
      description: "Consider using more specific expense categories",
      action: "Break down large categories into more specific ones",
    });
  }

  return recs.sort((a, b) => {
    const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

interface AnalyticsData {
  filteredTransactions: unknown[];
  envelopeHealth: unknown[];
  categoryBreakdown: unknown[];
  monthlyTrends: unknown[];
}

/**
 * Calculate performance metrics for monitoring
 */
export const calculatePerformanceMetrics = (analyticsData: AnalyticsData) => {
  const dataPoints = {
    transactions: analyticsData.filteredTransactions.length,
    envelopes: analyticsData.envelopeHealth.length,
    categories: analyticsData.categoryBreakdown.length,
    monthsOfData: analyticsData.monthlyTrends.length,
  };

  return {
    ...dataPoints,
    processingTime: performance.now(),
    dataQuality: dataPoints.transactions > 0 ? "good" : "insufficient",
    lastUpdated: new Date().toISOString(),
  };
};
