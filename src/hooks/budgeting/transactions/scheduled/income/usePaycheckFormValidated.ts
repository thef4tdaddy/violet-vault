/**
 * usePaycheckFormValidated Hook
 * Standardized validation pattern for paycheck/income form management
 * Part of Issue #987 - Comprehensive Zod Schema Implementation (Phase 3)
 *
 * This implements a standardized pattern using useValidatedForm and
 * PaycheckFormSchema from Zod.
 */

import { useCallback, useEffect } from "react";
import { useValidatedForm } from "@/hooks/common/validation";
import {
  PaycheckFormSchema,
  type PaycheckFormData,
  type PaycheckHistory,
} from "@/domain/schemas/paycheck-history";
import logger from "@/utils/common/logger";

interface UsePaycheckFormValidatedOptions {
  paycheck?: PaycheckHistory | null;
  isOpen?: boolean;
  onSubmit?: (paycheckId: string | null, data: PaycheckFormData) => Promise<void>;
}

/**
 * Hook for validated paycheck/income form management
 * Uses the standardized useValidatedForm pattern with PaycheckFormSchema
 */
export function usePaycheckFormValidated({
  paycheck = null,
  isOpen = false,
  onSubmit,
}: UsePaycheckFormValidatedOptions = {}) {
  const isEditMode = !!paycheck;

  // Build initial form data
  const buildInitialData = useCallback((): PaycheckFormData => {
    if (paycheck) {
      // Edit mode - populate from existing paycheck
      // Convert allocations array to object if needed (for legacy form compatibility)
      let allocationsObj = {};
      if (Array.isArray(paycheck.allocations)) {
        allocationsObj = paycheck.allocations.reduce(
          (acc, alloc) => {
            acc[alloc.envelopeId] = alloc.amount;
            return acc;
          },
          {} as Record<string, number>
        );
      } else {
        allocationsObj = paycheck.allocations || {};
      }

      return {
        date:
          typeof paycheck.date === "string"
            ? paycheck.date
            : paycheck.date instanceof Date
              ? paycheck.date.toISOString().split("T")[0]
              : typeof paycheck.processedAt === "string"
                ? paycheck.processedAt
                : paycheck.processedAt instanceof Date
                  ? paycheck.processedAt.toISOString().split("T")[0]
                  : new Date().toISOString().split("T")[0],
        amount: paycheck.amount?.toString() || "",
        source: paycheck.payerName || paycheck.source || "",
        allocations: allocationsObj,
        deductions: paycheck.deductions || {},
        netAmount: paycheck.netAmount?.toString() || "",
      };
    } else {
      // Add mode - empty form with defaults
      const today = new Date().toISOString().split("T")[0];
      return {
        date: today,
        amount: "",
        source: "",
        allocations: {},
        deductions: {},
        netAmount: "",
      };
    }
  }, [paycheck]);

  // Initialize form with validation
  const form = useValidatedForm({
    schema: PaycheckFormSchema,
    initialData: buildInitialData(),
    validateOnChange: false,
    onSubmit: async (validatedData) => {
      if (!onSubmit) {
        logger.warn("No onSubmit handler provided to usePaycheckFormValidated");
        return;
      }

      try {
        // Submit validated data
        await onSubmit(paycheck?.id || null, validatedData);
      } catch (error) {
        logger.error(`Error ${isEditMode ? "updating" : "creating"} paycheck:`, error);
        throw error; // Re-throw to let useValidatedForm handle state
      }
    },
  });

  // Update form when paycheck changes
  useEffect(() => {
    if (isOpen) {
      const newData = buildInitialData();
      form.updateFormData(newData);
    }
  }, [paycheck, isOpen, buildInitialData, form]);

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
 * const paycheckForm = usePaycheckFormValidated({
 *   paycheck: editingPaycheck,
 *   isOpen: isModalOpen,
 *   onSubmit: async (paycheckId, data) => {
 *     if (paycheckId) {
 *       await updatePaycheck(paycheckId, data);
 *     } else {
 *       await createPaycheck(data);
 *     }
 *   },
 * });
 *
 * // Access form state
 * const { data, errors, isValid, updateField, handleSubmit } = paycheckForm;
 *
 * // Update a field
 * updateField('amount', '2500.00');
 *
 * // Submit form
 * await handleSubmit();
 * ```
 */
