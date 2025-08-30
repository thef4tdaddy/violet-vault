import React, { useState, useEffect } from "react";
import { useBudgetCommits } from "../../hooks/budgeting/useBudgetHistoryQuery";
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
  const { data: allCommits = [], isLoading } = useBudgetCommits();

  const [relevantHistory, setRelevantHistory] = useState([]);
  const [expandedCommits, setExpandedCommits] = useState(new Set());

  // Load history filtered for this specific object
  useEffect(() => {
    if (!allCommits.length || isLoading) return;

    // Filter for commits that likely affected this specific object
    const objectHistory = allCommits.filter((commit) => {
      // For now, include all commits as we need commit details to filter properly
      // This could be optimized later by adding object-specific tracking
      return (
        commit.message &&
        (commit.message.toLowerCase().includes(objectType.toLowerCase()) ||
          commit.message.includes(objectId) ||
          commit.message.toLowerCase().includes(objectName?.toLowerCase() || ""))
      );
    });

    setRelevantHistory(objectHistory.slice(0, 20)); // Limit to 20 most recent
  }, [allCommits, isLoading, objectId, objectType, objectName]);

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

  const formatChangeDescription = (change) => {
    // Simple change description formatter
    if (change.type === "add") return `Added ${objectType.toLowerCase()}`;
    if (change.type === "delete") return `Deleted ${objectType.toLowerCase()}`;
    if (change.type === "modify") return `Modified ${objectType.toLowerCase()}`;
    return `Changed ${objectType.toLowerCase()}`;
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
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading history...</span>
            </div>
          )}

          {/* No History */}
          {!isLoading && relevantHistory.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No history found</p>
              <p className="text-sm mt-1">
                This {objectType.toLowerCase()} hasn't been modified yet or budget history is not
                initialized
              </p>
            </div>
          )}

          {/* History List */}
          {!isLoading && relevantHistory.length > 0 && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <GitCommit className="h-4 w-4 text-blue-600 mr-2" />
                  <div className="text-sm text-blue-800">
                    <strong>Found {relevantHistory.length} related changes</strong> for this{" "}
                    {objectType.toLowerCase()}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {relevantHistory.map((commit) => (
                  <div
                    key={commit.hash}
                    className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-all"
                  >
                    {/* Commit Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <GitCommit className="h-4 w-4 text-gray-600" />
                          <span className="font-mono text-sm text-gray-600">
                            {commit.hash?.substring(0, 8) || "unknown"}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getAuthorColor(commit.author)}`}
                          >
                            {commit.author || "unknown"}
                          </span>
                        </div>

                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {commit.message || "No message"}
                        </p>

                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {commit.timestamp
                            ? new Date(commit.timestamp).toLocaleString()
                            : "Unknown time"}
                        </div>
                      </div>

                      <button
                        onClick={() => toggleCommitExpanded(commit.hash)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded"
                      >
                        {expandedCommits.has(commit.hash) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Basic commit info */}
                    <div className="mb-3">
                      <div className="text-sm text-gray-700">
                        This commit may have affected the {objectType.toLowerCase()}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedCommits.has(commit.hash) && (
                      <div className="border-t border-gray-200 pt-3">
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="text-sm text-gray-600">
                            <strong>Commit Hash:</strong> {commit.hash}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            <strong>Device:</strong> {commit.deviceFingerprint || "Unknown"}
                          </div>
                          {commit.parentHash && (
                            <div className="text-sm text-gray-600 mt-1">
                              <strong>Parent:</strong> {commit.parentHash.substring(0, 8)}
                            </div>
                          )}
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
