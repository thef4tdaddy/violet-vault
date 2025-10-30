import React, { useState, useEffect } from "react";
import { getIcon } from "../../utils";

// Helper functions
interface LockData {
  expiresAt?: unknown;
}

const getExpirationDate = (expiresAt: unknown): Date => {
  if (!expiresAt) return new Date(0);
  const data = expiresAt as unknown as { toDate?: () => Date };
  return data?.toDate ? data.toDate() : new Date(expiresAt as unknown as number | string);
};

const calculateTimeRemaining = (lock: unknown) => {
  if (!lock) return { timeRemaining: 0, secondsRemaining: 0, minutesRemaining: 0 };
  const lockData = lock as unknown as LockData;
  const expirationDate = getExpirationDate(lockData?.expiresAt);
  const now = new Date();
  const timeRemaining = Math.max(
    0,
    (expirationDate.getTime ? expirationDate.getTime() : Number(expirationDate)) - now.getTime()
  );
  return {
    timeRemaining,
    secondsRemaining: Math.ceil(timeRemaining / 1000),
    minutesRemaining: Math.ceil(timeRemaining / (1000 * 60)),
  };
};

const formatTimeRemaining = (seconds, minutes) => {
  if (seconds > 60) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }
  return `${seconds} second${seconds !== 1 ? "s" : ""}`;
};

/**
 * Standardized Edit Lock Indicator Component
 * Shows lock status and provides consistent UI across all edit forms
 */
const EditLockIndicator = ({
  isLocked,
  isOwnLock,
  lock,
  onBreakLock,
  className = "",
  showDetails = true,
}) => {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (!isLocked || !lock) return;
    const interval = setInterval(() => {
      forceUpdate((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLocked, lock]);

  if (!isLocked) return null;

  const isExpired = lock && getExpirationDate(lock.expiresAt) <= new Date();
  const { timeRemaining, secondsRemaining, minutesRemaining } = calculateTimeRemaining(lock);

  if (isOwnLock) {
    return (
      <OwnLockIndicator
        className={className}
        showDetails={showDetails}
        timeRemaining={timeRemaining}
        secondsRemaining={secondsRemaining}
        minutesRemaining={minutesRemaining}
      />
    );
  }

  return (
    <OthersLockIndicator
      className={className}
      isExpired={isExpired}
      lock={lock}
      showDetails={showDetails}
      timeRemaining={timeRemaining}
      secondsRemaining={secondsRemaining}
      minutesRemaining={minutesRemaining}
      onBreakLock={onBreakLock}
    />
  );
};

const OwnLockIndicator = ({
  className,
  showDetails,
  timeRemaining,
  secondsRemaining,
  minutesRemaining,
}) => (
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
          Lock expires in {formatTimeRemaining(secondsRemaining, minutesRemaining)}
        </p>
      )}
    </div>
  </div>
);

const OthersLockIndicator = ({
  className,
  isExpired,
  lock,
  showDetails,
  timeRemaining,
  secondsRemaining,
  minutesRemaining,
  onBreakLock,
}) => (
  <div
    className={`flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg ${className}`}
  >
    <div className="flex-shrink-0">
      {React.createElement(getIcon(isExpired ? "AlertTriangle" : "Lock"), {
        className: "h-5 w-5 text-red-600",
      })}
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-red-900">
        {isExpired ? "Lock Expired" : "Currently Being Edited"}
      </p>
      {showDetails && (
        <LockDetails
          lock={lock}
          isExpired={isExpired}
          timeRemaining={timeRemaining}
          secondsRemaining={secondsRemaining}
          minutesRemaining={minutesRemaining}
        />
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

const LockDetails = ({ lock, isExpired, timeRemaining, secondsRemaining, minutesRemaining }) => (
  <div className="mt-1 space-y-1">
    <div className="flex items-center gap-2 text-xs text-red-700">
      {React.createElement(getIcon("User"), { className: "h-3 w-3" })}
      <span>by {lock?.userName || "Unknown User"}</span>
    </div>
    {!isExpired && timeRemaining > 0 && (
      <div className="flex items-center gap-2 text-xs text-red-700">
        {React.createElement(getIcon("Clock"), { className: "h-3 w-3" })}
        <span>{formatTimeRemaining(secondsRemaining, minutesRemaining)} remaining</span>
      </div>
    )}
  </div>
);

/**
 * Compact version for smaller spaces (like table rows)
 */
export const CompactEditLockIndicator = ({
  isLocked,
  isOwnLock,
  lock,
  onBreakLock,
  className = "",
}) => {
  if (!isLocked) return null;

  const isExpired = lock && getExpirationDate(lock.expiresAt) <= new Date();

  if (isOwnLock) {
    return <CompactOwnLockBadge className={className} />;
  }

  return (
    <CompactOthersLockBadge
      className={className}
      isExpired={isExpired}
      lock={lock}
      onBreakLock={onBreakLock}
    />
  );
};

const CompactOwnLockBadge = ({ className }) => (
  <div
    className={`inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs ${className}`}
  >
    {React.createElement(getIcon("Lock"), { className: "h-3 w-3" })}
    <span>Editing</span>
  </div>
);

const CompactOthersLockBadge = ({ className, isExpired, lock, onBreakLock }) => (
  <div
    className={`inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs ${className}`}
  >
    {React.createElement(getIcon(isExpired ? "AlertTriangle" : "Lock"), {
      className: "h-3 w-3",
    })}
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

export default EditLockIndicator;
