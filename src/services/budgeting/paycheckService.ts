/**
 * Paycheck Processing Service
 * This service layer executes paycheck processing plans by performing
 * the actual database operations and side effects.
 *
 * Separation of concerns:
 * - Domain Logic (paycheckProcessingCore.ts): Pure functions that create execution plans
 * - Service Layer (this file): Executes the plans with side effects
 */

import { budgetDb, getBudgetMetadata, setBudgetMetadata } from "@/db/budgetDb";
import logger from "@/utils/core/common/logger";
import { createPaycheckTransactions } from "@/services/transactions/paycheckTransactionService";
import type { Transaction } from "@/db/types";
import type {
  PaycheckExecutionPlan,
  EnvelopeAllocation,
  CurrentBalances,
} from "@/utils/domain/budgeting/paycheckProcessingTypes";

interface BalanceCollection {
  data?: Array<{
    currentBalance?: string | number;
    name?: string;
  }>;
}

/**
 * Get current balances from database and queries
 * Side effect: Reads from Dexie database
 */
export const getCurrentBalances = async (
  envelopesQuery: BalanceCollection,
  savingsGoalsQuery: BalanceCollection
): Promise<CurrentBalances> => {
  // Get current metadata from Dexie
  const currentMetadata = await getBudgetMetadata();
  const currentActualBalance = Number(currentMetadata?.actualBalance ?? 0);
  const currentUnassignedCash = Number(currentMetadata?.unassignedCash ?? 0);

  // Calculate current virtual balance from envelope balances
  const currentEnvelopes = envelopesQuery.data || [];
  const currentSavings = savingsGoalsQuery.data || [];

  const currentTotalEnvelopeBalance = currentEnvelopes.reduce((sum: number, env) => {
    const balance = env.currentBalance;
    return sum + (balance !== undefined ? parseFloat(String(balance)) || 0 : 0);
  }, 0);

  const currentTotalSavingsBalance = currentSavings.reduce((sum: number, saving) => {
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
 * Execute envelope allocation updates
 * Side effect: Updates Dexie database
 */
export const executeEnvelopeAllocations = async (
  allocations: EnvelopeAllocation[]
): Promise<void> => {
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
 * Enrich allocations with envelope names from database
 * Side effect: Reads from Dexie database
 */
export const enrichAllocationsWithNames = async (
  allocations: EnvelopeAllocation[]
): Promise<EnvelopeAllocation[]> => {
  const enrichedAllocations = [...allocations];

  for (const alloc of enrichedAllocations) {
    if (!alloc.envelopeName) {
      const envelope = await budgetDb.envelopes.get(alloc.envelopeId);
      if (envelope) {
        alloc.envelopeName = envelope.name;
      }
    }
  }

  return enrichedAllocations;
};

/**
 * Create paycheck transaction records
 * Side effect: Creates transactions in database
 * Returns transaction IDs for audit trail, or undefined if creation fails
 */
const createTransactionsForPaycheck = async (
  plan: PaycheckExecutionPlan
): Promise<{ incomeTransactionId: string; transferTransactionIds: string[] } | undefined> => {
  try {
    const transactionResult = await createPaycheckTransactions(
      {
        paycheckId: plan.paycheckId,
        amount: plan.transactionCreation.amount,
        payerName: plan.transactionCreation.payerName,
        notes: plan.transactionCreation.notes,
      },
      plan.transactionCreation.allocations
    );

    const transactionIds = {
      incomeTransactionId: transactionResult.incomeTransactionId,
      transferTransactionIds: transactionResult.transferTransactionIds,
    };

    logger.info("Created paycheck transactions", {
      paycheckId: plan.paycheckId,
      incomeTransactionId: transactionIds.incomeTransactionId,
      transferCount: transactionIds.transferTransactionIds.length,
    });

    return transactionIds;
  } catch (error) {
    logger.error("Failed to create paycheck transactions", error, {
      paycheckId: plan.paycheckId,
      amount: plan.transactionCreation.amount,
    });
    return undefined;
  }
};

/**
 * Execute paycheck execution plan
 * This function performs all the side effects described in the plan
 *
 * @param plan - The execution plan to execute
 * @returns The created paycheck transaction record
 */
export const executePaycheckPlan = async (plan: PaycheckExecutionPlan): Promise<Transaction> => {
  logger.info("Starting paycheck plan execution", {
    paycheckId: plan.paycheckId,
    amount: plan.transactionCreation.amount,
    allocations: plan.envelopeAllocations.length,
  });

  // Log validation warnings if any
  if (!plan.validation.isValid) {
    logger.warn("Balance validation failed during paycheck execution", {
      errors: plan.validation.errors,
      warnings: plan.validation.warnings,
      paycheckId: plan.paycheckId,
    });
  }

  // Create transaction records
  const transactionIds = await createTransactionsForPaycheck(plan);

  // Update budget metadata
  await setBudgetMetadata(plan.balanceUpdates);

  // Update envelope balances
  await executeEnvelopeAllocations(plan.envelopeAllocations);

  // Create paycheck record with transaction references
  const paycheckRecord: Transaction = {
    ...plan.paycheckRecord,
    incomeTransactionId: transactionIds?.incomeTransactionId,
    transferTransactionIds: transactionIds?.transferTransactionIds || [],
  };

  // Save paycheck record to transactions table
  await budgetDb.transactions.add(paycheckRecord);

  logger.info("Paycheck plan executed successfully", {
    paycheckId: plan.paycheckId,
    finalBalances: plan.balanceUpdates,
    incomeTransactionId: transactionIds?.incomeTransactionId,
    transferTransactionIds: transactionIds?.transferTransactionIds,
  });

  return paycheckRecord;
};
