import React from "react";
import { Select } from "@/components/ui";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";

interface AnalyticsDashboardHeaderProps {
  timeFilter: string;
  onTimeFilterChange: (filter: string) => void;
  onExportClick: () => void;
}

const timeFilters = [
  { key: "thisWeek", label: "This Week" },
  { key: "thisMonth", label: "This Month" },
  { key: "lastMonth", label: "Last Month" },
  { key: "thisYear", label: "This Year" },
  { key: "custom", label: "Custom Range" },
];

const AnalyticsDashboardHeader: React.FC<AnalyticsDashboardHeaderProps> = ({
  timeFilter,
  onTimeFilterChange,
  onExportClick,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="font-black text-black text-xl flex items-center tracking-wide">
          <div className="relative mr-4">
            <div className="absolute inset-0 bg-cyan-500 rounded-2xl blur-lg opacity-30"></div>
            <div className="relative bg-cyan-500 p-3 rounded-2xl">
              {React.createElement(getIcon("BarChart3"), {
                className: "h-6 w-6 text-white",
              })}
            </div>
          </div>
          <StylizedButtonText firstLetterClassName="text-2xl" restOfWordClassName="text-xl">
            ANALYTICS DASHBOARD
          </StylizedButtonText>
        </h1>
        <p className="text-purple-900 mt-2 ml-16">Comprehensive financial insights and reporting</p>
      </div>

      <div className="flex items-center gap-3 mt-4 lg:mt-0">
        {/* Time Filter */}
        <div className="flex items-center gap-2">
          {React.createElement(getIcon("Calendar"), {
            className: "h-4 w-4 text-purple-600",
          })}
          <Select
            value={timeFilter}
            onChange={(e) => onTimeFilterChange(e.target.value)}
            className="border-2 border-black rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
          >
            {timeFilters.map((filter) => (
              <option key={filter.key} value={filter.key}>
                {filter.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Export Button */}
        <Button
          onClick={onExportClick}
          className="btn btn-primary px-4 py-2 rounded-lg border-2 border-black flex items-center gap-2 text-sm shadow-lg"
        >
          {React.createElement(getIcon("Download"), { className: "h-4 w-4" })}
          Export
        </Button>
      </div>
    </div>
  );
};

export default AnalyticsDashboardHeader;
