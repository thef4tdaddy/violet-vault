import React, { useState, useEffect } from "react";
import { getIcon } from "../../utils";

export interface LockInfo {
  expiresAt: Date | { toDate: () => Date } | string | number;
  userName?: string;
}

export interface EditLockIndicatorProps {
  isLocked: boolean;
  isOwnLock: boolean;
  lock?: LockInfo | null;
  onBreakLock?: () => void;
  className?: string;
  showDetails?: boolean;
}

export interface CompactEditLockIndicatorProps {
  isLocked: boolean;
  isOwnLock: boolean;
  lock?: LockInfo | null;
  onBreakLock?: () => void;
  className?: string;
}

/**
 * Standardized Edit Lock Indicator Component
 * Shows lock status and provides consistent UI across all edit forms
 */
const EditLockIndicator: React.FC<EditLockIndicatorProps> = ({
  isLocked,
  isOwnLock,
  lock,
  onBreakLock,
  className = "",
  showDetails = true,
}) => {
  // Force re-render every second to update timer
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (!isLocked || !lock) return;

    const interval = setInterval(() => {
      forceUpdate((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked, lock]);

  if (!isLocked) return null;

  // Handle both Firebase Timestamp and Date objects
  const getExpirationDate = (expiresAt: Date | { toDate: () => Date } | string | number): Date => {
    if (!expiresAt) return new Date(0);
    if (typeof expiresAt === "object" && "toDate" in expiresAt) {
      return expiresAt.toDate();
    }
    return new Date(expiresAt);
  };

  const expirationDate = getExpirationDate(lock?.expiresAt || new Date(0));
  const isExpired = lock && expirationDate <= new Date();
  const timeRemaining = lock ? Math.max(0, expirationDate.getTime() - new Date().getTime()) : 0;
  const secondsRemaining = Math.ceil(timeRemaining / 1000);
  const minutesRemaining = Math.ceil(timeRemaining / (1000 * 60));

  // Own lock - show friendly indicator
  if (isOwnLock) {
    return (
      <div
        className={`flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg ${className}`}
      >
        {React.createElement(getIcon("Lock"), {
          className: "h-4 w-4 text-green-600",
        })}
        <div className="flex-1">
          <p className="text-sm font-medium text-green-900">You are editing this record</p>
          {showDetails && timeRemaining > 0 && (
            <p className="text-xs text-green-700">
              {secondsRemaining > 60
                ? `Lock expires in ${minutesRemaining} minute${minutesRemaining !== 1 ? "s" : ""}`
                : `Lock expires in ${secondsRemaining} second${secondsRemaining !== 1 ? "s" : ""}`}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Locked by someone else
  return (
    <div
      className={`flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg ${className}`}
    >
      <div className="flex-shrink-0">
        {isExpired
          ? React.createElement(getIcon("AlertTriangle"), {
              className: "h-5 w-5 text-red-600",
            })
          : React.createElement(getIcon("Lock"), {
              className: "h-5 w-5 text-red-600",
            })}
      </div>

      <div className="flex-1">
        <p className="text-sm font-medium text-red-900">
          {isExpired ? "Lock Expired" : "Currently Being Edited"}
        </p>

        {showDetails && (
          <div className="mt-1 space-y-1">
            <div className="flex items-center gap-2 text-xs text-red-700">
              {React.createElement(getIcon("User"), { className: "h-3 w-3" })}
              <span>by {lock?.userName || "Unknown User"}</span>
            </div>

            {!isExpired && timeRemaining > 0 && (
              <div className="flex items-center gap-2 text-xs text-red-700">
                {React.createElement(getIcon("Clock"), {
                  className: "h-3 w-3",
                })}
                <span>
                  {secondsRemaining > 60
                    ? `${minutesRemaining} minute${minutesRemaining !== 1 ? "s" : ""} remaining`
                    : `${secondsRemaining} second${secondsRemaining !== 1 ? "s" : ""} remaining`}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {isExpired && onBreakLock && (
        <button
          onClick={onBreakLock}
          className="flex-shrink-0 px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Break Lock
        </button>
      )}
    </div>
  );
};

/**
 * Compact version for smaller spaces (like table rows)
 */
export const CompactEditLockIndicator: React.FC<CompactEditLockIndicatorProps> = ({
  isLocked,
  isOwnLock,
  lock,
  onBreakLock,
  className = "",
}) => {
  if (!isLocked) return null;

  const getExpirationDate = (expiresAt: Date | { toDate: () => Date } | string | number): Date => {
    if (!expiresAt) return new Date(0);
    if (typeof expiresAt === "object" && "toDate" in expiresAt) {
      return expiresAt.toDate();
    }
    return new Date(expiresAt);
  };

  const isExpired = lock && getExpirationDate(lock.expiresAt) <= new Date();

  if (isOwnLock) {
    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs ${className}`}
      >
        {React.createElement(getIcon("Lock"), { className: "h-3 w-3" })}
        <span>Editing</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs ${className}`}
    >
      {isExpired
        ? React.createElement(getIcon("AlertTriangle"), {
            className: "h-3 w-3",
          })
        : React.createElement(getIcon("Lock"), { className: "h-3 w-3" })}
      <span>
        {isExpired ? "Expired" : "Locked"} by {lock?.userName || "User"}
      </span>
      {isExpired && onBreakLock && (
        <button
          onClick={onBreakLock}
          className="ml-1 text-red-600 hover:text-red-800"
          title="Break expired lock"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default EditLockIndicator;
