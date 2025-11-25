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
const DebtStrategies = ({ debts }: DebtStrategiesProps) => {
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
          Compare proven debt payoff strategies to find the best approach for your situation.
        </p>
      </div>

      {/* Strategy Cards */}
      <div className="grid md:grid-cols-2 gap-6">
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
      {recommendation && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            {React.createElement(getIcon("Lightbulb"), {
              className: "w-5 h-5 text-yellow-500",
            })}
            <h3 className="font-semibold text-gray-900">Our Recommendation</h3>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-blue-800">{recommendationText}</p>
          </div>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="space-y-3">
          {insights.map((insight, index) => {
            const iconName = insight.type === "warning" ? "AlertCircle" : "Info";
            const colorClass =
              insight.type === "warning"
                ? "border-orange-200 bg-orange-50"
                : "border-blue-200 bg-blue-50";
            const textClass = insight.type === "warning" ? "text-orange-800" : "text-blue-800";
            const iconClass = insight.type === "warning" ? "text-orange-600" : "text-blue-600";

            return (
              <div key={index} className={`rounded-xl p-4 border ${colorClass}`}>
                <div className="flex items-start gap-3">
                  {React.createElement(getIcon(iconName), {
                    className: `w-5 h-5 ${iconClass} flex-shrink-0 mt-0.5`,
                  })}
                  <div>
                    <h4 className={`font-medium ${textClass}`}>{insight.title}</h4>
                    <p className={`text-sm ${textClass} mt-1`}>{insight.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Impact Analysis */}
      <PaymentImpactTable
        paymentImpact={
          paymentImpact as unknown as import("./ui/PaymentImpactTable").PaymentImpactScenario[]
        }
      />
    </div>
  );
};

export default DebtStrategies;
