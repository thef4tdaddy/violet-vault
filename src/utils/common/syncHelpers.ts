/**
 * Utility functions for sync health display and formatting
 * Moved from utils/sync/syncHealthHelpers to comply with architecture rules
 * Components can import these helpers directly as they are pure display utilities
 */

interface SyncStatus {
  status: string;
  isLoading?: boolean;
  failedTests?: number;
  [key: string]: unknown;
}

interface RecoveryResult {
  success: boolean;
  message?: string;
  error?: string;
  details?: unknown;
  [key: string]: unknown;
}

interface FormattedRecoveryResult {
  type: "success" | "error";
  message: string;
  details: unknown;
}

/**
 * Get status color based on sync health status
 */
export const getStatusColor = (syncStatus: SyncStatus, isBackgroundSyncing: boolean): string => {
  if (syncStatus.isLoading || isBackgroundSyncing) return "text-blue-500";

  switch (syncStatus.status) {
    case "HEALTHY":
      return "text-green-500";
    case "ISSUES_DETECTED":
      return "text-yellow-500";
    case "ERROR":
    case "CRITICAL_FAILURE":
      return "text-red-500";
    default:
      return "text-gray-400";
  }
};

/**
 * Get background color for status indicator
 */
export const getStatusBackgroundColor = (
  syncStatus: SyncStatus,
  isBackgroundSyncing: boolean
): string => {
  if (syncStatus.isLoading || isBackgroundSyncing) return "bg-blue-100";

  switch (syncStatus.status) {
    case "HEALTHY":
      return "bg-green-100";
    case "ISSUES_DETECTED":
      return "bg-yellow-100";
    case "ERROR":
    case "CRITICAL_FAILURE":
      return "bg-red-100";
    default:
      return "bg-gray-100";
  }
};

/**
 * Get status text for display
 */
export const getStatusText = (syncStatus: SyncStatus, isBackgroundSyncing: boolean): string => {
  if (syncStatus.isLoading) return "Checking...";
  if (isBackgroundSyncing) return "Syncing...";

  switch (syncStatus.status) {
    case "HEALTHY":
      return "Sync Healthy";
    case "ISSUES_DETECTED":
      return `${syncStatus.failedTests || 0} Issues`;
    case "ERROR":
      return "Sync Error";
    case "CRITICAL_FAILURE":
      return "Critical Error";
    default:
      return "Unknown";
  }
};

/**
 * Get status description for tooltip
 */
export const getStatusDescription = (
  syncStatus: SyncStatus,
  isBackgroundSyncing?: boolean
): string => {
  if (syncStatus.isLoading) return "Checking sync health status...";
  if (isBackgroundSyncing) return "Background sync operation in progress...";

  switch (syncStatus.status) {
    case "HEALTHY":
      return "All sync systems are functioning normally";
    case "ISSUES_DETECTED":
      return `${syncStatus.failedTests || 0} sync issues detected that may need attention`;
    case "ERROR":
      return "Sync error detected - some operations may not be working";
    case "CRITICAL_FAILURE":
      return "Critical sync failure - immediate attention required";
    default:
      return "Sync status unknown";
  }
};

/**
 * Format last checked time for display
 */
export const formatLastChecked = (lastChecked: string | null): string => {
  if (!lastChecked) return "Never checked";

  try {
    const date = new Date(lastChecked);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;

    return date.toLocaleDateString();
  } catch {
    return "Invalid date";
  }
};

/**
 * Get priority level for status
 */
export const getStatusPriority = (syncStatus: SyncStatus): string => {
  switch (syncStatus.status) {
    case "CRITICAL_FAILURE":
      return "critical";
    case "ERROR":
      return "high";
    case "ISSUES_DETECTED":
      return "medium";
    case "HEALTHY":
      return "low";
    default:
      return "unknown";
  }
};

/**
 * Check if status requires immediate attention
 */
export const requiresImmediateAttention = (syncStatus: SyncStatus): boolean => {
  return ["ERROR", "CRITICAL_FAILURE"].includes(syncStatus.status);
};

/**
 * Check if recovery actions are available
 */
export const hasRecoveryActions = (): boolean => {
  return (
    typeof window !== "undefined" &&
    (typeof (window as Window & { runMasterSyncValidation?: unknown }).runMasterSyncValidation ===
      "function" ||
      typeof (window as Window & { forceCloudDataReset?: unknown }).forceCloudDataReset ===
        "function")
  );
};

/**
 * Format recovery result for display
 */
export const formatRecoveryResult = (
  result: RecoveryResult | null
): FormattedRecoveryResult | null => {
  if (!result) return null;

  if (result.success) {
    return {
      type: "success",
      message: result.message || "Recovery operation completed successfully",
      details: result.details || null,
    };
  } else {
    return {
      type: "error",
      message: result.error || "Recovery operation failed",
      details: result.details || null,
    };
  }
};

/**
 * Get appropriate action button style based on status
 */
export const getActionButtonStyle = (actionType: string, _syncStatus?: SyncStatus): string => {
  const baseStyle =
    "px-3 py-2 text-sm rounded-lg border-2 border-black shadow-md hover:shadow-lg transition-all font-bold";

  switch (actionType) {
    case "validate":
      return `${baseStyle} bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700`;
    case "reset":
      return `${baseStyle} bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600`;
    case "refresh":
      return `${baseStyle} bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700`;
    default:
      return `${baseStyle} bg-white/60 backdrop-blur-sm text-gray-700 hover:bg-white/80`;
  }
};
