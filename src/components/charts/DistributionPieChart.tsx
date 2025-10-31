import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type PieLabelRenderProps,
} from "recharts";
import ChartContainer from "./ChartContainer";
import { useChartConfig } from "../../hooks/common/useChartConfig";

// Default label formatter for pie chart
const defaultLabelFormatter = (props: PieLabelRenderProps): React.ReactNode => {
  const name = (props.name ?? "") as string;
  const percent = (props.percent ?? 0) as number;
  return `${name} ${(percent * 100).toFixed(0)}%`;
};

// Helper to calculate total from data
const calculateTotal = (chartData: Array<Record<string, unknown>>, dataKey: string): number => {
  return chartData
    .filter((item) => item != null)
    .reduce((sum, item) => sum + Number((item as Record<string, unknown>)[dataKey] ?? 0), 0);
};

// Helper to calculate percentage (returns number)
const calculatePercentage = (value: number, total: number): number => {
  return total > 0 ? (value / total) * 100 : 0;
};

// Helper to enhance data with percentages and colors
const enhanceChartData = (
  chartData: Array<Record<string, unknown>>,
  dataKey: string,
  total: number,
  chartColors: string[]
) => {
  return chartData
    .filter((item) => item != null)
    .map((item, index) => {
      const value = Number((item as Record<string, unknown>)[dataKey] ?? 0);
      const color =
        ((item as Record<string, unknown>).color as string | undefined) ||
        chartColors[index % chartColors.length];
      return {
        ...item,
        percentage: calculatePercentage(value, total),
        color,
      };
    });
};

// Helper to render pie cells
const renderPieCells = (data: Array<Record<string, unknown>>) => {
  return data
    .filter((entry) => entry != null)
    .map((entry, index) => {
      const colorValue = (entry as Record<string, unknown>).color ?? "";
      const color = typeof colorValue === "string" ? colorValue : String(colorValue ?? "");
      return <Cell key={`cell-${index}`} fill={color} />;
    });
};

/**
 * Reusable distribution pie chart component
 * Extracted from ChartsAndAnalytics.jsx for better reusability
 * Issue #151 - ChartsAndAnalytics refactoring
 */
const DistributionPieChart = ({
  title = "Distribution Analysis",
  subtitle,
  data = [],
  dataKey = "amount",
  nameKey = "name",
  height = 300,
  className = "",
  loading = false,
  error = null,
  emptyMessage = "No distribution data available",
  actions,
  showLegend = true,
  showLabels = true,
  innerRadius = 0,
  outerRadius = 100,
  formatTooltip,
  labelFormatter,
  maxItems = 8,
  ...props
}: {
  title?: string;
  subtitle?: React.ReactNode;
  data?: Array<Record<string, unknown>>;
  dataKey?: string;
  nameKey?: string;
  height?: number;
  className?: string;
  loading?: boolean;
  error?: unknown;
  emptyMessage?: string;
  actions?: React.ReactNode;
  showLegend?: boolean;
  showLabels?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  formatTooltip?: React.ComponentType<unknown> | ((props: unknown) => React.ReactNode);
  labelFormatter?: (props: PieLabelRenderProps) => React.ReactNode;
  maxItems?: number;
  [key: string]: unknown;
}) => {
  const { CustomTooltip, chartColors, chartTypeConfigs } = useChartConfig();

  // Use custom tooltip or default; treat as a generic React component type
  const TooltipComponent: React.ComponentType<unknown> =
    (formatTooltip as React.ComponentType<unknown>) ||
    (CustomTooltip as React.ComponentType<unknown>);

  // Ensure data is valid and limit items
  const chartData = Array.isArray(data) ? data.slice(0, maxItems) : [];
  const hasData = chartData.length > 0;

  const labelFunc =
    (labelFormatter as (props: PieLabelRenderProps) => React.ReactNode) || defaultLabelFormatter;

  // Calculate total for percentage display
  const total = calculateTotal(chartData, dataKey);

  // Enhanced data with percentage for custom rendering
  const enhancedData = enhanceChartData(chartData, dataKey, total, chartColors);

  return (
    <ChartContainer
      title={title}
      subtitle={subtitle}
      height={height}
      className={className}
      loading={loading}
      error={error}
      emptyMessage={emptyMessage}
      actions={actions || []}
      formatTooltip={TooltipComponent}
      dataTestId="distribution-pie-chart"
    >
      {hasData && (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={enhancedData}
              cx={chartTypeConfigs.pie.cx}
              cy={chartTypeConfigs.pie.cy}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              dataKey={dataKey}
              nameKey={nameKey}
              label={
                showLabels
                  ? (labelFunc as (props: PieLabelRenderProps) => React.ReactNode)
                  : undefined
              }
              labelLine={false}
              startAngle={chartTypeConfigs.pie.startAngle}
              endAngle={chartTypeConfigs.pie.endAngle}
              {...props}
            >
              {renderPieCells(enhancedData)}
            </Pie>
            <Tooltip content={<TooltipComponent />} />
            {showLegend && <Legend />}
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
};

// Enhanced pie chart with custom legend
export const DistributionPieChartWithDetails = ({
  title,
  subtitle,
  data = [],
  dataKey = "amount",
  nameKey = "name",
  className = "",
  maxItems = 6,
  ...chartProps
}) => {
  const { formatters } = useChartConfig();

  // Limit and prepare data
  const chartData = Array.isArray(data) ? data.slice(0, maxItems) : [];
  const total = chartData.reduce((sum, item) => sum + (item[dataKey] || 0), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <DistributionPieChart
        title={title}
        subtitle={subtitle}
        data={chartData}
        dataKey={dataKey}
        nameKey={nameKey}
        className={className}
        showLegend={false}
        outerRadius={120}
        {...chartProps}
      />

      {/* Details List */}
      <div className="glassmorphism rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Details</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {chartData.map((item, index) => {
            const percentage = total > 0 ? ((item[dataKey] || 0) / total) * 100 : 0;
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white/40 rounded-lg"
              >
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-3"
                    style={{
                      backgroundColor: item.color || "#8B5CF6",
                    }}
                  />
                  <div>
                    <div className="font-medium text-gray-900">{item[nameKey]}</div>
                    <div className="text-sm text-gray-600">{item.count || 0} transactions</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    {formatters.currency(item[dataKey])}
                  </div>
                  <div className="text-sm text-gray-600">{percentage.toFixed(1)}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DistributionPieChart;
