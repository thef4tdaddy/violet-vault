import { useState } from "react";

/**
 * Hook for managing bulk bill update operations
 * Handles change tracking, validation, and state management for bulk operations
 */
export const useBulkBillUpdate = (selectedBills = [], isOpen) => {
  const [changes, setChanges] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Initialize changes when modal opens
  const initializeChanges = () => {
    const initialChanges = {};
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
  const updateChange = (billId, field, value) => {
    setChanges((prev) => ({
      ...prev,
      [billId]: {
        ...prev[billId],
        [field]: value,
      },
    }));
  };

  // Apply bulk change to all selected bills
  const applyBulkChange = (field, value) => {
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
    const resetChanges = {};
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
