// components/ActivityBanner.jsx
import { Button } from "@/components/ui";
import React, { useState, useEffect } from "react";
import { getIcon } from "../../utils";

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} userName - User's display name
 * @property {string} [color] - User's avatar color
 */

/**
 * @typedef {Object} Activity
 * @property {string} id - Activity ID
 * @property {string} type - Activity type (envelope_update, envelope_create, envelope_delete, bill_create, bill_update, transfer, view)
 * @property {string} timestamp - ISO timestamp of activity
 * @property {string} userId - ID of user who performed activity
 * @property {string} userName - Name of user who performed activity
 * @property {string} [description] - Activity description
 * @property {string} [entityName] - Name of affected entity
 */

/**
 * ActivityBanner component displays real-time user activity and presence
 * Shows active users and recent activities with expandable view
 *
 * @param {Object} props - Component props
 * @param {User[]} [props.activeUsers=[]] - List of currently active users
 * @param {Activity[]} [props.recentActivity=[]] - List of recent user activities
 * @param {User|null} [props.currentUser=null] - Current logged-in user
 * @returns {React.ReactElement} Rendered activity banner component
 */
const ActivityBanner = ({ activeUsers = [], recentActivity = [], currentUser = null }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [displayedActivities, setDisplayedActivities] = useState([]);

  useEffect(() => {
    // Sort activities by timestamp and get recent ones
    const sortedActivities = [...recentActivity]
      .sort((activityA, activityB) => new Date(activityB.timestamp).getTime() - new Date(activityA.timestamp).getTime())
      .slice(0, 10);

    setDisplayedActivities(sortedActivities);
  }, [recentActivity]);

  /**
   * Get icon component for activity type
   * @param {string} type - Activity type
   * @returns {React.ReactElement} Icon component
   */
  const getActivityIcon = (type) => {
    switch (type) {
      case "envelope_update":
      case "envelope_create":
        return React.createElement(getIcon("DollarSign"), {
          className: "h-3 w-3",
        });
      case "envelope_delete":
        return React.createElement(getIcon("Trash2"), { className: "h-3 w-3" });
      case "bill_create":
      case "bill_update":
        return React.createElement(getIcon("Edit3"), { className: "h-3 w-3" });
      case "transfer":
        return React.createElement(getIcon("ArrowRightLeft"), {
          className: "h-3 w-3",
        });
      case "view":
        return React.createElement(getIcon("Eye"), { className: "h-3 w-3" });
      default:
        return React.createElement(getIcon("Activity"), {
          className: "h-3 w-3",
        });
    }
  };

  /**
   * Get Tailwind color name for activity type
   * @param {string} type - Activity type
   * @returns {string} Tailwind color name
   */
  const getActivityColor = (type) => {
    switch (type) {
      case "envelope_create":
      case "bill_create":
        return "emerald";
      case "envelope_update":
      case "bill_update":
        return "cyan";
      case "envelope_delete":
      case "bill_delete":
        return "rose";
      case "transfer":
        return "purple";
      case "view":
        return "gray";
      default:
        return "purple";
    }
  };

  const formatActivityDescription = (activity) => {
    const userName = activity.userName || "Someone";

    switch (activity.type) {
      case "envelope_create":
        return `${userName} created envelope "${activity.details?.name || "Unknown"}"`;
      case "envelope_update":
        return `${userName} updated envelope "${activity.details?.name || "Unknown"}"`;
      case "envelope_delete":
        return `${userName} deleted envelope "${activity.details?.name || "Unknown"}"`;
      case "bill_create":
        return `${userName} added bill "${activity.details?.name || "Unknown"}"`;
      case "bill_update":
        return `${userName} updated bill "${activity.details?.name || "Unknown"}"`;
      case "transfer":
        return `${userName} transferred $${activity.details?.amount || "0"} between envelopes`;
      case "view":
        return `${userName} is viewing the budget`;
      default:
        return `${userName} made changes to the budget`;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 10) return "just now";
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    return time.toLocaleDateString();
  };

  const otherActiveUsers = activeUsers.filter((user) => currentUser && user.id !== currentUser.id);

  if (otherActiveUsers.length === 0 && displayedActivities.length === 0) {
    return null;
  }

  return (
    <div className="glassmorphism rounded-xl mb-6 overflow-hidden">
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-white hover:bg-opacity-30 transition-all duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              {React.createElement(getIcon("Activity"), {
                className: "h-5 w-5 text-purple-600",
              })}
            </div>

            <div>
              <div className="font-semibold text-gray-900">Team Activity</div>
              <div className="text-sm text-gray-600">
                {otherActiveUsers.length > 0 && (
                  <span>
                    {otherActiveUsers.length} user
                    {otherActiveUsers.length === 1 ? "" : "s"} active "{" "}
                  </span>
                )}
                {displayedActivities.length} recent change
                {displayedActivities.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Live Activity Indicator */}
            {otherActiveUsers.length > 0 && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-emerald-100 rounded-full">
                <div className="h-2 w-2 bg-emerald-500 rounded-full">
                  <div className="absolute h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
                </div>
                <span className="text-xs font-medium text-emerald-700">Live</span>
              </div>
            )}

            {/* Expand/Collapse Icon */}
            {isExpanded
              ? React.createElement(getIcon("ChevronUp"), {
                  className: "h-5 w-5 text-gray-400",
                })
              : React.createElement(getIcon("ChevronDown"), {
                  className: "h-5 w-5 text-gray-400",
                })}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-white border-opacity-20">
          {/* Active Users Section */}
          {otherActiveUsers.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-cyan-50">
              <div className="flex items-center mb-3">
                {React.createElement(getIcon("Users"), {
                  className: "h-4 w-4 text-purple-600 mr-2",
                })}
                <span className="font-medium text-purple-900">Currently Online</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {otherActiveUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-2 px-3 py-2 bg-white bg-opacity-80 rounded-full"
                  >
                    <div
                      className="h-6 w-6 rounded-full border-2 border-white flex items-center justify-center"
                      style={{ backgroundColor: user.color || "#a855f7" }}
                    >
                      <span className="text-xs font-bold text-white">
                        {user.userName?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {user.userName || "Anonymous"}
                    </span>
                    <div className="h-2 w-2 bg-emerald-500 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity List */}
          {displayedActivities.length > 0 && (
            <div className="p-4">
              <div className="flex items-center mb-3">
                {React.createElement(getIcon("Clock"), {
                  className: "h-4 w-4 text-gray-600 mr-2",
                })}
                <span className="font-medium text-gray-900">Recent Activity</span>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {displayedActivities.map((activity, index) => {
                  const color = getActivityColor(activity.type);

                  return (
                    <div key={activity.id || index} className="flex items-start space-x-3">
                      <div className={`p-1.5 bg-${color}-100 rounded-lg flex-shrink-0`}>
                        <div className={`text-${color}-600`}>{getActivityIcon(activity.type)}</div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-900">
                          {formatActivityDescription(activity)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatTimeAgo(activity.timestamp)}
                        </div>
                      </div>

                      {/* User Avatar */}
                      {activity.userColor && (
                        <div
                          className="h-6 w-6 rounded-full border border-white flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: activity.userColor }}
                        >
                          <span className="text-xs font-bold text-white">
                            {activity.userName?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {recentActivity.length > 10 && (
                <div className="text-center mt-4">
                  <Button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                    View all activity
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityBanner;
