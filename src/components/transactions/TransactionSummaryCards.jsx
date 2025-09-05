import React from "react";
import { TrendingUp, TrendingDown, BarChart, Hash } from "lucide-react";
import PageSummaryCard from "../ui/PageSummaryCard";

/**
 * Transaction summary cards using standardized PageSummaryCard component
 * Replaces custom gradient cards with standardized pattern
 */
const TransactionSummaryCards = ({ transactions = [] }) => {
  // Calculate metrics
  const totalIncome = transactions
    .filter((t) => t && typeof t.amount === "number" && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t && typeof t.amount === "number" && t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netCashFlow = totalIncome - totalExpenses;
  const transactionCount = transactions.length;

  const cards = [
    {
      key: "monthly-spend",
      icon: TrendingDown,
      label: "Monthly Spend",
      value: `$${totalExpenses.toFixed(2)}`,
      color: "blue",
      subtext: `${transactions.filter((t) => t.amount < 0).length} expenses`,
    },
    {
      key: "income",
      icon: TrendingUp,
      label: "Income",
      value: `$${totalIncome.toFixed(2)}`,
      color: "green",
      subtext: `${transactions.filter((t) => t.amount > 0).length} deposits`,
    },
    {
      key: "net-flow",
      icon: BarChart,
      label: "Net Flow",
      value: `${netCashFlow >= 0 ? "+" : ""}$${netCashFlow.toFixed(2)}`,
      color: netCashFlow >= 0 ? "purple" : "amber",
      subtext: netCashFlow >= 0 ? "Positive flow" : "Deficit",
      alert: netCashFlow < 0,
    },
    {
      key: "transaction-count",
      icon: Hash,
      label: "Transactions",
      value: transactionCount.toString(),
      color: "gray",
      subtext: "This period",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <PageSummaryCard
          key={card.key}
          icon={card.icon}
          label={card.label}
          value={card.value}
          subtext={card.subtext}
          color={card.color}
          alert={card.alert}
        />
      ))}
    </div>
  );
};

export default TransactionSummaryCards;
