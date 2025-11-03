// components/savings/SavingsSummaryCard.jsx
import { getIcon } from "../../utils";
import PageSummaryCard from "../ui/PageSummaryCard";

const SavingsSummaryCard = ({ savingsGoals = [], onAddGoal: _onAddGoal }) => {
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
      <PageSummaryCard
        icon={getIcon("DollarSign")}
        label="Total Saved"
        value={`$${totalSaved.toFixed(2)}`}
        color="green"
        subtext={`Target: $${totalTargets.toFixed(2)}`}
      />

      {/* Overall Progress */}
      <PageSummaryCard
        icon={getIcon("TrendingUp")}
        label="Overall Progress"
        value={`${overallProgress.toFixed(1)}%`}
        color="blue"
        subtext={`$${(totalTargets - totalSaved).toFixed(2)} remaining`}
      />

      {/* Total Goals */}
      <PageSummaryCard
        icon={getIcon("Target")}
        label="Goals"
        value={savingsGoals.length}
        color="purple"
        subtext={`${completedGoals.length} completed, ${activeGoals.length} active`}
      />

      {/* Target Amount */}
      <PageSummaryCard
        icon={getIcon("Crosshair")}
        label="Target Amount"
        value={`$${totalTargets.toFixed(2)}`}
        color="cyan"
        subtext={`Across ${savingsGoals.length} ${savingsGoals.length === 1 ? 'goal' : 'goals'}`}
      />
    </div>
  );
};

export default SavingsSummaryCard;
