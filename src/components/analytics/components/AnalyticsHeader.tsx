import React from "react";
import { Select, Button, StylizedButtonText } from "@/components/ui";
import { getIcon } from "../../../utils";

/**
 * Analytics header component with title and controls
 * Extracted from ChartsAndAnalytics.jsx to reduce complexity
 */
const AnalyticsHeader = ({ dateRange, handleDateRangeChange, handleExport }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 className="font-black text-black text-xl flex items-center tracking-wide">
          <div className="relative mr-4">
            <div className="absolute inset-0 bg-cyan-500 rounded-2xl blur-lg opacity-30"></div>
            <div className="relative bg-cyan-500 p-3 rounded-2xl">
              {React.createElement(getIcon("BarChart3"), {
                className: "h-6 w-6 text-white",
              })}
            </div>
          </div>
          <StylizedButtonText firstLetterClassName="text-2xl" restOfWordClassName="text-xl">
            ANALYTICS AND REPORTS
          </StylizedButtonText>
        </h2>
        <p className="text-purple-900 mt-2 ml-16">Financial insights and spending patterns</p>
      </div>

      <div className="flex gap-3">
        <Select
          value={dateRange}
          onChange={handleDateRangeChange}
          className="px-4 py-2 border-2 border-black rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
        >
          <option value="1month">Last Month</option>
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="1year">Last Year</option>
          <option value="all">All Time</option>
        </Select>

        <Button
          onClick={handleExport}
          className="btn btn-primary border-2 border-black flex items-center rounded-lg px-4 py-2 shadow-lg"
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
