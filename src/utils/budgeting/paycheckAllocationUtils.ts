import { BILL_CATEGORIES, ENVELOPE_TYPES } from "@/constants/categories";
import { BIWEEKLY_MULTIPLIER } from "@/constants/frequency";
import logger from "@/utils/common/logger";

// Type definitions
interface PaycheckEnvelope {
  id: string;
  name: string;
  autoAllocate?: boolean;
  envelopeType?: string;
  category?: string;
  currentBalance: number;
  biweeklyAllocation?: number;
  monthlyBudget?: number;
}

interface AllocationMap {
  [envelopeId: string]: number;
}

interface AllocationResult {
  mode: string;
  totalAmount: number;
  allocations: AllocationMap;
  totalAllocated?: number;
  leftoverAmount: number;
  summary: string;
  debugInfo?: {
    totalEnvelopes: number;
    billEnvelopesFound: number;
    variableEnvelopesFound: number;
    allocatedEnvelopes: number;
    autoAllocateEnvelopes: number;
  };
}

interface AllocationResultData {
  amount: number;
  allocations: AllocationMap;
  totalAllocated: number;
  remainingAmount: number;
  billEnvelopes: PaycheckEnvelope[];
  variableEnvelopes: PaycheckEnvelope[];
  envelopes: PaycheckEnvelope[];
}

interface PayerPrediction {
  average: number;
  mostRecent: number;
  count: number;
}

interface PaycheckRecord {
  payerName?: string;
  amount: number;
}

/**
 * Calculate paycheck allocation across envelopes
 * Pure function for calculating how to distribute paycheck funds
 */
export const calculatePaycheckAllocation = (
  amount: string | number,
  allocationMode: string,
  envelopes: PaycheckEnvelope[]
): AllocationResult | null => {
  const numAmount = parseFloat(String(amount)) || 0;
  if (numAmount <= 0) return null;

  if (allocationMode === "leftover") {
    return {
      mode: "leftover",
      totalAmount: numAmount,
      allocations: {},
      leftoverAmount: numAmount,
      summary: `All $${numAmount.toFixed(2)} will go to unassigned cash`,
    };
  }

  return calculateEnvelopeAllocations(numAmount, envelopes);
};

/**
 * Calculate allocations to envelopes based on their funding needs
 */
const calculateEnvelopeAllocations = (
  amount: number,
  envelopes: PaycheckEnvelope[]
): AllocationResult => {
  let remainingAmount = amount;
  const allocations: AllocationMap = {};
  let totalAllocated = 0;

  const billEnvelopes = filterBillEnvelopes(envelopes);
  const variableEnvelopes = filterVariableEnvelopes(envelopes);

  logAllocationDebug(envelopes, billEnvelopes, variableEnvelopes);

  // First, allocate to bill envelopes (higher priority)
  billEnvelopes.forEach((envelope) => {
    const allocation = calculateBillEnvelopeAllocation(envelope, remainingAmount);
    if (allocation > 0) {
      allocations[envelope.id] = allocation;
      remainingAmount -= allocation;
      totalAllocated += allocation;
    }
  });

  // Then, allocate to variable expense envelopes
  variableEnvelopes.forEach((envelope) => {
    const allocation = calculateVariableEnvelopeAllocation(envelope, remainingAmount);
    if (allocation > 0) {
      allocations[envelope.id] = allocation;
      remainingAmount -= allocation;
      totalAllocated += allocation;
    }
  });

  return buildAllocationResult({
    amount,
    allocations,
    totalAllocated,
    remainingAmount,
    billEnvelopes,
    variableEnvelopes,
    envelopes,
  });
};

/**
 * Filter envelopes to bill types with auto-allocate enabled
 */
const filterBillEnvelopes = (envelopes: PaycheckEnvelope[]): PaycheckEnvelope[] => {
  return envelopes.filter(
    (envelope: PaycheckEnvelope) =>
      envelope.autoAllocate &&
      (envelope.envelopeType === ENVELOPE_TYPES.BILL ||
        (envelope.category && (BILL_CATEGORIES as readonly string[]).includes(envelope.category)))
  );
};

/**
 * Filter envelopes to variable types with auto-allocate enabled
 */
const filterVariableEnvelopes = (envelopes: PaycheckEnvelope[]): PaycheckEnvelope[] => {
  return envelopes.filter(
    (envelope: PaycheckEnvelope) =>
      envelope.autoAllocate &&
      envelope.envelopeType === ENVELOPE_TYPES.VARIABLE &&
      (envelope.monthlyBudget ?? 0) > 0
  );
};

/**
 * Calculate allocation for a bill envelope
 */
const calculateBillEnvelopeAllocation = (
  envelope: PaycheckEnvelope,
  remainingAmount: number
): number => {
  const needed = Math.max(0, (envelope.biweeklyAllocation ?? 0) - envelope.currentBalance);
  const allocation = Math.min(needed, remainingAmount);

  logger.debug(`Bill envelope allocation: ${envelope.name}`, {
    biweeklyAllocation: envelope.biweeklyAllocation,
    currentBalance: envelope.currentBalance,
    needed,
    allocation,
    remainingAmount,
  });

  return allocation;
};

