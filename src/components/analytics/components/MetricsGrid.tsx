import React from "react";
import { MetricCard } from "@/components/primitives";
import { MetricsGridProps } from "@/types/analytics";

/**
 * Metrics grid component for analytics overview
 * Extracted from ChartsAndAnalytics.jsx to reduce complexity
 */
const MetricsGrid: React.FC<MetricsGridProps> = ({
  filteredTransactions,
  metrics: _metrics,
  envelopes,
}) => {
  // Safe calculation of average transaction amount
  const averageTransactionAmount =
    filteredTransactions && filteredTransactions.length > 0
      ? filteredTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) /
        filteredTransactions.length
      : 0;

  // Safe calculation of total spending (absolute value of negative amounts)
  const totalSpending = filteredTransactions
    ? filteredTransactions
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total Transactions"
        value={(filteredTransactions || []).length}
        subtitle="Transactions in period"
        icon="Activity"
        variant="info"
        format="number"
      />
      <MetricCard
        title="Total Spending"
        value={totalSpending}
        subtitle="Total expenses"
        icon="DollarSign"
        variant="warning"
        format="currency"
      />
      <MetricCard
        title="Active Envelopes"
        value={(envelopes || []).length}
        subtitle="Envelope count"
        icon="Mail"
        variant="success"
        format="number"
      />
      <MetricCard
        title="Avg. per Transaction"
        value={averageTransactionAmount}
        subtitle="Average amount"
        icon="TrendingUp"
        variant="info"
        format="currency"
      />
    </div>
  );
};

export default MetricsGrid;
