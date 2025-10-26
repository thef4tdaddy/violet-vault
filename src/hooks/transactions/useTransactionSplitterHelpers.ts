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
 * Validate splits and return validation status
 */
export const validateSplitsHandler = (
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
  isProcessing: boolean,
  splitAllocations: unknown[],
  transaction: unknown,
  validateSplits: () => boolean,
  onSplit?: (splitTransactions: unknown[], transaction: unknown) => Promise<void>,
  setIsProcessing?: (processing: boolean) => void,
  setErrors?: (fn: (prev: string[]) => string[]) => void
): Promise<boolean> => {
  if (isProcessing) return false;

  try {
    setIsProcessing?.(true);

    // Validate splits first
    const isValid = validateSplits();
    if (!isValid) {
      logger.warn("Cannot submit invalid splits");
      return false;
    }

    // Prepare split transactions
    const splitTransactions = prepareSplitTransactions(splitAllocations, transaction);

    logger.info("Submitting transaction split", {
      originalTransactionId: (transaction as { id?: string }).id,
      splitCount: splitTransactions.length,
      totalAmount: splitTransactions.reduce(
        (sum: number, t: { amount: number }) => sum + Math.abs(t.amount),
        0
      ),
    });

    // Call the onSplit callback if provided
    if (onSplit) {
      await onSplit(splitTransactions, transaction);
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
