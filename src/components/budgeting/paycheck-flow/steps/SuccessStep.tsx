/**
 * Success Step - Celebration and summary (Step 3)
 * Full implementation for Issue #161
 * Part of Epic #156: Polyglot Human-Centered Paycheck Flow v2.1
 * Enhanced with Historical Comparison Insights
 */

import React, { useEffect, useMemo } from "react";
import { usePaycheckFlowStore } from "@/stores/ui/paycheckFlowStore";
import { PaycheckHistoryService } from "@/utils/core/services/paycheckHistory";
import { AllocationComparisonService } from "@/services/budgeting/allocationComparisonService";
import { AllocationInsightsService } from "@/services/budgeting/allocationInsightsService";
import AllocationInsights from "@/components/budgeting/paycheck-flow/AllocationInsights";
import Button from "@/components/ui/buttons/Button";

interface SuccessStepProps {
  onNext: () => void;
  onBack: () => void;
  onFinish: () => void;
}

/**
 * Format cents to dollar string with commas
 * @param cents - Amount in cents
 * @returns Formatted string (e.g., "$2,500.00")
 */
const formatCentsToDollarsWithCommas = (cents: number): string => {
  const dollars = cents / 100;
  return dollars.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const SuccessStep: React.FC<SuccessStepProps> = ({ onFinish }) => {
  const paycheckAmountCents = usePaycheckFlowStore((state) => state.paycheckAmountCents);
  const payerName = usePaycheckFlowStore((state) => state.payerName);
  const allocations = usePaycheckFlowStore((state) => state.allocations);
  const reset = usePaycheckFlowStore((state) => state.reset);

  // Sort allocations by amount (largest first) for "top allocations" display
  const sortedAllocations = [...allocations].sort((a, b) => b.amountCents - a.amountCents);
  const topAllocations = sortedAllocations.slice(0, 5); // Show top 5

  const envelopesFunded = allocations.length;

  // Generate insights from comparison with previous allocation
  const insights = useMemo(() => {
    if (!paycheckAmountCents || allocations.length === 0) {
      return [];
    }

    const allocationHistory = PaycheckHistoryService.getAllocationHistory();

    // NOTE: We assume `allocationHistory` is ordered with the most recent allocation at index 0.
    // The ReviewStep saves the new allocation to history *before* navigating to this SuccessStep,
    // so `allocationHistory[0]` is expected to be the allocation just created in this flow run,
    // and `allocationHistory[1]` is treated as the "previous" allocation used for comparison.
    // If the save order, history ordering, or persistence timing ever changes, this logic must be
    // revisited, as the "previous" allocation may no longer be at index 1.
    const previousAllocation = allocationHistory[1];

    if (!previousAllocation) {
      return [];
    }

    const currentSnapshot = AllocationComparisonService.createCurrentSnapshot(
      paycheckAmountCents,
      allocations,
      payerName
    );

    const previousSnapshot =
      AllocationComparisonService.createSnapshotFromHistory(previousAllocation);

    const comparison = AllocationComparisonService.getComparison(currentSnapshot, previousSnapshot);

    return AllocationInsightsService.generateInsights(
      comparison.changes,
      currentSnapshot,
      previousSnapshot
    );
  }, [paycheckAmountCents, allocations, payerName]);

  // Handle finish - reset wizard state and close
  const handleFinish = () => {
    reset();
    onFinish();
  };

  // TODO: Add confetti animation on mount
  // Can use canvas-confetti library in future iteration
  useEffect(() => {
    // Placeholder for confetti effect
    // Example: confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  }, []);

  return (
    <div className="max-w-2xl mx-auto text-center">
      {/* Success Icon */}
      <div className="mb-8">
        <div className="inline-block p-8 bg-green-50 hard-border rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-6xl">✓</div>
        </div>
      </div>

      {/* Success Message */}
      <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">PAYCHECK ALLOCATED!</h2>
      <p className="text-lg text-slate-600 mb-8">
        Your {formatCentsToDollarsWithCommas(paycheckAmountCents || 0)} paycheck
        {payerName && ` from ${payerName}`} has been successfully distributed across your envelopes.
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white hard-border rounded-lg p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-sm text-slate-600 mb-1">Envelopes Funded</div>
          <div className="text-3xl font-black text-fuchsia-600">{envelopesFunded}</div>
        </div>
        <div className="bg-white hard-border rounded-lg p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-sm text-slate-600 mb-1">Total Allocated</div>
          <div className="text-3xl font-black text-green-600">
            {formatCentsToDollarsWithCommas(paycheckAmountCents || 0)}
          </div>
        </div>
      </div>

      {/* Top Allocations */}
      {topAllocations.length > 0 && (
        <div className="bg-white hard-border rounded-lg p-6 mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="font-black text-slate-900 mb-4">YOUR ALLOCATIONS</h3>
          <div className="space-y-3">
            {topAllocations.map((allocation) => {
              const percent = paycheckAmountCents
                ? ((allocation.amountCents / paycheckAmountCents) * 100).toFixed(1)
                : 0;

              return (
                <div
                  key={allocation.envelopeId}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded"
                >
                  <div className="text-left">
                    <div className="font-bold text-slate-900">{allocation.envelopeId}</div>
                    <div className="text-xs text-slate-600">{percent}% of paycheck</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-slate-900">
                      {formatCentsToDollarsWithCommas(allocation.amountCents)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Insights Section */}
      {insights.length > 0 && (
        <div className="bg-white hard-border rounded-lg p-6 mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <AllocationInsights insights={insights} />
        </div>
      )}

      {/* Action Button */}
      <Button
        onClick={handleFinish}
        variant="primary"
        size="lg"
        fullWidth
        className="
          bg-fuchsia-500
          hover:bg-fuchsia-600
          font-black
          text-lg
          tracking-wide
          shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
          hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
          active:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
          active:translate-x-0.75
          active:translate-y-0.75
        "
      >
        ✓ BACK TO DASHBOARD
      </Button>

      {/* Optional: Add confetti note */}
      <div className="mt-6 text-sm text-slate-500">
        🎉 Your envelopes have been updated successfully!
      </div>
    </div>
  );
};

export default SuccessStep;
