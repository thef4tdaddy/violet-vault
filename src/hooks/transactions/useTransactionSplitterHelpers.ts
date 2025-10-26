/**
 * Helper functions for useTransactionSplitter hook
 * Extracted to reduce function complexity (Issue #761 - Batch 5)
 */
import logger from "@/utils/common/logger";
import {
  initializeSplitsFromTransaction,
  validateSplitAllocations,
  prepareSplitTransactions,
  getSplitSummary,
  calculateSplitTotals,
  addNewSplit,
  updateSplitField,
  removeSplit,
  autoBalanceSplits,
  splitEvenly,
} from "@/utils/transactions/splitting";

/**
 * Initialize splits from a transaction
 */
export const initializeSplitsHandler = (
  transaction: unknown,
  envelopes: unknown[],
  setSplitAllocations: (splits: unknown[]) => void,
  setErrors: (errors: string[]) => void
) => {
  try {
    if (!transaction) {
      setSplitAllocations([]);
      return;
    }

    logger.debug("Initializing transaction splits", {
      transactionId: (transaction as { id?: string }).id,
      amount: (transaction as { amount?: number }).amount,
      hasMetadata: !!(transaction as { metadata?: { items?: unknown } }).metadata?.items,
    });

    const initialSplits = initializeSplitsFromTransaction(transaction, envelopes);
    setSplitAllocations(initialSplits);
    setErrors([]);
  } catch (error) {
    logger.error("Failed to initialize splits", error);
    setErrors(["Failed to initialize splits: " + (error as Error).message]);
  }
};

/**
 * Add a new split allocation
 */
export const addSplitHandler = (
  transaction: unknown,
  setSplitAllocations: (fn: (current: unknown[]) => unknown[]) => void,
  setErrors: (fn: (prev: string[]) => string[]) => void
) => {
  try {
    setSplitAllocations((current) => {
      const newSplits = addNewSplit(current, transaction, {
        category: (transaction as { category?: string }).category || "",
      });

      logger.debug("Added new split", {
        totalSplits: newSplits.length,
        newSplitAmount: newSplits[newSplits.length - 1]?.amount,
      });

      return newSplits;
    });
  } catch (error) {
    logger.error("Failed to add split", error);
    setErrors((prev) => [...prev, "Failed to add split: " + (error as Error).message]);
  }
};

/**
 * Update a split field
 */
export const updateSplitHandler = (
  params: {
    splitId: string;
    field: string;
    value: unknown;
    envelopes: unknown[];
    errorsLength: number;
  },
  setSplitAllocations: (fn: (current: unknown[]) => unknown[]) => void,
  setErrors: (fn: (prev: string[]) => string[]) => void
) => {
  try {
    setSplitAllocations((current) => {
      const updated = updateSplitField(current, params.splitId, params.field, params.value, params.envelopes);

      // Clear errors when user makes changes
      if (params.errorsLength > 0) {
        setErrors(() => []);
      }

      return updated;
    });
  } catch (error) {
    logger.error("Failed to update split", error);
    setErrors((prev) => [...prev, "Failed to update split: " + (error as Error).message]);
  }
};

/**
 * Remove a split allocation
 */
export const removeSplitHandler = (
  splitId: string,
  setSplitAllocations: (fn: (current: unknown[]) => unknown[]) => void,
  setErrors: (fn: (prev: string[]) => string[]) => void
) => {
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
    setErrors((prev) => [...prev, "Failed to remove split: " + (error as Error).message]);
  }
};

/**
 * Auto-balance splits to equal total
 */
export const autoBalanceHandler = (
  transaction: unknown,
  setSplitAllocations: (fn: (current: unknown[]) => unknown[]) => void,
  setErrors: (errors: string[]) => void
) => {
  try {
    setSplitAllocations((current) => {
      const balanced = autoBalanceSplits(current, transaction);

      logger.debug("Auto-balanced splits", {
        originalTotal: current.reduce((sum: number, s: { amount: number }) => sum + s.amount, 0),
        balancedTotal: balanced.reduce(
          (sum: number, s: { amount: number }) => sum + s.amount,
          0
        ),
      });

      return balanced;
    });

    setErrors([]);
  } catch (error) {
    logger.error("Failed to auto-balance splits", error);
    setErrors((prev) => [...prev, "Failed to auto-balance splits: " + (error as Error).message]);
  }
};

/**
 * Split amount evenly across all allocations
 */
export const distributeEvenlyHandler = (
  transaction: unknown,
  setSplitAllocations: (fn: (current: unknown[]) => unknown[]) => void,
  setErrors: (errors: string[]) => void
) => {
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
    setErrors((prev) => [...prev, "Failed to split evenly: " + (error as Error).message]);
  }
};

/**
 * Check splits and return validation status
 * Wrapper for the utility function validateSplitAllocations
 */
export const checkSplitsHandler = (
  splitAllocations: unknown[],
  transaction: unknown,
  setErrors: (errors: string[]) => void
): boolean => {
  try {
    const validationErrors = validateSplitAllocations(splitAllocations, transaction);
    setErrors(validationErrors);
    return validationErrors.length === 0;
  } catch (error) {
    logger.error("Failed to validate splits", error);
    const errorMsg = "Validation failed: " + (error as Error).message;
    setErrors([errorMsg]);
    return false;
  }
};

/**
 * Submit split transaction
 */
export const submitSplitHandler = async (
  params: {
    isProcessing: boolean;
    splitAllocations: unknown[];
    transaction: unknown;
    validateSplits: () => boolean;
    onSplit?: (splitTransactions: unknown[], transaction: unknown) => Promise<void>;
  },
  setIsProcessing?: (processing: boolean) => void,
  setErrors?: (fn: (prev: string[]) => string[]) => void
): Promise<boolean> => {
  if (params.isProcessing) return false;

  try {
    setIsProcessing?.(true);

    // Validate splits first
    const isValid = params.validateSplits();
    if (!isValid) {
      logger.warn("Cannot submit invalid splits");
      return false;
    }

    // Prepare split transactions
    const splitTransactions = prepareSplitTransactions(params.splitAllocations, params.transaction);

    logger.info("Submitting transaction split", {
      originalTransactionId: (params.transaction as { id?: string }).id,
      splitCount: splitTransactions.length,
      totalAmount: splitTransactions.reduce(
        (sum: number, t: { amount: number }) => sum + Math.abs(t.amount),
        0
      ),
    });

    // Call the onSplit callback if provided
    if (params.onSplit) {
      await params.onSplit(splitTransactions, params.transaction);
    }

    return true;
  } catch (error) {
    logger.error("Failed to submit split", error);
    setErrors?.((prev) => [...prev, "Failed to submit split: " + (error as Error).message]);
    return false;
  } finally {
    setIsProcessing?.(false);
  }
};

/**
 * Calculate computed properties for splits
 */
export const calculateSplitComputedProperties = (
  splitAllocations: unknown[],
  transaction: unknown,
  errors: string[],
  isProcessing: boolean
) => {
  const totals = calculateSplitTotals(transaction, splitAllocations);
  const summary = getSplitSummary(splitAllocations, transaction);
  const hasValidSplits = errors.length === 0 && totals.isValid && splitAllocations.length > 0;
  const canSubmit = hasValidSplits && !isProcessing;
  const hasUnsavedChanges = splitAllocations.length > 0;

  return {
    totals,
    summary,
    hasValidSplits,
    canSubmit,
    hasUnsavedChanges,
  };
};
