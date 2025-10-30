/**
 * Bill form validation functions using Zod schemas
 */
import { BillFormDataMinimalSchema } from "@/domain/schemas/bill";
import type { BillFormData } from "@/types/bills";

/**
 * Validate bill form data using Zod schema
 * Note: This validates only the minimal required fields (name, amount, dueDate).
 * The full BillFormData type includes additional UI state fields that are validated elsewhere.
 */
export const validateBillFormData = (formData: BillFormData): string[] => {
  const result = BillFormDataMinimalSchema.safeParse(formData);

  if (result.success) {
    return [];
  }

  return result.error.issues.map((err) => err.message);
};
