/**
 * Utility functions for bulk bill update operations
 * Handles calculations, validations, and data transformations
 */

/**
 * Calculate summary of changes for bulk bill updates
 */
export const calculateUpdateSummary = (selectedBills, changes) => {
  const changedBills = selectedBills.filter((bill) => {
    const change = changes[bill.id];
    return (
      change &&
      (change.amount !== change.originalAmount || change.dueDate !== change.originalDueDate)
    );
  });

  const totalAmountChange = changedBills.reduce((sum, bill) => {
    const change = changes[bill.id];
    return sum + (Math.abs(change?.amount || 0) - Math.abs(change?.originalAmount || 0));
  }, 0);

  return {
    changedBills: changedBills.length,
    totalBills: selectedBills.length,
    totalAmountChange,
    hasChanges: changedBills.length > 0,
  };
};

/**
 * Validate individual bill change
 */
export const validateBillChange = (originalBill, change) => {
  const errors = [];

  if (!change) {
    errors.push("Change object is required");
    return { isValid: false, errors };
  }

  // Validate amount
  if (change.amount !== undefined && (isNaN(change.amount) || change.amount < 0)) {
    errors.push("Amount must be a positive number");
  }

  // Validate due date format
  if (change.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(change.dueDate)) {
    errors.push("Due date must be in YYYY-MM-DD format");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Check if a bill has any changes
 */
export const hasChanges = (change) => {
  if (!change) return false;
  return (
    change.amount !== change.originalAmount || 
    change.dueDate !== change.originalDueDate
  );
};

/**
 * Format amount change for display
 */
export const formatAmountChange = (originalAmount, newAmount) => {
  const original = Math.abs(originalAmount || 0);
  const updated = Math.abs(newAmount || 0);
  const difference = updated - original;
  
  return {
    original: original.toFixed(2),
    updated: updated.toFixed(2),
    difference: difference.toFixed(2),
    differenceFormatted: `${difference >= 0 ? '+' : ''}$${difference.toFixed(2)}`,
    hasChange: original !== updated,
  };
};

/**
 * Format date change for display
 */
export const formatDateChange = (originalDate, newDate) => {
  const original = originalDate || "Not set";
  const updated = newDate || "Not set";
  
  return {
    original,
    updated,
    hasChange: originalDate !== newDate,
  };
};

/**
 * Create modification history entry for bulk update
 */
export const createModificationHistoryEntry = (change) => ({
  timestamp: new Date().toISOString(),
  type: "bulk_update",
  changes: {
    ...(change.amount !== change.originalAmount && {
      amount: { from: change.originalAmount, to: change.amount },
    }),
    ...(change.dueDate !== change.originalDueDate && {
      dueDate: {
        from: change.originalDueDate,
        to: change.dueDate,
      },
    }),
  },
});

/**
 * Transform bills with changes for update
 */
export const transformBillsForUpdate = (selectedBills, changes) => {
  return selectedBills
    .map((bill) => {
      const change = changes[bill.id];
      if (!change || !hasChanges(change)) return null;

      return {
        ...bill,
        amount: Math.abs(change.amount), // Ensure positive amount
        dueDate: change.dueDate || null,
        lastModified: new Date().toISOString(),
        modificationHistory: [
          ...(bill.modificationHistory || []),
          createModificationHistoryEntry(change),
        ],
      };
    })
    .filter(Boolean); // Remove null entries
};

/**
 * Validate all changes before submission
 */
export const validateAllChanges = (selectedBills, changes) => {
  const errors = [];
  
  selectedBills.forEach((bill) => {
    const change = changes[bill.id];
    if (change && hasChanges(change)) {
      const validation = validateBillChange(bill, change);
      if (!validation.isValid) {
        errors.push({
          billId: bill.id,
          billName: bill.provider || bill.description,
          errors: validation.errors,
        });
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};