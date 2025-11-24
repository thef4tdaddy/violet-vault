import React from "react";
import { getIcon } from "@/utils";
import { Button } from "@/components/ui";

interface Debt {
  id: string;
  name: string;
  currentBalance: number;
  originalBalance: number;
  percentPaid: number;
}

interface DebtTrackerSectionProps {
  debts: Debt[];
  onViewAllDebts?: () => void;
}

/**
 * Debt Tracker Section
 * Shows mini progress bars for each debt
 */
const DebtTrackerSection = ({ debts, onViewAllDebts }: DebtTrackerSectionProps) => {
  if (debts.length === 0) {
    return null;
  }

  return (
    <div className="glassmorphism rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          {React.createElement(getIcon("TrendingDown"), {
            className: "h-5 w-5 mr-2 text-red-600",
          })}
          Debt Tracker
        </h3>

        {onViewAllDebts && (
          <Button
            onClick={onViewAllDebts}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            View All Debts
            {React.createElement(getIcon("ArrowRight"), {
              className: "h-4 w-4",
            })}
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {debts.slice(0, 3).map((debt) => (
          <div key={debt.id}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">{debt.name}</span>
              <span className="text-gray-600">
                ${debt.currentBalance.toFixed(2)} / ${debt.originalBalance.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300"
                  style={{ width: `${debt.percentPaid}%` }}
                ></div>
              </div>
              <span className="text-xs font-medium text-gray-600 w-12 text-right">
                {debt.percentPaid}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(DebtTrackerSection);
