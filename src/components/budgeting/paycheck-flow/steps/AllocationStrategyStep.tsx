/**
 * Allocation Strategy Step - Smart allocation UI (Step 1)
 * Full implementation for Issue #1844
 * Part of Epic #156: Polyglot Human-Centered Paycheck Flow v2.1
 */

import React, { useState, useMemo, useEffect } from "react";
import { usePaycheckFlowStore } from "@/stores/ui/paycheckFlowStore";
import { useEnvelopes } from "@/hooks/budgeting/envelopes/useEnvelopes";
import { formatCentsAsCurrency } from "@/utils/domain/budgeting/billCoverageCalculations";
import { usePaycheckFrequencyDetection } from "@/hooks/budgeting/paycheck-flow/usePaycheckFrequencyDetection";
import { useAllocationStrategies } from "@/hooks/budgeting/paycheck-flow/useAllocationStrategies";
import { useBillForecasting } from "@/hooks/budgeting/paycheck-flow/useBillForecasting";
import logger from "@/utils/core/common/logger";
import { BillForecastingPanel } from "../forecasting/BillForecastingPanel";
import { SaveAsRulesModal } from "../SaveAsRulesModal";
import type { AutoFixSuggestion } from "@/utils/domain/budgeting/autoFixSuggestions";
import { applyAutoFixSuggestions } from "@/utils/domain/budgeting/autoFixSuggestions";
import { AllocationControls } from "./AllocationControls";
import useToast from "@/hooks/platform/ux/useToast";

interface AllocationStrategyStepProps {
  onNext: () => void;
  onBack: () => void;
  onFinish: () => void;
}

type AllocationItem = {
  envelopeId: string;
  amountCents: number;
};

const AllocationStrategyStep: React.FC<AllocationStrategyStepProps> = ({ onNext }) => {
  const paycheckAmountCents = usePaycheckFlowStore((state) => state.paycheckAmountCents);
  const setAllocations = usePaycheckFlowStore((state) => state.setAllocations);

  const { envelopes = [] } = useEnvelopes();

  const [localAllocations, setLocalAllocations] = useState<AllocationItem[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [showSaveAsRulesModal, setShowSaveAsRulesModal] = useState(false);
  const { showSuccess, showError } = useToast();

  // Hook for frequency detection
  const {
    paycheckFrequency,
    setPaycheckFrequency,
    wasAutoDetected,
    setWasAutoDetected,
    detectionMessage,
  } = usePaycheckFrequencyDetection(paycheckAmountCents);

  // Hook for allocation strategies
  const { loading, error, handleEvenSplit, handleLastSplit, handleSmartSplit } =
    useAllocationStrategies(
      paycheckAmountCents,
      envelopes,
      paycheckFrequency,
      setLocalAllocations,
      (s) => setSelectedStrategy(s)
    );

  // Show error toast if allocation strategy fails
  useEffect(() => {
    if (error) {
      showError("Allocation Error", error);
    }
  }, [error, showError]);

  // Get bill forecasting results for critical shortage warnings
  const forecastingResult = useBillForecasting({
    paycheckAmountCents,
    allocations: localAllocations,
    paycheckFrequency,
  });

  // Calculate remaining amount based on local allocations
  const remainingCents = useMemo(() => {
    if (!paycheckAmountCents) return 0;
    const allocated = localAllocations.reduce((sum, a) => sum + a.amountCents, 0);
    return paycheckAmountCents - allocated;
  }, [paycheckAmountCents, localAllocations]);

  // Handle continue to next step
  const handleContinue = () => {
    if (remainingCents !== 0) return;

    // Check for critical bill shortages
    const { totalShortage, criticalBills } = forecastingResult;

    if (totalShortage > 0 && criticalBills.length > 0) {
      const confirmed = window.confirm(
        `⚠️ WARNING: Bill Coverage Shortage\n\n` +
          `You have ${formatCentsAsCurrency(totalShortage)} in unpaid bills.\n\n` +
          `Are you sure you want to continue?`
      );

      if (!confirmed) return; // User cancelled
    }

    // Save allocations to store
    setAllocations(localAllocations);
    onNext();
  };

  // Handle manual amount change
  const handleManualChange = (envelopeId: string, value: string) => {
    const cents = Math.round(parseFloat(value || "0") * 100);
    setSelectedStrategy("manual");

    setLocalAllocations((prev) => {
      const existing = prev.find((a) => a.envelopeId === envelopeId);
      if (existing) {
        return prev.map((a) => (a.envelopeId === envelopeId ? { ...a, amountCents: cents } : a));
      } else {
        return [...prev, { envelopeId, amountCents: cents }];
      }
    });
  };

  // Handle auto-fix suggestions from forecasting panel
  const handleAutoFix = (suggestions: AutoFixSuggestion[]) => {
    // Apply suggestions to current allocations
    const updatedAllocations = applyAutoFixSuggestions(localAllocations, suggestions);
    setLocalAllocations(updatedAllocations);
    setSelectedStrategy("auto-fix");

    logger.info("Applied auto-fix suggestions", {
      suggestionsCount: suggestions.length,
    });
    showSuccess(
      "Auto-fix Applied",
      `Adjusted ${suggestions.length} allocations for better bill coverage.`
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6">
        {/* Left Column - Allocation Controls and Grid */}
        <AllocationControls
          paycheckFrequency={paycheckFrequency}
          setPaycheckFrequency={setPaycheckFrequency}
          wasAutoDetected={wasAutoDetected}
          setWasAutoDetected={setWasAutoDetected}
          detectionMessage={detectionMessage}
          selectedStrategy={selectedStrategy}
          handleLastSplit={handleLastSplit}
          handleEvenSplit={handleEvenSplit}
          handleSmartSplit={handleSmartSplit}
          loading={loading}
          error={error}
          envelopes={envelopes}
          allocations={localAllocations}
          paycheckAmountCents={paycheckAmountCents}
          remainingCents={remainingCents}
          handleManualChange={handleManualChange}
          handleContinue={handleContinue}
          setShowSaveAsRulesModal={setShowSaveAsRulesModal}
        />

        {/* Right Column - Bill Forecasting */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <BillForecastingPanel
            paycheckAmountCents={paycheckAmountCents}
            allocations={localAllocations}
            paycheckFrequency={paycheckFrequency}
            onAutoFix={handleAutoFix}
          />
        </div>
      </div>

      {/* Save as Rules Modal */}
      <SaveAsRulesModal
        isOpen={showSaveAsRulesModal}
        onClose={() => setShowSaveAsRulesModal(false)}
        allocation={{
          allocations: localAllocations.map((a: AllocationItem) => ({
            envelopeId: a.envelopeId,
            amountCents: a.amountCents,
          })),
          totalAllocatedCents: localAllocations.reduce(
            (sum: number, a: AllocationItem) => sum + a.amountCents,
            0
          ),
          strategy: selectedStrategy || "manual",
        }}
        paycheckAmountCents={paycheckAmountCents || 0}
      />
    </div>
  );
};

export default AllocationStrategyStep;
