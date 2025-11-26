import React from "react";
import { Button } from "@/components/ui";
import { useState } from "react";
import {
  useBudgetHistory,
  useBudgetCommitDetails,
} from "../../hooks/budgeting/useBudgetHistoryQuery";
import { getIcon } from "../../utils";
import {
  useBudgetHistoryViewerUI,
  useBudgetHistoryRestore,
  useBudgetHistoryUIHelpers,
} from "../../hooks/history/useBudgetHistoryViewer";
import HistoryHeader from "./viewer/HistoryHeader";
import IntegrityWarning from "./viewer/IntegrityWarning";
import HistoryStatistics from "./viewer/HistoryStatistics";
import HistoryControls from "./viewer/HistoryControls";
import HistoryList from "./viewer/HistoryList";
import ChangeDetails from "./viewer/ChangeDetails";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import { useModalAutoScroll } from "@/hooks/ui/useModalAutoScroll";

interface BudgetHistoryViewerProps {
  onClose: () => void;
}

const BudgetHistoryViewer = ({ onClose }: BudgetHistoryViewerProps) => {
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

  const { handleRestoreFromHistory } = useBudgetHistoryRestore(
    async (params: { commitHash: string; password: string }) => {
      await (
        restore as unknown as (params: { commitHash: string; password: string }) => Promise<void>
      )(params);
    }
  );
  const { getChangeIcon, getAuthorColor } = useBudgetHistoryUIHelpers();

  const [integrityCheck] = useState(null);

  // Get commit details for selected commit
  const { data: commitDetails, isLoading: commitDetailsLoading } =
    useBudgetCommitDetails(selectedCommit);

  const modalRef = useModalAutoScroll(true);
  const errorRef = useModalAutoScroll(hasError && Boolean(error));

  if (hasError && error) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div
          ref={errorRef}
          className="bg-white rounded-2xl w-full max-w-2xl max-h-96 overflow-y-auto border-2 border-black shadow-2xl my-auto"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                {React.createElement(getIcon("AlertTriangle"), {
                  className: "h-5 w-5 mr-2 text-red-600",
                })}
                History Error
              </h2>
              <ModalCloseButton onClick={onClose} />
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{typeof error === "string" ? error : error.message}</p>
              <Button
                onClick={onClose}
                className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl w-full max-w-7xl my-8 shadow-2xl border-2 border-black"
      >
        <div className="p-6">
          <HistoryHeader onClose={onClose} />

          <IntegrityWarning
            integrityCheck={integrityCheck}
            showIntegrityDetails={showIntegrityDetails}
            toggleIntegrityDetails={toggleIntegrityDetails}
          />

          <HistoryStatistics statistics={statistics} />

          <HistoryControls
            filter={filter}
            updateFilter={updateFilter}
            loading={loading}
            exportHistory={() => exportHistory({} as Record<string, unknown>)}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HistoryList
              loading={loading}
              history={history}
              selectedCommit={selectedCommit}
              expandedCommits={expandedCommits}
              handleCommitSelection={handleCommitSelection}
              handleRestoreFromHistory={handleRestoreFromHistory}
              toggleCommitExpanded={toggleCommitExpanded}
              getAuthorColor={getAuthorColor}
            />

            <ChangeDetails
              selectedCommit={selectedCommit}
              commitDetailsLoading={commitDetailsLoading}
              commitDetails={commitDetails ?? null}
              handleRestoreFromHistory={handleRestoreFromHistory}
              getChangeIcon={getChangeIcon}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetHistoryViewer;
