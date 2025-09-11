import React from "react";
import { getIcon } from "../../utils";
import { useDebtTracker } from "../../hooks/dashboard/useDebtTracker";

/**
 * Debt Tracker Section - Visual debt progress overview
 *
 * Features:
 * - Progress bars for each active debt
 * - Total debt remaining and progress percentage
 * - Visual debt payoff projections
 * - Link to full debt management
 */
const DebtTrackerSection = ({ setActiveView }) => {
  const {
    activeDebts,
    totalDebtRemaining,
    totalOriginalDebt,
    overallProgress,
    projectedPayoffDate,
  } = useDebtTracker();

  const getProgressColor = (percentage) => {
    if (percentage >= 75) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    if (percentage >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  const handleViewDebtPage = () => {
    if (setActiveView) {
      setActiveView("debt");
    }
  };

  if (!activeDebts || activeDebts.length === 0) {
    return (
      <div className="px-6 mb-6">
        <div className="glassmorphism rounded-lg p-6 border-2 border-black bg-green-100/40 backdrop-blur-sm">
          <div className="text-center py-8">
            <div className="mb-4">
              {React.createElement(getIcon("CheckCircle"), {
                className: "h-12 w-12 mx-auto text-green-600",
              })}
            </div>
            <h3 className="text-lg font-black text-black mb-2">
              <span className="text-xl">D</span>EBT{" "}
              <span className="text-xl">F</span>REE!
            </h3>
            <p className="text-green-700">
              Congratulations! You have no active debts.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 mb-6">
      <div className="glassmorphism rounded-lg p-6 border-2 border-black bg-red-100/40 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {React.createElement(getIcon("TrendingDown"), {
              className: "h-6 w-6 text-red-700",
            })}
            <h3 className="text-lg font-black text-black">
              <span className="text-xl">D</span>EBT{" "}
              <span className="text-xl">T</span>RACKER
            </h3>
          </div>
          {projectedPayoffDate && (
            <span className="text-sm text-red-900 font-medium">
              Payoff: {projectedPayoffDate}
            </span>
          )}
        </div>

        {/* Overall Progress */}
        <div className="mb-6 p-4 bg-white/50 rounded-lg border border-red-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-red-900">
              Overall Progress
            </span>
            <span className="text-sm font-semibold text-black">
              {Math.round(overallProgress || 0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 border border-gray-300">
            <div
              className={`h-full rounded-full transition-all duration-300 ${getProgressColor(overallProgress)}`}
              style={{ width: `${Math.min(overallProgress || 0, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2 text-sm">
            <span className="text-red-800">
              Remaining: ${totalDebtRemaining?.toLocaleString() || "0.00"}
            </span>
            <span className="text-red-600">
              Original: ${totalOriginalDebt?.toLocaleString() || "0.00"}
            </span>
          </div>
        </div>

        {/* Individual Debts */}
        <div className="space-y-4 mb-6">
          {activeDebts.map((debt, index) => (
            <div key={debt.id || index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-red-900 truncate">
                  {debt.name || `Debt ${index + 1}`}
                </span>
                <span className="text-sm font-semibold text-black">
                  ${debt.remaining?.toLocaleString() || "0.00"}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 border border-gray-300">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${getProgressColor(debt.progressPercentage || 0)}`}
                  style={{
                    width: `${Math.min(debt.progressPercentage || 0, 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-red-700">
                <span>
                  {Math.round(debt.progressPercentage || 0)}% paid off
                </span>
                <span>
                  Min payment: ${debt.minPayment?.toLocaleString() || "0.00"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleViewDebtPage}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-black bg-white/60 hover:bg-red-200/60 transition-colors"
        >
          {React.createElement(getIcon("ArrowRight"), { className: "h-4 w-4" })}
          <span className="text-sm font-medium">Manage Debt</span>
        </button>
      </div>
    </div>
  );
};

export default DebtTrackerSection;
