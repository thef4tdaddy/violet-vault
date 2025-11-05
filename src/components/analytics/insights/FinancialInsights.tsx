import React from "react";

interface VelocityData {
  averageMonthlyExpenses: number;
  averageMonthlyIncome: number;
  trendDirection: "increasing" | "decreasing" | "stable";
  velocityChange: number;
  percentChange?: number;
  projectedNextMonth: number;
}

interface TopCategory {
  name: string;
  expenses: number;
  count: number;
  percentOfTotal: number;
  avgTransactionSize: number;
}

interface FinancialInsightsProps {
  velocity: VelocityData;
  topCategories: TopCategory[];
  healthScore: number;
}

/**
 * Enhanced Financial Insights Component
 * Displays spending velocity, top categories, and budget health score
 */
const FinancialInsights: React.FC<FinancialInsightsProps> = ({
  velocity,
  topCategories,
  healthScore,
}) => {
  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case "increasing":
        return (
          <span role="img" aria-label="increasing trend">
            📈
          </span>
        );
      case "decreasing":
        return (
          <span role="img" aria-label="decreasing trend">
            📉
          </span>
        );
      default:
        return (
          <span role="img" aria-label="stable trend">
            ➡️
          </span>
        );
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case "increasing":
        return "text-red-600";
      case "decreasing":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getHealthLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Attention";
  };

  return (
    <div className="space-y-6">
      {/* Budget Health Score */}
      <div className="bg-white rounded-lg border-2 border-black p-6 shadow-sm">
        <h3 className="font-black text-black text-lg mb-4">
          <span className="text-xl">B</span>UDGET <span className="text-xl">H</span>EALTH{" "}
          <span className="text-xl">S</span>CORE
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden border-2 border-black">
              <div
                className={`absolute top-0 left-0 h-full ${getHealthColor(healthScore)} transition-all duration-500`}
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-black">{Math.round(healthScore)}</div>
            <div className="text-sm text-gray-600">{getHealthLabel(healthScore)}</div>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          Based on savings rate, envelope utilization, and spending patterns
        </p>
      </div>

      {/* Spending Velocity */}
      <div className="bg-white rounded-lg border-2 border-black p-6 shadow-sm">
        <h3 className="font-black text-black text-lg mb-4">
          <span className="text-xl">S</span>PENDING <span className="text-xl">V</span>ELOCITY
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Average Monthly</div>
            <div className="text-2xl font-black text-black">
              ${velocity.averageMonthlyExpenses.toFixed(0)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Trend</div>
            <div className={`text-2xl font-black ${getTrendColor(velocity.trendDirection)}`}>
              {getTrendIcon(velocity.trendDirection)} {velocity.trendDirection}
            </div>
          </div>
          {velocity.percentChange !== undefined && (
            <div>
              <div className="text-sm text-gray-600 mb-1">Change</div>
              <div className={`text-xl font-black ${getTrendColor(velocity.trendDirection)}`}>
                {velocity.percentChange > 0 ? "+" : ""}
                {velocity.percentChange.toFixed(1)}%
              </div>
            </div>
          )}
          <div>
            <div className="text-sm text-gray-600 mb-1">Projected Next Month</div>
            <div className="text-xl font-black text-purple-600">
              ${velocity.projectedNextMonth.toFixed(0)}
            </div>
          </div>
        </div>
      </div>

      {/* Top Spending Categories */}
      <div className="bg-white rounded-lg border-2 border-black p-6 shadow-sm">
        <h3 className="font-black text-black text-lg mb-4">
          <span className="text-xl">T</span>OP <span className="text-xl">S</span>PENDING{" "}
          <span className="text-xl">C</span>ATEGORIES
        </h3>
        <div className="space-y-3">
          {topCategories.map((category, index) => (
            <div key={category.name} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-black border-2 border-black">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-black">{category.name}</span>
                  <span className="text-sm text-gray-600">
                    {category.percentOfTotal.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden border border-black">
                    <div
                      className="h-full bg-purple-500"
                      style={{ width: `${category.percentOfTotal}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-black">
                    ${category.expenses.toFixed(0)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {category.count} transactions · Avg ${category.avgTransactionSize.toFixed(0)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinancialInsights;
