/**
 * Transaction Splitting Utilities
 * Pure functions for transaction split calculations and validation
 * Extracted from TransactionSplitter.jsx for Issue #508
 */
import logger from "../common/logger.js";

/**
 * @typedef {Object} Envelope
 * @property {string} id - Envelope ID
 * @property {string} name - Envelope name
 * @property {string} [category] - Envelope category
 */

/**
 * @typedef {Object} TransactionItem
 * @property {string} [name] - Item name
 * @property {number} [totalPrice] - Total price
 * @property {number} [price] - Item price
 * @property {Object} [category] - Item category
 * @property {string} [category.name] - Category name
 */

/**
 * @typedef {Object} TransactionMetadata
 * @property {TransactionItem[]} [items] - Itemized transaction items
 * @property {number} [shipping] - Shipping cost
 * @property {number} [tax] - Tax amount
 */

/**
 * @typedef {Object} Transaction
 * @property {string} id - Transaction ID
 * @property {string} date - Transaction date
 * @property {string} description - Transaction description
 * @property {number} amount - Transaction amount
 * @property {string} category - Transaction category
 * @property {string} [envelopeId] - Envelope ID
 * @property {string} [account] - Account ID
 * @property {string} [type] - Transaction type
 * @property {boolean} [reconciled] - Reconciliation status
 * @property {TransactionMetadata} [metadata] - Transaction metadata
 */

/**
 * @typedef {Object} SplitAllocation
 * @property {string|number} id - Split ID
 * @property {string} description - Split description
 * @property {number} amount - Split amount
 * @property {string} category - Split category
 * @property {string} envelopeId - Envelope ID
 * @property {boolean} [isOriginalItem] - Whether this is an original itemized item
 * @property {TransactionItem} [originalItem] - Original item data
 */

/**
 * @typedef {Object} SplitTotals
 * @property {number} original - Original amount
 * @property {number} allocated - Allocated amount
 * @property {number} remaining - Remaining amount
 * @property {boolean} isValid - Whether splits are valid
 * @property {boolean} isOverAllocated - Whether over-allocated
 * @property {boolean} isUnderAllocated - Whether under-allocated
 * @property {string} [error] - Error message if any
 */

/**
 * @typedef {Object} SplitSummary
 * @property {number} totalSplits - Number of splits
 * @property {number} originalAmount - Original transaction amount
 * @property {number} allocatedAmount - Total allocated amount
 * @property {number} remainingAmount - Remaining amount
 * @property {boolean} isValid - Whether all splits are valid
 * @property {boolean} isBalanced - Whether splits balance to original
 * @property {string[]} validationErrors - Array of validation errors
 * @property {boolean} canSubmit - Whether splits can be submitted
 */

/**
 * Find envelope by category name
 * @param {Envelope[]} envelopes - Available envelopes
 * @param {string} categoryName - Category to search for
 * @returns {Envelope|null} Matching envelope or null
 */
export const findEnvelopeForCategory = (envelopes, categoryName) => {
  if (!categoryName || !Array.isArray(envelopes)) return null;

  return (
    envelopes.find(
      (env) =>
        env.name.toLowerCase() === categoryName.toLowerCase() ||
        env.category?.toLowerCase() === categoryName.toLowerCase(),
    ) || null
  );
};

/**
 * Initialize split allocations from transaction
 * @param {Transaction} transaction - Transaction to split
 * @param {Envelope[]} [envelopes=[]] - Available envelopes
 * @returns {SplitAllocation[]} Initial split allocations
 */
export const initializeSplitsFromTransaction = (
  transaction,
  envelopes = [],
) => {
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
          findEnvelopeForCategory(
            envelopes,
            item.category?.name || transaction.category || "",
          )?.id || "",
        isOriginalItem: true,
        originalItem: item,
      }));

      // Add shipping/tax if present
      const extraItems = [];
      if (transaction.metadata.shipping > 0) {
        extraItems.push({
          id: Date.now() + 1000,
          description: "Shipping & Handling",
          amount: transaction.metadata.shipping,
          category: "Shipping",
          envelopeId: "",
          isOriginalItem: false,
        });
      }

      if (transaction.metadata.tax > 0) {
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
 * @param {Transaction} transaction - Original transaction
 * @param {SplitAllocation[]} [splitAllocations=[]] - Current split allocations
 * @returns {SplitTotals} Calculation results
 */
export const calculateSplitTotals = (transaction, splitAllocations = []) => {
  try {
    if (
      !transaction ||
      transaction.amount === null ||
      transaction.amount === undefined
    ) {
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
    const allocated = splitAllocations.reduce(
      (sum, split) => sum + (parseFloat(split.amount) || 0),
      0,
    );
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
      error: error.message,
    };
  }
};

/**
 * Validate split allocations
 * @param {SplitAllocation[]} [splitAllocations=[]] - Split allocations to validate
 * @param {Transaction} transaction - Original transaction
 * @returns {string[]} Array of error messages
 */
export const validateSplitAllocations = (
  splitAllocations = [],
  transaction,
) => {
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
          `Total splits ($${totals.allocated.toFixed(2)}) exceed original amount ($${totals.original.toFixed(2)})`,
        );
      } else {
        errors.push(
          `Total splits ($${totals.allocated.toFixed(2)}) are less than original amount ($${totals.original.toFixed(2)})`,
        );
      }
    }
  } catch (error) {
    logger.error("Error validating split allocations", error);
    errors.push("Validation error: " + error.message);
  }

  return errors;
};

