import { useState } from "react";
import { useConfirm } from "@/hooks/platform/ux/useConfirm";
import { globalToast } from "@/stores/ui/toastStore";
import logger from "@/utils/common/logger";

import type { PaycheckHistory } from "@/db/types";

interface UsePaycheckHistoryProps {
  onDeletePaycheck?: (id: string | number) => Promise<void>;
}

/**
 * Custom hook for paycheck history management
 * Handles history operations and delete functionality
 */
export const usePaycheckHistory = ({ onDeletePaycheck }: UsePaycheckHistoryProps) => {
  const [deletingPaycheckId, setDeletingPaycheckId] = useState<string | number | null>(null);
  const confirm = useConfirm();

  const handleDeletePaycheck = async (paycheck: PaycheckHistory) => {
    if (!onDeletePaycheck) return;

    const isConfirmed = await confirm({
      title: "Delete Paycheck",
      message: `Are you sure you want to delete the paycheck from ${paycheck.payerName} for $${paycheck.amount.toFixed(2)}? This will reverse all related transactions and cannot be undone.`,
      destructive: true,
    });

    if (!isConfirmed) return;

    setDeletingPaycheckId(paycheck.id);

    try {
      await onDeletePaycheck(paycheck.id);
      logger.debug("Paycheck deleted:", { paycheckId: paycheck.id });
      globalToast.showSuccess("Paycheck deleted successfully");
    } catch (error) {
      logger.error("Failed to delete paycheck:", error);
      globalToast.showError("Failed to delete paycheck. Please try again.");
    } finally {
      setDeletingPaycheckId(null);
    }
  };

  return {
    deletingPaycheckId,
    handleDeletePaycheck,
  };
};
