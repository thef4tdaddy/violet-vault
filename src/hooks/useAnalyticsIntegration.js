import { useMemo, useCallback } from "react";
import { useAnalyticsData } from "./useAnalyticsData";
import { useChartConfig } from "./useChartConfig";
import {
  calculateFinancialMetrics,
  calculateTrends,
  prepareDataForExport,
  filterTransactionsByDateRange,
} from "../utils/analyticsProcessor";
import logger from "../utils/logger";

/**
 * Comprehensive analytics integration hook
 * Combines all analytics functionality for easy consumption
 * Issue #151 - ChartsAndAnalytics refactoring completion
 */
export const useAnalyticsIntegration = ({
  transactions = [],
  envelopes = [],
  bills = [],
  savingsGoals = [],
  timeFilter = "thisMonth",
  enableExport = true,
  enableAlerts = true,
}) => {
  // Get analytics data
  const analyticsData = useAnalyticsData({
    transactions,
    envelopes,
    timeFilter,
  });

  // Get chart configuration
  const chartConfig = useChartConfig();

  // Enhanced metrics with additional calculations
  const enhancedMetrics = useMemo(() => {
    const baseMetrics = analyticsData.metrics;
    const trends = calculateTrends(analyticsData.monthlyTrends);

    // Performance indicators
    const budgetAdherence =
      analyticsData.envelopeHealth.length > 0
        ? analyticsData.envelopeHealth.reduce(
            (sum, env) => sum + Math.min(100, env.healthScore),
            0
          ) / analyticsData.envelopeHealth.length
        : 100;

    const diversityScore =
      analyticsData.categoryBreakdown.length > 0
        ? Math.min(100, analyticsData.categoryBreakdown.length * 10) // More categories = higher diversity
        : 0;

    return {
      ...baseMetrics,
      ...trends,
      budgetAdherence,
      diversityScore,
      // Financial health indicators
      debtToIncomeRatio: 0, // Would need debt data
      emergencyFundRatio: 0, // Would need emergency fund data
      investmentRate: 0, // Would need investment tracking
    };
  }, [analyticsData]);

  // Alert system
  const alerts = useMemo(() => {
    if (!enableAlerts) return [];

    const alertList = [];

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
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }, [analyticsData, enhancedMetrics, enableAlerts]);

  // Export functionality
  const exportData = useCallback(
    async (format = "csv", options = {}) => {
      if (!enableExport) {
        throw new Error("Export functionality is disabled");
      }

      try {
        logger.info("Starting analytics export", { format, options });

        const exportPayload = {
          ...analyticsData,
          enhancedMetrics,
          alerts,
          timeFilter,
          exportOptions: options,
        };

        const processedData = prepareDataForExport(exportPayload, format);

        // Generate filename
        const timestamp = new Date().toISOString().split("T")[0];
        const filename = `VioletVault_Analytics_${timeFilter}_${timestamp}`;

        if (format === "csv") {
          // Convert to CSV and download
          const csvContent = processedData
            .map((row) => row.map((field) => `"${field}"`).join(","))
            .join("\n");

          const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `${filename}.csv`;
          link.click();
          URL.revokeObjectURL(link.href);
        } else if (format === "json") {
          // Export as JSON
          const jsonContent = JSON.stringify(processedData, null, 2);
          const blob = new Blob([jsonContent], { type: "application/json" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `${filename}.json`;
          link.click();
          URL.revokeObjectURL(link.href);
        }

        logger.info("Analytics export completed successfully");
        return { success: true, filename };
      } catch (error) {
        logger.error("Analytics export failed", error);
        throw error;
      }
    },
    [analyticsData, enhancedMetrics, alerts, timeFilter, enableExport]
  );

  // Data refresh utility
  const refreshData = useCallback((newTimeFilter) => {
    logger.debug("Refreshing analytics data", { newTimeFilter });
    // This would trigger a re-render with new time filter
    // In a real implementation, this might trigger data fetching
  }, []);

  // Recommendation engine
  const recommendations = useMemo(() => {
    const recs = [];

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
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [enhancedMetrics]);

  // Performance metrics for monitoring
  const performance = useMemo(() => {
    const dataPoints = {
      transactions: analyticsData.filteredTransactions.length,
      envelopes: analyticsData.envelopeHealth.length,
      categories: analyticsData.categoryBreakdown.length,
      monthsOfData: analyticsData.monthlyTrends.length,
    };

    const processingTime = performance.now(); // Would measure actual processing time

    return {
      ...dataPoints,
      processingTime,
      dataQuality: dataPoints.transactions > 0 ? "good" : "insufficient",
      lastUpdated: new Date().toISOString(),
    };
  }, [analyticsData]);

  return {
    // Core analytics data
    ...analyticsData,

    // Enhanced functionality
    enhancedMetrics,
    alerts,
    recommendations,
    performance,

    // Chart configuration
    chartConfig,

    // Utilities
    exportData,
    refreshData,

    // Status
    isReady: analyticsData.filteredTransactions.length > 0,
    hasData: analyticsData.metrics.transactionCount > 0,
    timeFilter,
  };
};

export default useAnalyticsIntegration;
