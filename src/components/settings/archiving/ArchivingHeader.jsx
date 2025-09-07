import React from "react";
import { Archive, RefreshCw } from "lucide-react";

const ArchivingHeader = ({ onRefresh, isLoading }) => {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-100 p-3 rounded-lg">
            <Archive className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Transaction Archiving</h2>
            <p className="text-gray-600 mt-1">
              Archive old transactions while preserving analytics data
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="btn btn-secondary flex items-center space-x-2"
          disabled={isLoading}
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
};

export default ArchivingHeader;
