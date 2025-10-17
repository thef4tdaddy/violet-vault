import React from "react";
import { getIcon } from "../../../utils";

/**
 * Analytics header component with title and controls
 * Extracted from ChartsAndAnalytics.jsx to reduce complexity
 */
const AnalyticsHeader = ({ dateRange, handleDateRangeChange, handleExport }) => {
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

      <div className="flex gap-3">
        <Select
          value={dateRange}
          onChange={handleDateRangeChange}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white/80 backdrop-blur-lg"
        >
          <option value="1month">Last Month</option>
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="1year">Last Year</option>
          <option value="all">All Time</option>
        </Select>

        <Button
          onClick={handleExport}
          className="btn btn-secondary border-2 border-black flex items-center rounded-xl px-4 py-2"
        >
          {React.createElement(getIcon("Download"), {
            className: "h-4 w-4 mr-2",
          })}
          Export
        </Button>
      </div>
    </div>
  );
};

export default AnalyticsHeader;
