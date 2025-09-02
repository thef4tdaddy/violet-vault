import React from "react";
import {
  useBudgetHistory,
  useBudgetCommitDetails,
} from "../../hooks/budgeting/useBudgetHistoryQuery";
import { globalToast } from "../../stores/ui/toastStore";
import {
  History,
  GitCommit,
  Download,
  RotateCcw,
  Trash2,
  Calendar,
  User,
  FileText,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Clock,
  Plus,
  Minus,
  Edit3,
  Shield,
  ShieldAlert,
} from "lucide-react";
import IntegrityStatusIndicator from "./IntegrityStatusIndicator";
import HelpTooltip from "../ui/HelpTooltip";
import {
  useBudgetHistoryViewerUI,
  useBudgetHistoryRestore,
  useBudgetHistoryUIHelpers,
} from "../../hooks/history/useBudgetHistoryViewer";

const BudgetHistoryViewer = ({ onClose }) => {
  const {
    commits: history,
    isLoading: loading,
    isError: hasError,
    error,
    stats: statistics,
    restore,
    exportHistory,
  } = useBudgetHistory({ limit: 50 });

  const {
    selectedCommit,
    expandedCommits,
    filter,
    showIntegrityDetails,
    handleCommitSelection,
    toggleCommitExpanded,
    updateFilter,
    toggleIntegrityDetails,
  } = useBudgetHistoryViewerUI();

  const { handleRestoreFromHistory } = useBudgetHistoryRestore(restore);
  const { getChangeIcon, getAuthorColor } = useBudgetHistoryUIHelpers();

  const [integrityCheck] = useState(null);

  // Get commit details for selected commit
  const { data: commitDetails, isLoading: commitDetailsLoading } =
    useBudgetCommitDetails(selectedCommit);

  // Note: Data loading is now handled automatically by TanStack Query hooks

  if (hasError && error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl w-full max-w-2xl max-h-96 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                History Error
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error.message || error}</p>
              <button
                onClick={onClose}
                className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-7xl my-8 shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                <History className="h-6 w-6 mr-3 text-blue-600" />
                Change History
                <HelpTooltip
                  title="Budget History"
                  content="Track all changes to your budget with git-like version control. Each change creates a commit that can be restored or analyzed for family collaboration."
                  position="right"
                />
              </h2>
              <p className="text-gray-600 mt-1">
                View and restore previous versions of your budget
              </p>

              {/* Integrity Status Indicator */}
              <div className="mt-3">
                <IntegrityStatusIndicator />
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>

          {/* Integrity Warning */}
          {integrityCheck && !integrityCheck.valid && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <ShieldAlert className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-900 mb-2">
                    History Integrity Warning
                  </h3>
                  <p className="text-sm text-red-800 mb-3">
                    {integrityCheck.message}
                  </p>

                  {integrityCheck.details && (
                    <div className="space-y-2">
                      <button
                        onClick={toggleIntegrityDetails}
                        className="text-sm text-red-700 hover:text-red-900 underline"
                      >
                        {showIntegrityDetails ? "Hide Details" : "Show Details"}
                      </button>

                      {showIntegrityDetails && (
                        <div className="bg-red-100 p-3 rounded border border-red-200 text-sm">
                          <div className="space-y-2">
                            <div>
                              <strong>Broken at commit:</strong>{" "}
                              {integrityCheck.brokenAt}
                            </div>

                            {integrityCheck.details.lastValidCommit && (
                              <div>
                                <strong>Last valid commit:</strong>
                                <div className="ml-2 font-mono text-xs">
                                  {integrityCheck.details.lastValidCommit.hash.substring(
                                    0,
                                    8,
                                  )}{" "}
                                  -
                                  {
                                    integrityCheck.details.lastValidCommit
                                      .message
                                  }
                                </div>
                              </div>
                            )}

                            {integrityCheck.details.suspiciousCommit && (
                              <div>
                                <strong>Suspicious commit:</strong>
                                <div className="ml-2 font-mono text-xs">
                                  {
                                    integrityCheck.details.suspiciousCommit
                                      .shortHash
                                  }{" "}
                                  -
                                  {
                                    integrityCheck.details.suspiciousCommit
                                      .message
                                  }
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-3 text-xs text-red-700">
                    ⚠️ Your budget history may have been tampered with. Consider
                    exporting your data and investigating recent changes.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Integrity Success */}
          {integrityCheck &&
            integrityCheck.valid &&
            integrityCheck.totalCommits > 0 && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 text-green-600 mr-2" />
                  <div className="text-sm text-green-800">
                    <strong>✓ History Verified:</strong>{" "}
                    {integrityCheck.message}
                  </div>
                </div>
              </div>
            )}

          {/* Statistics */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <GitCommit className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm text-blue-700">Total Changes</p>
                    <p className="text-lg font-semibold text-blue-900">
                      {statistics.totalCommits}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm text-green-700">Latest Change</p>
                    <p className="text-xs text-green-900">
                      {statistics.dateRange?.newest
                        ? new Date(
                            statistics.dateRange.newest,
                          ).toLocaleDateString()
                        : "None"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-purple-600 mr-2" />
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
                  <FileText className="h-5 w-5 text-gray-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-700">Storage Size</p>
                    <p className="text-xs text-gray-900">
                      {Math.round(statistics.storageSize / 1024)} KB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
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
                  onChange={(e) =>
                    updateFilter({ limit: parseInt(e.target.value) })
                  }
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
                <Shield className="h-4 w-4 mr-2" />
                Verify Integrity
              </button>

              <button
                onClick={() => exportHistory()}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center text-sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Change History List */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Changes
              </h3>

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading history...</span>
                </div>
              )}

              {!loading && history.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No history available</p>
                  <p className="text-sm mt-1">
                    History will appear as you make changes to your budget
                  </p>
                </div>
              )}

              {!loading && history.length > 0 && (
                <div className="space-y-2">
                  {history.map((commit) => (
                    <div
                      key={commit.hash}
                      className={`border rounded-lg p-3 transition-all cursor-pointer hover:shadow-md ${
                        selectedCommit === commit.hash
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                      onClick={() => handleCommitSelection(commit.hash)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <GitCommit className="h-4 w-4 text-gray-600" />
                            <span className="font-mono text-sm text-gray-600">
                              {commit.shortHash}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${getAuthorColor(commit.author)}`}
                            >
                              {commit.author}
                            </span>
                          </div>

                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {commit.message}
                          </p>

                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(commit.timestamp).toLocaleString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestoreFromHistory(commit.hash);
                            }}
                            className="text-gray-400 hover:text-blue-600 p-1 rounded"
                            title="Restore to this state"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCommitExpanded(commit.hash);
                            }}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded"
                          >
                            {expandedCommits.has(commit.hash) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Change Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Change Details
              </h3>

              {!selectedCommit && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Select a change to view details</p>
                </div>
              )}

              {selectedCommit && commitDetailsLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading details...</span>
                </div>
              )}

              {selectedCommit && commitDetails && (
                <div className="border rounded-lg p-4 bg-white">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <GitCommit className="h-5 w-5 text-gray-600" />
                      <span className="font-mono text-sm text-gray-600">
                        {commitDetails.commit.hash?.substring(0, 8)}
                      </span>
                    </div>

                    <h4 className="font-medium text-gray-900 mb-1">
                      {commitDetails.commit.message}
                    </h4>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>Author:</strong> {commitDetails.commit.author}
                      </p>
                      <p>
                        <strong>Date:</strong>{" "}
                        {new Date(
                          commitDetails.commit.timestamp,
                        ).toLocaleString()}
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
                      <p className="text-gray-500 text-sm">
                        No changes recorded
                      </p>
                    )}

                    {commitDetails.changes.length > 0 && (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {commitDetails.changes.map((change, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 p-2 bg-gray-50 rounded text-sm"
                          >
                            {getChangeIcon(change.type)}
                            <div className="flex-1">
                              <p className="font-medium">
                                {change.description ||
                                  `${change.changeType} ${change.entityType}`}
                              </p>
                              {change.diff && (
                                <div className="mt-1 text-xs text-gray-600">
                                  {Object.keys(change.diff).map((field) => (
                                    <div key={field}>
                                      <strong>{field}:</strong>{" "}
                                      {JSON.stringify(change.diff[field].from)}{" "}
                                      → {JSON.stringify(change.diff[field].to)}
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
                    <button
                      onClick={() => handleRestoreFromHistory(selectedCommit)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restore to This State
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetHistoryViewer;
