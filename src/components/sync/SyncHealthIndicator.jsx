import React from "react";
import { useSyncHealthIndicator } from "../../hooks/sync/useSyncHealthIndicator";
import { useConfirm } from "../../hooks/common/useConfirm";
import SyncStatusIndicator from "./health/SyncStatusIndicator";
import SyncHealthDetails from "./health/SyncHealthDetails";

const SyncHealthIndicator = () => {
  const {
    syncStatus,
    showDetails,
    isBackgroundSyncing,
    isRecovering,
    recoveryResult,
    dropdownRef,
    setShowDetails,
    checkSyncHealth,
    runFullValidation,
    resetCloudData,
  } = useSyncHealthIndicator();
  const confirm = useConfirm();

  const handleToggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const handleRefresh = () => {
    checkSyncHealth();
  };

  const handleRunValidation = () => {
    runFullValidation();
  };

  const handleResetData = async () => {
    const confirmed = await confirm({
      title: "Reset Cloud Data",
      message:
        "This will reset all cloud data and re-upload from local storage. This action cannot be undone. Continue?",
      confirmText: "Reset Data",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (confirmed) {
      resetCloudData();
    }
  };

  return (
    <div className="relative inline-block z-[99999]" ref={dropdownRef}>
      <SyncStatusIndicator
        syncStatus={syncStatus}
        isBackgroundSyncing={isBackgroundSyncing}
        onClick={handleToggleDetails}
        showDetails={showDetails}
      />

      {showDetails && (
        <SyncHealthDetails
          syncStatus={syncStatus}
          isBackgroundSyncing={isBackgroundSyncing}
          isRecovering={isRecovering}
          recoveryResult={recoveryResult}
          onRefresh={handleRefresh}
          onRunValidation={handleRunValidation}
          onResetData={handleResetData}
        />
      )}
    </div>
  );
};

export default SyncHealthIndicator;
