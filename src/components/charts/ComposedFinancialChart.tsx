import React from "react";
import {
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import ChartContainer from "./ChartContainer";
import { useChartConfig } from "../../hooks/common/useChartConfig";
import { ComposedFinancialChartProps, ChartDataPoint, ChartSeries } from "../../types/analytics";

/**
 * Reusable composed financial chart component
 * Combines bars, lines, and areas for comprehensive financial analysis
 * Extracted from ChartsAndAnalytics.jsx for better reusability
 * Issue #151 - ChartsAndAnalytics refactoring
 */
const ComposedFinancialChart: React.FC<ComposedFinancialChartProps> = ({
  title = "Financial Analysis",
  subtitle,
  data = [],
  series = [],
  height = 400,
  className = "",
  loading = false,
  error = null,
  emptyMessage = "No financial data available",
  actions,
  showGrid = true,
  showLegend = true,
  formatTooltip,
  xAxisKey = "month",
  ...props
}) => {
  const { CustomTooltip, chartDefaults, chartTypeConfigs, getColorByCategory } = useChartConfig();

  // Use custom tooltip or default
  const TooltipComponent = formatTooltip || CustomTooltip;

  // Ensure data is valid
  const chartData: ChartDataPoint[] = Array.isArray(data) ? data : [];
  const hasData = chartData.length > 0;

  // Default series configuration for income/expense analysis
  const defaultSeries: ChartSeries[] = [
    {
      type: "bar",
      dataKey: "income",
      name: "Income",
      fill: "#10b981",
    },
    {
      type: "bar",
      dataKey: "expenses",
      name: "Expenses",
      fill: "#ef4444",
    },
    {
      type: "line",
      dataKey: "net",
      name: "Net Cash Flow",
      stroke: "#06b6d4",
      strokeWidth: 3,
    },
  ];

  const seriesConfig: ChartSeries[] = series.length > 0 ? series : defaultSeries;

  // Group series by type for rendering
  const barSeries = seriesConfig.filter((s) => s.type === "bar");
  const lineSeries = seriesConfig.filter((s) => s.type === "line");
  const areaSeries = seriesConfig.filter((s) => s.type === "area");

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
      dataTestId="composed-financial-chart"
    >
      {hasData && (
        <ComposedChart data={chartData} {...props}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray={chartDefaults.cartesianGrid.strokeDasharray}
              stroke={chartDefaults.cartesianGrid.stroke}
            />
          )}

          <XAxis dataKey={xAxisKey} stroke={chartDefaults.axis.stroke} fontSize={12} />
          <YAxis
            stroke={chartDefaults.axis.stroke}
            fontSize={12}
            tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}K`}
          />

          <Tooltip content={<TooltipComponent />} />
          {showLegend && <Legend />}

          {/* Render Areas first (background) */}
          {areaSeries.map((areaProps, index) => {
            const { type, ...restAreaProps } = areaProps;
            return (
              <Area
                key={`area-${areaProps.dataKey}`}
                type="monotone"
                fillOpacity={chartTypeConfigs.area.fillOpacity}
                strokeWidth={chartTypeConfigs.area.strokeWidth}
                fill={areaProps.fill || getColorByCategory(areaProps.dataKey, index)}
                stroke={
                  areaProps.stroke || areaProps.fill || getColorByCategory(areaProps.dataKey, index)
                }
                {...restAreaProps}
              />
            );
          })}

          {/* Render Bars */}
          {barSeries.map((barProps, index) => {
            const { type, ...restBarProps } = barProps;
            return (
              <Bar
                key={`bar-${barProps.dataKey}`}
                radius={chartTypeConfigs.bar.radius as [number, number, number, number]}
                maxBarSize={chartTypeConfigs.bar.maxBarSize}
                fill={barProps.fill || getColorByCategory(barProps.dataKey, index)}
                {...restBarProps}
              />
            );
          })}

          {/* Render Lines on top */}
          {lineSeries.map((lineProps, index) => {
            const { type, ...restLineProps } = lineProps;
            return (
              <Line
                key={`line-${lineProps.dataKey}`}
                type="monotone"
                strokeWidth={lineProps.strokeWidth || chartTypeConfigs.line.strokeWidth}
                dot={lineProps.dot !== undefined ? lineProps.dot : chartTypeConfigs.line.dot}
                activeDot={lineProps.activeDot || chartTypeConfigs.line.activeDot}
                stroke={lineProps.stroke || getColorByCategory(lineProps.dataKey, index)}
                {...restLineProps}
              />
            );
          })}
        </ComposedChart>
      )}
    </ChartContainer>
  );
};

// Specialized cash flow chart
export const CashFlowChart: React.FC<{ data: ChartDataPoint[]; title?: string; [key: string]: any }> = ({ 
  data, 
  title = "Monthly Cash Flow", 
  ...props 
}) => {
  const series: ChartSeries[] = [
    {
      type: "bar",
      dataKey: "income",
      name: "Income",
      fill: "#10b981",
    },
    {
      type: "bar",
      dataKey: "expenses",
      name: "Expenses",
      fill: "#ef4444",
    },
    {
      type: "line",
      dataKey: "net",
      name: "Net",
      stroke: "#06b6d4",
      strokeWidth: 3,
    },
  ];

  return <ComposedFinancialChart title={title} data={data} series={series} {...props} />;
};

// Specialized budget vs actual chart
export const BudgetVsActualChart: React.FC<{
  data: ChartDataPoint[];
  title?: string;
  _orientation?: string;
  [key: string]: any;
}> = ({
  data,
  title = "Budget vs Actual Spending",
  _orientation = "horizontal",
  ...props
}) => {
  const series: ChartSeries[] = [
    {
      type: "bar",
      dataKey: "budgeted",
      name: "Budgeted",
      fill: "#a855f7",
    },
    {
      type: "bar",
      dataKey: "actual",
      name: "Actual",
      fill: "#06b6d4",
    },
  ];

  return (
    <ComposedFinancialChart title={title} data={data} series={series} xAxisKey="name" {...props} />
  );
};

export default ComposedFinancialChart;