import React from "react";
import { ResponsiveContainer } from "recharts";
import { getIcon } from "../../utils";

/**
 * Reusable chart container component
 * Extracted from ChartsAndAnalytics.jsx for better reusability
 * Issue #151 - ChartsAndAnalytics refactoring
 */
const ChartContainer = ({
  title,
  subtitle,
  children,
  height = 300,
  className = "",
  loading = false,
  error = null,
  emptyMessage = "No data available",
  actions,
  dataTestId,
}) => {
  if (loading) {
    return (
      <div className={`glassmorphism rounded-xl p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          {actions}
        </div>
        <div
          className="flex items-center justify-center text-gray-500"
          style={{ height }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
            <p>Loading chart data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`glassmorphism rounded-xl p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          {actions}
        </div>
        <div
          className="flex items-center justify-center text-red-500"
          style={{ height }}
        >
          <div className="text-center">
            {React.createElement(getIcon("BarChart3"), {
              className: "h-12 w-12 mx-auto mb-3 opacity-50",
            })}
            <p className="font-medium">Error loading chart</p>
            <p className="text-sm text-gray-500 mt-1">
              {error.message || error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check if children indicates empty data
  const hasData = React.Children.count(children) > 0;

  return (
    <div
      className={`glassmorphism rounded-xl p-6 ${className}`}
      data-testid={dataTestId}
      data-chart
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
        {actions}
      </div>

      <ResponsiveContainer width="100%" height={height}>
        {hasData ? (
          children
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              {React.createElement(getIcon("BarChart3"), {
                className: "h-12 w-12 mx-auto mb-3 opacity-50",
              })}
              <p>{emptyMessage}</p>
            </div>
          </div>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default ChartContainer;
