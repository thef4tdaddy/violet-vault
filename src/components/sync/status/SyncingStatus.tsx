import React from "react";
import { renderIcon } from "@/utils/icons";

/**
 * Props for SyncingStatus component
 */
interface SyncingStatusProps {
  color: string;
  syncProgress: number | null;
  syncStage: string | null;
  lastSyncTime: number | null;
  formatLastSync: (timestamp: number | null) => string;
}

/**
 * Component for displaying syncing status
 */
export const SyncingStatus: React.FC<SyncingStatusProps> = ({
  color,
  syncProgress,
  syncStage,
  lastSyncTime,
  formatLastSync,
}) => {
  return (
    <div className="flex items-center space-x-3">
      <div className={`relative p-2 rounded-full bg-${color}-50`}>
        {renderIcon("RefreshCw", {
          className: `h-5 w-5 text-${color}-600 animate-spin`,
        })}
        {/* Real-time pulse for active sync */}
        <div className={`absolute -top-1 -right-1 h-3 w-3 bg-${color}-500 rounded-full`}>
          <div className={`absolute inset-0 bg-${color}-500 rounded-full animate-ping`} />
          <div className={`absolute inset-0 bg-${color}-500 rounded-full`} />
        </div>
      </div>

      <div>
        <div className={`font-semibold text-${color}-700`}>Syncing...</div>

        {/* GitHub Issue #576: Enhanced sync progress indicators */}
        {syncStage && (
          <div className="text-xs text-gray-500 mb-1">
            {syncStage}
            {syncProgress && <span className="ml-2">{Math.round(syncProgress * 100)}%</span>}
          </div>
        )}

        {/* Progress Bar for active syncing */}
        {syncProgress !== null && (
          <div className="w-32 h-1 bg-gray-200 rounded-full mb-1">
            <div
              className={`h-full bg-${color}-500 rounded-full transition-all duration-300`}
              style={{ width: `${Math.round(syncProgress * 100)}%` }}
            />
          </div>
        )}

        <div className="flex items-center text-sm text-gray-600">
          {renderIcon("Clock", { className: "h-3 w-3 mr-1" })}
          <span>{formatLastSync(lastSyncTime)}</span>
        </div>
      </div>
    </div>
  );
};
