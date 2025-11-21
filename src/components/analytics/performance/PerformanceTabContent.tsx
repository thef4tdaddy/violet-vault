import React from "react";
import PerformanceOverviewTab from "./PerformanceOverviewTab";
import PerformanceAlertsTab from "./PerformanceAlertsTab";
import PerformanceRecommendationsTab from "./PerformanceRecommendationsTab";

import { PerformanceEntry, Alert, Recommendation } from "@/types/analytics";

interface PerformanceTabContentProps {
  selectedMetric: string;
  performanceHistory: PerformanceEntry[];
  performanceMetrics: {
    alerts: Alert[];
    recommendations: Recommendation[];
  };
}

/**
 * PerformanceTabContent component - renders active tab content
 * Extracted from PerformanceMonitor.jsx for better organization
 */
const PerformanceTabContent: React.FC<PerformanceTabContentProps> = ({
  selectedMetric,
  performanceHistory,
  performanceMetrics,
}) => {
  switch (selectedMetric) {
    case "overview":
      return <PerformanceOverviewTab performanceHistory={performanceHistory} />;

    case "alerts":
      return <PerformanceAlertsTab alerts={performanceMetrics.alerts} />;

    case "recommendations":
      return <PerformanceRecommendationsTab recommendations={performanceMetrics.recommendations} />;

    default:
      return <PerformanceOverviewTab performanceHistory={performanceHistory} />;
  }
};

export default PerformanceTabContent;
