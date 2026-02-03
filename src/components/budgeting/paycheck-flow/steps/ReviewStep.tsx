/**
 * Review Step - Review and confirm allocations (Step 2)
 * Full implementation for Issue #1838
 * Part of Epic #156: Polyglot Human-Centered Paycheck Flow v2.1
 * Enhanced with Historical Comparison View
 */

import React, { useState, useMemo } from "react";
import { usePaycheckFlowStore } from "@/stores/ui/paycheckFlowStore";
import { PaycheckHistoryService } from "@/utils/core/services/paycheckHistory";
import { createPaycheckTransaction } from "@/utils/core/validation/paycheckWizardValidation";
import { AllocationComparisonService } from "@/services/budgeting/allocationComparisonService";
import { AllocationInsightsService } from "@/services/budgeting/allocationInsightsService";
import AllocationComparisonCard from "@/components/budgeting/paycheck-flow/AllocationComparisonCard";
import logger from "@/utils/core/common/logger";
import Button from "@/components/ui/buttons/Button";

interface ReviewStepProps {
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

const SummaryCard: React.FC<{
  paycheckAmountCents: number | null;
  payerName: string | null;
  totalAllocatedCents: number;
  isFullyAllocated: boolean;
  remainingCents: number;
}> = ({
  paycheckAmountCents,
  payerName,
  totalAllocatedCents,
  isFullyAllocated,
  remainingCents,
}) => (
  <div
    className={`hard-border rounded-lg p-6 mb-6 ${isFullyAllocated ? "bg-fuchsia-50" : "bg-amber-50"}`}
  >
    <div className="flex justify-between items-center mb-4">
      <div>
        <div className="text-sm text-slate-600 mb-1">Total Paycheck</div>
        <div className="text-3xl font-black text-slate-900">
          {formatCentsToDollarsWithCommas(paycheckAmountCents || 0)}
        </div>
        {payerName && <div className="text-sm text-slate-600 mt-1">from {payerName}</div>}
      </div>
      <div className="text-right">
        <div className="text-sm text-slate-600 mb-1">Allocated</div>
        <div
          className={`text-3xl font-black ${isFullyAllocated ? "text-green-600" : "text-amber-600"}`}
        >
          {formatCentsToDollarsWithCommas(totalAllocatedCents)}
        </div>
        {remainingCents !== 0 && (
          <div className="text-sm text-amber-700 mt-1 font-bold">
            {remainingCents > 0 ? "+" : "-"}
            {formatCentsToDollarsWithCommas(Math.abs(remainingCents))} remaining
          </div>
        )}
      </div>
    </div>
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-600">Allocation Status</span>
      <span
        className={`px-3 py-1 font-bold rounded ${
          isFullyAllocated ? "bg-green-500 text-white" : "bg-amber-500 text-white"
        }`}
      >
        {isFullyAllocated ? "✓ Complete" : "⚠ Incomplete"}
      </span>
    </div>
  </div>
);

const AllocationList: React.FC<{
  allocations: { envelopeId: string; amountCents: number }[];
  paycheckAmountCents: number | null;
}> = ({ allocations, paycheckAmountCents }) => {
  if (allocations.length === 0) {
    return (
      <div className="bg-amber-50 hard-border rounded-lg p-6 mb-6 text-center">
        <p className="text-amber-900 font-bold">⚠️ No allocations yet</p>
        <p className="text-sm text-amber-700 mt-2">
          Go back and select an allocation strategy to continue.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 mb-6">
      {allocations.map((allocation) => {
        const percent = paycheckAmountCents
          ? ((allocation.amountCents / paycheckAmountCents) * 100).toFixed(1)
          : 0;

        return (
          <div
            key={allocation.envelopeId}
            className="flex items-center justify-between p-4 bg-slate-50 hard-border rounded-lg"
          >
            <div>
              <div className="font-bold text-slate-900">{allocation.envelopeId}</div>
              <div className="text-sm text-slate-600">{percent}% of paycheck</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-slate-900">
                {formatCentsToDollarsWithCommas(allocation.amountCents)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ReviewStep: React.FC<ReviewStepProps> = ({ onNext }) => {
  const paycheckAmountCents = usePaycheckFlowStore((state) => state.paycheckAmountCents);
  const payerName = usePaycheckFlowStore((state) => state.payerName);
  const allocations = usePaycheckFlowStore((state) => state.allocations);
  const selectedStrategy = usePaycheckFlowStore((state) => state.selectedStrategy);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalAllocatedCents = allocations.reduce((sum, a) => sum + a.amountCents, 0);
  const isFullyAllocated = totalAllocatedCents === (paycheckAmountCents || 0);
  const remainingCents = (paycheckAmountCents || 0) - totalAllocatedCents;

  // Generate comparison with previous allocation
  const comparison = useMemo(() => {
    if (!paycheckAmountCents || allocations.length === 0) {
      return null;
    }

    const previousAllocation = PaycheckHistoryService.getMostRecentAllocation();
    if (!previousAllocation) {
      return null;
    }

    const currentSnapshot = AllocationComparisonService.createCurrentSnapshot(
      paycheckAmountCents,
      allocations,
      payerName
    );

    const previousSnapshot =
      AllocationComparisonService.createSnapshotFromHistory(previousAllocation);

    const comparisonResult = AllocationComparisonService.getComparison(
      currentSnapshot,
      previousSnapshot
    );

    // Generate insights
    const insights = AllocationInsightsService.generateInsights(
      comparisonResult.changes,
      currentSnapshot,
      previousSnapshot
    );

    return {
      ...comparisonResult,
      insights,
    };
  }, [paycheckAmountCents, allocations, payerName]);

  const handleConfirm = async () => {
    if (!paycheckAmountCents) {
      setError("Paycheck amount is required");
      return;
    }
    if (!isFullyAllocated) {
      setError(
        `Cannot confirm: $${formatCentsToDollarsWithCommas(remainingCents)} remaining to allocate`
      );
      return;
    }
    if (allocations.length === 0) {
      setError("At least one allocation is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const userId = "user_test"; // Temporary placeholder
      const primaryEnvelopeId = allocations[0]?.envelopeId || "env_paycheck";

      const transaction = createPaycheckTransaction(
        {
          paycheckAmountCents,
          payerName,
          selectedStrategy: selectedStrategy || "manual",
          allocations,
        },
        userId,
        primaryEnvelopeId,
        {
          date: new Date().toISOString(),
          description: payerName ? `Paycheck from ${payerName}` : "Paycheck",
        }
      );

      logger.info("Paycheck transaction created", { transactionId: transaction.id });

      // Save to paycheck history (for autocomplete)
      if (payerName) {
        PaycheckHistoryService.addOrUpdate({
          payerName,
          amountCents: paycheckAmountCents,
          date: new Date().toISOString().split("T")[0]!,
        });
      }

      // Save to allocation history (for comparison)
      PaycheckHistoryService.saveAllocationHistory({
        paycheckAmountCents,
        payerName,
        allocations,
        strategy: selectedStrategy || undefined,
      });

      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create paycheck transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white hard-border rounded-lg p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-xl font-black text-slate-900 mb-6">REVIEW YOUR ALLOCATION</h2>

        <SummaryCard
          paycheckAmountCents={paycheckAmountCents}
          payerName={payerName}
          totalAllocatedCents={totalAllocatedCents}
          isFullyAllocated={isFullyAllocated}
          remainingCents={remainingCents}
        />

        <AllocationList allocations={allocations} paycheckAmountCents={paycheckAmountCents} />

        {/* Historical Comparison View */}
        <AllocationComparisonCard comparison={comparison} isLoading={false} />

        {error && (
          <div className="bg-red-50 hard-border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-900 font-bold">⚠️ {error}</p>
          </div>
        )}

        {isFullyAllocated && allocations.length > 0 && (
          <div className="bg-blue-50 hard-border rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              💡 <strong>Ready to confirm?</strong> Once confirmed, your paycheck will be allocated
              to your envelopes.
            </p>
          </div>
        )}

        <Button
          onClick={handleConfirm}
          disabled={!isFullyAllocated || allocations.length === 0 || isSubmitting}
          className={`
            w-full px-8 py-4
            hard-border rounded-lg
            font-black text-lg
            tracking-wide
            transition-all
            shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
            ${
              isFullyAllocated && allocations.length > 0 && !isSubmitting
                ? "bg-green-500 text-white hover:bg-green-600 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] cursor-pointer"
                : "bg-slate-300 text-slate-500 cursor-not-allowed"
            }
          `}
        >
          {isSubmitting ? "CREATING PAYCHECK..." : "✓ CONFIRM & CREATE PAYCHECK"}
        </Button>
      </div>
    </div>
  );
};

export default ReviewStep;
