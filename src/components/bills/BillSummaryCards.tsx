import { MetricCard } from "../primitives/cards/MetricCard";

interface BillTotals {
  total?: number;
  totalCount?: number;
  overdue?: number;
  overdueCount?: number;
  paid?: number;
  paidCount?: number;
  upcoming?: number;
  upcomingCount?: number;
}

interface BillSummaryCardsProps {
  totals?: BillTotals;
}

/**
 * Bill summary cards using standardized MetricCard component
 */
const BillSummaryCards = ({ totals = {} }: BillSummaryCardsProps) => {
  const cards = [
    {
      key: "total-bills",
      icon: "DollarSign",
      title: "Total Bills",
      value: totals.total || 0,
      variant: "info" as const,
      subtitle: `${totals.totalCount || 0} bills`,
    },
    {
      key: "overdue",
      icon: "AlertTriangle",
      title: "Overdue",
      value: totals.overdue || 0,
      variant: "danger" as const,
      subtitle: `${totals.overdueCount || 0} bills`,
      // alert logic handled by variant="danger" implicitly visually
    },
    {
      key: "paid",
      icon: "CheckCircle",
      title: "Paid",
      value: totals.paid || 0,
      variant: "success" as const,
      subtitle: `${totals.paidCount || 0} bills`,
    },
    {
      key: "upcoming",
      icon: "Clock",
      title: "Upcoming",
      value: totals.upcoming || 0,
      variant: "warning" as const,
      subtitle: `${totals.upcomingCount || 0} bills`,
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
          onClick={() => {}}
        />
      ))}
    </div>
  );
};

export default BillSummaryCards;
