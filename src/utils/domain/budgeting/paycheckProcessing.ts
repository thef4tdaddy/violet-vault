/**
 * Paycheck processing utilities (Backward Compatibility Layer)
 *
 * REFACTORED for Issue #1463: Domain Logic Decoupling
 * This file now serves as a backward-compatible wrapper around the new architecture:
 *
 * Architecture:
 * - paycheckProcessingCore.ts: Pure domain logic (creates execution plans)
 * - paycheckService.ts: Service layer (executes plans with side effects)
 * - paycheckProcessing.ts: This file - backward compatibility wrapper
 *
 * The new architecture separates pure domain logic from side effects,
 * making the code more testable and maintainable.
 */

import type { Transaction } from "@/db/types";
import logger from "@/utils/core/common/logger";
import { createPaycheckExecutionPlan } from "./paycheckProcessingCore";
import {
  getCurrentBalances as serviceGetCurrentBalances,
  executePaycheckPlan,
  enrichAllocationsWithNames,
} from "@/services/budgeting/paycheckService";
import type { CurrentBalances as _CurrentBalances } from "./paycheckProcessingTypes";

interface BalanceCollection {
  data?: Array<{
    currentBalance?: string | number;
    name?: string;
  }>;
}

/**
 * Get current balances from database and queries
 * @deprecated Use serviceGetCurrentBalances from paycheckService directly
 */
export const getCurrentBalances = serviceGetCurrentBalances;

/**
 * Process envelope allocations for a paycheck
 * @deprecated This is now handled internally by executePaycheckPlan
 * Kept for backward compatibility in tests
 */
export { executeEnvelopeAllocations as processEnvelopeAllocations } from "@/services/budgeting/paycheckService";

/**
 * Create and save paycheck history record with transaction references
 * @deprecated This is now handled internally by executePaycheckPlan
 * Kept for backward compatibility in tests
 */
export const createPaycheckRecord = async (
  paycheckData: { amount: number; payerName?: string; mode: string; notes?: string },
  currentBalances: { unassignedCash: number; actualBalance: number },
  newBalances: { unassignedCash: number; actualBalance: number },
  allocations: Array<{ envelopeId: string; envelopeName?: string; amount: number }>,
  transactionIds?: { incomeTransactionId: string; transferTransactionIds: string[] }
): Promise<Transaction> => {
  // This is a stub for backward compatibility
  // In the new architecture, this is handled by executePaycheckPlan
  logger.warn("createPaycheckRecord is deprecated - use executePaycheckPlan instead");

  const allocationsMap: Record<string, number> = {};
  allocations.forEach((a) => {
    allocationsMap[a.envelopeId] = a.amount;
  });

  const now = Date.now();
  const paycheckRecord: Transaction = {
    id: `paycheck_${now}`,
    date: new Date(),
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
    incomeTransactionId: transactionIds?.incomeTransactionId,
    transferTransactionIds: transactionIds?.transferTransactionIds || [],
  };

  return paycheckRecord;
};

/**
 * Process paycheck with balance calculations, allocations, and transaction creation
 *
 * REFACTORED for Issue #1463:
 * This function now uses the new architecture:
 * 1. Get current balances from database
 * 2. Enrich allocations with envelope names
 * 3. Create execution plan (pure domain logic)
 * 4. Execute the plan (side effects)
 *
 * Flow:
 * 1. Create income transaction to "unassigned"
 * 2. Create transfer transactions from unassigned to envelopes (if allocations set)
 * 3. Update envelope balances
 * 4. Update budget metadata
 * 5. Create paycheck history record with transaction references
 */
export const processPaycheck = async (
  paycheckData: {
    amount: number;
    mode: string;
    envelopeAllocations?: Array<{ envelopeId: string; envelopeName?: string; amount: number }>;
    notes?: string;
    payerName?: string;
  },
  envelopesQuery: BalanceCollection,
  savingsGoalsQuery: BalanceCollection
): Promise<Transaction> => {
  logger.info("Starting paycheck processing (new architecture)", {
    amount: paycheckData.amount,
    mode: paycheckData.mode,
    allocations: paycheckData.envelopeAllocations?.length || 0,
  });

  // Step 1: Get current balances from database (side effect)
  const currentBalances = await getCurrentBalances(envelopesQuery, savingsGoalsQuery);

  // Step 2: Enrich allocations with envelope names if needed (side effect)
  const enrichedAllocations = await enrichAllocationsWithNames(
    paycheckData.envelopeAllocations || []
  );

  // Step 3: Create execution plan (pure domain logic - no side effects)
  const executionPlan = createPaycheckExecutionPlan(
    {
      amount: paycheckData.amount,
      mode: paycheckData.mode as "allocate" | "leftover",
      envelopeAllocations: enrichedAllocations,
      notes: paycheckData.notes,
      payerName: paycheckData.payerName,
    },
    currentBalances
  );

  // Step 4: Execute the plan (all side effects happen here)
  const paycheckRecord = await executePaycheckPlan(executionPlan);

  logger.info("Paycheck processed successfully", {
    paycheckId: executionPlan.paycheckId,
    paycheckAmount: paycheckData.amount,
    totalAllocated: enrichedAllocations.reduce((sum, a) => sum + a.amount, 0),
    unassignedCash: executionPlan.balanceUpdates.unassignedCash,
    actualBalance: executionPlan.balanceUpdates.actualBalance,
  });

  return paycheckRecord;
};
