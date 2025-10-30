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
export const getCurrentBalances = async (envelopesQuery, savingsGoalsQuery) => {
  // Get current metadata from Dexie (proper data source)
  const currentMetadata = await getBudgetMetadata();
  const currentActualBalance = currentMetadata?.actualBalance || 0;
  const currentUnassignedCash = currentMetadata?.unassignedCash || 0;

  // Calculate current virtual balance from envelope balances
  const currentEnvelopes = envelopesQuery.data || [];
  const currentSavings = savingsGoalsQuery.data || [];

  const currentTotalEnvelopeBalance = currentEnvelopes.reduce(
    (sum, env) => sum + (parseFloat(env.currentBalance) || 0),
    0
  );
  const currentTotalSavingsBalance = currentSavings.reduce(
    (sum, saving) => sum + (parseFloat(saving.currentBalance) || 0),
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
export const processEnvelopeAllocations = async (allocations) => {
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
  paycheckData,
  currentBalances,
  newBalances,
  allocations
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
export const processPaycheck = async (paycheckData, envelopesQuery, savingsGoalsQuery) => {
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
    paycheckData.envelopeAllocations?.map((alloc) => ({
      envelopeId: alloc.envelopeId,
      amount: alloc.amount,
    })) || [];

  // Use centralized balance calculator to ensure consistency
  const newBalances = calculatePaycheckBalances(currentBalances, paycheckData, allocations);

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

  return paycheckRecord;
};
