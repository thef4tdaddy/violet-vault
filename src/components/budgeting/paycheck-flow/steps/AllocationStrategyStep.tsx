/**
 * Allocation Strategy Step - Smart allocation UI (Step 1)
 * Full implementation for Issue #1844
 * Part of Epic #156: Polyglot Human-Centered Paycheck Flow v2.1
 */

import React, { useState, useMemo, useEffect } from "react";
import Button from "@/components/ui/buttons/Button";
import { usePaycheckFlowStore } from "@/stores/ui/paycheckFlowStore";
import { useEnvelopes } from "@/hooks/budgeting/envelopes/useEnvelopes";
import {
  allocateEvenSplit,
  allocateLastSplit,
  AllocationServiceError,
} from "@/services/api/allocationService";
import {
  getPredictionFromHistory,
  detectFrequencyFromAmount,
  PredictionServiceError,
} from "@/services/api/predictionService";
import { budgetDb } from "@/db/budgetDb";
import logger from "@/utils/core/common/logger";
import { SaveAsRulesModal } from "../SaveAsRulesModal";

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

  const [allocations, setLocalAllocations] = useState<AllocationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [paycheckFrequency, setPaycheckFrequency] = useState<"weekly" | "biweekly" | "monthly">(
    "biweekly"
  );
  const [wasAutoDetected, setWasAutoDetected] = useState(false);
  const [detectionMessage, setDetectionMessage] = useState<string | null>(null);
  const [showSaveAsRulesModal, setShowSaveAsRulesModal] = useState(false);

  // Auto-detect frequency from amount when component mounts
  useEffect(() => {
    const detectFrequency = async () => {
      if (!paycheckAmountCents) return;

      try {
        // Get historical paychecks for detection from budgetDb instead of summary service
        const history = await budgetDb.getPaycheckHistory(10);
        if (!history || history.length < 3) {
          return; // Need at least 3 paychecks for reliable detection
        }

        // Convert Transaction objects to allocation history format
        const allocationHistory = history.map((p) => ({
          date: typeof p.date === "string" ? p.date : p.date.toISOString(),
          amountCents: p.amount, // Transactions use 'amount' for the total
          envelopeAllocations: Object.entries(p.allocations || {}).map(
            ([envelopeId, amountCents]) => ({
              envelopeId,
              amountCents,
            })
          ),
        }));

        const suggestion = await detectFrequencyFromAmount(paycheckAmountCents, allocationHistory);

        // Only auto-select if confidence is high enough
        if (suggestion.confidence >= 0.7 && suggestion.suggestedFrequency !== "unknown") {
          setPaycheckFrequency(suggestion.suggestedFrequency as "weekly" | "biweekly" | "monthly");
          setWasAutoDetected(true);
          setDetectionMessage(suggestion.reasoning);

          logger.info("Auto-detected paycheck frequency", {
            frequency: suggestion.suggestedFrequency,
            confidence: suggestion.confidence,
            reasoning: suggestion.reasoning,
          });
        }
      } catch (err) {
        // Silent fail - auto-detection is optional enhancement
        logger.warn("Frequency auto-detection failed", { error: err });
      }
    };

    detectFrequency();
  }, [paycheckAmountCents]); // Re-run if paycheck amount changes

  // Calculate remaining amount
  const remainingCents = useMemo(() => {
    if (!paycheckAmountCents) return 0;
    const allocated = allocations.reduce((sum, a) => sum + a.amountCents, 0);
    return paycheckAmountCents - allocated;
  }, [paycheckAmountCents, allocations]);

  // Handle SPLIT EVENLY
  const handleEvenSplit = async () => {
    if (!paycheckAmountCents) return;

    setLoading(true);
    setError(null);
    setSelectedStrategy("even_split");

    try {
      const envelopeData = envelopes.map((env) => ({
        id: env.id,
        monthlyTargetCents: env.monthlyBudget || 0,
        currentBalanceCents: env.currentBalance || 0,
      }));

      const result = await allocateEvenSplit(paycheckAmountCents, envelopeData, paycheckFrequency);

      setLocalAllocations(
        result.allocations.map((a) => ({
          envelopeId: a.envelopeId,
          amountCents: a.amountCents,
        }))
      );

      logger.info("Even split allocation successful", {
        strategy: "even_split",
        totalCents: result.totalAllocatedCents,
      });
    } catch (err) {
      const errorMessage =
        err instanceof AllocationServiceError ? err.message : "Failed to calculate even split";
      setError(errorMessage);
      logger.error("Even split failed", { error: err });
    } finally {
      setLoading(false);
    }
  };

  // Handle USE LAST SPLIT
  const handleLastSplit = async () => {
    if (!paycheckAmountCents) return;

    setLoading(true);
    setError(null);
    setSelectedStrategy("last_split");

    try {
      // Get previous paycheck allocation from history (budgetDb Transaction)
      const history = await budgetDb.getPaycheckHistory(1);
      if (!history || history.length === 0) {
        throw new Error("No previous paycheck found. Use a different strategy.");
      }

      const lastPaycheck = history[0];
      const previousAllocation = Object.entries(lastPaycheck.allocations || {}).map(
        ([envelopeId, amountCents]) => ({
          envelopeId,
          amountCents,
        })
      );

      const envelopeData = envelopes.map((env) => ({
        id: env.id,
        monthlyTargetCents: env.monthlyBudget || 0,
        currentBalanceCents: env.currentBalance || 0,
      }));

      const result = await allocateLastSplit(paycheckAmountCents, envelopeData, previousAllocation);

      setLocalAllocations(
        result.allocations.map((a) => ({
          envelopeId: a.envelopeId,
          amountCents: a.amountCents,
        }))
      );

      logger.info("Last split allocation successful", {
        strategy: "last_split",
        totalCents: result.totalAllocatedCents,
      });
    } catch (err) {
      const errorMessage =
        err instanceof AllocationServiceError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to use last split";
      setError(errorMessage);
      logger.error("Last split failed", { error: err });
    } finally {
      setLoading(false);
    }
  };

  // Handle SMART SPLIT (AI-powered)
  const handleSmartSplit = async () => {
    if (!paycheckAmountCents) return;

    setLoading(true);
    setError(null);
    setSelectedStrategy("smart_split");

    try {
      // Get historical paychecks for prediction (budgetDb Transaction)
      const history = await budgetDb.getPaycheckHistory(20);
      if (!history || history.length < 3) {
        throw new Error(
          "Need at least 3 previous paychecks for smart predictions. Use a different strategy."
        );
      }

      // Convert Transaction objects to allocation history format
      const allocationHistory = history.map((p) => ({
        date: typeof p.date === "string" ? p.date : p.date.toISOString(),
        amountCents: p.amount,
        envelopeAllocations: Object.entries(p.allocations || {}).map(
          ([envelopeId, amountCents]) => ({
            envelopeId,
            amountCents,
          })
        ),
      }));

      const prediction = await getPredictionFromHistory(
        paycheckAmountCents,
        allocationHistory,
        envelopes.length,
        paycheckFrequency
      );

      // Map predictions back to envelope IDs
      const suggestedCents = prediction.suggestedAllocationsCents || [];
      setLocalAllocations(
        envelopes.map((env, idx) => ({
          envelopeId: env.id,
          amountCents: suggestedCents[idx] || 0,
        }))
      );

      logger.info("Smart split prediction successful", {
        strategy: "smart_split",
        confidence: prediction.confidence,
        reasoning: prediction.reasoning.patternType,
      });
    } catch (err) {
      const errorMessage =
        err instanceof PredictionServiceError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to generate smart predictions";
      setError(errorMessage);
      logger.error("Smart split failed", { error: err });
    } finally {
      setLoading(false);
    }
  };

  // Handle continue to next step
  const handleContinue = () => {
    if (remainingCents !== 0) return;

    // Save allocations to store
    setAllocations(allocations);
    onNext();
  };

  // Format cents to dollars
  const formatCents = (cents: number): string => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  // Get allocation for specific envelope
  const getAllocationForEnvelope = (envelopeId: string): number => {
    const allocation = allocations.find((a) => a.envelopeId === envelopeId);
    return allocation ? allocation.amountCents : 0;
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white hard-border rounded-lg p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-xl font-black text-slate-900 mb-6">HOW DO YOU WANT TO ALLOCATE?</h2>

        {/* Paycheck Frequency Selector */}
        <div className="mb-6 p-4 bg-slate-50 hard-border rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-bold text-slate-900">PAYCHECK FREQUENCY</label>
            {wasAutoDetected && (
              <span className="px-2 py-1 bg-fuchsia-100 hard-border rounded text-xs font-bold text-fuchsia-700">
                ✨ Auto-detected
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={() => {
                setPaycheckFrequency("weekly");
                setWasAutoDetected(false); // Clear auto-detect flag when manually changed
              }}
              className={`px-4 py-2 hard-border rounded-lg font-bold text-sm transition-all ${
                paycheckFrequency === "weekly"
                  ? "bg-fuchsia-500 text-white border-fuchsia-600"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              WEEKLY
            </Button>
            <Button
              type="button"
              onClick={() => {
                setPaycheckFrequency("biweekly");
                setWasAutoDetected(false);
              }}
              className={`px-4 py-2 hard-border rounded-lg font-bold text-sm transition-all ${
                paycheckFrequency === "biweekly"
                  ? "bg-fuchsia-500 text-white border-fuchsia-600"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              BIWEEKLY
            </Button>
            <Button
              type="button"
              onClick={() => {
                setPaycheckFrequency("monthly");
                setWasAutoDetected(false);
              }}
              className={`px-4 py-2 hard-border rounded-lg font-bold text-sm transition-all ${
                paycheckFrequency === "monthly"
                  ? "bg-fuchsia-500 text-white border-fuchsia-600"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              MONTHLY
            </Button>
          </div>
          {detectionMessage && wasAutoDetected ? (
            <p className="text-xs text-fuchsia-600 mt-2 font-semibold">💡 {detectionMessage}</p>
          ) : (
            <p className="text-xs text-slate-600 mt-2">
              Helps SPLIT EVENLY and SMART SPLIT calculate appropriate allocations
            </p>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button
            onClick={handleLastSplit}
            disabled={loading}
            className={`p-6 hard-border rounded-lg transition-all text-left ${
              selectedStrategy === "last_split"
                ? "bg-purple-100 border-purple-500 border-2"
                : "bg-purple-50 hover:bg-purple-100"
            }`}
          >
            <div className="text-2xl mb-2">🔄</div>
            <div className="font-black text-slate-900 mb-1">USE LAST SPLIT</div>
            <div className="text-sm text-slate-600">Same as your previous paycheck</div>
          </Button>

          <Button
            onClick={handleEvenSplit}
            disabled={loading}
            className={`p-6 hard-border rounded-lg transition-all text-left ${
              selectedStrategy === "even_split"
                ? "bg-blue-100 border-blue-500 border-2"
                : "bg-blue-50 hover:bg-blue-100"
            }`}
          >
            <div className="text-2xl mb-2">⚖️</div>
            <div className="font-black text-slate-900 mb-1">SPLIT EVENLY</div>
            <div className="text-sm text-slate-600">Weighted by monthly targets</div>
          </Button>

          <Button
            onClick={handleSmartSplit}
            disabled={loading}
            className={`p-6 hard-border rounded-lg transition-all text-left ${
              selectedStrategy === "smart_split"
                ? "bg-fuchsia-100 border-fuchsia-500 border-2"
                : "bg-fuchsia-50 hover:bg-fuchsia-100"
            }`}
          >
            <div className="text-2xl mb-2">✨</div>
            <div className="font-black text-slate-900 mb-1">SMART SPLIT</div>
            <div className="text-sm text-slate-600">AI-powered suggestions</div>
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mb-4 p-4 bg-blue-50 hard-border rounded-lg">
            <p className="text-sm text-blue-900 font-bold">⏳ Calculating allocations...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 hard-border rounded-lg">
            <p className="text-sm text-red-900">
              <strong>❌ Error:</strong> {error}
            </p>
          </div>
        )}

        {/* Allocation Grid */}
        <div className="bg-slate-50 hard-border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-slate-900">ALLOCATIONS</h3>
            <div className="text-sm font-bold">
              <span className="text-slate-600">Remaining:</span>
              <span
                className={`ml-2 text-lg ${
                  remainingCents === 0
                    ? "text-green-600"
                    : remainingCents < 0
                      ? "text-red-600"
                      : "text-fuchsia-600"
                }`}
              >
                {formatCents(remainingCents)}
              </span>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {envelopes.length === 0 ? (
              <div className="text-center text-slate-600 py-8">
                <p>No envelopes found. Create envelopes first to allocate funds.</p>
              </div>
            ) : (
              envelopes.map((envelope) => {
                const allocationCents = getAllocationForEnvelope(envelope.id);
                const percentage =
                  paycheckAmountCents && paycheckAmountCents > 0
                    ? (allocationCents / paycheckAmountCents) * 100
                    : 0;

                return (
                  <div
                    key={envelope.id}
                    className="flex items-center justify-between p-4 bg-white hard-border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-bold text-slate-900">{envelope.name}</div>
                      <div className="text-sm text-slate-600">
                        {percentage.toFixed(2)}% allocated
                      </div>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={allocationCents > 0 ? (allocationCents / 100).toFixed(2) : ""}
                      onChange={(e) => handleManualChange(envelope.id, e.target.value)}
                      placeholder="$0.00"
                      className="w-32 px-3 py-2 text-right font-black hard-border rounded focus:ring-2 focus:ring-fuchsia-500"
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-between items-center gap-4">
          {/* Save as Rules Button - Only show when allocation is complete and not manual */}
          {remainingCents === 0 && allocations.length > 0 && selectedStrategy && selectedStrategy !== "manual" && (
            <Button
              onClick={() => setShowSaveAsRulesModal(true)}
              className="px-6 py-2 hard-border rounded-lg font-bold bg-white hover:bg-slate-100 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              💾 Save as Rules
            </Button>
          )}
          <div className="flex-1" />
          <Button
            onClick={handleContinue}
            disabled={remainingCents !== 0 || allocations.length === 0}
            className={`px-8 py-3 hard-border rounded-lg font-black tracking-wide transition-all ${
              remainingCents === 0 && allocations.length > 0
                ? "bg-fuchsia-500 text-white hover:bg-fuchsia-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                : "bg-slate-300 text-slate-500 cursor-not-allowed"
            }`}
          >
            CONTINUE →
          </Button>
        </div>
      </div>

      {/* Save as Rules Modal */}
      <SaveAsRulesModal
        isOpen={showSaveAsRulesModal}
        onClose={() => setShowSaveAsRulesModal(false)}
        allocation={{
          allocations: allocations.map((a) => ({ envelopeId: a.envelopeId, amountCents: a.amountCents })),
          totalAllocatedCents: allocations.reduce((sum, a) => sum + a.amountCents, 0),
          strategy: selectedStrategy || "manual",
        }}
        paycheckAmountCents={paycheckAmountCents || 0}
      />
    </div>
  );
};

export default AllocationStrategyStep;
