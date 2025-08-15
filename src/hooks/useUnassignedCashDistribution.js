import { useState, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useBudgetStore } from "../stores/budgetStore";
import useEnvelopes from "./useEnvelopes";
import useBills from "./useBills";
import {
  ENVELOPE_TYPES,
  AUTO_CLASSIFY_ENVELOPE_TYPE,
} from "../constants/categories";
import { BIWEEKLY_MULTIPLIER } from "../constants/frequency";
import { budgetDb } from "../db/budgetDb";
import { queryKeys } from "../utils/queryClient";
import {
  calculateBillEnvelopePriority,
  getRecommendedBillFunding,
} from "../utils/billEnvelopeCalculations";

/**
 * Custom hook for managing unassigned cash distribution logic
 * Handles distribution calculations, validation, and envelope updates
 */
const useUnassignedCashDistribution = () => {
  const { unassignedCash, setUnassignedCash } = useBudgetStore();
  const { envelopes } = useEnvelopes();
  const { bills = [] } = useBills();
  const queryClient = useQueryClient();

  // Distribution state (modal state now handled by budget store)
  const [distributions, setDistributions] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate total being distributed
  const totalDistributed = useMemo(() => {
    return Object.values(distributions).reduce(
      (sum, amount) => sum + (parseFloat(amount) || 0),
      0,
    );
  }, [distributions]);

  // Calculate remaining unassigned cash
  const remainingCash = useMemo(() => {
    return unassignedCash - totalDistributed;
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
  const updateDistribution = useCallback((envelopeId, amount) => {
    const numericAmount = parseFloat(amount) || 0;
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

    const amountPerEnvelope =
      Math.floor((unassignedCash * 100) / envelopes.length) / 100;
    const newDistributions = {};

    envelopes.forEach((envelope) => {
      newDistributions[envelope.id] = amountPerEnvelope;
    });

    setDistributions(newDistributions);
  }, [envelopes, unassignedCash]);

  // Distribute proportionally based on envelope type-specific budgets
  const distributeProportionally = useCallback(() => {
    if (envelopes.length === 0) return;

    // Calculate total budget across all envelope types
    const totalBudget = envelopes.reduce((sum, env) => {
      const envelopeType =
        env.envelopeType || AUTO_CLASSIFY_ENVELOPE_TYPE(env.category);

      if (envelopeType === ENVELOPE_TYPES.BILL) {
        // For bills, use biweeklyAllocation (convert to monthly equivalent)
        return (
          sum +
          (env.biweeklyAllocation
            ? env.biweeklyAllocation * BIWEEKLY_MULTIPLIER
            : 0)
        );
      } else if (envelopeType === ENVELOPE_TYPES.VARIABLE) {
        // For variables, use monthlyBudget
        return sum + (env.monthlyBudget || env.monthlyAmount || 0);
      } else if (envelopeType === ENVELOPE_TYPES.SAVINGS) {
        // For savings, use biweeklyAllocation or a reasonable monthly contribution
        return (
          sum +
          (env.biweeklyAllocation
            ? env.biweeklyAllocation * BIWEEKLY_MULTIPLIER
            : 50)
        );
      }
      return sum;
    }, 0);

    if (totalBudget === 0) {
      // Fallback to equal distribution if no budgets set
      distributeEqually();
      return;
    }

    const newDistributions = {};

    envelopes.forEach((envelope) => {
      const envelopeType =
        envelope.envelopeType || AUTO_CLASSIFY_ENVELOPE_TYPE(envelope.category);
      let monthlyBudget = 0;

      if (envelopeType === ENVELOPE_TYPES.BILL) {
        // For bills, convert biweekly to monthly
        monthlyBudget = envelope.biweeklyAllocation
          ? envelope.biweeklyAllocation * BIWEEKLY_MULTIPLIER
          : 0;
      } else if (envelopeType === ENVELOPE_TYPES.VARIABLE) {
        // For variables, use monthlyBudget
        monthlyBudget = envelope.monthlyBudget || envelope.monthlyAmount || 0;
      } else if (envelopeType === ENVELOPE_TYPES.SAVINGS) {
        // For savings, use biweekly allocation or default
        monthlyBudget = envelope.biweeklyAllocation
          ? envelope.biweeklyAllocation * BIWEEKLY_MULTIPLIER
          : 50;
      }

      const proportion = monthlyBudget / totalBudget;
      const amount = Math.floor(unassignedCash * proportion * 100) / 100;

      if (amount > 0) {
        newDistributions[envelope.id] = amount;
      }
    });

    setDistributions(newDistributions);
  }, [envelopes, unassignedCash, distributeEqually]);

  // Distribute based on bill envelope priorities
  const distributeBillPriority = useCallback(() => {
    if (envelopes.length === 0) return;

    const billEnvelopes = envelopes.filter(
      (env) =>
        env.envelopeType === ENVELOPE_TYPES.BILL ||
        AUTO_CLASSIFY_ENVELOPE_TYPE(env.category) === ENVELOPE_TYPES.BILL,
    );

    if (billEnvelopes.length === 0) {
      // Fallback to proportional if no bill envelopes
      distributeProportionally();
      return;
    }

    // Calculate priorities and recommendations for each bill envelope
    const envelopeRecommendations = billEnvelopes.map((envelope) => {
      const priority = calculateBillEnvelopePriority(envelope, bills);
      const recommendation = getRecommendedBillFunding(
        envelope,
        bills,
        unassignedCash,
      );

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
    envelopeRecommendations.forEach(
      ({ envelope, recommendedAmount, isUrgent }) => {
        if (isUrgent && remainingCash >= recommendedAmount) {
          newDistributions[envelope.id] = recommendedAmount;
          remainingCash -= recommendedAmount;
        }
      },
    );

    // Second pass: Fund other envelopes based on availability
    envelopeRecommendations.forEach(
      ({ envelope, recommendedAmount, isUrgent }) => {
        if (!isUrgent && remainingCash > 0) {
          const amountToAllocate = Math.min(recommendedAmount, remainingCash);
          if (amountToAllocate > 0) {
            newDistributions[envelope.id] = amountToAllocate;
            remainingCash -= amountToAllocate;
          }
        }
      },
    );

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
        const distributionAmount = parseFloat(amount) || 0;
        if (distributionAmount > 0) {
          const envelope = envelopes.find((env) => env.id === envelopeId);
          if (envelope) {
            envelopeUpdates.push({
              ...envelope,
              currentBalance:
                (envelope.currentBalance || 0) + distributionAmount,
            });
          }
        }
      });

      // Apply updates
      if (envelopeUpdates.length > 0) {
        await budgetDb.bulkUpsertEnvelopes(envelopeUpdates);
        setUnassignedCash(remainingCash);
        queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      }

      // Reset distributions after successful application
      setDistributions({});
    } catch (error) {
      console.error("Error applying distribution:", error);
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
