// components/SyncIndicator.jsx
import React, { useState, useEffect } from "react";
import { renderIcon } from "../../utils/icons";
import { syncHealthMonitor } from "../../utils/sync/syncHealthMonitor";
import SyncHealthDashboard from "./SyncHealthDashboard";

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} userName - User's display name
 * @property {string} [color] - User's avatar color
 */

/**
 * @typedef {Object} SyncStatus
 * @property {string} status - Status type: 'syncing' | 'error' | 'offline' | 'synced' | 'blocked' | 'slow' | 'degraded' | 'unhealthy'
 * @property {string} color - Tailwind color name for status display
 * @property {string} message - Human-readable status message
 */

/**
 * SyncIndicator component displays real-time sync status with health monitoring
 * GitHub Issue #576: Enhanced progress tracking and health monitoring
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOnline - Whether the app is online
 * @param {boolean} props.isSyncing - Whether sync is currently in progress
 * @param {number|null} props.lastSyncTime - Timestamp of last successful sync
 * @param {User[]} [props.activeUsers=[]] - List of active users in the system
 * @param {string|null} [props.syncError=null] - Current sync error message, if any
 * @param {User|null} [props.currentUser=null] - Current logged-in user
 * @param {number|null} [props.syncProgress=null] - Sync progress (0-1) for progress bar
 * @param {string|null} [props.syncStage=null] - Current sync stage (validating, encrypting, uploading, etc.)
 * @returns {React.ReactElement} Rendered sync indicator component
 */
