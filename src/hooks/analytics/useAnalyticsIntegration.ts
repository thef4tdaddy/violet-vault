import { useMemo, useCallback } from "react";
import { useAnalyticsData } from "./useAnalyticsData";
// import { useChartConfig } from "./useChartConfig"; // TODO: File does not exist
import {
  _calculateFinancialMetrics,
  calculateTrends,
  prepareDataForExport,
  _filterTransactionsByDateRange,
} from "../../utils/common/analyticsProcessor";
import logger from "../../utils/common/logger";
import {
  generateRecommendationsFromMetrics,
  calculatePerformanceMetrics,
} from "./utils/integrationUtils";
import { generateAnalyticsAlerts } from "./utils/analyticsAlertsUtils";

/**
 * Comprehensive analytics integration hook
 * Combines all analytics functionality for easy consumption
 * Issue #151 - ChartsAndAnalytics refactoring completion
 */
export const useAnalyticsIntegration = ({
  transactions = [],
  envelopes = [],
  bills: _bills = [],
  savingsGoals: _savingsGoals = [],
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

  // Get chart configuration - TODO: useChartConfig hook doesn't exist
  const chartConfig = useMemo(() => ({}), []);

  // Enhanced metrics with additional calculations
  const enhancedMetrics = useMemo(() => {
    const baseMetrics = analyticsData.metrics;
    const trends = calculateTrends(analyticsData.monthlyTrends as unknown[]);

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

    const trendsObj = typeof trends === "object" && trends !== null ? trends : {};

    return {
      ...baseMetrics,
      ...trendsObj,
      budgetAdherence,
      diversityScore,
      // Financial health indicators
      debtToIncomeRatio: 0, // Would need debt data
      emergencyFundRatio: 0, // Would need emergency fund data
      investmentRate: 0, // Would need investment tracking
    };
  }, [analyticsData]);

  // Alert system
  const alerts = useMemo(
    () => generateAnalyticsAlerts(analyticsData, enhancedMetrics, enableAlerts),
    [analyticsData, enhancedMetrics, enableAlerts]
  );

  // Export functionality
  const exportData = useCallback(
    async (format = "csv", options = {}) => {
      if (!enableExport) {
        throw new Error("Export functionality is disabled");
      }

      logger.info("Starting analytics export", { format, options });

      const exportPayload = {
        ...analyticsData,
        enhancedMetrics,
        alerts,
        timeFilter,
        exportOptions: options,
      };

      const processedData = prepareDataForExport(exportPayload, format);
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `VioletVault_Analytics_${timeFilter}_${timestamp}`;

      if (format === "csv") {
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
    },
    [analyticsData, enhancedMetrics, alerts, timeFilter, enableExport]
  );

  // Data refresh utility
  const refreshData = useCallback((newTimeFilter) => {
    logger.debug("Refreshing analytics data", { newTimeFilter });
  }, []);

  // Recommendation engine
  const recommendations = useMemo(
    () => generateRecommendationsFromMetrics(enhancedMetrics),
    [enhancedMetrics]
  );

  // Performance metrics for monitoring
  const performance = useMemo(() => calculatePerformanceMetrics(analyticsData), [analyticsData]);

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
