import { useState } from "react";
import { budgetDb } from "@/db/budgetDb";
import {
  allocateEvenSplit,
  allocateLastSplit,
  AllocationServiceError,
} from "@/services/api/allocationService";
import { getPredictionFromHistory } from "@/services/api/predictionService";
import logger from "@/utils/core/common/logger";

interface AllocationItem {
  envelopeId: string;
  amountCents: number;
}

export function useAllocationStrategies(
  paycheckAmountCents: number | null,
  envelopes: Array<{ id: string; name: string; currentBalance?: number; monthlyBudget?: number }>,
  paycheckFrequency: "weekly" | "biweekly" | "monthly",
  setLocalAllocations: (
    allocs: AllocationItem[] | ((prev: AllocationItem[]) => AllocationItem[])
  ) => void,
  setSelectedStrategy: (strategy: string) => void
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        result.allocations.map((a) => ({ envelopeId: a.envelopeId, amountCents: a.amountCents }))
      );
      logger.info("Even split allocation successful", {
        strategy: "even_split",
        totalCents: result.totalAllocatedCents,
      });
    } catch (err) {
      setError(
        err instanceof AllocationServiceError ? err.message : "Failed to calculate even split"
      );
      logger.error("Even split failed", { error: err });
    } finally {
      setLoading(false);
    }
  };

  const handleLastSplit = async () => {
    if (!paycheckAmountCents) return;
    setLoading(true);
    setError(null);
    setSelectedStrategy("last_split");

    try {
      const history = await budgetDb.getPaycheckHistory(1);
      if (!history || history.length === 0)
        throw new Error("No previous paycheck found. Use a different strategy.");

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
        result.allocations.map((a) => ({ envelopeId: a.envelopeId, amountCents: a.amountCents }))
      );
      logger.info("Last split allocation successful", {
        strategy: "last_split",
        totalCents: result.totalAllocatedCents,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to use last split");
      logger.error("Last split failed", { error: err });
    } finally {
      setLoading(false);
    }
  };

  const handleSmartSplit = async () => {
    if (!paycheckAmountCents) return;
    setLoading(true);
    setError(null);
    setSelectedStrategy("smart_split");

    try {
      const history = await budgetDb.getPaycheckHistory(20);
      if (!history || history.length < 3)
        throw new Error("Need at least 3 previous paychecks for smart predictions.");

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
      const suggestedCents = prediction.suggestedAllocationsCents || [];
      setLocalAllocations(
        envelopes.map((env, idx) => ({ envelopeId: env.id, amountCents: suggestedCents[idx] || 0 }))
      );
      logger.info("Smart split prediction successful", {
        strategy: "smart_split",
        confidence: prediction.confidence,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate smart predictions");
      logger.error("Smart split failed", { error: err });
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, handleEvenSplit, handleLastSplit, handleSmartSplit };
}
