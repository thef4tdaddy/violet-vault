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
import { useChartConfig } from "../../hooks/platform/ux/useChartConfig";

// Chart datum type
type ChartDatum = Record<string, unknown>;

// Helper to format currency values
const formatCurrency = (value?: number) => `$${((value || 0) / 1000).toFixed(0)}K`;

// Default series configuration for income/expense analysis
const DEFAULT_SERIES: SeriesItem[] = [
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

// Series item type used by chart components
type SeriesItem = {
  type: string;
  dataKey: string;
  name?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  dot?: boolean | Record<string, unknown>;
  activeDot?: Record<string, unknown> | boolean;
};

// Helper to group series by type
const groupSeriesByType = (seriesConfig: SeriesItem[]) => {
  return {
    barSeries: seriesConfig.filter((s) => s.type === "bar"),
    lineSeries: seriesConfig.filter((s) => s.type === "line"),
    areaSeries: seriesConfig.filter((s) => s.type === "area"),
  };
};

/**
 * Reusable composed financial chart component
 * Combines bars, lines, and areas for comprehensive financial analysis
 * Extracted from ChartsAndAnalytics.jsx for better reusability
 * Issue #151 - ChartsAndAnalytics refactoring
 */
const ComposedFinancialChart = ({
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
}: {
  title?: string;
  subtitle?: React.ReactNode;
  data?: ChartDatum[];
  series?: SeriesItem[];
  height?: number;
  className?: string;
  loading?: boolean;
  error?: unknown;
  emptyMessage?: string;
  actions?: React.ReactNode;
  showGrid?: boolean;
  showLegend?: boolean;
  formatTooltip?: React.ComponentType<unknown> | ((props: unknown) => React.ReactNode);
  xAxisKey?: string;
  [key: string]: unknown;
}) => {
  const { CustomTooltip, chartDefaults, chartTypeConfigs, getColorByCategory } = useChartConfig();

  // Use custom tooltip or default; keep as a generic React component
  const TooltipComponent =
    (formatTooltip as React.ComponentType<unknown>) ||
    (CustomTooltip as React.ComponentType<unknown>);

  // Ensure data is valid
  const chartData = Array.isArray(data) ? data : [];
  const hasData = chartData.length > 0;

  const seriesConfig = series.length > 0 ? series : DEFAULT_SERIES;

  // Group series by type for rendering
  const { barSeries, lineSeries, areaSeries } = groupSeriesByType(seriesConfig);

  // Normalize bar radius and maxBarSize types to match Recharts expected unions
  const rawBarRadius = (chartTypeConfigs.bar && (chartTypeConfigs.bar.radius as unknown)) || 0;
  let radiusValue: number | [number, number, number, number];
  if (typeof rawBarRadius === "number") {
    radiusValue = rawBarRadius;
  } else if (Array.isArray(rawBarRadius)) {
    if (rawBarRadius.length === 4) {
      radiusValue = [
        Number(rawBarRadius[0]) || 0,
        Number(rawBarRadius[1]) || 0,
        Number(rawBarRadius[2]) || 0,
        Number(rawBarRadius[3]) || 0,
      ];
    } else if (rawBarRadius.length === 2) {
      const [a, b] = rawBarRadius.map((v) => Number(v) || 0);
      radiusValue = [a, b, a, b];
    } else {
      // Fallback to single number
      radiusValue = Number(rawBarRadius[0]) || 0;
    }
  } else {
    radiusValue = 0;
  }

  const maxBarSizeValue =
    Number((chartTypeConfigs.bar && chartTypeConfigs.bar.maxBarSize) as unknown) || undefined;

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
          <YAxis stroke={chartDefaults.axis.stroke} fontSize={12} tickFormatter={formatCurrency} />

          {/* Render default tooltip here; formatTooltip is passed to ChartContainer for custom tooltip rendering there */}
          <Tooltip />
          {showLegend && <Legend />}

          {/* Render Areas first (background) */}
          {areaSeries.map((areaProps, index) =>
            areaProps && (areaProps as { dataKey?: string }).dataKey ? (
              <Area
                key={`area-${(areaProps as SeriesItem).dataKey}`}
                dataKey={(areaProps as SeriesItem).dataKey} // Add dataKey prop here
                fillOpacity={chartTypeConfigs.area.fillOpacity as number}
                strokeWidth={(chartTypeConfigs.area.strokeWidth as number) || undefined}
                fill={
                  (areaProps as SeriesItem).fill ||
                  getColorByCategory((areaProps as SeriesItem).dataKey, index)
                }
                stroke={
                  ((areaProps as SeriesItem).stroke as string) ||
                  ((areaProps as SeriesItem).fill as string) ||
                  getColorByCategory((areaProps as SeriesItem).dataKey, index)
                }
                {...(areaProps as Record<string, unknown>)}
              />
            ) : null
          )}

          {/* Render Bars */}
          {barSeries.map((barProps, index) => (
            <Bar
              key={`bar-${barProps.dataKey}`}
              radius={radiusValue as number | [number, number, number, number]}
              maxBarSize={maxBarSizeValue}
              fill={barProps.fill || getColorByCategory(barProps.dataKey, index)}
              {...(barProps as Record<string, unknown>)}
            />
          ))}

          {/* Render Lines on top */}
          {lineSeries.map((lineProps, index) => (
            <Line
              key={`line-${lineProps.dataKey}`}
              strokeWidth={
                (lineProps.strokeWidth as number) || (chartTypeConfigs.line.strokeWidth as number)
              }
              dot={lineProps.dot !== undefined ? lineProps.dot : chartTypeConfigs.line.dot}
              activeDot={lineProps.activeDot || chartTypeConfigs.line.activeDot}
              stroke={(lineProps.stroke as string) || getColorByCategory(lineProps.dataKey, index)}
              {...(lineProps as Record<string, unknown>)}
            />
          ))}
        </ComposedChart>
      )}
    </ChartContainer>
  );
};

// Specialized cash flow chart
export const CashFlowChart = ({
  data,
  title = "Monthly Cash Flow",
  ...props
}: {
  data: ChartDatum[];
  title?: string;
  [key: string]: unknown;
}) => {
  const series = [
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
export const BudgetVsActualChart = ({
  data,
  title = "Budget vs Actual Spending",
  _orientation = "horizontal",
  ...props
}: {
  data: ChartDatum[];
  title?: string;
  _orientation?: string;
  [key: string]: unknown;
}) => {
  const series = [
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
    <ComposedFinancialChart
      title={title}
      data={data}
      series={series}
      subtitle=""
      actions={[]}
      formatTooltip={() => null}
      {...props}
    />
  );
};

export default ComposedFinancialChart;
