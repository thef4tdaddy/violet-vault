import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";

interface FilterOptions {
  timeRange: string;
  showEmpty: boolean;
  sortBy: string;
  envelopeType: string;
}

interface EnvelopeGridHeaderProps {
  filterOptions: FilterOptions;
  setFilterOptions: (options: FilterOptions) => void;
  setShowCreateModal: (show: boolean) => void;
  viewMode: string;
  setViewMode: (mode: string) => void;
}

export const EnvelopeGridHeader: React.FC<EnvelopeGridHeaderProps> = ({
  filterOptions,
  setFilterOptions,
  setShowCreateModal,
  viewMode,
  setViewMode,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      {/* Left side - Action buttons */}
      <div className="flex items-center gap-2">
        {/* Create Envelope Button */}
        <Button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 border-2 border-black"
        >
          {React.createElement(getIcon("Plus"), { className: "h-4 w-4" })}
          Add Envelope
        </Button>

        {/* Filter Toggle */}
        <Button
          onClick={() =>
            setFilterOptions({
              ...filterOptions,
              showEmpty: !filterOptions.showEmpty,
            })
          }
          className="px-3 py-2 text-sm border-2 border-black rounded-lg transition-colors font-medium bg-purple-100 text-purple-900 hover:bg-purple-200 focus:outline-none focus:ring-0"
        >
          {React.createElement(getIcon(filterOptions.showEmpty ? "Eye" : "EyeOff"), {
            className: "h-4 w-4 mr-2",
          })}
          {filterOptions.showEmpty ? "Show All" : "Hide Empty"}
        </Button>
      </div>

      {/* Right side - View Mode Toggle */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">View Mode:</span>
        <div className="flex gap-2 bg-white rounded-lg p-1 border-2 border-black">
          <Button
            onClick={() => setViewMode("overview")}
            className={`px-5 py-2 text-sm rounded-md transition-colors font-medium border-0 ${
              viewMode === "overview"
                ? "bg-purple-500 text-white shadow-md"
                : "bg-purple-100 text-purple-900 hover:bg-purple-200"
            }`}
            title="Compact view - shows envelope names and key metrics only"
          >
            Overview
          </Button>
          <Button
            onClick={() => setViewMode("detailed")}
            className={`px-5 py-2 text-sm rounded-md transition-colors font-medium border-0 ${
              viewMode === "detailed"
                ? "bg-purple-500 text-white shadow-md"
                : "bg-purple-100 text-purple-900 hover:bg-purple-200"
            }`}
            title="Full view - shows all envelope details, spending, and bills"
          >
            Detailed
          </Button>
        </div>
      </div>
    </div>
  );
};
