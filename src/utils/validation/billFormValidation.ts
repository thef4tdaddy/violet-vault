/**
 * Bill form validation functions
 */
import type { BillFormData } from "../../types/bills";

/**
 * Validate bill form data
 */
export const validateBillFormData = (formData: BillFormData): string[] => {
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
};
