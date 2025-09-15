import React from "react";
import {
  ComposedChart,
  Bar,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getIcon } from "../../../utils";
import {
  formatCurrency,
  CHART_COLORS,
} from "../../../utils/analytics/trendHelpers";

const HistoricalTrendsChart = ({ spendingTrends }) => {
  const tooltipFormatter = (value, name) => [formatCurrency(value), name];

  return (
    <div className="rounded-xl p-6 border-2 border-black bg-white/90 backdrop-blur-sm shadow-xl">
      <h3 className="font-black text-black text-base mb-4">
        <span className="text-lg">12-M</span>ONTH{" "}
        <span className="text-lg">F</span>INANCIAL{" "}
        <span className="text-lg">T</span>RENDS
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={spendingTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={tooltipFormatter}
              labelFormatter={(month) => `Month: ${month}`}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="income"
              fill={CHART_COLORS.INCOME}
              fillOpacity={0.3}
              stroke={CHART_COLORS.INCOME}
              name="Income"
            />
            <Bar
              dataKey="spending"
              fill={CHART_COLORS.SPENDING}
              name="Spending"
            />
            <Line
              type="monotone"
              dataKey="net"
              stroke={CHART_COLORS.NET}
              strokeWidth={3}
              strokeDasharray={(entry) => (entry?.forecast ? "5 5" : "none")}
              name="Net Amount"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex items-center gap-4 text-sm text-purple-900">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 bg-gray-400 rounded border border-black"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 2px, white 2px, white 4px)",
            }}
          ></div>
          <span>Forecasted Data</span>
        </div>
        {React.createElement(getIcon("Info"), {
          className: "h-4 w-4",
        })}
        <span>Last 3 months are projected based on historical trends</span>
      </div>
    </div>
  );
};

export default HistoricalTrendsChart;
