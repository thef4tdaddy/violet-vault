import type { Envelope } from "@/db/types";

export interface PreviewData {
  totalAmount: number;
  summary: string;
  mode: string;
  allocations: Record<string, number>;
  leftoverAmount: number;
  debugInfo?: {
    totalEnvelopes: number;
    autoAllocateEnvelopes: number;
    billEnvelopesFound: number;
    variableEnvelopesFound: number;
    allocatedEnvelopes: number;
  };
}

/**
 * Maps allocation results to the PreviewData format for the UI
 */
export const calculateAllocationPreview = (
  amount: string | number,
  allocationMode: string,
  allocations: {
    allocations: Array<{
      envelopeId: string;
      amount: number;
      envelopeType: string;
    }>;
    remainingAmount: number;
  },
  envelopes: Envelope[]
): PreviewData => {
  const results = allocations;
  const allocationMap: Record<string, number> = {};
  results.allocations.forEach((a) => {
    allocationMap[a.envelopeId] = a.amount;
  });

  const autoAllocateCount = results.allocations.filter((a) => a.amount > 0).length;

  return {
    totalAmount: parseFloat(String(amount)) || 0,
    summary: `Allocating funds across ${autoAllocateCount} envelopes based on priorities and monthly targets.`,
    mode: allocationMode,
    allocations: allocationMap,
    leftoverAmount: results.remainingAmount,
    debugInfo: {
      totalEnvelopes: envelopes.length,
      autoAllocateEnvelopes: envelopes.filter((e) => e.autoAllocate).length,
      billEnvelopesFound: results.allocations.filter(
        (a) => a.envelopeType === "bill" && a.amount > 0
      ).length,
      variableEnvelopesFound: results.allocations.filter(
        (a) => a.envelopeType !== "bill" && a.amount > 0
      ).length,
      allocatedEnvelopes: autoAllocateCount,
    },
  };
};

import type { PaycheckPrediction } from "@/utils/domain/budgeting/paycheckUtils";

/**
 * Maps payer prediction to the format expected by the UI
 */
export const mapPayerPredictionForUI = (prediction: PaycheckPrediction | null) => {
  if (!prediction) return null;
  return {
    average: prediction.amount,
    mostRecent: prediction.mostRecent,
    count: prediction.sampleSize,
  };
};
