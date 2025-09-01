/**
 * useDebtForm hook - Extracted from AddDebtModal.jsx
 * Handles form state, validation, and submission logic for debt management
 */

import { useState, useEffect } from "react";
import { DEBT_TYPES, PAYMENT_FREQUENCIES } from "../../constants/debts";
import logger from "../../utils/common/logger";

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
      // Determine payment method based on existing connections
      let paymentMethod = "create_new";
      if (connectedBill) {
        paymentMethod = "connect_existing_bill"; // Bill connection (uses bill's envelope)
      }

      setFormData({
        name: debt.name || "",
        creditor: debt.creditor || "",
        type: debt.type || DEBT_TYPES.PERSONAL,
        currentBalance: debt.currentBalance?.toString() || "",
        originalBalance: debt.originalBalance?.toString() || "",
        interestRate: debt.interestRate?.toString() || "",
        minimumPayment: debt.minimumPayment?.toString() || "",
        paymentFrequency: debt.paymentFrequency || PAYMENT_FREQUENCIES.MONTHLY,
        paymentDueDate: debt.paymentDueDate || "",
        notes: debt.notes || "",
        paymentMethod: paymentMethod,
        createBill: false, // Don't auto-create bill when editing
        envelopeId: debt.envelopeId || connectedEnvelope?.id || "",
        existingBillId: connectedBill?.id || "",
        newEnvelopeName: "",
      });
    } else if (!debt && isOpen) {
      // Reset form for new debt
      setFormData({
        ...initialFormState,
        createBill: true,
      });
    }
  }, [debt, isOpen, connectedBill, connectedEnvelope]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Debt name is required";
    }

    if (!formData.creditor.trim()) {
      newErrors.creditor = "Creditor name is required";
    }

    if (!formData.currentBalance || parseFloat(formData.currentBalance) < 0) {
      newErrors.currentBalance = "Valid current balance is required";
    }

    if (formData.originalBalance && parseFloat(formData.originalBalance) < 0) {
      newErrors.originalBalance = "Original balance must be positive";
    }

    // Validate interest rate
    if (
      formData.interestRate &&
      (parseFloat(formData.interestRate) < 0 || parseFloat(formData.interestRate) > 100)
    ) {
      newErrors.interestRate = "Interest rate must be between 0 and 100";
    }

    if (!formData.minimumPayment || parseFloat(formData.minimumPayment) < 0) {
      newErrors.minimumPayment = "Valid minimum payment is required";
    }

    // Validate payment method specific fields
    if (formData.paymentMethod === "connect_existing" && !formData.existingBillId) {
      newErrors.existingBillId = "Please select a bill to connect";
    }

    if (formData.paymentMethod === "create_new" && formData.createBill && !formData.envelopeId) {
      newErrors.envelopeId = "Please select an envelope for payment funding";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (onSubmitCallback) => {
    if (!validateForm()) return false;

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
        await onSubmitCallback(debt.id, debtData);
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

  const updateFormData = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    // Clear related errors when updating
    if (Object.keys(updates).some((key) => errors[key])) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        Object.keys(updates).forEach((key) => {
          delete newErrors[key];
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
    validateForm,
    handleSubmit,
    resetForm,
  };
};
