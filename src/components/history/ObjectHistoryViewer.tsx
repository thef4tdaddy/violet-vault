import { useState, useMemo, createElement } from "react";
import { useBudgetCommits } from "@/hooks/budgeting/useBudgetHistoryQuery";
import { getIcon } from "@/utils";
import {
  CommitCard,
  ViewerHeader,
  EmptyHistoryState,
  LoadingState,
} from "./ObjectHistoryViewerHelpers";

interface ObjectHistoryViewerProps {
  objectId: string;
  objectType: string;
  objectName: string;
  onClose: () => void;
}

/**
 * ObjectHistoryViewer - Shows history for a specific envelope, transaction, etc.
 */
interface _BudgetCommit {
  id?: string;
  hash: string;
  message: string;
  author?: string;
  timestamp?: string;
  changes?: Array<Record<string, unknown>>;
  deviceFingerprint?: string;
  parentHash?: string;
}

const ObjectHistoryViewer = ({
  objectId,
  objectType,
  objectName,
  onClose,
}: ObjectHistoryViewerProps) => {
  const { commits: allCommits = [], isLoading } = useBudgetCommits();

  const [expandedCommits, setExpandedCommits] = useState<Set<string>>(new Set());

  // Compute history filtered for this specific object
  const relevantHistory = useMemo((): _BudgetCommit[] => {
    if (!allCommits.length || isLoading) return [];

    // Filter for commits that likely affected this specific object
    const objectHistory = allCommits.filter((commit): commit is _BudgetCommit => {
      // For now, include all commits as we need commit details to filter properly
      // This could be optimized later by adding object-specific tracking
      return (
        commit.message &&
        (commit.message.toLowerCase().includes(objectType.toLowerCase()) ||
          commit.message.includes(objectId) ||
          commit.message.toLowerCase().includes(objectName?.toLowerCase() || ""))
      );
    });

    return objectHistory.slice(0, 20); // Limit to 20 most recent
  }, [allCommits, isLoading, objectId, objectType, objectName]);

  const toggleCommitExpanded = (commitHash: string) => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <ViewerHeader objectType={objectType} objectName={objectName} onClose={onClose} />

          {/* Loading State */}
          {isLoading && <LoadingState />}

          {/* No History */}
          {!isLoading && relevantHistory.length === 0 && (
            <EmptyHistoryState objectType={objectType} />
          )}

          {/* History List */}
          {!isLoading && relevantHistory.length > 0 && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center">
                  {createElement(getIcon("GitCommit"), {
                    className: "h-4 w-4 text-blue-600 mr-2",
                  })}
                  <div className="text-sm text-blue-800">
                    <strong>Found {relevantHistory.length} related changes</strong> for this{" "}
                    {objectType.toLowerCase()}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {relevantHistory.map((commit) => (
                  <CommitCard
                    key={commit.hash}
                    commit={commit}
                    isExpanded={expandedCommits.has(commit.hash)}
                    onToggleExpanded={toggleCommitExpanded}
                  />
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
