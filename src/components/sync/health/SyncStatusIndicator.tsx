import { Button } from "@/components/ui";
// eslint-disable-next-line no-restricted-imports -- UI helper utilities for formatting sync status
import {
  getStatusColor,
  getStatusBackgroundColor,
  getStatusText,
} from "../../../utils/sync/syncHealthHelpers";

interface SyncStatus {
  status: string;
  isLoading?: boolean;
  failedTests?: number;
  [key: string]: unknown;
}

interface SyncStatusIndicatorProps {
  syncStatus: SyncStatus;
  isBackgroundSyncing: boolean;
  onClick: () => void;
  showDetails: boolean;
}

/**
 * SyncStatusIndicator component displays compact sync health indicator button
 * Shows color-coded status with icon and text, clickable to show details
 */
const SyncStatusIndicator = ({
  syncStatus,
  isBackgroundSyncing,
  onClick,
  showDetails,
}: SyncStatusIndicatorProps) => {
  /**
   * Get appropriate icon for current sync status
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
          <path
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            fill="currentColor"
          />
        </svg>
      );
    }

    // Show status-based icons
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

  const statusColor = getStatusColor(syncStatus, isBackgroundSyncing);
  const backgroundColor = getStatusBackgroundColor(syncStatus, isBackgroundSyncing);
  const statusText = getStatusText(syncStatus, isBackgroundSyncing);

  return (
    <Button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 glassmorphism backdrop-blur-sm border-2 border-black shadow-md hover:shadow-lg ${backgroundColor} ${statusColor} ${
        showDetails ? "ring-2 ring-purple-500" : ""
      }`}
      title={`Sync Status: ${statusText}`}
    >
      <div className="flex items-center justify-center">{getStatusIcon()}</div>
      <span className="text-sm font-bold whitespace-nowrap">{statusText}</span>
    </Button>
  );
};

export default SyncStatusIndicator;
