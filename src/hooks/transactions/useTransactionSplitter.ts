/**
 * Transaction Splitter Hook
 * Manages transaction splitting state and operations
 * Created for Issue #508 - extracted from TransactionSplitter.jsx
 */
import { useState, useEffect, useCallback } from "react";
import type { Transaction, Envelope, SplitAllocation } from "@/types/finance";
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

interface UseTransactionSplitterOptions {
  transaction?: Transaction;
  envelopes?: Envelope[];
  onSplit?: (splitTransactions: Transaction[], transaction: Transaction) => Promise<void>;
}

/**
 * Hook for managing transaction splitting functionality
 * @param options - Hook options
 * @returns Splitter state and actions
 */
const useTransactionSplitter = (options: UseTransactionSplitterOptions = {}) => {
  const { transaction, envelopes = [], onSplit } = options;

  // Core state
  const [splitAllocations, setSplitAllocations] = useState<SplitAllocation[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);

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
    (splitId: string, field: keyof SplitAllocation, value: unknown) => {
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
  const removeSplitById = useCallback((splitId: string) => {
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
