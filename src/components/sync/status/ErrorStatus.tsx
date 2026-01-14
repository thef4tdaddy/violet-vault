import React from "react";
import { Button } from "../../../components/ui";
import { renderIcon } from "@/utils/icons";

/**
 * Props for ErrorStatus component
 */
interface ErrorStatusProps {
  color: string;
  message: string;
  syncError: string;
  lastSyncTime: number | null;
  formatLastSync: (timestamp: number | null) => string;
}

/**
 * Component for displaying sync error status
 */
export const ErrorStatus: React.FC<ErrorStatusProps> = ({
  color,
  message,
  syncError,
  lastSyncTime,
  formatLastSync,
}) => {
  const isBlockedError = syncError.includes("blocked") || syncError.includes("ad blocker");

  return (
    <>
      <div className="flex items-center space-x-3">
        <div className={`relative p-2 rounded-full bg-${color}-50`}>
          {renderIcon("AlertTriangle", {
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

      {/* Error Details */}
      <div
        className={`mt-3 p-3 rounded-lg border ${
          isBlockedError ? "bg-orange-50 border-orange-200" : "bg-rose-50 border-rose-200"
        }`}
      >
        <div className="flex items-start space-x-2">
          {renderIcon("AlertTriangle", {
            className: `h-4 w-4 mt-0.5 flex-shrink-0 ${
              isBlockedError ? "text-orange-600" : "text-rose-600"
            }`,
          })}
          <div>
            <div className={`font-medium ${isBlockedError ? "text-orange-800" : "text-rose-800"}`}>
              {isBlockedError ? "Sync Blocked by Browser" : "Sync Error"}
            </div>
            <div className={`text-sm mt-1 ${isBlockedError ? "text-orange-600" : "text-rose-600"}`}>
              {typeof syncError === "string" ? syncError : "Failed to sync with cloud"}
            </div>

            {/* Show specific help for blocking errors */}
            {isBlockedError && (
              <div className="mt-2 text-xs text-orange-700">
                <div className="font-medium mb-1">To fix this:</div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Disable ad blocker for this site</li>
                  <li>Allow requests to firebase.google.com</li>
                  <li>Check browser extensions blocking requests</li>
                </ul>
              </div>
            )}

            {/* Regular retry button for non-blocking errors */}
            {!isBlockedError && (
              <Button className="text-sm text-rose-700 underline mt-2 hover:text-rose-800">
                Retry sync
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
