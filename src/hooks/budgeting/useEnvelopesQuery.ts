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
  /**
   * Filter to only include specific envelope types.
   * When set, only envelopes matching these types will be returned.
   * Example: ["savings"] to get only savings goals
   */
  envelopeTypes?: string[];
  /**
   * Filter to exclude specific envelope types.
   * By default, excludes savings, sinking_fund, and supplemental envelopes.
   * Set to empty array [] to include all envelope types.
   */
  excludeEnvelopeTypes?: string[];
  __db?: VioletVaultDB;
}

// Default envelope types to exclude (savings, sinking_fund, supplemental live in their own pages)
const DEFAULT_EXCLUDED_TYPES = [
  ENVELOPE_TYPES.SAVINGS,
  ENVELOPE_TYPES.SINKING_FUND,
  ENVELOPE_TYPES.SUPPLEMENTAL,
];

// Valid envelope types from ENVELOPE_TYPES constant
const VALID_ENVELOPE_TYPES = Object.values(ENVELOPE_TYPES);

/**
 * Validate if an envelope type is a known valid type
 */
const isValidEnvelopeType = (envelopeType: string | undefined): boolean => {
  return !!envelopeType && VALID_ENVELOPE_TYPES.includes(envelopeType as (typeof ENVELOPE_TYPES)[keyof typeof ENVELOPE_TYPES]);
};

/**
 * Transform database envelopes to application envelopes with computed properties
 */
const transformEnvelopes = (dbEnvelopes: DbEnvelope[]): Envelope[] => {
  return dbEnvelopes.map((dbEnvelope) => ({
    ...dbEnvelope,
    color: undefined,
    // Use database envelopeType if it's valid, otherwise auto-classify
    envelopeType: isValidEnvelopeType(dbEnvelope.envelopeType)
      ? dbEnvelope.envelopeType!
      : AUTO_CLASSIFY_ENVELOPE_TYPE(dbEnvelope.category || "expenses"),
    status: "active",
    utilizationRate: 0,
    available: dbEnvelope.currentBalance || 0,
    monthlyBudget: dbEnvelope.targetAmount,
    monthlyAmount: dbEnvelope.targetAmount,
  }));
};

/**
 * Apply envelope type filtering.
 * Note: When `envelopeTypes` is provided, it takes precedence over `excludeEnvelopeTypes`.
 * This allows for explicit inclusion filtering to override default exclusions.
 */
const filterByEnvelopeType = (
  envelopes: Envelope[],
  envelopeTypes?: string[],
  excludeEnvelopeTypes?: string[]
): Envelope[] => {
  // Include filter takes precedence over exclude filter
  if (envelopeTypes && envelopeTypes.length > 0) {
    return envelopes.filter((env) => envelopeTypes.includes(env.envelopeType));
  }
  if (excludeEnvelopeTypes && excludeEnvelopeTypes.length > 0) {
    return envelopes.filter((env) => !excludeEnvelopeTypes.includes(env.envelopeType));
  }
  return envelopes;
};

/**
 * Sort envelopes by specified field and order
 */
const sortEnvelopes = (
  envelopes: Envelope[],
  sortBy: string,
  sortOrder: "asc" | "desc"
): Envelope[] => {
  return [...envelopes].sort((a, b) => {
    const aValue: unknown = a[sortBy as keyof typeof a];
    const bValue: unknown = b[sortBy as keyof typeof b];

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }

    const aStr = String(aValue || "").toLowerCase();
    const bStr = String(bValue || "").toLowerCase();

    return sortOrder === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });
};

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
    envelopeTypes,
    excludeEnvelopeTypes = DEFAULT_EXCLUDED_TYPES,
    __db,
  } = options || {};
  const dbInstance = __db ?? budgetDb;

  // TanStack Query function - hydrates from Dexie, Dexie syncs with Firebase
  const queryFunction = useCallback(async (): Promise<Envelope[]> => {
    logger.debug("TanStack Query: Fetching envelopes from Dexie");

    try {
      // Fetch from Dexie (single source of truth for local data)
      const dbEnvelopes: DbEnvelope[] = category
        ? await dbInstance.getEnvelopesByCategory(category)
        : await dbInstance.envelopes.toArray();

      // Transform and log
      let envelopes = transformEnvelopes(dbEnvelopes);
      logger.debug("TanStack Query: Loaded from Dexie", { count: envelopes.length });

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

      // Apply category filter
      if (category) {
        envelopes = envelopes.filter((env) => env.category === category);
      }

      // Apply archived filter
      if (!includeArchived) {
        envelopes = envelopes.filter((env) => !env.archived);
      }

      // Apply envelope type filtering
      envelopes = filterByEnvelopeType(envelopes, envelopeTypes, excludeEnvelopeTypes);

      // Apply sorting and return
      return sortEnvelopes(envelopes, sortBy, sortOrder);
    } catch (error) {
      logger.error("TanStack Query: Dexie fetch failed", error);
      return [];
    }
  }, [
    category,
    includeArchived,
    sortBy,
    sortOrder,
    envelopeTypes,
    excludeEnvelopeTypes,
    dbInstance,
  ]);

  // Memoized query options for performance
  const queryOptions = useMemo<UseQueryOptions<Envelope[], unknown>>(
    () => ({
      queryKey: queryKeys.envelopesList({
        category,
        includeArchived,
        sortBy,
        sortOrder,
        envelopeTypes,
        excludeEnvelopeTypes,
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
    [
      category,
      includeArchived,
      sortBy,
      sortOrder,
      envelopeTypes,
      excludeEnvelopeTypes,
      queryFunction,
    ]
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
