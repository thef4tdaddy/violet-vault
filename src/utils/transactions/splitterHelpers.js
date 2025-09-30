/**
 * Utility functions for transaction splitter operations
 * Handles calculations, validations, and data transformations
 */

/**
 * @typedef {Object} SplitAllocation
 * @property {string|number} id - Unique split identifier
 * @property {string} description - Split description
 * @property {number} amount - Split amount
 * @property {string} category - Split category
 * @property {string|null} envelopeId - Associated envelope ID
 */

/**
 * @typedef {Object} SplitTotals
 * @property {number} original - Original transaction amount
 * @property {number} allocated - Total allocated amount across splits
 * @property {number} remaining - Remaining unallocated amount
 * @property {boolean} isValid - Whether the split is valid (fully allocated)
 * @property {boolean} isOverAllocated - Whether splits exceed original amount
 * @property {boolean} isUnderAllocated - Whether splits are less than original amount
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether validation passed
 * @property {string[]} errors - Array of error messages
 */

/**
 * @typedef {Object} AllSplitsValidationResult
 * @property {boolean} isValid - Whether all splits are valid
 * @property {Array<{index: number, splitId: string|number, errors: string[]}>} errors - Array of split errors
 */

/**
 * @typedef {Object} SplitStatistics
 * @property {number} totalAmount - Total amount across all splits
 * @property {number} splitCount - Number of splits
 * @property {number} categoryCount - Number of unique categories
 * @property {number} envelopeCount - Number of splits with envelopes
 * @property {number} averageAmount - Average amount per split
 */

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (amount == null || isNaN(amount)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Math.abs(amount));
};

/**
 * Calculate split totals and validation status
 * @param {number} originalAmount - Original transaction amount
 * @param {SplitAllocation[]} splitAllocations - Array of split allocations
 * @returns {SplitTotals} Calculation results
 */
export const calculateSplitTotals = (originalAmount, splitAllocations) => {
  const original = Math.abs(originalAmount);
  const allocated = splitAllocations.reduce(
    (sum, split) => sum + Math.abs(split.amount || 0),
    0,
  );
  const remaining = original - allocated;

  const isValid = Math.abs(remaining) < 0.01; // Allow for floating point precision
  const isOverAllocated = remaining < -0.01;
  const isUnderAllocated = remaining > 0.01;

  return {
    original,
    allocated,
    remaining,
    isValid,
    isOverAllocated,
    isUnderAllocated,
  };
};

/**
 * Validate individual split allocation
 * @param {SplitAllocation} split - Split allocation to validate
 * @returns {ValidationResult} Validation result
 */
