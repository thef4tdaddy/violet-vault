/**
 * Paycheck processing utilities
 * Extracted from paycheckMutations.js for better maintainability
 * Updated for Issue #1340: Creates proper transaction records for paycheck processing
 */

import { budgetDb, getBudgetMetadata, setBudgetMetadata } from "../../db/budgetDb";
import {
  calculatePaycheckBalances,
  validateBalances,
  type CurrentBalances,
} from "../common/balanceCalculator";
import logger from "../common/logger";
import { createPaycheckTransactions } from "@/services/transactions/paycheckTransactionService";

interface BalanceItem {
  currentBalance?: string | number;
  name?: string;
}

interface BalanceCollection {
  data?: BalanceItem[];
}

interface EnvelopeAllocationWithName {
  envelopeId: string;
  envelopeName?: string;
  amount: number;
}

/**
 * Get current balances from database and queries
 */
export const getCurrentBalances = async (
  envelopesQuery: BalanceCollection,
  savingsGoalsQuery: BalanceCollection
): Promise<CurrentBalances> => {
  // Get current metadata from Dexie (proper data source)
  const currentMetadata = await getBudgetMetadata();
  const currentActualBalance = Number(currentMetadata?.actualBalance ?? 0);
  const currentUnassignedCash = Number(currentMetadata?.unassignedCash ?? 0);

  // Calculate current virtual balance from envelope balances
  const currentEnvelopes = envelopesQuery.data || [];
  const currentSavings = savingsGoalsQuery.data || [];

  const currentTotalEnvelopeBalance = currentEnvelopes.reduce((sum: number, env: BalanceItem) => {
    const balance = env.currentBalance;
    return sum + (balance !== undefined ? parseFloat(String(balance)) || 0 : 0);
  }, 0);
  const currentTotalSavingsBalance = currentSavings.reduce((sum: number, saving: BalanceItem) => {
    const balance = saving.currentBalance;
    return sum + (balance !== undefined ? parseFloat(String(balance)) || 0 : 0);
  }, 0);
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
    isActualBalanceManual: Boolean(currentMetadata?.isActualBalanceManual),
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
 * Create and save paycheck history record with transaction references
 * Updated for Issue #1340: Links paycheck record to created transactions
 */
export const createPaycheckRecord = async (
  paycheckData: { amount: number; payerName?: string; mode: string; notes?: string },
  currentBalances: { unassignedCash: number; actualBalance: number },
  newBalances: { unassignedCash: number; actualBalance: number },
  allocations: Array<{ envelopeId: string; envelopeName?: string; amount: number }>,
  transactionIds?: { incomeTransactionId: string; transferTransactionIds: string[] }
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
    // Transaction IDs for audit trail (Issue #1340)
    incomeTransactionId: transactionIds?.incomeTransactionId,
    transferTransactionIds: transactionIds?.transferTransactionIds || [],
  };

  // Save paycheck record to Dexie
  await budgetDb.paycheckHistory.add(paycheckRecord as never);

  logger.info("Paycheck processing completed successfully", {
    paycheckId: paycheckRecord.id,
    finalBalances: newBalances,
    incomeTransactionId: transactionIds?.incomeTransactionId,
    transferTransactionIds: transactionIds?.transferTransactionIds,
  });

  return paycheckRecord;
};

/**
 * Prepare allocations with envelope names for transaction creation
 * Helper function to reduce main processPaycheck statement count
 */
const prepareAllocationsWithNames = async (
  envelopeAllocations:
    | Array<{ envelopeId: string; envelopeName?: string; amount: number }>
    | undefined
): Promise<EnvelopeAllocationWithName[]> => {
  const allocations: EnvelopeAllocationWithName[] =
    envelopeAllocations?.map((alloc) => ({
      envelopeId: alloc.envelopeId,
      envelopeName: alloc.envelopeName,
      amount: alloc.amount,
    })) || [];

  // Enrich allocations with envelope names if not provided
  for (const alloc of allocations) {
    if (!alloc.envelopeName) {
      const envelope = await budgetDb.envelopes.get(alloc.envelopeId);
      if (envelope) {
        alloc.envelopeName = envelope.name;
      }
    }
  }

  return allocations;
};

/**
 * Create paycheck transaction records
 * Returns transaction IDs for audit trail, or undefined if creation fails
 */
const createTransactionsForPaycheck = async (
  paycheckId: string,
  paycheckData: { amount: number; payerName?: string; notes?: string },
  allocations: EnvelopeAllocationWithName[]
): Promise<{ incomeTransactionId: string; transferTransactionIds: string[] } | undefined> => {
  try {
    const transactionResult = await createPaycheckTransactions(
      {
        paycheckId,
        amount: paycheckData.amount,
        payerName: paycheckData.payerName,
        notes: paycheckData.notes,
      },
      allocations
    );

    const transactionIds = {
      incomeTransactionId: transactionResult.incomeTransactionId,
      transferTransactionIds: transactionResult.transferTransactionIds,
    };

    logger.info("Created paycheck transactions", {
      paycheckId,
      incomeTransactionId: transactionIds.incomeTransactionId,
      transferCount: transactionIds.transferTransactionIds.length,
    });

    return transactionIds;
  } catch (error) {
    logger.error("Failed to create paycheck transactions", error, {
      paycheckId,
      amount: paycheckData.amount,
    });
    // Return undefined - paycheck processing will continue without transaction records
    return undefined;
  }
};

/**
 * Process paycheck with balance calculations, allocations, and transaction creation
 * Updated for Issue #1340: Creates proper transaction records
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
) => {
  const paycheckId = `paycheck_${Date.now()}`;

  logger.info("Starting paycheck processing", {
    paycheckId,
    amount: paycheckData.amount,
    mode: paycheckData.mode,
    allocations: paycheckData.envelopeAllocations?.length || 0,
  });

  // Get current balances
  const currentBalances = await getCurrentBalances(envelopesQuery, savingsGoalsQuery);

  // Prepare allocations with envelope names for transaction creation
  const allocations = await prepareAllocationsWithNames(paycheckData.envelopeAllocations);

  // Use centralized balance calculator to ensure consistency
  const newBalances = calculatePaycheckBalances(
    currentBalances as {
      actualBalance: number;
      virtualBalance: number;
      unassignedCash: number;
      isActualBalanceManual: boolean;
    },
    paycheckData,
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
    allocationsCount: allocations.length,
  });

  // Issue #1340: Create transaction records for paycheck
  const transactionIds = await createTransactionsForPaycheck(paycheckId, paycheckData, allocations);

  // Update budget metadata in Dexie using calculated balances
  await setBudgetMetadata({
    actualBalance: newBalances.actualBalance,
    unassignedCash: newBalances.unassignedCash,
  });

  // Update envelope balances in Dexie if allocating
  await processEnvelopeAllocations(allocations);

  // Create paycheck history record with transaction references
  const paycheckRecord = await createPaycheckRecord(
    paycheckData,
    currentBalances,
    newBalances,
    allocations,
    transactionIds
  );

  // Log the successful paycheck processing
  const totalAllocated = allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
  logger.info("Paycheck processed successfully", {
    paycheckAmount: paycheckData.amount,
    totalAllocated,
    unassignedCash: newBalances.unassignedCash,
    actualBalance: newBalances.actualBalance,
    incomeTransactionId: transactionIds?.incomeTransactionId,
  });

  return paycheckRecord;
};
