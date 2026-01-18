import { MetricCard } from "../primitives/cards/MetricCard";

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
      variant: "warning" as const, // orange mapped to warning
      subtitle: `${totals.envelopeCount || 0} envelopes`,
    },
    {
      key: "balance-after-bills",
      icon: "DollarSign",
      title: "Balance / After Bills",
      value: totals.totalBalance || 0,
      variant: (balanceAfterBills < 0 ? "danger" : "success") as "danger" | "success",
      subtitle: `$${balanceAfterBills.toFixed(2)} after bills`,
    },
    {
      key: "total-spent",
      icon: "CreditCard",
      title: "Total Spent",
      value: totals.totalSpent || 0,
      variant: "info" as const, // indigo mapped to info
      subtitle: "All envelope spending",
    },
    {
      key: "biweekly-need",
      icon: "Calendar",
      title: "Biweekly Need",
      value: totals.totalBiweeklyNeed || 0,
      variant: "warning" as const, // amber mapped to warning
      subtitle: `${totals.billsDueCount || 0} bills due`,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <MetricCard
          key={card.key}
          icon={card.icon}
          title={card.title}
          value={card.value}
          subtitle={card.subtitle}
          variant={card.variant}
          format="currency"
          onClick={undefined}
        />
      ))}
    </div>
  );
};

export default EnvelopeSummaryCards;
