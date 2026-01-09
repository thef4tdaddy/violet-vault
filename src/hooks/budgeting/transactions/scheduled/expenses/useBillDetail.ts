import { useState, FormEvent } from "react";
import { useConfirm } from "@/hooks/platform/ux/useConfirm";
import logger from "@/utils/common/logger";
import type { Bill as BillFromTypes } from "@/types/bills";
import { useBillStatus } from "./useBillStatus";

interface PaymentData {
  billId: string;
  amount: number;
  paidDate: string;
  notes: string;
}

interface BillDetailParams {
  bill: BillFromTypes | null;
  onDelete: (billId: string) => void;
  onMarkPaid: (billId: string, paymentData: PaymentData) => void;
  onClose: () => void;
  onEdit: (bill: BillFromTypes) => void;
  onCreateRecurring: (bill: BillFromTypes) => void;
}

/**
 * Business logic hook for bill detail modal operations
 * Extracted from UI component following Issue #152 pattern
 */
export const useBillDetail = ({
  bill,
  onDelete,
  onMarkPaid,
  onClose,
  onEdit,
  onCreateRecurring,
}: BillDetailParams) => {
  // Form state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(bill?.amount?.toString() || "");

  const confirm = useConfirm();

  // Computed values
  const { daysUntilDue, statusInfo } = useBillStatus(bill);

  // Actions
  const handleMarkPaid = async (e: FormEvent) => {
    e.preventDefault();

    if (!bill) {
      logger.warn("Cannot mark null bill as paid");
      return;
    }

    try {
      const amount = parseFloat(paymentAmount);
      if (amount <= 0) {
        logger.warn("Invalid payment amount", { amount: paymentAmount });
        return;
      }

      const paymentData = {
        billId: bill.id,
        amount,
        paidDate: new Date().toISOString(),
        notes: `Payment recorded via bill manager`,
      };

      logger.debug("Marking bill as paid", { billId: bill.id, amount });
      await onMarkPaid(bill.id, paymentData);

      // Reset form
      setShowPaymentForm(false);
      setPaymentAmount(bill?.amount?.toString() || "");

      logger.info("Bill marked as paid successfully", { billId: bill.id });
    } catch (error) {
      logger.error("Failed to mark bill as paid", error);
    }
  };

  const handleDelete = async () => {
    if (!bill) {
      logger.warn("Cannot delete null bill");
      return;
    }

    try {
      const confirmed = await confirm({
        title: "Delete Bill",
        message: `Are you sure you want to delete "${bill.name}"? This action cannot be undone.`,
        confirmLabel: "Delete Bill",
        cancelLabel: "Cancel",
        destructive: true,
      });

      if (confirmed) {
        logger.debug("Deleting bill", { billId: bill.id });
        await onDelete(bill.id);
        onClose();
        logger.info("Bill deleted successfully", { billId: bill.id });
      }
    } catch (error) {
      logger.error("Failed to delete bill", error);
    }
  };

  const handleEdit = () => {
    if (!bill) {
      logger.warn("Cannot edit null bill");
      return;
    }
    logger.debug("Opening bill edit modal", { billId: bill.id });
    onClose();
    onEdit(bill);
  };

  const handleCreateRecurring = () => {
    if (!bill) {
      logger.warn("Cannot create recurring from null bill");
      return;
    }
    logger.debug("Creating recurring bill from one-time bill", {
      billId: bill.id,
    });
    onCreateRecurring?.(bill);
    onClose();
  };

  const handlePaymentAmountChange = (value: string) => {
    setPaymentAmount(value);
  };

  const handleShowPaymentForm = () => {
    setShowPaymentForm(true);
  };

  const handleHidePaymentForm = () => {
    setShowPaymentForm(false);
    setPaymentAmount(bill?.amount?.toString() || "");
  };

  return {
    // State
    showPaymentForm,
    paymentAmount,

    // Computed values
    daysUntilDue,
    statusInfo,

    // Actions
    handleMarkPaid,
    handleDelete,
    handleEdit,
    handleCreateRecurring,
    handlePaymentAmountChange,
    handleShowPaymentForm,
    handleHidePaymentForm,
  };
};
