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
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex items-center gap-4">
        <h2 className="font-black text-black text-xl flex items-center">
          <span className="text-2xl mr-1">E</span>nvelopes
          <span className="text-2xl ml-3 mr-1">M</span>anagement
        </h2>

        {/* View Mode Toggle */}
        <div className="flex bg-gray-200 rounded-lg p-1 border border-gray-300">
          <Button
            onClick={() => setViewMode("overview")}
            className={`px-3 py-1 text-sm rounded-md transition-colors font-medium ${
              viewMode === "overview"
                ? "bg-white text-gray-900 shadow-sm border-2 border-gray-400"
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            Overview
          </Button>
          <Button
            onClick={() => setViewMode("detailed")}
            className={`px-3 py-1 text-sm rounded-md transition-colors font-medium ${
              viewMode === "detailed"
                ? "bg-white text-gray-900 shadow-sm border-2 border-gray-400"
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            Detailed
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
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
              ? "bg-blue-50 border-blue-600 text-blue-700 hover:bg-blue-100"
              : "border-gray-400 text-gray-700 hover:bg-gray-50"
          }`}
        >
          {React.createElement(getIcon("Filter"), { className: "h-4 w-4 mr-2" })}
          {filterOptions.showEmpty ? "Hide Empty" : "Show Empty"}
        </Button>

        {/* Create Envelope Button */}
        <Button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 border-2 border-black"
        >
          {React.createElement(getIcon("Plus"), { className: "h-4 w-4" })}
          Add Envelope
        </Button>
      </div>
    </div>
  );
};
