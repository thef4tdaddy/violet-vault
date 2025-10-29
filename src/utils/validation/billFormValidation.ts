/**
 * Bill form validation functions using Zod schemas
 */
import { BillFormDataSchema, type BillFormData } from "@/domain/schemas/bill";

/**
 * Validate bill form data using Zod schema
 */
export const validateBillFormData = (formData: BillFormData): string[] => {
  const result = BillFormDataSchema.safeParse(formData);

  if (result.success) {
    return [];
  }

  return result.error.errors.map((err) => err.message);
};
