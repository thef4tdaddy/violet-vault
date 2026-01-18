import { useMemo } from "react";
import { useSyncHealthMonitor } from "@/hooks/platform/sync/useSyncHealthMonitor";

interface User {
  id: string;
  userName: string;
  color?: string;
}

interface SyncStatus {
  status:
    | "syncing"
    | "error"
    | "offline"
    | "synced"
    | "blocked"
    | "slow"
    | "degraded"
    | "unhealthy";
  color: string;
  message: string;
}

interface HealthMetrics {
  totalAttempts: number;
  successfulSyncs: number;
  failedSyncs: number;
  averageSyncTime: number;
  lastSyncTime: number | null;
  errorRate: number;
  consecutiveFailures: number;
  sessionStartTime: number;
}

interface HealthData {
  status: "healthy" | "slow" | "degraded" | "unhealthy" | "unknown";
  issues: string[];
  metrics: HealthMetrics;
  recentSyncs: unknown[];
}

/**
 * Props for sync status calculation
 */
export interface SyncStatusProps {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  activeUsers?: User[];
  syncError?: string | null;
  currentUser?: User | null;
  syncProgress?: number | null;
  syncStage?: string | null;
}

/**
 * Return type for useSyncStatus hook
 */
export interface SyncStatusResult {
  status: SyncStatus;
  otherActiveUsers: User[];
  healthData: HealthData | null;
  formatLastSync: (timestamp: number | null) => string;
}

/**
 * Custom hook for calculating sync status and related data
 * Extracted from SyncIndicator component to reduce complexity
 */
export const useSyncStatus = ({
  isOnline,
  isSyncing,
  lastSyncTime: _lastSyncTime,
  activeUsers = [],
  syncError = null,
  currentUser = null,
  syncProgress: _syncProgress = null,
  syncStage: _syncStage,
}: SyncStatusProps): SyncStatusResult => {
  const { healthData } = useSyncHealthMonitor(true, 10000); // Auto-refresh every 10 seconds

  /**
   * Format last sync timestamp into human-readable relative time
   */
  const formatLastSync = (timestamp: number | null): string => {
    if (!timestamp) return "Never synced";

    const now = Date.now();
    const syncTime = timestamp;
    const diffInMinutes = Math.floor((now - syncTime) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes === 1) return "1 minute ago";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    return new Date(syncTime).toLocaleDateString();
  };

  /**
   * Determine current sync status based on health, errors, and network state
   * GitHub Issue #576: Enhanced status with health monitoring
   */
  const status = useMemo((): SyncStatus => {
    // GitHub Issue #576: Enhanced status with health monitoring
    const healthStatus = healthData?.status || "unknown";
    const hasHealthIssues = healthStatus !== "healthy" && healthStatus !== "unknown";

    if (syncError) {
      // Check if it's a network blocking error
      if (syncError.includes("blocked") || syncError.includes("ad blocker")) {
        return { status: "blocked", color: "orange", message: "Sync blocked" };
      }
      return { status: "error", color: "rose", message: "Sync error" };
    }
    if (!isOnline) return { status: "offline", color: "amber", message: "Offline" };
    if (isSyncing) return { status: "syncing", color: "cyan", message: "Syncing..." };

    // Health-based status for non-syncing states
    if (hasHealthIssues) {
      switch (healthStatus) {
        case "slow":
          return { status: "slow", color: "yellow", message: "Sync slow" };
        case "degraded":
          return {
            status: "degraded",
            color: "orange",
            message: "Sync issues",
          };
        case "unhealthy":
          return {
            status: "unhealthy",
            color: "red",
            message: "Sync unhealthy",
          };
        default:
          return {
            status: "synced",
            color: "emerald",
            message: "Sync healthy",
          };
      }
    }

    return { status: "synced", color: "emerald", message: "Sync healthy" };
  }, [healthData?.status, syncError, isOnline, isSyncing]);

  const otherActiveUsers = activeUsers.filter((user) => currentUser && user.id !== currentUser.id);

  return {
    status,
    otherActiveUsers,
    healthData,
    formatLastSync,
  };
};
