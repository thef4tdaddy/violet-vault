import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
    sortBy = 'name',
    sortOrder = 'asc' 
  } = options;

  // Get Zustand store for mutations
  const {
    envelopes: zustandEnvelopes,
    addEnvelope: zustandAddEnvelope,
    updateEnvelope: zustandUpdateEnvelope,
    deleteEnvelope: zustandDeleteEnvelope,
    transferFunds: zustandTransferFunds,
  } = useBudgetStore();

  // Smart query function with filtering
  const queryFunction = async () => {
    let envelopes = [];

    // Try Zustand first for real-time data
    if (zustandEnvelopes && zustandEnvelopes.length > 0) {
      envelopes = [...zustandEnvelopes];
    } else {
      // Fallback to Dexie for offline support
      if (category) {
        envelopes = await budgetDb.getEnvelopesByCategory(category);
      } else {
        envelopes = await budgetDb.envelopes.toArray();
      }
    }

    // Apply filters
    let filteredEnvelopes = envelopes;

    if (category) {
      filteredEnvelopes = filteredEnvelopes.filter(env => env.category === category);
    }

    if (!includeArchived) {
      filteredEnvelopes = filteredEnvelopes.filter(env => !env.archived);
    }

    // Apply sorting
    filteredEnvelopes.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      // Handle numeric fields
      if (sortBy === 'currentBalance' || sortBy === 'targetAmount') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }

      // Handle string fields
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortOrder === 'desc') {
        return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
      } else {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      }
    });

    return filteredEnvelopes;
  };

  // Main envelopes query
  const envelopesQuery = useQuery({
    queryKey: queryKeys.envelopesList({ category, includeArchived, sortBy, sortOrder }),
    queryFn: queryFunction,
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: true,
  });

  // Add envelope mutation
  const addEnvelopeMutation = useMutation({
    mutationKey: ["envelopes", "add"],
    mutationFn: async (envelopeData) => {
      const newEnvelope = {
        id: Date.now().toString(),
        currentBalance: 0,
        targetAmount: 0,
        category: 'expenses',
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
    onSuccess: (newEnvelope) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error, variables, context) => {
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
    onError: (error, variables, context) => {
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
    onError: (error, variables, context) => {
      console.error("Failed to delete envelope:", error);
      // TODO: Implement rollback logic
    },
  });

  // Fund transfer mutation
  const transferFundsMutation = useMutation({
    mutationKey: ["envelopes", "transfer"],
    mutationFn: async ({ fromEnvelopeId, toEnvelopeId, amount, description }) => {
      // Call Zustand mutation
      const result = zustandTransferFunds(fromEnvelopeId, toEnvelopeId, amount, description);
      
      // Update both envelopes in cache and Dexie
      const fromEnvelope = zustandEnvelopes.find(env => env.id === fromEnvelopeId);
      const toEnvelope = zustandEnvelopes.find(env => env.id === toEnvelopeId);
      
      if (fromEnvelope) {
        await optimisticHelpers.updateEnvelope(fromEnvelopeId, {
          currentBalance: fromEnvelope.currentBalance - amount
        });
      }
      
      if (toEnvelope) {
        await optimisticHelpers.updateEnvelope(toEnvelopeId, {
          currentBalance: toEnvelope.currentBalance + amount
        });
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error, variables, context) => {
      console.error("Failed to transfer funds:", error);
      // TODO: Implement rollback logic
    },
  });

  // Computed values
  const envelopes = envelopesQuery.data || [];
  const totalBalance = envelopes.reduce((sum, env) => sum + (env.currentBalance || 0), 0);
  const totalTargetAmount = envelopes.reduce((sum, env) => sum + (env.targetAmount || 0), 0);
  const underfundedEnvelopes = envelopes.filter(env => 
    (env.currentBalance || 0) < (env.targetAmount || 0)
  );
  const overfundedEnvelopes = envelopes.filter(env => 
    (env.currentBalance || 0) > (env.targetAmount || 0)
  );

  // Utility functions
  const getEnvelopeById = (id) => envelopes.find(env => env.id === id);
  
  const getEnvelopesByCategory = (cat) => envelopes.filter(env => env.category === cat);
  
  const getAvailableCategories = () => {
    const categories = new Set(envelopes.map(env => env.category));
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
    invalidate: () => queryClient.invalidateQueries({ queryKey: queryKeys.envelopes }),
  };
};

export default useEnvelopes;