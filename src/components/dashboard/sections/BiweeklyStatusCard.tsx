import React from "react";
import { getIcon } from "@/utils";
import { Button } from "@/components/ui";

interface BiweeklyStatusCardProps {
  amountNeeded: number;
  totalGoal: number;
  onPlanAllocations?: () => void;
  onAdjustGoals?: () => void;
}

/**
 * Biweekly Status Card
 * Shows progress tracking for biweekly budget goals
 */
const BiweeklyStatusCard = ({
  amountNeeded,
  totalGoal,
  onPlanAllocations,
  onAdjustGoals,
}: BiweeklyStatusCardProps) => {
  const progress = totalGoal > 0 ? ((totalGoal - amountNeeded) / totalGoal) * 100 : 0;
  const progressClamped = Math.max(0, Math.min(100, progress));

  return (
    <div className="glassmorphism rounded-2xl p-6 border border-white/20">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        {React.createElement(getIcon("TrendingUp"), {
          className: "h-5 w-5 mr-2 text-purple-600",
        })}
        Biweekly Status
      </h3>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Amount Needed to Stay on Track:</span>
            <span className="font-bold text-gray-900">${amountNeeded.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm mb-3">
            <span className="text-gray-600">Total Biweekly Allocation Goal:</span>
            <span className="font-bold text-gray-900">${totalGoal.toFixed(2)}</span>
          </div>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-purple-600">{progressClamped.toFixed(0)}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300"
                style={{ width: `${progressClamped}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {onPlanAllocations && (
            <Button
              onClick={onPlanAllocations}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium"
            >
              Plan Allocations
            </Button>
          )}
          {onAdjustGoals && (
            <Button
              onClick={onAdjustGoals}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium"
            >
              Adjust Goals
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(BiweeklyStatusCard);
