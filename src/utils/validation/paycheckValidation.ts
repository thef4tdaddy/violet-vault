/**
 * Paycheck validation using Zod schemas
 */
import { z } from "zod";

/**
 * Zod schema for form data validation
 * Note: These schemas are defined for potential future use in validation pipeline.
 * Currently, validation is handled by the passed-in validatePaycheckForm function.
 */
// @ts-expect-error - Reserved for future validation pipeline implementation
const _FormDataSchema = z.object({
  amount: z.union([z.string(), z.number()]).refine(
    (val) => {
      const num = typeof val === "string" ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    },
    { message: "Amount must be a valid positive number" }
  ),
});

/**
 * Zod schema for allocation validation
 * Note: These schemas are defined for potential future use in validation pipeline.
 */
const _AllocationSchema = z.record(z.string(), z.unknown());

/**
 * Zod schema for allocation response
 * Note: These schemas are defined for potential future use in validation pipeline.
 */
// @ts-expect-error - Reserved for future validation pipeline implementation
const _AllocationResponseSchema = z.object({
  allocations: z.array(_AllocationSchema),
});

interface FormData {
  amount: string | number;
  [key: string]: unknown;
}

interface Allocation {
  [key: string]: unknown;
}

interface AllocationResponse {
  allocations: Allocation[];
  [key: string]: unknown;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, unknown>;
}

interface AllocationValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Validates form data and allocations for paycheck processing
 */
export const validateFormAndAllocations = (
  formData: FormData,
  currentAllocations: AllocationResponse,
  validatePaycheckForm: (data: FormData) => ValidationResult,
  validateAllocations: (allocations: Allocation[], amount: number) => AllocationValidationResult
): ValidationResult => {
  const validation = validatePaycheckForm(formData);
  const errors = validation.errors || {};

  // Also validate allocations if form is valid
  if (validation.isValid && currentAllocations.allocations.length > 0) {
    const allocationValidation = validateAllocations(
      currentAllocations.allocations,
      parseFloat(String(formData.amount))
    );
    if (!allocationValidation.isValid) {
      errors.allocations = allocationValidation.message;
      return { isValid: false, errors };
    }
  }

  return validation;
};
