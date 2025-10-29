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

// Helper to format currency values
const formatCurrency = (value) => `$${(value / 1000).toFixed(0)}K`;

// Default series configuration for income/expense analysis
const DEFAULT_SERIES = [
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

// Helper to group series by type
const groupSeriesByType = (seriesConfig) => {
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
}) => {
  const { CustomTooltip, chartDefaults, chartTypeConfigs, getColorByCategory } = useChartConfig();

  // Use custom tooltip or default
  const TooltipComponent = formatTooltip || CustomTooltip;

  // Ensure data is valid
  const chartData = Array.isArray(data) ? data : [];
  const hasData = chartData.length > 0;

  const seriesConfig = series.length > 0 ? series : DEFAULT_SERIES;

  // Group series by type for rendering
  const { barSeries, lineSeries, areaSeries } = groupSeriesByType(seriesConfig);

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
          <YAxis stroke={chartDefaults.axis.stroke} fontSize={12} tickFormatter={formatCurrency} />

          <Tooltip content={<TooltipComponent />} />
          {showLegend && <Legend />}

          {/* Render Areas first (background) */}
          {areaSeries.map((areaProps, index) => (
            <Area
              key={`area-${areaProps.dataKey}`}
              type={chartTypeConfigs.area.type}
              fillOpacity={chartTypeConfigs.area.fillOpacity}
              strokeWidth={chartTypeConfigs.area.strokeWidth}
              fill={areaProps.fill || getColorByCategory(areaProps.dataKey, index)}
              stroke={
                areaProps.stroke || areaProps.fill || getColorByCategory(areaProps.dataKey, index)
              }
              {...areaProps}
            />
          ))}

          {/* Render Bars */}
          {barSeries.map((barProps, index) => (
            <Bar
              key={`bar-${barProps.dataKey}`}
              radius={chartTypeConfigs.bar.radius}
              maxBarSize={chartTypeConfigs.bar.maxBarSize}
              fill={barProps.fill || getColorByCategory(barProps.dataKey, index)}
              {...barProps}
            />
          ))}

          {/* Render Lines on top */}
          {lineSeries.map((lineProps, index) => (
            <Line
              key={`line-${lineProps.dataKey}`}
              type={chartTypeConfigs.line.type}
              strokeWidth={lineProps.strokeWidth || chartTypeConfigs.line.strokeWidth}
              dot={lineProps.dot !== undefined ? lineProps.dot : chartTypeConfigs.line.dot}
              activeDot={lineProps.activeDot || chartTypeConfigs.line.activeDot}
              stroke={lineProps.stroke || getColorByCategory(lineProps.dataKey, index)}
              {...lineProps}
            />
          ))}
        </ComposedChart>
      )}
    </ChartContainer>
  );
};

// Specialized cash flow chart
export const CashFlowChart = ({ data, title = "Monthly Cash Flow", ...props }) => {
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
