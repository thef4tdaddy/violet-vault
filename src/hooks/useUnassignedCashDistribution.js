import { useState, useCallback, useMemo } from "react";
import { useBudgetStore } from "../stores/budgetStore";
import { ENVELOPE_TYPES, AUTO_CLASSIFY_ENVELOPE_TYPE } from "../constants/categories";
import { BIWEEKLY_MULTIPLIER } from "../constants/frequency";

/**
 * Custom hook for managing unassigned cash distribution logic
 * Handles distribution calculations, validation, and envelope updates
 */
const useUnassignedCashDistribution = () => {
  const budget = useBudgetStore();
  const { envelopes = [], unassignedCash = 0, bulkUpdateEnvelopes, setUnassignedCash } = budget;

  // Distribution state (modal state now handled by budget store)
  const [distributions, setDistributions] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate total being distributed
  const totalDistributed = useMemo(() => {
    return Object.values(distributions).reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0);
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

    // Calculate total budget across all envelope types
    const totalBudget = envelopes.reduce((sum, env) => {
      const envelopeType = env.envelopeType || AUTO_CLASSIFY_ENVELOPE_TYPE(env.category);

      if (envelopeType === ENVELOPE_TYPES.BILL) {
        // For bills, use biweeklyAllocation (convert to monthly equivalent)
        return sum + (env.biweeklyAllocation ? env.biweeklyAllocation * BIWEEKLY_MULTIPLIER : 0);
      } else if (envelopeType === ENVELOPE_TYPES.VARIABLE) {
        // For variables, use monthlyBudget
        return sum + (env.monthlyBudget || env.monthlyAmount || 0);
      } else if (envelopeType === ENVELOPE_TYPES.SAVINGS) {
        // For savings, use biweeklyAllocation or a reasonable monthly contribution
        return sum + (env.biweeklyAllocation ? env.biweeklyAllocation * BIWEEKLY_MULTIPLIER : 50);
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
      const envelopeType = envelope.envelopeType || AUTO_CLASSIFY_ENVELOPE_TYPE(envelope.category);
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
              id: envelopeId,
              currentAmount: (envelope.currentAmount || 0) + distributionAmount,
            });
          }
        }
      });

      // Apply updates
      if (envelopeUpdates.length > 0) {
        bulkUpdateEnvelopes(envelopeUpdates);
        setUnassignedCash(remainingCash);
      }

      // Reset distributions after successful application
      setDistributions({});
    } catch (error) {
      console.error("Error applying distribution:", error);
      setIsProcessing(false);
    }
  }, [
    isValidDistribution,
    distributions,
    envelopes,
    bulkUpdateEnvelopes,
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
          newBalance: (envelope.currentAmount || 0) + distributionAmount,
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
    applyDistribution,

    // Data
    envelopes,
    unassignedCash,
    getDistributionPreview,
  };
};

export default useUnassignedCashDistribution;
