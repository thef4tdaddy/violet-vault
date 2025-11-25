import React from "react";
import { Select } from "@/components/ui";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";
import { globalToast } from "../../../stores/ui/toastStore";

interface HistoryFilter {
  author: string;
  limit: number;
}

interface HistoryControlsProps {
  filter: HistoryFilter;
  updateFilter: (update: Partial<HistoryFilter>) => void;
  loading: boolean;
  exportHistory: () => void;
}

const HistoryControls = ({
  filter,
  updateFilter,
  loading,
  exportHistory,
}: HistoryControlsProps) => {
  return (
    <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Author</label>
          <Select
            value={filter.author}
            onChange={(e) => updateFilter({ author: e.target.value })}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="all">All Authors</option>
            <option value="user">User</option>
            <option value="system">System</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Limit</label>
          <Select
            value={filter.limit}
            onChange={(e) => updateFilter({ limit: parseInt(e.target.value) })}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value={25}>25 changes</option>
            <option value={50}>50 changes</option>
            <option value={100}>100 changes</option>
            <option value={-1}>All changes</option>
          </Select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => {
            // Integrity verification will be implemented in future version
            globalToast.showInfo(
              "Integrity verification coming soon!",
              "Feature Coming Soon",
              5000
            );
          }}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center text-sm"
        >
          {React.createElement(getIcon("Shield"), {
            className: "h-4 w-4 mr-2",
          })}
          Verify Integrity
        </Button>

        <Button
          onClick={() => exportHistory()}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center text-sm"
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

export default HistoryControls;
