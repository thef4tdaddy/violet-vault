/**
 * useDebtDetailModal hook - Business logic for DebtDetailModal component
 * Handles payment recording, deletion, progress calculation, and modal actions
 */

import React, { useState, useMemo, useEffect } from "react";
import { useConfirm } from "@/hooks/common/useConfirm";
import type { DebtAccount, PayoffProjection } from "@/types/debt";

// Extended type to handle runtime data that may have additional properties
interface PaymentHistoryItem {
  id?: string | number;
  date: string;
  amount: number;
  principalAmount?: number;
  interestAmount?: number;
}

interface ExtendedPayoffInfo extends Partial<PayoffProjection> {
  payoffDate?: string | Date;
  monthsToPayoff?: number;
  totalInterest?: number;
}

interface DebtWithHistory extends Omit<DebtAccount, "payoffInfo"> {
  paymentHistory?: PaymentHistoryItem[];
  payoffInfo?: ExtendedPayoffInfo;
}

interface UseDebtDetailModalProps {
  debt: DebtWithHistory | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (debtId: string) => void;
  onRecordPayment: (debtId: string, paymentData: PaymentData) => void;
  onEdit: (debt: DebtWithHistory) => void;
}

interface PaymentData {
  amount: number;
  date: string;
  paymentMethod: string;
  notes: string;
}

export const useDebtDetailModal = ({
  debt,
  isOpen,
  onClose,
  onDelete,
  onRecordPayment,
  onEdit,
}: UseDebtDetailModalProps) => {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const confirm = useConfirm();

  // Initialize payment amount when debt changes
  useEffect(() => {
    if (debt && isOpen) {
      const timer = setTimeout(() => {
        setPaymentAmount(debt.minimumPayment?.toString() || "");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [debt, isOpen]);

  // Calculate progress percentage
  const progressData = useMemo(() => {
    if (
      !debt ||
      !debt.originalBalance ||
      debt.originalBalance <= 0 ||
      debt.currentBalance === undefined
    ) {
      return { percentage: 0, hasProgress: false };
    }

    const percentage = ((debt.originalBalance - debt.currentBalance) / debt.originalBalance) * 100;
    return {
      percentage: Math.max(0, Math.min(percentage, 100)),
      hasProgress: true,
      remaining: debt.currentBalance,
      original: debt.originalBalance,
    };
  }, [debt]);

  // Format payoff information
  const payoffDisplay = useMemo(() => {
    if (!debt?.payoffInfo) return null;

    const { payoffDate, monthsToPayoff, totalInterest } = debt.payoffInfo;

    return {
      expectedPayoff: payoffDate
        ? new Date(payoffDate).toLocaleDateString()
        : monthsToPayoff
          ? `${monthsToPayoff} months`
          : "Insufficient data",
      totalInterest: totalInterest?.toFixed(2) || "N/A",
      payoffDate: payoffDate ? new Date(payoffDate).toLocaleDateString() : "N/A",
    };
  }, [debt]);

  // Get recent payment history
  const recentPayments = useMemo(() => {
    if (!debt?.paymentHistory || debt.paymentHistory.length === 0) {
      return [];
    }

    return debt.paymentHistory
      .slice(-5)
      .reverse()
      .map((payment, index) => ({
        ...payment,
        id: payment.id || index,
        displayDate: new Date(payment.date).toLocaleDateString(),
        formattedAmount: payment.amount?.toFixed(2),
        principalDisplay: payment.principalAmount?.toFixed(2),
        interestDisplay: payment.interestAmount?.toFixed(2),
      }));
  }, [debt]);

  // Event handlers
  const handleRecordPayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!debt) return;

    const amount = parseFloat(paymentAmount);
    if (amount <= 0) return;

    const paymentData = {
      amount,
      date: new Date().toISOString(),
      paymentMethod: "manual",
      notes: "Payment recorded via debt dashboard",
    };

    onRecordPayment(debt.id, paymentData);
    setShowPaymentForm(false);
    setPaymentAmount(debt.minimumPayment?.toString() || "");
  };

  const handleDelete = async () => {
    if (!debt) return;

    const confirmed = await confirm({
      title: "Delete Debt",
      message: `Are you sure you want to delete "${debt.name}"? This action cannot be undone.`,
      confirmLabel: "Delete Debt",
      cancelLabel: "Cancel",
      destructive: true,
    });

    if (confirmed) {
      onDelete(debt.id);
      onClose();
    }
  };

  const handleEdit = () => {
    if (!debt) return;
    onClose();
    onEdit(debt);
  };

  const handleShowPaymentForm = () => {
    setShowPaymentForm(true);
  };

  const handleCancelPayment = () => {
    if (!debt) return;
    setShowPaymentForm(false);
    setPaymentAmount(debt.minimumPayment?.toString() || "");
  };

  return {
    // Payment form state
    showPaymentForm,
    paymentAmount,
    setPaymentAmount,

    // Computed data
    progressData,
    payoffDisplay,
    recentPayments,
    hasRecentPayments: recentPayments.length > 0,
    isActiveDebt: debt?.status === "active",

    // Event handlers
    handleRecordPayment,
    handleDelete,
    handleEdit,
    handleShowPaymentForm,
    handleCancelPayment,
  };
};
