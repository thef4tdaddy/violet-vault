import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import ChartContainer from "./ChartContainer";
import { useChartConfig } from "../../hooks/common/useChartConfig";

/**
 * Reusable category bar chart component
 * Extracted from ChartsAndAnalytics.jsx for better reusability
 * Issue #151 - ChartsAndAnalytics refactoring
 */
const CategoryBarChart = ({
  title = "Category Analysis",
  subtitle,
  data = [],
  bars = [],
  height = 300,
  className = "",
  loading = false,
  error = null,
  emptyMessage = "No category data available",
  actions,
  showGrid = true,
  showLegend = true,
  orientation = "vertical", // "vertical" or "horizontal"
  formatTooltip,
  maxBarSize = 60,
  ...props
}) => {
  const { CustomTooltip, chartDefaults, chartTypeConfigs, getColorByCategory } =
    useChartConfig();

  // Use custom tooltip or default
  const TooltipComponent = formatTooltip || CustomTooltip;

  // Ensure data is valid
  const chartData = Array.isArray(data) ? data : [];
  const hasData = chartData.length > 0;

  // Default bars configuration if not provided
  const defaultBars = [
    { dataKey: "income", name: "Income", fill: "#10b981" },
    { dataKey: "expenses", name: "Expenses", fill: "#ef4444" },
  ];

  const barConfig = bars.length > 0 ? bars : defaultBars;

  // Configure chart orientation
  const isHorizontal = orientation === "horizontal";
  const AxisConfig = isHorizontal
    ? {
        XAxis: { type: "number", stroke: chartDefaults.axis.stroke },
        YAxis: {
          dataKey: "name",
          type: "category",
          stroke: chartDefaults.axis.stroke,
          width: 100,
        },
      }
    : {
        XAxis: { dataKey: "name", stroke: chartDefaults.axis.stroke },
        YAxis: { stroke: chartDefaults.axis.stroke },
      };

  return (
    <ChartContainer
      title={title}
      subtitle={subtitle}
      height={height}
      className={className}
      loading={loading}
      error={error}
      emptyMessage={emptyMessage}
      actions={actions}
      dataTestId="category-bar-chart"
    >
      {hasData && (
        <BarChart
          data={chartData}
          layout={isHorizontal ? "horizontal" : "vertical"}
          {...props}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray={chartDefaults.cartesianGrid.strokeDasharray}
              stroke={chartDefaults.cartesianGrid.stroke}
            />
          )}

          <XAxis
            {...AxisConfig.XAxis}
            fontSize={12}
            tickFormatter={
              isHorizontal
                ? (value) => `$${(value / 1000).toFixed(0)}K`
                : undefined
            }
          />
          <YAxis
            {...AxisConfig.YAxis}
            fontSize={12}
            tickFormatter={
              !isHorizontal
                ? (value) => `$${(value / 1000).toFixed(0)}K`
                : undefined
            }
          />

          <Tooltip content={<TooltipComponent />} />
          {showLegend && <Legend />}

          {barConfig.map((barProps, index) => (
            <Bar
              key={barProps.dataKey}
              radius={chartTypeConfigs.bar.radius}
              maxBarSize={maxBarSize}
              fill={
                barProps.fill || getColorByCategory(barProps.dataKey, index)
              }
              {...barProps}
            />
          ))}
        </BarChart>
      )}
    </ChartContainer>
  );
};

export default CategoryBarChart;
