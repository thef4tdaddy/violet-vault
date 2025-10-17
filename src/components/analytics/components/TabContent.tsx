import React from "react";
import OverviewTab from "../tabs/OverviewTab";
import TrendsTab from "../tabs/TrendsTab";
import HealthTab from "../tabs/HealthTab";
import CategoriesTab from "../tabs/CategoriesTab";
import { TabContentProps } from "../../../types/analytics";

/**
 * Tab content renderer for analytics
 * Extracted from ChartsAndAnalytics.jsx to reduce complexity
 */
const TabContent: React.FC<TabContentProps> = ({
  activeTab,
  chartType,
  handleChartTypeChange,
  monthlyTrends,
  envelopeSpending,
  weeklyPatterns,
  envelopeHealth,
  budgetVsActual,
  categoryBreakdown,
}) => {
  switch (activeTab) {
    case "overview":
      return <OverviewTab monthlyTrends={monthlyTrends} envelopeSpending={envelopeSpending} />;

    case "trends":
      return (
        <TrendsTab
          chartType={chartType}
          handleChartTypeChange={handleChartTypeChange}
          monthlyTrends={monthlyTrends}
          weeklyPatterns={weeklyPatterns}
        />
      );

    case "health":
      return <HealthTab envelopeHealth={envelopeHealth} budgetVsActual={budgetVsActual} />;

    case "categories":
      return <CategoriesTab categoryBreakdown={categoryBreakdown} />;

    default:
      return (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <h3 className="text-lg font-medium">Tab Not Found</h3>
            <p className="mt-2">The selected tab "{activeTab}" is not available.</p>
          </div>
        </div>
      );
  }
};

export default TabContent;
