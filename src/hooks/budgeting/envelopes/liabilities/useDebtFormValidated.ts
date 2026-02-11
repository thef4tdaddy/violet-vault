/**
 * useDebtFormValidated Hook
 * Standardized validation pattern for debt form management
 * Part of Issue #987 - Comprehensive Zod Schema Implementation (Phase 3)
 *
 * This replaces the old useDebtForm hook with a standardized pattern
 * using useValidatedForm and DebtFormSchema from Zod.
 */

import { useCallback, useEffect } from "react";
import { useValidatedForm } from "@/hooks/platform/common/validation";
import { DebtFormSchema, type DebtFormData } from "@/domain/schemas/debt";
import type { LiabilityEnvelope as Debt, Bill, Envelope } from "@/db/types";
import logger from "@/utils/core/common/logger";

interface UseDebtFormValidatedOptions {
  debt?: Debt | null;
  isOpen?: boolean;
  connectedBill?: Bill | null;
  connectedEnvelope?: Envelope | null;
  onSubmit?: (debtId: string | null, data: DebtFormData) => Promise<void>;
}

/**
 * Get default debt data for new entries
 */
function getDefaultDebtData(connectedBill: Bill | null): DebtFormData {
  return {
    type: "personal", // Default to personal for new debts as expected by tests
    category: "Liabilities",
    archived: false,
    autoAllocate: false,
    isPaid: false,
    name: "",
    creditor: "",
    status: "active",
    paymentFrequency: "monthly",
    compoundFrequency: "monthly",
    currentBalance: "",
    balance: "",
    originalBalance: "",
    interestRate: "0",
    minimumPayment: "",
    notes: "",
    paymentMethod: connectedBill ? "connect_existing_bill" : "create_new",
    createBill: true,
    envelopeId: "",
    existingBillId: "",
    newEnvelopeName: "",
    paymentDueDate: "",
    color: "#EF4444",
    description: "",
  };
}

/**
 * Get financial form data for debt
 */
function getFinancialDebtData(debt: Debt, extendedDebt: Record<string, unknown>) {
  const balance = debt.currentBalance?.toString() || "0";
  return {
    currentBalance: balance,
    balance: balance,
    originalBalance: debt.originalBalance?.toString() || "",
    interestRate: debt.interestRate?.toString() || "0",
    minimumPayment: debt.minimumPayment?.toString() || "0",
    paymentFrequency:
      (extendedDebt.paymentFrequency as
        | "monthly"
        | "quarterly"
        | "annually"
        | "weekly"
        | "biweekly") || "monthly",
    compoundFrequency:
      (extendedDebt.compoundFrequency as "monthly" | "annually" | "daily") || "monthly",
    notes: (extendedDebt.notes as string) || "",
  };
}

/**
 * Get connection-related form data for debt
 */
function getDebtConnectionData(
  extendedDebt: Record<string, unknown>,
  connectedBill: Bill | null,
  connectedEnvelope: Envelope | null
) {
  const envId = extendedDebt.envelopeId || connectedEnvelope?.id;
  return {
    paymentMethod: connectedBill ? "connect_existing_bill" : "create_new",
    envelopeId: envId ? String(envId) : "",
    existingBillId: connectedBill?.id || "",
    paymentDueDate:
      (extendedDebt.paymentDueDate as string) || (extendedDebt.dueDate as string) || "",
  };
}

/**
 * Build initial form data from an existing debt
 */
function getPopulatedDebtData(
  debt: Debt,
  connectedBill: Bill | null,
  connectedEnvelope: Envelope | null
): DebtFormData {
  const extendedDebt = debt as unknown as Record<string, unknown>;
  const financialData = getFinancialDebtData(debt, extendedDebt);
  const connections = getDebtConnectionData(extendedDebt, connectedBill, connectedEnvelope);

  return {
    type: (extendedDebt.type as DebtFormData["type"]) || "liability",
    category: debt.category || "Liabilities",
    archived: !!debt.archived,
    autoAllocate: !!debt.autoAllocate,
    isPaid: !!debt.isPaid,
    name: debt.name || "",
    creditor: debt.creditor || "",
    status: debt.status || "active",
    createBill: false,
    newEnvelopeName: "",
    color: debt.color || "#EF4444",
    description: debt.description || "",
    ...financialData,
    ...connections,
  };
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

  // Build initial form data
  const buildInitialData = useCallback(() => {
    return debt
      ? getPopulatedDebtData(debt, connectedBill, connectedEnvelope)
      : getDefaultDebtData(connectedBill);
  }, [debt, connectedBill, connectedEnvelope]);

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
    // We only want to update when input data changes, not the form object itself
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debt, isOpen, connectedBill, connectedEnvelope, buildInitialData, form.updateFormData]);

  return {
    // Form state from validation hook
    ...form,

    // Additional computed state
    isEditMode,

    // Helper to check if form can be submitted
    canSubmit: form.isValid && !form.isSubmitting,
  };
}
