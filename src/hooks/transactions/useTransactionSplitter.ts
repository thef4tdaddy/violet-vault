/**
 * Transaction Splitter Hook
 * Manages transaction splitting state and operations
 * Created for Issue #508 - extracted from TransactionSplitter.jsx
 */
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
import { generateSplitId } from "@/utils/transactions/splitting";
import logger from "@/utils/common/logger";

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

  const scheduleMicrotask = useCallback((task: () => void) => {
    if (typeof queueMicrotask === "function") {
      queueMicrotask(task);
      return;
    }

    Promise.resolve().then(task).catch((error) => {
      logger.error("Failed to schedule microtask for transaction splitter", { error });
    });
  }, []);

  // Core state
  const [splitAllocations, setSplitAllocations] = useState<SplitAllocation[]>([]);
  const [initialSplits, setInitialSplits] = useState<SplitAllocation[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const lastTransactionKeyRef = useRef<string | null>(null);

  /**
   * Initialize splits when transaction changes
   */
  const applyInitialSplits = useCallback((splits: SplitAllocation[]) => {
    const normalized = splits.map((split) => ({
      ...split,
      id: split.id ?? generateSplitId(),
    }));
    setInitialSplits(normalized.map((split) => ({ ...split })));
    setSplitAllocations(normalized);
    setErrors([]);
  }, []);

  const initializeSplits = useCallback(() => {
    if (!transaction) {
      setInitialSplits([]);
      setSplitAllocations([]);
      setErrors([]);
      lastTransactionKeyRef.current = null;
      return;
    }

    initializeSplitsHandler(
      transaction,
      envelopes,
      (splits) => applyInitialSplits(splits),
      setErrors
    );
  }, [transaction, envelopes, applyInitialSplits]);

  useEffect(() => {
    const transactionId = transaction?.id;
    const transactionAmount = transaction?.amount ?? 0;
    const key =
      transactionId === undefined || transactionId === null
        ? null
        : `${transactionId}:${transactionAmount}`;

    if (!transaction) {
      lastTransactionKeyRef.current = null;
      scheduleMicrotask(() => {
        initializeSplits();
      });
      return;
    }

    if (key && key === lastTransactionKeyRef.current) {
      return;
    }

    scheduleMicrotask(() => {
      initializeSplits();
    });
    lastTransactionKeyRef.current = key;
  }, [transaction, initializeSplits, scheduleMicrotask]);

  /**
   * Add a new split allocation
   */
  const addSplit = useCallback(() => {
    addSplitHandler(transaction, (updater) => {
      setSplitAllocations((current) => {
        const next = updater(current);
        return next;
      });
    }, setErrors);
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
  const computed = useMemo(
    () =>
      calculateSplitComputedProperties(
        splitAllocations,
        transaction,
        errors,
        isProcessing,
        initialSplits
      ),
    [splitAllocations, transaction, errors, isProcessing, initialSplits]
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
