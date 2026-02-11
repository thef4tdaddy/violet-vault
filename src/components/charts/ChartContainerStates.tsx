import React from "react";
import { getIcon } from "@/utils";

interface ChartHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}

/**
 * Chart header component - title, subtitle, and action buttons
 */
export const ChartHeader: React.FC<ChartHeaderProps> = ({ title, subtitle, actions }) => (
  <div className="flex items-center justify-between mb-4">
    <div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
    </div>
    {actions}
  </div>
);

interface ChartLoadingStateProps {
  height: number;
}

/**
 * Loading state component for charts
 */
export const ChartLoadingState: React.FC<ChartLoadingStateProps> = ({ height }) => (
  <div className="flex items-center justify-center text-gray-500" style={{ height }}>
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
      <p>Loading chart data...</p>
    </div>
  </div>
);

interface ChartErrorStateProps {
  height: number;
  error: unknown;
}

/**
 * Error state component for charts
 */
export const ChartErrorState: React.FC<ChartErrorStateProps> = ({ height, error }) => {
  const errorMessage =
    error == null
      ? ""
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message?: unknown }).message)
        : String(error);

  return (
    <div className="flex items-center justify-center text-red-500" style={{ height }}>
      <div className="text-center">
        {React.createElement(getIcon("BarChart3"), {
          className: "h-12 w-12 mx-auto mb-3 opacity-50",
        })}
        <p className="font-medium">Error loading chart</p>
        <p className="text-sm text-gray-500 mt-1">{errorMessage}</p>
      </div>
    </div>
  );
};

interface ChartEmptyStateProps {
  emptyMessage: string;
}

/**
 * Empty state component for charts
 */
export const ChartEmptyState: React.FC<ChartEmptyStateProps> = ({ emptyMessage }) => (
  <div className="flex items-center justify-center h-full text-gray-500">
    <div className="text-center">
      {React.createElement(getIcon("BarChart3"), {
        className: "h-12 w-12 mx-auto mb-3 opacity-50",
      })}
      <p>{emptyMessage}</p>
    </div>
  </div>
);
