import React from "react";
import { getIcon } from "../../utils";
import { useDebtStrategies } from "../../hooks/debts/useDebtStrategies";
import StrategyCard from "./ui/StrategyCard";
import PaymentImpactTable from "./ui/PaymentImpactTable";
import type { DebtAccount } from "../../types/debt";

interface DebtStrategiesProps {
  debts: DebtAccount[];
}

/**
 * Debt Payment Strategies Component
 * Pure UI component - all business logic handled by useDebtStrategies hook
 */
const DebtStrategies: React.FC<DebtStrategiesProps> = ({ debts }) => {
  const {
    avalancheStrategy,
    snowballStrategy,
    recommendation,
    paymentImpact,
    insights,
    recommendationText,
    hasDebts,
  } = useDebtStrategies(debts);

  if (!hasDebts) {
    return (
      <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
        {React.createElement(getIcon("CheckCircle"), {
          className: "w-12 h-12 text-green-500 mx-auto mb-3",
        })}
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Active Debts!</h3>
        <p className="text-gray-600">
          Congratulations! You don't have any active debts to strategize about.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          {React.createElement(getIcon("Target"), {
            className: "w-6 h-6 text-purple-600",
          })}
          <h2 className="text-xl font-semibold text-gray-900">Debt Payoff Strategies</h2>
        </div>
        <p className="text-gray-600">
          Compare different debt payoff strategies to find the best approach for your situation.
          Each strategy has different benefits depending on your goals and motivation style.
        </p>
      </div>

      {/* Strategy Comparison */}
      <div className="grid gap-6 lg:grid-cols-2">
        <StrategyCard
          strategy={avalancheStrategy}
          isRecommended={recommendation?.strategy === "avalanche"}
        />

        <StrategyCard
          strategy={snowballStrategy}
          isRecommended={recommendation?.strategy === "snowball"}
        />
      </div>

      {/* Recommendation */}
      {recommendationText && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-start gap-3">
            {React.createElement(getIcon("Lightbulb"), {
              className: "w-6 h-6 text-purple-600 mt-1 flex-shrink-0",
            })}
            <div>
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                Strategy Recommendation
              </h3>
              <p className="text-purple-800">{recommendationText}</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Impact Analysis */}
      {paymentImpact && paymentImpact.length > 0 && (
        <PaymentImpactTable paymentImpact={paymentImpact} />
      )}

      {/* Key Insights */}
      {insights && insights.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            {React.createElement(getIcon("BarChart3"), {
              className: "w-5 h-5 text-indigo-600",
            })}
            Key Insights
          </h3>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                {React.createElement(getIcon("Info"), {
                  className: "w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0",
                })}
                <div>
                  <p className="text-gray-900 text-sm font-medium">{insight.title}</p>
                  <p className="text-gray-700 text-sm">{insight.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtStrategies;
