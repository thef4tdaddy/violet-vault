/**
 * Bill update utility functions
 * Extracted from useBillOperations.js to reduce complexity
 * Phase 2 Migration: Compatible with Transaction-based bills via flexible field handling
 */
import logger from "@/utils/common/logger";
import type { Bill } from "@/types/bills";

// Type definitions for update functions
interface UpdateFunctions {
  updateBill: (params: { id: string; updates: Record<string, unknown> }) => Promise<void>;
  onUpdateBill?: (bill: Bill) => void | Promise<void>;
  budget?: {
    updateBill?: (bill: Bill) => void | Promise<void>;
  };
}

// Type definitions for bulk operation
interface BulkOperationItem {
  id: string;
  provider?: string;
  description?: string;
  name?: string;
  [key: string]: unknown;
}

interface BulkOperationResult {
  success: boolean;
  successCount: number;
  errorCount: number;
  errors: string[];
  message: string;
}

// Type definitions for bill changes
export interface BillChange {
  amount?: number;
  originalAmount?: number;
  dueDate?: string;
  originalDueDate?: string;
}

interface BillChanges {
  [billId: string]: BillChange;
}

interface UpdateSummary {
  changedBills: number;
  totalBills: number;
  totalAmountChange: number;
  hasChanges: boolean;
}

interface ModificationHistoryEntry {
  timestamp: string;
  changes: {
    amount?: { from: number; to: number };
    dueDate?: { from: string; to: string };
  };
  source: string;
}

interface AmountChange {
  original: string;
  updated: string;
  difference: string;
  differenceFormatted: string;
  isIncrease: boolean;
  isDecrease: boolean;
  hasChange: boolean;
}

interface DateChange {
  original: string;
  updated: string;
  hasChange: boolean;
}

// Extended Bill interface to include modification history
type BillWithHistory = Bill & {
  modificationHistory?: ModificationHistoryEntry[];
  lastModified?: number;
};

/**
 * Execute bill update with fallback to Zustand store
 */
export const executeBillUpdate = async (
  bill: Bill,
  updateFunctions: UpdateFunctions
): Promise<void> => {
  const { updateBill, onUpdateBill, budget } = updateFunctions;

  if (onUpdateBill) {
    await onUpdateBill(bill);
    return;
  }

  // Use TanStack mutation with Zustand fallback
  try {
    const updates: Record<string, unknown> = { ...bill };
    await updateBill({
      id: bill.id,
      updates,
    });
  } catch (error) {
    const errorInfo = error instanceof Error ? { message: error.message } : { error };
    logger.warn("TanStack updateBill failed, using Zustand fallback", errorInfo);
    if (budget?.updateBill) {
      budget.updateBill(bill);
    }
  }
};

/**
 * Process bulk operation with error tracking
 */
export const processBulkOperation = async <T extends { id: string } | string>(
  items: T[],
  operationName: string,
  operationFn: (item: T) => Promise<void>
): Promise<BulkOperationResult> => {
  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  for (const item of items) {
    try {
      await operationFn(item);
      successCount++;
    } catch (error) {
      errorCount++;
      let itemName = "";
      let itemId = "";

      if (typeof item === "string") {
        itemId = item;
        itemName = `Item ${item}`;
      } else {
        itemId = item.id;
        const bulkItem = item as BulkOperationItem;
        itemName = bulkItem.provider || bulkItem.description || bulkItem.name || `Item ${itemId}`;
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(`${itemName}: ${errorMessage}`);
      const errorObj = error instanceof Error ? error : new Error(String(error));
      logger.error(`Failed ${operationName}`, errorObj, {
        itemId,
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
export const calculateUpdateSummary = (
  selectedBills: Bill[],
  changes: BillChanges
): UpdateSummary => {
  const changedBills = selectedBills.filter((bill) => {
    const change = changes[bill.id];
    return (
      change &&
      (change.amount !== change.originalAmount || change.dueDate !== change.originalDueDate)
    );
  });

  const totalAmountChange = changedBills.reduce((sum: number, bill: Bill) => {
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
export const hasChanges = (change?: BillChange): boolean => {
  if (!change) return false;
  return change.amount !== change.originalAmount || change.dueDate !== change.originalDueDate;
};

/**
 * Create modification history entry
 */
export const createModificationHistoryEntry = (change: BillChange): ModificationHistoryEntry => {
  return {
    timestamp: new Date().toISOString(),
    changes: {
      ...(change.amount !== change.originalAmount && {
        amount: { from: change.originalAmount || 0, to: change.amount || 0 },
      }),
      ...(change.dueDate !== change.originalDueDate && {
        dueDate: { from: change.originalDueDate || "", to: change.dueDate || "" },
      }),
    },
    source: "bulk_update",
  };
};

/**
 * Transform bills for update based on changes
 * Phase 2 Migration: Updates both dueDate and date fields for Transaction compatibility
 */
export const transformBillsForUpdate = (selectedBills: Bill[], changes: BillChanges): Bill[] => {
  return selectedBills
    .map((bill: Bill): Bill | null => {
      const change = changes[bill.id];
      if (!change || !hasChanges(change)) return null;

      const existingHistory = Array.isArray((bill as BillWithHistory).modificationHistory)
        ? (bill as BillWithHistory).modificationHistory!
        : [];

      const billWithHistory: BillWithHistory = {
        ...bill,
        amount: Math.abs(change.amount || 0), // Ensure positive amount
        dueDate: change.dueDate || bill.dueDate, // Legacy field
        // Normalize date field - handle both string and Date types safely
        date:
          change.dueDate ||
          (typeof bill.date === "string"
            ? bill.date
            : bill.date instanceof Date
              ? bill.date.toISOString().split("T")[0]
              : bill.dueDate) ||
          "",
        lastModified: Date.now(),
        modificationHistory: [...existingHistory, createModificationHistoryEntry(change)],
      };

      return billWithHistory;
    })
    .filter((item): item is Bill => item !== null); // Type guard to filter nulls
};

/**
 * Format amount change for display
 */
export const formatAmountChange = (
  originalAmount: number | undefined,
  newAmount: number | undefined
): AmountChange => {
  const original = Math.abs(originalAmount ?? 0);
  const updated = Math.abs(newAmount ?? 0);
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
export const formatDateChange = (
  originalDate: string | undefined,
  newDate: string | undefined
): DateChange | null => {
  if (!originalDate || !newDate) return null;

  const original = new Date(originalDate).toLocaleDateString();
  const updated = new Date(newDate).toLocaleDateString();

  return {
    original,
    updated,
    hasChange: originalDate !== newDate,
  };
};
