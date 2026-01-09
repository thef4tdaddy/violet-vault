/**
 * Utility functions for alert generation in analytics integration
 * Extracted from useAnalyticsIntegration hook to reduce complexity
 */

interface EnvelopeHealth {
  healthScore: number;
}

interface CategoryBreakdown {
  name: string;
  amount: number;
}

interface AnalyticsData {
  envelopeHealth: EnvelopeHealth[];
  categoryBreakdown: CategoryBreakdown[];
}

interface EnhancedMetrics {
  avgMonthlyExpenses: number;
  savingsRate: number;
}

interface Alert {
  type: string;
  category: string;
  title: string;
  message: string;
  severity: string;
  data?: unknown;
}

/**
 * Generate alerts based on analytics data and metrics
 */
export const generateAnalyticsAlerts = (
  analyticsData: AnalyticsData,
  enhancedMetrics: EnhancedMetrics,
  enableAlerts: boolean
): Alert[] => {
  if (!enableAlerts) return [];

  const alertList: Alert[] = [];

  // Budget alerts
  const overBudgetEnvelopes = analyticsData.envelopeHealth.filter((env) => env.healthScore < 20);
  if (overBudgetEnvelopes.length > 0) {
    alertList.push({
      type: "warning",
      category: "budget",
      title: "Budget Exceeded",
      message: `${overBudgetEnvelopes.length} envelope(s) are critically low`,
      severity: "high",
      data: overBudgetEnvelopes,
    });
  }

  // Spending pattern alerts
  const unusualSpending = analyticsData.categoryBreakdown.find(
    (cat) => cat.amount > enhancedMetrics.avgMonthlyExpenses * 0.5
  );
  if (unusualSpending) {
    alertList.push({
      type: "info",
      category: "spending",
      title: "High Category Spending",
      message: `Unusual spending detected in ${unusualSpending.name}`,
      severity: "medium",
      data: unusualSpending,
    });
  }

  // Savings rate alerts
  if (enhancedMetrics.savingsRate < 5) {
    alertList.push({
      type: "warning",
      category: "savings",
      title: "Low Savings Rate",
      message: "Consider reducing expenses or increasing income",
      severity: enhancedMetrics.savingsRate < 0 ? "high" : "medium",
    });
  }

  return alertList.sort((a, b) => {
    const severityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
};
