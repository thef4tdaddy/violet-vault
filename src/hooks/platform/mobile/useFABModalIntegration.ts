import { useCallback } from "react";
import { useModalManager } from "@/hooks/common/useModalManager";

/**
 * Hook that provides FAB action handlers that open slide-up modals
 * Connects FAB actions to the modal system for Phase 4 integration
 */
export const useFABModalIntegration = () => {
  const { openModal, closeModal } = useModalManager();

  // Dashboard FAB actions
  const handlePaycheckProcessor = useCallback(() => {
    openModal("paycheck-processor");
  }, [openModal]);

  const handleQuickTransaction = useCallback(() => {
    openModal("quick-transaction");
  }, [openModal]);

  // Envelopes FAB actions
  const handleCreateEnvelope = useCallback(() => {
    openModal("create-envelope");
  }, [openModal]);

  // Bills FAB actions
  const handleAddBill = useCallback(() => {
    openModal("add-bill");
  }, [openModal]);

  const handleBillDiscovery = useCallback(() => {
    openModal("bill-discovery");
  }, [openModal]);

  // Savings FAB actions
  const handleAddSavingsGoal = useCallback(() => {
    openModal("add-savings-goal");
  }, [openModal]);

  const handleDistributeSavings = useCallback(() => {
    openModal("distribute-savings");
  }, [openModal]);

  // Transactions FAB actions
  const handleTransactionImport = useCallback(() => {
    openModal("transaction-import");
  }, [openModal]);

  const handleReceiptScan = useCallback(() => {
    openModal("receipt-scan");
  }, [openModal]);

  // Debt FAB actions
  const handleAddDebt = useCallback(() => {
    openModal("add-debt");
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
