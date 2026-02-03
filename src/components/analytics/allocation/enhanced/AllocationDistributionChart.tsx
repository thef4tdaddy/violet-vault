/**
 * Allocation Distribution Chart Component
 * Created for Phase 2.4: Enhanced Chart Components (Tier 2)
 *
 * Donut chart showing allocation distribution by category or envelope
 * Lazy-loaded only for Tier 2 (private-backend)
 */

import React, { useState, useRef } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { DistributionDataPoint } from "@/types/analyticsEnhanced";
import { ChartExportButton } from "../shared/ChartExportButton";

export interface AllocationDistributionChartProps {
  data: DistributionDataPoint[];
  viewMode: "category" | "envelope";
  onViewModeChange: (mode: "category" | "envelope") => void;
  className?: string;
}

/**
 * Custom label for pie slices (hide small slices)
 */
const renderCustomLabel = (props: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;

  // Hide labels for slices < 5% or if required props are missing
  if (
    !percent ||
    percent < 0.05 ||
    cx === undefined ||
    cy === undefined ||
    midAngle === undefined ||
    innerRadius === undefined ||
    outerRadius === undefined
  ) {
    return null;
  }

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-xs font-bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

/**
 * Custom tooltip
 */
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: DistributionDataPoint;
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0]!.payload;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
      <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{data.name}</p>
      <p className="text-sm text-gray-700 dark:text-gray-300">
        Amount: ${(data.value / 100).toFixed(2)}
      </p>
      <p className="text-sm text-gray-700 dark:text-gray-300">
        Percentage: {data.percentage.toFixed(1)}%
      </p>
    </div>
  );
};

/**
 * AllocationDistributionChart Component
 *
 * Displays allocation distribution as an interactive donut chart
 *
 * @example
 * ```tsx
 * <AllocationDistributionChart
 *   data={distributionData}
 *   viewMode="category"
 *   onViewModeChange={(mode) => setViewMode(mode)}
 * />
 * ```
 */
export const AllocationDistributionChart: React.FC<AllocationDistributionChartProps> = ({
  data,
  viewMode,
  onViewModeChange,
  className = "",
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const handleClick = (_: unknown, index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div ref={chartRef} className={`bg-white dark:bg-gray-800 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Allocation Distribution</h3>
        <div className="flex gap-2">
          <ChartExportButton chartRef={chartRef} filename="allocation-distribution" />
        </div>
      </div>

      {/* View mode toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => onViewModeChange("category")}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${
              viewMode === "category"
                ? "bg-purple-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }
          `}
        >
          By Category
        </button>
        <button
          onClick={() => onViewModeChange("envelope")}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${
              viewMode === "envelope"
                ? "bg-purple-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }
          `}
        >
          By Envelope
        </button>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-96 text-gray-500 dark:text-gray-400">
          <p>No distribution data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              onClick={handleClick}
              label={renderCustomLabel}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.3}
                  stroke={activeIndex === index ? "#000" : "none"}
                  strokeWidth={activeIndex === index ? 2 : 0}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{
                paddingTop: "20px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}

      {/* Active slice details */}
      {activeIndex !== null && data[activeIndex] && (
        <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: data[activeIndex]!.color }}
            />
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 dark:text-white">{data[activeIndex]!.name}</h4>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-700 dark:text-gray-300">
                <span>${(data[activeIndex]!.value / 100).toFixed(2)}</span>
                <span>•</span>
                <span>{data[activeIndex]!.percentage.toFixed(1)}% of total</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary stats */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Categories</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{data.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Amount</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              ${(data.reduce((sum, item) => sum + item.value, 0) / 100).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllocationDistributionChart;
