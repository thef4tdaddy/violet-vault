/**
 * Transaction Splitter Hook
 * Manages transaction splitting state and operations
 * Created for Issue #508 - extracted from TransactionSplitter.jsx
 */
import { useState, useEffect, useCallback } from "react";
import {
  addNewSplit,
  updateSplitField,
  removeSplit,
  autoBalanceSplits,
  splitEvenly,
} from "@/utils/transactions/splitting";
import {
  initializeSplitsHandler,
  validateSplitsHandler,
  submitSplitHandler,
  calculateSplitComputedProperties,
} from "./useTransactionSplitterHelpers";
import logger from "@/utils/common/logger";

/**
 * Hook for managing transaction splitting functionality
 * @param {Object} options - Hook options
 * @param {Object} options.transaction - Transaction to split
 * @param {Array} options.envelopes - Available envelopes
 * @param {Function} options.onSplit - Callback when split is completed
 * @returns {Object} Splitter state and actions
 */
const useTransactionSplitter = (options = {}) => {
  const { transaction, envelopes = [], onSplit } = options || {};

  // Core state
  const [splitAllocations, setSplitAllocations] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState([]);

  /**
   * Initialize splits when transaction changes
   */
  const initializeSplits = useCallback(() => {
    initializeSplitsHandler(transaction, envelopes, setSplitAllocations, setErrors);
  }, [transaction, envelopes]);

  // Initialize splits when transaction changes
  useEffect(() => {
    initializeSplits();
  }, [initializeSplits]);

  /**
   * Add a new split allocation
   */
  const addSplit = useCallback(() => {
    try {
      setSplitAllocations((current) => {
        const newSplits = addNewSplit(current, transaction, {
          category: transaction.category || "",
        });

        logger.debug("Added new split", {
          totalSplits: newSplits.length,
          newSplitAmount: newSplits[newSplits.length - 1]?.amount,
        });

        return newSplits;
      });
    } catch (error) {
      logger.error("Failed to add split", error);
      setErrors((prev) => [...prev, "Failed to add split: " + error.message]);
    }
  }, [transaction]);

  /**
   * Update a split field
   */
  const updateSplit = useCallback(
    (splitId, field, value) => {
      try {
        setSplitAllocations((current) => {
          const updated = updateSplitField(current, splitId, field, value, envelopes);

          // Clear errors when user makes changes
          if (errors.length > 0) {
            setErrors([]);
          }

          return updated;
        });
      } catch (error) {
        logger.error("Failed to update split", error);
        setErrors((prev) => [...prev, "Failed to update split: " + error.message]);
      }
    },
    [envelopes, errors.length]
  );

  /**
   * Remove a split allocation
   */
  const removeSplitById = useCallback((splitId) => {
    try {
      setSplitAllocations((current) => {
        const updated = removeSplit(current, splitId);

        logger.debug("Removed split", {
          splitId,
          remainingSplits: updated.length,
        });

        return updated;
      });
    } catch (error) {
      logger.error("Failed to remove split", error);
      setErrors((prev) => [...prev, "Failed to remove split: " + error.message]);
    }
  }, []);

  /**
   * Auto-balance splits to equal total
   */
  const autoBalance = useCallback(() => {
    try {
      setSplitAllocations((current) => {
        const balanced = autoBalanceSplits(current, transaction);

        logger.debug("Auto-balanced splits", {
          originalTotal: current.reduce((sum, s) => sum + s.amount, 0),
          balancedTotal: balanced.reduce((sum, s) => sum + s.amount, 0),
        });

        return balanced;
      });

      setErrors([]);
    } catch (error) {
      logger.error("Failed to auto-balance splits", error);
      setErrors((prev) => [...prev, "Failed to auto-balance splits: " + error.message]);
    }
  }, [transaction]);

  /**
   * Split amount evenly across all allocations
   */
  const distributeEvenly = useCallback(() => {
    try {
      setSplitAllocations((current) => {
        const evenSplits = splitEvenly(current, transaction);

        logger.debug("Split evenly", {
          splitCount: current.length,
          amountPerSplit: evenSplits[0]?.amount,
        });

        return evenSplits;
      });

      setErrors([]);
    } catch (error) {
      logger.error("Failed to split evenly", error);
      setErrors((prev) => [...prev, "Failed to split evenly: " + error.message]);
    }
  }, [transaction]);

  /**
   * Validate current splits
   */
  const validateSplits = useCallback(() => {
    try {
      const validationErrors = validateSplitAllocations(splitAllocations, transaction);
      setErrors(validationErrors);
      return validationErrors.length === 0;
    } catch (error) {
      logger.error("Failed to validate splits", error);
      const errorMsg = "Validation failed: " + error.message;
      setErrors([errorMsg]);
      return false;
    }
  }, [splitAllocations, transaction]);

  /**
   * Submit the split transaction
   */
  const submitSplit = useCallback(async () => {
    if (isProcessing) return false;

    try {
      setIsProcessing(true);

      // Validate splits first
      const isValid = validateSplits();
      if (!isValid) {
        logger.warn("Cannot submit invalid splits");
        return false;
      }

      // Prepare split transactions
      const splitTransactions = prepareSplitTransactions(splitAllocations, transaction);

      logger.info("Submitting transaction split", {
        originalTransactionId: transaction.id,
        splitCount: splitTransactions.length,
        totalAmount: splitTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0),
      });

      // Call the onSplit callback if provided
      if (onSplit) {
        await onSplit(splitTransactions, transaction);
      }

      return true;
    } catch (error) {
      logger.error("Failed to submit split", error);
      setErrors((prev) => [...prev, "Failed to submit split: " + error.message]);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, splitAllocations, transaction, onSplit, validateSplits]);

  /**
   * Reset splits to initial state
   */
  const resetSplits = useCallback(() => {
    initializeSplits();
  }, [initializeSplits]);

  /**
   * Get current split summary
   */
  const splitSummary = useCallback(() => {
    return getSplitSummary(splitAllocations, transaction);
  }, [splitAllocations, transaction]);

  /**
   * Calculate split totals
   */
  const totals = useCallback(() => {
    return calculateSplitTotals(transaction, splitAllocations);
  }, [transaction, splitAllocations]);

  // Computed properties
  const currentTotals = totals();
  const currentSummary = splitSummary();
  const hasValidSplits =
    errors.length === 0 && currentTotals.isValid && splitAllocations.length > 0;
  const canSubmit = hasValidSplits && !isProcessing;
  const hasUnsavedChanges = splitAllocations.length > 0;

  return {
    // State
    splitAllocations,
    isProcessing,
    errors,

    // Computed properties
    totals: currentTotals,
    summary: currentSummary,
    hasValidSplits,
    canSubmit,
    hasUnsavedChanges,

    // Actions
    initializeSplits,
    addSplit,
    updateSplit,
    removeSplit: removeSplitById,
    autoBalance,
    distributeEvenly,
    validateSplits,
    submitSplit,
    resetSplits,

    // Utility
    clearErrors: () => setErrors([]),
  };
};

export { useTransactionSplitter };
