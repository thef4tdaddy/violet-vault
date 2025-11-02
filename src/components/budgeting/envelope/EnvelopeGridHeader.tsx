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
      <div className="flex items-center gap-2 flex-wrap">
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
          className={`px-3 py-2 text-sm border-2 rounded-lg transition-colors font-medium ${
            filterOptions.showEmpty
              ? "bg-red-50 border-red-600 text-red-700 hover:bg-red-100"
              : "border-black bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          {React.createElement(getIcon(filterOptions.showEmpty ? "EyeOff" : "Eye"), { className: "h-4 w-4 mr-2" })}
          {filterOptions.showEmpty ? "Hide Empty" : "Show All"}
        </Button>
      </div>

      {/* Right side - View Mode Toggle */}
      <div className="flex bg-gray-200 rounded-lg p-1 border-2 border-black">
        <Button
          onClick={() => setViewMode("overview")}
          className={`px-4 py-2 text-sm rounded-md transition-colors font-medium border-0 ${
            viewMode === "overview"
              ? "bg-white text-black shadow-sm"
              : "bg-transparent text-gray-700 hover:text-gray-900"
          }`}
        >
          Overview
        </Button>
        <Button
          onClick={() => setViewMode("detailed")}
          className={`px-4 py-2 text-sm rounded-md transition-colors font-medium border-0 ${
            viewMode === "detailed"
              ? "bg-white text-black shadow-sm"
              : "bg-transparent text-gray-700 hover:text-gray-900"
          }`}
        >
          Detailed
        </Button>
      </div>
    </div>
  );
};
