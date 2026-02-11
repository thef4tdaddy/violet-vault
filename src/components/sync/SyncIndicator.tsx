import React from "react";
import { renderIcon } from "@/utils/ui/icons";
import { useSyncStatus } from "./hooks/useSyncStatus";
import { SyncingStatus } from "./status/SyncingStatus";
import { SyncedStatus } from "./status/SyncedStatus";
import { ErrorStatus } from "./status/ErrorStatus";
import { OfflineStatus } from "./status/OfflineStatus";
import { HealthDashboardButton } from "./status/HealthDashboardButton";
import { ActiveUsers } from "./status/ActiveUsers";

interface User {
  id: string;
  userName: string;
  color?: string;
}

interface SyncIndicatorProps {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  activeUsers?: User[];
  syncError?: string | null;
  currentUser?: User | null;
  syncProgress?: number | null;
  syncStage?: string | null;
  onOpenHealthDashboard?: () => void;
}

/**
 * SyncIndicator component displays real-time sync status with health monitoring
 * Refactored to use extracted components and hooks for better maintainability
 * GitHub Issue #576: Enhanced progress tracking and health monitoring
 */
const SyncIndicator: React.FC<SyncIndicatorProps> = ({
  isOnline,
  isSyncing,
  lastSyncTime,
  activeUsers = [],
  syncError = null,
  currentUser = null,
  syncProgress = null, // GitHub Issue #576: Enhanced progress tracking
  syncStage = null, // Current sync stage (validating, encrypting, uploading, etc.)
  onOpenHealthDashboard,
}) => {
  const { status, otherActiveUsers, healthData, formatLastSync } = useSyncStatus({
    isOnline,
    isSyncing,
    lastSyncTime,
    activeUsers,
    syncError,
    currentUser,
    syncProgress,
    syncStage,
  });

  /**
   * Render the appropriate status component based on current status
   */
  const renderStatusComponent = () => {
    switch (status.status) {
      case "syncing":
        return (
          <SyncingStatus
            color={status.color}
            syncProgress={syncProgress}
            syncStage={syncStage}
            lastSyncTime={lastSyncTime}
            formatLastSync={formatLastSync}
          />
        );
      case "synced":
      case "slow":
      case "degraded":
      case "unhealthy":
        return (
          <SyncedStatus
            color={status.color}
            message={status.message}
            lastSyncTime={lastSyncTime}
            formatLastSync={formatLastSync}
          />
        );
      case "error":
      case "blocked":
        return (
          <ErrorStatus
            color={status.color}
            message={status.message}
            syncError={syncError!}
            lastSyncTime={lastSyncTime}
            formatLastSync={formatLastSync}
          />
        );
      case "offline":
        return (
          <OfflineStatus
            color={status.color}
            message={status.message}
            lastSyncTime={lastSyncTime}
            formatLastSync={formatLastSync}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="glassmorphism rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between">
        {/* Sync Status */}
        {renderStatusComponent()}

        <HealthDashboardButton healthData={healthData} onClick={onOpenHealthDashboard} />

        <ActiveUsers otherActiveUsers={otherActiveUsers} />

        {/* Performance Indicator */}
        {isOnline && !syncError && (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            {renderIcon("Zap", { className: "h-3 w-3" })}
            <span>Real-time</span>
          </div>
        )}
      </div>
    </div>
  );
};

export { SyncIndicator };
