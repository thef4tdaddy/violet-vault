import { useState } from "react";
import type { Bill } from "@/db/types";

// Type for bill changes tracking
interface BillChange {
  amount: number;
  dueDate: string;
  originalAmount: number;
  originalDueDate: string;
}

// Type for changes object
type BillChanges = Record<string, BillChange>;

// Type for bill field names
type BillField = "amount" | "dueDate";

/**
 * Hook for managing bulk bill update operations
 * Handles change tracking, validation, and state management for bulk operations
 */
export const useBulkBillUpdate = (selectedBills: Bill[] = [], _isOpen: boolean = false) => {
  const [changes, setChanges] = useState<BillChanges>({});
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  // Initialize changes when modal opens
  const initializeChanges = (): void => {
    const initialChanges: BillChanges = {};
    selectedBills.forEach((bill) => {
      initialChanges[bill.id] = {
        amount: bill.amount || 0,
        dueDate:
          typeof bill.dueDate === "string"
            ? bill.dueDate
            : bill.dueDate instanceof Date
              ? bill.dueDate.toISOString().split("T")[0]
              : "",
        originalAmount: bill.amount || 0,
        originalDueDate:
          typeof bill.dueDate === "string"
            ? bill.dueDate
            : bill.dueDate instanceof Date
              ? bill.dueDate.toISOString().split("T")[0]
              : "",
      };
    });
    setChanges(initialChanges);
    setShowConfirmation(false);
  };

  // Update individual bill change
  const updateChange = (billId: string, field: BillField, value: string | number): void => {
    const normalizedValue = field === "amount" ? Number(value) : String(value);
    setChanges((prev) => ({
      ...prev,
      [billId]: {
        ...(prev[billId] || {
          amount: 0,
          dueDate: "",
          originalAmount: 0,
          originalDueDate: "",
        }),
        [field]: normalizedValue,
      },
    }));
  };

  // Apply bulk change to all selected bills
  const applyBulkChange = (field: BillField, value: string | number): void => {
    const newChanges = { ...changes };
    const normalizedValue = field === "amount" ? Number(value) : String(value);
    selectedBills.forEach((bill) => {
      if (newChanges[bill.id]) {
        newChanges[bill.id] = {
          ...newChanges[bill.id],
          [field]: normalizedValue,
        };
      }
    });
    setChanges(newChanges);
  };

  // Reset all changes to original values
  const resetChanges = (): void => {
    const resetChanges: BillChanges = {};
    selectedBills.forEach((bill) => {
      resetChanges[bill.id] = {
        amount: bill.amount || 0,
        dueDate:
          typeof bill.dueDate === "string"
            ? bill.dueDate
            : bill.dueDate instanceof Date
              ? bill.dueDate.toISOString().split("T")[0]
              : "",
        originalAmount: bill.amount || 0,
        originalDueDate:
          typeof bill.dueDate === "string"
            ? bill.dueDate
            : bill.dueDate instanceof Date
              ? bill.dueDate.toISOString().split("T")[0]
              : "",
      };
    });
    setChanges(resetChanges);
  };

  return {
    changes,
    showConfirmation,
    setShowConfirmation,
    initializeChanges,
    updateChange,
    applyBulkChange,
    resetChanges,
  };
};

export default useBulkBillUpdate;
