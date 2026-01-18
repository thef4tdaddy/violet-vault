import { useSyncHealthIndicator } from "@/hooks/platform/sync/useSyncHealthIndicator";
import { Button } from "@/components/ui";

/**
 * @typedef {Object} SyncHealthStatus
 * @property {boolean|null} isHealthy - Whether sync is healthy
 * @property {'CHECKING'|'HEALTHY'|'ISSUES_DETECTED'|'ERROR'|'CRITICAL_FAILURE'} status - Current health status
 * @property {string|null} lastChecked - ISO timestamp of last health check
 * @property {boolean} isLoading - Whether health check is in progress
 * @property {string} [error] - Error message if check failed
 * @property {number} [failedTests] - Number of failed health tests
 */

/**
 * SyncHealthIndicator component displays sync health status with periodic checks
 * Shows spinning indicator during sync and color-coded status based on health
 *
 * @param {Object} props - Component props
 * @param {Function} props.onOpenHealthDashboard - Callback to open sync health dashboard
 * @returns {React.ReactElement} Rendered health indicator button
 */
interface SyncHealthIndicatorProps {
  onOpenHealthDashboard?: () => void;
}

const SyncHealthIndicator = ({ onOpenHealthDashboard }: SyncHealthIndicatorProps) => {
  const { syncStatus, isBackgroundSyncing } = useSyncHealthIndicator();

  /**
   * Get Tailwind CSS color class based on sync status
   * @returns {string} Tailwind text color class
   */
  const getStatusColor = () => {
    if (syncStatus.isLoading) return "text-gray-400";

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
   * Get status icon based on current sync state
   * @returns {React.ReactElement} SVG icon element
   */
  const getStatusIcon = () => {
    // Show spinning indicator for loading or background sync activity
    if (syncStatus.isLoading || isBackgroundSyncing) {
      return (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            opacity="0.25"
          />
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      );
    }

    switch (syncStatus.status) {
      case "HEALTHY":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "ISSUES_DETECTED":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "ERROR":
      case "CRITICAL_FAILURE":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  /**
   * Get human-readable status text
   * @returns {string} Status text for display
   */
  const getStatusText = () => {
    if (syncStatus.isLoading) return "Checking...";
    if (isBackgroundSyncing) return "Syncing...";

    switch (syncStatus.status) {
      case "HEALTHY":
        return "Sync Healthy";
      case "ISSUES_DETECTED":
        return `${syncStatus.failedTests} Issues`;
      case "ERROR":
        return "Sync Error";
      case "CRITICAL_FAILURE":
        return "Critical Error";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="relative">
      {/* Clickable Health Indicator - opens health dashboard */}
      <Button
        onClick={onOpenHealthDashboard ?? (() => {})}
        disabled={!onOpenHealthDashboard}
        className={`flex items-center space-x-2 px-3 py-2 rounded-2xl ${getStatusColor()} bg-green-500 text-white border-2 border-black shadow-lg transition-all ${
          onOpenHealthDashboard ? "hover:shadow-xl hover:scale-105 cursor-pointer" : "opacity-70"
        }`}
        title={`Sync Status: ${syncStatus.status}${isBackgroundSyncing ? " (Syncing...)" : ""} - Click to view details`}
      >
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </Button>
    </div>
  );
};

export default SyncHealthIndicator;
