import { useState, useEffect, useCallback } from "react";
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

interface ErrorRecord {
  [key: string]: string;
}

interface AllocationItem {
  envelopeId: string;
  envelopeName: string;
  amount: number;
  monthlyAmount: number;
  envelopeType: string;
  [key: string]: unknown;
}

interface AllocationResult {
  allocations: AllocationItem[];
  totalAllocated: number;
  remainingAmount: number;
  allocationRate: number;
  [key: string]: unknown;
}

interface PaycheckFormData {
  amount: string;
  payerName: string;
  allocationMode: string;
  [key: string]: string;
}

// Helper to clear field error when updated
const clearFieldError = (
  field: string,
  errors: ErrorRecord,
  setErrors: React.Dispatch<React.SetStateAction<ErrorRecord>>
): void => {
  if (errors[field]) {
    setErrors((prevErrors: ErrorRecord) => {
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
  setErrors: React.Dispatch<React.SetStateAction<ErrorRecord>>
): boolean => {
  const validation = validateFormAndAllocationsUtil(
    formData as never,
    currentAllocations as never,
    validatePaycheckForm as never,
    validateAllocations as never
  );
  setErrors(validation.errors as ErrorRecord);
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
}: {
  envelopes?: Array<Record<string, unknown>>;
  paycheckHistory?: Array<Record<string, unknown>>;
  onAddPaycheck: (paycheck: unknown) => Promise<void>;
  currentUser?: { userName: string };
}) => {
  // Form state
  const [formData, setFormData] = useState<PaycheckFormData>({
    amount: "",
    payerName: "",
    allocationMode: "allocate",
  });

  const [errors, setErrors] = useState<ErrorRecord>({});
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
        envelopes as never,
        formData.allocationMode
      );
      setCurrentAllocations(allocations as unknown as AllocationResult);
    } else {
      setCurrentAllocations(getDefaultAllocations());
    }
  }, [formData.amount, formData.allocationMode, envelopes]);

  // Form field update handler
  const updateFormField = useCallback(
    (field: string, value: string) => {
      setFormData((prev) => {
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
      return getPayerPrediction(payerName, paycheckHistory as never);
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
        currentAllocations as never,
        currentUser
      );

      // Process the paycheck
      await onAddPaycheck(paycheckTransaction);

      // Add payer to temp list if new
      if (
        formData.payerName &&
        !getUniquePayers(paycheckHistory as never).includes(formData.payerName)
      ) {
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

  // Get unique payers for dropdown
  const uniquePayers = getUniquePayers(paycheckHistory as never, tempPayers);

  // Get paycheck statistics
  const paycheckStats = getPaycheckStatistics(paycheckHistory as never);
  const selectedPayerStats = formData.payerName
    ? getPaycheckStatistics(paycheckHistory as never, formData.payerName)
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
