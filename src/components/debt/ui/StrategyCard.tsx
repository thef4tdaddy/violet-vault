import React from "react";
import { getIcon } from "../../../utils";

interface StrategyDebt {
  id: string;
  name: string;
  currentBalance: number;
  minimumPayment: number;
  interestRate?: number;
  priority: number;
  monthsToPayoff: number;
  totalInterestCost: number;
  strategy: string;
  [key: string]: unknown;
}

interface Strategy {
  debts: StrategyDebt[];
  totalInterest: number;
  payoffTime: number;
  name: string;
  description: string;
}

interface StrategyCardProps {
  strategy: Strategy;
  isRecommended?: boolean;
}

/**
 * Card component for displaying debt payoff strategy details
 * Pure UI component - receives strategy data as props
 */
const StrategyCard: React.FC<StrategyCardProps> = ({ strategy, isRecommended = false }) => {
  if (!strategy || !strategy.debts.length) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <p className="text-gray-500 text-center">No active debts to analyze</p>
      </div>
    );
  }

  const { name, description, debts, totalInterest, payoffTime } = strategy;

  return (
    <div
      className={`bg-white rounded-xl p-6 border-2 transition-all ${
        isRecommended
          ? "border-green-500 ring-2 ring-green-500/20 shadow-lg"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            {name}
            {isRecommended && (
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                Recommended
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>

      {/* Strategy Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-red-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-600 font-medium">Total Interest</p>
              <p className="text-lg font-bold text-red-700">${totalInterest.toFixed(2)}</p>
            </div>
            {React.createElement(getIcon("DollarSign"), {
              className: "h-5 w-5 text-red-500",
            })}
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-medium">Payoff Time</p>
              <p className="text-lg font-bold text-blue-700">{payoffTime} months</p>
            </div>
            {React.createElement(getIcon("Clock"), {
              className: "h-5 w-5 text-blue-500",
            })}
          </div>
        </div>
      </div>

      {/* Debt Priority Order */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          {React.createElement(getIcon("TrendingDown"), {
            className: "h-4 w-4 mr-1",
          })}
          Priority Order
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {debts.slice(0, 5).map((debt) => (
            <div
              key={debt.id}
              className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
            >
              <div className="flex items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3 ${
                    debt.priority === 1
                      ? "bg-red-500"
                      : debt.priority === 2
                        ? "bg-orange-500"
                        : debt.priority === 3
                          ? "bg-yellow-500"
                          : "bg-gray-500"
                  }`}
                >
                  {debt.priority}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{debt.name}</p>
                  <p className="text-xs text-gray-600">
                    {debt.interestRate}% • ${debt.currentBalance?.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  ${debt.minimumPayment?.toFixed(2)}
                </p>
                <p className="text-xs text-gray-600">per month</p>
              </div>
            </div>
          ))}
          {debts.length > 5 && (
            <p className="text-xs text-gray-500 text-center mt-2">+{debts.length - 5} more debts</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StrategyCard;
