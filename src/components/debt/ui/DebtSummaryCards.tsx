import PageSummaryCard from "../../ui/PageSummaryCard";
import { getIcon } from "@/utils";
import type { DebtStats } from "@/types/debt";

interface DebtSummaryCardsProps {
  stats: DebtStats;
  onDueSoonClick: () => void;
}

/**
 * Debt overview summary cards
 * Pure UI component for displaying debt statistics
 */
const DebtSummaryCards = ({ stats, onDueSoonClick }: DebtSummaryCardsProps) => {
  const cards = [
    {
      key: "total-debt",
      icon: getIcon("DollarSign"),
      label: "Total Debt",
      value: `$${stats.totalDebt.toFixed(2)}`,
      color: "red" as const,
      subtext: `${stats.activeDebtCount} active debts`,
    },
    {
      key: "monthly-payments",
      icon: getIcon("TrendingDown"),
      label: "Monthly Payments",
      value: `$${stats.totalMonthlyPayments.toFixed(2)}`,
      color: "orange" as const,
      subtext: "Required minimum payments",
    },
    {
      key: "average-rate",
      icon: getIcon("Percent"),
      label: "Avg Interest Rate",
      value: `${stats.averageInterestRate.toFixed(2)}%`,
      color: "blue" as const,
      subtext: "Weighted by balance",
    },
    {
      key: "due-soon",
      icon: getIcon("Calendar"),
      label: "Due Soon",
      value: `$${stats.dueSoonAmount.toFixed(2)}`,
      color: "yellow" as const,
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
