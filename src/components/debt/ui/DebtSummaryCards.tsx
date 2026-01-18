import { MetricCard } from "../../primitives/cards/MetricCard";
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
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard
        icon="DollarSign"
        title="Total Debt"
        value={stats.totalDebt}
        variant="danger"
        format="currency"
        subtitle={`${stats.activeDebtCount} active debts`}
      />
      <MetricCard
        icon="TrendingDown"
        title="Monthly Payments"
        value={stats.totalMonthlyPayments}
        variant="warning"
        format="currency"
        subtitle="Required minimum payments"
      />
      <MetricCard
        icon="Percent"
        title="Avg Interest Rate"
        value={stats.averageInterestRate}
        variant="info"
        format="percentage"
        subtitle="Weighted by balance"
      />
      <MetricCard
        icon="Calendar"
        title="Due Soon"
        value={stats.dueSoonAmount}
        variant="warning"
        format="currency"
        subtitle={`${stats.dueSoonCount} payments this week`}
        onClick={stats.dueSoonCount > 0 ? onDueSoonClick : undefined}
      />
    </div>
  );
};

export default DebtSummaryCards;
