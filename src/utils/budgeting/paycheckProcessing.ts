/**
 * Paycheck processing utilities
 * Extracted from paycheckMutations.js for better maintainability
 */

import { budgetDb, getBudgetMetadata, setBudgetMetadata } from "../../db/budgetDb";
import { calculatePaycheckBalances, validateBalances } from "../common/balanceCalculator";
import logger from "../common/logger";

/**
 * Get current balances from database and queries
 */
export const getCurrentBalances = async (
  envelopesQuery: { data: Array<{ currentBalance: string | number }> },
  savingsGoalsQuery: { data: Array<{ currentBalance: string | number }> }
) => {
  // Get current metadata from Dexie (proper data source)
  const currentMetadata = await getBudgetMetadata();
  const currentActualBalance = currentMetadata?.actualBalance || 0;
  const currentUnassignedCash = currentMetadata?.unassignedCash || 0;

  // Calculate current virtual balance from envelope balances
  const currentEnvelopes = envelopesQuery.data || [];
  const currentSavings = savingsGoalsQuery.data || [];

  const currentTotalEnvelopeBalance = currentEnvelopes.reduce(
    (sum: number, env: { currentBalance: string | number }) =>
      sum + (parseFloat(env.currentBalance.toString()) || 0),
    0
  );
  const currentTotalSavingsBalance = currentSavings.reduce(
    (sum: number, saving: { currentBalance: string | number }) =>
      sum + (parseFloat(saving.currentBalance.toString()) || 0),
    0
  );
  const currentVirtualBalance = currentTotalEnvelopeBalance + currentTotalSavingsBalance;

  logger.info("Current balances before paycheck", {
    currentActualBalance,
    currentUnassignedCash,
    currentVirtualBalance,
    currentTotalEnvelopeBalance,
    currentTotalSavingsBalance,
    currentMetadata,
  });

  return {
    actualBalance: currentActualBalance,
    virtualBalance: currentVirtualBalance,
    unassignedCash: currentUnassignedCash,
    isActualBalanceManual: currentMetadata?.isActualBalanceManual || false,
  };
};

/**
 * Process envelope allocations for a paycheck
 */
export const processEnvelopeAllocations = async (
  allocations: Array<{ envelopeId: string; amount: number }>
) => {
  if (allocations.length === 0) return;

  logger.info("Updating envelope balances", {
    envelopeCount: allocations.length,
    allocations,
  });

  for (const allocation of allocations) {
    const envelope = await budgetDb.envelopes.get(allocation.envelopeId);
    if (envelope) {
      const oldBalance = envelope.currentBalance || 0;
      const newBalance = oldBalance + allocation.amount;

      await budgetDb.envelopes.update(allocation.envelopeId, {
        currentBalance: newBalance,
      });

      logger.info("Updated envelope balance", {
        envelopeId: allocation.envelopeId,
        oldBalance,
        newBalance,
        allocation: allocation.amount,
      });
    }
  }
};

/**
 * Create and save paycheck history record
 */
export const createPaycheckRecord = async (
  paycheckData: { amount: number; payerName?: string; mode: string; notes?: string },
  currentBalances: { unassignedCash: number; actualBalance: number },
  newBalances: { unassignedCash: number; actualBalance: number },
  allocations: Array<{ envelopeId: string; amount: number }>
) => {
  const paycheckRecord = {
    id: `paycheck_${Date.now()}`,
    date: new Date(),
    amount: paycheckData.amount,
    source: paycheckData.payerName || "Unknown",
    lastModified: Date.now(),
    createdAt: Date.now(),
    // Additional custom fields
    mode: paycheckData.mode,
    unassignedCashBefore: currentBalances.unassignedCash,
    unassignedCashAfter: newBalances.unassignedCash,
    actualBalanceBefore: currentBalances.actualBalance,
    actualBalanceAfter: newBalances.actualBalance,
    envelopeAllocations: allocations,
    notes: paycheckData.notes || "",
  };

  // Save paycheck record to Dexie
  await budgetDb.paycheckHistory.add(paycheckRecord as never);

  logger.info("Paycheck processing completed successfully", {
    paycheckId: paycheckRecord.id,
    finalBalances: newBalances,
  });

  return paycheckRecord;
};

/**
 * Process paycheck with balance calculations and allocations
 */
export const processPaycheck = async (
  paycheckData: {
    amount: number;
    mode: string;
    envelopeAllocations?: Array<{ envelopeId: string; amount: number }>;
    notes?: string;
    payerName?: string;
  },
  envelopesQuery: { data: Array<{ currentBalance: string | number }> },
  savingsGoalsQuery: { data: Array<{ currentBalance: string | number }> }
) => {
  logger.info("Starting paycheck processing", {
    amount: paycheckData.amount,
    mode: paycheckData.mode,
    allocations: paycheckData.envelopeAllocations?.length || 0,
    paycheckData,
  });

  // Get current balances
  const currentBalances = await getCurrentBalances(envelopesQuery, savingsGoalsQuery);

  // Prepare allocations for calculator
  const allocations =
    paycheckData.envelopeAllocations?.map((alloc: { envelopeId: string; amount: number }) => ({
      envelopeId: alloc.envelopeId,
      amount: alloc.amount,
    })) || [];

  // Use centralized balance calculator to ensure consistency
  const newBalances = calculatePaycheckBalances(
    currentBalances as {
      actualBalance: number;
      virtualBalance: number;
      unassignedCash: number;
      isActualBalanceManual: boolean;
    },
    paycheckData as {
      amount: number;
      mode: string;
      envelopeAllocations?: Array<{ envelopeId: string; amount: number }>;
      notes?: string;
      payerName?: string;
    },
    allocations
  );

  // Validate the calculation
  const validation = validateBalances(newBalances);
  if (!validation.isValid) {
    logger.warn("Balance validation failed after paycheck processing", {
      errors: validation.errors,
      warnings: validation.warnings,
      paycheck: paycheckData,
      newBalances,
    });
  }

  logger.info("Calculated new balances using centralized calculator", {
    actualBalance: `${currentBalances.actualBalance} → ${newBalances.actualBalance}`,
    unassignedCash: `${currentBalances.unassignedCash} → ${newBalances.unassignedCash}`,
    paycheckAmount: paycheckData.amount,
    paycheckMode: paycheckData.mode,
    allocationsCount: allocations.length,
  });

  // Update budget metadata in Dexie using calculated balances
  await setBudgetMetadata({
    actualBalance: newBalances.actualBalance,
    unassignedCash: newBalances.unassignedCash,
  });

  logger.info("Budget metadata updated in Dexie with validated balances");

  // Update envelope balances in Dexie if allocating
  await processEnvelopeAllocations(allocations);

  // Create paycheck history record
  const paycheckRecord = await createPaycheckRecord(
    paycheckData,
    currentBalances,
    newBalances,
    allocations
  );

  // Update balances in state
  updateBalances?.(newBalances);

  // Log the successful paycheck processing
  logger.info("Paycheck processed successfully", {
    paycheckAmount: paycheckData.amount,
    totalAllocated: allocations?.totalAllocated || 0,
    unassignedCash: newBalances.unassignedCash,
    actualBalance: newBalances.actualBalance,
    virtualBalance: newBalances.virtualBalance,
  });

  return paycheckRecord;
};
