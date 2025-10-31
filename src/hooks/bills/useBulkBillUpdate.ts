import { useState } from "react";
import type { Bill as DBBill } from "@/db/types";

// Extended Bill type to match runtime data
interface Bill extends Omit<DBBill, "dueDate"> {
  dueDate: Date | string;
}

interface BillChange {
  amount: number;
  dueDate: Date | string;
  originalAmount: number;
  originalDueDate: Date | string;
}

/**
 * Hook for managing bulk bill update operations
 * Handles change tracking, validation, and state management for bulk operations
 */
export const useBulkBillUpdate = (selectedBills: Bill[] = [], _isOpen: boolean) => {
  const [changes, setChanges] = useState<Record<string, BillChange>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Initialize changes when modal opens
  const initializeChanges = () => {
    const initialChanges: Record<string, BillChange> = {};
    selectedBills.forEach((bill) => {
      initialChanges[bill.id] = {
        amount: bill.amount,
        dueDate: bill.dueDate || "",
        originalAmount: bill.amount,
        originalDueDate: bill.dueDate || "",
      };
    });
    setChanges(initialChanges);
    setShowConfirmation(false);
  };

  // Update individual bill change
  const updateChange = <K extends keyof BillChange>(
    billId: string,
    field: K,
    value: BillChange[K]
  ) => {
    setChanges((prev) => ({
      ...prev,
      [billId]: {
        ...prev[billId],
        [field]: value,
      },
    }));
  };

  // Apply bulk change to all selected bills
  const applyBulkChange = <K extends keyof BillChange>(field: K, value: BillChange[K]) => {
    const newChanges = { ...changes };
    selectedBills.forEach((bill) => {
      if (newChanges[bill.id]) {
        newChanges[bill.id][field] = value;
      }
    });
    setChanges(newChanges);
  };

  // Reset all changes to original values
  const resetChanges = () => {
    const resetChanges: Record<string, BillChange> = {};
    selectedBills.forEach((bill) => {
      resetChanges[bill.id] = {
        amount: bill.amount,
        dueDate: bill.dueDate || "",
        originalAmount: bill.amount,
        originalDueDate: bill.dueDate || "",
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
