import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";
import type { ExecutionHistoryEntry } from "@/hooks/budgeting/autofunding/types";

interface HistoryTabProps {
  executionHistory: ExecutionHistoryEntry[];
  showExecutionDetails: string | null;
  onToggleDetails: (id: string | null) => void;
}

const HistoryTab: React.FC<HistoryTabProps> = ({
  executionHistory,
  showExecutionDetails,
  onToggleDetails,
}) => {
  return (
    <div className="space-y-4">
      {executionHistory.length === 0 ? (
        <div className="text-center py-12">
          {React.createElement(getIcon("History"), {
            className: "h-12 w-12 text-gray-400 mx-auto mb-4",
          })}
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Execution History</h3>
          <p className="text-gray-600 max-w-sm mx-auto">
            Your rule execution history will appear here once you start running auto-funding rules.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {executionHistory.map((execution, index) => (
            <div key={execution.id} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      execution.success ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    }`}
                  >
                    {execution.success
                      ? React.createElement(getIcon("CheckCircle"), {
                          className: "h-5 w-5",
                        })
                      : React.createElement(getIcon("AlertTriangle"), {
                          className: "h-5 w-5",
                        })}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">
                        Execution #{executionHistory.length - index}
                      </h4>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          (execution.success as boolean | undefined) !== false
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {(execution.success as boolean | undefined) !== false
                          ? "Success"
                          : "Failed"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        {React.createElement(getIcon("Calendar"), {
                          className: "h-3 w-3",
                        })}
                        {new Date(execution.executedAt || execution.timestamp).toLocaleString()}
                      </span>
                      {(execution.success as boolean | undefined) !== false && (
                        <>
                          <span className="flex items-center gap-1">
                            {React.createElement(getIcon("TrendingUp"), {
                              className: "h-3 w-3",
                            })}
                            ${execution.totalFunded?.toFixed(2) || "0.00"} funded
                          </span>
                          <span>{execution.rulesExecuted || 0} rules</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() =>
                    onToggleDetails(showExecutionDetails === execution.id ? null : execution.id)
                  }
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  {showExecutionDetails === execution.id
                    ? React.createElement(getIcon("EyeOff"), {
                        className: "h-4 w-4",
                      })
                    : React.createElement(getIcon("Eye"), {
                        className: "h-4 w-4",
                      })}
                </Button>
              </div>

              {showExecutionDetails === execution.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="space-y-2">
                    {(
                      (execution.results as
                        | Array<{
                            success: boolean;
                            ruleName?: string;
                            amount?: number;
                            error?: string;
                          }>
                        | undefined) || []
                    ).map((result, resultIndex) => (
                      <div key={resultIndex} className="text-sm">
                        <div
                          className={`flex items-center justify-between p-2 rounded ${
                            result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                          }`}
                        >
                          <span>{result.ruleName || `Rule ${resultIndex + 1}`}</span>
                          <span>
                            {result.success
                              ? `$${result.amount?.toFixed(2) || "0.00"}`
                              : result.error || "Failed"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {(execution.error as string | undefined) && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                      <strong>Error:</strong> {execution.error as string}
                    </div>
                  )}

                  <div className="mt-3 flex justify-end">
                    <Button className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                      {React.createElement(getIcon("RotateCcw"), {
                        className: "h-3 w-3",
                      })}
                      Revert Changes
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryTab;
