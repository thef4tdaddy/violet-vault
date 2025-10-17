import React from "react";
import PageSummaryCard from "../../ui/PageSummaryCard";

/**
 * Debt overview summary cards
 * Pure UI component for displaying debt statistics
 */
const DebtSummaryCards = ({ stats, onDueSoonClick }) => {
  const cards = [
    {
      key: "total-debt",
      icon: "DollarSign",
      label: "Total Debt",
      value: `$${stats.totalDebt.toFixed(2)}`,
      color: "red",
      subtext: `${stats.activeDebtCount} active debts`,
    },
    {
      key: "monthly-payments",
      icon: "TrendingDown",
      label: "Monthly Payments",
      value: `$${stats.totalMonthlyPayments.toFixed(2)}`,
      color: "orange",
      subtext: "Required minimum payments",
    },
    {
      key: "average-rate",
      icon: "Percent",
      label: "Avg Interest Rate",
      value: `${stats.averageInterestRate.toFixed(2)}%`,
      color: "purple",
      subtext: "Weighted by balance",
    },
    {
      key: "due-soon",
      icon: "Calendar",
      label: "Due Soon",
      value: `$${stats.dueSoonAmount.toFixed(2)}`,
      color: "yellow",
      subtext: `${stats.dueSoonCount} payments this week`,
      alert: stats.dueSoonCount > 0,
      onClick: stats.dueSoonCount > 0 ? onDueSoonClick : null,
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
          onClick={card.onClick}
        />
      ))}
    </div>
  );
};

export default DebtSummaryCards;
