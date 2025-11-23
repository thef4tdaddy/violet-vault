/**
 * Transaction Splitting Utilities
 * Pure functions for transaction split calculations and validation
 * Extracted from TransactionSplitter.jsx for Issue #508
 * Converted to TypeScript for Issue #409
 */
import logger from "../common/logger.ts";
import type { Transaction, Envelope, SplitAllocation, SplitTotals } from "../../types/finance";

/**
 * Find envelope by category name
 */
export const findEnvelopeForCategory = (
  envelopes: Envelope[],
  categoryName: string
): Envelope | null => {
  if (!categoryName || !Array.isArray(envelopes)) return null;

  return (
    envelopes.find(
      (env) =>
        env.name.toLowerCase() === categoryName.toLowerCase() ||
        env.category?.toLowerCase() === categoryName.toLowerCase()
    ) || null
  );
};

/**
 * Initialize split allocations from transaction
 */
export const initializeSplitsFromTransaction = (
  transaction: Transaction,
  envelopes: Envelope[] = []
): SplitAllocation[] => {
  try {
    if (!transaction) return [];

    // Check if transaction has itemized metadata (like Amazon orders)
    if (transaction.metadata?.items && transaction.metadata.items.length > 1) {
      logger.debug("Initializing splits from itemized transaction", {
        itemCount: transaction.metadata.items.length,
      });

      // Initialize with individual items
      const itemSplits = transaction.metadata.items.map((item, index) => ({
        id: Date.now() + index,
        description: item.name || `Item ${index + 1}`,
        amount: Math.abs(item.totalPrice || item.price || 0),
        category: item.category?.name || transaction.category || "",
        envelopeId:
          findEnvelopeForCategory(envelopes, item.category?.name || transaction.category || "")
            ?.id || "",
        isOriginalItem: true,
        originalItem: item,
      }));

      // Add shipping/tax if present
      const extraItems: SplitAllocation[] = [];
      if (transaction.metadata.shipping !== undefined && transaction.metadata.shipping > 0) {
        extraItems.push({
          id: Date.now() + 1000,
          description: "Shipping & Handling",
          amount: transaction.metadata.shipping,
          category: "Shipping",
          envelopeId: "",
          isOriginalItem: false,
        });
      }

      if (transaction.metadata.tax !== undefined && transaction.metadata.tax > 0) {
        extraItems.push({
          id: Date.now() + 2000,
          description: "Sales Tax",
          amount: transaction.metadata.tax,
          category: "Tax",
          envelopeId: "",
          isOriginalItem: false,
        });
      }

      return [...itemSplits, ...extraItems];
    } else {
      // Initialize with single split for the full amount
      return [
        {
          id: Date.now(),
          description: transaction.description || "Transaction Split",
          amount: Math.abs(transaction.amount),
          category: transaction.category || "",
          envelopeId: transaction.envelopeId || "",
          isOriginalItem: false,
        },
      ];
    }
  } catch (error) {
    logger.error("Error initializing splits from transaction", error);
    return [];
  }
};

/**
 * Calculate split totals and validation status
 */
