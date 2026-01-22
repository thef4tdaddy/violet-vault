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

/** Activity type options */
export type ActivityType = "transaction" | "bill" | "paycheck";

/** Bill status options */
export type BillStatus = "overdue" | "due-soon" | "upcoming";

/** Allocation status options */
export type AllocationStatus = "allocated" | "partial" | "unallocated";

/** Activity item data interface */
export interface ActivityItemData {
  /** Unique identifier */
  id: string;
  /** Type of activity */
  type: ActivityType;
  /** Display date for the activity */
  date: Date;
  /** Primary display text (merchant/bill name/payer) */
  title: string;
  /** Activity amount (positive for income, negative for expense) */
  amount: number;
  /** Optional category/description */
  category?: string;
  /** Whether the amount is income */
  isIncome: boolean;
  /** Status for bills (overdue, due-soon, upcoming) */
  billStatus?: BillStatus;
  /** Whether a bill has been paid */
  isPaid?: boolean;
  /** Allocation status for paychecks */
  allocationStatus?: AllocationStatus;
  /** Original data reference */
  originalData?: unknown;
}

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
 * Get background color classes based on activity type and status
 */
const getBackgroundClasses = (
  type: ActivityType,
  isIncome: boolean,
  billStatus: BillStatus | undefined
): string => {
  if (type === "bill") {
    switch (billStatus) {
      case "overdue":
        return "bg-red-50 border-red-200";
      case "due-soon":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-purple-50 border-purple-200";
    }
  }

  if (type === "paycheck" || isIncome) {
    return "bg-green-50 border-green-200";
  }

  return "bg-gray-50 border-gray-200";
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
    return "bg-green-100 text-green-600";
  }

  return "bg-red-100 text-red-600";
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

  const bgClasses = getBackgroundClasses(type, isIncome, billStatus);
  const iconBgClasses = getIconBackgroundClasses(type, isIncome, billStatus);
  const amountClasses = getAmountClasses(type, isIncome);

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      className={`
        flex items-center justify-between p-3 rounded-lg border
        transition-all duration-200
        ${bgClasses}
        ${onClick ? "cursor-pointer hover:shadow-md hover:scale-[1.01]" : ""}
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
