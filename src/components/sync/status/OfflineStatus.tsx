import React from "react";
import { renderIcon } from "@/utils/icons";

/**
 * Props for OfflineStatus component
 */
interface OfflineStatusProps {
  color: string;
  message: string;
  lastSyncTime: number | null;
  formatLastSync: (timestamp: number | null) => string;
}

/**
 * Component for displaying offline status
 */
export const OfflineStatus: React.FC<OfflineStatusProps> = ({
  color,
  message,
  lastSyncTime,
  formatLastSync,
}) => {
  return (
    <>
      <div className="flex items-center space-x-3">
        <div className={`relative p-2 rounded-full bg-${color}-50`}>
          {renderIcon("WifiOff", {
            className: `h-5 w-5 text-${color}-600`,
          })}
        </div>

        <div>
          <div className={`font-semibold text-${color}-700`}>{message}</div>
          <div className="flex items-center text-sm text-gray-600">
            {renderIcon("Clock", { className: "h-3 w-3 mr-1" })}
            <span>{formatLastSync(lastSyncTime)}</span>
          </div>
        </div>
      </div>

      {/* Offline Mode Info */}
      <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
        <div className="flex items-start space-x-2">
          {renderIcon("WifiOff", {
            className: "h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0",
          })}
          <div>
            <div className="font-medium text-amber-800">Working Offline</div>
            <div className="text-sm text-amber-600 mt-1">
              Your changes are saved locally and will sync when you're back online.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
