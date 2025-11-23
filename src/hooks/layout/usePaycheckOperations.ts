import { useCallback } from "react";
import logger from "../../utils/common/logger";
import {
  validatePaycheckDeletion,
  calculateReversedBalances,
  deletePaycheckRecord,
  invalidatePaycheckCaches,
} from "../../utils/layout/paycheckDeletionUtils";

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
      logger.info("Starting paycheck deletion process", {
        paycheckId,
        paycheckIdType: typeof paycheckId,
      });

      // Validate and find paycheck
      const paycheckToDelete = validatePaycheckDeletion(paycheckId, paycheckHistory);

      // Import required database functions
      const { budgetDb, getBudgetMetadata, setBudgetMetadata } = await import("../../db/budgetDb");

      // Calculate new balances and handle envelope reversals
      const balances = await calculateReversedBalances(
        paycheckToDelete,
        budgetDb as unknown as {
          envelopes: {
            get: (id: string | number) => Promise<unknown>;
            update: (id: string | number, data: unknown) => Promise<void>;
          };
        },
        getBudgetMetadata as unknown as () => Promise<{
          actualBalance?: number;
          unassignedCash?: number;
        }>
      );

      // Update budget metadata
      logger.info("Updating budget metadata", {
        oldActualBalance: balances.currentActualBalance,
        newActualBalance: balances.newActualBalance,
        oldUnassignedCash: balances.currentUnassignedCash,
        newUnassignedCash: balances.newUnassignedCash,
      });

      await setBudgetMetadata({
        actualBalance: balances.newActualBalance,
        unassignedCash: balances.newUnassignedCash,
      });

      // Delete paycheck record
      await deletePaycheckRecord(paycheckId, budgetDb);

      // Invalidate caches
      const { queryClient, queryKeys } = await import("../../utils/common/queryClient");
      await invalidatePaycheckCaches(queryClient, queryKeys);

      logger.info("Paycheck deleted successfully with proper balance reversal", {
        paycheckId,
        actualBalanceChange: balances.newActualBalance - balances.currentActualBalance,
        unassignedCashChange: balances.newUnassignedCash - balances.currentUnassignedCash,
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
