import { useCallback } from "react";
import { validateBillSafe } from "@/domain/schemas/bill.ts";

/**
 * Hook for bill data validation operations
 * Extracted from useBillOperations.js to reduce complexity
 * Now using Zod schemas for runtime validation (Issue #412)
 */
export const useBillValidation = (envelopes = []) => {
  /**
   * Validate bill data before operations using Zod schema
   * Additional envelope validation for data integrity
   */
  const validateBillData = useCallback(
    (bill) => {
      // First validate with Zod schema
      const zodResult = validateBillSafe(bill);

      if (!zodResult.success) {
        const errors = (
          zodResult.error as never as { errors: Array<{ path: string[]; message: string }> }
        ).errors.map((err) => {
          const path = err.path.join(".");
          return `${path}: ${err.message}`;
        });
        return { isValid: false, errors };
      }

      // Then add envelope-specific validation
      const errors = [];

      if (bill.envelopeId && !envelopes.find((env) => env.id === bill.envelopeId)) {
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
    (type, changes) => ({
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
