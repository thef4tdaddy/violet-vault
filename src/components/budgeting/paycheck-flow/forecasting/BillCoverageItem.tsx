/**
 * BillCoverageItem Component - Issue #1853
 * Displays individual bill with coverage status and visual indicators
 */

import React from "react";
import type { BillWithCoverageEnhanced } from "@/hooks/budgeting/paycheck-flow/useBillForecasting";
import {
  getCoverageIcon,
  getCoverageBorderColor,
  getCoverageBackgroundColor,
  getCoverageProgressColor,
  getCoverageTextColor,
  formatCentsAsCurrency,
  formatDaysUntilDue,
  getUrgencyColor,
} from "@/utils/domain/budgeting/billCoverageCalculations";

interface BillCoverageItemProps {
  bill: BillWithCoverageEnhanced;
}

export function BillCoverageItem({ bill }: BillCoverageItemProps) {
  const icon = getCoverageIcon(bill.status);
  const borderColor = getCoverageBorderColor(bill.status);
  const backgroundColor = getCoverageBackgroundColor(bill.status);
  const progressColor = getCoverageProgressColor(bill.status);
  const textColor = getCoverageTextColor(bill.status);
  const urgencyColor = getUrgencyColor(bill.daysUntilDue);

  return (
    <div
      className={`p-3 rounded-lg border-2 ${borderColor} ${backgroundColor} transition-all hover:shadow-md`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="font-bold text-sm text-slate-900">{bill.billName}</span>
        </div>
        <span className="font-black text-slate-900">
          {formatCentsAsCurrency(bill.billAmount)}
        </span>
      </div>

      {/* Details */}
      <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
        <span className={urgencyColor}>{formatDaysUntilDue(bill.daysUntilDue)}</span>
        <span>→ {bill.envelopeName}</span>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-2 mb-1">
        <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-1.5 rounded-full transition-all ${progressColor}`}
            style={{ width: `${Math.min(100, bill.coveragePercent)}%` }}
          />
        </div>
        <span className={`text-xs font-bold ${textColor} min-w-[45px] text-right`}>
          {bill.coveragePercent.toFixed(1)}%
        </span>
      </div>

      {/* Balance Breakdown */}
      <div className="text-xs text-slate-600 space-y-1">
        <div className="flex justify-between">
          <span>Current:</span>
          <span className="font-medium">{formatCentsAsCurrency(bill.currentBalance)}</span>
        </div>
        <div className="flex justify-between">
          <span>Allocation:</span>
          <span className="font-medium text-fuchsia-600">
            +{formatCentsAsCurrency(bill.allocationAmount)}
          </span>
        </div>
        <div className="flex justify-between border-t border-slate-300 pt-1">
          <span className="font-bold">Projected:</span>
          <span className={`font-bold ${bill.shortage > 0 ? "text-red-600" : "text-green-600"}`}>
            {formatCentsAsCurrency(bill.projectedBalance)}
          </span>
        </div>
      </div>

      {/* Shortage Warning */}
      {bill.shortage > 0 && (
        <div className="mt-2 pt-2 border-t border-red-300">
          <div className="flex items-center gap-1 text-red-700">
            <span className="text-sm font-black">⚠️ SHORT</span>
            <span className="text-sm font-bold">{formatCentsAsCurrency(bill.shortage)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
