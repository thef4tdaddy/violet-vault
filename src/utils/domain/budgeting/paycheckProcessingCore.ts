/**
 * Pure Paycheck Processing Domain Logic
 * This module contains stateless, pure functions that calculate paycheck execution plans
 * without performing any side effects (no database operations, no state mutations)
 *
 * All functions here return execution plans that describe WHAT should happen,
 * not HOW it happens. The service layer handles the actual execution.
 */

import { v4 as uuidv4 } from "uuid";
import { calculatePaycheckBalances, validateBalances } from "@/utils/core/common/balanceCalculator";
import type {
  PaycheckExecutionPlan,
  CurrentBalances,
  PaycheckInput,
  EnvelopeAllocation,
  BalanceUpdate,
  TransactionCreationPlan,
  PaycheckRecordPlan,
} from "./paycheckProcessingTypes";

/**
 * Create a paycheck execution plan
 * This is the main entry point for paycheck processing domain logic
 *
 * @param paycheckData - Input data for the paycheck
 * @param currentBalances - Current system balances
 * @param timestamp - Optional timestamp for record creation (defaults to Date.now() if not provided)
 * @returns Execution plan describing all operations to perform
 */
export const createPaycheckExecutionPlan = (
  paycheckData: PaycheckInput,
  currentBalances: CurrentBalances,
  timestamp?: number
): PaycheckExecutionPlan => {
  // Generate unique ID for this paycheck
  const paycheckId = `paycheck_${uuidv4()}`;

  // Prepare allocations (these would come from input or be enriched later)
  const allocations = paycheckData.envelopeAllocations || [];

  // Validate input data
  const inputValidation = validatePaycheckInput(paycheckData);

  // Calculate new balances using centralized calculator
  const newBalances = calculatePaycheckBalances(currentBalances, paycheckData, allocations);

  // Validate the balance calculation
  const balanceValidation = validateBalances(newBalances);

  // Combine validations
  const combinedValidation = {
    isValid: inputValidation.isValid && balanceValidation.isValid,
    errors: [
      ...inputValidation.errors.map((msg) => ({
        type: "INPUT_VALIDATION",
        message: msg,
      })),
      ...balanceValidation.errors,
    ],
    warnings: balanceValidation.warnings,
  };

  // Create balance update plan
  const balanceUpdates: BalanceUpdate = {
    actualBalance: newBalances.actualBalance,
    unassignedCash: newBalances.unassignedCash,
  };

  // Create transaction creation plan
  const transactionCreation: TransactionCreationPlan = {
    paycheckId,
    amount: paycheckData.amount,
    payerName: paycheckData.payerName,
    notes: paycheckData.notes,
    allocations,
  };

  // Create paycheck record plan
  const paycheckRecord = createPaycheckRecordPlan({
    paycheckId,
    paycheckData,
    currentBalances,
    newBalances,
    allocations,
    timestamp,
  });

  return {
    paycheckId,
    balanceUpdates,
    envelopeAllocations: allocations,
    transactionCreation,
    paycheckRecord,
    validation: combinedValidation,
  };
};

/**
 * Create a plan for the paycheck record
 * Pure function that describes what the paycheck record should contain
 *
 * @param timestamp - Optional timestamp for record creation (defaults used in service layer if not provided)
 */
/**
 * Create a paycheck record plan
 * @param options - Configuration object with all required parameters
 * @returns Paycheck record plan (without transaction IDs)
 */
const createPaycheckRecordPlan = (options: {
  paycheckId: string;
  paycheckData: PaycheckInput;
  currentBalances: CurrentBalances;
  newBalances: { actualBalance: number; unassignedCash: number };
  allocations: EnvelopeAllocation[];
  timestamp?: number;
}): Omit<PaycheckRecordPlan, "incomeTransactionId" | "transferTransactionIds"> => {
  const { paycheckId, paycheckData, currentBalances, newBalances, allocations, timestamp } =
    options;

  // Create allocations map
  const allocationsMap: Record<string, number> = {};
  allocations.forEach((a) => {
    allocationsMap[a.envelopeId] = a.amount;
  });

  // Use provided timestamp or undefined (will be set by service layer)
  const now = timestamp ?? Date.now();

  return {
    id: paycheckId,
    date: new Date(now),
    amount: paycheckData.amount,
    payerName: paycheckData.payerName || "Unknown",
    lastModified: now,
    createdAt: now,
    type: "income",
    category: "Income",
    envelopeId: "unassigned",
    isScheduled: false,
    mode: paycheckData.mode as "allocate" | "leftover",
    unassignedCashBefore: currentBalances.unassignedCash,
    unassignedCashAfter: newBalances.unassignedCash,
    actualBalanceBefore: currentBalances.actualBalance,
    actualBalanceAfter: newBalances.actualBalance,
    allocations: allocationsMap,
    notes: paycheckData.notes || "",
  };
};

/**
 * Calculate total amount allocated to envelopes
 * Pure helper function
 */
export const calculateTotalAllocated = (allocations: EnvelopeAllocation[]): number => {
  return allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
};

/**
 * Validate paycheck input data
 * Pure validation function
 */
export const validatePaycheckInput = (
  paycheckData: PaycheckInput
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (paycheckData.amount <= 0) {
    errors.push("Paycheck amount must be greater than 0");
  }

  if (!paycheckData.mode || !["allocate", "leftover"].includes(paycheckData.mode)) {
    errors.push("Paycheck mode must be 'allocate' or 'leftover'");
  }

  if (paycheckData.envelopeAllocations) {
    const totalAllocated = calculateTotalAllocated(paycheckData.envelopeAllocations);
    if (totalAllocated > paycheckData.amount) {
      errors.push(
        `Total allocations (${totalAllocated}) exceed paycheck amount (${paycheckData.amount})`
      );
    }

    // Validate individual allocations
    paycheckData.envelopeAllocations.forEach((alloc, index) => {
      if (!alloc.envelopeId) {
        errors.push(`Allocation at index ${index} is missing envelopeId`);
      }
      if (alloc.amount < 0) {
        errors.push(`Allocation at index ${index} has negative amount`);
      } else if (alloc.amount === 0) {
        errors.push(
          `Allocation at index ${index} has zero amount; allocation amount must be greater than 0`
        );
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
