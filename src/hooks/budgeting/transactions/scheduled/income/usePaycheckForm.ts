import { useState, useCallback } from "react";
import {
  validatePaycheckForm,
  validateAllocations,
  getUniquePayers,
  type AllocationItem,
} from "@/utils/budgeting/paycheckUtils";

import type { PaycheckHistory } from "@/db/types";

interface ErrorRecord {
  [key: string]: string;
}

interface PaycheckFormData {
  amount: string;
  payerName: string;
  allocationMode: string;
}

/**
 * Hook for managing paycheck form state and validation logic
 */
export const usePaycheckForm = (
  paycheckHistory: PaycheckHistory[] = [],
  currentUser: { userName: string } = { userName: "User" }
) => {
  const [formData, setFormData] = useState<PaycheckFormData>({
    amount: "",
    payerName: currentUser?.userName || "",
    allocationMode: "allocate",
  });

  const [errors, setErrors] = useState<ErrorRecord>({});
  const [tempPayers, setTempPayers] = useState<string[]>([]);

  const updateFormField = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      amount: "",
      payerName: currentUser?.userName || "",
      allocationMode: "allocate",
    });
    setErrors({});
  }, [currentUser]);

  const validateForm = useCallback(
    (currentAllocations: { allocations: AllocationItem[] }) => {
      // 1. Validate Form Fields
      const formValidation = validatePaycheckForm(formData);

      // 2. Validate Allocations
      const numericAmount = parseFloat(formData.amount);
      const allocationValidation = validateAllocations(
        currentAllocations.allocations,
        numericAmount
      );

      const mergedErrors = { ...formValidation.errors };
      if (!allocationValidation.isValid) {
        mergedErrors.allocations = allocationValidation.message;
      }

      setErrors(mergedErrors);
      return formValidation.isValid && allocationValidation.isValid;
    },
    [formData]
  );

  const uniquePayers = getUniquePayers(paycheckHistory, tempPayers);

  return {
    formData,
    errors,
    setErrors,
    tempPayers,
    setTempPayers,
    uniquePayers,
    updateFormField,
    resetForm,
    validateForm,
  };
};

export default usePaycheckForm;
