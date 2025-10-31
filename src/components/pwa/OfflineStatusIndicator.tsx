import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../utils";
import useUiStore from "../../stores/ui/uiStore";
import backgroundSyncManager from "../../utils/pwa/backgroundSync";
import logger from "../../utils/common/logger";
import { useConfirm } from "../../hooks/common/useConfirm";

/**
 * Pending operation interface
 */
interface PendingOperation {
  id?: string | number | unknown;
  type?: string | unknown;
  retryCount?: number | unknown;
  timestamp?: unknown;
  lastError?: unknown;
}

/**
 * Sync status interface
 */
interface SyncStatus {
  pendingCount: number;
  isOnline: boolean;
  pendingOperations?: PendingOperation[];
}

/**
 * Enhanced Offline Status Indicator
 * Shows connection status, pending sync operations, and offline capabilities
 */
const OfflineStatusIndicator: React.FC = () => {
  const isOnline = useUiStore((state) => state.isOnline);
  const confirm = useConfirm();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    pendingCount: 0,
    isOnline: true,
  });
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Update sync status periodically
  useEffect(() => {
    const updateSyncStatus = () => {
      try {
        const status = backgroundSyncManager.getSyncStatus();
        setSyncStatus(status);

        // Track last successful sync
        if (status.isOnline && status.pendingCount === 0) {
          setLastSyncTime(new Date());
        }
      } catch (error) {
        logger.warn("Failed to get sync status:", error);
      }
    };

    // Initial status
    updateSyncStatus();

    // Update every 5 seconds
    const interval = setInterval(updateSyncStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  // Auto-hide details after 10 seconds
  useEffect(() => {
    if (showDetails) {
      const timeout = setTimeout(() => {
        setShowDetails(false);
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [showDetails]);

  const getStatusColor = (): string => {
    if (!isOnline) return "bg-red-500";
    if (syncStatus.pendingCount > 0) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusText = (): string => {
    if (!isOnline) return "Offline";
    if (syncStatus.pendingCount > 0) return `Syncing ${syncStatus.pendingCount}`;
    return "Online";
  };

  const formatTime = (date: Date | null): string => {
    if (!date) return "Never";
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const handleToggleDetails = (): void => {
    setShowDetails(!showDetails);
  };

  if (isOnline && syncStatus.pendingCount === 0 && !showDetails) {
    // Only show minimal indicator when everything is working normally
    return (
      <div className="fixed bottom-4 right-4 z-30 cursor-pointer" onClick={handleToggleDetails}>
        <div
          className={`w-3 h-3 rounded-full ${getStatusColor()} shadow-lg transition-all duration-300 hover:scale-125`}
        ></div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* Status Indicator */}
      <div
        className="flex items-center space-x-2 bg-black/80 text-white px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm cursor-pointer transition-all duration-300 hover:bg-black/90"
        onClick={handleToggleDetails}
      >
        <div className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`}></div>
        <span className="text-sm font-medium">{getStatusText()}</span>

        {syncStatus.pendingCount > 0 && (
          <div className="animate-spin">
            {React.createElement(getIcon("RefreshCw"), {
              className: "w-3 h-3",
            })}
          </div>
        )}
      </div>

      {/* Detailed Status Panel */}
      {showDetails && (
        <div className="absolute bottom-12 right-0 w-80 bg-white rounded-lg border-2 border-black shadow-xl p-4 transform transition-all duration-300 scale-100">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-black text-sm">
              {React.createElement(getIcon("Wifi"), {
                className: "w-4 h-4 inline mr-1",
              })}
              Connection Status
            </h3>
            <Button
              onClick={() => setShowDetails(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              {React.createElement(getIcon("X"), { className: "w-4 h-4" })}
            </Button>
          </div>

          {/* Connection Info */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Status:</span>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
                <span className="font-medium">{getStatusText()}</span>
              </div>
            </div>

            {syncStatus.pendingCount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pending Operations:</span>
                <span className="font-medium text-yellow-600">{syncStatus.pendingCount}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Last Sync:</span>
              <span className="font-medium">{formatTime(lastSyncTime)}</span>
            </div>
          </div>

          {/* Offline Capabilities */}
          {!isOnline && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <h4 className="font-medium text-black text-sm mb-2 flex items-center">
                {React.createElement(getIcon("CheckCircle"), {
                  className: "w-4 h-4 text-green-600 mr-1",
                })}
                Available Offline
              </h4>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex items-center space-x-1">
                  {React.createElement(getIcon("PieChart"), {
                    className: "w-3 h-3",
                  })}
                  <span>View budget and envelopes</span>
                </div>
                <div className="flex items-center space-x-1">
                  {React.createElement(getIcon("CreditCard"), {
                    className: "w-3 h-3",
                  })}
                  <span>Add transactions (queued for sync)</span>
                </div>
                <div className="flex items-center space-x-1">
                  {React.createElement(getIcon("List"), {
                    className: "w-3 h-3",
                  })}
                  <span>Review transaction history</span>
                </div>
                <div className="flex items-center space-x-1">
                  {React.createElement(getIcon("BarChart"), {
                    className: "w-3 h-3",
                  })}
                  <span>View analytics and trends</span>
                </div>
              </div>
            </div>
          )}

          {/* Pending Operations Details */}
          {syncStatus.pendingOperations && syncStatus.pendingOperations.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <h4 className="font-medium text-black text-sm mb-2 flex items-center">
                {React.createElement(getIcon("Clock"), {
                  className: "w-4 h-4 text-yellow-600 mr-1",
                })}
                Pending Operations
              </h4>
              <div className="max-h-24 overflow-y-auto space-y-1">
                {syncStatus.pendingOperations.slice(0, 3).map((op, index) => {
                  const opId = typeof op.id === 'string' || typeof op.id === 'number' ? op.id : index;
                  const opType = typeof op.type === 'string' ? op.type : "Operation";
                  const retryCount = typeof op.retryCount === 'number' ? op.retryCount : 0;
                  
                  return (
                    <div
                      key={opId}
                      className="text-xs text-gray-600 flex items-center justify-between"
                    >
                      <span>{opType}</span>
                      <span className="text-yellow-600">
                        {retryCount > 0 ? `Retry ${retryCount}` : "Queued"}
                      </span>
                    </div>
                  );
                })}
                {syncStatus.pendingOperations.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{syncStatus.pendingOperations.length - 3} more...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 pt-3 border-t border-gray-200 flex space-x-2">
            {syncStatus.pendingCount > 0 && isOnline && (
              <Button
                onClick={() => {
                  backgroundSyncManager.syncPendingOperations();
                  setShowDetails(false);
                }}
                className="flex-1 bg-blue-600 text-white text-xs font-medium py-2 px-3 rounded border border-black shadow-sm hover:bg-blue-700 transition-colors"
              >
                Sync Now
              </Button>
            )}

            <Button
              onClick={async () => {
                // Clear any failed operations after confirmation
                const confirmed = await confirm({
                  title: "Clear Queue",
                  message: "Clear failed operations? This cannot be undone.",
                  destructive: true,
                  confirmLabel: "Clear Queue",
                  cancelLabel: "Cancel",
                });

                if (confirmed) {
                  backgroundSyncManager.clearPendingOperations();
                  setShowDetails(false);
                }
              }}
              className="flex-1 bg-gray-600 text-white text-xs font-medium py-2 px-3 rounded border border-black shadow-sm hover:bg-gray-700 transition-colors"
            >
              Clear Queue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineStatusIndicator;
