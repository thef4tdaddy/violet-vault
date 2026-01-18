import React from "react";
import { ResponsiveContainer } from "recharts";
import {
  ChartHeader,
  ChartLoadingState,
  ChartErrorState,
  ChartEmptyState,
} from "./ChartContainerStates";

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
  formatTooltip,
  dataTestId,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  height?: number;
  className?: string;
  loading?: boolean;
  error?: unknown;
  emptyMessage?: string;
  actions?: React.ReactNode;
  formatTooltip?: React.ComponentType<unknown> | ((props: unknown) => React.ReactNode);
  dataTestId?: string;
}) => {
  const containerClass = `glassmorphism rounded-xl p-6 ${className}`;
  const formatTooltipAttr = formatTooltip ? "true" : "false";

  // Loading state
  if (loading) {
    return (
      <div className={containerClass} data-format-tooltip={formatTooltipAttr}>
        <ChartHeader title={title} subtitle={subtitle} actions={actions} />
        <ChartLoadingState height={height} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={containerClass} data-format-tooltip={formatTooltipAttr}>
        <ChartHeader title={title} subtitle={subtitle} actions={actions} />
        <ChartErrorState height={height} error={error} />
      </div>
    );
  }

  // Check if children indicates empty data (filtering out booleans, null, etc.)
  const hasData = React.Children.toArray(children).filter(Boolean).length > 0;

  return (
    <div
      className={containerClass}
      data-testid={dataTestId}
      data-chart
      data-format-tooltip={formatTooltipAttr}
    >
      <ChartHeader title={title} subtitle={subtitle} actions={actions} />

      <ResponsiveContainer width="100%" height={height}>
        {hasData ? children : <ChartEmptyState emptyMessage={emptyMessage} />}
      </ResponsiveContainer>
    </div>
  );
};

export default ChartContainer;