const SyncIndicator = ({
  isOnline,
  isSyncing,
  lastSyncTime,
  activeUsers = [],
  syncError = null,
  currentUser = null,
  syncProgress = null, // GitHub Issue #576: Enhanced progress tracking
  syncStage = null, // Current sync stage (validating, encrypting, uploading, etc.)
}) => {
  const [healthData, setHealthData] = useState(null);
  const [showHealthDashboard, setShowHealthDashboard] = useState(false);

  // Monitor sync health
  useEffect(() => {
    const updateHealth = () => {
      const health = syncHealthMonitor.getHealthStatus();
      setHealthData(health);
    };

    updateHealth();
    const interval = setInterval(updateHealth, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);
  /**
   * Format last sync timestamp into human-readable relative time
   * @param {number|null} timestamp - Unix timestamp in milliseconds
   * @returns {string} Formatted relative time string
   */
  const formatLastSync = (timestamp) => {
    if (!timestamp) return "Never synced";

    const now = new Date();
    const syncTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - syncTime) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes === 1) return "1 minute ago";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    return syncTime.toLocaleDateString();
  };

  /**
   * Determine current sync status based on health, errors, and network state
   * GitHub Issue #576: Enhanced status with health monitoring
   * @returns {SyncStatus} Current sync status object with status, color, and message
   */
  const getSyncStatus = () => {
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
  };

  const { status, color, message } = getSyncStatus();

  const otherActiveUsers = activeUsers.filter((user) => currentUser && user.id !== currentUser.id);

  return (
    <div className="glassmorphism rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between">
        {/* Sync Status */}
        <div className="flex items-center space-x-3">
          <div className={`relative p-2 rounded-full bg-${color}-50`}>
            {status === "syncing"
              ? renderIcon("RefreshCw", {
                  className: `h-5 w-5 text-${color}-600 animate-spin`,
                })
              : status === "error"
                ? renderIcon("AlertTriangle", {
                    className: `h-5 w-5 text-${color}-600`,
                  })
                : status === "offline"
                  ? renderIcon("WifiOff", {
                      className: `h-5 w-5 text-${color}-600`,
                    })
                  : status === "synced"
                    ? renderIcon("CheckCircle", {
                        className: `h-5 w-5 text-${color}-600`,
                      })
                    : renderIcon("Wifi", {
                        className: `h-5 w-5 text-${color}-600`,
                      })}

            {/* Real-time pulse for active sync */}
            {(isSyncing || otherActiveUsers.length > 0) && (
              <div className={`absolute -top-1 -right-1 h-3 w-3 bg-${color}-500 rounded-full`}>
                <div className={`absolute inset-0 bg-${color}-500 rounded-full animate-ping`} />
                <div className={`absolute inset-0 bg-${color}-500 rounded-full`} />
              </div>
            )}
          </div>

          <div>
            <div className={`font-semibold text-${color}-700`}>{message}</div>

            {/* GitHub Issue #576: Enhanced sync progress indicators */}
            {isSyncing && syncStage && (
              <div className="text-xs text-gray-500 mb-1">
                {syncStage}
                {syncProgress && <span className="ml-2">{Math.round(syncProgress * 100)}%</span>}
              </div>
            )}

            {/* Progress Bar for active syncing */}
            {isSyncing && syncProgress !== null && (
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

        {/* GitHub Issue #576: Sync Health Dashboard Button */}
        <button
          onClick={() => setShowHealthDashboard(true)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 border-black transition-all ${
            healthData?.status === "healthy"
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : healthData?.status === "unhealthy"
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
          }`}
          title="View sync health details"
        >
          {renderIcon("Activity", { className: "h-4 w-4" })}
          <span className="text-xs font-bold uppercase">Health</span>
          {healthData?.metrics && (
            <span className="text-xs">
              {(
                (healthData.metrics.successfulSyncs /
                  (healthData.metrics.successfulSyncs + healthData.metrics.failedSyncs)) *
                  100 || 100
              ).toFixed(0)}
              %
            </span>
          )}
        </button>

        {/* Active Users */}
        {otherActiveUsers.length > 0 && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center text-sm text-gray-600">
              {renderIcon("Users", { className: "h-4 w-4 mr-1" })}
              <span>
                {otherActiveUsers.length} other
                {otherActiveUsers.length === 1 ? "" : "s"} online
              </span>
            </div>

            {/* User Avatars */}
            <div className="flex -space-x-2">
              {otherActiveUsers.slice(0, 3).map((user) => (
                <div
                  key={user.id}
                  className="relative h-8 w-8 rounded-full border-2 border-white"
                  style={{ backgroundColor: user.color || "#a855f7" }}
                  title={user.userName}
                >
                  <div className="absolute inset-0 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {user.userName?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>

                  {/* Active indicator */}
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white">
                    <div className="absolute inset-0 bg-emerald-500 rounded-full animate-pulse" />
                  </div>
                </div>
              ))}

              {/* More users indicator */}
              {otherActiveUsers.length > 3 && (
                <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-600">
                    +{otherActiveUsers.length - 3}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Performance Indicator */}
        {isOnline && !syncError && (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            {renderIcon("Zap", { className: "h-3 w-3" })}
            <span>Real-time</span>
          </div>
        )}
      </div>

      {/* Error Details */}
      {syncError && (
        <div
          className={`mt-3 p-3 rounded-lg border ${
            syncError.includes("blocked") || syncError.includes("ad blocker")
              ? "bg-orange-50 border-orange-200"
              : "bg-rose-50 border-rose-200"
          }`}
        >
          <div className="flex items-start space-x-2">
            {renderIcon("AlertTriangle", {
              className: `h-4 w-4 mt-0.5 flex-shrink-0 ${
                syncError.includes("blocked") || syncError.includes("ad blocker")
                  ? "text-orange-600"
                  : "text-rose-600"
              }`,
            })}
            <div>
              <div
                className={`font-medium ${
                  syncError.includes("blocked") || syncError.includes("ad blocker")
                    ? "text-orange-800"
                    : "text-rose-800"
                }`}
              >
                {syncError.includes("blocked") || syncError.includes("ad blocker")
                  ? "Sync Blocked by Browser"
                  : "Sync Error"}
              </div>
              <div
                className={`text-sm mt-1 ${
                  syncError.includes("blocked") || syncError.includes("ad blocker")
                    ? "text-orange-600"
                    : "text-rose-600"
                }`}
              >
                {typeof syncError === "string" ? syncError : "Failed to sync with cloud"}
              </div>

              {/* Show specific help for blocking errors */}
              {(syncError.includes("blocked") || syncError.includes("ad blocker")) && (
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
              {!(syncError.includes("blocked") || syncError.includes("ad blocker")) && (
                <button className="text-sm text-rose-700 underline mt-2 hover:text-rose-800">
                  Retry sync
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Offline Mode Info */}
      {!isOnline && (
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
      )}

      {/* GitHub Issue #576: Sync Health Dashboard Modal */}
      <SyncHealthDashboard
        isOpen={showHealthDashboard}
        onClose={() => setShowHealthDashboard(false)}
      />
    </div>
  );
};

export default SyncIndicator;
