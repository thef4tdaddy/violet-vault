import React from "react";
import Button from "@/components/ui/buttons/Button";
import { FrequencySelector, StrategySelector } from "./AllocationSelectors";
import { AllocationGrid } from "./AllocationGrid";

interface EnvelopeItem {
  id: string;
  name: string;
  currentBalance?: number;
  monthlyBudget?: number;
}

interface AllocationItem {
  envelopeId: string;
  amountCents: number;
}

interface AllocationControlsProps {
  paycheckFrequency: "weekly" | "biweekly" | "monthly";
  setPaycheckFrequency: (freq: "weekly" | "biweekly" | "monthly") => void;
  wasAutoDetected: boolean;
  setWasAutoDetected: (detected: boolean) => void;
  detectionMessage: string | null;
  selectedStrategy: string | null;
  handleLastSplit: () => void;
  handleEvenSplit: () => void;
  handleSmartSplit: () => void;
  loading: boolean;
  error: string | null;
  envelopes: EnvelopeItem[];
  allocations: AllocationItem[];
  paycheckAmountCents: number | null;
  remainingCents: number;
  handleManualChange: (envelopeId: string, value: string) => void;
  handleContinue: () => void;
  setShowSaveAsRulesModal: (show: boolean) => void;
}

export const AllocationControls: React.FC<AllocationControlsProps> = ({
  paycheckFrequency,
  setPaycheckFrequency,
  wasAutoDetected,
  setWasAutoDetected,
  detectionMessage,
  selectedStrategy,
  handleLastSplit,
  handleEvenSplit,
  handleSmartSplit,
  loading,
  error,
  envelopes,
  allocations,
  paycheckAmountCents,
  remainingCents,
  handleManualChange,
  handleContinue,
  setShowSaveAsRulesModal,
}) => (
  <div className="bg-white hard-border rounded-lg p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
    <h2 className="text-xl font-black text-slate-900 mb-6 font-mono uppercase tracking-tight">
      How do you want to allocate?
    </h2>

    <FrequencySelector
      frequency={paycheckFrequency}
      setFrequency={setPaycheckFrequency}
      wasAutoDetected={wasAutoDetected}
      setWasAutoDetected={setWasAutoDetected}
      detectionMessage={detectionMessage}
    />

    <StrategySelector
      selectedStrategy={selectedStrategy}
      onLastSplit={handleLastSplit}
      onEvenSplit={handleEvenSplit}
      onSmartSplit={handleSmartSplit}
      loading={loading}
    />

    {loading && (
      <div className="mb-4 p-4 bg-blue-50 hard-border rounded-lg font-bold text-blue-900 animate-pulse">
        ⏳ Calculating suggested allocations...
      </div>
    )}

    {error && (
      <div className="mb-4 p-4 bg-red-50 hard-border rounded-lg text-red-900 border-2 border-red-200">
        <span className="font-bold">❌ Error:</span> {error}
      </div>
    )}

    <AllocationGrid
      envelopes={envelopes}
      allocations={allocations}
      paycheckAmountCents={paycheckAmountCents}
      remainingCents={remainingCents}
      onManualChange={handleManualChange}
      formatCents={(c) => `$${(c / 100).toFixed(2)}`}
    />

    <div className="mt-8 flex justify-between items-center gap-4">
      {remainingCents === 0 && allocations.length > 0 && selectedStrategy !== "manual" && (
        <Button
          onClick={() => setShowSaveAsRulesModal(true)}
          className="px-6 py-2.5 hard-border rounded-lg font-bold bg-white hover:bg-slate-50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-0.5"
        >
          💾 Save as Rules
        </Button>
      )}
      <div className="flex-1" />
      <Button
        onClick={handleContinue}
        disabled={remainingCents !== 0 || allocations.length === 0}
        className={`px-10 py-3.5 hard-border rounded-lg font-black tracking-wider transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 ${
          remainingCents === 0 && allocations.length > 0
            ? "bg-fuchsia-500 text-white hover:bg-fuchsia-600"
            : "bg-slate-200 text-slate-400 cursor-not-allowed grayscale"
        }`}
      >
        CONTINUE →
      </Button>
    </div>
  </div>
);
