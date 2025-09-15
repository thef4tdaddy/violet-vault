/**
 * useBillForm Hook
 * Extracted from AddBillModal.jsx for Issue #152
 *
 * Handles bill form state management, validation, and submission logic
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  getBillIcon,
  getBillIconOptions,
  getIconNameForStorage,
} from "../../utils/common/billIcons";
import { toMonthly } from "../../utils/common/frequencyCalculations";
import {
  BIWEEKLY_MULTIPLIER,
  convertToBiweekly,
} from "../../constants/frequency";
import { getBillCategories } from "../../constants/categories";
import logger from "../../utils/common/logger";

/**
 * Get initial form data for a bill
 */
const getInitialFormData = (bill = null) => {
  if (bill) {
    return {
      name: bill.name || bill.provider || "",
      amount: bill.amount || "",
      frequency: bill.frequency || "monthly",
      dueDate: bill.dueDate || "",
      category: bill.category || "Bills",
      color: bill.color || "#3B82F6",
      notes: bill.notes || "",
      createEnvelope: false,
      selectedEnvelope: bill.envelopeId || "",
      customFrequency: bill.customFrequency || "",
      iconName:
        bill.iconName ||
        getIconNameForStorage(
          bill.icon ||
            getBillIcon(
              bill.name || bill.provider || "",
              bill.notes || "",
              bill.category || "",
            ),
        ),
    };
  }
  return {
    name: "",
    amount: "",
    frequency: "monthly",
    dueDate: "",
    category: "Bills",
    color: "#3B82F6",
    notes: "",
    createEnvelope: false,
    selectedEnvelope: "",
    customFrequency: "",
    iconName: "FileText",
  };
};

/**
 * Custom hook for bill form management
 * @param {Object} options - Configuration options
 * @returns {Object} Form state and actions
 */
