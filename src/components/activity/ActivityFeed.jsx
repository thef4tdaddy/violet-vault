// src/components/activity/ActivityFeed.jsx
import React, { useState, useEffect } from "react";
import {
  Activity,
  Wallet,
  Receipt,
  CreditCard,
  PiggyBank,
  DollarSign,
  Trash2,
  Plus,
  Edit,
  ArrowRight,
  Clock,
  User,
  Filter,
} from "lucide-react";
import useActivityLogger from "../../hooks/common/useActivityLogger";
import { ACTIVITY_TYPES, ENTITY_TYPES } from "../../services/activityLogger";

/**
 * Activity Feed Component - Level 1 Budget History UI
 *
 * Simple chronological list of user activities with basic filtering
 */
const ActivityFeed = () => {
  const { getRecentActivity } = useActivityLogger();
  const [activities, setActivities] = useState([]);
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
      console.error("Failed to load activities:", error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // Get icon for activity type
  const getActivityIcon = (action, entityType) => {
    if (action.includes("created") || action.includes("added")) {
      return <Plus className="h-4 w-4 text-green-600" />;
    } else if (action.includes("updated") || action.includes("paid")) {
      return <Edit className="h-4 w-4 text-blue-600" />;
    } else if (action.includes("deleted")) {
      return <Trash2 className="h-4 w-4 text-red-600" />;
    }

    // Entity-specific icons
    switch (entityType) {
      case ENTITY_TYPES.ENVELOPE:
        return <Wallet className="h-4 w-4 text-purple-600" />;
      case ENTITY_TYPES.TRANSACTION:
        return <ArrowRight className="h-4 w-4 text-gray-600" />;
      case ENTITY_TYPES.BILL:
        return <Receipt className="h-4 w-4 text-orange-600" />;
      case ENTITY_TYPES.PAYCHECK:
        return <DollarSign className="h-4 w-4 text-emerald-600" />;
      case ENTITY_TYPES.DEBT:
        return <CreditCard className="h-4 w-4 text-red-600" />;
      case ENTITY_TYPES.SAVINGS_GOAL:
        return <PiggyBank className="h-4 w-4 text-blue-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  // Format activity description
  const formatActivityDescription = (activity) => {
    const { action, entityType, details } = activity;
    const userName = details?.userName || activity.userName || "Someone";

    switch (action) {
      case ACTIVITY_TYPES.ENVELOPE_CREATED:
        return `${userName} created envelope "${details?.name}"`;
      case ACTIVITY_TYPES.ENVELOPE_UPDATED:
        return `${userName} updated envelope "${details?.name}"`;
      case ACTIVITY_TYPES.ENVELOPE_DELETED:
        return `${userName} deleted envelope "${details?.name}"`;
      case ACTIVITY_TYPES.ENVELOPE_FUNDED:
        return `${userName} funded envelope with $${details?.amount?.toFixed(2)}`;

      case ACTIVITY_TYPES.TRANSACTION_ADDED:
        return `${userName} added transaction "${details?.description}" ($${details?.amount?.toFixed(2)})`;
      case ACTIVITY_TYPES.TRANSACTION_UPDATED:
        return `${userName} updated transaction "${details?.description}"`;
      case ACTIVITY_TYPES.TRANSACTION_DELETED:
        return `${userName} deleted transaction "${details?.description}"`;
      case ACTIVITY_TYPES.TRANSACTIONS_IMPORTED:
        return `${userName} imported ${details?.count} transactions`;

      case ACTIVITY_TYPES.BILL_CREATED:
        return `${userName} created bill "${details?.name}" ($${details?.amount?.toFixed(2)})`;
      case ACTIVITY_TYPES.BILL_UPDATED:
        return `${userName} updated bill "${details?.name}"`;
      case ACTIVITY_TYPES.BILL_PAID:
        return `${userName} paid bill "${details?.name}" ($${details?.amount?.toFixed(2)})`;

      case ACTIVITY_TYPES.PAYCHECK_PROCESSED:
        return `${userName} processed paycheck from ${details?.payerName} ($${details?.amount?.toFixed(2)})`;
      case ACTIVITY_TYPES.PAYCHECK_DELETED:
        return `${userName} deleted paycheck from ${details?.payerName}`;

      case ACTIVITY_TYPES.DEBT_CREATED:
        return `${userName} created debt "${details?.name}" with ${details?.creditor}`;
      case ACTIVITY_TYPES.DEBT_UPDATED:
        return `${userName} updated debt "${details?.name}"`;

      case ACTIVITY_TYPES.SYNC_COMPLETED:
        return `${userName} completed data sync (${details?.itemsChanged} items)`;

      default:
        return `${userName} performed ${action.replace(/_/g, " ")} on ${entityType}`;
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 1000 * 60) {
      return "Just now";
    } else if (diffMs < 1000 * 60 * 60) {
      const minutes = Math.floor(diffMs / (1000 * 60));
      return `${minutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Filter options
  const filterOptions = [
    { value: "all", label: "All Activity", icon: Activity },
    { value: ENTITY_TYPES.ENVELOPE, label: "Envelopes", icon: Wallet },
    {
      value: ENTITY_TYPES.TRANSACTION,
      label: "Transactions",
      icon: ArrowRight,
    },
    { value: ENTITY_TYPES.BILL, label: "Bills", icon: Receipt },
    { value: ENTITY_TYPES.PAYCHECK, label: "Paychecks", icon: DollarSign },
    { value: ENTITY_TYPES.DEBT, label: "Debts", icon: CreditCard },
  ];

  if (loading) {
    return (
      <div className="glassmorphism rounded-3xl p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">
            Loading activity history...
          </span>
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
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
              Activity History
            </h2>
            <p className="text-gray-600 mt-1">
              Track all changes and actions in your budget
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Activity List */}
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Activity Yet
            </h3>
            <p className="text-gray-500">
              Start using your budget to see activity history here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div
                key={activity.id || index}
                className="flex items-start gap-4 p-4 bg-white/50 rounded-xl border border-white/20 hover:bg-white/70 transition-colors"
              >
                <div className="flex-shrink-0 p-2 bg-white rounded-lg border border-gray-200">
                  {getActivityIcon(activity.action, activity.entityType)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {formatActivityDescription(activity)}
                  </p>

                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(activity.timestamp)}
                    </div>

                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
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
                <button
                  onClick={() => setLimit(limit + 20)}
                  className="px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Load More Activity
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
