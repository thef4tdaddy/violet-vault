import { useState, useEffect, useCallback } from "react";
import type React from "react";
import {
  validatePaycheckForm,
  getPayerPrediction,
  calculateEnvelopeAllocations,
  createPaycheckTransaction,
  validateAllocations,
  getUniquePayers,
  getPaycheckStatistics,
} from "../../utils/budgeting/paycheckUtils";
import { globalToast } from "../../stores/ui/toastStore";
import logger from "../../utils/common/logger";
import { validateFormAndAllocations as validateFormAndAllocationsUtil } from "../../utils/validation";
import type { Envelope, PaycheckHistory } from "@/db/types";

interface PaycheckFormData {
  amount: string;
  payerName: string;
  allocationMode: string;
}

interface AllocationResult {
  allocations: unknown[];
  totalAllocated: number;
  remainingAmount: number;
  allocationRate: number;
}

interface ErrorMap {
  [key: string]: string;
}

interface User {
  userName: string;
}

interface UsePaycheckProcessorProps {
  envelopes?: Envelope[];
  paycheckHistory?: PaycheckHistory[];
  onAddPaycheck: (paycheckTransaction: unknown) => Promise<void>;
  currentUser?: User;
}

// Helper to clear field error when updated
const clearFieldError = (
  field: string,
  errors: ErrorMap,
  setErrors: React.Dispatch<React.SetStateAction<ErrorMap>>
): void => {
  if (errors[field]) {
    setErrors((prevErrors: ErrorMap) => {
      const { [field]: _removed, ...remainingErrors } = prevErrors;
      return remainingErrors;
    });
  }
};

// Helper to reset allocations to default state
const getDefaultAllocations = (): AllocationResult => ({
  allocations: [],
  totalAllocated: 0,
  remainingAmount: 0,
  allocationRate: 0,
});

// Helper to validate form and allocations
// eslint-disable-next-line no-architecture-violations/no-architecture-violations -- Wrapper function for hook-level validation
const validateFormAndAllocations = (
  formData: PaycheckFormData,
  currentAllocations: AllocationResult,
  setErrors: React.Dispatch<React.SetStateAction<ErrorMap>>
): boolean => {
  const validation = validateFormAndAllocationsUtil(
    formData as unknown as Parameters<typeof validateFormAndAllocationsUtil>[0],
    currentAllocations as unknown as Parameters<typeof validateFormAndAllocationsUtil>[1],
    validatePaycheckForm as unknown as Parameters<typeof validateFormAndAllocationsUtil>[2],
    validateAllocations as unknown as Parameters<typeof validateFormAndAllocationsUtil>[3]
  );
  setErrors(validation.errors as ErrorMap);
  return validation.isValid;
};

/**
 * Custom hook for managing paycheck processing state and operations
 * Handles form validation, allocations, and paycheck transactions
 */
