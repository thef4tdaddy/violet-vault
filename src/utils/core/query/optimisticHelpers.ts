// Optimistic Update Helpers - TanStack Query optimistic updates with Dexie persistence
import { budgetDb } from "@/db/budgetDb";
import { budgetDatabaseService } from "@/services/budget/budgetDatabaseService";
import { queryKeys } from "./queryKeys";
import logger from "@/utils/core/common/logger";
import { syncOrchestrator } from "@/services/sync/syncOrchestrator";
import type { SavingsGoal, Envelope, Transaction, Bill } from "@/db/types";
import type { QueryClient } from "@tanstack/react-query";

/**
 * Enhanced optimistic update helpers with Dexie persistence for offline support.
 * These helpers update both TanStack Query cache and local database.
 */
export const optimisticHelpers = {
  /**
   * Update envelope optimistically
   */
  updateEnvelope: async (
    queryClient: QueryClient,
    envelopeId: string,
    updates: Partial<Envelope>
  ) => {
    try {
      // Update TanStack Query cache - single envelope
      queryClient.setQueryData(queryKeys.envelopeById(envelopeId), (old: Envelope | undefined) => {
        if (!old) return old;
        return {
          ...old,
          ...updates,
          lastModified: Date.now(),
        };
      });

      // Update TanStack Query cache - envelope list
      queryClient.setQueryData(queryKeys.envelopesList(), (old: Envelope[] | undefined) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((envelope: Envelope) =>
          envelope.id === envelopeId
            ? { ...envelope, ...updates, lastModified: Date.now() }
            : envelope
        );
      });

      // Update database optimistically
      const existing = await budgetDb.envelopes.get(envelopeId);
      if (existing) {
        await budgetDb.envelopes.put({
          ...existing,
          ...updates,
          lastModified: Date.now(),
        } as Envelope);
      } else {
        logger.warn(`Envelope ${envelopeId} not found for optimistic update`);
      }

      logger.debug("Optimistic envelope update completed", {
        envelopeId,
        updates,
      });

      // GitHub Issue #576: Trigger change-based sync after data modification
      if (syncOrchestrator?.isRunning) {
        syncOrchestrator.scheduleSync("normal");
      }
    } catch (error) {
      logger.warn("Failed to persist optimistic envelope update", {
        error: error instanceof Error ? error.message : String(error),
        envelopeId,
        source: "optimisticHelpers",
      });
    }
  },

  /**
   * Add new envelope optimistically
   */
  addEnvelope: async (
    queryClient: QueryClient,
    newEnvelope: Omit<Envelope, "lastModified" | "createdAt">
  ) => {
    try {
      const envelopeWithTimestamp = {
        ...newEnvelope,
        createdAt: Date.now(),
        lastModified: Date.now(),
      } as Envelope;

      // Update TanStack Query cache - envelope list
      queryClient.setQueryData(queryKeys.envelopesList(), (old: Envelope[] | undefined) => {
        if (!old) return [envelopeWithTimestamp];
        return [envelopeWithTimestamp, ...old];
      });

      // Add to database
      await budgetDb.envelopes.add(envelopeWithTimestamp);

      logger.debug("Optimistic envelope addition completed", {
        envelopeId: newEnvelope.id,
      });

      // GitHub Issue #576: Trigger change-based sync after data modification
      if (syncOrchestrator?.isRunning) {
        syncOrchestrator.scheduleSync("normal");
      }
    } catch (error) {
      logger.warn("Failed to persist optimistic envelope addition", {
        error: error instanceof Error ? error.message : String(error),
        envelopeId: newEnvelope.id,
        source: "optimisticHelpers",
      });
    }
  },

  /**
   * Remove envelope optimistically
   */
  removeEnvelope: async (queryClient: QueryClient, envelopeId: string) => {
    try {
      // Update TanStack Query cache - envelope list
      queryClient.setQueryData(queryKeys.envelopesList(), (old: Envelope[] | undefined) => {
        if (!old || !Array.isArray(old)) return old;
        return old.filter((envelope: Envelope) => envelope.id !== envelopeId);
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
        error: error instanceof Error ? error.message : String(error),
        envelopeId,
        source: "optimisticHelpers",
      });
    }
  },

  /**
   * Update transaction optimistically
   */
  updateTransaction: async (
    queryClient: QueryClient,
    transactionId: string,
    updates: Partial<Transaction>
  ) => {
    try {
      // Update TanStack Query cache - single transaction
      queryClient.setQueryData(
        queryKeys.transactionById(transactionId),
        (old: Transaction | undefined) => ({
          ...old,
          ...updates,
          lastModified: Date.now(),
        })
      );

      // Update TanStack Query cache - transaction lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.transactions },
        (old: Transaction[] | undefined) => {
          if (!old || !Array.isArray(old)) return old;
          return old.map((transaction: Transaction) =>
            transaction.id === transactionId
              ? { ...transaction, ...updates, lastModified: Date.now() }
              : transaction
          );
        }
      );

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
        error: error instanceof Error ? error.message : String(error),
        transactionId,
        source: "optimisticHelpers",
      });
    }
  },

  /**
   * Add new transaction optimistically
   */
  addTransaction: async (
    queryClient: QueryClient,
    newTransaction: Omit<Transaction, "lastModified" | "createdAt">
  ) => {
    try {
      const transactionWithTimestamp = {
        ...newTransaction,
        createdAt: Date.now(),
        lastModified: Date.now(),
      } as Transaction;

      // Update TanStack Query cache - transaction lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.transactions },
        (old: Transaction[] | undefined) => {
          if (!old) return [transactionWithTimestamp];
          return [transactionWithTimestamp, ...old];
        }
      );

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
        error: error instanceof Error ? error.message : String(error),
        transactionId: newTransaction?.id || "unknown",
        source: "optimisticHelpers",
      });
    }
  },

  /**
   * Remove transaction optimistically
   */
  removeTransaction: async (queryClient: QueryClient, transactionId: string) => {
    try {
      // Update TanStack Query cache - transaction lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.transactions },
        (old: Transaction[] | undefined) => {
          if (!old || !Array.isArray(old)) return old;
          return old.filter((transaction: Transaction) => transaction.id !== transactionId);
        }
      );

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
      if (syncOrchestrator?.isRunning) {
        syncOrchestrator.scheduleSync("normal");
      }
    } catch (error) {
      logger.warn("Failed to persist optimistic transaction removal", {
        error: error instanceof Error ? error.message : String(error),
        transactionId,
        source: "optimisticHelpers",
      });
    }
  },

  /**
   * Update bill optimistically
   */
  updateBill: async (queryClient: QueryClient, billId: string, updates: Partial<Bill>) => {
    try {
      // Update TanStack Query cache - single bill
      queryClient.setQueryData(queryKeys.billById(billId), (old: Bill | undefined) => ({
        ...old,
        ...updates,
        lastModified: Date.now(),
      }));

      // Update TanStack Query cache - bill lists
      queryClient.setQueriesData({ queryKey: queryKeys.bills }, (old: Bill[] | undefined) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((bill: Bill) =>
          bill.id === billId ? { ...bill, ...updates, lastModified: Date.now() } : bill
        );
      });

      // Update database
      await budgetDb.envelopes.update(billId, {
        ...updates,
        lastModified: Date.now(),
      });

      logger.debug("Optimistic bill update completed", { billId, updates });
    } catch (error) {
      logger.warn("Failed to persist optimistic bill update", {
        error: error instanceof Error ? error.message : String(error),
        billId,
        source: "optimisticHelpers",
      });
    }
  },

  /**
   * Add new savings goal optimistically
   */
  addSavingsGoal: async (newGoal: Omit<SavingsGoal, "lastModified" | "createdAt">) => {
    try {
      const goalWithTimestamp = {
        ...newGoal,
        createdAt: Date.now(),
        lastModified: Date.now(),
      } as SavingsGoal;

      // Add to database
      await budgetDb.envelopes.add({
        ...goalWithTimestamp,
        type: "goal",
      } as Envelope);

      logger.debug("Optimistic savings goal addition completed", {
        goalId: newGoal.id,
      });

      // GitHub Issue #576: Trigger change-based sync after data modification
      if (syncOrchestrator?.isRunning) {
        syncOrchestrator.scheduleSync("normal");
      }
    } catch (error) {
      logger.warn("Failed to persist optimistic savings goal addition", {
        error: error instanceof Error ? error.message : String(error),
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
      await budgetDb.envelopes.update(goalId, {
        ...updatedGoal,
        type: "goal",
        lastModified: Date.now(),
      } as Envelope);

      logger.debug("Optimistic savings goal update completed", {
        goalId,
        updates: updatedGoal,
      });

      // GitHub Issue #576: Trigger change-based sync after data modification
      if (syncOrchestrator?.isRunning) {
        syncOrchestrator.scheduleSync("normal");
      }
    } catch (error) {
      logger.warn("Failed to persist optimistic savings goal update", {
        error: error instanceof Error ? error.message : String(error),
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
      await budgetDb.envelopes.delete(goalId);

      logger.debug("Optimistic savings goal removal completed", { goalId });

      // GitHub Issue #576: Trigger change-based sync after data modification
      if (syncOrchestrator?.isRunning) {
        syncOrchestrator.scheduleSync("normal");
      }
    } catch (error) {
      logger.warn("Failed to persist optimistic savings goal removal", {
        error: error instanceof Error ? error.message : String(error),
        goalId,
        source: "optimisticHelpers",
      });
    }
  },

  /**
   * Update budget metadata optimistically
   */
  updateBudgetMetadata: async (queryClient: QueryClient, updates: Record<string, unknown>) => {
    try {
      // Update TanStack Query cache
      queryClient.setQueryData(
        queryKeys.budgetMetadata,
        (old: Record<string, unknown> | undefined) => ({
          ...old,
          ...updates,
          lastModified: Date.now(),
        })
      );

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
        error: error instanceof Error ? error.message : String(error),
        updates,
        source: "optimisticHelpers",
      });
    }
  },

  /**
   * Batch update multiple entities optimistically
   */
  batchUpdate: async (
    queryClient: QueryClient,
    updates: {
      envelopes?: Partial<Envelope>[];
      transactions?: Partial<Transaction>[];
      bills?: Partial<Bill>[];
    }
  ) => {
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
      logger.error(
        "Failed to complete batch optimistic update",
        error instanceof Error ? error.message : String(error)
      );
    }
  },

  /**
   * Rollback optimistic update on failure
   */
  rollbackUpdate: async (queryClient: QueryClient, queryKey: unknown[], previousData: unknown) => {
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
        error: error instanceof Error ? error.message : String(error),
        queryKey,
      });
    }
  },

  /**
   * Create mutation config with automatic optimistic updates
   */
  createOptimisticMutation: (
    queryClient: QueryClient,
    {
      mutationKey,
      queryKey,
      updateFn,
      rollbackFn,
    }: {
      mutationKey: unknown[];
      queryKey: unknown[];
      updateFn?: (old: unknown, variables: unknown) => unknown;
      rollbackFn?: (error: unknown, variables: unknown, context: unknown) => void;
    }
  ) => {
    return {
      mutationKey,
      onMutate: async (variables: unknown) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey });

        // Snapshot previous value
        const previousData = queryClient.getQueryData(queryKey);

        // Optimistically update
        if (updateFn) {
          queryClient.setQueryData(queryKey, (old: unknown) => updateFn(old, variables));
        }

        return { previousData };
      },
      onError: (error: unknown, variables: unknown, context: { previousData?: unknown }) => {
        // Rollback on error
        if (context?.previousData !== undefined) {
          queryClient.setQueryData(queryKey, context.previousData);
        }

        if (rollbackFn) {
          rollbackFn(error, variables, context);
        }

        logger.error("Mutation failed, rolled back optimistic update", {
          mutationKey,
          error: error instanceof Error ? error.message : String(error),
        });
      },
      onSettled: () => {
        // Always refetch after mutation
        queryClient.invalidateQueries({ queryKey });
      },
    };
  },
};
