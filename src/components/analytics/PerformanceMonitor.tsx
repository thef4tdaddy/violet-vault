import React from "react";
import { usePerformanceMonitor } from "../../hooks/analytics/usePerformanceMonitor";
import PerformanceHeader from "./performance/PerformanceHeader";
import OverallScore from "./performance/OverallScore";
import MetricsGrid from "./performance/MetricsGrid";
import PerformanceTabNavigation from "./performance/PerformanceTabNavigation";
import PerformanceTabContent from "./performance/PerformanceTabContent";

import { AnalyticsData, BalanceData } from "@/types/analytics";

interface PerformanceMonitorProps {
  analyticsData: AnalyticsData | null | undefined;
  balanceData: BalanceData | null | undefined;
}

/**
 * Performance Monitor for v1.10.0
 * Pure UI component - all logic extracted to usePerformanceMonitor hook
 * Refactored to use focused components for better maintainability
 */
const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ analyticsData, balanceData }) => {
  const {
    alertsEnabled,
    selectedMetric,
    performanceHistory,
    performanceMetrics,
    setAlertsEnabled,
    setSelectedMetric,
  } = usePerformanceMonitor(analyticsData, balanceData);

  return (
    <div className="glassmorphism rounded-xl p-6">
      <PerformanceHeader alertsEnabled={alertsEnabled} setAlertsEnabled={setAlertsEnabled} />

      <OverallScore score={performanceMetrics.overallScore} />

      <MetricsGrid performanceMetrics={performanceMetrics} />

      <PerformanceTabNavigation
        selectedMetric={selectedMetric}
        setSelectedMetric={setSelectedMetric}
        alertsCount={performanceMetrics.alerts.length}
        recommendationsCount={performanceMetrics.recommendations.length}
      />

      <PerformanceTabContent
        selectedMetric={selectedMetric}
        performanceHistory={performanceHistory}
        performanceMetrics={{
          alerts: performanceMetrics.alerts,
          recommendations: performanceMetrics.recommendations,
        }}
      />
    </div>
  );
};

export default PerformanceMonitor;
