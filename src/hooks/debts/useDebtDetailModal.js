/**
 * useDebtDetailModal hook - Business logic for DebtDetailModal component
 * Handles payment recording, deletion, progress calculation, and modal actions
 */

import { useState, useMemo, useEffect } from "react";
import { useConfirm } from "../common/useConfirm";

export const useDebtDetailModal = (debt, isOpen, onClose, onDelete, onRecordPayment, onEdit) => {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const confirm = useConfirm();

  // Initialize payment amount when debt changes
  useEffect(() => {
    if (debt && isOpen) {
      setPaymentAmount(debt.minimumPayment?.toString() || "");
    }
  }, [debt, isOpen]);

  // Calculate progress percentage
  const progressData = useMemo(() => {
    if (!debt || !debt.originalBalance || debt.originalBalance <= 0) {
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
  }, [debt?.payoffInfo]);

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
  }, [debt?.paymentHistory]);

  // Event handlers
  const handleRecordPayment = (e) => {
    e.preventDefault();
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
    onClose();
    onEdit(debt);
  };

  const handleShowPaymentForm = () => {
    setShowPaymentForm(true);
  };

  const handleCancelPayment = () => {
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
