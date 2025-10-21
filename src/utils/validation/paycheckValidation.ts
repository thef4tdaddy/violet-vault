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
