import { useState, useCallback, useEffect } from "react";
import type { DiscoveredBill } from "../BillDiscoveryModal";

export const useBillDiscoveryState = (
  discoveredBills: DiscoveredBill[] = [],
  isOpen: boolean = false
) => {
  const [selectedBills, setSelectedBills] = useState<Set<string>>(new Set());
  const [billEnvelopeMap, setBillEnvelopeMap] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Pre-populate envelope suggestions when modal opens
  useEffect(() => {
    if (isOpen && discoveredBills.length > 0) {
      const envelopeMap: Record<string, string> = {};
      discoveredBills.forEach((bill: DiscoveredBill) => {
        if (bill.suggestedEnvelopeId) {
          envelopeMap[bill.id] = bill.suggestedEnvelopeId;
        }
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBillEnvelopeMap(envelopeMap);
    }
  }, [isOpen, discoveredBills]);

  const toggleBillSelection = useCallback((billId: string) => {
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

  const updateBillEnvelope = useCallback((billId: string, envelopeId: string) => {
    setBillEnvelopeMap((prev) => ({
      ...prev,
      [billId]: envelopeId,
    }));
  }, []);

  const selectAll = useCallback(() => {
    const allIds = new Set(discoveredBills.map((b: DiscoveredBill) => b.id));
    setSelectedBills(allIds);
  }, [discoveredBills]);

  const clearAll = useCallback(() => {
    setSelectedBills(new Set());
  }, []);

  return {
    selectedBills,
    billEnvelopeMap,
    isProcessing,
    setIsProcessing,
    toggleBillSelection,
    updateBillEnvelope,
    selectAll,
    clearAll,
  };
};
