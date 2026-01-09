import { Alert, Recommendation } from "@/types/analytics";

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
  const today = new Date().toISOString();

  // Budget adherence alerts
  if (metrics.budgetAdherence < 30) {
    alerts.push({
      id: `alert-budget-critical-${Date.now()}`,
      type: "critical",
      title: "Critical Budget Overspending",
      message: "Multiple envelopes are significantly over budget",
      severity: "critical",
      date: today,
      action: "Immediately review and adjust spending habits",
    });
  } else if (metrics.budgetAdherence < 60) {
    alerts.push({
      id: `alert-budget-warning-${Date.now()}`,
      type: "warning",
      title: "Budget Adherence Warning",
      message: "Several categories are exceeding planned spending",
      severity: "warning",
      date: today,
      action: "Consider adjusting budgets or reducing expenses",
    });
  }

  // Savings rate alerts
  if (metrics.savingsRate < 25) {
    alerts.push({
      id: `alert-savings-warning-${Date.now()}`,
      type: "warning",
      title: "Low Savings Rate",
      message: "Current savings rate is below recommended levels",
      severity: "warning",
      date: today,
      action: "Increase automatic savings allocations",
    });
  }

  // Balance stability alerts
  if (metrics.balanceStability < 50) {
    alerts.push({
      id: `alert-balance-critical-${Date.now()}`,
      type: "critical",
      title: "Balance Discrepancy",
      message: "Significant difference between actual and virtual balance",
      severity: "critical",
      date: today,
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
        id: `alert-envelopes-warning-${Date.now()}`,
        type: "warning",
        title: "Envelope Overspending",
        message: `${criticalEnvelopes.length} envelope(s) significantly over budget`,
        severity: "warning",
        date: today,
        action: "Review spending in affected categories",
        details: criticalEnvelopes.map((env) => env.name).join(", "),
      });
    }
  }

  return alerts.sort((a, b) => {
    const severityOrder: Record<string, number> = { critical: 3, warning: 2, info: 1, success: 0 };
    return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
  });
};

/**
 * Generate performance recommendations
 */
export const generateRecommendations = (metrics: Metrics): Recommendation[] => {
  const recommendations: Recommendation[] = [];

  if (metrics.overallScore && metrics.overallScore >= 90) {
    recommendations.push({
      id: `rec-investment-${Date.now()}`,
      type: "investment",
      title: "Excellent Financial Health",
      message: "Your financial management is performing exceptionally well!",
      description: "You have maintained high budget adherence and savings rates.",
      impact: "High",
      action: "Consider exploring advanced investment opportunities",
    });
  } else if (metrics.overallScore && metrics.overallScore >= 70) {
    recommendations.push({
      id: `rec-optimization-${Date.now()}`,
      type: "spending",
      title: "Good Financial Standing",
      message: "Your finances are on track with room for optimization",
      description: "Most metrics are healthy, but some areas could be improved.",
      impact: "Medium",
      action: "Focus on improving the lowest-scoring areas",
    });
  } else {
    recommendations.push({
      id: `rec-improvement-${Date.now()}`,
      type: "spending",
      title: "Financial Health Needs Attention",
      message: "Several areas require improvement for better financial stability",
      description: "Budget adherence and savings are below recommended levels.",
      impact: "High",
      action: "Prioritize budget planning and expense tracking",
    });
  }

  // Specific recommendations based on metrics
  if (metrics.budgetAdherence < 70) {
    recommendations.push({
      id: `rec-budget-${Date.now()}`,
      type: "spending",
      title: "Improve Budget Adherence",
      message: "Set more realistic budget amounts based on historical spending",
      description: "Frequent overspending detected in multiple categories.",
      impact: "High",
      action: "Use the Smart Envelope Suggestions feature",
    });
  }

  if (metrics.savingsRate < 50) {
    recommendations.push({
      id: `rec-savings-${Date.now()}`,
      type: "saving",
      title: "Boost Savings Rate",
      message: "Aim to save at least 10-20% of your income",
      description: "Current savings rate is lower than recommended.",
      impact: "Medium",
      action: "Set up automatic transfers to savings envelopes",
    });
  }

  return recommendations;
};
