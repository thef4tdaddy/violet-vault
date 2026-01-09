import { useState, useCallback } from "react";
import type { TransactionFormState } from "./types";

/**
 * Hook for managing Main Dashboard UI state
 * Extracts UI state management from MainDashboard component
 */
export const useDashboardUI = () => {
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState<TransactionFormState>({
    amount: "",
    description: "",
    type: "expense", // 'expense' or 'income'
    envelopeId: "",
    date: new Date().toISOString().split("T")[0],
  });

  const openReconcileModal = useCallback(() => {
    setShowReconcileModal(true);
  }, []);

  const closeReconcileModal = useCallback(() => {
    setShowReconcileModal(false);
  }, []);

  const updateNewTransaction = useCallback((updates: Partial<TransactionFormState>) => {
    setNewTransaction((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetNewTransaction = useCallback(() => {
    setNewTransaction({
      amount: "",
      description: "",
      type: "expense",
      envelopeId: "",
      date: new Date().toISOString().split("T")[0],
    });
  }, []);

  return {
    // State
    showReconcileModal,
    newTransaction,

    // Actions
    openReconcileModal,
    closeReconcileModal,
    updateNewTransaction,
    resetNewTransaction,
  };
};
