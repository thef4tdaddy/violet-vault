/**
 * Paycheck deletion utilities
 * Extracted from paycheckMutations.js for better maintainability
 */

import { budgetDb, getBudgetMetadata, setBudgetMetadata } from "@/db/budgetDb";
import logger from "@/utils/core/common/logger";

// Paycheck history is now part of the unified Transaction schema

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

  // Get paycheck record from transactions table
  const paycheckRecord = await budgetDb.transactions.get(paycheckId);
  if (!paycheckRecord) {
    throw new Error("Paycheck record not found");
  }

  // Reverse the balance changes
  const currentMetadata = await getBudgetMetadata();
  const currentActualBalance = currentMetadata?.actualBalance || 0;
  const currentUnassignedCash = currentMetadata?.unassignedCash || 0;

  // Calculate new balances by reversing the paycheck
  const amount = (paycheckRecord as unknown as Record<string, number>).amount || 0;
  // Explicitly cast to Number to avoid unknown operand types
  const newActualBalance = (Number(currentActualBalance) || 0) - amount;

  const unassignedAfter =
    (paycheckRecord as unknown as Record<string, number>).unassignedCashAfter || 0;
  const unassignedBefore =
    (paycheckRecord as unknown as Record<string, number>).unassignedCashBefore || 0;
  const unassignedCashChange = unassignedAfter - unassignedBefore;

  const newUnassignedCash = (Number(currentUnassignedCash) || 0) - unassignedCashChange;

  // Update budget metadata
  await setBudgetMetadata({
    actualBalance: newActualBalance,
    unassignedCash: newUnassignedCash,
  });

  // Reverse envelope allocations if any
  if ((paycheckRecord as unknown as Record<string, unknown>).allocations) {
    const allocations = (paycheckRecord as unknown as Record<string, unknown>)
      .allocations as Record<string, number>;
    const allocationsArray: EnvelopeAllocation[] = Object.entries(allocations).map(
      ([envelopeId, amount]) => ({ envelopeId, amount })
    );
    await reverseEnvelopeAllocations(allocationsArray);
  } else if ((paycheckRecord as unknown as Record<string, unknown>).envelopeAllocations) {
    // Fallback for legacy format if still present in some records
    await reverseEnvelopeAllocations(
      (paycheckRecord as unknown as Record<string, unknown>)
        .envelopeAllocations as EnvelopeAllocation[]
    );
  }

  // Delete the paycheck record from transactions table
  await budgetDb.transactions.delete(paycheckId);

  logger.info("Paycheck deleted and effects reversed", {
    paycheckId,
    actualBalanceChange: newActualBalance - (Number(currentActualBalance) || 0),
    unassignedCashChange: newUnassignedCash - (Number(currentUnassignedCash) || 0),
  });

  return { success: true, paycheckId };
};
