import { useCallback } from "react";
import logger from "@/utils/common/logger";
import {
  validatePaycheckDeletion,
  calculateReversedBalances,
  deletePaycheckRecord,
  invalidatePaycheckCaches,
} from "@/utils/layout/paycheckDeletionUtils";

import type { PaycheckHistory } from "@/db/types";

interface BudgetDb {
  paycheckHistory: {
    delete: (id: string | number) => Promise<void>;
  };
}

interface QueryClient {
  invalidateQueries: (opts: unknown) => Promise<void>;
}

/**
 * Paycheck operations hook
 * Extracts complex paycheck deletion logic from ViewRenderer
 * Handles proper balance reversal and UI updates
 *
 * @returns {Object} Paycheck operation handlers
 */
export const usePaycheckOperations = () => {
  const handleDeletePaycheck = useCallback(
    async (paycheckId: string | number, paycheckHistory: PaycheckHistory[]) => {
      try {
        logger.info("Starting paycheck deletion process", {
          paycheckId,
          paycheckIdType: typeof paycheckId,
        });

        // Validate and find paycheck
        const paycheckToDelete = validatePaycheckDeletion(paycheckId, paycheckHistory);

        // Import required database functions
        const { budgetDb, getBudgetMetadata, setBudgetMetadata } = await import("@/db/budgetDb");

        // Calculate new balances and handle envelope reversals
        const balances = await calculateReversedBalances(
          paycheckToDelete,
          budgetDb as unknown as {
            envelopes: {
              get: (id: string | number) => Promise<unknown>;
              update: (id: string | number, data: unknown) => Promise<void>;
            };
          },
          async () => {
            const metadata = await getBudgetMetadata();
            if (!metadata) return null;
            return {
              actualBalance: (metadata as { actualBalance?: number }).actualBalance,
              unassignedCash: (metadata as { unassignedCash?: number }).unassignedCash,
            };
          }
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
        const budgetDbTyped = budgetDb as unknown as BudgetDb;
        await deletePaycheckRecord(paycheckId, budgetDbTyped);

        // Invalidate caches
        const { queryClient, queryKeys } = await import("@/utils/common/queryClient");
        await invalidatePaycheckCaches(queryClient as QueryClient, queryKeys);

        logger.info("Paycheck deleted successfully with proper balance reversal", {
          paycheckId,
          actualBalanceChange: balances.newActualBalance - balances.currentActualBalance,
          unassignedCashChange: balances.newUnassignedCash - balances.currentUnassignedCash,
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const errorStack = error instanceof Error ? error.stack : undefined;
        logger.error("Failed to delete paycheck with proper balance reversal", error, {
          paycheckId,
          errorMessage,
          errorStack,
        });
        throw error;
      }
    },
    []
  );

  return {
    handleDeletePaycheck,
  };
};

export default usePaycheckOperations;
