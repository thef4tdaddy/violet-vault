import React, { useState, useMemo, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Clock,
  DollarSign,
  Wallet,
  Bell,
  BellOff,
  Eye,
  EyeOff,
} from "lucide-react";
import logger from "../../utils/logger";

/**
 * Performance Monitor for v1.10.0
 * Features:
 * - Real-time financial health monitoring
 * - Smart alerts and notifications
 * - Goal tracking and progress monitoring
 * - Budget performance metrics
 * - Automated insights and recommendations
 */
const PerformanceMonitor = ({ analyticsData, balanceData }) => {
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState("overview");
  const [performanceHistory, setPerformanceHistory] = useState([]);

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

    // Calculate overall financial health score (0-100)
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

    // Generate alerts based on performance
    const alerts = generateAlerts(analyticsData, balanceData, {
      budgetAdherence,
      savingsRate,
      spendingEfficiency,
      balanceStability,
    });

    // Generate recommendations
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

  // Calculate budget adherence score
  function calculateBudgetAdherence(analytics, balance) {
    if (!balance.envelopeAnalysis || balance.envelopeAnalysis.length === 0) return 0;

    const adherenceScores = balance.envelopeAnalysis.map((envelope) => {
      const budget = envelope.monthlyBudget || 0;
      const spent = envelope.spent || 0;

      if (budget === 0) return 100; // No budget set

      const utilization = spent / budget;
      if (utilization <= 0.9) return 100; // Under budget
      if (utilization <= 1.0) return 90; // Slightly over
      if (utilization <= 1.2) return 70; // Moderately over
      return 40; // Significantly over
    });

    return Math.round(
      adherenceScores.reduce((sum, score) => sum + score, 0) / adherenceScores.length
    );
  }

  // Calculate savings rate score
  function calculateSavingsRate(analytics, balance) {
    const totalIncome = analytics.totalIncome || 0;
    const totalExpenses = analytics.totalExpenses || 0;

    if (totalIncome <= 0) return 0;

    const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;

    if (savingsRate >= 20) return 100;
    if (savingsRate >= 15) return 85;
    if (savingsRate >= 10) return 70;
    if (savingsRate >= 5) return 50;
    if (savingsRate >= 0) return 30;
    return 0; // Negative savings (deficit)
  }

  // Calculate spending efficiency score
  function calculateSpendingEfficiency(analytics) {
    if (!analytics.categoryBreakdown) return 50;

    const categories = Object.values(analytics.categoryBreakdown);
    const totalExpenses = categories.reduce((sum, cat) => sum + (cat.expenses || 0), 0);

    if (totalExpenses === 0) return 100;

    // Efficiency based on spending distribution and frequency
    const categoryCount = categories.length;
    const avgPerCategory = totalExpenses / categoryCount;
    const variance =
      categories.reduce((sum, cat) => {
        const diff = (cat.expenses || 0) - avgPerCategory;
        return sum + diff * diff;
      }, 0) / categoryCount;

    const coefficientOfVariation = Math.sqrt(variance) / avgPerCategory;

    // Lower variance = higher efficiency (more balanced spending)
    if (coefficientOfVariation <= 0.5) return 95;
    if (coefficientOfVariation <= 1.0) return 80;
    if (coefficientOfVariation <= 1.5) return 65;
    return 40;
  }

  // Calculate balance stability score
  function calculateBalanceStability(balance) {
    if (!balance.balanceSummary) return 0;

    const { isBalanced, difference, actualBalance } = balance.balanceSummary;

    if (isBalanced) return 100;

    const discrepancyRatio = Math.abs(difference) / Math.max(1, Math.abs(actualBalance));

    if (discrepancyRatio <= 0.01) return 95; // 1% or less
    if (discrepancyRatio <= 0.05) return 80; // 5% or less
    if (discrepancyRatio <= 0.1) return 60; // 10% or less
    return 30; // More than 10%
  }

  // Generate performance alerts
  function generateAlerts(analytics, balance, metrics) {
    const alerts = [];

    // Budget adherence alerts
    if (metrics.budgetAdherence < 70) {
      alerts.push({
        type: "warning",
        category: "budget",
        title: "Budget Adherence Alert",
        message: "Multiple envelopes are over budget this period",
        severity: metrics.budgetAdherence < 50 ? "high" : "medium",
        action: "Review and adjust envelope budgets",
      });
    }

    // Savings rate alerts
    if (metrics.savingsRate < 30) {
      alerts.push({
        type: "warning",
        category: "savings",
        title: "Low Savings Rate",
        message: "Your savings rate is below recommended levels",
        severity: metrics.savingsRate < 10 ? "high" : "medium",
        action: "Consider reducing expenses or increasing income",
      });
    }

    // Balance stability alerts
    if (metrics.balanceStability < 60) {
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
  }

  // Generate performance recommendations
  function generateRecommendations(metrics) {
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
  }

  // Update performance history (simulated real-time updates)
  useEffect(() => {
    const interval = setInterval(() => {
      setPerformanceHistory((prev) => {
        const newEntry = {
          timestamp: Date.now(),
          score: performanceMetrics.overallScore + (Math.random() - 0.5) * 5,
          budgetAdherence: performanceMetrics.budgetAdherence,
          savingsRate: performanceMetrics.savingsRate,
        };

        return [...prev.slice(-23), newEntry]; // Keep last 24 entries
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [performanceMetrics]);

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overall Score */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Financial Health Score</h3>
            <div className={`p-2 rounded-lg ${getScoreBgColor(performanceMetrics.overallScore)}`}>
              <Zap className={`h-5 w-5 ${getScoreColor(performanceMetrics.overallScore)}`} />
            </div>
          </div>

          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(performanceMetrics.overallScore)}`}>
              {performanceMetrics.overallScore}
            </div>
            <div className="text-gray-600 mt-1">out of 100</div>

            {/* Score breakdown */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Budget Adherence</span>
                <span className={getScoreColor(performanceMetrics.budgetAdherence)}>
                  {performanceMetrics.budgetAdherence}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Savings Rate</span>
                <span className={getScoreColor(performanceMetrics.savingsRate)}>
                  {performanceMetrics.savingsRate}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Spending Efficiency</span>
                <span className={getScoreColor(performanceMetrics.spendingEfficiency)}>
                  {performanceMetrics.spendingEfficiency}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Balance Stability</span>
                <span className={getScoreColor(performanceMetrics.balanceStability)}>
                  {performanceMetrics.balanceStability}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Alerts */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
            <button
              onClick={() => setAlertsEnabled(!alertsEnabled)}
              className={`p-2 rounded-lg ${alertsEnabled ? "bg-green-100" : "bg-gray-100"}`}
            >
              {alertsEnabled ? (
                <Bell className="h-5 w-5 text-green-600" />
              ) : (
                <BellOff className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {performanceMetrics.alerts.length === 0 ? (
              <div className="text-center py-4">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-gray-600">No active alerts</p>
                <p className="text-sm text-gray-500">Your finances are on track</p>
              </div>
            ) : (
              performanceMetrics.alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    alert.severity === "high"
                      ? "border-red-200 bg-red-50"
                      : alert.severity === "medium"
                        ? "border-yellow-200 bg-yellow-50"
                        : "border-blue-200 bg-blue-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {alert.severity === "high" ? (
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    ) : alert.severity === "medium" ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{alert.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                      {alert.action && (
                        <p className="text-xs text-gray-500 mt-2 font-medium">
                          Action: {alert.action}
                        </p>
                      )}
                      {alert.details && (
                        <p className="text-xs text-gray-400 mt-1">Details: {alert.details}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Smart Recommendations</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {performanceMetrics.recommendations.map((rec, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                rec.type === "success"
                  ? "border-green-200 bg-green-50"
                  : rec.type === "warning"
                    ? "border-yellow-200 bg-yellow-50"
                    : "border-blue-200 bg-blue-50"
              }`}
            >
              <div className="flex items-start gap-3">
                {rec.type === "success" ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : rec.type === "warning" ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                ) : (
                  <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                )}
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">{rec.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{rec.message}</p>
                  <p className="text-xs text-gray-500 mt-2 font-medium">{rec.action}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Trends (Real-time) */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Updates every 30 seconds</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Budget Performance</p>
            <p className={`text-xl font-bold ${getScoreColor(performanceMetrics.budgetAdherence)}`}>
              {performanceMetrics.budgetAdherence}%
            </p>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Savings Momentum</p>
            <p className={`text-xl font-bold ${getScoreColor(performanceMetrics.savingsRate)}`}>
              {performanceMetrics.savingsRate}%
            </p>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Wallet className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Balance Health</p>
            <p
              className={`text-xl font-bold ${getScoreColor(performanceMetrics.balanceStability)}`}
            >
              {performanceMetrics.balanceStability}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
