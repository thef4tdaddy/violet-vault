import PageSummaryCard from "../../ui/PageSummaryCard";
import { getIcon } from "@/utils/ui/icons/index";
import { formatCurrency } from "@/utils/domain/accounts/accountHelpers";
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
      <PageSummaryCard
        icon={getIcon("DollarSign")}
        label="Total Debt"
        value={formatCurrency(stats.totalDebt)}
        color="red"
        subtext={`${stats.activeDebtCount} active debts`}
      />
      <PageSummaryCard
        icon={getIcon("TrendingDown")}
        label="Monthly Payments"
        value={formatCurrency(stats.totalMonthlyPayments)}
        color="orange"
        subtext="Required minimum payments"
      />
      <PageSummaryCard
        icon={getIcon("Percent")}
        label="Avg Interest Rate"
        value={`${stats.averageInterestRate.toFixed(2)}%`}
        color="blue"
        subtext="Weighted by balance"
      />
      <PageSummaryCard
        icon={getIcon("Calendar")}
        label="Due Soon"
        value={formatCurrency(stats.dueSoonAmount)}
        color="orange"
        subtext={`${stats.dueSoonCount} payments this week`}
        onClick={stats.dueSoonCount > 0 ? onDueSoonClick : undefined}
      />
    </div>
  );
};

export default DebtSummaryCards;
