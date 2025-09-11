import React from "react";
import { getIcon } from "../../utils";
import { logger } from "../../utils/common/logger";

/**
 * Balance Summary Row - Top section of redesigned dashboard
 *
 * Features:
 * - Actual Balance card
 * - Virtual Balance card
 * - Unassigned Cash card
 * - Difference card with color coding
 * - Reconcile action button
 */
const BalanceSummaryRow = ({ layoutData }) => {
  const { actualBalance, unassignedCash, envelopeSummary } = layoutData;

  // Calculate virtual balance and difference
  const virtualBalance =
    (envelopeSummary?.totalBalance || 0) + (unassignedCash || 0);
  const difference = (actualBalance || 0) - virtualBalance;

  const handleReconcile = () => {
    logger.userAction("Reconcile button clicked", {
      component: "BalanceSummaryRow",
      difference: difference,
      actualBalance: actualBalance,
      virtualBalance: virtualBalance,
    });
    // TODO: Implement reconcile functionality
  };

  const getDifferenceColor = (diff) => {
    if (diff > 0) return "text-green-700 bg-green-50 border-green-200";
    if (diff < 0) return "text-red-700 bg-red-50 border-red-200";
    return "text-gray-700 bg-gray-50 border-gray-200";
  };

  const getDifferencePrefix = (diff) => {
    if (diff > 0) return "+";
    return "";
  };

  return (
    <div className="px-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Actual Balance Card */}
        <div className="glassmorphism rounded-lg p-4 border-2 border-black bg-blue-100/40">
          <div className="text-sm font-medium text-blue-900 mb-1">
            ACTUAL BALANCE
          </div>
          <div className="text-2xl font-black text-black">
            ${actualBalance?.toLocaleString() || "0.00"}
          </div>
        </div>

        {/* Virtual Balance Card */}
        <div className="glassmorphism rounded-lg p-4 border-2 border-black bg-purple-100/40">
          <div className="text-sm font-medium text-purple-900 mb-1">
            VIRTUAL BALANCE
          </div>
          <div className="text-2xl font-black text-black">
            ${virtualBalance?.toLocaleString() || "0.00"}
          </div>
        </div>

        {/* Unassigned Cash Card */}
        <div className="glassmorphism rounded-lg p-4 border-2 border-black bg-orange-100/40">
          <div className="text-sm font-medium text-orange-900 mb-1">
            UNASSIGNED CASH
          </div>
          <div className="text-2xl font-black text-black">
            ${unassignedCash?.toLocaleString() || "0.00"}
          </div>
        </div>

        {/* Difference Card */}
        <div
          className={`glassmorphism rounded-lg p-4 border-2 border-black ${getDifferenceColor(difference)}`}
        >
          <div className="text-sm font-medium mb-1">DIFFERENCE</div>
          <div className="text-2xl font-black">
            {getDifferencePrefix(difference)}$
            {Math.abs(difference || 0).toLocaleString()}
          </div>
        </div>

        {/* Reconcile Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={handleReconcile}
            className="glassmorphism rounded-lg p-4 border-2 border-black bg-green-100/40 hover:bg-green-200/60 transition-colors w-full h-full min-h-[80px]"
            disabled={difference === 0}
          >
            <div className="flex flex-col items-center justify-center gap-2">
              {React.createElement(getIcon("RefreshCw"), {
                className: "h-6 w-6 text-green-700",
              })}
              <span className="text-sm font-medium text-green-900">
                Reconcile
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BalanceSummaryRow;
