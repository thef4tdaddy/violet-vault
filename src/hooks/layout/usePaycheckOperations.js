import { useCallback } from "react";
import logger from "../../utils/common/logger";

/**
 * Paycheck operations hook
 * Extracts complex paycheck deletion logic from ViewRenderer
 * Handles proper balance reversal and UI updates
 *
 * @returns {Object} Paycheck operation handlers
 */
export const usePaycheckOperations = () => {
  const handleDeletePaycheck = useCallback(async (paycheckId, paycheckHistory) => {
    try {
      // Validate paycheck ID
      if (!paycheckId) {
        throw new Error("Paycheck ID is required for deletion");
      }

      logger.info("Starting paycheck deletion process", {
        paycheckId,
        paycheckIdType: typeof paycheckId,
      });

      // Get the paycheck to delete from TanStack Query data
      const paycheckToDelete = paycheckHistory.find((p) => p.id === paycheckId);
      if (!paycheckToDelete) {
        throw new Error(`Paycheck with ID ${paycheckId} not found in paycheckHistory`);
      }

      logger.info("Found paycheck to delete", {
        paycheckId,
        amount: paycheckToDelete.amount,
        mode: paycheckToDelete.mode,
        allocations: paycheckToDelete.envelopeAllocations?.length || 0,
      });

      // Import required functions
      const { budgetDb, getBudgetMetadata, setBudgetMetadata } = await import("../../db/budgetDb");

      // Get current metadata
      const currentMetadata = await getBudgetMetadata();
      const currentActualBalance = currentMetadata?.actualBalance || 0;
      const currentUnassignedCash = currentMetadata?.unassignedCash || 0;

      // Calculate new balances (subtract the paycheck amount)
      const newActualBalance = currentActualBalance - paycheckToDelete.amount;
      let newUnassignedCash = currentUnassignedCash;

      // Handle envelope balance reversals if this was an "allocate" paycheck
      if (paycheckToDelete.mode === "allocate" && paycheckToDelete.envelopeAllocations) {
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
          (sum, alloc) => sum + alloc.amount,
          0
        );
        const leftoverAmount = paycheckToDelete.amount - totalAllocated;
        newUnassignedCash = Math.max(0, currentUnassignedCash - leftoverAmount);
      } else {
        logger.info("Reversing leftover mode paycheck from unassigned cash");
        // "leftover" mode - all went to unassigned cash, so subtract it all
        newUnassignedCash = Math.max(0, currentUnassignedCash - paycheckToDelete.amount);
      }

      // Update budget metadata
      logger.info("Updating budget metadata", {
        oldActualBalance: currentActualBalance,
        newActualBalance,
        oldUnassignedCash: currentUnassignedCash,
        newUnassignedCash,
      });

      await setBudgetMetadata({
        actualBalance: newActualBalance,
        unassignedCash: newUnassignedCash,
      });

      // Remove paycheck from history in Dexie - ensure we have a valid key
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

      // Invalidate TanStack Query caches to refresh UI
      const { queryClient } = await import("../../utils/common/queryClient");
      const { queryKeys } = await import("../../utils/common/queryClient");

      queryClient.invalidateQueries({
        queryKey: queryKeys.paycheckHistory(),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({
        queryKey: queryKeys.budgetMetadata,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });

      logger.info("Paycheck deleted successfully with proper balance reversal", {
        paycheckId,
        actualBalanceChange: newActualBalance - currentActualBalance,
        unassignedCashChange: newUnassignedCash - currentUnassignedCash,
      });
    } catch (error) {
      logger.error("Failed to delete paycheck with proper balance reversal", error, {
        paycheckId,
        errorMessage: error.message,
        errorStack: error.stack,
      });
      throw error;
    }
  }, []);

  return {
    handleDeletePaycheck,
  };
};

export default usePaycheckOperations;