/**
 * Auto-balance splits to equal the total transaction amount
 * @param {SplitAllocation[]} [splitAllocations=[]] - Current split allocations
 * @param {Transaction} transaction - Original transaction
 * @returns {SplitAllocation[]} Balanced split allocations
 */
export const autoBalanceSplits = (splitAllocations = [], transaction) => {
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

    // Apply adjustments, rounding each split to 2 decimal places
    const balanced = splitAllocations.map((split) => ({
      ...split,
      amount: parseFloat((split.amount + adjustmentPerSplit).toFixed(2)),
    }));

    // Adjust the last split to absorb any remaining rounding differences
    const balancedTotal = balanced.reduce((sum, split) => sum + split.amount, 0);
    const finalRounding = Math.abs(transaction.amount) - balancedTotal;
    
    if (Math.abs(finalRounding) > 0.001 && balanced.length > 0) {
      balanced[balanced.length - 1] = {
        ...balanced[balanced.length - 1],
        amount: parseFloat((balanced[balanced.length - 1].amount + finalRounding).toFixed(2)),
      };
    }

    return balanced;
  } catch (error) {
    logger.error("Error auto-balancing splits", error);
    return splitAllocations;
  }
};

/**
 * Split transaction amount evenly across all allocations
 * @param {SplitAllocation[]} [splitAllocations=[]] - Current split allocations
 * @param {Transaction} transaction - Original transaction
 * @returns {SplitAllocation[]} Evenly split allocations
 */
export const splitEvenly = (splitAllocations = [], transaction) => {
  try {
    if (splitAllocations.length === 0) return splitAllocations;

    const originalAmount = Math.abs(transaction.amount);
    const amountPerSplit =
      Math.round((originalAmount / splitAllocations.length) * 100) / 100;

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
          ? Math.round(
              (originalAmount -
                amountPerSplit * (splitAllocations.length - 1)) *
                100,
            ) / 100
          : amountPerSplit,
    }));
  } catch (error) {
    logger.error("Error splitting evenly", error);
    return splitAllocations;
  }
};

/**
 * Add a new split allocation with remaining amount
 * @param {SplitAllocation[]} [currentSplits=[]] - Current split allocations
 * @param {Transaction} transaction - Original transaction
 * @param {Partial<SplitAllocation>} [defaults={}] - Default values for new split
 * @returns {SplitAllocation[]} Updated split allocations with new split added
 */
export const addNewSplit = (currentSplits = [], transaction, defaults = {}) => {
  try {
    const totalAmount = Math.abs(transaction.amount);
    const allocated = currentSplits.reduce(
      (sum, split) => sum + (parseFloat(split.amount) || 0),
      0,
    );
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
 * @param {SplitAllocation[]} [currentSplits=[]] - Current split allocations
 * @param {string|number} splitId - ID of split to update
 * @param {string} field - Field to update
 * @param {any} value - New value
 * @param {Envelope[]} [envelopes=[]] - Available envelopes (for category matching)
 * @returns {SplitAllocation[]} Updated split allocations
 */
export const updateSplitField = (
  currentSplits = [],
  splitId,
  field,
  value,
  envelopes = [],
) => {
  try {
    return currentSplits.map((split) => {
      if (split.id === splitId) {
        const updated = { ...split, [field]: value };

        // If category changes, try to find matching envelope
        if (field === "category") {
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
 * @param {SplitAllocation[]} [currentSplits=[]] - Current split allocations
 * @param {string|number} splitId - ID of split to remove
 * @returns {SplitAllocation[]} Updated split allocations with split removed
 */
export const removeSplit = (currentSplits = [], splitId) => {
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
 * @param {SplitAllocation[]} [splitAllocations=[]] - Validated split allocations
 * @param {Transaction} originalTransaction - Original transaction being split
 * @returns {Transaction[]} Prepared transactions for submission
 */
export const prepareSplitTransactions = (
  splitAllocations = [],
  originalTransaction,
) => {
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
 * @param {SplitAllocation[]} [splitAllocations=[]] - Split allocations
 * @param {Transaction} transaction - Original transaction
 * @returns {SplitSummary} Summary information
 */
export const getSplitSummary = (splitAllocations = [], transaction) => {
  try {
    const totals = calculateSplitTotals(transaction, splitAllocations);
    const validationErrors = validateSplitAllocations(
      splitAllocations,
      transaction,
    );

    return {
      totalSplits: splitAllocations.length,
      originalAmount: totals.original,
      allocatedAmount: totals.allocated,
      remainingAmount: totals.remaining,
      isValid: validationErrors.length === 0 && totals.isValid,
      isBalanced: totals.isValid,
      validationErrors,
      canSubmit:
        validationErrors.length === 0 &&
        totals.isValid &&
        splitAllocations.length > 0,
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
      validationErrors: ["Error calculating summary: " + error.message],
      canSubmit: false,
    };
  }
};
