import React from "react";

/**
 * View mode tabs for BillManager
 * Pure UI component that preserves exact visual appearance
 */
const BillViewTabs = ({ viewModes, viewMode, setViewMode, filterOptions, setFilterOptions }) => {
  return (
    <>
      {/* View Mode Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {viewModes.map((mode) => {
            const Icon = mode.icon;
            const isActive = viewMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {mode.label}
                <span
                  className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    isActive ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {mode.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <input
          type="text"
          placeholder="Search bills..."
          value={filterOptions.search}
          onChange={(e) => setFilterOptions((prev) => ({ ...prev, search: e.target.value }))}
          className="flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        <select
          value={filterOptions.urgency}
          onChange={(e) => setFilterOptions((prev) => ({ ...prev, urgency: e.target.value }))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Urgency</option>
          <option value="overdue">Overdue</option>
          <option value="urgent">Urgent</option>
          <option value="soon">Soon</option>
          <option value="later">Later</option>
        </select>

        <select
          value={filterOptions.envelope}
          onChange={(e) => setFilterOptions((prev) => ({ ...prev, envelope: e.target.value }))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Envelopes</option>
          <option value="connected">Connected</option>
          <option value="unconnected">Unconnected</option>
        </select>

        <button
          onClick={() => setFilterOptions({ search: "", urgency: "all", envelope: "all" })}
          className="px-3 py-2 text-gray-500 hover:text-gray-700 text-sm"
        >
          Clear Filters
        </button>
      </div>
    </>
  );
};

export default BillViewTabs;