import { useState, useCallback } from "react";
import { transactionSplitterService } from "../../services/transactions/transactionSplitterService";

/**
 * Hook for managing transaction splitter UI state
 */
export const useTransactionSplitterUI = () => {
  const [splitAllocations, setSplitAllocations] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const resetState = useCallback(() => {
    setSplitAllocations([]);
    setIsProcessing(false);
  }, []);

  return {
    splitAllocations,
    setSplitAllocations,
    isProcessing,
    setIsProcessing,
    resetState,
  };
};

/**
 * Hook for transaction splitting business logic
 */
export const useTransactionSplitterLogic = (
  splitAllocations,
  setSplitAllocations,
  transaction,
  envelopes
) => {
  // Initialize splits when transaction changes
  const initializeSplits = useCallback(() => {
    if (!transaction) return;
    const initialSplits = transactionSplitterService.initializeSplitsFromTransaction(
      transaction,
      envelopes
    );
    setSplitAllocations(initialSplits);
  }, [transaction, envelopes, setSplitAllocations]);

  // Add new split allocation
  const addSplitAllocation = useCallback(() => {
    if (!transaction) return;
    const newSplit = transactionSplitterService.createNewSplitAllocation(
      transaction,
      splitAllocations
    );
    setSplitAllocations((prev) => [...prev, newSplit]);
  }, [transaction, splitAllocations, setSplitAllocations]);

  // Update split allocation
  const updateSplitAllocation = useCallback(
    (id, field, value) => {
      const updatedSplits = transactionSplitterService.updateSplitAllocation(
        splitAllocations,
        id,
        field,
        value,
        envelopes
      );
      setSplitAllocations(updatedSplits);
    },
    [splitAllocations, envelopes, setSplitAllocations]
  );

  // Remove split allocation
  const removeSplitAllocation = useCallback(
    (id) => {
      setSplitAllocations((prev) => prev.filter((split) => split.id !== id));
    },
    [setSplitAllocations]
  );

  // Calculate split totals
  const calculateSplitTotals = useCallback(() => {
    if (!transaction) return { original: 0, allocated: 0, remaining: 0, isValid: false };
    return transactionSplitterService.calculateSplitTotals(
      splitAllocations,
      Math.abs(transaction.amount)
    );
  }, [splitAllocations, transaction]);

  // Validate splits
  const validateSplits = useCallback(() => {
    if (!transaction) return [];
    return transactionSplitterService.validateSplits(
      splitAllocations,
      Math.abs(transaction.amount)
    );
  }, [splitAllocations, transaction]);

  // Auto-balance splits
  const autoBalance = useCallback(() => {
    if (!transaction) return;
    const balancedSplits = transactionSplitterService.autoBalanceSplits(
      splitAllocations,
      Math.abs(transaction.amount)
    );
    setSplitAllocations(balancedSplits);
  }, [splitAllocations, transaction, setSplitAllocations]);

  // Split evenly
  const splitEvenly = useCallback(() => {
    if (!transaction) return;
    const evenSplits = transactionSplitterService.splitEvenly(
      splitAllocations,
      Math.abs(transaction.amount)
    );
    setSplitAllocations(evenSplits);
  }, [splitAllocations, transaction, setSplitAllocations]);

  return {
    initializeSplits,
    addSplitAllocation,
    updateSplitAllocation,
    removeSplitAllocation,
    calculateSplitTotals,
    validateSplits,
    autoBalance,
    splitEvenly,
  };
};

/**
 * Hook for handling transaction splitting operations
 */
export const useTransactionSplitterOperations = (
  splitAllocations,
  transaction,
  setIsProcessing,
  onSplitTransaction,
  onClose
) => {
  const applySplitTransaction = useCallback(async () => {
    if (!transaction) return;

    const errors = transactionSplitterService.validateSplits(
      splitAllocations,
      Math.abs(transaction.amount)
    );

    if (errors.length > 0) {
      return { success: false, errors };
    }

    setIsProcessing(true);

    try {
      // Create split transactions
      const splitTransactions = transactionSplitterService.createSplitTransactions(
        transaction,
        splitAllocations
      );

      // Send split transactions to parent
      await onSplitTransaction?.(transaction, splitTransactions);

      // Close modal
      onClose?.();

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsProcessing(false);
    }
  }, [splitAllocations, transaction, setIsProcessing, onSplitTransaction, onClose]);

  return {
    applySplitTransaction,
  };
};
