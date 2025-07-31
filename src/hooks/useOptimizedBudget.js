import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import useOptimizedBudgetStore from "../stores/optimizedBudgetStore";
import { optimizedDb } from "../db/optimizedDb";
import { queryKeys, optimisticHelpers } from "../utils/optimizedQueryClient";

const LOCAL_ONLY_MODE = import.meta.env.VITE_LOCAL_ONLY_MODE === "true";

// Unified hook that combines Zustand, Dexie, and TanStack Query
export const useOptimizedBudget = () => {
  const queryClient = useQueryClient();

  // Zustand store
  const store = useOptimizedBudgetStore();

  // Query for envelopes with Dexie integration
  const { data: envelopes = [], isLoading: envelopesLoading } = useQuery({
    queryKey: queryKeys.envelopesList(),
    queryFn: async () => {
      if (!LOCAL_ONLY_MODE) {
        const localEnvelopes = await optimizedDb.envelopes.toArray();
        if (localEnvelopes.length > 0) {
          return localEnvelopes;
        }
      }

      return store.envelopes;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Optimized envelope mutations
  const addEnvelopeMutation = useMutation({
    mutationKey: ["envelopes", "add"],
    mutationFn: async (envelope) => {
      if (!LOCAL_ONLY_MODE) {
        await optimizedDb.envelopes.add(envelope);
      }

      store.addEnvelope(envelope);

      return envelope;
    },
    onMutate: async (newEnvelope) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.envelopesList() });

      // Optimistic update
      optimisticHelpers.addEnvelope(newEnvelope);

      return { newEnvelope };
    },
    onError: (err, newEnvelope, context) => {
      // Rollback optimistic update
      if (context?.newEnvelope) {
        optimisticHelpers.removeEnvelope(context.newEnvelope.id);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopesList() });
    },
  });

  const updateEnvelopeMutation = useMutation({
    mutationKey: ["envelopes", "update"],
    mutationFn: async (envelope) => {
      if (!LOCAL_ONLY_MODE) {
        await optimizedDb.envelopes.put(envelope);
      }

      store.updateEnvelope(envelope);

      return envelope;
    },
    onMutate: async (updatedEnvelope) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.envelopeById(updatedEnvelope.id),
      });

      // Get previous value for rollback
      const previousEnvelope = queryClient.getQueryData(queryKeys.envelopeById(updatedEnvelope.id));

      // Optimistic update
      optimisticHelpers.updateEnvelope(updatedEnvelope.id, updatedEnvelope);

      return { previousEnvelope, updatedEnvelope };
    },
    onError: (err, updatedEnvelope, context) => {
      // Rollback to previous value
      if (context?.previousEnvelope) {
        optimisticHelpers.updateEnvelope(updatedEnvelope.id, context.previousEnvelope);
      }
    },
  });

  const deleteEnvelopeMutation = useMutation({
    mutationKey: ["envelopes", "delete"],
    mutationFn: async (envelopeId) => {
      if (!LOCAL_ONLY_MODE) {
        await optimizedDb.envelopes.delete(envelopeId);
      }

      store.deleteEnvelope(envelopeId);

      return envelopeId;
    },
    onMutate: async (envelopeId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.envelopesList() });

      // Get previous data for rollback
      const previousEnvelopes = queryClient.getQueryData(queryKeys.envelopesList());

      // Optimistic update
      optimisticHelpers.removeEnvelope(envelopeId);

      return { previousEnvelopes, envelopeId };
    },
    onError: (err, envelopeId, context) => {
      // Rollback
      if (context?.previousEnvelopes) {
        queryClient.setQueryData(queryKeys.envelopesList(), context.previousEnvelopes);
      }
    },
  });

  // Performance-optimized selectors
  const getEnvelopeById = useCallback(
    (id) => {
      return envelopes.find((e) => e.id === id);
    },
    [envelopes]
  );

  const getEnvelopesByCategory = useCallback(
    (category) => {
      return envelopes.filter((e) => e.category === category);
    },
    [envelopes]
  );

  const getTotalBalance = useCallback(() => {
    return envelopes.reduce((sum, e) => sum + (e.currentBalance || 0), 0);
  }, [envelopes]);

  // Background sync
  const syncData = useCallback(async () => {
    if (LOCAL_ONLY_MODE) {
      return true;
    }

    try {
      const [dexieEnvelopes, dexieTransactions, dexieBills] = await Promise.all([
        optimizedDb.envelopes.toArray(),
        optimizedDb.transactions.toArray(),
        optimizedDb.bills.toArray(),
      ]);

      queryClient.setQueryData(queryKeys.envelopesList(), dexieEnvelopes);
      queryClient.setQueryData(queryKeys.transactionsList(), dexieTransactions);
      queryClient.setQueryData(queryKeys.billsList(), dexieBills);

      store.setEnvelopes(dexieEnvelopes);

      return true;
    } catch (error) {
      console.error("Sync failed:", error);
      return false;
    }
  }, [queryClient, store]);

  return {
    // Data
    envelopes,
    isLoading: envelopesLoading,

    // Mutations
    addEnvelope: addEnvelopeMutation.mutate,
    updateEnvelope: updateEnvelopeMutation.mutate,
    deleteEnvelope: deleteEnvelopeMutation.mutate,

    // Mutation states
    isAddingEnvelope: addEnvelopeMutation.isPending,
    isUpdatingEnvelope: updateEnvelopeMutation.isPending,
    isDeletingEnvelope: deleteEnvelopeMutation.isPending,

    // Selectors
    getEnvelopeById,
    getEnvelopesByCategory,
    getTotalBalance,

    // Utilities
    syncData,

    // Raw store access for advanced use cases
    store,
  };
};
