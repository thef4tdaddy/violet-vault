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
import { Button } from "@/components/ui";
import ChartContainer from "./ChartContainer";
import { useChartConfig } from "../../hooks/platform/ux/useChartConfig";

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
const renderPieCells = (
  data: Array<Record<string, unknown>>,
  activeName: string | null | undefined,
  nameKey: string
) => {
  return data
    .filter((entry) => entry != null)
    .map((entry, index) => {
      const colorValue = (entry as Record<string, unknown>).color ?? "";
      const color = typeof colorValue === "string" ? colorValue : String(colorValue ?? "");
      const itemName = String((entry as Record<string, unknown>)[nameKey] ?? "");
      const isActive = activeName && itemName === activeName;
      return (
        <Cell
          key={`cell-${index}`}
          fill={color}
          stroke={isActive ? "#111827" : color}
          strokeWidth={isActive ? 3 : 1}
        />
      );
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
  activeName,
  onSliceClick,
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
  activeName?: string | null;
  onSliceClick?: (entry: Record<string, unknown>) => void;
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
              onClick={(_, index) => {
                if (onSliceClick) {
                  const entry = enhancedData[index];
                  if (entry) {
                    onSliceClick(entry as Record<string, unknown>);
                  }
                }
              }}
              {...props}
            >
              {renderPieCells(enhancedData, activeName, nameKey)}
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
  selectedName,
  onSelect,
  detailContent,
  ...chartProps
}: {
  title?: string;
  subtitle?: React.ReactNode;
  data?: Array<Record<string, unknown>>;
  dataKey?: string;
  nameKey?: string;
  className?: string;
  maxItems?: number;
  selectedName?: string | null;
  onSelect?: (name: string | null, entry?: Record<string, unknown>) => void;
  detailContent?: React.ReactNode;
  [key: string]: unknown;
}) => {
  const { formatters, chartColors } = useChartConfig();

  // Limit and prepare data
  const chartData = Array.isArray(data) ? data.slice(0, maxItems) : [];
  const total = chartData.reduce((sum, item) => sum + Number(item[dataKey] ?? 0), 0);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-8 items-start">
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
        activeName={selectedName || undefined}
        onSliceClick={(entry) => {
          const entryName = String(entry[nameKey] ?? "");
          onSelect?.(selectedName === entryName ? null : entryName, entry);
        }}
        {...chartProps}
      />

      {/* Details List */}
      <div className="glassmorphism rounded-xl p-6 space-y-3 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Category Details</h3>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500">Total: {formatters.currency(total)}</span>
            {selectedName && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelect?.(null)}
                className="px-2 py-1 text-cyan-600 hover:text-cyan-800"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
        <div className="space-y-3 max-h-[26rem] overflow-y-auto pr-1">
          {chartData.map((item, index) => {
            const rawAmount = Number(item[dataKey] ?? 0);
            const percentage = total > 0 ? (rawAmount / total) * 100 : 0;
            const itemName = String(item[nameKey] || "");
            const isActive = selectedName === itemName;
            const transactionCount = Number(item.count || 0);
            const fallbackColor = chartColors[index % chartColors.length] ?? "#8B5CF6";
            const resolvedColor = (item as Record<string, unknown>).color;
            const bulletColor =
              typeof resolvedColor === "string" && resolvedColor.trim() !== ""
                ? resolvedColor
                : fallbackColor;
            return (
              <div
                key={index}
                role="button"
                tabIndex={0}
                onClick={() => onSelect?.(isActive ? null : itemName, item)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect?.(isActive ? null : itemName, item);
                  }
                }}
                className={`flex items-center justify-between p-3 bg-white/40 rounded-lg transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500 gap-4 ${
                  isActive ? "shadow-lg border-2 border-black" : ""
                }`}
              >
                <div className="flex items-center min-w-0">
                  <div
                    className="w-4 h-4 rounded-full mr-3"
                    style={{
                      backgroundColor: bulletColor,
                    }}
                  />
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 break-words">{itemName}</div>
                    <div className="text-sm text-gray-600">
                      {transactionCount} {transactionCount === 1 ? "transaction" : "transactions"}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-gray-900 whitespace-nowrap">
                    {formatters.currency(rawAmount)}
                  </div>
                  <div className="text-sm text-gray-600">{percentage.toFixed(1)}%</div>
                </div>
              </div>
            );
          })}
        </div>
        {detailContent}
      </div>
    </div>
  );
};

export default DistributionPieChart;
