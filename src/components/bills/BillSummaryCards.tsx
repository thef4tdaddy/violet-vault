import { getIcon } from "@/utils/ui/icons/index";
import PageSummaryCard from "../ui/PageSummaryCard";
import { formatCurrency } from "@/utils/domain/accounts/accountHelpers";

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
        <PageSummaryCard
          key={card.key}
          icon={getIcon(card.icon)}
          label={card.title}
          value={formatCurrency(card.value)}
          subtext={card.subtitle}
          color={
            card.variant === "info"
              ? "blue"
              : card.variant === "danger"
                ? "red"
                : card.variant === "success"
                  ? "green"
                  : card.variant === "warning"
                    ? "orange"
                    : "blue"
          }
          onClick={() => {}}
          data-testid="summary-card"
        />
      ))}
    </div>
  );
};

export default BillSummaryCards;
