/**
 * useDebtModalLogic - Complete modal logic separation
 * Handles all business logic for debt modal including edit locks, connections, etc.
 */

import { useEffect, useMemo } from "react";
import { useAuthManager } from "../auth/useAuthManager";
import { initializeEditLocks } from "../../services/editLockService";
import useEditLock from "../common/useEditLock";
import { useEnvelopes } from "../budgeting/useEnvelopes";
import useBills from "../bills/useBills";
import { useDebtForm } from "./useDebtForm";
import { calculateDebtMetrics } from "../../utils/debts/debtFormValidation";

export const useDebtModalLogic = (debt, isOpen, onSubmit, onClose) => {
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
  const connectedBill = useMemo(
    () => (debt?.id ? bills.find((bill) => bill && typeof bill === 'object' && 'debtId' in bill && bill.debtId === debt.id) : null),
    [debt?.id, bills]
  );

  const connectedEnvelope = useMemo(() => {
    if (connectedBill) {
      return envelopes.find((env) => env.id === connectedBill.envelopeId);
    }
    if (debt?.envelopeId) {
      return envelopes.find((env) => env.id === debt.envelopeId);
    }
    return null;
  }, [connectedBill, debt?.envelopeId, envelopes]);

  // Use the debt form hook
  const debtFormHook = useDebtForm(debt, isOpen, connectedBill, connectedEnvelope);

  // Edit locking for the debt (only when editing existing debt)
  const editLockHook = useEditLock("debt", debt?.id, {
    autoAcquire: isOpen && debt?.id,
    autoRelease: true,
    showToasts: true,
  });

  // Calculate debt metrics for display
  const debtMetrics = useMemo(() => {
    const { formData } = debtFormHook;
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
  }, [debtFormHook]);

  // Handle form submission
  const handleFormSubmit = async (e) => {
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
        value: connectedBill.name,
        badge: `$${connectedBill.amount?.toFixed(2)}`,
      });
    }
    if (connectedEnvelope) {
      connections.push({
        label: "Envelope",
        value: connectedEnvelope.name,
        badge: `$${connectedEnvelope.currentBalance?.toFixed(2)}`,
      });
    }

    const description =
      connectedBill && connectedEnvelope
        ? `This debt is connected to the "${connectedBill.name}" bill and funded from the "${connectedEnvelope.name}" envelope.`
        : connectedBill
          ? `This debt is connected to the "${connectedBill.name}" bill.`
          : `This debt is connected to the "${connectedEnvelope.name}" envelope.`;

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
