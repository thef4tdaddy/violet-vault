import { useState, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUnassignedCash } from "./useBudgetMetadata";
import useEnvelopes from "./useEnvelopes";
import useBills from "../bills/useBills";
import { ENVELOPE_TYPES, AUTO_CLASSIFY_ENVELOPE_TYPE } from "../../constants/categories";
import { BIWEEKLY_MULTIPLIER } from "../../constants/frequency";
import { budgetDb } from "../../db/budgetDb";
import { queryKeys } from "../../utils/common/queryClient";
import {
  calculateBillEnvelopePriority,
  getRecommendedBillFunding,
} from "../../utils/budgeting/billEnvelopeCalculations";
import logger from "../../utils/common/logger";
import type { Envelope as DbEnvelope, Bill as DbBill } from "../../db/types";

export type EnvelopeRecord = DbEnvelope & {
  monthlyBudget?: number;
  monthlyAmount?: number;
  biweeklyAllocation?: number;
  color?: string;
};

export type BillRecord = DbBill;

// Helper to calculate monthly budget for an envelope
const calculateMonthlyBudget = (envelope: EnvelopeRecord): number => {
  const envelopeType = envelope.envelopeType || AUTO_CLASSIFY_ENVELOPE_TYPE(envelope.category);

  if (envelopeType === ENVELOPE_TYPES.BILL) {
    return envelope.biweeklyAllocation ? envelope.biweeklyAllocation * BIWEEKLY_MULTIPLIER : 0;
  } else if (envelopeType === ENVELOPE_TYPES.VARIABLE) {
    return envelope.monthlyBudget || envelope.monthlyAmount || 0;
  } else if (envelopeType === ENVELOPE_TYPES.SAVINGS) {
    return envelope.biweeklyAllocation ? envelope.biweeklyAllocation * BIWEEKLY_MULTIPLIER : 50;
  }

  return 0;
};

// Helper to calculate total budget across envelopes
const calculateTotalBudget = (envelopes: EnvelopeRecord[]): number => {
  return envelopes.reduce((sum, env) => sum + calculateMonthlyBudget(env), 0);
};

// Helper to create proportional distributions
const createProportionalDistributions = (
  envelopes: EnvelopeRecord[],
  unassignedCash: number,
  totalBudget: number
): Record<string, number> => {
  const newDistributions: Record<string, number> = {};

  envelopes.forEach((envelope) => {
    const monthlyBudget = calculateMonthlyBudget(envelope);
    const proportion = monthlyBudget / totalBudget;
    const amount = Math.floor(unassignedCash * proportion * 100) / 100;

    if (amount > 0) {
      newDistributions[envelope.id] = amount;
    }
  });

  return newDistributions;
};

// Helper to create bill priority distributions
const createBillPriorityDistributions = (
  billEnvelopes: EnvelopeRecord[],
  bills: BillRecord[],
  unassignedCash: number
): Record<string, number> => {
  const envelopeRecommendations = billEnvelopes.map((envelope) => {
    const priority = calculateBillEnvelopePriority(envelope, bills);
    const recommendation = getRecommendedBillFunding(envelope, bills, unassignedCash);

    return {
      envelope,
      priority: priority.priority,
      priorityLevel: priority.priorityLevel,
      recommendedAmount: recommendation.recommendedAmount,
      reason: recommendation.reason,
      isUrgent: recommendation.isUrgent,
    };
  });

  // Sort by priority (highest first)
  envelopeRecommendations.sort((a, b) => b.priority - a.priority);

  const newDistributions: Record<string, number> = {};
  let remainingCash = unassignedCash;

  // First pass: Fund urgent/critical envelopes fully
  envelopeRecommendations.forEach(({ envelope, recommendedAmount, isUrgent }) => {
    if (isUrgent && remainingCash >= recommendedAmount) {
      newDistributions[envelope.id] = recommendedAmount;
      remainingCash -= recommendedAmount;
    }
  });

  // Second pass: Fund other envelopes based on availability
  envelopeRecommendations.forEach(({ envelope, recommendedAmount, isUrgent }) => {
    if (!isUrgent && remainingCash > 0) {
      const amountToAllocate = Math.min(recommendedAmount, remainingCash);
      if (amountToAllocate > 0) {
        newDistributions[envelope.id] = amountToAllocate;
        remainingCash -= amountToAllocate;
      }
    }
  });

  return newDistributions;
};

// Type for distribution state
type Distributions = Record<string, number>;

// Type for distribution preview item
export interface DistributionPreviewItem extends EnvelopeRecord {
  distributionAmount: number;
  newBalance: number;
}

/**
 * Custom hook for managing unassigned cash distribution logic
 * Handles distribution calculations, validation, and envelope updates
 */
