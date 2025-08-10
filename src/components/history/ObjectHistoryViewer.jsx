import React, { useState, useEffect } from "react";
import { useBudgetHistory } from "../../hooks/useBudgetHistory";
import {
  History,
  GitCommit,
  Calendar,
  User,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  Edit3,
  X,
} from "lucide-react";

/**
 * ObjectHistoryViewer - Shows history for a specific envelope, transaction, etc.
 * @param {Object} props
 * @param {string} props.objectId - ID of the object to show history for
 * @param {string} props.objectType - Type of object (envelope, transaction, bill, etc.)
 * @param {string} props.objectName - Display name of the object
 * @param {function} props.onClose - Close callback
 */
const ObjectHistoryViewer = ({ objectId, objectType, objectName, onClose }) => {
  const { getHistory, getCommitDetails, formatChangeDescription } =
    useBudgetHistory();

  const [relevantHistory, setRelevantHistory] = useState([]);
  const [expandedCommits, setExpandedCommits] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Load history filtered for this specific object
  useEffect(() => {
    const loadObjectHistory = async () => {
      try {
        setLoading(true);

        // Get all history commits
        const allHistory = await getHistory({ limit: -1 });

        // Filter for commits that affected this specific object
        const objectHistory = [];

        for (const commitSummary of allHistory) {
          try {
            const commitDetails = await getCommitDetails(commitSummary.hash);

            // Check if any changes in this commit relate to our object
            const relevantChanges = commitDetails.changes.filter((change) => {
              // Match by object ID in the change path
              if (change.path && change.path.includes(objectId)) {
                return true;
              }

              // Match by object properties
              if (change.newValue && change.newValue.id === objectId) {
                return true;
              }
              if (change.oldValue && change.oldValue.id === objectId) {
                return true;
              }

              return false;
            });

            if (relevantChanges.length > 0) {
              objectHistory.push({
                ...commitSummary,
                relevantChanges,
                fullCommit: commitDetails.commit,
              });
            }
          } catch (error) {
            console.warn("Failed to load commit details:", error);
          }
        }

        setRelevantHistory(objectHistory);
      } catch (error) {
        console.error("Failed to load object history:", error);
      } finally {
        setLoading(false);
      }
    };

    if (objectId) {
      loadObjectHistory();
    }
  }, [objectId, getHistory, getCommitDetails]);

  const toggleCommitExpanded = (commitHash) => {
    setExpandedCommits((prev) => {
      const next = new Set(prev);
      if (next.has(commitHash)) {
        next.delete(commitHash);
      } else {
        next.add(commitHash);
      }
      return next;
    });
  };

  const getChangeIcon = (changeType) => {
    switch (changeType) {
      case "add":
        return <Plus className="h-3 w-3 text-green-600" />;
      case "delete":
        return <Minus className="h-3 w-3 text-red-600" />;
      case "modify":
        return <Edit3 className="h-3 w-3 text-blue-600" />;
      default:
        return <GitCommit className="h-3 w-3 text-gray-600" />;
    }
  };

  const getAuthorColor = (author) => {
    switch (author) {
      case "system":
        return "bg-gray-100 text-gray-700";
      case "user":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-purple-100 text-purple-700";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <History className="h-5 w-5 mr-3 text-blue-600" />
                {objectType} History: {objectName}
              </h2>
              <p className="text-gray-600 mt-1 text-sm">
                Complete change history for this {objectType.toLowerCase()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading history...</span>
            </div>
          )}

          {/* No History */}
          {!loading && relevantHistory.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No history found</p>
              <p className="text-sm mt-1">
                This {objectType.toLowerCase()} hasn't been modified yet
              </p>
            </div>
          )}

          {/* History List */}
          {!loading && relevantHistory.length > 0 && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <GitCommit className="h-4 w-4 text-blue-600 mr-2" />
                  <div className="text-sm text-blue-800">
                    <strong>Found {relevantHistory.length} changes</strong> to
                    this {objectType.toLowerCase()}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {relevantHistory.map((historyItem) => (
                  <div
                    key={historyItem.hash}
                    className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-all"
                  >
                    {/* Commit Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <GitCommit className="h-4 w-4 text-gray-600" />
                          <span className="font-mono text-sm text-gray-600">
                            {historyItem.shortHash}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getAuthorColor(historyItem.author)}`}
                          >
                            {historyItem.author}
                          </span>
                        </div>

                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {historyItem.message}
                        </p>

                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(historyItem.timestamp).toLocaleString()}
                        </div>
                      </div>

                      <button
                        onClick={() => toggleCommitExpanded(historyItem.hash)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded"
                      >
                        {expandedCommits.has(historyItem.hash) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Changes Summary */}
                    <div className="mb-3">
                      <div className="text-sm text-gray-700">
                        <strong>
                          {historyItem.relevantChanges.length} change
                          {historyItem.relevantChanges.length !== 1 ? "s" : ""}
                        </strong>{" "}
                        to this {objectType.toLowerCase()}:
                      </div>

                      <div className="mt-2 space-y-1">
                        {historyItem.relevantChanges.map((change, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 p-2 bg-gray-50 rounded text-sm"
                          >
                            {getChangeIcon(change.type)}
                            <div className="flex-1">
                              <p>{formatChangeDescription(change)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedCommits.has(historyItem.hash) && (
                      <div className="border-t border-gray-200 pt-3">
                        <div className="space-y-3">
                          {historyItem.relevantChanges.map((change, index) => (
                            <div
                              key={index}
                              className="bg-gray-50 p-3 rounded border"
                            >
                              <div className="font-medium text-sm text-gray-900 mb-2">
                                {formatChangeDescription(change)}
                              </div>

                              {/* Show diff details if available */}
                              {change.diff && (
                                <div className="space-y-2 text-xs">
                                  {Object.entries(change.diff).map(
                                    ([field, fieldChange]) => (
                                      <div key={field} className="font-mono">
                                        <div className="font-semibold text-gray-700">
                                          {field}:
                                        </div>
                                        <div className="ml-2 space-y-1">
                                          <div className="text-red-700">
                                            - {JSON.stringify(fieldChange.from)}
                                          </div>
                                          <div className="text-green-700">
                                            + {JSON.stringify(fieldChange.to)}
                                          </div>
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              )}

                              {/* Show full values for create/delete operations */}
                              {change.type === "add" && change.newValue && (
                                <div className="text-xs font-mono">
                                  <div className="font-semibold text-gray-700 mb-1">
                                    Created:
                                  </div>
                                  <div className="bg-green-50 p-2 rounded border">
                                    {JSON.stringify(change.newValue, null, 2)}
                                  </div>
                                </div>
                              )}

                              {change.type === "delete" && change.oldValue && (
                                <div className="text-xs font-mono">
                                  <div className="font-semibold text-gray-700 mb-1">
                                    Deleted:
                                  </div>
                                  <div className="bg-red-50 p-2 rounded border">
                                    {JSON.stringify(change.oldValue, null, 2)}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ObjectHistoryViewer;
