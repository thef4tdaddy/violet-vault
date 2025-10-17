import React from "react";
import { CashFlowChart, DistributionPieChart } from "../../charts";

/**
 * Overview tab content for analytics
 * Extracted from ChartsAndAnalytics.jsx to reduce complexity
 */
const OverviewTab = ({ monthlyTrends, envelopeSpending }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Cash Flow */}
      <CashFlowChart
        title="Monthly Cash Flow"
        data={(monthlyTrends || []).filter(Boolean)}
        height={300}
      />

      {/* Top Spending Envelopes */}
      <DistributionPieChart
        title="Top Spending Envelopes"
        data={(envelopeSpending || []).filter(Boolean).slice(0, 8)}
        dataKey="amount"
        nameKey="name"
        height={300}
        emptyMessage="No envelope spending data available"
      />
    </div>
  );
};

export default OverviewTab;