export const validateSplitAllocation = (split) => {
  const errors = [];

  if (!split.description || split.description.trim() === "") {
    errors.push("Description is required");
  }

  if (!split.amount || split.amount <= 0) {
    errors.push("Amount must be greater than 0");
  }

  if (!split.category || split.category.trim() === "") {
    errors.push("Category is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate all split allocations
 * @param {SplitAllocation[]} splitAllocations - Array of splits to validate
 * @returns {AllSplitsValidationResult} Validation results for all splits
 */
export const validateAllSplits = (splitAllocations) => {
  const allErrors = [];
  let hasValidationErrors = false;

  splitAllocations.forEach((split, index) => {
    const validation = validateSplitAllocation(split);
    if (!validation.isValid) {
      hasValidationErrors = true;
      allErrors.push({
        index,
        splitId: split.id,
        errors: validation.errors,
      });
    }
  });

  return {
    isValid: !hasValidationErrors,
    errors: allErrors,
  };
};

/**
 * Generate unique split ID
 * @returns {string} Unique split identifier
 */
export const generateSplitId = () => {
  return `split_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create new split allocation with defaults
 * @param {string} [defaultCategory=''] - Default category
 * @param {number} [defaultAmount=0] - Default amount
 * @returns {SplitAllocation} New split allocation
 */
export const createNewSplitAllocation = (
  defaultCategory = "",
  defaultAmount = 0,
) => ({
  id: generateSplitId(),
  description: "",
  amount: defaultAmount,
  category: defaultCategory,
  envelopeId: null,
});

/**
 * Smart split algorithm - distribute amount evenly with intelligent defaults
 * @param {number} originalAmount - Original transaction amount
 * @param {number} [numSplits=2] - Number of splits to create
 * @param {string[]} [availableCategories=[]] - Available categories for assignment
 * @returns {SplitAllocation[]} Array of split allocations
 */
export const performSmartSplit = (
  originalAmount,
  numSplits = 2,
  availableCategories = [],
) => {
  const amountPerSplit = Math.abs(originalAmount) / numSplits;
  const splits = [];

  for (let i = 0; i < numSplits; i++) {
    splits.push({
      id: generateSplitId(),
      description: `Split ${i + 1}`,
      amount: amountPerSplit,
      category: availableCategories[i] || "",
      envelopeId: null,
    });
  }

  return splits;
};

/**
 * Auto-balance remaining amount to last split
 * @param {SplitAllocation[]} splitAllocations - Current split allocations
 * @param {number} originalAmount - Original transaction amount
 * @returns {SplitAllocation[]} Balanced split allocations
 */
export const autoBalanceToLastSplit = (splitAllocations, originalAmount) => {
  if (splitAllocations.length === 0) return splitAllocations;

  const totals = calculateSplitTotals(originalAmount, splitAllocations);
  if (totals.isValid) return splitAllocations;

  const updatedSplits = [...splitAllocations];
  const lastSplitIndex = updatedSplits.length - 1;
  const lastSplit = { ...updatedSplits[lastSplitIndex] };

  // Adjust the last split by the remaining amount
  lastSplit.amount += totals.remaining;

  // Ensure amount doesn't go negative
  if (lastSplit.amount < 0) {
    lastSplit.amount = 0;
  }

  updatedSplits[lastSplitIndex] = lastSplit;
  return updatedSplits;
};

/**
 * Check if splits have unsaved changes compared to original
 * @param {SplitAllocation[]} currentSplits - Current split allocations
 * @param {SplitAllocation[]} originalSplits - Original split allocations
 * @returns {boolean} True if there are unsaved changes
 */
export const hasUnsavedChanges = (currentSplits, originalSplits) => {
  if (currentSplits.length !== originalSplits.length) return true;

  return currentSplits.some((current, index) => {
    const original = originalSplits[index];
    return (
      current.description !== original.description ||
      Math.abs(current.amount - original.amount) > 0.01 ||
      current.category !== original.category ||
      current.envelopeId !== original.envelopeId
    );
  });
};

/**
 * Prepare splits for save - clean and validate data
 * @param {SplitAllocation[]} splitAllocations - Split allocations to prepare
 * @param {string} originalTransactionId - Original transaction ID
 * @returns {Array<Object>} Prepared split data for saving
 */
export const prepareSplitsForSave = (
  splitAllocations,
  originalTransactionId,
) => {
  return splitAllocations.map((split) => ({
    id: split.id,
    originalTransactionId,
    description: split.description.trim(),
    amount: Math.abs(split.amount),
    category: split.category,
    envelopeId: split.envelopeId || null,
    createdAt: new Date().toISOString(),
  }));
};

/**
 * Calculate split statistics for display
 * @param {SplitAllocation[]} splitAllocations - Split allocations to analyze
 * @returns {SplitStatistics} Statistics about the splits
 */
export const calculateSplitStatistics = (splitAllocations) => {
  const total = splitAllocations.reduce(
    (sum, split) => sum + Math.abs(split.amount || 0),
    0,
  );
  const categories = [
    ...new Set(splitAllocations.map((s) => s.category).filter(Boolean)),
  ];
  const withEnvelopes = splitAllocations.filter((s) => s.envelopeId).length;

  return {
    totalAmount: total,
    splitCount: splitAllocations.length,
    categoryCount: categories.length,
    envelopeCount: withEnvelopes,
    averageAmount:
      splitAllocations.length > 0 ? total / splitAllocations.length : 0,
  };
};
