import React from "react";
import {
  getTrendIcon,
  getTrendColor,
  getHealthColor,
  getHealthLabel,
} from "@/utils/features/analytics/trendHelpers";
import { formatCurrency, formatPercentage } from "@/utils/features/analytics/categoryHelpers";

export interface VelocityData {
  averageMonthlyExpenses: number;
  averageMonthlyIncome: number;
  trendDirection: "increasing" | "decreasing" | "stable";
  velocityChange: number;
  percentChange?: number;
  projectedNextMonth: number;
}

export interface TopCategory {
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

// Sub-components
const BudgetHealthScore: React.FC<{ healthScore: number }> = ({ healthScore }) => (
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
);

const SpendingVelocity: React.FC<{ velocity: VelocityData }> = ({ velocity }) => (
  <div className="bg-white rounded-lg border-2 border-black p-6 shadow-sm">
    <h3 className="font-black text-black text-lg mb-4">
      <span className="text-xl">S</span>PENDING <span className="text-xl">V</span>ELOCITY
    </h3>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="text-sm text-gray-600 mb-1">Average Monthly</div>
        <div className="text-2xl font-black text-black">
          {formatCurrency(velocity.averageMonthlyExpenses)}
        </div>
      </div>
      <div>
        <div className="text-sm text-gray-600 mb-1">Trend</div>
        <div className={`text-2xl font-black ${getTrendColor(velocity.trendDirection)}`}>
          <span role="img" aria-label={`${velocity.trendDirection} trend`}>
            {getTrendIcon(velocity.trendDirection)}
          </span>{" "}
          {velocity.trendDirection}
        </div>
      </div>
      {velocity.percentChange !== undefined && (
        <div>
          <div className="text-sm text-gray-600 mb-1">Change</div>
          <div className={`text-xl font-black ${getTrendColor(velocity.trendDirection)}`}>
            {velocity.percentChange > 0 ? "+" : ""}
            {formatPercentage(velocity.percentChange)}
          </div>
        </div>
      )}
      <div>
        <div className="text-sm text-gray-600 mb-1">Projected Next Month</div>
        <div className="text-xl font-black text-purple-600">
          {formatCurrency(velocity.projectedNextMonth)}
        </div>
      </div>
    </div>
  </div>
);

const TopSpendingCategories: React.FC<{ topCategories: TopCategory[] }> = ({ topCategories }) => (
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
                {formatPercentage(category.percentOfTotal)}
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
                {formatCurrency(category.expenses)}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {category.count} transactions · Avg {formatCurrency(category.avgTransactionSize)}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Enhanced Financial Insights Component
 * Displays spending velocity, top categories, and budget health score
 */
const FinancialInsights: React.FC<FinancialInsightsProps> = ({
  velocity,
  topCategories,
  healthScore,
}) => {
  return (
    <div className="space-y-6">
      <BudgetHealthScore healthScore={healthScore} />
      <SpendingVelocity velocity={velocity} />
      <TopSpendingCategories topCategories={topCategories} />
    </div>
  );
};

export default FinancialInsights;
