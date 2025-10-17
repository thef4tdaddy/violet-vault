import { useCallback } from "react";

/**
 * Hook for bill data validation operations
 * Extracted from useBillOperations.js to reduce complexity
 */
export const useBillValidation = (envelopes = []) => {
  /**
   * Validate bill data before operations
   */
  const validateBillData = useCallback(
    (bill) => {
      const errors = [];

      if (!bill.id) {
        errors.push("Bill ID is required");
      }

      if (!bill.amount || bill.amount <= 0) {
        errors.push("Bill amount must be greater than 0");
      }

      if (bill.dueDate && isNaN(new Date(bill.dueDate).getTime())) {
        errors.push("Invalid due date format");
      }

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
