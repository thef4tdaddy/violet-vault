import React from "react";
import { getIcon } from "@/utils";
import { formatPaycheckAmount } from "@/utils/budgeting/paycheckUtils";
import { Button } from "@/components/ui";

interface PaycheckHistoryItem {
  id: string | number;
  payerName?: string;
  allocationMode?: string;
  amount?: number;
  processedAt?: string;
  processedBy?: string;
  totalAllocated?: number;
  remainingAmount?: number;
  allocations?: { envelopeName: string }[];
}

interface PaycheckStats {
  count?: number;
  averageAmount?: number;
  totalAmount?: number;
  minAmount?: number;
  maxAmount?: number;
}

/**
 * Empty state component when no paychecks exist
 */
export const PaycheckEmptyState: React.FC = () => (
  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
    {React.createElement(getIcon("Clock"), {
      className: "h-8 w-8 mx-auto text-gray-400 mb-2",
    })}
    <p className="text-gray-500">No paycheck history available</p>
    <p className="text-gray-400 text-sm mt-1">Process your first paycheck to see history here</p>
  </div>
);

interface PaycheckStatsDisplayProps {
  paycheckStats: PaycheckStats;
}

/**
 * Statistics summary component
 */
export const PaycheckStatsDisplay: React.FC<PaycheckStatsDisplayProps> = ({ paycheckStats }) => (
  <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-gray-200 rounded-xl p-4">
    <h3 className="font-semibold text-gray-900 flex items-center mb-3">
      {React.createElement(getIcon("TrendingUp"), {
        className: "h-4 w-4 mr-2 text-green-600",
      })}
      Paycheck Statistics
    </h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div>
        <span className="text-gray-600 block">Total Processed</span>
        <span className="font-bold text-gray-900">{paycheckStats.count}</span>
      </div>
      <div>
        <span className="text-gray-600 block">Average Amount</span>
        <span className="font-bold text-gray-900">
          {formatPaycheckAmount(paycheckStats.averageAmount ?? 0)}
        </span>
      </div>
      <div>
        <span className="text-gray-600 block">Total Income</span>
        <span className="font-bold text-gray-900">
          {formatPaycheckAmount(paycheckStats.totalAmount ?? 0)}
        </span>
      </div>
      <div>
        <span className="text-gray-600 block">Range</span>
        <span className="font-bold text-gray-900">
          {formatPaycheckAmount(paycheckStats.minAmount ?? 0)} -{" "}
          {formatPaycheckAmount(paycheckStats.maxAmount ?? 0)}
        </span>
      </div>
    </div>
  </div>
);

interface PaycheckHistoryItemProps {
  paycheck: PaycheckHistoryItem;
  onSelectPaycheck?: (paycheck: PaycheckHistoryItem) => void;
  onDeletePaycheck?: (paycheck: PaycheckHistoryItem) => Promise<void> | void;
  deletingPaycheckId?: string | number | null;
}

/**
 * Helper functions for paycheck formatting
 */
const formatDate = (dateString?: string) => {
  if (!dateString) return "Invalid Date";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
};

const getModeLabel = (mode?: string) => {
  return mode === "allocate" ? "Standard" : "Proportional";
};

const getModeColor = (mode?: string) => {
  return mode === "allocate" ? "text-green-600 bg-green-50" : "text-blue-600 bg-blue-50";
};

/**
 * Individual paycheck history item component
 */
export const PaycheckHistoryItemCard: React.FC<PaycheckHistoryItemProps> = ({
  paycheck,
  onSelectPaycheck,
  onDeletePaycheck,
  deletingPaycheckId,
}) => {
  const handleSelect = () => {
    if (onSelectPaycheck) onSelectPaycheck(paycheck);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:border-gray-300 transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          {React.createElement(getIcon("User"), {
            className: "h-4 w-4 text-gray-500 mr-2",
          })}
          <span className="font-medium text-gray-900">{paycheck.payerName}</span>
          <span
            className={`ml-2 px-2 py-1 text-xs rounded-md ${getModeColor(paycheck.allocationMode)}`}
          >
            {getModeLabel(paycheck.allocationMode)}
          </span>
        </div>
        <span className="font-bold text-green-600">
          {formatPaycheckAmount(paycheck.amount ?? 0)}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center">
          {React.createElement(getIcon("Calendar"), {
            className: "h-3 w-3 mr-1",
          })}
          <span>{formatDate(paycheck.processedAt)}</span>
          <span className="ml-3">by {paycheck.processedBy}</span>
        </div>
        <div>
          <span className="text-green-600">
            {formatPaycheckAmount(paycheck.totalAllocated ?? 0)} allocated
          </span>
          {paycheck.remainingAmount !== undefined && paycheck.remainingAmount > 0 && (
            <span className="text-blue-600 ml-2">
              ({formatPaycheckAmount(paycheck.remainingAmount)} remaining)
            </span>
          )}
        </div>
      </div>

      {paycheck.allocations && paycheck.allocations.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Allocated to {paycheck.allocations.length} envelope
            {paycheck.allocations.length !== 1 ? "s" : ""}:
            <span className="ml-1">
              {paycheck.allocations
                .slice(0, 3)
                .map((alloc) => alloc.envelopeName)
                .join(", ")}
              {paycheck.allocations.length > 3 && ` and ${paycheck.allocations.length - 3} more`}
            </span>
          </div>
        </div>
      )}

      <div className="mt-3 flex justify-end">
        {onSelectPaycheck && (
          <Button
            type="button"
            onClick={handleSelect}
            className="mr-3 text-sm text-blue-600 hover:underline"
          >
            View
          </Button>
        )}

        {onDeletePaycheck && (
          <Button
            type="button"
            onClick={() => onDeletePaycheck(paycheck)}
            disabled={deletingPaycheckId === paycheck.id}
            className="text-sm text-red-600 disabled:opacity-60"
          >
            {deletingPaycheckId === paycheck.id ? "Deleting..." : "Delete"}
          </Button>
        )}
      </div>
    </div>
  );
};
