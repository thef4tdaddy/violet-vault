import React from "react";
import { getIcon } from "../../utils";
import useTransactionArchiving from "../../hooks/common/useTransactionArchiving";
import {
  useTransactionArchivingUI,
  useTransactionArchivingProcess,
  useArchivingUIHelpers,
} from "../../hooks/settings/useTransactionArchiving";
import ArchivingHeader from "./archiving/ArchivingHeader";
import ArchivingStatusOverview from "./archiving/ArchivingStatusOverview";
import ArchivingConfiguration from "./archiving/ArchivingConfiguration";
import ArchivingPreviewResults from "./archiving/ArchivingPreviewResults";
import ArchivingProgress from "./archiving/ArchivingProgress";
import ArchivingActionButtons from "./archiving/ArchivingActionButtons";
import ArchivingResult from "./archiving/ArchivingResult";

/**
 * Transaction Archiving Management Component
 * Allows users to manage old transaction data while preserving analytics
 */
const TransactionArchiving = () => {
  const {
    archivingStatus,
    lastResult,
    isArchiving,
    archivingProgress,
    isLoading,
    executeArchiving,
    refreshInfo,
    needsArchiving,
  } = useTransactionArchiving();

  const {
    selectedPeriod,
    showAdvancedOptions,
    confirmArchiving,
    showPreview,
    previewData,
    handlePeriodChange,
    toggleAdvancedOptions,
    toggleConfirmArchiving,
    resetArchivingState,
    handlePreview,
    closePreview,
  } = useTransactionArchivingUI();

  const { handleArchive } = useTransactionArchivingProcess();
  const { getUrgencyColor, getUrgencyIcon } = useArchivingUIHelpers();

  const onArchiveClick = () => {
    if (!confirmArchiving) {
      toggleConfirmArchiving();
      return;
    }

    handleArchive(selectedPeriod, executeArchiving, {
      onSuccess: resetArchivingState,
      onError: () => toggleConfirmArchiving(),
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="animate-spin">
            {React.createElement(getIcon("RefreshCw"), {
              className: "h-5 w-5 text-purple-600",
            })}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Loading Transaction Archive Information...
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ArchivingHeader onRefresh={refreshInfo} isLoading={isLoading} />

      <ArchivingStatusOverview
        archivingStatus={archivingStatus}
        needsArchiving={needsArchiving}
        getUrgencyColor={getUrgencyColor}
        getUrgencyIcon={
          getUrgencyIcon as unknown as (
            urgency: string
          ) => React.ComponentType<{ className?: string }>
        }
      />

      {needsArchiving && (
        <ArchivingConfiguration
          selectedPeriod={selectedPeriod}
          isArchiving={isArchiving}
          showAdvancedOptions={showAdvancedOptions}
          handlePeriodChange={handlePeriodChange}
          toggleAdvancedOptions={toggleAdvancedOptions}
        />
      )}

      <ArchivingPreviewResults
        showPreview={showPreview}
        previewData={previewData}
        onClosePreview={closePreview}
      />

      <ArchivingProgress isArchiving={isArchiving} archivingProgress={archivingProgress} />

      <ArchivingActionButtons
        needsArchiving={needsArchiving}
        isArchiving={isArchiving}
        showPreview={showPreview}
        confirmArchiving={confirmArchiving}
        handlePreview={handlePreview}
        toggleConfirmArchiving={toggleConfirmArchiving}
        onArchiveClick={onArchiveClick}
      />

      <ArchivingResult lastResult={lastResult} />

      {/* No Archiving Needed */}
      {!needsArchiving && !isLoading && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-center py-8">
            {React.createElement(getIcon("CheckCircle"), {
              className: "h-12 w-12 text-green-600 mx-auto mb-4",
            })}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Archiving Needed</h3>
            <p className="text-gray-600">
              Your transaction data is well-optimized. Check back when you have more historical
              data.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionArchiving;
