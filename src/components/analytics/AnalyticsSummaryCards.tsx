import { MetricCard } from "../primitives/cards/MetricCard";

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
): { variant: "success" | "warning" | "danger"; label: string } => {
  if (healthScore >= 80) {
    return { variant: "success", label: "Excellent" };
  }
  if (healthScore >= 60) {
    return { variant: "warning", label: "Good" };
  }
  if (healthScore >= 40) {
    return { variant: "danger", label: "Fair" };
  }
  return { variant: "danger", label: "Needs Attention" };
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
  const avgTransaction = expenseTransactionCount > 0 ? totalExpenses / expenseTransactionCount : 0;
  const { variant: healthVariant, label: healthLabel } = deriveHealthSummary(healthScore);

  // strict typing for variant
  const budgetAccuracyVariant: "success" | "warning" | "danger" =
    budgetAccuracy > 80 ? "success" : budgetAccuracy > 60 ? "warning" : "danger";

  return [
    {
      key: "budget-health",
      icon: "HeartPulse",
      title: "Budget Health",
      value: `${Math.round(healthScore)} / 100`,
      variant: healthVariant,
      subtitle: healthLabel,
    },
    {
      key: "total-spending",
      icon: "PieChart",
      title: "Total Spending",
      value: { value: totalExpenses, format: "currency" as const },
      variant: "info",
      subtitle: `${totalTransactionCount} transactions`,
    },
    {
      key: "avg-transaction",
      icon: "Calculator",
      title: "Avg Transaction",
      value: { value: avgTransaction, format: "currency" as const },
      variant: "info",
      subtitle: `${expenseTransactionCount} expense transactions`,
    },
    {
      key: "budget-accuracy",
      icon: "Target",
      title: "Budget Accuracy",
      value: { value: budgetAccuracy, format: "percentage" as const },
      variant: budgetAccuracyVariant,
      subtitle: "Envelope adherence",
      loading: false, // MetricCard doesn't support 'alert' prop directly, mapping is visual via variant
    },
  ] as const;
};

/**
 * Analytics summary cards using standardized MetricCard component
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
      {cards.map((card) => {
        // Handle complex value object or primitive
        const val =
          typeof card.value === "object" && card.value !== null
            ? (card.value as { value: number | string }).value
            : card.value;
        const fmt =
          typeof card.value === "object" && card.value !== null
            ? (card.value as { format: "currency" | "number" | "percentage" | "custom" }).format
            : undefined;

        return (
          <MetricCard
            key={card.key}
            icon={card.icon}
            title={card.title}
            value={val as number | string}
            subtitle={card.subtitle}
            variant={card.variant}
            format={fmt}
            onClick={() => {}}
          />
        );
      })}
    </div>
  );
};

export default AnalyticsSummaryCards;
