import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";

// Type definitions
interface HistoryCommit {
  hash: string;
  shortHash: string;
  author: string;
  message: string;
  timestamp: number;
}

interface HistoryListProps {
  loading: boolean;
  history: HistoryCommit[];
  selectedCommit: string | null;
  expandedCommits: Set<string>;
  handleCommitSelection: (hash: string) => void;
  handleRestoreFromHistory: (hash: string) => void;
  toggleCommitExpanded: (hash: string) => void;
  getAuthorColor: (author: string) => string;
}

const HistoryList: React.FC<HistoryListProps> = ({
  loading,
  history,
  selectedCommit,
  expandedCommits,
  handleCommitSelection,
  handleRestoreFromHistory,
  toggleCommitExpanded,
  getAuthorColor,
}) => {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">Recent Changes</h3>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading history...</span>
        </div>
      )}

      {!loading && history.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {React.createElement(getIcon("History"), {
            className: "h-12 w-12 mx-auto mb-3 opacity-50",
          })}
          <p>No history available</p>
          <p className="text-sm mt-1">History will appear as you make changes to your budget</p>
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
                    {React.createElement(getIcon("GitCommit"), {
                      className: "h-4 w-4 text-gray-600",
                    })}
                    <span className="font-mono text-sm text-gray-600">{commit.shortHash}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getAuthorColor(commit.author)}`}
                    >
                      {commit.author}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-gray-900 mb-1">{commit.message}</p>

                  <div className="flex items-center text-xs text-gray-500">
                    {React.createElement(getIcon("Calendar"), {
                      className: "h-3 w-3 mr-1",
                    })}
                    {new Date(commit.timestamp).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRestoreFromHistory(commit.hash);
                    }}
                    className="text-gray-400 hover:text-blue-600 p-1 rounded"
                    title="Restore to this state"
                  >
                    {React.createElement(getIcon("RotateCcw"), {
                      className: "h-4 w-4",
                    })}
                  </Button>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCommitExpanded(commit.hash);
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded"
                  >
                    {expandedCommits.has(commit.hash)
                      ? React.createElement(getIcon("ChevronDown"), {
                          className: "h-4 w-4",
                        })
                      : React.createElement(getIcon("ChevronRight"), {
                          className: "h-4 w-4",
                        })}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryList;
