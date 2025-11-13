/**
 * useDebtForm hook - Extracted from AddDebtModal.jsx
 * Handles form state, validation, and submission logic for debt management
 */

import { useState, useEffect } from "react";
import { DEBT_TYPES, PAYMENT_FREQUENCIES } from "../../constants/debts";
import logger from "../../utils/common/logger";
import { validateDebtFormFields } from "../../utils/debts/debtFormValidation";

const initialFormState = {
  name: "",
  creditor: "",
  type: DEBT_TYPES.PERSONAL,
  currentBalance: "",
  originalBalance: "",
  interestRate: "",
  minimumPayment: "",
  paymentFrequency: PAYMENT_FREQUENCIES.MONTHLY,
  paymentDueDate: "",
  notes: "",
  // Connection fields
  paymentMethod: "create_new", // "create_new" or "connect_existing"
  createBill: true, // Don't auto-create bill when editing
  envelopeId: "", // Envelope to fund payments from
  existingBillId: "", // For connecting to existing bill
  newEnvelopeName: "",
};

const determinePaymentMethod = (connectedBill: any) => {
  return connectedBill ? "connect_existing_bill" : "create_new";
};

const safeToString = (value: any) => value?.toString() || "";

const getEnvelopeId = (debt: any, connectedEnvelope: any) =>
  debt.envelopeId || connectedEnvelope?.id || "";

const getExistingBillId = (connectedBill: any) => connectedBill?.id || "";

const buildBaseFormData = (debt: any) => ({
  name: debt.name || "",
  creditor: debt.creditor || "",
  type: debt.type || DEBT_TYPES.PERSONAL,
  paymentDueDate: debt.paymentDueDate || "",
  notes: debt.notes || "",
});

const buildFinancialFormData = (debt: any) => ({
  currentBalance: safeToString(debt.currentBalance),
  originalBalance: safeToString(debt.originalBalance),
  interestRate: safeToString(debt.interestRate),
  minimumPayment: safeToString(debt.minimumPayment),
  paymentFrequency: debt.paymentFrequency || PAYMENT_FREQUENCIES.MONTHLY,
});

const buildConnectionFormData = (debt: any, connectedBill: any, connectedEnvelope: any) => ({
  paymentMethod: determinePaymentMethod(connectedBill),
  createBill: false,
  envelopeId: getEnvelopeId(debt, connectedEnvelope),
  existingBillId: getExistingBillId(connectedBill),
  newEnvelopeName: "",
});

const buildEditFormData = (debt: any, connectedBill: any, connectedEnvelope: any) => ({
  ...buildBaseFormData(debt),
  ...buildFinancialFormData(debt),
  ...buildConnectionFormData(debt, connectedBill, connectedEnvelope),
});

const buildNewFormData = () => ({
  ...initialFormState,
  createBill: true,
});

export const useDebtForm = (
  debt = null,
  isOpen = false,
  connectedBill = null,
  connectedEnvelope = null
) => {
  const isEditMode = !!debt;
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when debt prop changes
  useEffect(() => {
    if (debt) {
      setFormData(buildEditFormData(debt, connectedBill, connectedEnvelope));
    } else if (!debt && isOpen) {
      setFormData(buildNewFormData());
    }
  }, [debt, isOpen, connectedBill, connectedEnvelope]);

  const checkFormValidity = () => {
    const newErrors = validateDebtFormFields(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (onSubmitCallback: (arg0: any, arg1?: any) => Promise<void>) => {
    if (!checkFormValidity()) return false;

    setIsSubmitting(true);

    try {
      const debtData = {
        ...formData,
        currentBalance: parseFloat(formData.currentBalance),
        interestRate: parseFloat(formData.interestRate) || 0,
        minimumPayment: parseFloat(formData.minimumPayment),
        originalBalance: formData.originalBalance
          ? parseFloat(formData.originalBalance)
          : parseFloat(formData.currentBalance), // Default to current balance if not specified
        // Include connection data for the parent component to handle
        connectionData: {
          paymentMethod: formData.paymentMethod,
          createBill: formData.createBill,
          envelopeId: formData.envelopeId || "",
          existingBillId: formData.existingBillId || "",
          newEnvelopeName: formData.newEnvelopeName || "",
        },
      };

      if (isEditMode) {
        // For edit mode, pass debt ID and updates
        await onSubmitCallback((debt as any).id, debtData);
      } else {
        // For add mode, just pass the debt data
        await onSubmitCallback(debtData);
      }

      if (!isEditMode) {
        resetForm(); // Only reset form when adding new debt
      }

      return true;
    } catch (error) {
      logger.error(`Error ${isEditMode ? "updating" : "creating"} debt:`, error);
      setErrors({
        submit: `Failed to ${isEditMode ? "update" : "create"} debt. Please try again.`,
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      ...initialFormState,
      createBill: true,
    });
    setErrors({});
    setIsSubmitting(false);
  };

  const updateFormData = (updates: any) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    // Clear related errors when updating
    if (Object.keys(updates).some((key) => (errors as any)[key])) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        Object.keys(updates).forEach((key) => {
          delete (newErrors as any)[key];
        });
        return newErrors;
      });
    }
  };

  return {
    formData,
    setFormData: updateFormData,
    errors,
    isSubmitting,
    isEditMode,
    validateForm: checkFormValidity,
    handleSubmit,
    resetForm,
  };
};
