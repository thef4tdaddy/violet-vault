import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useCallback, useEffect } from "react";
import { useBudgetStore } from "../stores/budgetStore";
import { queryKeys, optimisticHelpers } from "../utils/queryClient";
import { budgetDb } from "../db/budgetDb";

/**
 * Specialized hook for envelope management
 * Provides focused envelope operations with smart filtering and caching
 */
const useEnvelopes = (options = {}) => {
  const queryClient = useQueryClient();
  const {
    category,
    includeArchived = false,
    sortBy = "name",
    sortOrder = "asc",
  } = options;

  // Get Zustand store for mutations
  const {
    envelopes: zustandEnvelopes,
    addEnvelope: zustandAddEnvelope,
    updateEnvelope: zustandUpdateEnvelope,
    deleteEnvelope: zustandDeleteEnvelope,
    transferFunds: zustandTransferFunds,
  } = useBudgetStore();

  // TanStack Query function - hydrates from Dexie, Dexie syncs with Firebase
  const queryFunction = useCallback(async () => {
    console.log("🔄 TanStack Query: Fetching envelopes from Dexie...");

    try {
      let envelopes = [];

      // Always fetch from Dexie (single source of truth for local data)
      if (category) {
        envelopes = await budgetDb.getEnvelopesByCategory(category);
      } else {
        envelopes = await budgetDb.envelopes.toArray();
      }

      console.log("✅ TanStack Query: Loaded from Dexie:", envelopes.length);

      // If Dexie is empty and we have Zustand data, it means we need to seed Dexie
      if (
        envelopes.length === 0 &&
        zustandEnvelopes &&
        zustandEnvelopes.length > 0
      ) {
        console.log("🌱 TanStack Query: Seeding Dexie from Zustand...");
        await budgetDb.bulkUpsertEnvelopes(zustandEnvelopes);
        envelopes = [...zustandEnvelopes];
      }

      // Apply filters
      let filteredEnvelopes = envelopes;

      if (category) {
        filteredEnvelopes = envelopes.filter(
          (env) => env.category === category,
        );
      }

      if (!includeArchived) {
        filteredEnvelopes = filteredEnvelopes.filter((env) => !env.archived);
      }

      // Apply sorting
      filteredEnvelopes.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        // Handle numeric values
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
        }

        // Handle string values
        aValue = String(aValue || "").toLowerCase();
        bValue = String(bValue || "").toLowerCase();

        if (sortOrder === "asc") {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });

      return filteredEnvelopes;
    } catch (error) {
      console.error("❌ TanStack Query: Dexie fetch failed:", error);
      // Emergency fallback only when Dexie completely fails
      return zustandEnvelopes || [];
    }
  }, [zustandEnvelopes, category, includeArchived, sortBy, sortOrder]);

  // Memoized query options for performance
  const queryOptions = useMemo(
    () => ({
      queryKey: queryKeys.envelopesList({
        category,
        includeArchived,
        sortBy,
        sortOrder,
      }),
      queryFn: queryFunction,
      staleTime: 5 * 60 * 1000, // 5 minutes - reduce refetches
      gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
      refetchOnMount: false, // Don't refetch if data is fresh
      refetchOnWindowFocus: false, // Don't refetch on window focus
      placeholderData: (previousData) => previousData, // Use previous data during refetch
      initialData: undefined, // Remove initialData to prevent persister errors
      enabled: true,
    }),
    [category, includeArchived, sortBy, sortOrder, queryFunction],
  );

  // Main envelopes query
  const envelopesQuery = useQuery(queryOptions);

  // Listen for import completion to force refresh
  useEffect(() => {
    const handleImportCompleted = () => {
      console.log("🔄 Import detected, invalidating envelopes cache");
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
    };

    const handleInvalidateAll = () => {
      console.log("🔄 Invalidating all envelope queries");
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopesList });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    };

    window.addEventListener("importCompleted", handleImportCompleted);
    window.addEventListener("invalidateAllQueries", handleInvalidateAll);

    return () => {
      window.removeEventListener("importCompleted", handleImportCompleted);
      window.removeEventListener("invalidateAllQueries", handleInvalidateAll);
    };
  }, [queryClient]);

  // Add envelope mutation
  const addEnvelopeMutation = useMutation({
    mutationKey: ["envelopes", "add"],
    mutationFn: async (envelopeData) => {
      const newEnvelope = {
        id: Date.now().toString(),
        currentBalance: 0,
        targetAmount: 0,
        category: "expenses",
        archived: false,
        createdAt: new Date().toISOString(),
        ...envelopeData,
      };

      // Optimistic update
      await optimisticHelpers.addEnvelope(newEnvelope);

      // Call Zustand mutation
      zustandAddEnvelope(newEnvelope);

      return newEnvelope;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error) => {
      console.error("Failed to add envelope:", error);
      // TODO: Implement rollback logic
    },
  });

  // Update envelope mutation
  const updateEnvelopeMutation = useMutation({
    mutationKey: ["envelopes", "update"],
    mutationFn: async ({ id, updates }) => {
      // Apply optimistic update
      await optimisticHelpers.updateEnvelope(id, updates);

      // Call Zustand mutation
      zustandUpdateEnvelope(id, updates);

      return { id, updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error) => {
      console.error("Failed to update envelope:", error);
      // TODO: Implement rollback logic
    },
  });

  // Delete envelope mutation
  const deleteEnvelopeMutation = useMutation({
    mutationKey: ["envelopes", "delete"],
    mutationFn: async (envelopeId) => {
      // Apply optimistic update
      await optimisticHelpers.removeEnvelope(envelopeId);

      // Call Zustand mutation
      zustandDeleteEnvelope(envelopeId);

      return envelopeId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error) => {
      console.error("Failed to delete envelope:", error);
      // TODO: Implement rollback logic
    },
  });

  // Fund transfer mutation
  const transferFundsMutation = useMutation({
    mutationKey: ["envelopes", "transfer"],
    mutationFn: async ({
      fromEnvelopeId,
      toEnvelopeId,
      amount,
      description,
    }) => {
      // Call Zustand mutation
      const result = zustandTransferFunds(
        fromEnvelopeId,
        toEnvelopeId,
        amount,
        description,
      );

      // Update both envelopes in cache and Dexie
      const fromEnvelope = zustandEnvelopes.find(
        (env) => env.id === fromEnvelopeId,
      );
      const toEnvelope = zustandEnvelopes.find(
        (env) => env.id === toEnvelopeId,
      );

      if (fromEnvelope) {
        await optimisticHelpers.updateEnvelope(fromEnvelopeId, {
          currentBalance: fromEnvelope.currentBalance - amount,
        });
      }

      if (toEnvelope) {
        await optimisticHelpers.updateEnvelope(toEnvelopeId, {
          currentBalance: toEnvelope.currentBalance + amount,
        });
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error) => {
      console.error("Failed to transfer funds:", error);
      // TODO: Implement rollback logic
    },
  });

  // Computed values
  const envelopes = envelopesQuery.data || [];
  const totalBalance = envelopes.reduce(
    (sum, env) => sum + (env.currentBalance || 0),
    0,
  );
  const totalTargetAmount = envelopes.reduce(
    (sum, env) => sum + (env.targetAmount || 0),
    0,
  );
  const underfundedEnvelopes = envelopes.filter(
    (env) => (env.currentBalance || 0) < (env.targetAmount || 0),
  );
  const overfundedEnvelopes = envelopes.filter(
    (env) => (env.currentBalance || 0) > (env.targetAmount || 0),
  );

  // Utility functions
  const getEnvelopeById = (id) => envelopes.find((env) => env.id === id);

  const getEnvelopesByCategory = (cat) =>
    envelopes.filter((env) => env.category === cat);

  const getAvailableCategories = () => {
    const categories = new Set(envelopes.map((env) => env.category));
    return Array.from(categories).sort();
  };

  return {
    // Data
    envelopes,
    totalBalance,
    totalTargetAmount,
    underfundedEnvelopes,
    overfundedEnvelopes,
    availableCategories: getAvailableCategories(),

    // Loading states
    isLoading: envelopesQuery.isLoading,
    isFetching: envelopesQuery.isFetching,
    isError: envelopesQuery.isError,
    error: envelopesQuery.error,

    // Mutation functions
    addEnvelope: addEnvelopeMutation.mutate,
    addEnvelopeAsync: addEnvelopeMutation.mutateAsync,
    updateEnvelope: updateEnvelopeMutation.mutate,
    updateEnvelopeAsync: updateEnvelopeMutation.mutateAsync,
    deleteEnvelope: deleteEnvelopeMutation.mutate,
    deleteEnvelopeAsync: deleteEnvelopeMutation.mutateAsync,
    transferFunds: transferFundsMutation.mutate,
    transferFundsAsync: transferFundsMutation.mutateAsync,

    // Mutation states
    isAdding: addEnvelopeMutation.isPending,
    isUpdating: updateEnvelopeMutation.isPending,
    isDeleting: deleteEnvelopeMutation.isPending,
    isTransferring: transferFundsMutation.isPending,

    // Utility functions
    getEnvelopeById,
    getEnvelopesByCategory,

    // Query controls
    refetch: envelopesQuery.refetch,
    invalidate: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes }),
  };
};

export { useEnvelopes };
export default useEnvelopes;
