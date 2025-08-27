import React, { useState, useMemo } from "react";
import {
  TrendingDown,
  DollarSign,
  Calendar,
  Target,
  Lightbulb,
  BarChart3,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { compareDebtStrategies, calculateExtraPaymentImpact } from "../../utils/debtStrategies";

/**
 * Debt Payment Strategies Component
 * Provides Avalanche, Snowball, and impact analysis tools
 */
const DebtStrategies = ({ debts }) => {
  const [extraPayment, setExtraPayment] = useState(100);
  const [selectedStrategy, setSelectedStrategy] = useState("avalanche");

  // Filter to active debts only
  const activeDebts = useMemo(
    () => debts.filter((debt) => debt.status === "active" && debt.currentBalance > 0),
    [debts]
  );

  // Calculate strategy comparison
  const strategyComparison = useMemo(
    () => compareDebtStrategies(activeDebts, extraPayment),
    [activeDebts, extraPayment]
  );

  // Calculate extra payment impact
  const paymentImpact = useMemo(
    () => calculateExtraPaymentImpact(activeDebts, selectedStrategy),
    [activeDebts, selectedStrategy]
  );

  if (activeDebts.length === 0) {
    return (
      <div className="glassmorphism rounded-2xl p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Active Debts!</h3>
        <p className="text-gray-600">
          Congratulations! You don't have any active debts to strategize about.
        </p>
      </div>
    );
  }

  const { avalanche, snowball } = strategyComparison.strategies;
  const { recommendation, comparison } = strategyComparison;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glassmorphism rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold">Debt Payoff Strategies</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Optimize your debt payments with proven strategies. Compare different approaches and see
          the impact of extra payments on your payoff timeline.
        </p>

        {/* Extra Payment Input */}
        <div className="flex items-center gap-4">
          <label htmlFor="extraPayment" className="text-sm font-medium text-gray-700">
            Extra Monthly Payment:
          </label>
          <div className="relative">
            <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="extraPayment"
              type="number"
              min="0"
              step="25"
              value={extraPayment}
              onChange={(e) => setExtraPayment(Number(e.target.value) || 0)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg w-32 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Strategy Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Debt Avalanche */}
        <div
          className={`glassmorphism rounded-2xl p-6 transition-all ${
            recommendation.bestForInterest === "avalanche"
              ? "ring-2 ring-blue-500 bg-blue-50/50"
              : ""
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingDown className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Debt Avalanche</h3>
                <p className="text-sm text-gray-600">Highest interest first</p>
              </div>
            </div>
            {recommendation.bestForInterest === "avalanche" && (
              <div className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                Best for Interest
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Payoff Time</span>
              <span className="font-medium">{avalanche.summary.timeToPayoff}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Interest</span>
              <span className="font-medium text-red-600">
                ${avalanche.totalInterest.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Payment</span>
              <span className="font-medium">
                ${avalanche.summary.totalPayment.toLocaleString()}
              </span>
            </div>

            {/* Payoff Order Preview */}
            <div className="pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Payoff Order:</p>
              <div className="space-y-1">
                {avalanche.payoffOrder.slice(0, 3).map((debt, index) => (
                  <div key={debt.debtId} className="flex items-center gap-2 text-sm">
                    <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{debt.debtName}</span>
                  </div>
                ))}
                {avalanche.payoffOrder.length > 3 && (
                  <p className="text-xs text-gray-500">
                    +{avalanche.payoffOrder.length - 3} more debts
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Debt Snowball */}
        <div
          className={`glassmorphism rounded-2xl p-6 transition-all ${
            recommendation.bestForMotivation === "snowball"
              ? "ring-2 ring-green-500 bg-green-50/50"
              : ""
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Debt Snowball</h3>
                <p className="text-sm text-gray-600">Smallest balance first</p>
              </div>
            </div>
            {recommendation.bestForMotivation === "snowball" && (
              <div className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                Best for Motivation
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Payoff Time</span>
              <span className="font-medium">{snowball.summary.timeToPayoff}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Interest</span>
              <span className="font-medium text-red-600">
                ${snowball.totalInterest.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Payment</span>
              <span className="font-medium">${snowball.summary.totalPayment.toLocaleString()}</span>
            </div>

            {/* Payoff Order Preview */}
            <div className="pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Payoff Order:</p>
              <div className="space-y-1">
                {snowball.payoffOrder.slice(0, 3).map((debt, index) => (
                  <div key={debt.debtId} className="flex items-center gap-2 text-sm">
                    <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{debt.debtName}</span>
                  </div>
                ))}
                {snowball.payoffOrder.length > 3 && (
                  <p className="text-xs text-gray-500">
                    +{snowball.payoffOrder.length - 3} more debts
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Comparison Summary */}
      <div className="glassmorphism rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold">Strategy Insights</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-600">Interest Savings</p>
            <p className="text-lg font-semibold text-green-600">
              ${Math.max(0, comparison.savingsWithAvalanche).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">with Avalanche</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Time Difference</p>
            <p className="text-lg font-semibold text-blue-600">
              {comparison.timeDifference} months
            </p>
            <p className="text-xs text-gray-500">between strategies</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Quick Wins</p>
            <p className="text-lg font-semibold text-purple-600">
              {snowball.payoffOrder.filter((d) => d.monthPaidOff <= 12).length}
            </p>
            <p className="text-xs text-gray-500">debts paid in 1 year (snowball)</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Recommendation:</strong>{" "}
            {comparison.savingsWithAvalanche > 1000
              ? "Use the Avalanche method to save significantly on interest payments."
              : comparison.timeDifference <= 6
                ? "Both strategies are similar - choose Snowball for motivation or Avalanche for savings."
                : "Consider the Snowball method for psychological motivation with quicker wins."}
          </p>
        </div>
      </div>

      {/* Extra Payment Impact Analysis */}
      <div className="glassmorphism rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold">Extra Payment Impact</h3>
          <select
            value={selectedStrategy}
            onChange={(e) => setSelectedStrategy(e.target.value)}
            className="ml-auto px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="avalanche">Avalanche Strategy</option>
            <option value="snowball">Snowball Strategy</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Extra Payment</th>
                <th className="text-left p-3">Payoff Time</th>
                <th className="text-left p-3">Total Interest</th>
                <th className="text-left p-3">Interest Saved</th>
              </tr>
            </thead>
            <tbody>
              {paymentImpact.map((impact, index) => (
                <tr key={impact.extraPayment} className={index === 0 ? "bg-gray-50" : ""}>
                  <td className="p-3 font-medium">${impact.extraPayment}/month</td>
                  <td className="p-3">{impact.timeToPayoff}</td>
                  <td className="p-3 text-red-600">${impact.totalInterest.toLocaleString()}</td>
                  <td className="p-3">
                    {index === 0 ? (
                      <span className="text-gray-500">Baseline</span>
                    ) : (
                      <span className="text-green-600 font-medium">
                        ${Math.abs(impact.monthlySavings).toLocaleString()}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Impact:</strong> An extra ${extraPayment}/month could save you{" "}
            <strong>
              $
              {Math.abs(
                paymentImpact.find((p) => p.extraPayment === extraPayment)?.monthlySavings || 0
              ).toLocaleString()}
            </strong>{" "}
            in interest payments and help you become debt-free faster.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DebtStrategies;
