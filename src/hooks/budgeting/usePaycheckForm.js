import { useState, useEffect, useRef } from "react";
import { globalToast } from "../../stores/ui/toastStore";
import {
  getUniquePayers,
  getPayerPrediction,
} from "../../utils/budgeting/paycheckAllocationUtils";
import logger from "../../utils/common/logger";

/**
 * Hook to initialize new payer state for first-time users
 */
const useInitializeNewPayerState = (
  uniquePayersLength,
  setShowAddNewPayer,
  initialRender,
) => {
  useEffect(() => {
    if (initialRender.current) {
      const hasNoPaychecks = uniquePayersLength === 0;
      setShowAddNewPayer(hasNoPaychecks);
      initialRender.current = false;
    }
  }, [uniquePayersLength, setShowAddNewPayer, initialRender]);
};

/**
 * Custom hook for paycheck form state management
 * Handles all form-related state and logic
 */
export const usePaycheckForm = ({
  paycheckHistory,
  currentUser,
  onProcessPaycheck,
}) => {
  // Form state
  const [paycheckAmount, setPaycheckAmount] = useState("");
  const [payerName, setPayerName] = useState(currentUser?.userName || "");
  const [allocationMode, setAllocationMode] = useState("allocate");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Payer management state
  const [newPayerName, setNewPayerName] = useState("");
  const [tempPayers, setTempPayers] = useState([]);
  const [showAddNewPayer, setShowAddNewPayer] = useState(false);

  const initialRender = useRef(true);

  // Computed values
  const uniquePayers = getUniquePayers(paycheckHistory, tempPayers);

  // Initialize add new payer state for new users
  useInitializeNewPayerState(
    uniquePayers.length,
    setShowAddNewPayer,
    initialRender,
  );

  // Form handlers
  const handlePayerChange = (selectedPayer) => {
    setPayerName(selectedPayer);

    // Smart prediction: suggest the most recent paycheck amount for this payer
    const prediction = getPayerPrediction(selectedPayer, paycheckHistory);
    if (prediction && !paycheckAmount) {
      setPaycheckAmount(prediction.mostRecent.toString());
    }
  };

  const handleAddNewPayer = () => {
    if (newPayerName.trim()) {
      addNewPayerToList(newPayerName.trim());
    }
  };

  const addNewPayerToList = (trimmedName) => {
    // Add to temp payers list so it shows in dropdown (session-only, not persisted)
    setTempPayers((prev) => [...prev, trimmedName]);
    // Set as current selection
    setPayerName(trimmedName);
    setNewPayerName("");
    // Hide the add new payer form and show dropdown
    setShowAddNewPayer(false);
  };

  const handleAmountChange = (value) => {
    setPaycheckAmount(value);
    setShowPreview(false);
  };

  const handleProcessPaycheck = async () => {
    const amount = parseFloat(paycheckAmount);
    if (!amount || amount <= 0 || !payerName.trim()) return;

    setIsProcessing(true);

    try {
      const result = await onProcessPaycheck({
        amount,
        payerName: payerName.trim(),
        mode: allocationMode,
        date: new Date().toISOString(),
      });

      logger.debug("Paycheck processed:", result);
      handlePostProcessCleanup(payerName.trim());
      globalToast.showSuccess("Paycheck processed successfully!");
    } catch (error) {
      logger.error("Failed to process paycheck:", error);
      globalToast.showError("Failed to process paycheck. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePostProcessCleanup = (processedPayerName) => {
    // Clean up temp payers - once a paycheck is processed, the payer is now in history
    setTempPayers((prev) => prev.filter((name) => name !== processedPayerName));
    setPaycheckAmount("");
    setShowPreview(false);
  };

  const resetForm = () => {
    setPaycheckAmount("");
    setShowPreview(false);
    setNewPayerName("");
  };

  // Validation
  const canSubmit = paycheckAmount && payerName.trim() && !isProcessing;

  return {
    // Form state
    paycheckAmount,
    payerName,
    allocationMode,
    isProcessing,
    showPreview,
    canSubmit,

    // Payer state
    uniquePayers,
    newPayerName,
    showAddNewPayer,

    // Form handlers
    setPaycheckAmount: handleAmountChange,
    setPayerName,
    setAllocationMode,
    setNewPayerName,
    setShowPreview,
    setShowAddNewPayer,

    // Actions
    handlePayerChange,
    handleAddNewPayer,
    handleProcessPaycheck,
    resetForm,

    // Utilities
    getPayerPrediction: (payer) => getPayerPrediction(payer, paycheckHistory),
  };
};
