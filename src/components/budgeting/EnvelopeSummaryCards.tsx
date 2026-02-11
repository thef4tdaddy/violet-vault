import PageSummaryCard from "../ui/PageSummaryCard";
import { getIcon } from "@/utils/ui/icons/index";
import { formatCurrency } from "@/utils/domain/accounts/accountHelpers";

interface EnvelopeTotals {
  totalBalance: number;
  totalUpcoming: number;
  totalAllocated: number;
  envelopeCount: number;
  totalSpent: number;
  totalBiweeklyNeed: number;
  billsDueCount: number;
}

/**
 * Envelope summary cards using standardized MetricCard component
 */
const EnvelopeSummaryCards = ({ totals = {} as EnvelopeTotals }) => {
  // Calculate balance after bills
  const balanceAfterBills = (totals.totalBalance || 0) - (totals.totalUpcoming || 0);

  const cards = [
    {
      key: "total-allocated",
      icon: "Wallet",
      title: "Total Allocated",
      value: totals.totalAllocated || 0,
      color: "purple" as const,
      subtitle: `${totals.envelopeCount || 0} envelopes`,
    },
    {
      key: "balance-after-bills",
      icon: "DollarSign",
      title: "Balance / After Bills",
      value: totals.totalBalance || 0,
      color: (balanceAfterBills < 0 ? "red" : "green") as "red" | "green",
      subtitle: `$${balanceAfterBills.toFixed(2)} after bills`,
    },
    {
      key: "total-spent",
      icon: "CreditCard",
      title: "Total Spent",
      value: totals.totalSpent || 0,
      color: "blue" as const,
      subtitle: "All envelope spending",
    },
    {
      key: "biweekly-need",
      icon: "Calendar",
      title: "Biweekly Need",
      value: totals.totalBiweeklyNeed || 0,
      color: "orange" as const,
      subtitle: `${totals.billsDueCount || 0} bills due`,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <PageSummaryCard
          key={card.key}
          icon={getIcon(card.icon)}
          label={card.title}
          value={formatCurrency(card.value)}
          subtext={card.subtitle}
          color={card.color}
          onClick={undefined}
        />
      ))}
    </div>
  );
};

export default EnvelopeSummaryCards;