const useUnassignedCashDistribution = () => {
  const { unassignedCash, setUnassignedCash } = useUnassignedCash();
  const { envelopes: rawEnvelopes } = useEnvelopes();
  const { bills = [] } = useBills();
  const queryClient = useQueryClient();

  const envelopeList = useMemo<EnvelopeRecord[]>(
    () => (rawEnvelopes ?? []).map((env) => env as EnvelopeRecord),
    [rawEnvelopes]
  );

  const billList = useMemo<BillRecord[]>(
    () => (bills ?? []).map((bill) => bill as BillRecord),
    [bills]
  );

  // Distribution state (modal state now handled by budget store)
  const [distributions, setDistributions] = useState<Distributions>({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Calculate total being distributed
  const totalDistributed = useMemo(() => {
    return Object.values(distributions).reduce<number>((sum, amount) => {
      const numAmount = parseFloat(String(amount)) || 0;
      return sum + numAmount;
    }, 0);
  }, [distributions]);

  // Calculate remaining unassigned cash
  const remainingCash = useMemo(() => {
    const cash = Number(unassignedCash) || 0;
    return cash - totalDistributed;
  }, [unassignedCash, totalDistributed]);

  // Validation - Allow distributions that would make unassigned cash negative
  const isValidDistribution = useMemo(() => {
    return totalDistributed > 0; // Remove restriction against going negative
  }, [totalDistributed]);

  const resetDistributions = useCallback(() => {
    setDistributions({});
    setIsProcessing(false);
  }, []);

  const updateDistribution = useCallback((envelopeId: string, amount: string | number) => {
    const numericAmount = parseFloat(String(amount)) || 0;
    setDistributions((prev) => ({ ...prev, [envelopeId]: Math.max(0, numericAmount) }));
  }, []);

  // Clear all distributions
  const clearDistributions = useCallback(() => {
    setDistributions({});
  }, []);

  // Distribute equally among all envelopes
  const distributeEqually = useCallback(() => {
    if (envelopeList.length === 0) return;

    const amountPerEnvelope = Math.floor((unassignedCash * 100) / envelopeList.length) / 100;
    const newDistributions: Distributions = {};

    envelopeList.forEach((envelope) => {
      newDistributions[envelope.id] = amountPerEnvelope;
    });

    setDistributions(newDistributions);
  }, [envelopeList, unassignedCash]);

  // Distribute proportionally based on envelope type-specific budgets
  const distributeProportionally = useCallback(() => {
    if (envelopeList.length === 0) return;

    const totalBudget = calculateTotalBudget(envelopeList);

    if (totalBudget === 0) {
      // Fallback to equal distribution if no budgets set
      distributeEqually();
      return;
    }

    const newDistributions = createProportionalDistributions(
      envelopeList,
      unassignedCash,
      totalBudget
    );
    setDistributions(newDistributions);
  }, [envelopeList, unassignedCash, distributeEqually]);

  // Distribute based on bill envelope priorities
  const distributeBillPriority = useCallback(() => {
    if (envelopeList.length === 0) return;

    const billEnvelopes = envelopeList.filter((envelope) => {
      const envelopeType = envelope.envelopeType || AUTO_CLASSIFY_ENVELOPE_TYPE(envelope.category);
      return envelopeType === ENVELOPE_TYPES.BILL;
    });

    if (billEnvelopes.length === 0) {
      logger.info("No bill envelopes found for priority distribution");
      return;
    }

    const recommendedDistributions = createBillPriorityDistributions(
      billEnvelopes,
      billList,
      unassignedCash
    );

    setDistributions(recommendedDistributions);
  }, [envelopeList, unassignedCash, billList]);

  // Apply the distribution to envelopes
  const applyDistribution = useCallback(async () => {
    if (!isValidDistribution) return;

    setIsProcessing(true);

    try {
      // Prepare envelope updates
      const envelopeUpdates: EnvelopeRecord[] = [];

      Object.entries(distributions).forEach(([envelopeId, amount]) => {
        const distributionAmount = parseFloat(String(amount)) || 0;
        if (distributionAmount > 0) {
          const envelope = envelopeList.find((env) => env.id === envelopeId);
          if (envelope) {
            envelopeUpdates.push({
              ...envelope,
              currentBalance: (envelope.currentBalance || 0) + distributionAmount,
            });
          }
        }
      });

      // Apply updates
      if (envelopeUpdates.length > 0) {
        await budgetDb.bulkUpsertEnvelopes(envelopeUpdates as DbEnvelope[]);

        // Update unassigned cash with distribution tracking
        await setUnassignedCash(remainingCash, {
          author: "Family Member", // Generic name for family budgeting
          source: "distribution",
        });

        queryClient.invalidateQueries({ queryKey: [queryKeys.envelopes] });
        queryClient.invalidateQueries({ queryKey: [queryKeys.dashboard] });
        queryClient.invalidateQueries({ queryKey: [queryKeys.dashboardSummary] });
      }

      // Log successful distribution
      logger.info("✅ Unassigned cash distributed", {
        totalDistributed: Object.values(distributions).reduce(
          (sum: number, amt: unknown) => sum + (parseFloat(String(amt)) || 0),
          0
        ),
        envelopesUpdated: envelopeUpdates.length,
        remainingUnassigned: remainingCash,
      });

      // Reset distributions after successful application
      setDistributions({});
    } catch (error) {
      logger.error("Error applying distribution:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [
    isValidDistribution,
    distributions,
    envelopeList,
    queryClient,
    setUnassignedCash,
    remainingCash,
  ]);

  // Get distribution preview data
  const getDistributionPreview = useCallback((): DistributionPreviewItem[] => {
    return envelopeList
      .map((envelope) => {
        const distributionAmount = distributions[envelope.id] || 0;
        return {
          ...envelope,
          distributionAmount,
          newBalance: (envelope.currentBalance || 0) + distributionAmount,
        };
      })
      .filter((envelope) => envelope.distributionAmount > 0);
  }, [envelopeList, distributions]);

  return {
    // State
    distributions,
    isProcessing,

    // Calculations
    totalDistributed,
    remainingCash,
    isValidDistribution,

    // Actions
    resetDistributions,
    updateDistribution,
    clearDistributions,
    distributeEqually,
    distributeProportionally,
    distributeBillPriority,
    applyDistribution,

    // Data
    envelopes: envelopeList,
    bills: billList,
    unassignedCash,
    getDistributionPreview,
  };
};

export default useUnassignedCashDistribution;
