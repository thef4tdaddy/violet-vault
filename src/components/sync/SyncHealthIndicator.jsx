import React, { useEffect } from "react";
import { createPortal } from "react-dom";
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

  // Listen for close events from the portaled dropdown
  useEffect(() => {
    const handleCloseDropdown = () => {
      setShowDetails(false);
    };

    window.addEventListener('closeSyncDropdown', handleCloseDropdown);
    return () => {
      window.removeEventListener('closeSyncDropdown', handleCloseDropdown);
    };
  }, [setShowDetails]);

  const handleToggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const handleRefresh = () => {
    logger.info("🔄 Sync Health UI: Refresh button clicked");
    checkSyncHealth();
  };

  const handleRunValidation = () => {
    logger.info("🚀 Sync Health UI: Validation button clicked");
    runFullValidation();
  };

  const handleResetData = async () => {
    logger.info("🧹 Sync Health UI: Reset button clicked - showing confirmation");
    const confirmed = await confirm({
      title: "Reset Cloud Data",
      message:
        "This will reset all cloud data and re-upload from local storage. This action cannot be undone. Continue?",
      confirmText: "Reset Data",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (confirmed) {
      logger.info("🧹 Sync Health UI: Reset confirmed - calling resetCloudData");
      resetCloudData();
    } else {
      logger.info("🧹 Sync Health UI: Reset cancelled");
    }
  };

  return (
    <>
      <div className="relative inline-block" ref={dropdownRef}>
        <SyncStatusIndicator
          syncStatus={syncStatus}
          isBackgroundSyncing={isBackgroundSyncing}
          onClick={handleToggleDetails}
          showDetails={showDetails}
        />
      </div>

      {showDetails && createPortal(
        <SyncHealthDetails
          syncStatus={syncStatus}
          isBackgroundSyncing={isBackgroundSyncing}
          isRecovering={isRecovering}
          recoveryResult={recoveryResult}
          onRefresh={handleRefresh}
          onRunValidation={handleRunValidation}
          onResetData={handleResetData}
          buttonRef={dropdownRef}
        />,
        document.body
      )}
    </>
  );
};

export default SyncHealthIndicator;
