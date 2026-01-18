// src/components/activity/ActivityFeed.jsx
import { Select } from "@/components/ui";
import { Button } from "@/components/ui";
import React, { useState, useEffect } from "react";
import { getIcon } from "@/utils";
import useActivityLogger from "@/hooks/platform/common/useActivityLogger";
import { ENTITY_TYPES } from "@/services/logging/activityLogger";
import logger from "@/utils/core/common/logger";
import { formatActivityDescription } from "@/utils/features/activity/activityFormatters";
import { getActivityIconInfo } from "@/utils/features/activity/activityIcons";
import { formatTimestamp } from "@/utils/features/activity/timeFormatters";
import type { AuditLogEntry } from "@/db/types";

/**
 * Activity Feed Component - Level 1 Budget History UI
 *
 * Simple chronological list of user activities with basic filtering
 */
const ActivityFeed = () => {
  const { getRecentActivity } = useActivityLogger();
  const [activities, setActivities] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, envelope, transaction, bill, paycheck, debt
  const [limit, setLimit] = useState(20);

  // Load activities on mount and when filter changes
  useEffect(() => {
    loadActivities();
  }, [filter, limit]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadActivities = async () => {
    setLoading(true);
    try {
      const entityType = filter === "all" ? null : filter;
      const activityList = await getRecentActivity(limit, entityType);
      setActivities(activityList);
    } catch (error) {
      logger.error("Failed to load activities:", error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter options
  const filterOptions = [
    { value: "all", label: "All Activity", icon: "Activity" },
    { value: ENTITY_TYPES.ENVELOPE, label: "Envelopes", icon: "Wallet" },
    {
      value: ENTITY_TYPES.TRANSACTION,
      label: "Transactions",
      icon: getIcon("arrow-right"),
    },
    { value: ENTITY_TYPES.BILL, label: "Bills", icon: getIcon("Receipt") },
    {
      value: ENTITY_TYPES.PAYCHECK,
      label: "Paychecks",
      icon: getIcon("DollarSign"),
    },
    { value: ENTITY_TYPES.DEBT, label: "Debts", icon: getIcon("CreditCard") },
  ];

  if (loading) {
    return (
      <div className="glassmorphism rounded-3xl p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Loading activity history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filter */}
      <div className="glassmorphism rounded-3xl p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <div className="relative mr-4">
                <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative bg-indigo-500 p-3 rounded-2xl">
                  {React.createElement(getIcon("Activity"), {
                    className: "h-6 w-6 text-white",
                  })}
                </div>
              </div>
              Activity History
            </h2>
            <p className="text-gray-600 mt-1">Track all changes and actions in your budget</p>
          </div>

          <div className="flex items-center gap-3">
            {React.createElement(getIcon("Filter"), {
              className: "h-4 w-4 text-gray-500",
            })}
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Activity List */}
        {activities.length === 0 ? (
          <div className="text-center py-12">
            {React.createElement(getIcon("Activity"), {
              className: "h-16 w-16 mx-auto mb-4 text-gray-300",
            })}
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Yet</h3>
            <p className="text-gray-500">Start using your budget to see activity history here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div
                key={activity.id || index}
                className="flex items-start gap-4 p-4 bg-white/50 rounded-xl border border-white/20 hover:bg-white/70 transition-colors"
              >
                <div className="flex-shrink-0 p-2 bg-white rounded-lg border border-gray-200">
                  {(() => {
                    const iconInfo = getActivityIconInfo(activity.action, activity.entityType);
                    const IconComponent = iconInfo.component;
                    return React.createElement(IconComponent, {
                      className: iconInfo.className,
                    });
                  })()}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {formatActivityDescription(activity)}
                  </p>

                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      {React.createElement(getIcon("Clock"), {
                        className: "h-3 w-3",
                      })}
                      {formatTimestamp(activity.timestamp)}
                    </div>

                    <div className="flex items-center gap-1">
                      {React.createElement(getIcon("User"), {
                        className: "h-3 w-3",
                      })}
                      {activity.userName || "Unknown User"}
                    </div>

                    <div className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                      {activity.entityType?.replace("_", " ")}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {activities.length >= limit && (
              <div className="text-center pt-4">
                <Button
                  onClick={() => setLimit(limit + 20)}
                  className="px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Load More Activity
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
