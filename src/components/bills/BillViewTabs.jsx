import React from "react";
import StandardTabs from "../ui/StandardTabs";

/**
 * View mode tabs for BillManager using standardized tabs component
 * Pure UI component that preserves exact visual appearance
 */
const BillViewTabs = ({ viewModes, viewMode, setViewMode, filterOptions, setFilterOptions }) => {
  return (
    <>
      {/* View Mode Tabs */}
      <StandardTabs
        tabs={viewModes}
        activeTab={viewMode}
        onTabChange={setViewMode}
        variant="colored"
        size="md"
      />

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