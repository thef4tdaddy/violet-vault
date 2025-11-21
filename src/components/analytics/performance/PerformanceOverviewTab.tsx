import React from "react";
import { getIcon } from "../../../utils";

import { PerformanceEntry } from "@/types/analytics";

interface PerformanceOverviewTabProps {
  performanceHistory: PerformanceEntry[];
}

/**
 * PerformanceOverviewTab component - overview tab content
 * Extracted from PerformanceMonitor.jsx for better organization
 */
const PerformanceOverviewTab: React.FC<PerformanceOverviewTabProps> = ({ performanceHistory }) => {
  const Clock = getIcon("Clock");

  return (
    <div className="space-y-4">
      {performanceHistory.length > 0 ? (
        <div className="bg-white/60 rounded-lg p-4 border border-white/20">
          <h4 className="font-medium text-gray-900 mb-3">Performance Trend</h4>
          <div className="flex items-end gap-1 h-20">
            {performanceHistory.slice(-20).map((entry, index) => (
              <div
                key={index}
                className="bg-purple-500 rounded-t flex-1 opacity-60 hover:opacity-100 transition-opacity"
                style={{ height: `${(entry.score / 100) * 100}%` }}
                title={`Score: ${entry.score} at ${new Date(entry.timestamp).toLocaleTimeString()}`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {React.createElement(Clock, {
            className: "h-8 w-8 mx-auto mb-2 opacity-50",
          })}
          <p>Performance history will appear here over time</p>
        </div>
      )}
    </div>
  );
};

export default PerformanceOverviewTab;
