import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";

interface Change {
  type?: string;
  changeType?: string;
  entityType?: string;
  description?: string;
  diff?: Record<string, { from: unknown; to: unknown }>;
  [key: string]: unknown;
}

interface Commit {
  hash?: string;
  message?: string;
  author?: string;
  timestamp?: string | number;
  parentHash?: string;
  [key: string]: unknown;
}

interface CommitDetails {
  commit?: Commit;
  changes: Change[];
}

interface ChangeDetailsProps {
  selectedCommit: string | null;
  commitDetailsLoading: boolean;
  commitDetails: CommitDetails | null;
  handleRestoreFromHistory: (commit: string) => void;
  getChangeIcon: (changeType: string) => React.ReactElement;
}

const ChangeDetails: React.FC<ChangeDetailsProps> = ({
  selectedCommit,
  commitDetailsLoading,
  commitDetails,
  handleRestoreFromHistory,
  getChangeIcon,
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Change Details</h3>

      {!selectedCommit && (
        <div className="text-center py-8 text-gray-500">
          {React.createElement(getIcon("FileText"), {
            className: "h-12 w-12 mx-auto mb-3 opacity-50",
          })}
          <p>Select a change to view details</p>
        </div>
      )}

      {selectedCommit && commitDetailsLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading details...</span>
        </div>
      )}

      {selectedCommit && commitDetails && commitDetails.commit && (
        <div className="border rounded-lg p-4 bg-white">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              {React.createElement(getIcon("GitCommit"), {
                className: "h-5 w-5 text-gray-600",
              })}
              <span className="font-mono text-sm text-gray-600">
                {commitDetails.commit.hash?.substring(0, 8)}
              </span>
            </div>

            <h4 className="font-medium text-gray-900 mb-1">{commitDetails.commit.message}</h4>

            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <strong>Author:</strong> {commitDetails.commit.author}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {commitDetails.commit.timestamp
                  ? new Date(commitDetails.commit.timestamp).toLocaleString()
                  : "Unknown"}
              </p>
              {commitDetails.commit.parentHash && (
                <p>
                  <strong>Parent:</strong>{" "}
                  <span className="font-mono">
                    {commitDetails.commit.parentHash.substring(0, 8)}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div>
            <h5 className="font-medium text-gray-900 mb-3">
              Changes ({commitDetails.changes.length})
            </h5>

            {commitDetails.changes.length === 0 && (
              <p className="text-gray-500 text-sm">No changes recorded</p>
            )}

            {commitDetails.changes.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {commitDetails.changes.map((change: Change, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 bg-gray-50 rounded text-sm"
                  >
                    {getChangeIcon(change.type ?? change.changeType ?? "")}
                    <div className="flex-1">
                      <p className="font-medium">
                        {change.description || `${change.changeType} ${change.entityType}`}
                      </p>
                      {change.diff && (
                        <div className="mt-1 text-xs text-gray-600">
                          {Object.keys(change.diff).map((field) => (
                            <div key={field}>
                              <strong>{field}:</strong> {JSON.stringify(change.diff?.[field]?.from)}{" "}
                              → {JSON.stringify(change.diff?.[field]?.to)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button
              onClick={() => handleRestoreFromHistory(selectedCommit)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm"
            >
              {React.createElement(getIcon("RotateCcw"), {
                className: "h-4 w-4 mr-2",
              })}
              Restore to This State
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangeDetails;
