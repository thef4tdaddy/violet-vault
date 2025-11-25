import React, { useState, useEffect, useRef, useMemo } from "react";
import { globalToast } from "../../stores/ui/toastStore";
import {
  getUniquePayers,
  getPayerPrediction,
  calculatePaycheckAllocation,
} from "../../utils/budgeting/paycheckAllocationUtils";
import logger from "../../utils/common/logger";
import type { PaycheckHistory } from "@/db/types";

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
// eslint-disable-next-line max-lines-per-function -- Complex hook managing form state, validation, and paycheck processing logic
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
  const uniquePayers = getUniquePayers(paycheckHistory as PaycheckHistory[], tempPayers);

  // Initialize add new payer state for new users
  useInitializeNewPayerState(uniquePayers.length, setShowAddNewPayer, initialRender);

  // Form handlers
  const handlePayerChange = (selectedPayer: string) => {
    setPayerName(selectedPayer);
    const prediction = getPayerPrediction(selectedPayer, paycheckHistory as PaycheckHistory[]);
    if (prediction && !paycheckAmount) {
      setPaycheckAmount(prediction.mostRecent.toString());
    }
  };

  const addNewPayerToList = (trimmedName: string) => {
    setTempPayers((prev) => [...prev, trimmedName]);
    setPayerName(trimmedName);
    setNewPayerName("");
    setShowAddNewPayer(false);
  };

  const handleAddNewPayer = () => {
    if (newPayerName.trim()) {
      addNewPayerToList(newPayerName.trim());
    }
  };

  const handleAmountChange = (value: string) => {
    setPaycheckAmount(value);
    setShowPreview(false);
  };

  const calculateEnvelopeAllocations = (
    allocationPreview: ReturnType<typeof calculatePaycheckAllocation>
  ): Array<{ envelopeId: string; amount: number }> => {
    if (allocationPreview?.mode !== "allocate") return [];
    return Object.entries(allocationPreview.allocations || {}).map(([envelopeId, allocation]) => ({
      envelopeId,
      amount: Math.round(Number(allocation || 0) * 100) / 100,
    }));
  };

  const processPaycheckData = async (amount: number) => {
    const allocationPreview = calculatePaycheckAllocation(
      amount,
      allocationMode,
      envelopes as Array<{
        id: string;
        name: string;
        category: string;
        archived: boolean;
        lastModified: number;
        [key: string]: unknown;
      }>
    );
    const envelopeAllocations = calculateEnvelopeAllocations(allocationPreview);
    const totalAllocated = envelopeAllocations.reduce(
      (sum, allocation) => sum + allocation.amount,
      0
    );
    const leftoverAmount =
      allocationPreview?.mode === "allocate" ? Math.max(0, amount - totalAllocated) : amount;
    const allocationDebug =
      allocationPreview && allocationPreview.mode === "allocate"
        ? (allocationPreview as { debugInfo?: unknown }).debugInfo
        : undefined;

    return {
      envelopeAllocations,
      leftoverAmount,
      allocationSummary: allocationPreview?.summary,
      allocationDebug,
    };
  };

  const handleProcessPaycheck = async () => {
    const amount = parseFloat(paycheckAmount);
    if (!amount || amount <= 0 || !payerName.trim()) return;

    setIsProcessing(true);

    try {
      const { envelopeAllocations, leftoverAmount, allocationSummary, allocationDebug } =
        await processPaycheckData(amount);

      const result = await onProcessPaycheck({
        amount,
        payerName: payerName.trim(),
        mode: allocationMode,
        date: new Date().toISOString(),
        envelopeAllocations,
        allocationSummary,
        allocationDebug,
        leftoverAmount,
      });

      logger.debug("Paycheck processed:", result as Record<string, unknown>);
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
    setTempPayers((prev) => prev.filter((name) => name !== processedPayerName));
    setPaycheckAmount("");
    setShowPreview(false);
  };

  const resetForm = () => {
    setPaycheckAmount("");
    setShowPreview(false);
    setNewPayerName("");
  };

  type EnvelopeType = {
    id: string;
    name: string;
    category: string;
    archived: boolean;
    lastModified: number;
    [key: string]: unknown;
  };

  const allocationPreview = useMemo(() => {
    const amount = parseFloat(paycheckAmount);
    if (!amount || amount <= 0) return null;
    return calculatePaycheckAllocation(amount, allocationMode, envelopes as EnvelopeType[]);
  }, [paycheckAmount, allocationMode, envelopes]);

  const canSubmit = paycheckAmount && payerName.trim() && !isProcessing;
  const getPayerPredictionHelper = (payer: string) =>
    getPayerPrediction(payer, paycheckHistory as PaycheckHistory[]);

  return {
    paycheckAmount,
    payerName,
    allocationMode,
    isProcessing,
    showPreview,
    canSubmit,
    uniquePayers,
    newPayerName,
    showAddNewPayer,
    setPaycheckAmount: handleAmountChange,
    setPayerName,
    setAllocationMode,
    setNewPayerName,
    setShowPreview,
    setShowAddNewPayer,
    handlePayerChange,
    handleAddNewPayer,
    handleProcessPaycheck,
    resetForm,
    getPayerPrediction: getPayerPredictionHelper,
    allocationPreview,
  };
};
