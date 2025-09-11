import React from "react";
import MetricCard from "../ui/MetricCard";

/**
 * Metrics grid component for analytics overview
 * Extracted from ChartsAndAnalytics.jsx to reduce complexity
 */
const MetricsGrid = ({ filteredTransactions, metrics, envelopes }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total Transactions"
        value={(filteredTransactions || []).length}
        icon="Activity"
        color="blue"
      />
      <MetricCard
        title="Total Spending"
        value={`$${(metrics?.totalSpending || 0).toFixed(2)}`}
        icon="DollarSign"
        color="red"
      />
      <MetricCard
        title="Active Envelopes"
        value={(envelopes || []).length}
        icon="Package"
        color="green"
      />
      <MetricCard
        title="Avg. per Transaction"
        value={`$${(metrics?.averageTransaction || 0).toFixed(2)}`}
        icon="TrendingUp"
        color="purple"
      />
    </div>
  );
};

export default MetricsGrid;
