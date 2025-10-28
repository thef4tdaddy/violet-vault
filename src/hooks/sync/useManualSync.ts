import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../utils/common/queryClient";
import { cloudSyncService } from "../../services/cloudSyncService";
import logger from "../../utils/common/logger";

/**
 * Sync result type
 */
interface SyncResult {
  success: boolean;
  direction?: string;
  counts?: Record<string, number>;
  message?: string;
  error?: string;
}

/**
 * Service status type
 */
interface ServiceStatus {
  isRunning: boolean;
  lastSyncTime?: Date;
  error?: string;
  [key: string]: unknown;
}

/**
 * Sync status type
 */
interface SyncStatus {
  isServiceRunning: boolean;
  serviceStatus: ServiceStatus;
  isUploadingSyncInProgress: boolean;
  isDownloadingSyncInProgress: boolean;
  lastSyncTime: Date | null;
  syncError: string | null;
}

/**
 * Use manual sync hook return type
 */
interface UseManualSyncReturn {
  // Sync operations
  forceUploadSync: () => Promise<SyncResult>;
  forceDownloadSync: () => Promise<SyncResult>;
  forceFullSync: () => Promise<SyncResult>;

  // Status
  getSyncStatus: () => SyncStatus;
  isUploadingSyncInProgress: boolean;
  isDownloadingSyncInProgress: boolean;
  isSyncInProgress: boolean;
  lastSyncTime: Date | null;
  syncError: string | null;

  // Utils
  clearSyncError: () => void;
}

/**
 * Manual sync operations for family collaboration
 * Provides explicit sync controls for Dexie ↔ Firebase
 */
