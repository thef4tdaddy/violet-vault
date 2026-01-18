import React from "react";
import { MetricCard } from "../primitives/cards/MetricCard";

// Minimal transaction interface for summary calculations
interface TransactionForSummary {
  amount: number;
}

interface TransactionSummaryCardsProps {
  transactions?: TransactionForSummary[];
}

/**
 * Transaction summary cards using standardized MetricCard component
 */
const TransactionSummaryCards: React.FC<TransactionSummaryCardsProps> = ({ transactions = [] }) => {
  // Calculate metrics
  const totalIncome = transactions
    .filter((t) => t && typeof t.amount === "number" && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t && typeof t.amount === "number" && t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netCashFlow = totalIncome - totalExpenses;
  const transactionCount = transactions.length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard
        icon="TrendingDown"
        title="Monthly Spend"
        value={totalExpenses}
        variant="danger"
        format="currency"
        subtitle={`${transactions.filter((t) => t.amount < 0).length} expenses`}
      />
      <MetricCard
        icon="TrendingUp"
        title="Income"
        value={totalIncome}
        variant="success"
        format="currency"
        subtitle={`${transactions.filter((t) => t.amount > 0).length} deposits`}
      />
      <MetricCard
        icon="BarChart"
        title="Net Flow"
        value={netCashFlow}
        variant={netCashFlow >= 0 ? "info" : "warning"}
        format="currency"
        subtitle={netCashFlow >= 0 ? "Positive flow" : "Deficit"}
      />
      <MetricCard
        icon="Hash"
        title="Transactions"
        value={transactionCount}
        variant="info" // blue mapped to info
        subtitle="This period"
      />
    </div>
  );
};

export default TransactionSummaryCards;
