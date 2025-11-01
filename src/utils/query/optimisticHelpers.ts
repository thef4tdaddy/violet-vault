// Optimistic Update Helpers - TanStack Query optimistic updates with Dexie persistence
import { budgetDb } from "@/db/budgetDb";
import { budgetDatabaseService } from "@/services/budgetDatabaseService";
import { queryKeys } from "./queryKeys";
import logger from "@/utils/common/logger";
import { cloudSyncService } from "@/services/cloudSyncService";
import type { SavingsGoal } from "@/db/types";

/**
 * Enhanced optimistic update helpers with Dexie persistence for offline support.
 * These helpers update both TanStack Query cache and local database.
 */
export const optimisticHelpers = {
  /**
   * Update envelope optimistically
   */
  updateEnvelope: async (queryClient, envelopeId, updates) => {
    try {
      // Update TanStack Query cache - single envelope
      queryClient.setQueryData(queryKeys.envelopeById(envelopeId), (old) => ({
        ...old,
        ...updates,
        lastModified: Date.now(),
      }));

      // Update TanStack Query cache - envelope list
      queryClient.setQueryData(queryKeys.envelopesList(), (old) => {
        if (!old) return old;
        return old.map((envelope) =>
          envelope.id === envelopeId
            ? { ...envelope, ...updates, lastModified: Date.now() }
            : envelope
        );
      });

      // Update database optimistically
      await budgetDb.envelopes.update(envelopeId, {
        ...updates,
        lastModified: Date.now(),
      });

      logger.debug("Optimistic envelope update completed", {
        envelopeId,
        updates,
      });

      // GitHub Issue #576: Trigger change-based sync after data modification
      if (cloudSyncService?.isRunning) {
        cloudSyncService.scheduleSync("normal");
      }
    } catch (error) {
      logger.warn("Failed to persist optimistic envelope update", {
        error: error.message,
        envelopeId,
        source: "optimisticHelpers",
      });
    }
  },

  /**
   * Add new envelope optimistically
   */
  addEnvelope: async (queryClient, newEnvelope) => {
    try {
      const envelopeWithTimestamp = {
        ...newEnvelope,
        createdAt: Date.now(),
        lastModified: Date.now(),
      };

      // Update TanStack Query cache - envelope list
      queryClient.setQueryData(queryKeys.envelopesList(), (old) => {
        if (!old) return [envelopeWithTimestamp];
        return [envelopeWithTimestamp, ...old];
      });

      // Add to database
      await budgetDb.envelopes.add(envelopeWithTimestamp);

      logger.debug("Optimistic envelope addition completed", {
        envelopeId: newEnvelope.id,
      });

      // GitHub Issue #576: Trigger change-based sync after data modification
      if (cloudSyncService?.isRunning) {
        cloudSyncService.scheduleSync("normal");
      }
    } catch (error) {
      logger.warn("Failed to persist optimistic envelope addition", {
        error: error.message,
        envelopeId: newEnvelope.id,
        source: "optimisticHelpers",
      });
    }
  },

  /**
   * Remove envelope optimistically
   */
  removeEnvelope: async (queryClient, envelopeId) => {
    try {
      // Update TanStack Query cache - envelope list
      queryClient.setQueryData(queryKeys.envelopesList(), (old) => {
        if (!old) return old;
        return old.filter((envelope) => envelope.id !== envelopeId);
      });

      // Remove from cache - single envelope
      queryClient.removeQueries({
        queryKey: queryKeys.envelopeById(envelopeId),
      });

      // Remove from database
      await budgetDb.envelopes.delete(envelopeId);

      logger.debug("Optimistic envelope removal completed", { envelopeId });
    } catch (error) {
      logger.warn("Failed to persist optimistic envelope removal", {
        error: error.message,
        envelopeId,
        source: "optimisticHelpers",
      });
    }
  },

  /**
   * Update transaction optimistically
   */
  updateTransaction: async (queryClient, transactionId, updates) => {
    try {
      // Update TanStack Query cache - single transaction
      queryClient.setQueryData(queryKeys.transactionById(transactionId), (old) => ({
        ...old,
        ...updates,
        lastModified: Date.now(),
      }));

      // Update TanStack Query cache - transaction lists
      queryClient.setQueriesData({ queryKey: queryKeys.transactions }, (old) => {
        if (!old) return old;
        return old.map((transaction) =>
          transaction.id === transactionId
            ? { ...transaction, ...updates, lastModified: Date.now() }
            : transaction
        );
      });

      // Update database
      await budgetDb.transactions.update(transactionId, {
        ...updates,
        lastModified: Date.now(),
      });

      logger.debug("Optimistic transaction update completed", {
        transactionId,
        updates,
      });
    } catch (error) {
      logger.warn("Failed to persist optimistic transaction update", {
        error: error.message,
        transactionId,
        source: "optimisticHelpers",
      });
    }
  },

  /**
   * Add new transaction optimistically
   */
  addTransaction: async (queryClient, newTransaction) => {
    try {
      const transactionWithTimestamp = {
        ...newTransaction,
        createdAt: Date.now(),
        lastModified: Date.now(),
      };

      // Update TanStack Query cache - transaction lists
      queryClient.setQueriesData({ queryKey: queryKeys.transactions }, (old) => {
        if (!old) return [transactionWithTimestamp];
        return [transactionWithTimestamp, ...old];
      });

      // Add to database
      await budgetDb.transactions.add(transactionWithTimestamp);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });

      logger.debug("Optimistic transaction addition completed", {
        transactionId: newTransaction.id,
      });
    } catch (error) {
      logger.warn("Failed to persist optimistic transaction addition", {
        error: error?.message || String(error),
        transactionId: newTransaction?.id || "unknown",
        source: "optimisticHelpers",
      });
    }
  },

  /**
   * Remove transaction optimistically
   */
  removeTransaction: async (queryClient, transactionId) => {
    try {
      // Update TanStack Query cache - transaction lists
      queryClient.setQueriesData({ queryKey: queryKeys.transactions }, (old) => {
        if (!old) return old;
        return old.filter((transaction) => transaction.id !== transactionId);
      });

      // Remove from cache - single transaction
      queryClient.removeQueries({
        queryKey: queryKeys.transactionById(transactionId),
      });

      // Remove from database
      await budgetDb.transactions.delete(transactionId);

      logger.debug("Optimistic transaction removal completed", {
        transactionId,
      });

      // GitHub Issue #576: Trigger change-based sync after data modification
      if (cloudSyncService?.isRunning) {
        cloudSyncService.scheduleSync("normal");
      }
    } catch (error) {
      logger.warn("Failed to persist optimistic transaction removal", {
        error: error.message,
        transactionId,
        source: "optimisticHelpers",
      });
    }
  },

  /**
   * Update bill optimistically
   */
  updateBill: async (queryClient, billId, updates) => {
    try {
      // Update TanStack Query cache - single bill
      queryClient.setQueryData(queryKeys.billById(billId), (old) => ({
        ...old,
        ...updates,
        lastModified: Date.now(),
      }));

      // Update TanStack Query cache - bill lists
      queryClient.setQueriesData({ queryKey: queryKeys.bills }, (old) => {
        if (!old) return old;
        return old.map((bill) =>
          bill.id === billId ? { ...bill, ...updates, lastModified: Date.now() } : bill
        );
      });

      // Update database
      await budgetDb.bills.update(billId, {
        ...updates,
        lastModified: Date.now(),
      });

      logger.debug("Optimistic bill update completed", { billId, updates });
    } catch (error) {
      logger.warn("Failed to persist optimistic bill update", {
        error: error.message,
        billId,
        source: "optimisticHelpers",
      });
    }
  },

  /**
   * Add new savings goal optimistically
   */
  addSavingsGoal: async (newGoal: SavingsGoal) => {
    try {
      const goalWithTimestamp = {
        ...newGoal,
        createdAt: Date.now(),
        lastModified: Date.now(),
      };

      // Add to database
      await budgetDb.savingsGoals.add(goalWithTimestamp);

      logger.debug("Optimistic savings goal addition completed", {
        goalId: newGoal.id,
      });

      // GitHub Issue #576: Trigger change-based sync after data modification
      if (cloudSyncService?.isRunning) {
        cloudSyncService.scheduleSync("normal");
      }
    } catch (error) {
      logger.warn("Failed to persist optimistic savings goal addition", {
        error: error.message,
        goalId: newGoal.id,
        source: "optimisticHelpers",
      });
    }
  },

  /**
   * Update savings goal optimistically
   */
  updateSavingsGoal: async (goalId: string, updatedGoal: Partial<SavingsGoal>) => {
    try {
      // Update database
      await budgetDb.savingsGoals.update(goalId, {
        ...updatedGoal,
        lastModified: Date.now(),
      });

      logger.debug("Optimistic savings goal update completed", {
        goalId,
        updates: updatedGoal,
      });

      // GitHub Issue #576: Trigger change-based sync after data modification
      if (cloudSyncService?.isRunning) {
        cloudSyncService.scheduleSync("normal");
      }
    } catch (error) {
      logger.warn("Failed to persist optimistic savings goal update", {
        error: error.message,
        goalId,
        source: "optimisticHelpers",
      });
    }
  },

  /**
   * Delete savings goal optimistically
   */
  deleteSavingsGoal: async (goalId: string) => {
    try {
      // Remove from database
      await budgetDb.savingsGoals.delete(goalId);

      logger.debug("Optimistic savings goal removal completed", { goalId });

      // GitHub Issue #576: Trigger change-based sync after data modification
      if (cloudSyncService?.isRunning) {
        cloudSyncService.scheduleSync("normal");
      }
    } catch (error) {
      logger.warn("Failed to persist optimistic savings goal removal", {
        error: error.message,
        goalId,
        source: "optimisticHelpers",
      });
    }
  },

  /**
   * Update budget metadata optimistically
   */
  updateBudgetMetadata: async (queryClient, updates) => {
    try {
      // Update TanStack Query cache
      queryClient.setQueryData(queryKeys.budgetMetadata, (old) => ({
        ...old,
        ...updates,
        lastModified: Date.now(),
      }));

      // Update specific metadata queries
      if (updates.unassignedCash !== undefined) {
        queryClient.setQueryData(queryKeys.unassignedCash(), updates.unassignedCash);
      }

      if (updates.actualBalance !== undefined) {
        queryClient.setQueryData(queryKeys.actualBalance(), updates.actualBalance);
      }

      // Update database
      await budgetDatabaseService.saveBudgetMetadata(updates);

      // Invalidate dashboard since metadata changed
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });

      logger.debug("Optimistic budget metadata update completed", { updates });
    } catch (error) {
      logger.warn("Failed to persist optimistic budget metadata update", {
        error: error.message,
        updates,
        source: "optimisticHelpers",
      });
    }
  },

  /**
   * Batch update multiple entities optimistically
   */
  batchUpdate: async (queryClient, updates) => {
    try {
      const { envelopes = [], transactions = [], bills = [] } = updates;

      // Process envelope updates
      for (const envelope of envelopes) {
        if (envelope.id) {
          await optimisticHelpers.updateEnvelope(queryClient, envelope.id, envelope);
        }
      }

      // Process transaction updates
      for (const transaction of transactions) {
        if (transaction.id) {
          await optimisticHelpers.updateTransaction(queryClient, transaction.id, transaction);
        }
      }

      // Process bill updates
      for (const bill of bills) {
        if (bill.id) {
          await optimisticHelpers.updateBill(queryClient, bill.id, bill);
        }
      }

      // Batch invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });

      logger.info("Batch optimistic update completed", {
        envelopeCount: envelopes.length,
        transactionCount: transactions.length,
        billCount: bills.length,
      });
    } catch (error) {
      logger.error("Failed to complete batch optimistic update", error);
    }
  },

  /**
   * Rollback optimistic update on failure
   */
  rollbackUpdate: async (queryClient, queryKey, previousData) => {
    try {
      if (previousData !== undefined) {
        queryClient.setQueryData(queryKey, previousData);
        logger.debug("Rolled back optimistic update", { queryKey });
      } else {
        queryClient.invalidateQueries({ queryKey });
        logger.debug("Invalidated query due to rollback", { queryKey });
      }
    } catch (error) {
      logger.warn("Failed to rollback optimistic update", {
        error: error.message,
        queryKey,
      });
    }
  },

  /**
   * Create mutation config with automatic optimistic updates
   */
  createOptimisticMutation: (queryClient, { mutationKey, queryKey, updateFn, rollbackFn }) => {
    return {
      mutationKey,
      onMutate: async (variables) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey });

        // Snapshot previous value
        const previousData = queryClient.getQueryData(queryKey);

        // Optimistically update
        if (updateFn) {
          queryClient.setQueryData(queryKey, (old) => updateFn(old, variables));
        }

        return { previousData };
      },
      onError: (error, variables, context) => {
        // Rollback on error
        if (context?.previousData !== undefined) {
          queryClient.setQueryData(queryKey, context.previousData);
        }

        if (rollbackFn) {
          rollbackFn(error, variables, context);
        }

        logger.error("Mutation failed, rolled back optimistic update", {
          mutationKey,
          error: error.message,
        });
      },
      onSettled: () => {
        // Always refetch after mutation
        queryClient.invalidateQueries({ queryKey });
      },
    };
  },
};