export const useManualSync = (): UseManualSyncReturn => {
  const queryClient = useQueryClient();
  const [isUploadingSyncInProgress, setIsUploadingSync] = useState(false);
  const [isDownloadingSyncInProgress, setIsDownloadingSync] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  /**
   * Force sync from Dexie to Firebase (upload local changes)
   */
  const forceUploadSync = useCallback(async (): Promise<SyncResult> => {
    if (isUploadingSyncInProgress || isDownloadingSyncInProgress) {
      logger.warn("Sync already in progress, skipping upload sync");
      return { success: false, error: "Sync already in progress" };
    }

    setIsUploadingSync(true);
    setSyncError(null);

    try {
      logger.info("🔄 Starting manual upload sync (Dexie → Firebase)...");

      // Check if cloud sync service is running
      if (!cloudSyncService?.isRunning) {
        throw new Error(
          "Cloud sync service is not running. Please check your connection and authentication."
        );
      }

      // Force a sync that prioritizes local data
      const syncResult = await cloudSyncService.forceSync();

      if (syncResult && syncResult.success) {
        setLastSyncTime(new Date());
        logger.info("✅ Manual upload sync completed successfully:", syncResult);

        return {
          success: true,
          direction: syncResult.direction,
          counts: syncResult.counts,
          message: "Local changes uploaded to cloud successfully",
        };
      } else {
        throw new Error(syncResult?.error || "Upload sync failed");
      }
    } catch (error) {
      logger.error("❌ Manual upload sync failed:", error);
      setSyncError((error as Error).message);
      return {
        success: false,
        error: (error as Error).message,
      };
    } finally {
      setIsUploadingSync(false);
    }
  }, [isUploadingSyncInProgress, isDownloadingSyncInProgress]);

  /**
   * Force sync from Firebase to Dexie to TanStack Query (download remote changes)
   */
  const forceDownloadSync = useCallback(async (): Promise<SyncResult> => {
    if (isUploadingSyncInProgress || isDownloadingSyncInProgress) {
      logger.warn("Sync already in progress, skipping download sync");
      return { success: false, error: "Sync already in progress" };
    }

    setIsDownloadingSync(true);
    setSyncError(null);

    try {
      logger.info("🔄 Starting manual download sync (Firebase → Dexie → TanStack)...");

      // Check if cloud sync service is running
      if (!cloudSyncService?.isRunning) {
        throw new Error(
          "Cloud sync service is not running. Please check your connection and authentication."
        );
      }

      // Force a sync and then invalidate all queries to refresh UI
      const syncResult = await cloudSyncService.forceSync();

      if (syncResult && syncResult.success) {
        // Invalidate all TanStack Query caches to force refresh from Dexie
        logger.info("🔄 Invalidating all TanStack Query caches...");
        await queryClient.invalidateQueries();

        // Also refetch critical data
        await Promise.all([
          queryClient.refetchQueries({ queryKey: queryKeys.envelopes }),
          queryClient.refetchQueries({ queryKey: queryKeys.transactions }),
          queryClient.refetchQueries({ queryKey: queryKeys.bills }),
          queryClient.refetchQueries({ queryKey: queryKeys.debts }),
          queryClient.refetchQueries({ queryKey: queryKeys.budgetMetadata }),
          queryClient.refetchQueries({ queryKey: queryKeys.budgetHistory }),
        ]);

        setLastSyncTime(new Date());
        logger.info("✅ Manual download sync completed successfully:", syncResult);

        return {
          success: true,
          direction: syncResult.direction,
          counts: syncResult.counts,
          message: "Remote changes downloaded and applied successfully",
        };
      } else {
        throw new Error(syncResult?.error || "Download sync failed");
      }
    } catch (error) {
      logger.error("❌ Manual download sync failed:", error);
      setSyncError((error as Error).message);
      return {
        success: false,
        error: (error as Error).message,
      };
    } finally {
      setIsDownloadingSync(false);
    }
  }, [isUploadingSyncInProgress, isDownloadingSyncInProgress, queryClient]);

  /**
   * Full bidirectional sync (attempts both directions intelligently)
   */
  const forceFullSync = useCallback(async (): Promise<SyncResult> => {
    if (isUploadingSyncInProgress || isDownloadingSyncInProgress) {
      logger.warn("Sync already in progress, skipping full sync");
      return { success: false, error: "Sync already in progress" };
    }

    try {
      logger.info("🔄 Starting full bidirectional sync...");

      // Let the cloud sync service determine the best direction
      const syncResult = await cloudSyncService.forceSync();

      if (syncResult && syncResult.success) {
        // Always invalidate queries after any sync to ensure UI is fresh
        logger.info("🔄 Invalidating all TanStack Query caches...");
        await queryClient.invalidateQueries();

        setLastSyncTime(new Date());
        logger.info("✅ Full bidirectional sync completed successfully:", syncResult);

        return {
          success: true,
          direction: syncResult.direction,
          counts: syncResult.counts,
          message: `Full sync completed (${syncResult.direction})`,
        };
      } else {
        throw new Error(syncResult?.error || "Full sync failed");
      }
    } catch (error) {
      logger.error("❌ Full sync failed:", error);
      setSyncError((error as Error).message);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }, [isUploadingSyncInProgress, isDownloadingSyncInProgress, queryClient]);

  /**
   * Get sync service status
   */
  const getSyncStatus = useCallback((): SyncStatus => {
    return {
      isServiceRunning: cloudSyncService?.isRunning || false,
      serviceStatus: cloudSyncService.getStatus() as ServiceStatus,
      isUploadingSyncInProgress,
      isDownloadingSyncInProgress,
      lastSyncTime,
      syncError,
    };
  }, [isUploadingSyncInProgress, isDownloadingSyncInProgress, lastSyncTime, syncError]);

  /**
   * Clear sync error
   */
  const clearSyncError = useCallback((): void => {
    setSyncError(null);
  }, []);

  return {
    // Sync operations
    forceUploadSync,
    forceDownloadSync,
    forceFullSync,

    // Status
    getSyncStatus,
    isUploadingSyncInProgress,
    isDownloadingSyncInProgress,
    isSyncInProgress: isUploadingSyncInProgress || isDownloadingSyncInProgress,
    lastSyncTime,
    syncError,

    // Utils
    clearSyncError,
  };
};

export default useManualSync;
