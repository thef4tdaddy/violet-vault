import React from "react";
import { getIcon } from "../../../utils";

interface HistoryStatisticsData {
  totalCommits?: number;
  dateRange?: {
    newest?: string | Date | null;
    oldest?: string | Date | null;
  };
  authorBreakdown?: Record<string, number>;
  actionBreakdown?: Record<string, number>;
  storageSize?: number;
}

const HistoryStatistics = ({ statistics }: { statistics: HistoryStatisticsData | null }) => {
  if (!statistics) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center">
          {React.createElement(getIcon("GitCommit"), {
            className: "h-5 w-5 text-blue-600 mr-2",
          })}
          <div>
            <p className="text-sm text-blue-700">Total Changes</p>
            <p className="text-lg font-semibold text-blue-900">{statistics.totalCommits}</p>
          </div>
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-center">
          {React.createElement(getIcon("Clock"), {
            className: "h-5 w-5 text-green-600 mr-2",
          })}
          <div>
            <p className="text-sm text-green-700">Latest Change</p>
            <p className="text-xs text-green-900">
              {statistics.dateRange?.newest
                ? new Date(statistics.dateRange.newest).toLocaleDateString()
                : "None"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg">
        <div className="flex items-center">
          {React.createElement(getIcon("User"), {
            className: "h-5 w-5 text-purple-600 mr-2",
          })}
          <div>
            <p className="text-sm text-purple-700">Authors</p>
            <p className="text-lg font-semibold text-purple-900">
              {Object.keys(statistics.authorBreakdown || {}).length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center">
          {React.createElement(getIcon("FileText"), {
            className: "h-5 w-5 text-gray-600 mr-2",
          })}
          <div>
            <p className="text-sm text-gray-700">Storage Size</p>
            <p className="text-xs text-gray-900">
              {statistics.storageSize ? Math.round(statistics.storageSize / 1024) : 0} KB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryStatistics;
