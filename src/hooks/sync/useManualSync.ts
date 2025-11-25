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
  const [isDownloadingSyncInProgress, _setIsDownloadingSync] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Helper function to process sync results (pure function, no dependencies)
  const processSyncResult = (syncResult: unknown, defaultDirection: string) => {
    const direction =
      "direction" in (syncResult as Record<string, unknown>)
        ? (syncResult as { direction: string }).direction
        : defaultDirection;
    const counts =
      "counts" in (syncResult as Record<string, unknown>)
        ? ((syncResult as { counts: Record<string, number> }).counts as Record<string, number>)
        : undefined;
    return { direction, counts };
  };

  const executeSync = useCallback(
    async (direction: string, onSuccess?: () => Promise<void>): Promise<SyncResult> => {
      if (isUploadingSyncInProgress || isDownloadingSyncInProgress) {
        return { success: false, error: "Sync already in progress" };
      }
      setIsUploadingSync(true);
      setSyncError(null);
      try {
        if (!cloudSyncService?.isRunning) {
          throw new Error(
            "Cloud sync service is not running. Please check your connection and authentication."
          );
        }
        const syncResult = await cloudSyncService.forceSync();
        if (syncResult && syncResult.success) {
          setLastSyncTime(new Date());
          const { direction: resultDirection, counts } = processSyncResult(syncResult, direction);
          if (onSuccess) await onSuccess();
          return {
            success: true,
            direction: resultDirection,
            counts,
            message: `Sync completed (${direction})`,
          };
        }
        throw new Error(syncResult?.error || `${direction} sync failed`);
      } catch (error) {
        setSyncError((error as Error).message);
        return { success: false, error: (error as Error).message };
      } finally {
        setIsUploadingSync(false);
      }
    },
    [isUploadingSyncInProgress, isDownloadingSyncInProgress]
  );

  const forceUploadSync = useCallback(async (): Promise<SyncResult> => {
    logger.info("🔄 Starting manual upload sync (Dexie → Firebase)...");
    const result = await executeSync("upload");
    if (result.success) {
      logger.info("✅ Manual sync completed (upload)", {
        direction: result.direction || "upload",
        changesUploaded: result.counts ?? {},
      });
      return { ...result, message: "Local changes uploaded to cloud successfully" };
    }
    logger.error("❌ Manual upload sync failed:", result.error);
    return result;
  }, [executeSync]);

  const forceDownloadSync = useCallback(async (): Promise<SyncResult> => {
    logger.info("🔄 Starting manual download sync (Firebase → Dexie → TanStack)...");
    const refetchQueries = async () => {
      await queryClient.invalidateQueries();
      await Promise.all([
        queryClient.refetchQueries({ queryKey: queryKeys.envelopes }),
        queryClient.refetchQueries({ queryKey: queryKeys.transactions }),
        queryClient.refetchQueries({ queryKey: queryKeys.bills }),
        queryClient.refetchQueries({ queryKey: queryKeys.debts }),
        queryClient.refetchQueries({ queryKey: queryKeys.budgetMetadata }),
        queryClient.refetchQueries({ queryKey: queryKeys.budgetHistory }),
      ]);
    };
    const result = await executeSync("download", refetchQueries);
    if (result.success) {
      logger.info("✅ Manual download sync completed successfully");
      return { ...result, message: "Remote changes downloaded and applied successfully" };
    }
    logger.error("❌ Manual download sync failed:", result.error);
    return result;
  }, [executeSync, queryClient]);

  const forceFullSync = useCallback(async (): Promise<SyncResult> => {
    const invalidateAll = async () => {
      await queryClient.invalidateQueries();
    };
    const result = await executeSync("full", invalidateAll);
    if (result.success) {
      logger.info("✅ Full bidirectional sync completed successfully");
    } else {
      logger.error("❌ Full sync failed:", result.error);
    }
    return result;
  }, [executeSync, queryClient]);

  const getSyncStatus = useCallback((): SyncStatus => {
    return {
      isServiceRunning: cloudSyncService?.isRunning || false,
      serviceStatus: cloudSyncService.getStatus() as unknown as ServiceStatus,
      isUploadingSyncInProgress,
      isDownloadingSyncInProgress,
      lastSyncTime,
      syncError,
    };
  }, [isUploadingSyncInProgress, isDownloadingSyncInProgress, lastSyncTime, syncError]);

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
