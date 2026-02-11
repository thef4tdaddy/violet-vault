import React, { type ReactNode } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  type XAxisProps,
} from "recharts";
import ChartContainer from "./ChartContainer";
import { useChartConfig } from "../../hooks/platform/ux/useChartConfig";

/**
 * Reusable category bar chart component
 * Extracted from ChartsAndAnalytics.jsx for better reusability
 * Issue #151 - ChartsAndAnalytics refactoring
 */
const getAxisConfig = (
  isHorizontal: boolean,
  chartDefaults: Record<string, unknown>,
  categoryKey: string
) => {
  const axisStroke = (chartDefaults.axis as Record<string, unknown>)?.stroke as string;

  if (isHorizontal) {
    const xType = "number" as XAxisProps["type"];
    const yType = "category" as XAxisProps["type"];
    return {
      XAxis: { type: xType, stroke: axisStroke },
      YAxis: {
        dataKey: categoryKey,
        type: yType,
        stroke: axisStroke,
        width: 140,
      },
    };
  }
  return {
    XAxis: { dataKey: categoryKey, stroke: axisStroke },
    YAxis: { stroke: axisStroke },
  };
};

// Default bars configuration
const DEFAULT_BARS = [
  { dataKey: "income", name: "Income", fill: "#10b981" },
  { dataKey: "expenses", name: "Expenses", fill: "#ef4444" },
];

interface CategoryBarChartProps {
  title?: string;
  subtitle?: ReactNode;
  data?: Array<Record<string, unknown>>;
  bars?: Array<Record<string, unknown>>;
  height?: number;
  className?: string;
  loading?: boolean;
  error?: unknown;
  emptyMessage?: string;
  actions?: ReactNode;
  showGrid?: boolean;
  showLegend?: boolean;
  orientation?: "vertical" | "horizontal";
  formatTooltip?: React.ComponentType<unknown> | ((props: unknown) => ReactNode);
  maxBarSize?: number;
  categoryKey?: string;
  valueFormatter?: (value: number) => string;
  [key: string]: unknown;
}

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
  orientation = "vertical",
  formatTooltip,
  maxBarSize = 60,
  categoryKey = "name",
  valueFormatter,
  ...props
}: CategoryBarChartProps) => {
  const { CustomTooltip, chartDefaults, chartTypeConfigs, getColorByCategory, formatters } =
    useChartConfig();

  // Use custom tooltip or default
  const TooltipComponent = (formatTooltip || CustomTooltip) as React.ComponentType<unknown>;
  const tooltipRenderer = (tooltipProps: unknown) =>
    React.createElement(TooltipComponent, tooltipProps as Record<string, unknown>);

  // Ensure data is valid
  const chartData = Array.isArray(data) ? data : [];
  const hasData = chartData.length > 0;

  const barConfig = bars.length > 0 ? bars : DEFAULT_BARS;

  // Configure chart orientation
  const isHorizontal = orientation === "horizontal";
  const AxisConfig = getAxisConfig(isHorizontal, chartDefaults, categoryKey);
  const formatValue =
    valueFormatter ||
    ((raw: number) => {
      const numeric = Number(raw ?? 0);
      return formatters.shortCurrency(numeric);
    });

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
        <BarChart data={chartData} layout={isHorizontal ? "horizontal" : "vertical"} {...props}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray={chartDefaults.cartesianGrid.strokeDasharray}
              stroke={chartDefaults.cartesianGrid.stroke}
            />
          )}

          <XAxis
            {...AxisConfig.XAxis}
            fontSize={12}
            tickFormatter={isHorizontal ? (value: number) => formatValue(value) : undefined}
          />
          <YAxis
            {...AxisConfig.YAxis}
            fontSize={12}
            tickFormatter={!isHorizontal ? (value: number) => formatValue(value) : undefined}
          />

          <Tooltip content={tooltipRenderer} />
          {showLegend && <Legend />}

          {barConfig.map((barProps, index) => {
            const { fill: barFill, dataKey, ...restBarProps } = barProps;
            const fillColor = (barFill as string) || getColorByCategory(String(dataKey), index);
            return (
              <Bar
                key={String(dataKey)}
                dataKey={String(dataKey)}
                radius={chartTypeConfigs.bar.radius}
                maxBarSize={maxBarSize}
                fill={fillColor}
                {...restBarProps}
              />
            );
          })}
        </BarChart>
      )}
    </ChartContainer>
  );
};

export default CategoryBarChart;
