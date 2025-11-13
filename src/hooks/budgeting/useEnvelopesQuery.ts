import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";
import { useMemo, useCallback, useEffect } from "react";
import { queryKeys } from "@/utils/common/queryClient";
import { budgetDb, VioletVaultDB } from "@/db/budgetDb";
import { AUTO_CLASSIFY_ENVELOPE_TYPE, ENVELOPE_TYPES } from "@/constants/categories";
import logger from "@/utils/common/logger";
import type { Envelope as DbEnvelope } from "@/db/types";

// Application-level Envelope type with computed properties
interface Envelope extends DbEnvelope {
  // Database properties are inherited from DbEnvelope
  // Additional computed properties:
  color?: string;
  envelopeType: string;
  status: string;
  utilizationRate: number;
  available: number;
  monthlyBudget?: number;
  monthlyAmount?: number;
}

interface EnvelopesQueryOptions {
  category?: string;
  includeArchived?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  __db?: VioletVaultDB;
}

/**
 * Hook for envelope data fetching, filtering, and caching
 * Handles all TanStack Query logic for envelopes
 */
export const useEnvelopesQuery = (options?: EnvelopesQueryOptions) => {
  const queryClient = useQueryClient();
  const {
    category,
    includeArchived = false,
    sortBy = "name",
    sortOrder = "asc",
    __db,
  } = options || {};
  const dbInstance = __db ?? budgetDb;

  // TanStack Query function - hydrates from Dexie, Dexie syncs with Firebase
  const queryFunction = useCallback(async (): Promise<Envelope[]> => {
    logger.debug("TanStack Query: Fetching envelopes from Dexie");

    try {
      let dbEnvelopes: DbEnvelope[] = [];

      // Always fetch from Dexie (single source of truth for local data)
      if (category) {
        dbEnvelopes = await dbInstance.getEnvelopesByCategory(category);
      } else {
        dbEnvelopes = await dbInstance.envelopes.toArray();
      }

      // Transform database envelopes to application envelopes with computed properties
      let envelopes: Envelope[] = dbEnvelopes.map((dbEnvelope) => ({
        ...dbEnvelope,
        color: undefined, // Will be computed elsewhere
        envelopeType: AUTO_CLASSIFY_ENVELOPE_TYPE(dbEnvelope.category || "expenses"),
        status: "active", // Default status, computed elsewhere
        utilizationRate: 0, // Computed elsewhere
        available: dbEnvelope.currentBalance || 0, // Default to current balance
        monthlyBudget: dbEnvelope.targetAmount, // Use target as monthly budget
        monthlyAmount: dbEnvelope.targetAmount, // Use target as monthly amount
      }));

      logger.debug("TanStack Query: Loaded from Dexie", {
        count: envelopes.length,
      });

      // Debug: Check for corrupted envelopes (missing critical fields)
      const corruptedEnvelopes = dbEnvelopes.filter((env) => !env.name || !env.category);
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
          envelope.envelopeType || AUTO_CLASSIFY_ENVELOPE_TYPE(envelope.category || "expenses"),
      }));

      // Apply filters
      let filteredEnvelopes = envelopes;

      if (category) {
        filteredEnvelopes = envelopes.filter((env) => env.category === category);
      }

      if (!includeArchived) {
        filteredEnvelopes = filteredEnvelopes.filter((env) => !env.archived);
      }

      // Savings goals and sinking funds live in their own modules
      filteredEnvelopes = filteredEnvelopes.filter(
        (env) =>
          env.envelopeType !== ENVELOPE_TYPES.SAVINGS &&
          env.envelopeType !== ENVELOPE_TYPES.SINKING_FUND
      );

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
  }, [category, includeArchived, sortBy, sortOrder, dbInstance]);

  // Memoized query options for performance
  const queryOptions = useMemo<UseQueryOptions<Envelope[], unknown>>(
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
      placeholderData: (previousData: Envelope[] | undefined) => previousData, // Use previous data during refetch
      initialData: undefined, // Remove initialData to prevent persister errors
      enabled: true,
    }),
    [category, includeArchived, sortBy, sortOrder, queryFunction]
  );

  // Main envelopes query
  const envelopesQuery = useQuery<Envelope[], unknown>(queryOptions);

  // Listen for import completion to force refresh
  useEffect(() => {
    const handleImportCompleted = () => {
      logger.debug("Import detected, invalidating envelopes cache");
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
    };

    const handleInvalidateAll = () => {
      logger.debug("Invalidating all envelope queries");
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.envelopes, "list"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    };

    window.addEventListener("importCompleted", handleImportCompleted);
    window.addEventListener("invalidateAllQueries", handleInvalidateAll);

    return () => {
      window.removeEventListener("importCompleted", handleImportCompleted);
      window.removeEventListener("invalidateAllQueries", handleInvalidateAll);
    };
  }, [queryClient]);

  return {
    envelopes: envelopesQuery.data || [],
    isLoading: envelopesQuery.isLoading,
    isFetching: envelopesQuery.isFetching,
    isError: envelopesQuery.isError,
    error: envelopesQuery.error,
    refetch: envelopesQuery.refetch,
    invalidate: () => queryClient.invalidateQueries({ queryKey: queryKeys.envelopes }),
  };
};
