import React from "react";
import { getIcon } from "../../../utils";
import { logger } from "../../../utils/common/logger";

/**
 * Biweekly Status Card - Progress tracking for biweekly goals
 *
 * Features:
 * - Amount needed to stay on track
 * - Total biweekly allocation goal
 * - Progress bar visualization
 * - Action buttons for planning and adjusting
 */
const BiweeklyStatusCard = ({ setActiveView }) => {
  // TODO: Connect to existing biweekly tracking data
  // For now using mock data for dashboard redesign
  const mockBiweeklyData = {
    amountNeeded: 1200.0,
    totalGoal: 4800.0,
    progressPercentage: 65,
    currentAllocated: 3100.0,
  };

  const { amountNeeded, totalGoal, progressPercentage } = mockBiweeklyData;

  const onPlanAllocations = () => {
    logger.userAction("Plan allocations button clicked", {
      component: "BiweeklyStatusCard",
      currentProgress: progressPercentage,
      amountNeeded: amountNeeded,
      totalGoal: totalGoal,
    });
    // TODO: Implement plan allocations modal/flow
  };

  const onAdjustGoals = () => {
    logger.userAction("Adjust goals button clicked", {
      component: "BiweeklyStatusCard",
      currentProgress: progressPercentage,
      totalGoal: totalGoal,
    });
    // TODO: Implement adjust goals modal/flow
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    if (percentage >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const handlePlanAllocations = () => {
    if (onPlanAllocations) {
      onPlanAllocations();
    } else if (setActiveView) {
      setActiveView("paychecks");
    }
  };

  const handleAdjustGoals = () => {
    if (onAdjustGoals) {
      onAdjustGoals();
    } else if (setActiveView) {
      setActiveView("envelopes");
    }
  };

  return (
    <div className="glassmorphism rounded-lg p-6 border-2 border-black bg-blue-100/40 backdrop-blur-sm h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        {React.createElement(getIcon("TrendingUp"), {
          className: "h-6 w-6 text-blue-700",
        })}
        <h3 className="text-lg font-black text-black">
          <span className="text-xl">B</span>IWEEKLY{" "}
          <span className="text-xl">S</span>TATUS
        </h3>
      </div>

      {/* Status Metrics */}
      <div className="space-y-4 mb-6">
        <div>
          <div className="text-sm text-blue-900 mb-1">
            Amount Needed to Stay on Track:
          </div>
          <div className="text-2xl font-bold text-black">
            ${amountNeeded?.toLocaleString() || "0.00"}
          </div>
        </div>

        <div>
          <div className="text-sm text-blue-900 mb-1">
            Total Biweekly Allocation Goal:
          </div>
          <div className="text-xl font-semibold text-black">
            ${totalGoal?.toLocaleString() || "0.00"}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-blue-900">
            <span>Progress</span>
            <span>{Math.round(progressPercentage || 0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 border border-gray-300">
            <div
              className={`h-full rounded-full transition-all duration-300 ${getProgressColor(progressPercentage)}`}
              style={{ width: `${Math.min(progressPercentage || 0, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handlePlanAllocations}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-black bg-white/60 hover:bg-blue-200/60 transition-colors"
        >
          {React.createElement(getIcon("Target"), { className: "h-4 w-4" })}
          <span className="text-sm font-medium">Plan Allocations</span>
        </button>

        <button
          onClick={handleAdjustGoals}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-black bg-white/60 hover:bg-blue-200/60 transition-colors"
        >
          {React.createElement(getIcon("Settings"), { className: "h-4 w-4" })}
          <span className="text-sm font-medium">Adjust Goals</span>
        </button>
      </div>
    </div>
  );
};

export default BiweeklyStatusCard;
