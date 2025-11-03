// components/savings/SavingsSummaryCard.jsx
import React from "react";
import { getIcon } from "../../utils";

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
    <div className="glassmorphism rounded-2xl p-6 border-2 border-black">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-black text-black text-xl flex items-center tracking-wide">
          <div className="relative mr-4">
            <div className="absolute inset-0 bg-purple-500 rounded-2xl blur-lg opacity-30"></div>
            <div className="relative bg-purple-500 p-3 rounded-2xl">
              {React.createElement(getIcon("Target"), {
                className: "h-6 w-6 text-white",
              })}
            </div>
          </div>
          <span className="text-2xl">S</span>AVINGS&nbsp;&nbsp;<span className="text-2xl">G</span>OALS
        </h2>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">${totalSaved.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Total Saved</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Progress */}
        <div className="bg-white/50 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-3 mb-2">
            {React.createElement(getIcon("TrendingUp"), {
              className: "h-5 w-5 text-blue-600",
            })}
            <span className="font-medium">Overall Progress</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{overallProgress.toFixed(1)}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(overallProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* Total Goals */}
        <div className="bg-white/50 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-3 mb-2">
            {React.createElement(getIcon("Target"), {
              className: "h-5 w-5 text-purple-600",
            })}
            <span className="font-medium">Goals</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">{savingsGoals.length}</div>
          <div className="text-sm text-gray-600">
            {completedGoals.length} completed, {activeGoals.length} active
          </div>
        </div>

        {/* Target Amount */}
        <div className="bg-white/50 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-3 mb-2">
            {React.createElement(getIcon("DollarSign"), {
              className: "h-5 w-5 text-green-600",
            })}
            <span className="font-medium">Target Amount</span>
          </div>
          <div className="text-2xl font-bold text-green-600">${totalTargets.toFixed(2)}</div>
          <div className="text-sm text-gray-600">
            ${(totalTargets - totalSaved).toFixed(2)} remaining
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavingsSummaryCard;
