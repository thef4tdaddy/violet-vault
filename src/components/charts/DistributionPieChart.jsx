import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import ChartContainer from "./ChartContainer";
import { useChartConfig } from "../../hooks/common/useChartConfig";

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
}) => {
  const { CustomTooltip, chartColors, chartTypeConfigs } = useChartConfig();

  // Use custom tooltip or default
  const TooltipComponent = formatTooltip || CustomTooltip;

  // Ensure data is valid and limit items
  const chartData = Array.isArray(data) ? data.slice(0, maxItems) : [];
  const hasData = chartData.length > 0;

  // Default label formatter
  const defaultLabelFormatter = ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`;

  const labelFunc = labelFormatter || defaultLabelFormatter;

  // Calculate total for percentage display
  const total = chartData
    .filter((item) => item != null) // Filter out null/undefined items
    .reduce((sum, item) => sum + (item[dataKey] || 0), 0);

  // Enhanced data with percentage for custom rendering
  const enhancedData = chartData
    .filter((item) => item != null) // Filter out null/undefined items
    .map((item, index) => ({
      ...item,
      percentage: total > 0 ? (((item[dataKey] || 0) / total) * 100).toFixed(1) : 0,
      color: item.color || chartColors[index % chartColors.length],
    }));

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
              label={showLabels ? labelFunc : false}
              labelLine={false}
              startAngle={chartTypeConfigs.pie.startAngle}
              endAngle={chartTypeConfigs.pie.endAngle}
              {...props}
            >
              {enhancedData
                .filter((entry) => entry != null) // Additional safety filter
                .map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
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
