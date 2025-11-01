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

// Helper to calculate monthly budget for an envelope
const calculateMonthlyBudget = (envelope) => {
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
const calculateTotalBudget = (envelopes) => {
  return envelopes.reduce((sum, env) => sum + calculateMonthlyBudget(env), 0);
};

// Helper to create proportional distributions
const createProportionalDistributions = (envelopes, unassignedCash, totalBudget) => {
  const newDistributions = {};

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
const createBillPriorityDistributions = (billEnvelopes, bills, unassignedCash) => {
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

  const newDistributions = {};
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

/**
 * Custom hook for managing unassigned cash distribution logic
 * Handles distribution calculations, validation, and envelope updates
 */
const useUnassignedCashDistribution = () => {
  const { unassignedCash, setUnassignedCash } = useUnassignedCash();
  const { envelopes } = useEnvelopes();
  const { bills = [] } = useBills();
  const queryClient = useQueryClient();

  // Distribution state (modal state now handled by budget store)
  const [distributions, setDistributions] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

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

  // Reset distributions (called when modal opens)
  const resetDistributions = useCallback(() => {
    setDistributions({});
    setIsProcessing(false);
  }, []);

  // Update distribution amount for a specific envelope
  const updateDistribution = useCallback((envelopeId: string, amount: string | number) => {
    const numericAmount = parseFloat(String(amount)) || 0;
    setDistributions((prev) => ({
      ...prev,
      [envelopeId]: Math.max(0, numericAmount),
    }));
  }, []);

  // Clear all distributions
  const clearDistributions = useCallback(() => {
    setDistributions({});
  }, []);

  // Distribute equally among all envelopes
  const distributeEqually = useCallback(() => {
    if (envelopes.length === 0) return;

    const amountPerEnvelope = Math.floor((unassignedCash * 100) / envelopes.length) / 100;
    const newDistributions = {};

    envelopes.forEach((envelope) => {
      newDistributions[envelope.id] = amountPerEnvelope;
    });

    setDistributions(newDistributions);
  }, [envelopes, unassignedCash]);

  // Distribute proportionally based on envelope type-specific budgets
  const distributeProportionally = useCallback(() => {
    if (envelopes.length === 0) return;

    const totalBudget = calculateTotalBudget(envelopes);

    if (totalBudget === 0) {
      // Fallback to equal distribution if no budgets set
      distributeEqually();
      return;
    }

    const newDistributions = createProportionalDistributions(
      envelopes,
      unassignedCash,
      totalBudget
    );
    setDistributions(newDistributions);
  }, [envelopes, unassignedCash, distributeEqually]);

  // Distribute based on bill envelope priorities
  const distributeBillPriority = useCallback(() => {
    if (envelopes.length === 0) return;

    const billEnvelopes = envelopes.filter(
      (env) =>
        env.envelopeType === ENVELOPE_TYPES.BILL ||
        AUTO_CLASSIFY_ENVELOPE_TYPE(env.category) === ENVELOPE_TYPES.BILL
    );

    if (billEnvelopes.length === 0) {
      // Fallback to proportional if no bill envelopes
      distributeProportionally();
      return;
    }

    const newDistributions = createBillPriorityDistributions(billEnvelopes, bills, unassignedCash);
    setDistributions(newDistributions);
  }, [envelopes, bills, unassignedCash, distributeProportionally]);

  // Apply the distribution to envelopes
  const applyDistribution = useCallback(async () => {
    if (!isValidDistribution) return;

    setIsProcessing(true);

    try {
      // Prepare envelope updates
      const envelopeUpdates = [];

      Object.entries(distributions).forEach(([envelopeId, amount]) => {
        const distributionAmount = parseFloat(String(amount)) || 0;
        if (distributionAmount > 0) {
          const envelope = envelopes.find((env) => env.id === envelopeId);
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
        await budgetDb.bulkUpsertEnvelopes(envelopeUpdates);

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
      const totalDistributed = Object.values(distributions).reduce(
        (sum: number, amt: unknown) => sum + (parseFloat(String(amt)) || 0),
        0
      );
      logger.info("✅ Unassigned cash distributed", {
        totalDistributed,
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
    envelopes,
    queryClient,
    setUnassignedCash,
    remainingCash,
  ]);

  // Get distribution preview data
  const getDistributionPreview = useCallback(() => {
    return envelopes
      .map((envelope) => {
        const distributionAmount = distributions[envelope.id] || 0;
        return {
          ...envelope,
          distributionAmount,
          newBalance: (envelope.currentBalance || 0) + distributionAmount,
        };
      })
      .filter((envelope) => envelope.distributionAmount > 0);
  }, [envelopes, distributions]);

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
    envelopes,
    bills,
    unassignedCash,
    getDistributionPreview,
  };
};

export default useUnassignedCashDistribution;
