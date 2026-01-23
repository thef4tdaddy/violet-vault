/**
 * ActivitySnapshot Component
 *
 * Dashboard widget displaying recent financial activity at a glance.
 * Shows recent transactions, upcoming bills, and recent paychecks in a
 * compact, scannable format.
 *
 * @module components/dashboard/ActivitySnapshot
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { getIcon } from "@/utils/ui/icons";
import {
  useRecentActivity,
  type ActivityItem as ActivityItemType,
} from "@/hooks/dashboard/useRecentActivity";
import ActivityItem from "./ActivityItem";

// Get icons once at module level
const ChevronRightIcon = getIcon("chevron-right");
const ActivityIcon = getIcon("activity");
const RefreshCwIcon = getIcon("RefreshCw");
const ReceiptIcon = getIcon("Receipt");
const CalendarIcon = getIcon("Calendar");
const WalletIcon = getIcon("Wallet");

/** Section header props */
interface SectionHeaderProps {
  title: string;
  icon: React.ReactNode;
  onViewAll?: () => void;
  count?: number;
}

/**
 * Section header component with v2.0 ALL CAPS pattern
 */
const SectionHeader: React.FC<SectionHeaderProps> = ({ title, icon, onViewAll, count }) => {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="bg-white rounded-full p-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
          {icon}
        </div>
        <h4 className="font-black text-black text-sm tracking-tight">
          <span className="text-base">{title.charAt(0)}</span>
          {title.slice(1).toUpperCase()}
          {typeof count === "number" && count > 0 && (
            <span className="ml-2 text-xs font-normal text-gray-500">({count})</span>
          )}
        </h4>
      </div>
      {onViewAll && (
        <span
          role="button"
          tabIndex={0}
          onClick={onViewAll}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onViewAll()}
          className="flex items-center text-xs text-purple-600 hover:text-purple-800 font-medium transition-colors cursor-pointer"
          aria-label={`View all ${title.toLowerCase()}`}
        >
          View All
          <ChevronRightIcon className="h-3 w-3 ml-0.5" />
        </span>
      )}
    </div>
  );
};

/** Empty state props */
interface EmptyStateProps {
  message: string;
}

/**
 * Empty state component
 */
const EmptyState: React.FC<EmptyStateProps> = ({ message }) => {
  return (
    <div className="text-center py-4 text-gray-500 text-sm">
      <ActivityIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
      {message}
    </div>
  );
};

/** Activity section props */
interface ActivitySectionProps {
  title: string;
  icon: React.ReactNode;
  items: ActivityItemType[];
  onItemClick: (item: ActivityItemType) => void;
  onViewAll: () => void;
  emptyMessage: string;
}

/**
 * Activity section for rendering items
 */
const ActivitySection: React.FC<ActivitySectionProps> = ({
  title,
  icon,
  items,
  onItemClick,
  onViewAll,
  emptyMessage,
}) => {
  return (
    <div className="lg:col-span-1">
      <SectionHeader title={title} icon={icon} onViewAll={onViewAll} count={items.length} />
      {items.length === 0 ? (
        <div className="text-center py-4 text-gray-400 text-sm">{emptyMessage}</div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <ActivityItem key={item.id} item={item} onClick={onItemClick} />
          ))}
        </div>
      )}
    </div>
  );
};

/** Widget header props */
interface WidgetHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
}

/**
 * Widget header with title and refresh button
 */
const WidgetHeader: React.FC<WidgetHeaderProps> = ({ isLoading, onRefresh }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h3 className="font-black text-black text-lg flex items-center gap-2 tracking-tighter">
        <ActivityIcon className="h-5 w-5 text-black" />
        <span>
          <span className="text-xl">A</span>CTIVITY <span className="text-xl">S</span>NAPSHOT
        </span>
      </h3>
      {!isLoading && (
        <span
          role="button"
          tabIndex={0}
          onClick={onRefresh}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onRefresh()}
          className="p-1.5 rounded-lg border-2 border-black hover:bg-black hover:text-white transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-px active:translate-y-px active:shadow-none"
          aria-label="Refresh activity"
          title="Refresh"
        >
          <RefreshCwIcon className="h-4 w-4" />
        </span>
      )}
    </div>
  );
};

