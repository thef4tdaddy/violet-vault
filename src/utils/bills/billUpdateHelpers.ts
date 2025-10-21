/**
 * Bill update utility functions
 * Extracted from useBillOperations.js to reduce complexity
 */
import logger from "../common/logger";

/**
 * Execute bill update with fallback to Zustand store
 */
export const executeBillUpdate = async (bill, updateFunctions) => {
  const { updateBill, onUpdateBill, budget } = updateFunctions;

  if (onUpdateBill) {
    await onUpdateBill(bill);
    return;
  }

  // Use TanStack mutation with Zustand fallback
  try {
    await updateBill({
      id: bill.id,
      updates: bill,
    });
  } catch (error) {
    logger.warn("TanStack updateBill failed, using Zustand fallback", error);
    budget?.updateBill(bill);
  }
};

/**
 * Process bulk operation with error tracking
 */
export const processBulkOperation = async (items, operationName, operationFn) => {
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const item of items) {
    try {
      await operationFn(item);
      successCount++;
    } catch (error) {
      errorCount++;
      const itemName = item.provider || item.description || `Item ${item.id}`;
      errors.push(`${itemName}: ${error.message}`);
      logger.error(`Failed ${operationName}`, error, {
        itemId: item.id,
      });
    }
  }

  return {
    success: successCount > 0,
    successCount,
    errorCount,
    errors,
    message:
      errorCount > 0
        ? `${successCount} items processed successfully, ${errorCount} failed:\n${errors.join("\n")}`
        : `Successfully processed ${successCount} items`,
  };
};

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
 * Check if a change object has any modifications
 */
export const hasChanges = (change) => {
  if (!change) return false;
  return change.amount !== change.originalAmount || change.dueDate !== change.originalDueDate;
};

/**
 * Create modification history entry
 */
export const createModificationHistoryEntry = (change) => {
  return {
    timestamp: new Date().toISOString(),
    changes: {
      ...(change.amount !== change.originalAmount && {
        amount: { from: change.originalAmount, to: change.amount },
      }),
      ...(change.dueDate !== change.originalDueDate && {
        dueDate: { from: change.originalDueDate, to: change.dueDate },
      }),
    },
    source: "bulk_update",
  };
};

/**
 * Transform bills for update based on changes
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
    differenceFormatted: `${difference >= 0 ? "+" : ""}$${difference.toFixed(2)}`,
    isIncrease: difference > 0,
    isDecrease: difference < 0,
    hasChange: difference !== 0,
  };
};

/**
 * Format date change for display
 */
export const formatDateChange = (originalDate, newDate) => {
  if (!originalDate || !newDate) return null;

  const original = new Date(originalDate).toLocaleDateString();
  const updated = new Date(newDate).toLocaleDateString();

  return {
    original,
    updated,
    hasChange: originalDate !== newDate,
  };
};
