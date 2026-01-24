import React from "react";
import { ENVELOPE_TYPES } from "../../../constants/categories";
import { BIWEEKLY_MULTIPLIER } from "../../../constants/frequency";

interface EnvelopeForSummary {
  envelopeType?: string;
  totalSpent?: number;
  monthlyBudget?: number;
  targetAmount?: number;
  currentBalance?: number;
  progress?: number;
  lastFunded?: string | Date | null;
  totalUpcoming?: number;
  totalOverdue?: number;
}

/**
 * Envelope activity summary component
 * Shows different metrics based on envelope type (Variable vs Bill)
 *
 * Part of EnvelopeItem refactoring for ESLint compliance
 * Related to Epic #158 - Mobile UI/UX Enhancements
 * Memoized to prevent unnecessary re-renders
 */
const EnvelopeActivitySummary = React.memo(({ envelope }: { envelope: EnvelopeForSummary }) => {
  // Check if envelope type is explicitly variable/standard, or fallback to standard logic
  // Liabilities/Bills should fall through to the second return
  // We explicitly check against VARIABLE type ("standard")
  // If type is "liability", "bill", "debt", etc. it will skip this block
  if (envelope.envelopeType === ENVELOPE_TYPES.VARIABLE) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4">
        {/* Spent Box */}
        <div className="flex flex-col items-start justify-center bg-rose-50 rounded-lg p-3 border border-rose-200">
          <p className="text-xs sm:text-sm font-medium text-rose-700 mb-1">Spent (30d)</p>
          <p className="text-base sm:text-lg font-bold text-rose-700 whitespace-nowrap">
            ${(envelope.totalSpent ?? 0).toFixed(2)}
          </p>
        </div>
        {/* Monthly Budget Box */}
        <div className="flex flex-col items-start justify-center bg-sky-50 rounded-lg p-3 border border-sky-200">
          <p className="text-xs sm:text-sm font-medium text-sky-700 mb-1">Monthly Budget</p>
          <p className="text-base sm:text-lg font-bold text-sky-700 whitespace-nowrap">
            ${(envelope.monthlyBudget || 0).toFixed(2)}
          </p>
        </div>
        {/* Biweekly Box */}
        <div className="flex flex-col items-start justify-center bg-emerald-50 rounded-lg p-3 border border-emerald-200">
          <p className="text-xs sm:text-sm font-medium text-emerald-700 mb-1">Biweekly</p>
          <p className="text-base sm:text-lg font-bold text-emerald-700 whitespace-nowrap">
            ${((envelope.monthlyBudget || 0) / BIWEEKLY_MULTIPLIER).toFixed(2)}
          </p>
        </div>
      </div>
    );
  }

  // Bill envelope summary
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs py-2 border-t border-black/5 mt-2">
      <div className="flex justify-between sm:block text-center bg-black/5 sm:bg-transparent p-2 sm:p-0 rounded">
        <p className="text-gray-500">Spent</p>
        <p className="font-bold text-red-600">${(envelope.totalSpent ?? 0).toFixed(2)}</p>
      </div>
      <div className="flex justify-between sm:block text-center bg-black/5 sm:bg-transparent p-2 sm:p-0 rounded">
        <p className="text-gray-500">Upcoming</p>
        <p className="font-bold text-orange-600">${(envelope.totalUpcoming ?? 0).toFixed(2)}</p>
      </div>
      <div className="flex justify-between sm:block text-center bg-black/5 sm:bg-transparent p-2 sm:p-0 rounded">
        <p className="text-gray-500">Overdue</p>
        <p className="font-bold text-red-700">${(envelope.totalOverdue ?? 0).toFixed(2)}</p>
      </div>
    </div>
  );
});

EnvelopeActivitySummary.displayName = "EnvelopeActivitySummary";

export default EnvelopeActivitySummary;
