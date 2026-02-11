import React, { createElement } from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";
import { BudgetCommit } from "@/domain/schemas";
import ModalCloseButton from "@/components/ui/ModalCloseButton";

export const getAuthorColor = (author?: string) => {
  switch (author) {
    case "system":
      return "bg-gray-100 text-gray-700";
    case "user":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-purple-100 text-purple-700";
  }
};

interface CommitCardProps {
  commit: BudgetCommit;
  isExpanded: boolean;
  onToggleExpanded: (hash: string) => void;
}

export const CommitCard = ({ commit, isExpanded, onToggleExpanded }: CommitCardProps) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-all">
      {/* Commit Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {createElement(getIcon("GitCommit"), {
              className: "h-4 w-4 text-gray-600",
            })}
            <span className="font-mono text-sm text-gray-600">
              {commit.hash?.substring(0, 8) || "unknown"}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs ${getAuthorColor(commit.author)}`}>
              {commit.author || "unknown"}
            </span>
          </div>

          <p className="text-sm font-medium text-gray-900 mb-1">{commit.message || "No message"}</p>

          <div className="flex items-center text-xs text-gray-500">
            {React.createElement(getIcon("Calendar"), {
              className: "h-3 w-3 mr-1",
            })}
            {commit.timestamp ? new Date(commit.timestamp).toLocaleString() : "Unknown time"}
          </div>
        </div>

        <Button
          onClick={() => onToggleExpanded(commit.hash)}
          className="text-gray-400 hover:text-gray-600 p-1 rounded"
        >
          {isExpanded
            ? React.createElement(getIcon("ChevronDown"), {
                className: "h-4 w-4",
              })
            : React.createElement(getIcon("ChevronRight"), {
                className: "h-4 w-4",
              })}
        </Button>
      </div>

      {/* Basic commit info */}
      <div className="mb-3">
        <div className="text-sm text-gray-700">This commit may have affected the object</div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
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
  );
};

interface HeaderProps {
  objectType: string;
  objectName: string;
  onClose: () => void;
}

export const ViewerHeader = ({ objectType, objectName, onClose }: HeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          {createElement(getIcon("History"), {
            className: "h-5 w-5 mr-3 text-blue-600",
          })}
          {objectType} History: {objectName}
        </h2>
        <p className="text-gray-600 mt-1 text-sm">
          Complete change history for this {objectType.toLowerCase()}
        </p>
      </div>
      <ModalCloseButton onClick={onClose} />
    </div>
  );
};

interface EmptyStateProps {
  objectType: string;
}

export const EmptyHistoryState = ({ objectType }: EmptyStateProps) => {
  return (
    <div className="text-center py-8 text-gray-500">
      {createElement(getIcon("History"), {
        className: "h-12 w-12 mx-auto mb-3 opacity-50",
      })}
      <p className="font-medium">No history found</p>
      <p className="text-sm mt-1">
        This {objectType.toLowerCase()} hasn't been modified yet or budget history is not
        initialized
      </p>
    </div>
  );
};

export const LoadingState = () => {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-gray-600">Loading history...</span>
    </div>
  );
};
