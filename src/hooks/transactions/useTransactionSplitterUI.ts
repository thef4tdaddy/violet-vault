import { useState, useCallback } from "react";
import type React from "react";
import { transactionSplitterService } from "../../services/transactions/transactionSplitterService";
import type { Transaction, Envelope, SplitAllocation } from "@/types/finance";

/**
 * Hook for managing transaction splitter UI state
 */
export const useTransactionSplitterUI = () => {
  const [splitAllocations, setSplitAllocations] = useState<SplitAllocation[]>([]);
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
  splitAllocations: SplitAllocation[],
  setSplitAllocations: React.Dispatch<React.SetStateAction<SplitAllocation[]>>,
  transaction: Transaction | null,
  envelopes: Envelope[]
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
    setSplitAllocations((prev: SplitAllocation[]) => [...prev, newSplit]);
  }, [transaction, splitAllocations, setSplitAllocations]);

  // Update split allocation
  const updateSplitAllocation = useCallback(
    <K extends keyof SplitAllocation>(id: number, field: K, value: SplitAllocation[K]) => {
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
    (id: number) => {
      setSplitAllocations((prev: SplitAllocation[]) => prev.filter((split) => split.id !== id));
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
  splitAllocations: SplitAllocation[],
  transaction: Transaction | null,
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>,
  onSplitTransaction?: (
    transaction: Transaction,
    splitTransactions: Transaction[]
  ) => Promise<void>,
  onClose?: () => void
) => {
  const applySplitTransaction = useCallback(async () => {
    if (!transaction) return { success: false, errors: ["No transaction provided"] };

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
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  }, [splitAllocations, transaction, setIsProcessing, onSplitTransaction, onClose]);

  return {
    applySplitTransaction,
  };
};
