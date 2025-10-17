import React from "react";
import { TrendLineChart, CategoryBarChart } from "../../charts";

/**
 * Trends tab content for analytics
 * Extracted from ChartsAndAnalytics.jsx to reduce complexity
 */
const TrendsTab = ({ chartType, handleChartTypeChange, monthlyTrends, weeklyPatterns }) => {
  return (
    <div className="space-y-6">
      {/* Spending Trends Chart */}
      <div className="glassmorphism rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Spending Trends</h3>
          <div className="flex gap-2">
            {["line", "bar", "area"].map((type) => (
              <Button
                key={type}
                onClick={() => handleChartTypeChange(type)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  chartType === type
                    ? "bg-cyan-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <TrendLineChart
          subtitle=""
          data={(monthlyTrends || []).filter(Boolean)}
          height={400}
          type={chartType}
          actions={null}
          formatTooltip={undefined}
        />
      </div>

      {/* Weekly Patterns */}
      {weeklyPatterns && weeklyPatterns.length > 0 && (
        <div className="glassmorphism rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Spending Patterns</h3>
          <CategoryBarChart
            subtitle=""
            data={weeklyPatterns.filter(Boolean)}
            height={300}
            dataKey="amount"
            xDataKey="day"
            actions={null}
            formatTooltip={undefined}
          />
        </div>
      )}
    </div>
  );
};

export default TrendsTab;
