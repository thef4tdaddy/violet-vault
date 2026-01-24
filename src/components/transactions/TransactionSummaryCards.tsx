import React from "react";
import PageSummaryCard from "../ui/PageSummaryCard";
import { getIcon } from "@/utils/ui/icons/index";
import { formatCurrency } from "@/utils/domain/accounts/accountHelpers";

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
      <PageSummaryCard
        icon={getIcon("TrendingDown")}
        label="Monthly Spend"
        value={formatCurrency(totalExpenses)}
        color="red"
        subtext={`${transactions.filter((t) => t.amount < 0).length} expenses`}
      />
      <PageSummaryCard
        icon={getIcon("TrendingUp")}
        label="Income"
        value={formatCurrency(totalIncome)}
        color="green"
        subtext={`${transactions.filter((t) => t.amount > 0).length} deposits`}
      />
      <PageSummaryCard
        icon={getIcon("BarChart")}
        label="Net Flow"
        value={formatCurrency(netCashFlow)}
        color={netCashFlow >= 0 ? "blue" : "orange"}
        subtext={netCashFlow >= 0 ? "Positive flow" : "Deficit"}
      />
      <PageSummaryCard
        icon={getIcon("Hash")}
        label="Transactions"
        value={transactionCount}
        color="blue"
        subtext="This period"
      />
    </div>
  );
};

export default TransactionSummaryCards;
