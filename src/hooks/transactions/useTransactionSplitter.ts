/**
 * Transaction Splitter Hook
 * Manages transaction splitting state and operations
 * Created for Issue #508 - extracted from TransactionSplitter.jsx
 */
import { useState, useEffect, useCallback } from "react";
import {
  initializeSplitsHandler,
  addSplitHandler,
  updateSplitHandler,
  removeSplitHandler,
  autoBalanceHandler,
  distributeEvenlyHandler,
  checkSplitsHandler,
  submitSplitHandler,
  calculateSplitComputedProperties,
} from "./useTransactionSplitterHelpers";

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
    addSplitHandler(transaction, setSplitAllocations, setErrors);
  }, [transaction]);

  /**
   * Update a split field
   */
  const updateSplit = useCallback(
    (splitId, field, value) => {
      updateSplitHandler(
        { splitId, field, value, envelopes, errorsLength: errors.length },
        setSplitAllocations,
        setErrors
      );
    },
    [envelopes, errors.length]
  );

  /**
   * Remove a split allocation
   */
  const removeSplitById = useCallback((splitId) => {
    removeSplitHandler(splitId, setSplitAllocations, setErrors);
  }, []);

  /**
   * Auto-balance splits to equal total
   */
  const autoBalance = useCallback(() => {
    autoBalanceHandler(transaction, setSplitAllocations, setErrors);
  }, [transaction]);

  /**
   * Split amount evenly across all allocations
   */
  const distributeEvenly = useCallback(() => {
    distributeEvenlyHandler(transaction, setSplitAllocations, setErrors);
  }, [transaction]);

  /**
   * Validate current splits
   */
  const validateSplits = useCallback(() => {
    return checkSplitsHandler(splitAllocations, transaction, setErrors);
  }, [splitAllocations, transaction]);

  /**
   * Submit the split transaction
   */
  const submitSplit = useCallback(async () => {
    return submitSplitHandler(
      {
        isProcessing,
        splitAllocations,
        transaction,
        validateSplits,
        onSplit,
      },
      setIsProcessing,
      setErrors
    );
  }, [isProcessing, splitAllocations, transaction, onSplit, validateSplits]);

  /**
   * Reset splits to initial state
   */
  const resetSplits = useCallback(() => {
    initializeSplits();
  }, [initializeSplits]);

  // Computed properties using helper
  const computed = calculateSplitComputedProperties(
    splitAllocations,
    transaction,
    errors,
    isProcessing
  );

  return {
    // State
    splitAllocations,
    isProcessing,
    errors,

    // Computed properties
    totals: computed.totals,
    summary: computed.summary,
    hasValidSplits: computed.hasValidSplits,
    canSubmit: computed.canSubmit,
    hasUnsavedChanges: computed.hasUnsavedChanges,

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
