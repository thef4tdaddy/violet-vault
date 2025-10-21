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
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="font-black text-black text-base">
          <span className="text-lg">A</span>NALYTICS <span className="text-lg">D</span>ASHBOARD
        </h1>
        <p className="text-purple-900 mt-1">Comprehensive financial insights and reporting</p>
      </div>

      <div className="flex items-center gap-3 mt-4 lg:mt-0">
        {/* Time Filter */}
        <div className="flex items-center gap-2">
          {React.createElement(getIcon("Calendar"), {
            className: "h-4 w-4 text-gray-500",
          })}
          <Select
            value={timeFilter}
            onChange={(e) => onTimeFilterChange(e.target.value)}
            className="border-2 border-black rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 border-2 border-black flex items-center gap-2 text-sm"
        >
          {React.createElement(getIcon("Download"), { className: "h-4 w-4" })}
          Export
        </Button>
      </div>
    </div>
  );
};

export default AnalyticsDashboardHeader;
