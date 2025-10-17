import React from "react";
import { DistributionPieChartWithDetails } from "../../charts";

/**
 * Categories tab content for analytics
 * Extracted from ChartsAndAnalytics.jsx to reduce complexity
 */
const CategoriesTab = ({ categoryBreakdown }) => {
  return (
    <DistributionPieChartWithDetails
      title="Spending by Category"
      data={categoryBreakdown || []}
      dataKey="amount"
      nameKey="name"
      maxItems={8}
    />
  );
};

export default CategoriesTab;
