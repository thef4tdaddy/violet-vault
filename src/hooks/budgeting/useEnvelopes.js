import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useCallback, useEffect } from "react";
import { queryKeys, optimisticHelpers } from "../../utils/common/queryClient";
import { budgetDb } from "../../db/budgetDb";
import { AUTO_CLASSIFY_ENVELOPE_TYPE } from "../../constants/categories";
import logger from "../../utils/common/logger";

// Helper to trigger sync for envelope changes
const triggerEnvelopeSync = (changeType) => {
  if (typeof window !== "undefined" && window.cloudSyncService) {
    window.cloudSyncService.triggerSyncForCriticalChange(
      `envelope_${changeType}`,
    );
  }
};

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

  // Zustand no longer contains data arrays - only UI state
  // All data operations now go through TanStack Query → Dexie

  // TanStack Query function - hydrates from Dexie, Dexie syncs with Firebase
  const queryFunction = useCallback(async () => {
    logger.debug("TanStack Query: Fetching envelopes from Dexie");

    try {
      let envelopes = [];

      // Always fetch from Dexie (single source of truth for local data)
      if (category) {
        envelopes = await budgetDb.getEnvelopesByCategory(category);
      } else {
        envelopes = await budgetDb.envelopes.toArray();
      }

      logger.debug("TanStack Query: Loaded from Dexie", {
        count: envelopes.length,
      });

      // Debug: Check for corrupted envelopes (missing critical fields)
      const corruptedEnvelopes = envelopes.filter(
        (env) => !env.name || !env.category,
      );
      if (corruptedEnvelopes.length > 0) {
        logger.warn("Found corrupted envelopes missing critical fields", {
          count: corruptedEnvelopes.length,
          corruptedEnvelopes: corruptedEnvelopes.map((env) => ({
            id: env.id,
            name: env.name || "[MISSING NAME]",
            category: env.category || "[MISSING CATEGORY]",
            currentBalance: env.currentBalance,
          })),
        });
      }

      // Ensure all envelopes have envelopeType set for consistency
      envelopes = envelopes.map((envelope) => ({
        ...envelope,
        envelopeType:
          envelope.envelopeType ||
          AUTO_CLASSIFY_ENVELOPE_TYPE(envelope.category || "expenses"),
      }));

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
      logger.error("TanStack Query: Dexie fetch failed", error);
      // Return empty array when Dexie fails (no fallback to Zustand)
      return [];
    }
  }, [category, includeArchived, sortBy, sortOrder]);

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
      logger.debug("Import detected, invalidating envelopes cache");
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
    };

    const handleInvalidateAll = () => {
      logger.debug("Invalidating all envelope queries");
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
        // Ensure envelopeType is set using auto-classification
        envelopeType:
          envelopeData.envelopeType ||
          AUTO_CLASSIFY_ENVELOPE_TYPE(envelopeData.category || "expenses"),
      };

      // Optimistic update
      await optimisticHelpers.addEnvelope(newEnvelope);

      // Use put() instead of add() to handle duplicates gracefully
      await budgetDb.envelopes.put(newEnvelope);

      return newEnvelope;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      // Trigger immediate sync for envelope addition
      triggerEnvelopeSync("added");
    },
    onError: (error) => {
      logger.error("Failed to add envelope:", error);
      // TODO: Implement rollback logic
    },
  });

  // Update envelope mutation
  const updateEnvelopeMutation = useMutation({
    mutationKey: ["envelopes", "update"],
    mutationFn: async ({ id, updates }) => {
      // Validate envelope data before update to prevent corruption
      const existingEnvelope = await budgetDb.envelopes.get(id);
      if (!existingEnvelope) {
        throw new Error(`Envelope ${id} not found`);
      }

      // Ensure critical fields aren't accidentally cleared
      const safeUpdates = {
        ...updates,
        // Preserve essential fields if they exist and aren't being intentionally cleared
        name: updates.name !== undefined ? updates.name : existingEnvelope.name,
        category:
          updates.category !== undefined
            ? updates.category
            : existingEnvelope.category,
      };

      // Log envelope updates for debugging corruption issues
      logger.info("Updating envelope", {
        envelopeId: id,
        existingName: existingEnvelope.name,
        newName: safeUpdates.name,
        updates: Object.keys(updates),
        source: "updateEnvelopeMutation",
      });

      // Apply optimistic update with validated data
      await optimisticHelpers.updateEnvelope(id, safeUpdates);

      // Apply to Dexie directly with safe updates
      await budgetDb.envelopes.update(id, {
        ...safeUpdates,
        updatedAt: new Date().toISOString(),
      });

      return { id, updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      // Trigger immediate sync for envelope update
      triggerEnvelopeSync("updated");
    },
    onError: (error) => {
      logger.error("Failed to update envelope:", error);
      // TODO: Implement rollback logic
    },
  });

  // Delete envelope mutation
  const deleteEnvelopeMutation = useMutation({
    mutationKey: ["envelopes", "delete"],
    mutationFn: async ({ envelopeId, deleteBillsToo = false }) => {
      // Get the envelope to check if it has money
      const envelope = await budgetDb.envelopes.get(envelopeId);

      if (envelope && envelope.currentBalance > 0) {
        // Transfer the money to unassigned cash before deletion
        const { getUnassignedCash, setUnassignedCash } = await import(
          "../../db/budgetDb"
        );
        const currentUnassignedCash = await getUnassignedCash();
        const newUnassignedCash =
          currentUnassignedCash + envelope.currentBalance;

        await setUnassignedCash(newUnassignedCash);

        logger.info(
          `Transferred $${envelope.currentBalance.toFixed(2)} from deleted envelope "${envelope.name}" to unassigned cash`,
        );
      }

      // Handle connected bills if requested
      if (deleteBillsToo) {
        logger.info(`Deleting envelope ${envelopeId} and connected bills`);

        // Get all bills connected to this envelope
        const connectedBills = await budgetDb.bills
          .where("envelopeId")
          .equals(envelopeId)
          .toArray();

        if (connectedBills.length > 0) {
          logger.info(
            `Found ${connectedBills.length} connected bills to delete`,
          );

          // Delete each connected bill
          for (const bill of connectedBills) {
            await budgetDb.bills.delete(bill.id);
            await optimisticHelpers.removeBill(bill.id);
          }
        }
      } else {
        // Disconnect bills but don't delete them
        const connectedBills = await budgetDb.bills
          .where("envelopeId")
          .equals(envelopeId)
          .toArray();

        if (connectedBills.length > 0) {
          logger.info(
            `Disconnecting ${connectedBills.length} bills from envelope ${envelopeId}`,
          );

          // Remove envelope connection from bills
          for (const bill of connectedBills) {
            await budgetDb.bills.update(bill.id, { envelopeId: null });
            await optimisticHelpers.updateBill(bill.id, { envelopeId: null });
          }
        }
      }

      // Apply optimistic update
      await optimisticHelpers.removeEnvelope(envelopeId);

      // Apply to Dexie directly
      await budgetDb.envelopes.delete(envelopeId);

      return {
        envelopeId,
        deleteBillsToo,
        transferredAmount: envelope?.currentBalance || 0,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetMetadata });

      // Always invalidate bill queries since they might be affected by disconnection/deletion
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });

      // Trigger immediate sync for envelope deletion
      triggerEnvelopeSync("deleted");
    },
    onError: (error) => {
      logger.error("Failed to delete envelope:", error);
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
      // Get current envelopes from Dexie for transfer calculation
      const fromEnvelope = await budgetDb.envelopes.get(fromEnvelopeId);
      const toEnvelope = await budgetDb.envelopes.get(toEnvelopeId);

      if (!fromEnvelope || !toEnvelope) {
        throw new Error("Source or target envelope not found");
      }

      if (fromEnvelope.currentBalance < amount) {
        throw new Error("Insufficient balance in source envelope");
      }

      // Update balances in Dexie directly
      await budgetDb.envelopes.update(fromEnvelopeId, {
        currentBalance: fromEnvelope.currentBalance - amount,
        updatedAt: new Date().toISOString(),
      });

      await budgetDb.envelopes.update(toEnvelopeId, {
        currentBalance: toEnvelope.currentBalance + amount,
        updatedAt: new Date().toISOString(),
      });

      // Create transfer transaction in Dexie
      const transaction = {
        id: `transfer_${Date.now()}`,
        amount,
        description:
          description || `Transfer: ${fromEnvelopeId} → ${toEnvelopeId}`,
        type: "transfer",
        fromEnvelopeId,
        toEnvelopeId,
        date: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString(),
      };

      await budgetDb.transactions.put(transaction);

      // Apply optimistic updates to cache
      await optimisticHelpers.updateEnvelope(fromEnvelopeId, {
        currentBalance: fromEnvelope.currentBalance - amount,
      });

      await optimisticHelpers.updateEnvelope(toEnvelopeId, {
        currentBalance: toEnvelope.currentBalance + amount,
      });

      await optimisticHelpers.addTransaction(transaction);

      return { success: true, transaction };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      // Trigger immediate sync for fund transfer
      triggerEnvelopeSync("transfer");
    },
    onError: (error) => {
      logger.error("Failed to transfer funds:", error);
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

  // Repair corrupted envelopes
  const repairCorruptedEnvelope = async (
    envelopeId,
    name,
    category = "utilities",
  ) => {
    logger.info("Repairing corrupted envelope", { envelopeId, name, category });

    const updates = {
      name,
      category,
      // Set reasonable defaults for missing fields
      targetAmount: 100,
      monthlyBudget: 50,
      biweeklyAllocation: 25,
      envelopeType: AUTO_CLASSIFY_ENVELOPE_TYPE(category),
      description: `Repaired envelope: ${name}`,
      lastUpdate: new Date().toISOString(),
    };

    return updateEnvelopeMutation.mutateAsync({ id: envelopeId, updates });
  };

  // Wrapper functions for envelope deletion with bill handling
  const deleteEnvelopeWrapper = (envelopeId, deleteBillsToo = false) => {
    deleteEnvelopeMutation.mutate({ envelopeId, deleteBillsToo });
  };

  const deleteEnvelopeAsyncWrapper = (envelopeId, deleteBillsToo = false) => {
    return deleteEnvelopeMutation.mutateAsync({ envelopeId, deleteBillsToo });
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
    deleteEnvelope: deleteEnvelopeWrapper,
    deleteEnvelopeAsync: deleteEnvelopeAsyncWrapper,
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
    repairCorruptedEnvelope,

    // Query controls
    refetch: envelopesQuery.refetch,
    invalidate: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes }),
  };
};

export { useEnvelopes };
export default useEnvelopes;
