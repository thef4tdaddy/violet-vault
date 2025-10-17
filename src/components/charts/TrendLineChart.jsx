import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import ChartContainer from "./ChartContainer";
import { useChartConfig } from "../../hooks/common/useChartConfig";

/**
 * Reusable trend line chart component
 * Extracted from ChartsAndAnalytics.jsx for better reusability
 * Issue #151 - ChartsAndAnalytics refactoring
 */
const TrendLineChart = ({
  title = "Trend Analysis",
  subtitle,
  data = [],
  lines = [],
  height = 300,
  className = "",
  loading = false,
  error = null,
  emptyMessage = "No trend data available",
  actions,
  showGrid = true,
  showLegend = true,
  formatTooltip,
  ...props
}) => {
  const { CustomTooltip, chartDefaults, chartTypeConfigs, getColorByCategory } = useChartConfig();

  // Use custom tooltip or default
  const TooltipComponent = formatTooltip || CustomTooltip;

  // Ensure data is valid
  const chartData = Array.isArray(data) ? data : [];
  const hasData = chartData.length > 0;

  // Default lines configuration if not provided
  const defaultLines = [
    { dataKey: "income", name: "Income", color: "#10b981" },
    { dataKey: "expenses", name: "Expenses", color: "#ef4444" },
    { dataKey: "net", name: "Net", color: "#06b6d4" },
  ];

  const lineConfig = lines.length > 0 ? lines : defaultLines;

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
      dataTestId="trend-line-chart"
    >
      {hasData && (
        <LineChart data={chartData} {...props}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray={chartDefaults.cartesianGrid.strokeDasharray}
              stroke={chartDefaults.cartesianGrid.stroke}
            />
          )}
          <XAxis dataKey="month" stroke={chartDefaults.axis.stroke} fontSize={12} />
          <YAxis
            stroke={chartDefaults.axis.stroke}
            fontSize={12}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
          />
          <Tooltip content={<TooltipComponent />} />
          {showLegend && <Legend />}

          {lineConfig.map((lineProps, index) => (
            <Line
              key={lineProps.dataKey}
              type={chartTypeConfigs.line.type}
              strokeWidth={chartTypeConfigs.line.strokeWidth}
              dot={chartTypeConfigs.line.dot}
              activeDot={chartTypeConfigs.line.activeDot}
              stroke={lineProps.color || getColorByCategory(lineProps.dataKey, index)}
              {...lineProps}
            />
          ))}
        </LineChart>
      )}
    </ChartContainer>
  );
};

export default TrendLineChart;
