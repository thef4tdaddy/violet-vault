/**
 * useBillForm Hook
 * Extracted from AddBillModal.jsx for Issue #152
 *
 * Handles bill form state management, validation, and submission logic
 */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { getBillIcon, getBillIconOptions, getIconNameForStorage } from "@/utils/common/billIcons";
import { getBillCategories } from "@/constants/categories";
import logger from "@/utils/common/logger";
import type { Bill, BillFormData, BillFormOptions, BillFormHookReturn } from "@/types/bills";
import {
  getInitialFormData,
  calculateMonthlyAmountHelper,
  calculateBiweeklyAmountHelper,
  getNextDueDateHelper,
  normalizeDateFormatHelper,
  buildBillData,
} from "./helpers/billFormHelpers";
import { validateBillFormData } from "@/utils/validation/billFormValidation";
import type { BillIconOption } from "@/utils/billIcons/iconOptions";

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
        initialData.selectedEnvelope = String(billEnvelopes[0].id);
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
  const iconSuggestions = useMemo<BillIconOption[]>(
    () => getBillIconOptions(formData.category),
    [formData.category]
  );

  // Available categories
  const categories = useMemo(() => getBillCategories().slice(), []);

  // Form Submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();

      const validationErrors = validateBillFormData(formData);
      if (validationErrors.length > 0) {
        logger.warn("Form validation failed", { errors: validationErrors });
        onError?.(validationErrors.join(", "));
        return;
      }

      setIsSubmitting(true);

      try {
        const built = buildBillData(formData, editingBill, suggestedIconName) as unknown;
        const billData: Bill = {
          ...(built as Record<string, unknown>),
          id: editingBill?.id || uuidv4(),
        } as Bill;

        // logger accepts unknown payloads; wrap in object to satisfy type expectations
        logger.debug("Submitting bill data:", { billData });

        if (editingBill) {
          logger.debug("Updating existing bill", { billId: billData.id });
          await onUpdateBill?.(billData);
        } else {
          logger.debug("Adding new bill", { billId: billData.id });
          await onAddBill?.(billData);
        }

        onClose?.();
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        logger.error("Error during bill submission:", errorObj);
        onError?.(errorObj.message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, editingBill, suggestedIconName, onAddBill, onUpdateBill, onClose, onError]
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
    validationErrors: validateBillFormData(formData),

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
    calculateBiweeklyAmount: calculateBiweeklyAmountHelper,
    calculateMonthlyAmount: calculateMonthlyAmountHelper,
    getNextDueDate: getNextDueDateHelper,
    normalizeDateFormat: normalizeDateFormatHelper,
  };
};
