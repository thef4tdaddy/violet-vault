import { useState, useEffect, useRef, useMemo } from "react";
import { globalToast } from "../../stores/ui/toastStore";
import {
  getUniquePayers,
  getPayerPrediction,
  calculatePaycheckAllocation,
} from "../../utils/budgeting/paycheckAllocationUtils";
import logger from "../../utils/common/logger";

/**
 * Hook to initialize new payer state for first-time users
 */
const useInitializeNewPayerState = (
  uniquePayersLength: number,
  setShowAddNewPayer: (value: boolean) => void,
  initialRender: React.MutableRefObject<boolean>
) => {
  useEffect(() => {
    if (initialRender.current) {
      const hasNoPaychecks = uniquePayersLength === 0;
      setShowAddNewPayer(hasNoPaychecks);
      initialRender.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setShowAddNewPayer is stable setState
  }, [uniquePayersLength, initialRender]); // setState functions are stable, safe to omit from deps
};

/**
 * Custom hook for paycheck form state management
 * Handles all form-related state and logic
 */
export const usePaycheckForm = ({
  paycheckHistory,
  currentUser,
  onProcessPaycheck,
  envelopes = [],
}: {
  paycheckHistory: unknown[];
  currentUser: { userName?: string };
  onProcessPaycheck: (data: {
    amount: number;
    payerName: string;
    mode: string;
    date: string;
    envelopeAllocations: Array<{ envelopeId: string; amount: number }>;
    allocationSummary?: unknown;
    allocationDebug?: unknown;
    leftoverAmount: number;
  }) => Promise<unknown>;
  envelopes?: unknown[];
}) => {
  // Form state
  const [paycheckAmount, setPaycheckAmount] = useState("");
  const [payerName, setPayerName] = useState(currentUser?.userName || "");
  const [allocationMode, setAllocationMode] = useState("allocate");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Payer management state
  const [newPayerName, setNewPayerName] = useState("");
  const [tempPayers, setTempPayers] = useState<string[]>([]);
  const [showAddNewPayer, setShowAddNewPayer] = useState(false);

  const initialRender = useRef(true);

  // Computed values
  const uniquePayers = getUniquePayers(paycheckHistory, tempPayers);

  // Initialize add new payer state for new users
  useInitializeNewPayerState(uniquePayers.length, setShowAddNewPayer, initialRender);

  // Form handlers
  const handlePayerChange = (selectedPayer: string) => {
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

  const addNewPayerToList = (trimmedName: string) => {
    // Add to temp payers list so it shows in dropdown (session-only, not persisted)
    setTempPayers((prev) => [...prev, trimmedName]);
    // Set as current selection
    setPayerName(trimmedName);
    setNewPayerName("");
    // Hide the add new payer form and show dropdown
    setShowAddNewPayer(false);
  };

  const handleAmountChange = (value: string) => {
    setPaycheckAmount(value);
    setShowPreview(false);
  };

  const handleProcessPaycheck = async () => {
    const amount = parseFloat(paycheckAmount);
    if (!amount || amount <= 0 || !payerName.trim()) return;

    setIsProcessing(true);

    try {
      const allocationPreview = calculatePaycheckAllocation(amount, allocationMode, envelopes);
      const envelopeAllocations: Array<{ envelopeId: string; amount: number }> =
        allocationPreview?.mode === "allocate"
          ? Object.entries(allocationPreview.allocations || {}).map(([envelopeId, allocation]) => ({
              envelopeId,
              amount: Math.round(Number(allocation || 0) * 100) / 100,
            }))
          : [];

      const totalAllocated = envelopeAllocations.reduce((sum, allocation) => {
        return sum + allocation.amount;
      }, 0);

      const leftoverAmount =
        allocationPreview?.mode === "allocate" ? Math.max(0, amount - totalAllocated) : amount;

      const allocationDebug =
        allocationPreview && allocationPreview.mode === "allocate"
          ? (allocationPreview as { debugInfo?: unknown }).debugInfo
          : undefined;

      const result = await onProcessPaycheck({
        amount,
        payerName: payerName.trim(),
        mode: allocationMode,
        date: new Date().toISOString(),
        envelopeAllocations,
        allocationSummary: allocationPreview?.summary,
        allocationDebug,
        leftoverAmount,
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

  const handlePostProcessCleanup = (processedPayerName: string) => {
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
  const allocationPreview = useMemo(() => {
    const amount = parseFloat(paycheckAmount);
    if (!amount || amount <= 0) {
      return null;
    }

    return calculatePaycheckAllocation(amount, allocationMode, envelopes);
  }, [paycheckAmount, allocationMode, envelopes]);

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
    getPayerPrediction: (payer: string) => getPayerPrediction(payer, paycheckHistory),

    // Preview data
    allocationPreview,
  };
};
