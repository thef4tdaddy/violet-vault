// components/savings/SavingsSummaryCard.tsx
import { MetricCard } from "../primitives/cards/MetricCard";
import type { SavingsGoal } from "@/db/types";

interface SavingsSummaryCardProps {
  savingsGoals?: SavingsGoal[];
  onAddGoal?: () => void;
}

const SavingsSummaryCard = ({
  savingsGoals = [],
  onAddGoal: _onAddGoal,
}: SavingsSummaryCardProps) => {
  // Calculate summary statistics
  const totalSaved = savingsGoals.reduce((sum, goal) => sum + (goal.currentAmount || 0), 0);
  const totalTargets = savingsGoals.reduce((sum, goal) => sum + (goal.targetAmount || 0), 0);
  const overallProgress = totalTargets > 0 ? (totalSaved / totalTargets) * 100 : 0;

  const completedGoals = savingsGoals.filter((goal) => {
    const current = goal.currentAmount || 0;
    const target = goal.targetAmount || 0;
    return current >= target && target > 0;
  });

  const activeGoals = savingsGoals.filter((goal) => {
    const current = goal.currentAmount || 0;
    const target = goal.targetAmount || 0;
    return current < target;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Total Saved */}
      <MetricCard
        icon="DollarSign"
        title="Total Saved"
        value={totalSaved}
        variant="success"
        format="currency"
        subtitle={`Target: $${totalTargets.toFixed(2)}`}
      />

      {/* Overall Progress */}
      <MetricCard
        icon="TrendingUp"
        title="Overall Progress"
        value={overallProgress}
        variant="info"
        format="percentage"
        subtitle={`$${(totalTargets - totalSaved).toFixed(2)} remaining`}
      />

      {/* Total Goals */}
      <MetricCard
        icon="Target"
        title="Goals"
        value={savingsGoals.length}
        variant="success" // pink mapped to success for 'completion' vibes
        subtitle={`${completedGoals.length} completed, ${activeGoals.length} active`}
      />

      {/* Target Amount */}
      <MetricCard
        icon="Crosshair"
        title="Target Amount"
        value={totalTargets}
        variant="info" // cyan mapped to info
        format="currency"
        subtitle={`Across ${savingsGoals.length} ${savingsGoals.length === 1 ? "goal" : "goals"}`}
      />
    </div>
  );
};

export default SavingsSummaryCard;
