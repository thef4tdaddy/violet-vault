import { useMemo } from "react";
import { calculateEnvelopeAllocations } from "@/utils/domain/budgeting/paycheckUtils";

interface AllocationItem {
  envelopeId: string;
  envelopeName: string;
  amount: number;
  monthlyAmount: number;
  envelopeType: string;
  priority: string;
}

interface AllocationResult {
  allocations: AllocationItem[];
  totalAllocated: number;
  remainingAmount: number;
  allocationRate: number;
}

/**
 * Hook for managing paycheck allocation calculations
 * Refactored to use useMemo to avoid cascading renders
 */
import type { Envelope } from "@/db/types";

// ... (skipping some logic if needed, but I'll replace the whole signature)
export const usePaycheckAllocations = (
  amount: string | number,
  allocationMode: string,
  envelopes: Envelope[] = []
) => {
  // Use useMemo instead of useEffect+useState to avoid cascading renders
  const currentAllocations = useMemo((): AllocationResult => {
    const numericAmount = parseFloat(String(amount));

    if (numericAmount > 0) {
      return calculateEnvelopeAllocations(
        numericAmount,
        envelopes,
        allocationMode
      ) as unknown as AllocationResult;
    }

    return {
      allocations: [],
      totalAllocated: 0,
      remainingAmount: 0,
      allocationRate: 0,
    };
  }, [amount, allocationMode, envelopes]);

  const hasAllocations = useMemo(
    () => currentAllocations.allocations.length > 0,
    [currentAllocations.allocations]
  );

  return {
    currentAllocations,
    hasAllocations,
  };
};

export default usePaycheckAllocations;