/**
 * Calculate allocation for a variable expense envelope
 */
const calculateVariableEnvelopeAllocation = (
  envelope: PaycheckEnvelope,
  remainingAmount: number
): number => {
  const biweeklyTarget = (envelope.monthlyBudget || 0) / BIWEEKLY_MULTIPLIER;
  const needed = Math.max(0, biweeklyTarget - envelope.currentBalance);
  const allocation = Math.min(needed, remainingAmount);

  logger.debug(`Variable envelope allocation: ${envelope.name}`, {
    monthlyBudget: envelope.monthlyBudget,
    biweeklyTarget,
    currentBalance: envelope.currentBalance,
    needed,
    allocation,
    remainingAmount,
  });

  return allocation;
};

/**
 * Log debug information for allocation process
 */
const logAllocationDebug = (
  envelopes: PaycheckEnvelope[],
  billEnvelopes: PaycheckEnvelope[],
  variableEnvelopes: PaycheckEnvelope[]
): void => {
  logger.debug("Paycheck allocation debug", {
    totalEnvelopes: envelopes.length,
    envelopesReceived: envelopes,
    billEnvelopesFound: billEnvelopes.length,
    variableEnvelopesFound: variableEnvelopes.length,
    billEnvelopes: billEnvelopes.map((e: PaycheckEnvelope) => ({
      id: e.id,
      name: e.name,
      autoAllocate: e.autoAllocate,
      envelopeType: e.envelopeType,
      category: e.category,
      biweeklyAllocation: e.biweeklyAllocation,
      currentBalance: e.currentBalance,
    })),
    variableEnvelopes: variableEnvelopes.map((e: PaycheckEnvelope) => ({
      id: e.id,
      name: e.name,
      autoAllocate: e.autoAllocate,
      envelopeType: e.envelopeType,
      monthlyBudget: e.monthlyBudget,
      currentBalance: e.currentBalance,
    })),
  });
};

/**
 * Build the final allocation result object
 */
const buildAllocationResult = (resultData: AllocationResultData): AllocationResult => {
  const {
    amount,
    allocations,
    totalAllocated,
    remainingAmount,
    billEnvelopes,
    variableEnvelopes,
    envelopes,
  } = resultData;
  const billCount = billEnvelopes.length;
  const variableCount = variableEnvelopes.length;
  const allocatedCount = Object.keys(allocations).length;

  logger.debug("Final allocation results", {
    totalAllocated,
    remainingAmount,
    allocations,
  });

  return {
    mode: "allocate",
    totalAmount: amount,
    allocations,
    totalAllocated,
    leftoverAmount: remainingAmount,
    summary: `$${totalAllocated.toFixed(2)} to ${allocatedCount} envelopes (${billCount} bills, ${variableCount} variable), $${remainingAmount.toFixed(2)} to unassigned`,
    debugInfo: {
      totalEnvelopes: envelopes.length,
      billEnvelopesFound: billCount,
      variableEnvelopesFound: variableCount,
      allocatedEnvelopes: allocatedCount,
      autoAllocateEnvelopes: envelopes.filter((e: PaycheckEnvelope) => e.autoAllocate).length,
    },
  };
};

/**
 * Get smart prediction for a specific payer based on history
 */
export const getPayerPrediction = (
  payer: string,
  paycheckHistory: PaycheckRecord[]
): PayerPrediction | null => {
  const payerPaychecks = paycheckHistory
    .filter((p: PaycheckRecord) => p.payerName === payer && p.amount > 0)
    .slice(0, 5) // Last 5 paychecks
    .map((p: PaycheckRecord) => p.amount);

  if (payerPaychecks.length === 0) return null;

  const average =
    payerPaychecks.reduce((sum: number, amount: number) => sum + amount, 0) / payerPaychecks.length;
  const mostRecent = payerPaychecks[0];

  return {
    average: Math.round(average * 100) / 100,
    mostRecent: mostRecent,
    count: payerPaychecks.length,
  };
};

/**
 * Get unique payers from paycheck history and temporary payers
 */
export const getUniquePayers = (
  paycheckHistory: PaycheckRecord[],
  tempPayers: string[] = []
): string[] => {
  const payers = new Set<string>();

  // Add payers from history (permanently saved and synced)
  paycheckHistory.forEach((paycheck: PaycheckRecord) => {
    if (paycheck.payerName && paycheck.payerName.trim()) {
      payers.add(paycheck.payerName);
    }
  });

  // Add temporary payers from current session
  tempPayers.forEach((payer: string) => {
    if (payer && payer.trim()) {
      payers.add(payer);
    }
  });

  return Array.from(payers).sort();
};
