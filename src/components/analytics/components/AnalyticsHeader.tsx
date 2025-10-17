import React from "react";
import { getIcon } from "../../../utils";
import { AnalyticsHeaderProps } from "../../../types/analytics";

/**
 * Analytics header component with title and controls
 * Extracted from ChartsAndAnalytics.jsx to reduce complexity
 */
const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  dateRange,
  handleDateRangeChange,
  handleExport,
}) => {
  const formatDateRange = () => {
    if (!dateRange?.start || !dateRange?.end) return "All Time";

    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
      });
    };

    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold flex items-center text-gray-900">
          <div className="relative mr-4">
            <div className="absolute inset-0 bg-cyan-500 rounded-2xl blur-lg opacity-30"></div>
            <div className="relative bg-cyan-500 p-3 rounded-2xl">
              {React.createElement(getIcon("BarChart3"), {
                className: "h-6 w-6 text-white",
              })}
            </div>
          </div>
          Analytics & Reports
        </h2>
        <p className="text-gray-800 mt-1">Financial insights and spending patterns</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Date Range Display */}
        <div className="text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-200">
          <span className="font-medium">Period: </span>
          {formatDateRange()}
        </div>

        {/* Date Range Picker Button */}
        <button
          onClick={() => {
            // This would typically open a date picker modal/dropdown
            // For now, we'll just pass the current range back
            const today = new Date();
            const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            handleDateRangeChange({ start: lastMonth, end: today });
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {React.createElement(getIcon("Calendar"), {
            className: "h-4 w-4",
          })}
          Change Period
        </button>

        {/* Export Button */}
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {React.createElement(getIcon("Download"), {
            className: "h-4 w-4",
          })}
          Export Data
        </button>
      </div>
    </div>
  );
};

export default AnalyticsHeader;
