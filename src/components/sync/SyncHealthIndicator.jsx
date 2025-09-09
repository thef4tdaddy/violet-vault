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
    logger.info("🔄 Sync Health UI: checkSyncHealth function type:", typeof checkSyncHealth);
    
    // Test if the function exists and is callable
    if (typeof checkSyncHealth === 'function') {
      logger.info("🔄 Sync Health UI: Calling checkSyncHealth...");
      checkSyncHealth();
      logger.info("🔄 Sync Health UI: checkSyncHealth called successfully");
    } else {
      logger.error("🔄 Sync Health UI: checkSyncHealth is not a function!", checkSyncHealth);
    }
  };

  const handleRunValidation = () => {
    logger.info("🚀 Sync Health UI: Validation button clicked");
    logger.info("🚀 Sync Health UI: runFullValidation function type:", typeof runFullValidation);
    logger.info("🚀 Sync Health UI: window.runMasterSyncValidation available:", typeof window.runMasterSyncValidation);
    
    // Test if the function exists and is callable
    if (typeof runFullValidation === 'function') {
      logger.info("🚀 Sync Health UI: Calling runFullValidation...");
      runFullValidation();
      logger.info("🚀 Sync Health UI: runFullValidation called successfully");
    } else {
      logger.error("🚀 Sync Health UI: runFullValidation is not a function!", runFullValidation);
    }
  };

  const handleResetData = async () => {
    logger.info("🧹 Sync Health UI: Reset button clicked - showing confirmation");
    logger.info("🧹 Sync Health UI: resetCloudData function type:", typeof resetCloudData);
    logger.info("🧹 Sync Health UI: window.forceCloudDataReset available:", typeof window.forceCloudDataReset);
    
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
      if (typeof resetCloudData === 'function') {
        logger.info("🧹 Sync Health UI: Calling resetCloudData...");
        resetCloudData();
        logger.info("🧹 Sync Health UI: resetCloudData called successfully");
      } else {
        logger.error("🧹 Sync Health UI: resetCloudData is not a function!", resetCloudData);
      }
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
