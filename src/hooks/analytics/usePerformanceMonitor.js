import { useState, useMemo, useEffect } from "react";
import logger from "../../utils/common/logger";

/**
 * Hook for calculating financial performance metrics and monitoring
 * Extracts complex performance logic from PerformanceMonitor component
 */
export const usePerformanceMonitor = (analyticsData, balanceData) => {
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState("overview");
  const [performanceHistory, setPerformanceHistory] = useState([]);

  // Calculate budget adherence score
  const calculateBudgetAdherence = (analytics, balance) => {
    if (!balance.envelopeAnalysis || balance.envelopeAnalysis.length === 0) return 0;

    const adherenceScores = balance.envelopeAnalysis.map((envelope) => {
      const budget = envelope.monthlyBudget || 0;
      const spent = envelope.spent || 0;

      if (budget === 0) return 100; // No budget set

      const utilization = spent / budget;
      if (utilization <= 0.9) return 100; // Under budget
      if (utilization <= 1.0) return 90; // Slightly over
      if (utilization <= 1.2) return 60; // Moderately over
      return 20; // Severely over budget
    });

    return Math.round(
      adherenceScores.reduce((sum, score) => sum + score, 0) / adherenceScores.length
    );
  };

  // Calculate savings rate score
  const calculateSavingsRate = (analytics, balance) => {
    if (!analytics.totalIncome || analytics.totalIncome === 0) return 0;

    const savingsAmount =
      balance.savingsGoals?.reduce((total, goal) => total + (goal.currentAmount || 0), 0) || 0;

    const savingsRate = (savingsAmount / analytics.totalIncome) * 100;

    if (savingsRate >= 20) return 100;
    if (savingsRate >= 15) return 90;
    if (savingsRate >= 10) return 75;
    if (savingsRate >= 5) return 50;
    return 25;
  };

  // Calculate spending efficiency score
  const calculateSpendingEfficiency = (analytics) => {
    if (!analytics.categoryBreakdown || analytics.categoryBreakdown.length === 0) return 0;

    // Calculate spending distribution (Gini coefficient-like measure)
    const amounts = analytics.categoryBreakdown.map((cat) => Math.abs(cat.amount));
    const totalSpending = amounts.reduce((sum, amount) => sum + amount, 0);

    if (totalSpending === 0) return 100;

    const sortedAmounts = amounts.sort((a, b) => a - b);
    let giniNumerator = 0;

    for (let i = 0; i < sortedAmounts.length; i++) {
      for (let j = 0; j < sortedAmounts.length; j++) {
        giniNumerator += Math.abs(sortedAmounts[i] - sortedAmounts[j]);
      }
    }

    const gini = giniNumerator / (2 * sortedAmounts.length * totalSpending);

    // Convert Gini to efficiency score (lower Gini = more balanced = higher efficiency)
    return Math.round(Math.max(0, 100 - gini * 100));
  };

  // Calculate balance stability score
  const calculateBalanceStability = (balance) => {
    const actualBalance = balance.actualBalance || 0;
    const virtualBalance = balance.virtualBalance || 0;
    const discrepancy = Math.abs(actualBalance - virtualBalance);

    if (actualBalance === 0) return 50; // No data

    const discrepancyPercentage = (discrepancy / Math.abs(actualBalance)) * 100;

    if (discrepancyPercentage <= 1) return 100;
    if (discrepancyPercentage <= 3) return 90;
    if (discrepancyPercentage <= 5) return 75;
    if (discrepancyPercentage <= 10) return 50;
    return 25;
  };

  // Generate alerts based on performance
  const generateAlerts = (analytics, balance, metrics) => {
    const alerts = [];

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
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  };

  // Generate performance recommendations
  const generateRecommendations = (metrics) => {
    const recommendations = [];

    if (metrics.overallScore >= 90) {
      recommendations.push({
        type: "success",
        title: "Excellent Financial Health",
        message: "Your financial management is performing exceptionally well!",
        action: "Consider exploring advanced investment opportunities",
      });
    } else if (metrics.overallScore >= 70) {
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

    if (metrics.spendingEfficiency < 60) {
      recommendations.push({
        type: "tip",
        title: "Optimize Spending Distribution",
        message: "Your spending is concentrated in few categories",
        action: "Review and rebalance your expense categories",
      });
    }

    return recommendations;
  };

  // Performance metrics calculation
  const performanceMetrics = useMemo(() => {
    if (!analyticsData || !balanceData) {
      return {
        overallScore: 0,
        budgetAdherence: 0,
        savingsRate: 0,
        spendingEfficiency: 0,
        balanceStability: 0,
        alerts: [],
        recommendations: [],
      };
    }

    // Calculate individual metrics
    const budgetAdherence = calculateBudgetAdherence(analyticsData, balanceData);
    const savingsRate = calculateSavingsRate(analyticsData, balanceData);
    const spendingEfficiency = calculateSpendingEfficiency(analyticsData);
    const balanceStability = calculateBalanceStability(balanceData);

    const overallScore = Math.round(
      budgetAdherence * 0.3 +
        savingsRate * 0.25 +
        spendingEfficiency * 0.25 +
        balanceStability * 0.2
    );

    // Generate alerts and recommendations
    const alerts = generateAlerts(analyticsData, balanceData, {
      budgetAdherence,
      savingsRate,
      spendingEfficiency,
      balanceStability,
    });

    const recommendations = generateRecommendations({
      budgetAdherence,
      savingsRate,
      spendingEfficiency,
      balanceStability,
      overallScore,
    });

    return {
      overallScore,
      budgetAdherence,
      savingsRate,
      spendingEfficiency,
      balanceStability,
      alerts,
      recommendations,
    };
  }, [analyticsData, balanceData]);

  // Update performance history (simulated real-time updates)
  useEffect(() => {
    const interval = setInterval(() => {
      setPerformanceHistory((prev) => {
        const newEntry = {
          timestamp: Date.now(),
          score: performanceMetrics.overallScore,
          budgetAdherence: performanceMetrics.budgetAdherence,
          savingsRate: performanceMetrics.savingsRate,
        };

        const updatedHistory = [...prev, newEntry].slice(-50); // Keep last 50 entries
        return updatedHistory;
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [performanceMetrics]);

  // Log significant performance changes
  useEffect(() => {
    if (performanceMetrics.overallScore > 0) {
      logger.debug("Performance metrics updated", {
        overallScore: performanceMetrics.overallScore,
        alertCount: performanceMetrics.alerts.length,
        recommendationCount: performanceMetrics.recommendations.length,
      });
    }
  }, [performanceMetrics]);

  return {
    // State
    alertsEnabled,
    selectedMetric,
    performanceHistory,
    performanceMetrics,

    // Actions
    setAlertsEnabled,
    setSelectedMetric,
  };
};
