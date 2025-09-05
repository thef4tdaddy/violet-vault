import React from "react";
import { useSyncHealthIndicator } from "../../hooks/sync/useSyncHealthIndicator";
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

  const handleToggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const handleRefresh = () => {
    checkSyncHealth();
  };

  const handleRunValidation = () => {
    runFullValidation();
  };

  const handleResetData = () => {
    if (window.confirm(
      "This will reset all cloud data and re-upload from local storage. " +
      "This action cannot be undone. Continue?"
    )) {
      resetCloudData();
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
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