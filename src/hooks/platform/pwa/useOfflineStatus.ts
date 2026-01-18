import { useState, useEffect, useCallback } from "react";
import logger from "@/utils/core/common/logger";
import backgroundSyncManager from "@/utils/platform/pwa/backgroundSync";

/**
 * Hook for offline/online status and user feedback
 * Enhanced for Issue #1372: Verify and Enhance Offline Handling
 */

interface OfflineStatus {
  isOnline: boolean;
  pendingSyncCount: number;
  readyToSyncCount: number;
  waitingForRetryCount: number;
  lastSyncTime: number | null;
  hasPendingOperations: boolean;
}

export const useOfflineStatus = () => {
  const [status, setStatus] = useState<OfflineStatus>(() => {
    const syncStatus = backgroundSyncManager.getSyncStatus();
    return {
      isOnline: navigator.onLine,
      pendingSyncCount: syncStatus.pendingCount,
      readyToSyncCount: syncStatus.readyToSync ?? 0,
      waitingForRetryCount: syncStatus.waitingForRetry ?? 0,
      lastSyncTime: null,
      hasPendingOperations: syncStatus.pendingCount > 0,
    };
  });

  const updateStatus = useCallback(() => {
    const syncStatus = backgroundSyncManager.getSyncStatus();
    setStatus({
      isOnline: navigator.onLine,
      pendingSyncCount: syncStatus.pendingCount,
      readyToSyncCount: syncStatus.readyToSync ?? 0,
      waitingForRetryCount: syncStatus.waitingForRetry ?? 0,
      lastSyncTime: Date.now(),
      hasPendingOperations: syncStatus.pendingCount > 0,
    });
  }, []);

  useEffect(() => {
    // Listen for online/offline events
    const handleOnline = () => {
      logger.info("🌐 Device came online");
      updateStatus();
      // Trigger sync when coming online
      backgroundSyncManager.syncPendingOperations().catch((error) => {
        logger.error("Failed to sync pending operations on online", error);
      });
    };

    const handleOffline = () => {
      logger.info("📱 Device went offline");
      updateStatus();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Poll sync status periodically when offline or has pending operations
    const pollInterval = setInterval(() => {
      if (!navigator.onLine || status.hasPendingOperations) {
        updateStatus();
      }
    }, 5000); // Poll every 5 seconds

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(pollInterval);
    };
  }, [updateStatus, status.hasPendingOperations]);

  // Initial status update (outside effect to avoid setState in effect warning)
  useEffect(() => {
    updateStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const retrySync = useCallback(async () => {
    try {
      await backgroundSyncManager.syncPendingOperations();
      updateStatus();
    } catch (error) {
      logger.error("Failed to retry sync", error);
      throw error;
    }
  }, [updateStatus]);

  return {
    ...status,
    retrySync,
    refreshStatus: updateStatus,
  };
};
