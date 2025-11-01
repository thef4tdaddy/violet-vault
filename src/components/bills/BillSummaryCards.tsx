import { getIcon } from "../../utils";
import PageSummaryCard from "../ui/PageSummaryCard";

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
 * Bill summary cards using standardized gradient design
 * Pure UI component that preserves exact visual appearance
 */
const BillSummaryCards = ({ totals = {} }: BillSummaryCardsProps) => {
  const cards = [
    {
      key: "total-bills",
      icon: getIcon("DollarSign"),
      label: "Total Bills",
      value: `$${(totals.total || 0).toFixed(2)}`,
      color: "blue" as const,
      subtext: `${totals.totalCount || 0} bills`,
    },
    {
      key: "overdue",
      icon: getIcon("AlertTriangle"),
      label: "Overdue",
      value: `$${(totals.overdue || 0).toFixed(2)}`,
      color: "red" as const,
      subtext: `${totals.overdueCount || 0} bills`,
      alert: (totals.overdueCount || 0) > 0,
    },
    {
      key: "paid",
      icon: getIcon("CheckCircle"),
      label: "Paid",
      value: `$${(totals.paid || 0).toFixed(2)}`,
      color: "green" as const,
      subtext: `${totals.paidCount || 0} bills`,
    },
    {
      key: "upcoming",
      icon: getIcon("Clock"),
      label: "Upcoming",
      value: `$${(totals.upcoming || 0).toFixed(2)}`,
      color: "amber" as const,
      subtext: `${totals.upcomingCount || 0} bills`,
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
          onClick={() => {}}
        />
      ))}
    </div>
  );
};

export default BillSummaryCards;