export const calculateSplitTotals = (
  transaction: Transaction | null | undefined,
  splitAllocations: SplitAllocation[] = []
): SplitTotals => {
  try {
    if (!transaction || transaction.amount === null || transaction.amount === undefined) {
      return {
        original: 0,
        allocated: 0,
        remaining: 0,
        isValid: true,
        isOverAllocated: false,
        isUnderAllocated: false,
      };
    }

    const originalAmount = Math.abs(transaction.amount);
    const allocated = splitAllocations.reduce((sum, split) => sum + (Number(split.amount) || 0), 0);
    const remaining = originalAmount - allocated;

    return {
      original: originalAmount,
      allocated: allocated,
      remaining: remaining,
      isValid: Math.abs(remaining) < 0.01, // Allow for small rounding differences
      isOverAllocated: remaining < -0.01,
      isUnderAllocated: remaining > 0.01,
    };
  } catch (error) {
    logger.error("Error calculating split totals", error);
    return {
      original: 0,
      allocated: 0,
      remaining: 0,
      isValid: false,
      isOverAllocated: false,
      isUnderAllocated: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Validate split allocations
 */
export const validateSplitAllocations = (
  splitAllocations: SplitAllocation[] = [],
  transaction: Transaction
): string[] => {
  const errors = [];

  try {
    splitAllocations.forEach((split, index) => {
      if (!split.description?.trim()) {
        errors.push(`Split ${index + 1}: Description is required`);
      }
      if (!split.category?.trim()) {
        errors.push(`Split ${index + 1}: Category is required`);
      }
      if (!split.amount || split.amount <= 0) {
        errors.push(`Split ${index + 1}: Amount must be greater than 0`);
      }
    });

    const totals = calculateSplitTotals(transaction, splitAllocations);
    if (!totals.isValid) {
      if (totals.isOverAllocated) {
        errors.push(
          `Total splits ($${totals.allocated.toFixed(2)}) exceed original amount ($${totals.original.toFixed(2)})`
        );
      } else {
        errors.push(
          `Total splits ($${totals.allocated.toFixed(2)}) are less than original amount ($${totals.original.toFixed(2)})`
        );
      }
    }
  } catch (error) {
    logger.error("Error validating split allocations", error);
    errors.push("Validation error: " + (error instanceof Error ? error.message : String(error)));
  }

  return errors;
};

/**
 * Auto-balance splits to equal the total transaction amount
 */
export const autoBalanceSplits = (
  splitAllocations: SplitAllocation[] = [],
  transaction: Transaction
): SplitAllocation[] => {
  try {
    const totals = calculateSplitTotals(transaction, splitAllocations);
    if (totals.isValid || splitAllocations.length === 0) {
      return splitAllocations;
    }

    const difference = totals.remaining;
    const adjustmentPerSplit = difference / splitAllocations.length;

    logger.debug("Auto-balancing splits", {
      difference,
      adjustmentPerSplit,
      splitCount: splitAllocations.length,
    });

    return splitAllocations.map((split) => ({
      ...split,
      amount: parseFloat((split.amount + adjustmentPerSplit).toFixed(2)),
    }));
  } catch (error) {
    logger.error("Error auto-balancing splits", error);
    return splitAllocations;
  }
};

/**
 * Split transaction amount evenly across all allocations
 */
export const splitEvenly = (
  splitAllocations: SplitAllocation[] = [],
  transaction: Transaction
): SplitAllocation[] => {
  try {
    if (splitAllocations.length === 0) return splitAllocations;

    const originalAmount = Math.abs(transaction.amount);
    const amountPerSplit = Math.round((originalAmount / splitAllocations.length) * 100) / 100;

    logger.debug("Splitting evenly", {
      originalAmount,
      splitCount: splitAllocations.length,
      amountPerSplit,
    });

    return splitAllocations.map((split, index) => ({
      ...split,
      // Adjust last split to handle rounding differences
      amount:
        index === splitAllocations.length - 1
          ? Math.round((originalAmount - amountPerSplit * (splitAllocations.length - 1)) * 100) /
            100
          : amountPerSplit,
    }));
  } catch (error) {
    logger.error("Error splitting evenly", error);
    return splitAllocations;
  }
};

/**
 * Add a new split allocation with remaining amount
 */
export const addNewSplit = (
  currentSplits: SplitAllocation[] = [],
  transaction: Transaction,
  defaults: Partial<SplitAllocation> = {}
): SplitAllocation[] => {
  try {
    const totalAmount = Math.abs(transaction.amount);
    const allocated = currentSplits.reduce((sum, split) => sum + (Number(split.amount) || 0), 0);
    const remaining = totalAmount - allocated;

    const newSplit = {
      id: Date.now() + Math.random(), // Ensure unique ID
      description: defaults.description || "",
      amount: Math.max(0, Math.round(remaining * 100) / 100), // Round to 2 decimal places
      category: defaults.category || transaction.category || "",
      envelopeId: defaults.envelopeId || "",
      isOriginalItem: false,
      ...defaults,
    };

    logger.debug("Adding new split", {
      remaining,
      newSplitAmount: newSplit.amount,
    });

    return [...currentSplits, newSplit];
  } catch (error) {
    logger.error("Error adding new split", error);
    return currentSplits;
  }
};

/**
 * Update a specific split allocation field
 */
export const updateSplitField = (
  currentSplits: SplitAllocation[] = [],
  splitId: string | number,
  field: keyof SplitAllocation,
  value: unknown,
  envelopes: Envelope[] = []
): SplitAllocation[] => {
  try {
    return currentSplits.map((split) => {
      if (split.id === splitId) {
        const updated = { ...split, [field]: value } as SplitAllocation;

        // If category changes, try to find matching envelope
        if (field === "category" && typeof value === "string") {
          const envelope = findEnvelopeForCategory(envelopes, value);
          updated.envelopeId = envelope?.id || split.envelopeId;
        }

        return updated;
      }
      return split;
    });
  } catch (error) {
    logger.error("Error updating split field", error);
    return currentSplits;
  }
};

/**
 * Remove a split allocation
 */
export const removeSplit = (
  currentSplits: SplitAllocation[] = [],
  splitId: string | number
): SplitAllocation[] => {
  try {
    // Don't allow removal if only one split remains
    if (currentSplits.length <= 1) {
      logger.warn("Cannot remove last split allocation");
      return currentSplits;
    }

    return currentSplits.filter((split) => split.id !== splitId);
  } catch (error) {
    logger.error("Error removing split", error);
    return currentSplits;
  }
};

/**
 * Prepare split data for transaction submission
 */
export const prepareSplitTransactions = (
  splitAllocations: SplitAllocation[] = [],
  originalTransaction: Transaction
): Transaction[] => {
  try {
    return splitAllocations.map((split, index) => ({
      id: `${originalTransaction.id}_split_${index}`,
      parentTransactionId: originalTransaction.id,
      description: split.description,
      amount: originalTransaction.amount < 0 ? -split.amount : split.amount, // Preserve original sign
      category: split.category,
      envelopeId: split.envelopeId,
      date: originalTransaction.date,
      account: originalTransaction.account,
      type: originalTransaction.type,
      isSplit: true,
      splitIndex: index,
      splitTotal: splitAllocations.length,
      originalAmount: originalTransaction.amount,
      metadata: {
        ...originalTransaction.metadata,
        splitData: {
          splitIndex: index,
          totalSplits: splitAllocations.length,
          originalTransactionId: originalTransaction.id,
          isOriginalItem: split.isOriginalItem,
          originalItem: split.originalItem,
        },
      },
    }));
  } catch (error) {
    logger.error("Error preparing split transactions", error);
    return [];
  }
};

/**
 * Get split summary for display
 */
export const getSplitSummary = (
  splitAllocations: SplitAllocation[] = [],
  transaction: Transaction | null | undefined
): {
  totalSplits: number;
  originalAmount: number;
  allocatedAmount: number;
  remainingAmount: number;
  isValid: boolean;
  isBalanced: boolean;
  validationErrors: string[];
  canSubmit: boolean;
} => {
  try {
    if (!transaction) {
      return {
        totalSplits: 0,
        originalAmount: 0,
        allocatedAmount: 0,
        remainingAmount: 0,
        isValid: false,
        isBalanced: false,
        validationErrors: ["No transaction selected"],
        canSubmit: false,
      };
    }

    const totals = calculateSplitTotals(transaction, splitAllocations);
    const validationErrors = validateSplitAllocations(splitAllocations, transaction);

    return {
      totalSplits: splitAllocations.length,
      originalAmount: totals.original,
      allocatedAmount: totals.allocated,
      remainingAmount: totals.remaining,
      isValid: validationErrors.length === 0 && totals.isValid,
      isBalanced: totals.isValid,
      validationErrors,
      canSubmit: validationErrors.length === 0 && totals.isValid && splitAllocations.length > 0,
    };
  } catch (error) {
    logger.error("Error getting split summary", error);
    return {
      totalSplits: 0,
      originalAmount: 0,
      allocatedAmount: 0,
      remainingAmount: 0,
      isValid: false,
      isBalanced: false,
      validationErrors: [
        "Error calculating summary: " + (error instanceof Error ? error.message : String(error)),
      ],
      canSubmit: false,
    };
  }
};
