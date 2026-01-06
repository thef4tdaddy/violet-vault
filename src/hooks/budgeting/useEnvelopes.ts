import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";
import { useMemo, useCallback, useEffect } from "react";
import { queryKeys } from "../../utils/common/queryClient.ts";
import { budgetDb, VioletVaultDB } from "../../db/budgetDb.ts";
import { ENVELOPE_TYPES } from "../../constants/categories.ts";
import logger from "../../utils/common/logger.ts";
import {
  processEnvelopes,
  calculateEnvelopeStats,
  getRepairUpdates,
  type EnhancedEnvelope,
} from "../../utils/budgeting/filtering.ts";
import type { Envelope as DbEnvelope } from "../../db/types.ts";
import { useEnvelopeOperations } from "./useEnvelopeOperations.ts";

export interface EnvelopesQueryOptions {
  category?: string;
  includeArchived?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  envelopeTypes?: string[];
  excludeEnvelopeTypes?: string[];
  __db?: VioletVaultDB;
}

const DEFAULT_EXCLUDED_TYPES = [
  ENVELOPE_TYPES.SAVINGS,
  ENVELOPE_TYPES.SINKING_FUND,
  ENVELOPE_TYPES.SUPPLEMENTAL,
];

export const useEnvelopes = (options: EnvelopesQueryOptions = {}) => {
  const queryClient = useQueryClient();
  const ops = useEnvelopeOperations();

  const {
    category,
    includeArchived = false,
    sortBy = "name",
    sortOrder = "asc",
    envelopeTypes,
    excludeEnvelopeTypes = DEFAULT_EXCLUDED_TYPES,
    __db,
  } = options;
  const dbInstance = __db ?? budgetDb;

  const queryFunction = useCallback(async (): Promise<EnhancedEnvelope[]> => {
    try {
      const dbEnvelopes: DbEnvelope[] = category
        ? await dbInstance.getEnvelopesByCategory(category)
        : await dbInstance.envelopes.toArray();

      return processEnvelopes(dbEnvelopes, {
        category,
        includeArchived,
        envelopeTypes,
        excludeEnvelopeTypes,
        sortBy,
        sortOrder,
      });
    } catch (error) {
      logger.error("useEnvelopes: Dexie fetch failed", error);
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

  const queryOptions = useMemo<UseQueryOptions<EnhancedEnvelope[], unknown>>(
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
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      placeholderData: (prev) => prev,
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

  const envelopesQuery = useQuery(queryOptions);

  useEffect(() => {
    const handleRefresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
    window.addEventListener("importCompleted", handleRefresh);
    window.addEventListener("invalidateAllQueries", handleRefresh);
    return () => {
      window.removeEventListener("importCompleted", handleRefresh);
      window.removeEventListener("invalidateAllQueries", handleRefresh);
    };
  }, [queryClient]);

  const stats = useMemo(
    () => calculateEnvelopeStats(envelopesQuery.data || []),
    [envelopesQuery.data]
  );

  const repairCorruptedEnvelope = useCallback(
    async (id: string, name: string, category: string) => {
      return ops.updateEnvelopeAsync(id, getRepairUpdates(name, category));
    },
    [ops]
  );

  return {
    envelopes: envelopesQuery.data || [],
    isLoading: envelopesQuery.isLoading || ops.isProcessing,
    isFetching: envelopesQuery.isFetching,
    isError: envelopesQuery.isError,
    refetch: envelopesQuery.refetch,
    invalidate: () => queryClient.invalidateQueries({ queryKey: queryKeys.envelopes }),
    ...ops, // helper methods
    error: envelopesQuery.error || ops.error, // Combine errors, overriding ops.error
    ...stats,
    repairCorruptedEnvelope,
  };
};

export default useEnvelopes;
