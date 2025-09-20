import { useCallback } from "react";
import { useModalManager } from "../common/useModalManager";

/**
 * Hook that provides FAB action handlers that open slide-up modals
 * Connects FAB actions to the modal system for Phase 4 integration
 */
export const useFABModalIntegration = () => {
  const { openModal, closeModal } = useModalManager();

  // Dashboard FAB actions
  const handlePaycheckProcessor = useCallback(() => {
    openModal("paycheck-processor", { type: "slide-up", height: "three-quarters", title: "Add Paycheck" });
  }, [openModal]);

  const handleQuickTransaction = useCallback(() => {
    openModal("quick-transaction", { type: "slide-up", height: "three-quarters", title: "Add Transaction" });
  }, [openModal]);

  // Envelopes FAB actions
  const handleCreateEnvelope = useCallback(() => {
    openModal("create-envelope", { type: "slide-up", height: "three-quarters", title: "Create Envelope" });
  }, [openModal]);

  // Bills FAB actions
  const handleAddBill = useCallback(() => {
    openModal("add-bill", { type: "slide-up", height: "three-quarters", title: "Add Bill" });
  }, [openModal]);

  const handleBillDiscovery = useCallback(() => {
    openModal("bill-discovery", { type: "slide-up", height: "full", title: "Discover Bills" });
  }, [openModal]);

  // Savings FAB actions
  const handleAddSavingsGoal = useCallback(() => {
    openModal("add-savings-goal", { type: "slide-up", height: "three-quarters", title: "Add Savings Goal" });
  }, [openModal]);

  const handleDistributeSavings = useCallback(() => {
    openModal("distribute-savings", { type: "slide-up", height: "half", title: "Distribute Savings" });
  }, [openModal]);

  // Transactions FAB actions
  const handleTransactionImport = useCallback(() => {
    openModal("transaction-import", { type: "slide-up", height: "three-quarters", title: "Import Transactions" });
  }, [openModal]);

  const handleReceiptScan = useCallback(() => {
    openModal("receipt-scan", { type: "slide-up", height: "full", title: "Scan Receipt" });
  }, [openModal]);

  // Debt FAB actions
  const handleAddDebt = useCallback(() => {
    openModal("add-debt", { type: "slide-up", height: "three-quarters", title: "Add Debt" });
  }, [openModal]);

  return {
    // Dashboard actions
    handlePaycheckProcessor,
    handleQuickTransaction,

    // Envelope actions
    handleCreateEnvelope,

    // Bills actions
    handleAddBill,
    handleBillDiscovery,

    // Savings actions
    handleAddSavingsGoal,
    handleDistributeSavings,

    // Transaction actions
    handleTransactionImport,
    handleReceiptScan,

    // Debt actions
    handleAddDebt,

    // Utility
    closeModal,
  };
};