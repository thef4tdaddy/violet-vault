import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, type XAxisProps } from "recharts";
import ChartContainer from "./ChartContainer";
import { useChartConfig } from "../../hooks/common/useChartConfig";

/**
 * Reusable category bar chart component
 * Extracted from ChartsAndAnalytics.jsx for better reusability
 * Issue #151 - ChartsAndAnalytics refactoring
 */
// Helper to format currency values
const formatCurrency = (value) => `$${(value / 1000).toFixed(0)}K`;

// Helper function to get axis configuration based on orientation
const getAxisConfig = (isHorizontal: boolean, chartDefaults: any) => {
  if (isHorizontal) {
    const xType = "number" as XAxisProps["type"];
    const yType = "category" as XAxisProps["type"];
    return {
      XAxis: { type: xType, stroke: chartDefaults.axis.stroke },
      YAxis: {
        dataKey: "name",
        type: yType,
        stroke: chartDefaults.axis.stroke,
        width: 100,
      },
    };
  }
  return {
    XAxis: { dataKey: "name", stroke: chartDefaults.axis.stroke },
    YAxis: { stroke: chartDefaults.axis.stroke },
  };
};

// Default bars configuration
const DEFAULT_BARS = [
  { dataKey: "income", name: "Income", fill: "#10b981" },
  { dataKey: "expenses", name: "Expenses", fill: "#ef4444" },
];

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
  const { CustomTooltip, chartDefaults, chartTypeConfigs, getColorByCategory } = useChartConfig();

  // Use custom tooltip or default
  const TooltipComponent = formatTooltip || CustomTooltip;

  // Ensure data is valid
  const chartData = Array.isArray(data) ? data : [];
  const hasData = chartData.length > 0;

  const barConfig = bars.length > 0 ? bars : DEFAULT_BARS;

  // Configure chart orientation
  const isHorizontal = orientation === "horizontal";
  const AxisConfig = getAxisConfig(isHorizontal, chartDefaults);

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
            tickFormatter={isHorizontal ? formatCurrency : undefined}
          />
          <YAxis
            {...AxisConfig.YAxis}
            fontSize={12}
            tickFormatter={!isHorizontal ? formatCurrency : undefined}
          />

          <Tooltip content={<TooltipComponent />} />
          {showLegend && <Legend />}

          {barConfig.map((barProps, index) => (
            <Bar
              key={barProps.dataKey}
              radius={chartTypeConfigs.bar.radius}
              maxBarSize={maxBarSize}
              fill={barProps.fill || getColorByCategory(barProps.dataKey, index)}
              {...barProps}
            />
          ))}
        </BarChart>
      )}
    </ChartContainer>
  );
};

export default CategoryBarChart;
