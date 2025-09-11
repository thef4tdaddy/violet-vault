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

const VelocityChart = ({ spendingVelocity }) => {
  return (
    <div className="rounded-xl p-6 border-2 border-black bg-white/90 backdrop-blur-sm shadow-xl">
      <h3 className="font-black text-black text-base mb-4">
        <span className="text-lg">S</span>PENDING <span className="text-lg">V</span>ELOCITY{" "}
        <span className="text-lg">A</span>NALYSIS
      </h3>
      <div className="h-64">
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
      </div>
    </div>
  );
};

export default VelocityChart;