export const useBillForm = ({
  editingBill = null,
  availableEnvelopes = [],
  onAddBill,
  onUpdateBill,
  onDeleteBill,
  onClose,
  onError,
} = {}) => {
  // Form State
  const [formData, setFormData] = useState(getInitialFormData(editingBill));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteEnvelopeToo, setDeleteEnvelopeToo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when editing bill changes
  useEffect(() => {
    if (editingBill) {
      const initialData = getInitialFormData(editingBill);
      const billEnvelopes = availableEnvelopes.filter((env) => {
        return (
          env.billId === editingBill.id ||
          env.category === editingBill.category ||
          env.name === editingBill.name
        );
      });

      if (billEnvelopes.length > 0) {
        initialData.selectedEnvelope = billEnvelopes[0].id;
      }

      setFormData(initialData);
    } else {
      setFormData(getInitialFormData());
    }
  }, [editingBill, availableEnvelopes]);

  // Suggest icon based on form data
  const suggestedIconName = useMemo(() => {
    const suggestedIcon = getBillIcon(
      formData.name,
      formData.notes,
      formData.category,
    );
    return getIconNameForStorage(suggestedIcon);
  }, [formData.name, formData.notes, formData.category]);

  // Icon suggestions for current category
  const iconSuggestions = useMemo(
    () => getBillIconOptions(formData.category),
    [formData.category],
  );

  // Available categories
  const categories = useMemo(() => getBillCategories(), []);

  // Business Logic Functions
  const calculateBiweeklyAmount = useCallback(
    (amount, frequency, customFrequency = 1) => {
      const monthlyAmount = calculateMonthlyAmount(
        amount,
        frequency,
        customFrequency,
      );
      return convertToBiweekly(monthlyAmount);
    },
    [calculateMonthlyAmount],
  );

  const calculateMonthlyAmount = useCallback(
    (amount, frequency, customFrequency = 1) => {
      const numAmount = parseFloat(amount) || 0;
      return toMonthly(numAmount, frequency, customFrequency);
    },
    [],
  );

  const getNextDueDate = useCallback((frequency, dueDate) => {
    if (!dueDate) return "";
    const date = new Date(dueDate);
    const now = new Date();

    if (date <= now) {
      switch (frequency) {
        case "weekly":
          date.setDate(date.getDate() + 7);
          break;
        case "biweekly":
          date.setDate(date.getDate() + 14);
          break;
        case "monthly":
          date.setMonth(date.getMonth() + 1);
          break;
        case "quarterly":
          date.setMonth(date.getMonth() + 3);
          break;
        case "yearly":
          date.setFullYear(date.getFullYear() + 1);
          break;
      }
    }

    return date.toISOString().split("T")[0];
  }, []);

  const normalizeDateFormat = useCallback((dateString) => {
    if (!dateString) return "";
    try {
      const dateMatch = dateString.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
      if (dateMatch) {
        const [, month, day, year] = dateMatch;
        const fullYear = year.length === 2 ? `20${year}` : year;
        return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }
      return dateString;
    } catch (error) {
      logger.warn("Date normalization failed:", dateString, error);
      return dateString;
    }
  }, []);

  // Form Validation
  const validateForm = useCallback(() => {
    const errors = [];

    if (!formData.name.trim()) {
      errors.push("Bill name is required");
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.push("Valid amount is required");
    }

    if (!formData.dueDate) {
      errors.push("Due date is required");
    }

    return errors;
  }, [formData]);

  // Form Submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        logger.warn("Form validation failed", { errors: validationErrors });
        onError?.(validationErrors.join(", "));
        return;
      }

      setIsSubmitting(true);

      try {
        const normalizedDueDate = normalizeDateFormat(formData.dueDate);
        const monthlyAmount = calculateMonthlyAmount(
          formData.amount,
          formData.frequency,
          formData.customFrequency,
        );
        const biweeklyAmount = calculateBiweeklyAmount(
          formData.amount,
          formData.frequency,
          formData.customFrequency,
        );

        const billData = {
          id: editingBill?.id || uuidv4(),
          name: formData.name.trim(),
          amount: parseFloat(formData.amount),
          monthlyAmount,
          biweeklyAmount,
          frequency: formData.frequency,
          customFrequency: formData.customFrequency || 1,
          dueDate: normalizedDueDate,
          nextDue: getNextDueDate(formData.frequency, normalizedDueDate),
          category: formData.category,
          color: formData.color,
          notes: formData.notes,
          iconName: formData.iconName || suggestedIconName,
          envelopeId: formData.selectedEnvelope,
          createEnvelope: formData.createEnvelope,
          isPaid: editingBill?.isPaid || false,
          createdAt: editingBill?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        logger.debug("Submitting bill data:", billData);

        if (editingBill) {
          logger.debug("Updating existing bill", { billId: billData.id });
          await onUpdateBill?.(billData);
        } else {
          logger.debug("Adding new bill", { billId: billData.id });
          await onAddBill?.(billData);
        }

        // Close modal on success
        onClose?.();
      } catch (error) {
        logger.error("Error during bill submission:", error);
        onError?.(error.message || "Failed to save bill");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      formData,
      editingBill,
      validateForm,
      normalizeDateFormat,
      calculateMonthlyAmount,
      calculateBiweeklyAmount,
      getNextDueDate,
      suggestedIconName,
      onAddBill,
      onUpdateBill,
      onClose,
      onError,
    ],
  );

  // Delete Bill
  const handleDelete = useCallback(async () => {
    if (!editingBill) return;

    try {
      await onDeleteBill?.(editingBill.id, deleteEnvelopeToo);
      setShowDeleteConfirm(false);
      onClose?.();
    } catch (error) {
      logger.error("Error deleting bill:", error);
      onError?.(error.message || "Failed to delete bill");
    }
  }, [editingBill, deleteEnvelopeToo, onDeleteBill, onClose, onError]);

  // Form Field Updates
  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateFormData = useCallback((updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(getInitialFormData(editingBill));
    setShowDeleteConfirm(false);
    setDeleteEnvelopeToo(false);
    setIsSubmitting(false);
  }, [editingBill]);

  return {
    // Form State
    formData,
    showDeleteConfirm,
    deleteEnvelopeToo,
    isSubmitting,

    // Computed Values
    suggestedIconName,
    iconSuggestions,
    categories,

    // Validation
    validationErrors: validateForm(),

    // Actions
    handleSubmit,
    handleDelete,
    updateField,
    updateFormData,
    resetForm,

    // UI State Setters
    setShowDeleteConfirm,
    setDeleteEnvelopeToo,

    // Utility Functions
    calculateBiweeklyAmount,
    calculateMonthlyAmount,
    getNextDueDate,
    normalizeDateFormat,
  };
};
