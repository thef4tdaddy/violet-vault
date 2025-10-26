/**
 * Utility functions for generating alerts and recommendations
 * Extracted from usePerformanceMonitor hook to reduce complexity
 */

interface Alert {
  type: string;
  category: string;
  title: string;
  message: string;
  severity: string;
  action: string;
  details?: string;
}

interface Metrics {
  budgetAdherence: number;
  savingsRate: number;
  balanceStability: number;
  overallScore?: number;
}

interface BalanceData {
  envelopeAnalysis?: Array<{
    name: string;
    spent?: number;
    monthlyBudget?: number;
  }>;
}

/**
 * Generate alerts based on performance metrics
 */
export const generateAlerts = (
  _analytics: unknown,
  balance: BalanceData,
  metrics: Metrics
): Alert[] => {
  const alerts: Alert[] = [];

  // Budget adherence alerts
  if (metrics.budgetAdherence < 30) {
    alerts.push({
      type: "error",
      category: "budget",
      title: "Critical Budget Overspending",
      message: "Multiple envelopes are significantly over budget",
      severity: "high",
      action: "Immediately review and adjust spending habits",
    });
  } else if (metrics.budgetAdherence < 60) {
    alerts.push({
      type: "warning",
      category: "budget",
      title: "Budget Adherence Warning",
      message: "Several categories are exceeding planned spending",
      severity: "medium",
      action: "Consider adjusting budgets or reducing expenses",
    });
  }

  // Savings rate alerts
  if (metrics.savingsRate < 25) {
    alerts.push({
      type: "warning",
      category: "savings",
      title: "Low Savings Rate",
      message: "Current savings rate is below recommended levels",
      severity: "medium",
      action: "Increase automatic savings allocations",
    });
  }

  // Balance stability alerts
  if (metrics.balanceStability < 50) {
    alerts.push({
      type: "error",
      category: "balance",
      title: "Balance Discrepancy",
      message: "Significant difference between actual and virtual balance",
      severity: "high",
      action: "Reconcile accounts and review transactions",
    });
  }

  // Envelope specific alerts
  if (balance.envelopeAnalysis) {
    const criticalEnvelopes = balance.envelopeAnalysis.filter((env) => {
      const utilization = (env.spent || 0) / (env.monthlyBudget || 1);
      return utilization > 1.2;
    });

    if (criticalEnvelopes.length > 0) {
      alerts.push({
        type: "warning",
        category: "envelope",
        title: "Envelope Overspending",
        message: `${criticalEnvelopes.length} envelope(s) significantly over budget`,
        severity: "medium",
        action: "Review spending in affected categories",
        details: criticalEnvelopes.map((env) => env.name).join(", "),
      });
    }
  }

  return alerts.sort((a, b) => {
    const severityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
};

interface Recommendation {
  type: string;
  title: string;
  message: string;
  action: string;
}

/**
 * Generate performance recommendations
 */
export const generateRecommendations = (metrics: Metrics): Recommendation[] => {
  const recommendations: Recommendation[] = [];

  if (metrics.overallScore && metrics.overallScore >= 90) {
    recommendations.push({
      type: "success",
      title: "Excellent Financial Health",
      message: "Your financial management is performing exceptionally well!",
      action: "Consider exploring advanced investment opportunities",
    });
  } else if (metrics.overallScore && metrics.overallScore >= 70) {
    recommendations.push({
      type: "info",
      title: "Good Financial Standing",
      message: "Your finances are on track with room for optimization",
      action: "Focus on improving the lowest-scoring areas",
    });
  } else {
    recommendations.push({
      type: "warning",
      title: "Financial Health Needs Attention",
      message: "Several areas require improvement for better financial stability",
      action: "Prioritize budget planning and expense tracking",
    });
  }

  // Specific recommendations based on metrics
  if (metrics.budgetAdherence < 70) {
    recommendations.push({
      type: "tip",
      title: "Improve Budget Adherence",
      message: "Set more realistic budget amounts based on historical spending",
      action: "Use the Smart Envelope Suggestions feature",
    });
  }

  if (metrics.savingsRate < 50) {
    recommendations.push({
      type: "tip",
      title: "Boost Savings Rate",
      message: "Aim to save at least 10-20% of your income",
      action: "Set up automatic transfers to savings envelopes",
    });
  }

  return recommendations;
};
