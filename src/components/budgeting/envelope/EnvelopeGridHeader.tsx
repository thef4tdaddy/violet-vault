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
        <h2 className="text-xl font-bold text-gray-900">Envelopes</h2>

        {/* View Mode Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <Button
            onClick={() => setViewMode("overview")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewMode === "overview"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Overview
          </Button>
          <Button
            onClick={() => setViewMode("detailed")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewMode === "detailed"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
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
          className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
            filterOptions.showEmpty
              ? "bg-blue-50 border-blue-200 text-blue-700"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          {React.createElement(getIcon("Filter"), { className: "h-4 w-4 mr-2" })}
          {filterOptions.showEmpty ? "Hide Empty" : "Show Empty"}
        </Button>

        {/* Create Envelope Button */}
        <Button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          {React.createElement(getIcon("Plus"), { className: "h-4 w-4" })}
          Add Envelope
        </Button>
      </div>
    </div>
  );
};
