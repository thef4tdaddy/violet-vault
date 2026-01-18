/**
 * Budget data mutations using TanStack Query
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, optimisticHelpers } from "@/utils/core/common/queryClient";
import { processTransactionDeletion } from "@/hooks/budgeting/core/useBudgetData/mutationsHelpers";
import logger from "@/utils/core/common/logger";
import type { Envelope, Transaction } from "@/db/types";

export const useBudgetMutations = () => {
  const queryClient = useQueryClient();

  // Envelope Mutations
  const addEnvelopeMutation = useMutation({
    mutationKey: ["envelopes", "add"],
    mutationFn: async (newEnvelope: Omit<Envelope, "lastModified" | "createdAt">) => {
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
    mutationFn: async ({
      envelopeId,
      updates,
    }: {
      envelopeId: string;
      updates: Partial<Envelope>;
    }) => {
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
    mutationFn: async (envelopeId: string) => {
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
    mutationFn: async (newTransaction: Omit<Transaction, "lastModified" | "createdAt">) => {
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
    mutationFn: (transactionId: string) => processTransactionDeletion(transactionId),
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
