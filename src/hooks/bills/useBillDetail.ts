import { useState, useMemo, FormEvent } from "react";
import { useConfirm } from "../common/useConfirm";
import logger from "../../utils/common/logger";
import type { Bill as BillFromTypes } from "../../types/bills";

const STATUS_COLOR_CLASSES = {
  green: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    icon: "text-green-500",
  },
  red: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    icon: "text-red-500",
  },
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    icon: "text-orange-500",
  },
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: "text-blue-500",
  },
} as const;

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
  const normalizedDueDate = useMemo(() => {
    if (!bill || !bill.dueDate) {
      return null;
    }

    // bill.dueDate is a string in the Bill interface
    const parsed = new Date(bill.dueDate);

    if (isNaN(parsed.getTime())) {
      logger.warn("Invalid bill due date received", { billId: bill.id, dueDate: bill.dueDate });
      return null;
    }

    return parsed;
  }, [bill?.dueDate, bill?.id]);

  const daysUntilDue = useMemo(() => {
    if (!normalizedDueDate) return null;
    const now = Date.now();
    const dueTime = normalizedDueDate.getTime();
    return Math.ceil((dueTime - now) / (1000 * 60 * 60 * 24));
  }, [normalizedDueDate]);

  const isOverdue = useMemo(() => {
    return daysUntilDue !== null && daysUntilDue < 0;
  }, [daysUntilDue]);

  const isDueSoon = useMemo(() => {
    return daysUntilDue !== null && daysUntilDue <= 3 && daysUntilDue >= 0;
  }, [daysUntilDue]);

  const statusInfo = useMemo(() => {
    const getStatusColor = () => {
      if (bill?.isPaid) return "green";
      if (isOverdue) return "red";
      if (isDueSoon) return "orange";
      return "blue";
    };

    const statusColor = getStatusColor();

    const getStatusText = () => {
      if (bill?.isPaid) return "Paid";
      if (isOverdue && daysUntilDue !== null) {
        return `Overdue by ${Math.abs(daysUntilDue)} days`;
      }
      if (isDueSoon && daysUntilDue !== null) {
        return `Due in ${daysUntilDue} days`;
      }
      if (daysUntilDue !== null) {
        return `Due in ${daysUntilDue} days`;
      }
      return normalizedDueDate ? "Scheduled" : "Date not set";
    };

    return {
      color: statusColor,
      classes: STATUS_COLOR_CLASSES[statusColor],
      text: getStatusText(),
      isOverdue,
      isDueSoon,
    };
  }, [bill?.isPaid, isOverdue, isDueSoon, daysUntilDue, normalizedDueDate]);

  // Actions
  const handleMarkPaid = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
    logger.debug("Opening bill edit modal", { billId: bill.id });
    onClose();
    onEdit(bill);
  };

  const handleCreateRecurring = () => {
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
