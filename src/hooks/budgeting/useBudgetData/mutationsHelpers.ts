/**
 * Helper functions for budget mutations
 * Extracted to reduce complexity and nesting depth
 */
import { budgetDb, getBudgetMetadata, setBudgetMetadata } from "@/db/budgetDb";
import logger from "@/utils/common/logger";
import type { PaycheckHistory, Transaction } from "@/db/types";

// Extended interfaces for paycheck operations
interface PaycheckRecordExtended extends PaycheckHistory {
  unassignedCashAfter?: number;
  unassignedCashBefore?: number;
  envelopeAllocations?: EnvelopeAllocation[];
}

interface BudgetMetadata {
  actualBalance?: number;
  unassignedCash?: number;
  [key: string]: unknown;
}

interface EnvelopeAllocation {
  envelopeId: string;
  amount: number;
  [key: string]: unknown;
}

interface TransactionDeletionResult {
  success: boolean;
  transactionId: string;
  deletedPaycheck?: string | boolean;
}

interface PaycheckDeletionResult {
  deletedPaycheck: string | boolean;
}

interface TransactionExtended extends Transaction {
  paycheckId?: string;
}

/**
 * Reverse paycheck balance changes
 */
export const reversePaycheckBalances = async (
  paycheckRecord: PaycheckRecordExtended,
  currentMetadata: BudgetMetadata
): Promise<void> => {
  const currentActualBalance = currentMetadata?.actualBalance || 0;
  const currentUnassignedCash = currentMetadata?.unassignedCash || 0;

  const newActualBalance = currentActualBalance - paycheckRecord.amount;
  const unassignedCashChange =
    (paycheckRecord.unassignedCashAfter || 0) - (paycheckRecord.unassignedCashBefore || 0);
  const newUnassignedCash = currentUnassignedCash - unassignedCashChange;

  await setBudgetMetadata({
    actualBalance: newActualBalance,
    unassignedCash: newUnassignedCash,
  });

  logger.info("Reversed paycheck balance changes", {
    actualBalanceChange: newActualBalance - currentActualBalance,
    unassignedCashChange: newUnassignedCash - currentUnassignedCash,
  });
};

/**
 * Reverse envelope allocations
 */
export const reverseEnvelopeAllocations = async (
  envelopeAllocations: EnvelopeAllocation[]
): Promise<void> => {
  if (!envelopeAllocations || envelopeAllocations.length === 0) {
    return;
  }

  for (const allocation of envelopeAllocations) {
    const envelope = await budgetDb.envelopes.get(allocation.envelopeId);
    if (envelope && envelope.currentBalance !== undefined) {
      const newBalance = envelope.currentBalance - allocation.amount;
      await budgetDb.envelopes.update(allocation.envelopeId, {
        currentBalance: Math.max(0, newBalance),
      });
    }
  }
};

/**
 * Delete associated paycheck and reverse effects
 */
export const deleteAssociatedPaycheck = async (
  paycheckId: string,
  transactionId: string
): Promise<PaycheckDeletionResult> => {
  const paycheckRecord = (await budgetDb.paycheckHistory.get(paycheckId)) as
    | PaycheckRecordExtended
    | undefined;

  if (!paycheckRecord) {
    return { deletedPaycheck: false };
  }

  const currentMetadata = await getBudgetMetadata();
  if (currentMetadata && paycheckRecord.envelopeAllocations) {
    await reversePaycheckBalances(paycheckRecord, currentMetadata);
    await reverseEnvelopeAllocations(paycheckRecord.envelopeAllocations);
  }
  await budgetDb.paycheckHistory.delete(paycheckId);

  logger.info("Associated paycheck deleted and effects reversed", {
    paycheckId,
    transactionId,
  });

  return { deletedPaycheck: paycheckId };
};

/**
 * Process transaction deletion with paycheck handling
 */
export const processTransactionDeletion = async (
  transactionId: string
): Promise<TransactionDeletionResult> => {
  logger.info("Starting transaction deletion", { transactionId });

  const transaction = (await budgetDb.transactions.get(transactionId)) as
    | TransactionExtended
    | undefined;
  if (!transaction) {
    throw new Error("Transaction not found");
  }

  let result: TransactionDeletionResult = { success: true, transactionId };

  if (transaction.paycheckId) {
    logger.info("Transaction is linked to paycheck, deleting paycheck too", {
      transactionId,
      paycheckId: transaction.paycheckId,
    });

    try {
      const paycheckResult = await deleteAssociatedPaycheck(transaction.paycheckId, transactionId);
      result = { ...result, ...paycheckResult };
    } catch (error) {
      logger.error("Failed to delete associated paycheck", error);
      // Continue with transaction deletion even if paycheck deletion fails
    }
  }

  await budgetDb.transactions.delete(transactionId);
  logger.info("Transaction deleted successfully", { transactionId });

  return result;
};
