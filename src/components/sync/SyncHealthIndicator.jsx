import React from "react";
import { useSyncHealthIndicator } from "../../hooks/sync/useSyncHealthIndicator";
import { useConfirm } from "../../hooks/common/useConfirm";
import SyncStatusIndicator from "./health/SyncStatusIndicator";
import SyncHealthDetails from "./health/SyncHealthDetails";
import logger from "../../utils/common/logger";

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
    logger.info("🔄 Direct button test - calling checkSyncHealth directly");
    checkSyncHealth();
  };

  const handleRunValidation = () => {
    logger.info("🚀 Direct button test - calling runFullValidation directly"); 
    runFullValidation();
  };

  const handleResetData = async () => {
    logger.info("🧹 Direct button test - showing confirmation");
    const confirmed = await confirm({
      title: "Reset Cloud Data",
      message: "This will reset all cloud data and re-upload from local storage. This action cannot be undone. Continue?",
      confirmText: "Reset Data",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (confirmed) {
      logger.info("🧹 Direct button test - calling resetCloudData directly");
      resetCloudData();
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef} style={{zIndex: 999999}}>
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
