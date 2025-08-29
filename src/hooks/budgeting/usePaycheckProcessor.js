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

/**
 * Custom hook for managing paycheck processing state and operations
 * Handles form validation, allocations, and paycheck transactions
 */
const usePaycheckProcessor = ({
  envelopes = [],
  paycheckHistory = [],
  onAddPaycheck,
  currentUser = { userName: "User" },
}) => {
  // Form state
  const [formData, setFormData] = useState({
    amount: "",
    payerName: "",
    allocationMode: "allocate",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [tempPayers, setTempPayers] = useState([]);

  // Paycheck processing state
  const [currentAllocations, setCurrentAllocations] = useState({
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
        envelopes,
        formData.allocationMode,
      );
      setCurrentAllocations(allocations);
    } else {
      setCurrentAllocations({
        allocations: [],
        totalAllocated: 0,
        remainingAmount: 0,
        allocationRate: 0,
      });
    }
  }, [formData.amount, formData.allocationMode, envelopes]);

  // Form field update handler
  const updateFormField = useCallback((field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Clear field error when updated
      if (errors[field]) {
        setErrors((prevErrors) => {
          const { [field]: _removed, ...remainingErrors } = prevErrors;
          return remainingErrors;
        });
      }

      return newData;
    });
  }, [errors]);

  // Get payer prediction based on history
  const getPayerData = useCallback((payerName) => {
    if (!payerName) return null;
    return getPayerPrediction(payerName, paycheckHistory);
  }, [paycheckHistory]);

  // Apply payer prediction to form
  const applyPayerPrediction = useCallback((payerName) => {
    const prediction = getPayerData(payerName);
    if (prediction) {
      updateFormField("amount", prediction.amount.toString());
      globalToast.showInfo(
        `Applied prediction: $${prediction.amount} (${prediction.confidence}% confidence)`,
        "Payer Prediction"
      );
    }
  }, [getPayerData, updateFormField]);

  // Validate current form
  const validateForm = useCallback(() => {
    const validation = validatePaycheckForm(formData);
    setErrors(validation.errors);

    // Also validate allocations if form is valid
    if (validation.isValid && currentAllocations.allocations.length > 0) {
      const allocationValidation = validateAllocations(
        currentAllocations.allocations,
        parseFloat(formData.amount)
      );
      if (!allocationValidation.isValid) {
        setErrors(prev => ({
          ...prev,
          allocations: allocationValidation.message
        }));
        return false;
      }
    }

    return validation.isValid;
  }, [formData, currentAllocations]);

  // Process paycheck
  const processPaycheck = useCallback(async () => {
    try {
      setIsLoading(true);

      // Validate form
      if (!validateForm()) {
        globalToast.showError(
          "Please fix the form errors before processing",
          "Validation Error"
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
      if (formData.payerName && !getUniquePayers(paycheckHistory).includes(formData.payerName)) {
        setTempPayers(prev => [...prev, formData.payerName]);
      }

      // Reset form
      resetForm();

      globalToast.showSuccess(
        `Paycheck processed: $${paycheckTransaction.amount}`,
        "Paycheck Added"
      );

      return true;
    } catch (error) {
      logger.error("Error processing paycheck", error);
      globalToast.showError(
        error.message || "Failed to process paycheck",
        "Processing Error"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [formData, currentAllocations, currentUser, onAddPaycheck, paycheckHistory, validateForm]);

  // Reset form to default state
  const resetForm = useCallback(() => {
    setFormData({
      amount: "",
      payerName: "",
      allocationMode: "allocate",
    });
    setErrors({});
    setCurrentAllocations({
      allocations: [],
      totalAllocated: 0,
      remainingAmount: 0,
      allocationRate: 0,
    });
  }, []);

  // Get unique payers for dropdown
  const uniquePayers = getUniquePayers(paycheckHistory, tempPayers);

  // Get paycheck statistics
  const paycheckStats = getPaycheckStatistics(paycheckHistory);
  const selectedPayerStats = formData.payerName 
    ? getPaycheckStatistics(paycheckHistory, formData.payerName)
    : null;

  // Check if form can be submitted
  const canSubmit = 
    formData.amount && 
    formData.payerName && 
    Object.keys(errors).length === 0 && 
    !isLoading;

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