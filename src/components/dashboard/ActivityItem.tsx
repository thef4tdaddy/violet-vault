/**
 * ActivityItem Component
 *
 * A reusable row component for displaying activity items in the Activity Snapshot widget.
 * Supports transactions, bills, and paychecks with appropriate visual indicators.
 *
 * @module components/dashboard/ActivityItem
 */

import React from "react";
import { getIcon } from "@/utils/ui/icons";
import {
  type ActivityItem as ActivityItemData,
  type ActivityType,
  type BillStatus,
} from "@/hooks/dashboard/useRecentActivity";

/** Allocation status options for paychecks */
export type AllocationStatus = "allocated" | "partial" | "unallocated";
// Joe: Aligning with primary hook types to resolve TS mismatch.

/** ActivityItem component props */
export interface ActivityItemProps {
  /** Activity item data */
  item: ActivityItemData;
  /** Click handler */
  onClick?: (item: ActivityItemData) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Format a date for display
 */
const formatDate = (date: Date): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dateNormalized = new Date(date);
  dateNormalized.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((dateNormalized.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";

  return dateNormalized.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

/**
 * Format currency amount
 */
const formatCurrency = (amount: number, showSign = false): string => {
  const absAmount = Math.abs(amount).toFixed(2);
  if (showSign) {
    return amount >= 0 ? `+$${absAmount}` : `-$${absAmount}`;
  }
  return `$${absAmount}`;
};

/**
 * Get icon for activity type
 */
const getTypeIcon = (type: ActivityType, isIncome: boolean): React.ReactNode => {
  const iconProps = { className: "h-4 w-4" };
  switch (type) {
    case "bill":
      return React.createElement(getIcon("Calendar"), iconProps);
    case "paycheck":
      return React.createElement(getIcon("Wallet"), iconProps);
    default:
      return isIncome
        ? React.createElement(getIcon("ArrowDownLeft"), iconProps)
        : React.createElement(getIcon("ArrowUpRight"), iconProps);
  }
};

/**
 * Get status icon for bills
 */
const getBillStatusIcon = (
  status: BillStatus | undefined,
  isPaid: boolean | undefined
): React.ReactNode | null => {
  if (isPaid) {
    return React.createElement(getIcon("CheckCircle"), {
      className: "h-3 w-3 text-green-500",
    });
  }

  switch (status) {
    case "overdue":
      return React.createElement(getIcon("AlertCircle"), {
        className: "h-3 w-3 text-red-500",
      });
    case "due-soon":
      return React.createElement(getIcon("Clock"), {
        className: "h-3 w-3 text-yellow-500",
      });
    default:
      return null;
  }
};

/**
 * Get allocation status icon for paychecks
 */
const getAllocationStatusIcon = (status: AllocationStatus | undefined): React.ReactNode | null => {
  switch (status) {
    case "allocated":
      return React.createElement(getIcon("CheckCircle"), {
        className: "h-3 w-3 text-green-500",
      });
    case "partial":
      return React.createElement(getIcon("Clock"), {
        className: "h-3 w-3 text-yellow-500",
      });
    case "unallocated":
      return React.createElement(getIcon("AlertCircle"), {
        className: "h-3 w-3 text-orange-500",
      });
    default:
      return null;
  }
};

/**
 * Get icon background color classes
 */
const getIconBackgroundClasses = (
  type: ActivityType,
  isIncome: boolean,
  billStatus: BillStatus | undefined
): string => {
  if (type === "bill") {
    switch (billStatus) {
      case "overdue":
        return "bg-red-100 text-red-600";
      case "due-soon":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-purple-100 text-purple-600";
    }
  }

  if (type === "paycheck" || isIncome) {
    return "bg-white border-2 border-black text-green-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]";
  }

  return "bg-white border-2 border-black text-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]";
};

/**
 * Get amount color classes
 */
const getAmountClasses = (type: ActivityType, isIncome: boolean): string => {
  if (type === "paycheck" || isIncome) {
    return "text-green-600";
  }
  return "text-red-600";
};

/**
 * ActivityItem Component
 *
 * Displays a single activity item (transaction, bill, or paycheck) in a
 * consistent, scannable format with appropriate visual indicators.
 */
const ActivityItem: React.FC<ActivityItemProps> = ({ item, onClick, className = "" }) => {
  const {
    id,
    type,
    date,
    title,
    amount,
    category,
    isIncome,
    billStatus,
    isPaid,
    allocationStatus,
  } = item;

  const handleClick = (): void => {
    if (onClick) {
      onClick(item);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  const iconBgClasses = getIconBackgroundClasses(type, isIncome, billStatus);
  const amountClasses = getAmountClasses(type, isIncome);

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      className={`
        flex items-center justify-between p-4 rounded-xl border-2 border-black
        transition-all duration-200 bg-white
        ${onClick ? "cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none" : ""}
        ${className}
      `}
      data-testid={`activity-item-${id}`}
      aria-label={`${type}: ${title}, ${formatCurrency(amount)}`}
    >
      {/* Left side: Icon and details */}
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        {/* Type icon */}
        <div className={`p-2 rounded-full shrink-0 ${iconBgClasses}`}>
          {getTypeIcon(type, isIncome)}
        </div>

        {/* Text content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 truncate">{title}</span>
            {/* Status indicators */}
            {type === "bill" && getBillStatusIcon(billStatus, isPaid)}
            {type === "paycheck" && getAllocationStatusIcon(allocationStatus)}
          </div>
          <div className="flex items-center text-sm text-gray-500 gap-2">
            <span>{formatDate(date)}</span>
            {category && (
              <>
                <span className="text-gray-300">•</span>
                <span className="truncate">{category}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Amount */}
      <div className={`font-bold text-right shrink-0 ml-3 ${amountClasses}`}>
        {isIncome ? formatCurrency(amount, true) : formatCurrency(amount)}
      </div>
    </div>
  );
};

export default ActivityItem;
