import { getIcon } from "@/utils";
import PageSummaryCard from "../ui/PageSummaryCard";

interface SummaryMetrics {
  totalExpenses?: number;
  envelopeUtilization?: number;
  savingsProgress?: number;
  expenseTransactionCount?: number;
  totalTransactionCount?: number;
  healthScore?: number;
}

const deriveHealthSummary = (
  healthScore: number
): { color: "emerald" | "amber" | "red"; label: string } => {
  if (healthScore >= 80) {
    return { color: "emerald", label: "Excellent" };
  }
  if (healthScore >= 60) {
    return { color: "amber", label: "Good" };
  }
  if (healthScore >= 40) {
    return { color: "red", label: "Fair" };
  }
  return { color: "red", label: "Needs Attention" };
};

const createSummaryCards = ({
  totalExpenses,
  expenseTransactionCount,
  totalTransactionCount,
  budgetAccuracy,
  healthScore,
}: {
  totalExpenses: number;
  expenseTransactionCount: number;
  totalTransactionCount: number;
  budgetAccuracy: number;
  healthScore: number;
}) => {
  const avgTransaction =
    expenseTransactionCount > 0 ? totalExpenses / expenseTransactionCount : 0;
  const { color: healthColor, label: healthLabel } = deriveHealthSummary(healthScore);
  const budgetAccuracyColor = budgetAccuracy > 80 ? "pink" : budgetAccuracy > 60 ? "amber" : "red";

  return [
    {
      key: "budget-health",
      icon: getIcon("HeartPulse"),
      label: "Budget Health",
      value: `${Math.round(healthScore)} / 100`,
      color: healthColor,
      subtext: healthLabel,
    },
    {
      key: "total-spending",
      icon: getIcon("PieChart"),
      label: "Total Spending",
      value: totalExpenses > 0 ? `$${totalExpenses.toFixed(2)}` : "$0.00",
      color: "blue" as const,
      subtext: `${totalTransactionCount} transactions`,
    },
    {
      key: "avg-transaction",
      icon: getIcon("Calculator"),
      label: "Avg Transaction",
      value: `$${avgTransaction.toFixed(2)}`,
      color: "teal" as const,
      subtext: `${expenseTransactionCount} expense transactions`,
    },
    {
      key: "budget-accuracy",
      icon: getIcon("Target"),
      label: "Budget Accuracy",
      value: `${budgetAccuracy.toFixed(1)}%`,
      color: budgetAccuracyColor,
      subtext: "Envelope adherence",
      alert: budgetAccuracy < 60,
    } as const,
  ];
};

/**
 * Analytics summary cards using standardized PageSummaryCard component
 * Displays key analytics metrics with consistent styling
 */
const AnalyticsSummaryCards = ({ summaryMetrics = {} }: { summaryMetrics?: SummaryMetrics }) => {
  const {
    totalExpenses = 0,
    envelopeUtilization = 0,
    expenseTransactionCount = 0,
    totalTransactionCount = 0,
    healthScore = 0,
  } = summaryMetrics;

  const budgetAccuracy = Math.min(100, Math.max(0, 100 - Math.abs(envelopeUtilization - 100)));

  const cards = createSummaryCards({
    totalExpenses,
    expenseTransactionCount,
    totalTransactionCount,
    budgetAccuracy,
    healthScore,
  });

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
