import React from "react";
import { getIcon } from "../../../utils";
import { useDebtManagement } from "../../../hooks/debts/useDebtManagement";
import _logger from "../../../utils/common/logger";

/**
 * Small debt summary widget for dashboard
 * Shows key debt metrics
 */
const DebtSummaryWidget = ({ onNavigateToDebts }) => {
  const { debtStats, _debts } = useDebtManagement();

  // Removed noisy debug log - component renders frequently

  // Don't show widget if no debts exist
  if (!debtStats || debtStats.totalDebtCount === 0) {
    return null;
  }

  return (
    <div className="glassmorphism rounded-2xl p-4 border border-white/20 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <div className="relative mr-3">
            <div className="absolute inset-0 bg-red-500 rounded-2xl blur-lg opacity-30"></div>
            <div className="relative bg-red-500 p-2 rounded-2xl">
              {React.createElement(getIcon("TrendingDown"), { className: "h-4 w-4 text-white" })}
            </div>
          </div>
          Debt Summary
        </h3>

        {onNavigateToDebts && (
          <button
            onClick={onNavigateToDebts}
            className="text-base text-blue-600 hover:text-blue-700 flex items-center font-medium"
          >
            View All
            {React.createElement(getIcon("ArrowRight"), { className: "h-4 w-4 ml-1" })}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-base font-medium text-gray-600 mb-1">Total Debt</p>
            <p className="text-2xl font-bold text-red-600">${debtStats.totalDebt.toFixed(2)}</p>
          </div>

          <div>
            <p className="text-base font-medium text-gray-600 mb-1">Monthly Payments</p>
            <p className="text-2xl font-bold text-orange-600">
              ${debtStats.totalMonthlyPayments.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Average Interest Rate */}
        {debtStats.averageInterestRate > 0 && (
          <div>
            <p className="text-base font-medium text-gray-600 mb-1">Avg Interest Rate</p>
            <p className="text-lg font-bold text-purple-600">
              {debtStats.averageInterestRate.toFixed(2)}% APR
            </p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="flex justify-between text-base font-medium text-gray-700 pt-2 border-t border-gray-200">
          <span>
            {debtStats.activeDebtCount} active debt
            {debtStats.activeDebtCount !== 1 ? "s" : ""}
          </span>
          {debtStats.totalInterestPaid > 0 && (
            <span>${debtStats.totalInterestPaid.toFixed(0)} interest paid</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebtSummaryWidget;
