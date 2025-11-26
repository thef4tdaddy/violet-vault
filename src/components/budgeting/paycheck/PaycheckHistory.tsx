import React from "react";
import { getIcon } from "@/utils";
import {
  PaycheckEmptyState,
  PaycheckStatsDisplay,
  PaycheckHistoryItemCard,
} from "./PaycheckHistoryComponents";

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

const PaycheckHistory = ({
  paycheckHistory = [],
  paycheckStats,
  onSelectPaycheck,
  onDeletePaycheck,
  deletingPaycheckId,
}: {
  paycheckHistory?: PaycheckHistoryItem[];
  paycheckStats?: PaycheckStats | null;
  onSelectPaycheck?: (paycheck: PaycheckHistoryItem) => void;
  onDeletePaycheck?: (paycheck: PaycheckHistoryItem) => Promise<void> | void;
  deletingPaycheckId?: string | number | null;
}) => {
  if (paycheckHistory.length === 0) {
    return <PaycheckEmptyState />;
  }

  return (
    <div className="glassmorphism rounded-2xl p-6 border-2 border-black space-y-4">
      {/* Statistics Summary */}
      {paycheckStats && paycheckStats.count !== undefined && paycheckStats.count > 0 && (
        <PaycheckStatsDisplay paycheckStats={paycheckStats} />
      )}

      {/* Recent History */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 flex items-center">
          {React.createElement(getIcon("Clock"), {
            className: "h-4 w-4 mr-2 text-green-600",
          })}
          Recent Paychecks ({Math.min(10, paycheckHistory.length)} most recent)
        </h4>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {paycheckHistory.slice(0, 10).map((paycheck) => (
            <PaycheckHistoryItemCard
              key={paycheck.id}
              paycheck={paycheck}
              onSelectPaycheck={onSelectPaycheck}
              onDeletePaycheck={onDeletePaycheck}
              deletingPaycheckId={deletingPaycheckId}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaycheckHistory;
