import {
  AUTO_CLASSIFY_ENVELOPE_TYPE,
  BILL_CATEGORIES,
  ENVELOPE_TYPES,
} from "../../constants/categories";
import { BIWEEKLY_MULTIPLIER, convertToBiweekly } from "../../constants/frequency";
import logger from "../common/logger";
import type { Envelope } from "@/db/types";
import type { PaycheckHistory } from "@/db/types";

/**
 * Calculate paycheck allocation across envelopes
 * Pure function for calculating how to distribute paycheck funds
 */
export const calculatePaycheckAllocation = (
  amount: string | number,
  allocationMode: string,
  envelopes: Envelope[]
) => {
  const numAmount = parseFloat(String(amount)) || 0;
  if (numAmount <= 0) return null;

  if (allocationMode === "leftover") {
    return {
      mode: "leftover",
      totalAmount: numAmount,
      allocations: {} as Record<string, number>,
      leftoverAmount: numAmount,
      summary: `All $${numAmount.toFixed(2)} will go to unassigned cash`,
    };
  }

  return calculateEnvelopeAllocations(numAmount, envelopes);
};

/**
 * Calculate allocations to envelopes based on their funding needs
 */
const calculateEnvelopeAllocations = (amount: number, envelopes: Envelope[]) => {
  let remainingAmount = amount;
  const allocations = {} as Record<string, number>;
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
const filterBillEnvelopes = (envelopes: Envelope[]) => {
  return envelopes
    .map((envelope) => ({
      envelope,
      resolvedType: resolveEnvelopeType(envelope),
    }))
    .filter(
      ({ envelope, resolvedType }) =>
        isAutoAllocateEnabled(envelope) &&
        (resolvedType === ENVELOPE_TYPES.BILL ||
          (BILL_CATEGORIES as readonly string[]).includes(envelope.category.trim()))
    )
    .map(({ envelope }) => envelope);
};

/**
 * Filter envelopes to variable types with auto-allocate enabled
 */
const filterVariableEnvelopes = (envelopes: Envelope[]) => {
  return envelopes
    .map((envelope) => ({
      envelope,
      resolvedType: resolveEnvelopeType(envelope),
      monthlyBudget: resolveMonthlyBudget(envelope),
    }))
    .filter(
      ({ envelope, resolvedType, monthlyBudget }) =>
        isAutoAllocateEnabled(envelope) &&
        resolvedType === ENVELOPE_TYPES.VARIABLE &&
        monthlyBudget > 0
    )
    .map(({ envelope, monthlyBudget }) => ({
      ...envelope,
      monthlyBudget,
    }));
};

/**
 * Calculate allocation for a bill envelope
 */
const calculateBillEnvelopeAllocation = (envelope: Envelope, remainingAmount: number) => {
  const biweeklyAllocation = resolveBiweeklyAllocation(envelope);
  const currentBalance = toNumber(envelope.currentBalance) || 0;
  const needed = Math.max(0, biweeklyAllocation - currentBalance);
  const allocation = Math.min(needed, remainingAmount);

  logger.debug(`Bill envelope allocation: ${envelope.name}`, {
    biweeklyAllocation,
    currentBalance,
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
  envelope: Envelope & { monthlyBudget?: number },
  remainingAmount: number
) => {
  const monthlyBudget = resolveMonthlyBudget(envelope);
  const biweeklyTarget = monthlyBudget / BIWEEKLY_MULTIPLIER;
  const currentBalance = toNumber(envelope.currentBalance) || 0;
  const needed = Math.max(0, biweeklyTarget - currentBalance);
  const allocation = Math.min(needed, remainingAmount);

  logger.debug(`Variable envelope allocation: ${envelope.name}`, {
    monthlyBudget,
    biweeklyTarget,
    currentBalance,
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
  envelopes: Envelope[],
  billEnvelopes: Envelope[],
  variableEnvelopes: (Envelope & { monthlyBudget?: number })[]
) => {
  logger.debug("Paycheck allocation debug", {
    totalEnvelopes: envelopes.length,
    envelopesReceived: envelopes,
    billEnvelopesFound: billEnvelopes.length,
    variableEnvelopesFound: variableEnvelopes.length,
    billEnvelopes: billEnvelopes.map((e) => ({
      id: e.id,
      name: e.name,
      autoAllocate: isAutoAllocateEnabled(e),
      envelopeType: resolveEnvelopeType(e),
      category: e.category,
      biweeklyAllocation: resolveBiweeklyAllocation(e),
      currentBalance: toNumber(e.currentBalance) || 0,
    })),
    variableEnvelopes: variableEnvelopes.map((e) => ({
      id: e.id,
      name: e.name,
      autoAllocate: isAutoAllocateEnabled(e),
      envelopeType: resolveEnvelopeType(e),
      monthlyBudget: resolveMonthlyBudget(e),
      currentBalance: toNumber(e.currentBalance) || 0,
    })),
  });
};

/**
 * Build final allocation result object
 */
const buildAllocationResult = (resultData: {
  amount: number;
  allocations: Record<string, number>;
  totalAllocated: number;
  remainingAmount: number;
  billEnvelopes: Envelope[];
  variableEnvelopes: (Envelope & { monthlyBudget?: number })[];
  envelopes: Envelope[];
}) => {
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
      autoAllocateEnvelopes: envelopes.filter((e) => isAutoAllocateEnabled(e)).length,
    },
  };
};

const isAutoAllocateEnabled = (envelope: Envelope) => {
  if (envelope.autoAllocate === false) {
    return false;
  }
  if (envelope.autoAllocate === true) {
    return true;
  }
  // Default behaviour: envelopes are auto-allocating unless explicitly disabled
  return true;
};

const resolveEnvelopeType = (envelope: Envelope) => {
  // If it's a special type (goal, liability, supplemental), use it
  if (envelope.type !== "standard") {
    return envelope.type;
  }

  // Fallback to auto-classification based on category
  if (envelope.category.trim() !== "") {
    return AUTO_CLASSIFY_ENVELOPE_TYPE(envelope.category);
  }

  return ENVELOPE_TYPES.VARIABLE;
};

const resolveMonthlyBudget = (envelope: Envelope) => {
  if (envelope.type === "standard") {
    return envelope.monthlyBudget || 0;
  }
  if (envelope.type === "goal") {
    return envelope.monthlyContribution || envelope.targetAmount || 0;
  }
  if (envelope.type === "liability") {
    return envelope.amount || envelope.minimumPayment || 0;
  }
  return 0;
};

const resolveBiweeklyAllocation = (envelope: Envelope) => {
  if (envelope.type === "standard" && envelope.biweeklyAllocation !== undefined) {
    return envelope.biweeklyAllocation;
  }

  const monthlyBudget = resolveMonthlyBudget(envelope);
  if (monthlyBudget > 0) {
    return Math.round(convertToBiweekly(monthlyBudget) * 100) / 100;
  }

  return 0;
};

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

/**
 * Get smart prediction for a specific payer based on history
 */
export const getPayerPrediction = (payer: string, paycheckHistory: PaycheckHistory[]) => {
  const payerPaychecks = paycheckHistory
    .filter((p) => p.payerName === payer && p.amount > 0)
    .slice(0, 5) // Last 5 paychecks
    .map((p) => p.amount);

  if (payerPaychecks.length === 0) return null;

  const average = payerPaychecks.reduce((sum, amount) => sum + amount, 0) / payerPaychecks.length;
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
export const getUniquePayers = (paycheckHistory: PaycheckHistory[], tempPayers: string[] = []) => {
  const payers = new Set<string>();

  // Add payers from history (permanently saved and synced)
  paycheckHistory.forEach((paycheck) => {
    if (paycheck.payerName && paycheck.payerName.trim()) {
      payers.add(paycheck.payerName);
    }
  });

  // Add temporary payers from current session
  tempPayers.forEach((payer) => {
    if (payer && payer.trim()) {
      payers.add(payer);
    }
  });

  return Array.from(payers).sort();
};
