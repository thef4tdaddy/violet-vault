import { useCallback } from "react";
import { validateBillSafe } from "@/domain/schemas/bill.ts";
import type { Bill } from "@/types/bills";
import type { Envelope } from "@/types/finance";

/**
 * Hook for bill data validation operations
 * Extracted from useBillOperations.js to reduce complexity
 * Now using Zod schemas for runtime validation (Issue #412)
 */
export const useBillValidation = (envelopes: Envelope[] = []) => {
  /**
   * Validate bill data before operations using Zod schema
   * Additional envelope validation for data integrity
   */
  const validateBillData = useCallback(
    (bill: Partial<Bill>) => {
      // First validate with Zod schema
      const zodResult = validateBillSafe(bill);

      if (!zodResult.success) {
        // Safety check: Zod uses 'issues', not 'errors'
        // Ensure issues is an array before map
        if (!zodResult.error || !zodResult.error.issues) {
          return { isValid: false, errors: ["Validation error: Invalid error structure"] };
        }
        const issues = Array.isArray(zodResult.error.issues) ? zodResult.error.issues : [];
        const errors = issues.map((err) => {
          const path = err?.path?.join(".") || "unknown";
          return `${path}: ${err?.message || "Validation error"}`;
        });
        return { isValid: false, errors };
      }

      // Then add envelope-specific validation
      const errors: string[] = [];

      if (bill.envelopeId && !envelopes.find((env: Envelope) => env.id === bill.envelopeId)) {
        errors.push("Assigned envelope does not exist");
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
    [envelopes]
  );

  /**
   * Generate bill modification history entry
   */
  const createModificationHistory = useCallback(
    (type: string, changes: Record<string, unknown>) => ({
      timestamp: new Date().toISOString(),
      type,
      changes,
    }),
    []
  );

  return {
    validateBillData,
    createModificationHistory,
  };
};