const usePaycheckProcessor = ({
  envelopes = [],
  paycheckHistory = [],
  onAddPaycheck,
  currentUser = { userName: "User" },
}: UsePaycheckProcessorProps) => {
  // Form state
  const [formData, setFormData] = useState<PaycheckFormData>({
    amount: "",
    payerName: "",
    allocationMode: "allocate",
  });

  const [errors, setErrors] = useState<ErrorMap>({});
  const [isLoading, setIsLoading] = useState(false);
  const [tempPayers, setTempPayers] = useState<string[]>([]);

  // Paycheck processing state
  const [currentAllocations, setCurrentAllocations] = useState<AllocationResult>({
    allocations: [],
    totalAllocated: 0,
    remainingAmount: 0,
    allocationRate: 0,
  });

  // Auto-calculate allocations when form data changes
  useEffect(() => {
    if (formData.amount && parseFloat(formData.amount) > 0) {
      const allocations = calculateEnvelopeAllocations(
        parseFloat(formData.amount),
        envelopes as unknown as typeof envelopes,
        formData.allocationMode
      );
      setCurrentAllocations(allocations as AllocationResult);
    } else {
      setCurrentAllocations(getDefaultAllocations());
    }
  }, [formData.amount, formData.allocationMode, envelopes]);

  // Form field update handler
  const updateFormField = useCallback(
    (field: string, value: string) => {
      setFormData((prev: PaycheckFormData) => {
        const newData = { ...prev, [field]: value };
        clearFieldError(field, errors, setErrors);
        return newData;
      });
    },
    [errors]
  );

  // Get payer prediction based on history
  const getPayerData = useCallback(
    (payerName: string) => {
      if (!payerName) return null;
      // Convert PaycheckHistory to PaycheckRecord for compatibility
      const paycheckRecords = paycheckHistory.map((p) => ({
        payerName: p.payerName ?? "",
        amount: p.amount,
        processedAt:
          typeof p.processedAt === "string" ? p.processedAt : p.processedAt?.toISOString(),
      }));
      return getPayerPrediction(payerName, paycheckRecords);
    },
    [paycheckHistory]
  );

  // Apply payer prediction to form
  const applyPayerPrediction = useCallback(
    (payerName: string) => {
      const prediction = getPayerData(payerName);
      if (prediction) {
        updateFormField("amount", prediction.amount.toString());
        globalToast.showInfo(
          `Applied prediction: $${prediction.amount} (${prediction.confidence}% confidence)`,
          "Payer Prediction"
        );
      }
    },
    [getPayerData, updateFormField]
  );

  // Validate current form
  const validateForm = useCallback(() => {
    return validateFormAndAllocations(formData, currentAllocations, setErrors);
  }, [formData, currentAllocations]);

  // Reset form to default state
  const resetForm = useCallback(() => {
    setFormData({
      amount: "",
      payerName: "",
      allocationMode: "allocate",
    });
    setErrors({});
    setCurrentAllocations(getDefaultAllocations());
  }, []);

  // Process paycheck
  const processPaycheck = useCallback(async () => {
    try {
      setIsLoading(true);

      // Validate form
      if (!validateForm()) {
        globalToast.showError(
          "Please fix the form errors before processing",
          "Validation Error",
          8000
        );
        return false;
      }

      // Create paycheck transaction
      const paycheckTransaction = createPaycheckTransaction(
        formData,
        currentAllocations,
        currentUser
      );

      // Process the paycheck
      await onAddPaycheck(paycheckTransaction);

      // Add payer to temp list if new
      const paycheckRecords = paycheckHistory.map((p) => ({
        payerName: p.payerName ?? "",
        amount: p.amount,
        processedAt:
          typeof p.processedAt === "string" ? p.processedAt : p.processedAt?.toISOString(),
      }));
      const uniquePayersList = getUniquePayers(paycheckRecords);
      if (formData.payerName && !uniquePayersList.includes(formData.payerName)) {
        setTempPayers((prev: string[]) => [...prev, formData.payerName]);
      }

      // Reset form
      resetForm();

      globalToast.showSuccess(
        `Paycheck processed: $${paycheckTransaction.amount}`,
        "Paycheck Added"
      );

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to process paycheck";
      logger.error("Error processing paycheck", error);
      globalToast.showError(errorMessage, "Processing Error", 8000);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [
    formData,
    currentAllocations,
    currentUser,
    onAddPaycheck,
    paycheckHistory,
    validateForm,
    resetForm,
  ]);

  // Convert PaycheckHistory to PaycheckRecord for utility functions
  const paycheckRecords = paycheckHistory.map((p) => ({
    payerName: p.payerName ?? "",
    amount: p.amount,
    processedAt: typeof p.processedAt === "string" ? p.processedAt : p.processedAt?.toISOString(),
  }));

  // Get unique payers for dropdown
  const uniquePayers = getUniquePayers(paycheckRecords, tempPayers);

  // Get paycheck statistics
  const paycheckStats = getPaycheckStatistics(paycheckRecords);
  const selectedPayerStats = formData.payerName
    ? getPaycheckStatistics(paycheckRecords, formData.payerName)
    : null;

  // Check if form can be submitted
  const canSubmit =
    formData.amount && formData.payerName && Object.keys(errors).length === 0 && !isLoading;

  return {
    // Form state
    formData,
    errors,
    isLoading,
    canSubmit,

    // Allocation state
    currentAllocations,

    // Payer data
    uniquePayers,
    paycheckStats,
    selectedPayerStats,

    // Form actions
    updateFormField,
    applyPayerPrediction,
    processPaycheck,
    resetForm,
    validateForm,

    // Helper functions
    getPayerData,

    // Computed values
    hasAmount: Boolean(formData.amount && parseFloat(formData.amount) > 0),
    hasAllocations: currentAllocations.allocations.length > 0,
    allocationPreview: currentAllocations,
  };
};

export default usePaycheckProcessor;
