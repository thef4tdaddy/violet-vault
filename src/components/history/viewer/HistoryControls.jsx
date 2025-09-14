import React from "react";
import { getIcon } from "../../../utils";
import { globalToast } from "../../../stores/ui/toastStore";

const HistoryControls = ({ filter, updateFilter, loading, exportHistory }) => {
  return (
    <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Author
          </label>
          <select
            value={filter.author}
            onChange={(e) => updateFilter({ author: e.target.value })}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="all">All Authors</option>
            <option value="user">User</option>
            <option value="system">System</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Limit
          </label>
          <select
            value={filter.limit}
            onChange={(e) => updateFilter({ limit: parseInt(e.target.value) })}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value={25}>25 changes</option>
            <option value={50}>50 changes</option>
            <option value={100}>100 changes</option>
            <option value={-1}>All changes</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            // Integrity verification will be implemented in future version
            globalToast.showInfo(
              "Integrity verification coming soon!",
              "Feature Coming Soon",
            );
          }}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center text-sm"
        >
          {React.createElement(getIcon("Shield"), {
            className: "h-4 w-4 mr-2",
          })}
          Verify Integrity
        </button>

        <button
          onClick={() => exportHistory()}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center text-sm"
        >
          {React.createElement(getIcon("Download"), {
            className: "h-4 w-4 mr-2",
          })}
          Export
        </button>
      </div>
    </div>
  );
};

export default HistoryControls;
