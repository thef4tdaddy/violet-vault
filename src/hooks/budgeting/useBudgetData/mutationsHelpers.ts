/**
 * Helper functions for budget mutations
 * Extracted to reduce complexity and nesting depth
 */
import { budgetDb, getBudgetMetadata, setBudgetMetadata } from "@/db/budgetDb";
import logger from "@/utils/common/logger";

/**
 * Reverse paycheck balance changes
 */
export const reversePaycheckBalances = async (
  paycheckRecord: any,
  currentMetadata: any
): Promise<void> => {
  const currentActualBalance = currentMetadata?.actualBalance || 0;
  const currentUnassignedCash = currentMetadata?.unassignedCash || 0;

  const newActualBalance = currentActualBalance - paycheckRecord.amount;
  const unassignedCashChange = paycheckRecord.unassignedCashAfter - paycheckRecord.unassignedCashBefore;
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
export const reverseEnvelopeAllocations = async (envelopeAllocations: any[]): Promise<void> => {
  if (!envelopeAllocations || envelopeAllocations.length === 0) {
    return;
  }

  for (const allocation of envelopeAllocations) {
    const envelope = await budgetDb.envelopes.get(allocation.envelopeId);
    if (envelope) {
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
): Promise<any> => {
  const paycheckRecord = await budgetDb.paycheckHistory.get(paycheckId);
  
  if (!paycheckRecord) {
    return { deletedPaycheck: false };
  }

  const currentMetadata = await getBudgetMetadata();
  await reversePaycheckBalances(paycheckRecord, currentMetadata);
  await reverseEnvelopeAllocations(paycheckRecord.envelopeAllocations);
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
export const processTransactionDeletion = async (transactionId: string): Promise<any> => {
  logger.info("Starting transaction deletion", { transactionId });

  const transaction = await budgetDb.transactions.get(transactionId);
  if (!transaction) {
    throw new Error("Transaction not found");
  }

  let result: any = { success: true, transactionId };

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
