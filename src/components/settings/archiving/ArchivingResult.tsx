import React from "react";
import { getIcon } from "../../../utils";

interface ArchivingResultData {
  success?: boolean;
  message?: string;
  error?: string;
  stats?: {
    processed?: number;
    archived?: number;
    aggregated?: number;
  };
}

const ArchivingResult = ({ lastResult }: { lastResult: ArchivingResultData | null }) => {
  if (!lastResult) return null;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Last Archiving Result</h3>

      <div className={`p-4 rounded-lg ${lastResult.success ? "bg-green-50" : "bg-red-50"}`}>
        <div className="flex items-start space-x-3">
          {lastResult.success
            ? React.createElement(getIcon("CheckCircle"), {
                className: "h-5 w-5 text-green-600 mt-0.5",
              })
            : React.createElement(getIcon("AlertTriangle"), {
                className: "h-5 w-5 text-red-600 mt-0.5",
              })}
          <div>
            <p className={`font-medium ${lastResult.success ? "text-green-800" : "text-red-800"}`}>
              {lastResult.success ? "Archiving Completed Successfully" : "Archiving Failed"}
            </p>
            <p className={`text-sm mt-1 ${lastResult.success ? "text-green-700" : "text-red-700"}`}>
              {lastResult.message || lastResult.error}
            </p>
            {lastResult.stats && (
              <div className="mt-2 text-sm">
                <p>Processed: {lastResult.stats.processed} transactions</p>
                <p>Archived: {lastResult.stats.archived} transactions</p>
                <p>Analytics created: {lastResult.stats.aggregated} records</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchivingResult;
