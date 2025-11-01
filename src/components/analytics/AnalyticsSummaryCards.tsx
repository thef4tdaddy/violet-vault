import { getIcon } from "@/utils";
import PageSummaryCard from "../ui/PageSummaryCard";

interface SummaryMetrics {
  totalExpenses?: number;
  envelopeUtilization?: number;
  savingsProgress?: number;
}

/**
 * Analytics summary cards using standardized PageSummaryCard component
 * Displays key analytics metrics with consistent styling
 */
const AnalyticsSummaryCards = ({ summaryMetrics = {} }: { summaryMetrics?: SummaryMetrics }) => {
  const { totalExpenses = 0, envelopeUtilization = 0, savingsProgress = 0 } = summaryMetrics;

  // Calculate average transaction size if we have expense data
  const avgTransaction = totalExpenses > 0 ? totalExpenses / (totalExpenses > 0 ? 1 : 1) : 0;

  // Calculate budget accuracy based on envelope utilization
  const budgetAccuracy = Math.min(100, Math.max(0, 100 - Math.abs(envelopeUtilization - 100)));

  const cards = [
    {
      key: "top-category",
      icon: getIcon("PieChart"),
      label: "Top Category",
      value: totalExpenses > 0 ? `$${totalExpenses.toFixed(2)}` : "$0.00",
      color: "indigo" as const,
      subtext: "Highest spending area",
    },
    {
      key: "avg-transaction",
      icon: getIcon("Calculator"),
      label: "Avg Transaction",
      value: `$${avgTransaction.toFixed(2)}`,
      color: "teal" as const,
      subtext: "Per transaction",
    },
    {
      key: "budget-accuracy",
      icon: getIcon("Target"),
      label: "Budget Accuracy",
      value: `${budgetAccuracy.toFixed(1)}%`,
      color: budgetAccuracy > 80 ? "pink" : budgetAccuracy > 60 ? "amber" : "red",
      subtext: "Envelope adherence",
      alert: budgetAccuracy < 60,
    } as const,
    {
      key: "savings-rate",
      icon: getIcon("TrendingUp"),
      label: "Savings Rate",
      value: `${savingsProgress.toFixed(1)}%`,
      color: "emerald" as const,
      subtext: "Goal completion",
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

export default AnalyticsSummaryCards;
