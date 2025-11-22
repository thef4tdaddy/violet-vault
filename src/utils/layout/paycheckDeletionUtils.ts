/**
 * Paycheck deletion utilities
 * Extracted from usePaycheckOperations for better maintainability and ESLint compliance
 */
import logger from "../common/logger";

interface Paycheck {
  id: string | number;
  amount: number;
  mode?: string;
  envelopeAllocations?: Array<{ envelopeId: string | number; amount: number }>;
}

/**
 * Validate paycheck deletion parameters
 */
export const validatePaycheckDeletion = (paycheckId: string | number, paycheckHistory: Paycheck[]): Paycheck => {
  if (!paycheckId) {
    throw new Error("Paycheck ID is required for deletion");
  }

  const paycheckToDelete = paycheckHistory.find((p: Paycheck) => p.id === paycheckId);
  if (!paycheckToDelete) {
    throw new Error(`Paycheck with ID ${paycheckId} not found in paycheckHistory`);
  }

  logger.info("Found paycheck to delete", {
    paycheckId,
    amount: paycheckToDelete.amount,
    mode: paycheckToDelete.mode,
    allocations: paycheckToDelete.envelopeAllocations?.length || 0,
  });

  return paycheckToDelete;
};

/**
 * Reverse envelope allocations for deleted paycheck
 */
export const reverseEnvelopeAllocations = async (paycheckToDelete: Paycheck, budgetDb: { envelopes: { get: (id: string | number) => Promise<unknown>; update: (id: string | number, data: unknown) => Promise<void> } }): Promise<number> => {
  if (paycheckToDelete.mode !== "allocate" || !paycheckToDelete.envelopeAllocations) {
    return 0;
  }

  logger.info("Reversing envelope allocations for allocate mode paycheck");

  // Subtract from envelope balances
  for (const allocation of paycheckToDelete.envelopeAllocations) {
    const envelope = await budgetDb.envelopes.get(allocation.envelopeId);
    if (envelope) {
      await budgetDb.envelopes.update(allocation.envelopeId, {
        currentBalance: Math.max(0, (envelope.currentBalance || 0) - allocation.amount),
      });
      logger.debug("Reversed envelope allocation", {
        envelopeId: allocation.envelopeId,
        amount: allocation.amount,
      });
    }
  }

  // Calculate how much went to unassigned cash originally
  const totalAllocated = paycheckToDelete.envelopeAllocations.reduce(
    (sum: number, alloc: { amount: number }) => sum + alloc.amount,
    0
  );
  return paycheckToDelete.amount - totalAllocated;
};

/**
 * Calculate new balances after paycheck deletion
 */
export const calculateReversedBalances = async (paycheckToDelete: Paycheck, budgetDb: { envelopes: { get: (id: string | number) => Promise<unknown>; update: (id: string | number, data: unknown) => Promise<void> } }, getBudgetMetadata: () => Promise<{ actualBalance?: number; unassignedCash?: number } | null>): Promise<{ currentActualBalance: number; currentUnassignedCash: number; newActualBalance: number; newUnassignedCash: number }> => {
  // Get current metadata
  const currentMetadata = await getBudgetMetadata();
  const currentActualBalance = currentMetadata?.actualBalance || 0;
  const currentUnassignedCash = currentMetadata?.unassignedCash || 0;

  // Calculate new actual balance (subtract the paycheck amount)
  const newActualBalance = currentActualBalance - paycheckToDelete.amount;
  let newUnassignedCash = currentUnassignedCash;

  // Handle envelope balance reversals if this was an "allocate" paycheck
  if (paycheckToDelete.mode === "allocate" && paycheckToDelete.envelopeAllocations) {
    const leftoverAmount = await reverseEnvelopeAllocations(paycheckToDelete, budgetDb);
    newUnassignedCash = Math.max(0, currentUnassignedCash - leftoverAmount);
  } else {
    logger.info("Reversing leftover mode paycheck from unassigned cash");
    // "leftover" mode - all went to unassigned cash, so subtract it all
    newUnassignedCash = Math.max(0, currentUnassignedCash - paycheckToDelete.amount);
  }

  return {
    currentActualBalance,
    currentUnassignedCash,
    newActualBalance,
    newUnassignedCash,
  };
};

/**
 * Delete paycheck record from database
 */
export const deletePaycheckRecord = async (paycheckId: string | number, budgetDb: { paycheckHistory: { delete: (id: string | number) => Promise<void> } }): Promise<void> => {
  logger.info("Deleting paycheck from Dexie", {
    paycheckId,
    paycheckIdType: typeof paycheckId,
  });

  // Verify the paycheck exists in Dexie before attempting to delete
  const existsInDexie = await budgetDb.paycheckHistory.get(paycheckId);
  if (!existsInDexie) {
    logger.warn("Paycheck not found in Dexie database", {
      paycheckId,
    });
  } else {
    await budgetDb.paycheckHistory.delete(paycheckId);
    logger.info("Successfully deleted paycheck from Dexie");
  }
};

/**
 * Invalidate query caches after paycheck deletion
 */
export const invalidatePaycheckCaches = async (queryClient: { invalidateQueries: (opts: unknown) => Promise<void> }, queryKeys: { paycheckHistory: unknown[]; budgetMetadata: unknown[] }): Promise<void> => {
  queryClient.invalidateQueries({
    queryKey: queryKeys.paycheckHistory(),
  });
  queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
  queryClient.invalidateQueries({
    queryKey: queryKeys.budgetMetadata,
  });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
};
