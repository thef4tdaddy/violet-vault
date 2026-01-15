import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../utils";
import useManualSync from "@/hooks/platform/sync/useManualSync";
import logger from "@/utils/core/common/logger";

/**
 * Sync result interface
 */
interface SyncResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Manual sync controls component props
 */
interface ManualSyncControlsProps {
  className?: string;
}

/**
 * Manual sync controls component for family budget collaboration
 * Allows explicit control over Dexie ↔ Firebase synchronization
 * Provides upload, download, and full bidirectional sync operations
 */
export const ManualSyncControls: React.FC<ManualSyncControlsProps> = ({ className = "" }) => {
  const {
    forceUploadSync,
    forceDownloadSync,
    forceFullSync,
    getSyncStatus,
    isUploadingSyncInProgress,
    isDownloadingSyncInProgress,
    isSyncInProgress,
    lastSyncTime,
    syncError,
    clearSyncError,
  } = useManualSync();

  const syncStatus = getSyncStatus();

  /**
   * Handle upload sync operation (Dexie → Firebase)
   */
  const handleUploadSync = async (): Promise<void> => {
    clearSyncError();
    const result: SyncResult = await forceUploadSync();
    if (result.success) {
      logger.info("✅ Upload sync completed:", { message: result.message });
    } else {
      logger.error("❌ Upload sync failed:", { error: result.error });
    }
  };

  /**
   * Handle download sync operation (Firebase → Dexie)
   */
  const handleDownloadSync = async (): Promise<void> => {
    clearSyncError();
    const result: SyncResult = await forceDownloadSync();
    if (result.success) {
      logger.info("✅ Download sync completed:", { message: result.message });
    } else {
      logger.error("❌ Download sync failed:", { error: result.error });
    }
  };

  /**
   * Handle full bidirectional sync operation
   */
  const handleFullSync = async (): Promise<void> => {
    clearSyncError();
    const result: SyncResult = await forceFullSync();
    if (result.success) {
      logger.info("✅ Full sync completed:", { message: result.message });
    } else {
      logger.error("❌ Full sync failed:", { error: result.error });
    }
  };

  /**
   * Format last sync timestamp into human-readable string
   */
  const formatLastSyncTime = (time: Date | null): string => {
    if (!time) return "Never";

    const now = new Date();
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return time.toLocaleDateString();
  };

  return (
    <div className={`w-full max-w-2xl border rounded-lg shadow-md ${className}`}>
      <div className="p-4 border-b">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          {React.createElement(getIcon("RefreshCw"), { className: "h-5 w-5" })}
          Manual Sync Controls
          <span
            className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
              syncStatus.isServiceRunning
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {syncStatus.isServiceRunning ? (
              <>
                {React.createElement(getIcon("Wifi"), {
                  className: "h-3 w-3 mr-1",
                })}
                Connected
              </>
            ) : (
              <>
                {React.createElement(getIcon("WifiOff"), {
                  className: "h-3 w-3 mr-1",
                })}
                Disconnected
              </>
            )}
          </span>
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Sync Error Alert */}
        {syncError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded flex items-start gap-2">
            {React.createElement(getIcon("AlertCircle"), {
              className: "h-4 w-4 text-red-600 mt-0.5",
            })}
            <div className="flex-1">
              <p className="text-sm text-red-800">{syncError}</p>
              <Button variant="icon" size="sm" className="ml-2 h-auto p-1" onClick={clearSyncError}>
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Sync Status Info */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {React.createElement(getIcon("Clock"), { className: "h-4 w-4" })}
            <span className="text-sm">Last sync: {formatLastSyncTime(lastSyncTime)}</span>
          </div>
          {lastSyncTime && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium border rounded bg-white">
              {React.createElement(getIcon("CheckCircle"), {
                className: "h-3 w-3 mr-1",
              })}
              Synced
            </span>
          )}
        </div>

        {/* Sync Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Upload Sync */}
          <Button
            onClick={handleUploadSync}
            disabled={isSyncInProgress || !syncStatus.isServiceRunning}
            variant="secondary"
            className="flex items-center gap-2"
          >
            {isUploadingSyncInProgress
              ? React.createElement(getIcon("RefreshCw"), {
                  className: "h-4 w-4 animate-spin",
                })
              : React.createElement(getIcon("Upload"), {
                  className: "h-4 w-4",
                })}
            Upload Changes
          </Button>

          {/* Download Sync */}
          <Button
            onClick={handleDownloadSync}
            disabled={isSyncInProgress || !syncStatus.isServiceRunning}
            variant="secondary"
            className="flex items-center gap-2"
          >
            {isDownloadingSyncInProgress
              ? React.createElement(getIcon("RefreshCw"), {
                  className: "h-4 w-4 animate-spin",
                })
              : React.createElement(getIcon("Download"), {
                  className: "h-4 w-4",
                })}
            Download Changes
          </Button>

          {/* Full Sync */}
          <Button
            onClick={handleFullSync}
            disabled={isSyncInProgress || !syncStatus.isServiceRunning}
            variant="primary"
            className="flex items-center gap-2"
          >
            {isSyncInProgress
              ? React.createElement(getIcon("RefreshCw"), {
                  className: "h-4 w-4 animate-spin",
                })
              : React.createElement(getIcon("RefreshCw"), {
                  className: "h-4 w-4",
                })}
            Full Sync
          </Button>
        </div>

        {/* Sync Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>Upload Changes:</strong> Send your local changes to the cloud for family members
            to see
          </p>
          <p>
            <strong>Download Changes:</strong> Get the latest changes made by family members
          </p>
          <p>
            <strong>Full Sync:</strong> Automatically determine the best sync direction based on
            data freshness
          </p>
        </div>

        {/* Service Status Details */}
        {syncStatus.serviceStatus && (
          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer">Advanced Status</summary>
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono">
              <pre>{JSON.stringify(syncStatus.serviceStatus, null, 2)}</pre>
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

export default ManualSyncControls;
