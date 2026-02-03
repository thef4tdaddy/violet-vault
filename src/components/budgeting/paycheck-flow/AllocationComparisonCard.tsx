/**
 * Allocation Comparison Card Component
 * Side-by-side comparison UI for Review Step
 * Part of Issue #[NUMBER]: Historical Comparison View
 */

import React, { useState } from "react";
import type { AllocationComparison } from "@/types/allocation-comparison";
import { AllocationInsightsService } from "@/services/budgeting/allocationInsightsService";

interface AllocationComparisonCardProps {
  comparison: AllocationComparison | null;
  isLoading?: boolean;
}

/**
 * Format cents to dollar string with commas
 */
const formatCents = (cents: number): string => {
  const dollars = cents / 100;
  return dollars.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Get color class for sentiment
 */
const getSentimentColor = (sentiment: "positive" | "negative" | "neutral" | "warning"): string => {
  switch (sentiment) {
    case "positive":
      return "text-green-600";
    case "negative":
      return "text-red-600";
    case "warning":
      return "text-amber-600";
    default:
      return "text-slate-600";
  }
};

export const AllocationComparisonCard: React.FC<AllocationComparisonCardProps> = ({
  comparison,
  isLoading = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-slate-50 hard-border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-center text-slate-600">
          <div className="animate-pulse">Loading comparison...</div>
        </div>
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="bg-blue-50 hard-border rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-900">
          💡 <strong>First time allocating?</strong> Your next paycheck will show comparison with
          this one!
        </p>
      </div>
    );
  }

  const { changes } = comparison;
  const hasChanges = changes.length > 0;

  return (
    <div className="bg-white hard-border rounded-lg p-6 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      {/* Header with toggle */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " " || e.key === "Space") {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        aria-expanded={isExpanded}
        aria-controls="comparison-content"
        className="w-full flex items-center justify-between text-left cursor-pointer"
      >
        <h3 className="font-black text-slate-900">
          {isExpanded ? "▼" : "▶"} COMPARE WITH PREVIOUS PAYCHECK
        </h3>
        <span className="text-sm text-slate-600">
          {hasChanges ? `${changes.length} envelopes` : "No changes"}
        </span>
      </div>

      {/* Expanded comparison view */}
      {isExpanded && hasChanges && (
        <div id="comparison-content" className="mt-4 space-y-3">
          {/* Column headers */}
          <div className="grid grid-cols-2 gap-4 pb-2 border-b-2 border-slate-200">
            <div className="font-bold text-slate-700">THIS TIME</div>
            <div className="font-bold text-slate-700">LAST TIME</div>
          </div>

          {/* Comparison rows */}
          {changes.map((change) => {
            const isSignificant = Math.abs(change.changeCents) >= 100; // $1 or more

            return (
              <div
                key={change.envelopeId}
                className={`grid grid-cols-2 gap-4 p-3 rounded ${
                  isSignificant ? "bg-slate-50" : "bg-white"
                }`}
              >
                {/* Current allocation */}
                <div>
                  <div className="font-bold text-slate-900">{change.envelopeName}</div>
                  <div className="text-lg font-black text-slate-900">
                    {formatCents(change.currentAmount)}
                  </div>
                </div>

                {/* Previous allocation with change indicator */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-600">Previous</div>
                    <div className="text-slate-700">{formatCents(change.previousAmount)}</div>
                  </div>
                  {change.trend !== "stable" && (
                    <div
                      className={`flex items-center gap-1 font-bold ${getSentimentColor(change.sentiment)}`}
                    >
                      <span>{AllocationInsightsService.getTrendArrow(change.trend)}</span>
                      <span className="text-sm">
                        {AllocationInsightsService.formatChange(change.changeCents)}
                      </span>
                      <span className="text-xs">
                        {AllocationInsightsService.getSentimentEmoji(change.sentiment)}
                      </span>
                    </div>
                  )}
                  {change.trend === "stable" && (
                    <div className="text-slate-500 text-sm">
                      {AllocationInsightsService.getTrendArrow(change.trend)} same
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state when expanded */}
      {isExpanded && !hasChanges && (
        <div className="mt-4 text-center text-slate-600 p-4">
          <p>No changes from previous allocation</p>
        </div>
      )}
    </div>
  );
};

export default AllocationComparisonCard;
