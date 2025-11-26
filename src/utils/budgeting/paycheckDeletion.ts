/**
 * Paycheck deletion utilities
 * Extracted from paycheckMutations.js for better maintainability
 */

import { budgetDb, getBudgetMetadata, setBudgetMetadata } from "../../db/budgetDb";
import logger from "../common/logger";
import type { PaycheckHistory } from "../../db/types";

// Extended interface for paycheck history with additional tracking fields
interface PaycheckHistoryExtended extends PaycheckHistory {
  unassignedCashBefore?: number;
  unassignedCashAfter?: number;
  envelopeAllocations?: Array<{
    envelopeId: string;
    amount: number;
  }>;
}

interface EnvelopeAllocation {
  envelopeId: string;
  amount: number;
}

/**
 * Reverse envelope allocations for a deleted paycheck
 */
export const reverseEnvelopeAllocations = async (envelopeAllocations?: EnvelopeAllocation[]) => {
  if (!envelopeAllocations?.length) return;

  for (const allocation of envelopeAllocations) {
    const envelope = await budgetDb.envelopes.get(allocation.envelopeId);
    if (envelope) {
      const newBalance = (envelope.currentBalance ?? 0) - allocation.amount;
      await budgetDb.envelopes.update(allocation.envelopeId, {
        currentBalance: Math.max(0, newBalance),
      });
    }
  }
};

/**
 * Delete paycheck and reverse its effects
 */
export const deletePaycheck = async (paycheckId: string) => {
  logger.info("Starting paycheck deletion", { paycheckId });

  // Get paycheck record
  const paycheckRecord = (await budgetDb.paycheckHistory.get(paycheckId)) as
    | PaycheckHistoryExtended
    | undefined;
  if (!paycheckRecord) {
    throw new Error("Paycheck record not found");
  }

  // Reverse the balance changes
  const currentMetadata = await getBudgetMetadata();
  const currentActualBalance: number = (currentMetadata?.actualBalance as number) || 0;
  const currentUnassignedCash: number = (currentMetadata?.unassignedCash as number) || 0;

  // Calculate new balances by reversing the paycheck
  const newActualBalance = currentActualBalance - paycheckRecord.amount;
  const unassignedCashChange =
    (paycheckRecord.unassignedCashAfter || 0) - (paycheckRecord.unassignedCashBefore || 0);
  const newUnassignedCash = currentUnassignedCash - unassignedCashChange;

  // Update budget metadata
  await setBudgetMetadata({
    actualBalance: newActualBalance,
    unassignedCash: newUnassignedCash,
  });

  // Reverse envelope allocations if any
  await reverseEnvelopeAllocations(paycheckRecord.envelopeAllocations);

  // Delete the paycheck record
  await budgetDb.paycheckHistory.delete(paycheckId);

  logger.info("Paycheck deleted and effects reversed", {
    paycheckId,
    actualBalanceChange: newActualBalance - currentActualBalance,
    unassignedCashChange: newUnassignedCash - currentUnassignedCash,
  });

  return { success: true, paycheckId };
};