/** Error state props */
interface ErrorStateProps {
  onRetry: () => void;
}

/**
 * Error state component
 */
const ErrorState: React.FC<ErrorStateProps> = ({ onRetry }) => {
  return (
    <div className="text-center py-8 text-red-500">
      <p className="mb-2">Failed to load activity</p>
      <span
        role="button"
        tabIndex={0}
        onClick={onRetry}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onRetry()}
        className="text-sm text-purple-600 hover:underline cursor-pointer"
      >
        Try again
      </span>
    </div>
  );
};

/** ActivitySnapshot component props */
export interface ActivitySnapshotProps {
  /** Number of transactions to show (default: 5) */
  transactionLimit?: number;
  /** Days ahead to look for bills (default: 7) */
  billDaysAhead?: number;
  /** Number of paychecks to show (default: 2) */
  paycheckLimit?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ActivitySnapshot Component
 *
 * Dashboard widget showing recent financial activity including:
 * - Last 5 transactions with color-coded amounts
 * - Upcoming bills (next 7 days) with status indicators
 * - Recent paychecks with allocation status
 */
const ActivitySnapshot: React.FC<ActivitySnapshotProps> = ({
  transactionLimit = 5,
  billDaysAhead = 7,
  paycheckLimit = 2,
  className = "",
}) => {
  const navigate = useNavigate();

  const { recentTransactions, upcomingBills, recentPaychecks, isLoading, isError, refetch } =
    useRecentActivity({
      transactionLimit,
      billDaysAhead,
      paycheckLimit,
    });

  // Navigation handlers
  const handleTransactionClick = (item: ActivityItemType): void => {
    navigate("/app/transactions", { state: { highlightId: item.id } });
  };

  const handleBillClick = (item: ActivityItemType): void => {
    navigate("/app/bills", { state: { highlightId: item.id } });
  };

  const handlePaycheckClick = (item: ActivityItemType): void => {
    navigate("/app/paycheck", { state: { highlightId: item.id } });
  };

  const handleViewAllTransactions = (): void => {
    navigate("/app/transactions");
  };
  const handleViewAllBills = (): void => {
    navigate("/app/bills");
  };
  const handleViewAllPaychecks = (): void => {
    navigate("/app/paycheck");
  };

  // Check if there's any activity at all
  const hasNoActivity =
    recentTransactions.length === 0 && upcomingBills.length === 0 && recentPaychecks.length === 0;

  return (
    <div
      className={`
        bg-white rounded-2xl p-6 
        border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
        ${className}
      `}
      data-testid="activity-snapshot"
    >
      <WidgetHeader isLoading={isLoading} onRefresh={refetch} />

      {isError && <ErrorState onRetry={refetch} />}

      {isLoading && !isError && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-testid="loading-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-8 w-3/4 bg-gray-200 rounded mb-3" />
              <div className="space-y-2">
                <div className="h-[76px] bg-gray-100 rounded-lg" />
                <div className="h-[76px] bg-gray-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {hasNoActivity && <EmptyState message="No recent activity to display" />}

          {!hasNoActivity && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ActivitySection
                title="Recent Transactions"
                icon={<ReceiptIcon className="h-4 w-4 text-purple-600" />}
                items={recentTransactions}
                onItemClick={handleTransactionClick}
                onViewAll={handleViewAllTransactions}
                emptyMessage="No recent transactions"
              />
              <ActivitySection
                title="Upcoming Bills"
                icon={<CalendarIcon className="h-4 w-4 text-purple-600" />}
                items={upcomingBills}
                onItemClick={handleBillClick}
                onViewAll={handleViewAllBills}
                emptyMessage="No bills due soon"
              />
              <ActivitySection
                title="Recent Paychecks"
                icon={<WalletIcon className="h-4 w-4 text-purple-600" />}
                items={recentPaychecks}
                onItemClick={handlePaycheckClick}
                onViewAll={handleViewAllPaychecks}
                emptyMessage="No recent paychecks"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ActivitySnapshot;
