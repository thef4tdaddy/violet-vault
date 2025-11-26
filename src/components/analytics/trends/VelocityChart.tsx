import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { velocityTooltipFormatter, CHART_COLORS } from "../../../utils/analytics/trendHelpers";
import { getIcon } from "../../../utils";
import type { SpendingVelocity } from "@/types/analytics";

interface VelocityChartProps {
  spendingVelocity?: SpendingVelocity[];
}

const VelocityChart = ({ spendingVelocity = [] }: VelocityChartProps) => {
  const hasData = spendingVelocity && spendingVelocity.length > 0;

  return (
    <div className="rounded-xl p-6 border-2 border-black bg-white/90 backdrop-blur-sm shadow-xl">
      <h3 className="font-black text-black text-base mb-4">
        <span className="text-lg">S</span>PENDING <span className="text-lg">V</span>ELOCITY{" "}
        <span className="text-lg">A</span>NALYSIS
      </h3>
      <div className="h-64">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spendingVelocity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={velocityTooltipFormatter} />
              <Area
                type="monotone"
                dataKey="percentChange"
                fill={CHART_COLORS.VELOCITY}
                fillOpacity={0.6}
                stroke={CHART_COLORS.VELOCITY}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            {React.createElement(getIcon("TrendingUp"), {
              className: "h-12 w-12 mb-4 opacity-50",
            })}
            <p className="text-lg font-medium">No Velocity Data</p>
            <p className="text-sm">Need at least 2 months of data to calculate velocity</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VelocityChart;
