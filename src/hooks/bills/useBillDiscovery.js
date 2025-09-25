import { useState, useEffect, useCallback } from "react";
import {
  createInitialEnvelopeMap,
  calculateSelectedBillsTotal,
  transformBillsForAdd,
} from "../../utils/bills/billDiscoveryHelpers";

/**
 * Custom hook for managing bill discovery logic
 * Extracted from BillDiscoveryModal to separate business logic from UI
 */
export const useBillDiscovery = ({
  isOpen,
  discoveredBills = [],
  onAddBills,
  onError,
}) => {
  const [selectedBills, setSelectedBills] = useState(new Set());
  const [billEnvelopeMap, setBillEnvelopeMap] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Pre-populate envelope suggestions when modal opens
  useEffect(() => {
    if (isOpen && discoveredBills.length > 0) {
      setBillEnvelopeMap(createInitialEnvelopeMap(discoveredBills));
    }
  }, [isOpen, discoveredBills]);

  const toggleBillSelection = useCallback((billId) => {
    setSelectedBills((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(billId)) {
        newSet.delete(billId);
      } else {
        newSet.add(billId);
      }
      return newSet;
    });
  }, []);

  const updateBillEnvelope = useCallback((billId, envelopeId) => {
    setBillEnvelopeMap((prev) => ({
      ...prev,
      [billId]: envelopeId,
    }));
  }, []);

  const selectAllBills = useCallback(() => {
    const allIds = new Set(discoveredBills.map((b) => b.id));
    setSelectedBills(allIds);
  }, [discoveredBills]);

  const clearAllBills = useCallback(() => {
    setSelectedBills(new Set());
  }, []);

  const calculateEstimatedTotal = useCallback(() => {
    return calculateSelectedBillsTotal(discoveredBills, selectedBills);
  }, [discoveredBills, selectedBills]);

  const handleAddSelected = useCallback(async () => {
    if (selectedBills.size === 0) {
      onError?.("No bills selected");
      return false;
    }

    setIsProcessing(true);
    try {
      const billsToAdd = transformBillsForAdd(
        discoveredBills,
        selectedBills,
        billEnvelopeMap,
      );
      await onAddBills(billsToAdd);
      return true;
    } catch (error) {
      onError?.(error.message || "Failed to add discovered bills");
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [selectedBills, discoveredBills, billEnvelopeMap, onAddBills, onError]);

  return {
    selectedBills,
    billEnvelopeMap,
    isProcessing,
    toggleBillSelection,
    updateBillEnvelope,
    selectAllBills,
    clearAllBills,
    calculateEstimatedTotal,
    handleAddSelected,
  };
};