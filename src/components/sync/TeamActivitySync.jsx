import React, { useState, useEffect, useMemo } from "react";
import {
  Activity,
  Users,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Edit3,
  DollarSign,
  Target,
  Calendar,
  Trash2,
  ArrowRightLeft,
  GitCommit,
  GitBranch,
  FileText,
} from "lucide-react";

const TeamActivitySync = ({
  activeUsers = [],
  recentActivity = [],
  currentUser = null,
  isOnline,
  isSyncing,
  lastSyncTime,
  syncError = null,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper functions for sync status
  const getSyncStatusIcon = () => {
    if (syncError) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (isSyncing) return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    if (isOnline === false) return <WifiOff className="h-4 w-4 text-gray-400" />;
    if (isOnline) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <Clock className="h-4 w-4 text-gray-400" />;
  };

  const getSyncStatusText = () => {
    if (syncError) return "Sync Error";
    if (isSyncing) return "Syncing...";
    if (isOnline === false) return "Offline";
    if (isOnline && lastSyncTime) {
      const syncTime = new Date(lastSyncTime);
      const now = new Date();
      const diffMinutes = Math.floor((now - syncTime) / (1000 * 60));
      if (diffMinutes < 1) return "Just synced";
      if (diffMinutes < 60) return `Synced ${diffMinutes}m ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      return `Synced ${diffHours}h ago`;
    }
    return "Ready to sync";
  };

  // Debug logging
  useEffect(() => {
    console.log("🔧 TeamActivitySync Debug:", {
      activeUsers: activeUsers?.length || 0,
      recentActivity: recentActivity?.length || 0,
      currentUser: currentUser?.userName || "none",
      isOnline,
      isSyncing,
      lastSyncTime,
      syncError,
    });
  }, [
    activeUsers,
    recentActivity,
    currentUser,
    isOnline,
    isSyncing,
    lastSyncTime,
    syncError,
  ]);

  // Format last sync time
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

  // Get sync status with proper CSS classes
  const getSyncStatus = () => {
    if (syncError) {
      if (syncError.includes("blocked") || syncError.includes("ad blocker")) {
        return {
          status: "blocked",
          iconClass: "h-4 w-4 text-orange-600",
          textClass: "text-sm font-medium text-orange-700",
          message: "Sync blocked",
        };
      }
      return {
        status: "error",
        iconClass: "h-4 w-4 text-rose-600",
        textClass: "text-sm font-medium text-rose-700",
        message: "Sync error",
      };
    }
    if (!isOnline)
      return {
        status: "offline",
        iconClass: "h-4 w-4 text-amber-600",
        textClass: "text-sm font-medium text-amber-700",
        message: "Offline",
      };
    if (isSyncing)
      return {
        status: "syncing",
        iconClass: "h-4 w-4 text-cyan-600 animate-spin",
        textClass: "text-sm font-medium text-cyan-700",
        message: "Syncing...",
      };
    return {
      status: "synced",
      iconClass: "h-4 w-4 text-emerald-600",
      textClass: "text-sm font-medium text-emerald-700",
      message: "Synced",
    };
  };

  // Process activity into Git-like changes
  const processedActivities = useMemo(() => {
    try {
      if (!Array.isArray(recentActivity)) {
        console.warn("recentActivity is not an array:", recentActivity);
        return [];
      }

      return [...recentActivity]
        .sort((a, b) => {
          try {
            const aTime = new Date(a.timestamp || 0).getTime();
            const bTime = new Date(b.timestamp || 0).getTime();
            return bTime - aTime;
          } catch (error) {
            console.error("Error sorting activities:", error, a, b);
            return 0;
          }
        })
        .slice(0, 15)
        .map((activity) => {
          try {
            // Generate Git-like change descriptions
            const changes = generateChangeDescription(activity);
            return {
              ...activity,
              changes,
              commitId: generateCommitId(activity),
              timeAgo: formatTimeAgo(activity.timestamp),
            };
          } catch (error) {
            console.error("Error processing activity:", error, activity);
            return {
              ...activity,
              changes: [],
              commitId: "error",
              timeAgo: "unknown",
            };
          }
        });
    } catch (error) {
      console.error("Error processing activities:", error);
      return [];
    }
  }, [recentActivity]);

  const generateChangeDescription = (activity) => {
    const changes = [];

    switch (activity.type) {
      case "envelope_create":
        changes.push({
          type: "added",
          icon: <Plus className="h-3 w-3 text-emerald-600" />,
          description: `Created envelope "${activity.details?.name || "Unknown"}"`,
          value: activity.details?.amount
            ? `$${activity.details.amount.toFixed(2)}`
            : null,
        });
        break;

      case "envelope_update":
        if (activity.details?.oldAmount !== activity.details?.newAmount) {
          changes.push({
            type: "modified",
            icon: <Edit3 className="h-3 w-3 text-blue-600" />,
            description: `Updated envelope "${activity.details?.name || "Unknown"}"`,
            value: activity.details?.newAmount
              ? `$${activity.details.oldAmount?.toFixed(2)} → $${activity.details.newAmount.toFixed(2)}`
              : null,
          });
        }
        break;

      case "envelope_delete":
        changes.push({
          type: "deleted",
          icon: <Minus className="h-3 w-3 text-red-600" />,
          description: `Deleted envelope "${activity.details?.name || "Unknown"}"`,
          value: activity.details?.amount
            ? `-$${activity.details.amount.toFixed(2)}`
            : null,
        });
        break;

      case "bill_create":
        changes.push({
          type: "added",
          icon: <Plus className="h-3 w-3 text-emerald-600" />,
          description: `Added bill "${activity.details?.name || "Unknown"}"`,
          value: activity.details?.amount
            ? `$${activity.details.amount.toFixed(2)}/${activity.details.frequency || "monthly"}`
            : null,
        });
        break;

      case "bill_update":
        changes.push({
          type: "modified",
          icon: <Edit3 className="h-3 w-3 text-blue-600" />,
          description: `Modified bill "${activity.details?.name || "Unknown"}"`,
          value: activity.details?.amount
            ? `$${activity.details.amount.toFixed(2)}`
            : null,
        });
        break;

      case "paycheck_processed":
        changes.push({
          type: "added",
          icon: <Plus className="h-3 w-3 text-emerald-600" />,
          description: `Processed paycheck from ${activity.details?.payer || "Unknown"}`,
          value: activity.details?.amount
            ? `+$${activity.details.amount.toFixed(2)}`
            : null,
        });
        break;

      case "transaction_create":
        const isExpense = activity.details?.amount < 0;
        changes.push({
          type: isExpense ? "modified" : "added",
          icon: isExpense ? (
            <Minus className="h-3 w-3 text-red-600" />
          ) : (
            <Plus className="h-3 w-3 text-emerald-600" />
          ),
          description: `${isExpense ? "Expense" : "Income"}: ${activity.details?.description || "Transaction"}`,
          value: activity.details?.amount
            ? `${isExpense ? "" : "+"}$${Math.abs(activity.details.amount).toFixed(2)}`
            : null,
        });
        break;

      case "savings_goal_create":
        changes.push({
          type: "added",
          icon: <Plus className="h-3 w-3 text-emerald-600" />,
          description: `Created savings goal "${activity.details?.name || "Unknown"}"`,
          value: activity.details?.targetAmount
            ? `Target: $${activity.details.targetAmount.toFixed(2)}`
            : null,
        });
        break;

      default:
        changes.push({
          type: "modified",
          icon: <Activity className="h-3 w-3 text-gray-600" />,
          description: activity.action || "Updated data",
          value: null,
        });
    }

    return changes;
  };

  const generateCommitId = (activity) => {
    try {
      // Generate a short hash-like ID from timestamp and user
      const input =
        (activity.timestamp || Date.now()) + (activity.userName || "anonymous");
      const hash = input.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0);
      return Math.abs(hash).toString(16).substring(0, 7);
    } catch (error) {
      console.error("Error generating commit ID:", error, activity);
      return "unknown";
    }
  };

  const formatTimeAgo = (timestamp) => {
    try {
      if (!timestamp) return "unknown";

      const now = new Date();
      const time = new Date(timestamp);

      // Check for invalid dates
      if (isNaN(time.getTime()) || isNaN(now.getTime())) {
        return "unknown";
      }

      const diffInMinutes = Math.floor((now - time) / (1000 * 60));

      if (diffInMinutes < 1) return "now";
      if (diffInMinutes < 60) return `${diffInMinutes}m`;

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h`;

      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d`;
    } catch (error) {
      console.error("Error formatting time ago:", error, timestamp);
      return "unknown";
    }
  };

  const syncStatus = getSyncStatus();

  const otherActiveUsers = useMemo(() => {
    try {
      if (!Array.isArray(activeUsers)) {
        console.warn("activeUsers is not an array:", activeUsers);
        return [];
      }
      return activeUsers.filter(
        (user) => currentUser && user && user.id !== currentUser.id
      );
    } catch (error) {
      console.error("Error filtering active users:", error);
      return [];
    }
  }, [activeUsers, currentUser]);

  // Always show the sync indicator, even without activity
  const shouldShow =
    otherActiveUsers.length > 0 ||
    processedActivities.length > 0 ||
    isOnline !== undefined;

  // Don't render if there's nothing to show
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="glassmorphism rounded-2xl mb-6 border border-white/20 overflow-hidden">
      {/* Header Bar */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/10 transition-all"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-4">
          {/* Sync Status */}
          <div className="flex items-center space-x-2">
            {syncStatus.status === "syncing" ? (
              <RefreshCw className={syncStatus.iconClass} />
            ) : syncStatus.status === "offline" ? (
              <WifiOff className={syncStatus.iconClass} />
            ) : syncStatus.status === "error" ||
              syncStatus.status === "blocked" ? (
              <AlertTriangle className={syncStatus.iconClass} />
            ) : (
              <CheckCircle className={syncStatus.iconClass} />
            )}
            <span className={syncStatus.textClass}>{syncStatus.message}</span>
            {lastSyncTime && (
              <span className="text-xs text-gray-500">
                • {formatLastSync(lastSyncTime)}
              </span>
            )}
          </div>

          {/* Team Activity Summary */}
          {otherActiveUsers.length > 0 && (
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div className="flex items-center space-x-2">
                {otherActiveUsers.slice(0, 2).map((user, index) => (
                  <div
                    key={user.id || index}
                    className="flex items-center space-x-1"
                  >
                    <div
                      className="w-5 h-5 rounded-full border border-white shadow-sm flex items-center justify-center text-xs font-medium text-white"
                      style={{
                        backgroundColor:
                          user.color || user.userColor || "#a855f7",
                      }}
                    >
                      {user.userName?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      {user.userName || "Anonymous"}
                    </span>
                  </div>
                ))}
                {otherActiveUsers.length > 2 && (
                  <span className="text-xs text-gray-500">
                    +{otherActiveUsers.length - 2} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Recent Activity Count */}
          {processedActivities.length > 0 && (
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <GitCommit className="h-4 w-4" />
              <span>{processedActivities.length} recent changes</span>
            </div>
          )}
        </div>

        {/* Expand/Collapse */}
        <div className="flex items-center space-x-2">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </div>
      </div>

      {/* Expanded Activity Feed */}
      {isExpanded && (
        <div className="border-t border-white/20 bg-white/5">
          <div className="p-4 max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {processedActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                >
                  {/* User Avatar */}
                  <div
                    className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-sm font-medium text-white flex-shrink-0"
                    style={{
                      backgroundColor:
                        activity.userColor || activity.color || "#a855f7",
                    }}
                  >
                    {activity.userName?.charAt(0)?.toUpperCase() || "?"}
                  </div>

                  {/* Change Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900 text-sm">
                        {activity.userName}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        {activity.commitId}
                      </span>
                      <span className="text-xs text-gray-500">
                        {activity.timeAgo}
                      </span>
                    </div>

                    {/* Git-like Changes */}
                    <div className="space-y-1">
                      {activity.changes.map((change, changeIndex) => (
                        <div
                          key={changeIndex}
                          className="flex items-center space-x-2 text-sm"
                        >
                          {change.icon}
                          <span className="text-gray-700">
                            {change.description}
                          </span>
                          {change.value && (
                            <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              {change.value}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {processedActivities.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent team activity</p>
                <div className="mt-4 flex justify-center items-center">
                  {getSyncStatusIcon()}
                  <span className="ml-2 text-sm">{getSyncStatusText()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamActivitySync;
