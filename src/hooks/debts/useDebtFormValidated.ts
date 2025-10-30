/**
 * useDebtFormValidated Hook
 * Standardized validation pattern for debt form management
 * Part of Issue #987 - Comprehensive Zod Schema Implementation (Phase 3)
 *
 * This replaces the old useDebtForm hook with a standardized pattern
 * using useValidatedForm and DebtFormSchema from Zod.
 */

import { useCallback, useEffect } from "react";
import { useValidatedForm } from "@/hooks/common/validation";
import { DebtFormSchema, type DebtFormData, type Debt } from "@/domain/schemas/debt";
import type { Bill } from "@/types/bills";
import type { Envelope } from "@/types/finance";
import logger from "@/utils/common/logger";

interface UseDebtFormValidatedOptions {
  debt?: Debt | null;
  isOpen?: boolean;
  connectedBill?: Bill | null;
  connectedEnvelope?: Envelope | null;
  onSubmit?: (debtId: string | null, data: DebtFormData) => Promise<void>;
}

/**
 * Hook for validated debt form management
 * Uses the standardized useValidatedForm pattern with DebtFormSchema
 */
export function useDebtFormValidated({
  debt = null,
  isOpen = false,
  connectedBill = null,
  connectedEnvelope = null,
  onSubmit,
}: UseDebtFormValidatedOptions = {}) {
  const isEditMode = !!debt;

  // Determine payment method based on connections
  const determinePaymentMethod = useCallback(() => {
    return connectedBill ? "connect_existing_bill" : "create_new";
  }, [connectedBill]);

  // Build initial form data
  // Complexity justified: Necessary default value initialization for all form fields
  // eslint-disable-next-line complexity
  const buildInitialData = useCallback((): DebtFormData => {
    if (debt) {
      // Edit mode - populate from existing debt
      // Extended type for runtime fields not in schema
      type DebtWithExtras = Debt & {
        paymentFrequency?: "monthly" | "quarterly" | "annually" | "weekly" | "biweekly";
        compoundFrequency?: "monthly" | "annually" | "daily";
        notes?: string;
        envelopeId?: string | number;
      };
      const extendedDebt = debt as unknown as DebtWithExtras;
      const currentBalanceStr = debt.currentBalance?.toString() || "";
      return {
        name: debt.name || "",
        creditor: debt.creditor || "",
        type: debt.type || "personal",
        status: debt.status || "active",
        paymentFrequency: extendedDebt.paymentFrequency || "monthly",
        compoundFrequency: extendedDebt.compoundFrequency || "monthly",
        currentBalance: currentBalanceStr,
        balance: currentBalanceStr,
        originalBalance: debt.originalBalance?.toString() || "",
        interestRate: debt.interestRate?.toString() || "0",
        minimumPayment: debt.minimumPayment?.toString() || "",
        notes: extendedDebt.notes || "",
        paymentMethod: determinePaymentMethod(),
        createBill: false,
        envelopeId: extendedDebt.envelopeId
          ? String(extendedDebt.envelopeId)
          : connectedEnvelope?.id
            ? String(connectedEnvelope.id)
            : "",
        existingBillId: connectedBill?.id || "",
        newEnvelopeName: "",
      };
    } else {
      // Add mode - empty form with defaults
      return {
        name: "",
        creditor: "",
        type: "personal",
        status: "active",
        paymentFrequency: "monthly",
        compoundFrequency: "monthly",
        currentBalance: "",
        balance: "",
        originalBalance: "",
        interestRate: "0",
        minimumPayment: "",
        notes: "",
        paymentMethod: "create_new",
        createBill: true,
        envelopeId: "",
        existingBillId: "",
        newEnvelopeName: "",
      };
    }
  }, [debt, connectedBill, connectedEnvelope, determinePaymentMethod]);

  // Initialize form with validation
  const form = useValidatedForm({
    schema: DebtFormSchema,
    initialData: buildInitialData(),
    validateOnChange: false,
    onSubmit: async (validatedData) => {
      if (!onSubmit) {
        logger.warn("No onSubmit handler provided to useDebtFormValidated");
        return;
      }

      try {
        // Submit validated data
        await onSubmit(debt?.id || null, validatedData);
      } catch (error) {
        logger.error(`Error ${isEditMode ? "updating" : "creating"} debt:`, error);
        throw error; // Re-throw to let useValidatedForm handle state
      }
    },
  });

  // Update form when debt or connections change
  useEffect(() => {
    if (isOpen) {
      const newData = buildInitialData();
      form.updateFormData(newData);
    }
  }, [debt, isOpen, connectedBill, connectedEnvelope, buildInitialData, form]);

  return {
    // Form state from validation hook
    ...form,

    // Additional computed state
    isEditMode,

    // Helper to check if form can be submitted
    canSubmit: form.isValid && !form.isSubmitting,
  };
}

/**
 * Usage Example:
 *
 * ```tsx
 * const debtForm = useDebtFormValidated({
 *   debt: editingDebt,
 *   isOpen: isModalOpen,
 *   connectedBill: connectedBillData,
 *   connectedEnvelope: connectedEnvelopeData,
 *   onSubmit: async (debtId, data) => {
 *     if (debtId) {
 *       await updateDebt(debtId, data);
 *     } else {
 *       await createDebt(data);
 *     }
 *   },
 * });
 *
 * // Access form state
 * const { data, errors, isValid, updateField, handleSubmit } = debtForm;
 *
 * // Update a field
 * updateField('name', 'My Debt');
 *
 * // Submit form
 * await handleSubmit();
 * ```
 */
