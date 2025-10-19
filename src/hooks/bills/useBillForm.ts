/**
 * useBillForm Hook
 * Extracted from AddBillModal.jsx for Issue #152
 *
 * Handles bill form state management, validation, and submission logic
 */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  getBillIcon,
  getBillIconOptions,
  getIconNameForStorage,
} from "../../utils/common/billIcons";
import { toMonthly } from "../../utils/common/frequencyCalculations";
import { convertToBiweekly } from "../../constants/frequency";
import { getBillCategories } from "../../constants/categories";
import logger from "../../utils/common/logger";
import type {
  Bill,
  BillFormData,
  BillFormOptions,
  BillFormHookReturn,
  BillFrequency,
  CalculationFrequency,
} from "../../types/bills";

/**
 * Get initial form data for a bill
 */
const getInitialFormData = (bill: Bill | null = null): BillFormData => {
  if (bill) {
    return {
      name: bill.name || bill.provider || "",
      amount: bill.amount?.toString() || "",
      frequency: bill.frequency || "monthly",
      dueDate: bill.dueDate || "",
      category: bill.category || "Bills",
      color: bill.color || "#3B82F6",
      notes: bill.notes || "",
      createEnvelope: false,
      selectedEnvelope: bill.envelopeId || "",
      customFrequency: bill.customFrequency?.toString() || "",
      iconName:
        bill.iconName ||
        getIconNameForStorage(
          bill.icon ||
            getBillIcon(bill.name || bill.provider || "", bill.notes || "", bill.category || "")
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
 */
export const useBillForm = ({
  editingBill = null,
  availableEnvelopes = [],
  onAddBill,
  onUpdateBill,
  onDeleteBill,
  onClose,
  onError,
}: BillFormOptions = {}): BillFormHookReturn => {
  // Form State
  const [formData, setFormData] = useState<BillFormData>(getInitialFormData(editingBill));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleteEnvelopeToo, setDeleteEnvelopeToo] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
    const suggestedIcon = getBillIcon(formData.name, formData.notes, formData.category);
    return getIconNameForStorage(suggestedIcon);
  }, [formData.name, formData.notes, formData.category]);

  // Icon suggestions for current category
  const iconSuggestions = useMemo(() => getBillIconOptions(formData.category), [formData.category]);

  // Available categories
  const categories = useMemo(() => getBillCategories(), []);

  // Business Logic Functions
  const calculateMonthlyAmount = useCallback(
    (amount: string | number, frequency: BillFrequency, _customFrequency = 1): number => {
      const numAmount = typeof amount === "string" ? parseFloat(amount) || 0 : amount;
      // Handle 'once' frequency by treating it as monthly for calculation purposes
      const calcFrequency: CalculationFrequency = frequency === "once" ? "monthly" : frequency;
      return toMonthly(numAmount, calcFrequency);
    },
    []
  );

  const calculateBiweeklyAmount = useCallback(
    (amount: string | number, frequency: BillFrequency, customFrequency = 1): number => {
      const monthlyAmount = calculateMonthlyAmount(amount, frequency, customFrequency);
      return convertToBiweekly(monthlyAmount);
    },
    [calculateMonthlyAmount]
  );

  const getNextDueDate = useCallback((frequency: BillFrequency, dueDate: string): string => {
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

  const normalizeDateFormat = useCallback((dateString: string): string => {
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
      logger.warn("Date normalization failed:", { dateString, error: String(error) });
      return dateString;
    }
  }, []);

  // Form Validation
  const validateForm = useCallback((): string[] => {
    const errors: string[] = [];

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
    async (e: React.FormEvent): Promise<void> => {
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
          parseInt(formData.customFrequency) || 1
        );
        const biweeklyAmount = calculateBiweeklyAmount(
          formData.amount,
          formData.frequency,
          parseInt(formData.customFrequency) || 1
        );

        const billData: Bill = {
          id: editingBill?.id || uuidv4(),
          name: formData.name.trim(),
          amount: parseFloat(formData.amount),
          monthlyAmount,
          biweeklyAmount,
          frequency: formData.frequency,
          customFrequency: parseInt(formData.customFrequency) || 1,
          dueDate: normalizedDueDate,
          nextDue: getNextDueDate(formData.frequency, normalizedDueDate),
          category: formData.category,
          color: formData.color,
          notes: formData.notes,
          iconName: formData.iconName || suggestedIconName,
          envelopeId: formData.selectedEnvelope,
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
        const errorObj = error instanceof Error ? error : new Error(String(error));
        logger.error("Error during bill submission:", errorObj);
        onError?.(errorObj.message);
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
    ]
  );

  // Delete Bill
  const handleDelete = useCallback(async (): Promise<void> => {
    if (!editingBill) return;

    try {
      await onDeleteBill?.(editingBill.id, deleteEnvelopeToo);
      setShowDeleteConfirm(false);
      onClose?.();
    } catch (error) {
      logger.error(
        "Error deleting bill:",
        error instanceof Error ? error : new Error(String(error))
      );
      const errorMessage = error instanceof Error ? error.message : "Failed to delete bill";
      onError?.(errorMessage);
    }
  }, [editingBill, deleteEnvelopeToo, onDeleteBill, onClose, onError]);

  // Form Field Updates
  const updateField = useCallback((field: keyof BillFormData, value: string | boolean): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateFormData = useCallback((updates: Partial<BillFormData>): void => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  // Reset form
  const resetForm = useCallback((): void => {
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
