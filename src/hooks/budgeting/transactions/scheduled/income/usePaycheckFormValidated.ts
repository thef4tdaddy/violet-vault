/**
 * usePaycheckFormValidated Hook
 */

import { useCallback, useEffect } from "react";
import { useValidatedForm } from "@/hooks/platform/common/validation";
import { z } from "zod";
import logger from "@/utils/common/logger";

// Standardized validation pattern for paycheck/income form management
// Consolidated for Data Unification v2.0 - uses generic schema for now
const PaycheckFormSchema = z.record(z.string(), z.unknown());

interface UsePaycheckFormValidatedOptions {
  paycheck?: Record<string, unknown> | null;
  isOpen?: boolean;
  onSubmit?: (paycheckId: string | null, data: Record<string, unknown>) => Promise<void>;
}

export function usePaycheckFormValidated({
  paycheck = null,
  isOpen = false,
  onSubmit,
}: UsePaycheckFormValidatedOptions = {}) {
  const isEditMode = !!paycheck;

  const buildInitialData = useCallback((): Record<string, unknown> => {
    if (paycheck) {
      return {
        date: new Date().toISOString().split("T")[0],
        amount: paycheck.amount?.toString() || "",
        source: paycheck.payerName || paycheck.source || "",
        allocations: {},
        deductions: {},
        netAmount: "",
      };
    } else {
      return {
        date: new Date().toISOString().split("T")[0],
        amount: "",
        source: "",
        allocations: {},
        deductions: {},
        netAmount: "",
      };
    }
  }, [paycheck]);

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
        await onSubmit((paycheck?.id as string) || null, validatedData);
      } catch (error) {
        logger.error(`Error ${isEditMode ? "updating" : "creating"} paycheck:`, error);
        throw error;
      }
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.updateFormData(buildInitialData());
    }
  }, [paycheck, isOpen, buildInitialData, form]);

  return {
    ...form,
    isEditMode,
    canSubmit: form.isValid && !form.isSubmitting,
  };
}
