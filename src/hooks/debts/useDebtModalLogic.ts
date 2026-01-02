/**
 * useDebtModalLogic - Complete modal logic separation
 * Handles all business logic for debt modal including edit locks, connections, etc.
 */

import React, { useEffect, useMemo } from "react";
import { useAuthManager } from "../auth/useAuthManager";
import { initializeEditLocks } from "@/services/sync/editLockService";
import useEditLock from "../common/useEditLock";
import { useEnvelopes } from "../budgeting/useEnvelopes";
import useBills from "../bills/useBills";
import {
  useDebtForm,
  type ConnectedBill,
  type ConnectedEnvelope,
  type DebtSubmissionData,
} from "./useDebtForm";
import { calculateDebtMetrics } from "../../utils/debts/debtFormValidation";
import type { DebtAccount } from "../../types/debt";

export const useDebtModalLogic = (
  debt: DebtAccount | null,
  isOpen: boolean,
  onSubmit: (data: DebtSubmissionData | string, updateData?: DebtSubmissionData) => Promise<void>,
  onClose: () => void
) => {
  // Get auth context for edit locking
  const {
    securityContext: { budgetId },
    user: currentUser,
  } = useAuthManager();

  // Initialize edit lock service when modal opens
  useEffect(() => {
    if (isOpen && budgetId && currentUser) {
      initializeEditLocks(budgetId, currentUser);
    }
  }, [isOpen, budgetId, currentUser]);

  // Get envelopes and bills for dropdown selection
  const { envelopes = [] } = useEnvelopes();
  const { bills = [], isLoading: billsLoading } = useBills();

  // Find connected bill and envelope for this debt
  const connectedBill = useMemo<ConnectedBill | null>(() => {
    if (!debt?.id) return null;
    const bill = bills.find(
      (b) =>
        b &&
        typeof b === "object" &&
        "debtId" in b &&
        (b as Record<string, unknown>).debtId === debt.id
    );
    return (bill as unknown as ConnectedBill) || null;
  }, [debt?.id, bills]);

  const connectedEnvelope = useMemo<ConnectedEnvelope | null>(() => {
    if (connectedBill) {
      const env = envelopes.find(
        (env) => env.id === (connectedBill as Record<string, unknown>).envelopeId
      );
      return (env as unknown as ConnectedEnvelope) || null;
    }
    if (debt) {
      const debtWithEnvelope = debt as { envelopeId?: string };
      if (debtWithEnvelope.envelopeId) {
        const env = envelopes.find((env) => env.id === debtWithEnvelope.envelopeId);
        return (env as unknown as ConnectedEnvelope) || null;
      }
    }
    return null;
  }, [connectedBill, debt, envelopes]);

  // Use the debt form hook
  const debtFormHook = useDebtForm(debt, isOpen, connectedBill, connectedEnvelope);

  // Edit locking for the debt (only when editing existing debt)
  const editLockHook = useEditLock("debt", debt?.id ?? "", {
    autoAcquire: !!(isOpen && debt?.id),
    autoRelease: true,
    showToasts: true,
  });

  // Calculate debt metrics for display
  const { formData } = debtFormHook;
  const debtMetrics = useMemo(() => {
    if (formData.currentBalance && formData.minimumPayment) {
      const metrics = calculateDebtMetrics({
        currentBalance: parseFloat(formData.currentBalance) || 0,
        originalBalance:
          parseFloat(formData.originalBalance) || parseFloat(formData.currentBalance) || 0,
        interestRate: parseFloat(formData.interestRate) || 0,
        minimumPayment: parseFloat(formData.minimumPayment) || 0,
        paymentFrequency: formData.paymentFrequency,
      });
      return metrics;
    }
    return null;
  }, [formData]);

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await debtFormHook.handleSubmit(onSubmit);
    if (success && !debtFormHook.isEditMode) {
      handleClose();
    }
  };

  // Handle modal close
  const handleClose = () => {
    // Release lock when closing
    if (editLockHook.isOwnLock) {
      editLockHook.releaseLock();
    }
    debtFormHook.resetForm();
    onClose();
  };

  // Determine if user can edit
  const canEdit = editLockHook.canEdit;

  // Check if edit lock warning should be shown
  const shouldShowEditLockWarning =
    debtFormHook.isEditMode && editLockHook.isLocked && !editLockHook.isOwnLock;

  // Check if own lock indicator should be shown
  const shouldShowOwnLockIndicator = debtFormHook.isEditMode && editLockHook.isOwnLock;

  // Check if existing connections should be shown
  const shouldShowExistingConnections =
    debtFormHook.isEditMode && (connectedBill || connectedEnvelope);

  // Get connection data for display
  const connectionData = useMemo(() => {
    if (!shouldShowExistingConnections) return null;

    const connections = [];
    if (connectedBill) {
      connections.push({
        label: "Bill",
        value: (connectedBill as Record<string, unknown>).name,
        badge: `$${(((connectedBill as Record<string, unknown>).amount as number) || 0).toFixed(2)}`,
      });
    }
    if (connectedEnvelope) {
      connections.push({
        label: "Envelope",
        value: (connectedEnvelope as Record<string, unknown>).name,
        badge: `$${(((connectedEnvelope as Record<string, unknown>).currentBalance as number) || 0).toFixed(2)}`,
      });
    }

    const description =
      connectedBill && connectedEnvelope
        ? `This debt is connected to the "${(connectedBill as Record<string, unknown>).name}" bill and funded from the "${(connectedEnvelope as Record<string, unknown>).name}" envelope.`
        : connectedBill
          ? `This debt is connected to the "${(connectedBill as Record<string, unknown>).name}" bill.`
          : `This debt is connected to the "${(connectedEnvelope as Record<string, unknown>).name}" envelope.`;

    return { connections, description };
  }, [connectedBill, connectedEnvelope, shouldShowExistingConnections]);

  return {
    // Form data and handlers
    ...debtFormHook,

    // Edit lock data and handlers
    editLock: {
      ...editLockHook,
      shouldShowEditLockWarning,
      shouldShowOwnLockIndicator,
    },

    // Data for dropdowns
    envelopes,
    bills,
    billsLoading,

    // Connection data
    connectedBill,
    connectedEnvelope,
    connectionData,
    shouldShowExistingConnections,

    // Computed data
    debtMetrics,
    canEdit,

    // Event handlers
    handleFormSubmit,
    handleClose,
  };
};
