/**
 * Budget data mutations using TanStack Query
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, optimisticHelpers } from "../../../utils/common/queryClient";
import { budgetDb, getBudgetMetadata, setBudgetMetadata } from "../../../db/budgetDb";
import logger from "../../../utils/common/logger.js";

export const useBudgetMutations = () => {
  const queryClient = useQueryClient();

  // Envelope Mutations
  const addEnvelopeMutation = useMutation({
    mutationKey: ["envelopes", "add"],
    mutationFn: async (newEnvelope) => {
      await optimisticHelpers.addEnvelope(queryClient, newEnvelope);
      return newEnvelope;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error) => {
      logger.error("Failed to add envelope", error, {
        source: "addEnvelopeMutation",
      });
    },
  });

  const updateEnvelopeMutation = useMutation({
    mutationKey: ["envelopes", "update"],
    mutationFn: async ({ envelopeId, updates }) => {
      await optimisticHelpers.updateEnvelope(queryClient, envelopeId, updates);
      return { envelopeId, updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });

  const deleteEnvelopeMutation = useMutation({
    mutationKey: ["envelopes", "delete"],
    mutationFn: async (envelopeId) => {
      await optimisticHelpers.removeEnvelope(queryClient, envelopeId);
      return envelopeId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });

  // Transaction Mutations
  const addTransactionMutation = useMutation({
    mutationKey: ["transactions", "add"],
    mutationFn: async (newTransaction) => {
      await optimisticHelpers.addTransaction(queryClient, newTransaction);
      return newTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary() });
      queryClient.invalidateQueries({ queryKey: queryKeys.unassignedCash() });
      queryClient.invalidateQueries({ queryKey: queryKeys.actualBalance() });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetMetadata });
      queryClient.refetchQueries({ queryKey: queryKeys.dashboardSummary() });
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationKey: ["transactions", "delete"],
    mutationFn: async (transactionId) => {
      logger.info("Starting transaction deletion", { transactionId });

      // Get the transaction to check if it has an associated paycheck
      const transaction = await budgetDb.transactions.get(transactionId);
      if (!transaction) {
        throw new Error("Transaction not found");
      }

      // If this transaction is linked to a paycheck, delete the paycheck too
      if (transaction.paycheckId) {
        logger.info("Transaction is linked to paycheck, deleting paycheck too", {
          transactionId,
          paycheckId: transaction.paycheckId,
        });

        try {
          const paycheckRecord = await budgetDb.paycheckHistory.get(transaction.paycheckId);
          if (paycheckRecord) {
            // Reverse the balance changes
            const currentMetadata = await getBudgetMetadata();
            const currentActualBalance = currentMetadata?.actualBalance || 0;
            const currentUnassignedCash = currentMetadata?.unassignedCash || 0;

            // Calculate new balances by reversing the paycheck
            const newActualBalance = currentActualBalance - paycheckRecord.amount;
            const unassignedCashChange =
              paycheckRecord.unassignedCashAfter - paycheckRecord.unassignedCashBefore;
            const newUnassignedCash = currentUnassignedCash - unassignedCashChange;

            // Update budget metadata
            await setBudgetMetadata({
              actualBalance: newActualBalance,
              unassignedCash: newUnassignedCash,
            });

            // Reverse envelope allocations if any
            if (paycheckRecord.envelopeAllocations?.length > 0) {
              for (const allocation of paycheckRecord.envelopeAllocations) {
                const envelope = await budgetDb.envelopes.get(allocation.envelopeId);
                if (envelope) {
                  const newBalance = envelope.currentBalance - allocation.amount;
                  await budgetDb.envelopes.update(allocation.envelopeId, {
                    currentBalance: Math.max(0, newBalance),
                  });
                }
              }
            }

            // Delete the paycheck record
            await budgetDb.paycheckHistory.delete(transaction.paycheckId);

            logger.info("Associated paycheck deleted and effects reversed", {
              paycheckId: transaction.paycheckId,
              actualBalanceChange: newActualBalance - currentActualBalance,
              unassignedCashChange: newUnassignedCash - currentUnassignedCash,
            });

            // Also delete the transaction and return
            await budgetDb.transactions.delete(transactionId);
            return {
              success: true,
              transactionId,
              deletedPaycheck: transaction.paycheckId,
            };
          }
        } catch (error) {
          logger.error("Failed to delete associated paycheck", error);
          // Continue with just deleting the transaction
        }
      }

      // Delete the transaction
      await budgetDb.transactions.delete(transactionId);

      logger.info("Transaction deleted successfully", { transactionId });
      return { success: true, transactionId };
    },
    onSuccess: () => {
      // Comprehensive cache invalidation for all dashboard components
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.paycheckHistory() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary() });
      queryClient.invalidateQueries({ queryKey: queryKeys.unassignedCash() });
      queryClient.invalidateQueries({ queryKey: queryKeys.actualBalance() });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetMetadata });

      // Force immediate refetch for summary cards
      queryClient.refetchQueries({ queryKey: queryKeys.dashboardSummary() });
      queryClient.refetchQueries({ queryKey: queryKeys.unassignedCash() });
      queryClient.refetchQueries({ queryKey: queryKeys.actualBalance() });
    },
  });

  return {
    // Envelope mutations
    addEnvelope: addEnvelopeMutation.mutate,
    addEnvelopeAsync: addEnvelopeMutation.mutateAsync,
    updateEnvelope: updateEnvelopeMutation.mutate,
    updateEnvelopeAsync: updateEnvelopeMutation.mutateAsync,
    deleteEnvelope: deleteEnvelopeMutation.mutate,
    deleteEnvelopeAsync: deleteEnvelopeMutation.mutateAsync,

    // Transaction mutations
    addTransaction: addTransactionMutation.mutate,
    addTransactionAsync: addTransactionMutation.mutateAsync,
    deleteTransaction: deleteTransactionMutation.mutate,
    deleteTransactionAsync: deleteTransactionMutation.mutateAsync,

    // Loading states
    isAddingEnvelope: addEnvelopeMutation.isPending,
    isUpdatingEnvelope: updateEnvelopeMutation.isPending,
    isDeletingEnvelope: deleteEnvelopeMutation.isPending,
    isAddingTransaction: addTransactionMutation.isPending,
    isDeletingTransaction: deleteTransactionMutation.isPending,
  };
};
