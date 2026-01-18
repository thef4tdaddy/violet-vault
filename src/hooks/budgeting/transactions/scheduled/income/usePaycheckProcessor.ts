import { useState, useCallback, useMemo } from "react";
import { usePaycheckForm } from "./usePaycheckForm";
import { usePaycheckAllocations } from "./usePaycheckAllocations";
import {
  createPaycheckTransaction,
  getPayerPrediction,
  getPaycheckStatistics,
  type PaycheckTransaction,
} from "@/utils/domain/budgeting/paycheckUtils";
import { globalToast } from "@/stores/ui/toastStore";
import logger from "@/utils/core/common/logger";
import type { PaycheckHistory, Envelope } from "@/db/types";
import { calculateAllocationPreview, mapPayerPredictionForUI } from "./paycheckProcessorHelpers";

/**
 * Lean composition hook for paycheck processing
 * Orchestrates form state, allocations, and data persistence
 */
export const usePaycheckProcessor = ({
  envelopes = [],
  paycheckHistory = [],
  onAddPaycheck,
  currentUser = { userName: "User" },
}: {
  envelopes?: Envelope[];
  paycheckHistory?: PaycheckHistory[];
  onAddPaycheck: (paycheck: PaycheckTransaction) => Promise<boolean | void>;
  currentUser?: { userName: string };
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [newPayerName, setNewPayerName] = useState("");
  const [showAddNewPayer, setShowAddNewPayer] = useState(false);

  // 1. Form Handling
  const form = usePaycheckForm(paycheckHistory, currentUser);

  // 2. Allocation Math
  const allocations = usePaycheckAllocations(
    form.formData.amount,
    form.formData.allocationMode,
    envelopes
  );

  // 3. Predictions & Statistics
  const paycheckStats = useMemo(() => getPaycheckStatistics(paycheckHistory), [paycheckHistory]);

  const selectedPayerStats = useMemo(
    () =>
      form.formData.payerName
        ? getPaycheckStatistics(paycheckHistory, form.formData.payerName)
        : null,
    [paycheckHistory, form.formData.payerName]
  );

  const getPayerData = useCallback(
    (payerName: string) => {
      if (!payerName) return null;
      return getPayerPrediction(payerName, paycheckHistory);
    },
    [paycheckHistory]
  );

  const applyPayerPrediction = useCallback(
    (payerName: string) => {
      const prediction = getPayerData(payerName);
      if (prediction) {
        form.updateFormField("amount", prediction.amount.toString());
        globalToast.showInfo(
          `Applied prediction: $${prediction.amount} (${prediction.confidence}% confidence)`,
          "Payer Prediction"
        );
      }
    },
    [getPayerData, form]
  );

  // 4. Processing Action
  const processPaycheck = useCallback(async () => {
    try {
      setIsLoading(true);

      // Validate
      if (!form.validateForm(allocations.currentAllocations)) {
        globalToast.showError("Please fix the form errors before processing", "Validation Error");
        return false;
      }

      // Create
      const paycheckTransaction = createPaycheckTransaction(
        form.formData,
        allocations.currentAllocations,
        currentUser
      );

      // Persistence
      await onAddPaycheck(paycheckTransaction);

      // UI Updates
      if (form.formData.payerName && !form.uniquePayers.includes(form.formData.payerName)) {
        form.setTempPayers((prev) => [...prev, form.formData.payerName]);
      }

      form.resetForm();
      setShowPreview(false);
      globalToast.showSuccess(
        `Paycheck processed: $${paycheckTransaction.amount}`,
        "Paycheck Added"
      );

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to process paycheck";
      logger.error("Error processing paycheck", error);
      globalToast.showError(errorMessage, "Processing Error");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [form, allocations, currentUser, onAddPaycheck]);

  // Specific mapping for UI component expectations
  const getPayerPredictionForUI = useCallback(
    (payerName: string) => mapPayerPredictionForUI(getPayerData(payerName)),
    [getPayerData]
  );

  const handleAddNewPayer = useCallback(() => {
    if (newPayerName.trim()) {
      form.updateFormField("payerName", newPayerName.trim());
      setShowAddNewPayer(false);
      setNewPayerName("");
    }
  }, [newPayerName, form]);

  // Map to PreviewData for UI compatibility
  const allocationPreview = useMemo(
    () =>
      calculateAllocationPreview(
        form.formData.amount,
        form.formData.allocationMode,
        allocations.currentAllocations,
        envelopes
      ),
    [allocations.currentAllocations, form.formData.amount, form.formData.allocationMode, envelopes]
  );

  // Derived Values for UI
  const canSubmit = useMemo(
    () =>
      form.formData.amount &&
      form.formData.payerName &&
      Object.keys(form.errors).length === 0 &&
      !isLoading,
    [form.formData, form.errors, isLoading]
  );

  return {
    // Form & State
    formData: form.formData,
    errors: form.errors,
    isLoading,
    canSubmit,

    // Allocations
    currentAllocations: allocations.currentAllocations,
    hasAllocations: allocations.hasAllocations,

    // Metadata
    uniquePayers: form.uniquePayers,
    paycheckStats,
    selectedPayerStats,

    // Actions
    updateFormField: form.updateFormField,
    applyPayerPrediction,
    processPaycheck,
    resetForm: form.resetForm,
    validateForm: form.validateForm,
    getPayerData,

    // Standard interface for PaycheckProcessor.tsx compatibility (if needed)
    paycheckAmount: form.formData.amount,
    setPaycheckAmount: (val: string) => form.updateFormField("amount", val),
    payerName: form.formData.payerName,
    setPayerName: (val: string) => form.updateFormField("payerName", val),
    allocationMode: form.formData.allocationMode as "allocate" | "leftover",
    setAllocationMode: (val: string) => form.updateFormField("allocationMode", val),
    isProcessing: isLoading,
    showPreview,
    setShowPreview,
    allocationPreview,
    handleProcessPaycheck: processPaycheck,
    newPayerName,
    setNewPayerName,
    showAddNewPayer,
    setShowAddNewPayer,
    handlePayerChange: (payer: string) => form.updateFormField("payerName", payer),
    handleAddNewPayer,
    getPayerPrediction: getPayerPredictionForUI,
  };
};

export default usePaycheckProcessor;
