/**
 * Utility functions for transaction splitter operations
 * Handles calculations, validations, and data transformations
 */
import type { SplitAllocation, SplitTotals } from "@/types/finance";

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number): string => {
  if (amount == null || isNaN(amount)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2, // Always show 2 decimal places (e.g., $123.40 not $123.4)
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
};

/**
 * Calculate split totals and validation status
 */
export const calculateSplitTotals = (
  originalAmount: number,
  splitAllocations: SplitAllocation[]
): SplitTotals => {
  const original = Math.abs(originalAmount);
  const allocated = splitAllocations.reduce((sum, split) => sum + Math.abs(split.amount || 0), 0);
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
 */
export const validateSplitAllocation = (
  split: SplitAllocation
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

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
 */
export const validateAllSplits = (
  splitAllocations: SplitAllocation[]
): {
  isValid: boolean;
  errors: Array<{ index: number; splitId: string | number; errors: string[] }>;
} => {
  const allErrors: Array<{ index: number; splitId: string | number; errors: string[] }> = [];
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
 */
export const generateSplitId = (): string => {
  return `split_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create new split allocation with defaults
 */
export const createNewSplitAllocation = (
  defaultCategory = "",
  defaultAmount = 0
): SplitAllocation => ({
  id: generateSplitId(),
  description: "",
  amount: defaultAmount,
  category: defaultCategory,
  envelopeId: "",
});

/**
 * Smart split algorithm - distribute amount evenly with intelligent defaults
 */
export const performSmartSplit = (
  originalAmount: number,
  numSplits = 2,
  availableCategories: string[] = []
): SplitAllocation[] => {
  const amountPerSplit = Math.abs(originalAmount) / numSplits;
  const splits: SplitAllocation[] = [];

  for (let i = 0; i < numSplits; i++) {
    splits.push({
      id: generateSplitId(),
      description: `Split ${i + 1}`,
      amount: amountPerSplit,
      category: availableCategories[i] || "",
      envelopeId: "", // Empty string represents unassigned
    });
  }

  return splits;
};

/**
 * Auto-balance remaining amount to last split
 */
export const autoBalanceToLastSplit = (
  splitAllocations: SplitAllocation[],
  originalAmount: number
): SplitAllocation[] => {
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
 */
export const hasUnsavedChanges = (
  currentSplits: SplitAllocation[],
  originalSplits: SplitAllocation[]
): boolean => {
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
 */
export const prepareSplitsForSave = (
  splitAllocations: SplitAllocation[],
  originalTransactionId: string | number
): Array<{
  id: string | number;
  originalTransactionId: string | number;
  description: string;
  amount: number;
  category: string;
  envelopeId: string | number | null;
  createdAt: string;
}> => {
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
 */
export const calculateSplitStatistics = (
  splitAllocations: SplitAllocation[]
): {
  totalAmount: number;
  splitCount: number;
  categoryCount: number;
  envelopeCount: number;
  averageAmount: number;
} => {
  const total = splitAllocations.reduce((sum, split) => sum + Math.abs(split.amount || 0), 0);
  const categories = [...new Set(splitAllocations.map((s) => s.category).filter(Boolean))];
  const withEnvelopes = splitAllocations.filter((s) => s.envelopeId).length;

  return {
    totalAmount: total,
    splitCount: splitAllocations.length,
    categoryCount: categories.length,
    envelopeCount: withEnvelopes,
    averageAmount: splitAllocations.length > 0 ? total / splitAllocations.length : 0,
  };
};
