import { useQuery, useMutation, useQueryClient, QueryClient } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";
import { useMemo, useCallback, useEffect } from "react";
import { queryKeys, optimisticHelpers } from "@/utils/common/queryClient.ts";
import { budgetDb, VioletVaultDB, getUnassignedCash, setUnassignedCash } from "@/db/budgetDb.ts";
import { ENVELOPE_TYPES, AUTO_CLASSIFY_ENVELOPE_TYPE } from "@/constants/categories.ts";
import logger from "@/utils/common/logger.ts";
import {
  processEnvelopes,
  calculateEnvelopeStats,
  getRepairUpdates,
  type EnhancedEnvelope,
} from "@/utils/budgeting/filtering.ts";
import type { Envelope as DbEnvelope, Envelope, Transaction } from "@/db/types.ts";
import {
  validateEnvelopeSafe,
  validateEnvelopePartialSafe,
} from "../../../domain/schemas/envelope.ts";
import { validateAndNormalizeTransaction } from "../../../domain/schemas/transaction.ts";

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

// --- Helper Functions ---

const triggerSync = (type: string) => {
  const ws = window as unknown as {
    cloudSyncService?: { triggerSyncForCriticalChange: (t: string) => void };
  };
  if (ws.cloudSyncService) ws.cloudSyncService.triggerSyncForCriticalChange(`envelope_${type}`);
};

const sanitizeForDb = (data: Record<string, unknown>): Partial<Envelope> => ({
  ...data,
  lastModified: Date.now(),
  currentBalance: (data.currentBalance as number) ?? 0,
});

const createAddEnvelopeOp = (queryClient: QueryClient) => async (data: Partial<Envelope>) => {
  const e = {
    id: Date.now().toString(),
    archived: false,
    createdAt: Date.now(),
    ...data,
  } as Envelope;
  const record = e as Record<string, unknown>;
  const type =
    (record.type as string) ||
    (record.envelopeType as string) ||
    AUTO_CLASSIFY_ENVELOPE_TYPE(e.category || "expenses");

  // Safely assign proper type depending on what e is. Default to setting 'type'.
  if (!e.type) (e as unknown as Record<string, string>).type = type;
  if (!record.envelopeType) (e as unknown as Record<string, string>).envelopeType = type;
  const val = validateEnvelopeSafe(e);
  if (!val.success) throw new Error("Invalid envelope");
  const final = sanitizeForDb(val.data as unknown as Record<string, unknown>) as Envelope;
  await optimisticHelpers.addEnvelope(queryClient, final);
  await budgetDb.envelopes.put(final);
  return final;
};

const createUpdateEnvelopeOp =
  (queryClient: QueryClient) =>
  async ({ id, updates }: { id: string; updates: Partial<Envelope> }) => {
    const val = validateEnvelopePartialSafe(updates);
    if (!val.success) throw new Error("Invalid update");
    const final = sanitizeForDb(val.data as unknown as Record<string, unknown>);
    await optimisticHelpers.updateEnvelope(queryClient, id, final);
    await budgetDb.envelopes.update(id, final);
    return { id, updates: final };
  };

const createDeleteEnvelopeOp =
  (queryClient: QueryClient) =>
  async ({ id, deleteBillsToo = false }: { id: string; deleteBillsToo?: boolean }) => {
    const env = await budgetDb.envelopes.get(id);
    if (env && (env.currentBalance || 0) > 0) {
      await setUnassignedCash((await getUnassignedCash()) + (env.currentBalance || 0));
    }
    const dbLegacy = budgetDb as unknown as Record<
      string,
      {
        where: (prop: string) => {
          equals: (val: string) => {
            toArray: () => Promise<Record<string, unknown>[]>;
          };
        };
        delete: (id: string) => Promise<void>;
        update: (id: string, updates: Record<string, unknown>) => Promise<void>;
      }
    >;
    const bills = await dbLegacy.bills.where("envelopeId").equals(id).toArray();
    for (const b of bills) {
      const billId = b.id as string;
      if (deleteBillsToo) await dbLegacy.bills.delete(billId);
      else {
        await dbLegacy.bills.update(billId, { envelopeId: undefined });
        await optimisticHelpers.updateBill(queryClient, billId, { envelopeId: undefined });
      }
    }
    await optimisticHelpers.removeEnvelope(queryClient, id);
    await budgetDb.envelopes.delete(id);
    return id;
  };

const createTransferOp =
  (queryClient: QueryClient) =>
  async ({
    from,
    to,
    amount,
    desc,
  }: {
    from: string;
    to: string;
    amount: number;
    desc?: string;
  }) => {
    const fEnv = await budgetDb.envelopes.get(from);
    const tEnv = await budgetDb.envelopes.get(to);
    if (!fEnv || !tEnv || (fEnv.currentBalance || 0) < amount) throw new Error("Transfer failed");

    await budgetDb.envelopes.update(from, {
      currentBalance: (fEnv.currentBalance || 0) - amount,
      lastModified: Date.now(),
    });
    await budgetDb.envelopes.update(to, {
      currentBalance: (tEnv.currentBalance || 0) + amount,
      lastModified: Date.now(),
    });

    const txn = validateAndNormalizeTransaction({
      id: `tr-${Date.now()}`,
      amount,
      envelopeId: from,
      category: "transfer",
      type: "transfer",
      date: new Date(),
      description: desc || `Transfer: ${from} → ${to}`,
      lastModified: Date.now(),
    });
    const finalTxn = { ...txn, date: new Date(txn.date as string) } as Transaction;
    await budgetDb.transactions.put(finalTxn);

    await optimisticHelpers.updateEnvelope(queryClient, from, {
      currentBalance: (fEnv.currentBalance || 0) - amount,
    });
    await optimisticHelpers.updateEnvelope(queryClient, to, {
      currentBalance: (tEnv.currentBalance || 0) + amount,
    });
    await optimisticHelpers.addTransaction(queryClient, finalTxn);
    return { from, to, amount };
  };

// --- Mutation Hooks ---

export const useAddEnvelopeMutation = () => {
  const queryClient = useQueryClient();
  const handleSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    triggerSync("created");
  }, [queryClient]);
  return useMutation({
    mutationFn: createAddEnvelopeOp(queryClient),
    onSuccess: handleSuccess,
  });
};

export const useUpdateEnvelopeMutation = () => {
  const queryClient = useQueryClient();
  const handleSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    triggerSync("updated");
  }, [queryClient]);
  return useMutation({
    mutationFn: createUpdateEnvelopeOp(queryClient),
    onSuccess: handleSuccess,
  });
};

export const useDeleteEnvelopeMutation = () => {
  const queryClient = useQueryClient();
  const handleSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    queryClient.invalidateQueries({ queryKey: queryKeys.bills });
    triggerSync("deleted");
  }, [queryClient]);
  return useMutation({
    mutationFn: createDeleteEnvelopeOp(queryClient),
    onSuccess: handleSuccess,
  });
};

export const useTransferFundsMutation = () => {
  const queryClient = useQueryClient();
  const handleSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
    triggerSync("transfer");
  }, [queryClient]);
  return useMutation({
    mutationFn: createTransferOp(queryClient),
    onSuccess: handleSuccess,
  });
};

export const useEnvelopeOperations = () => {
  const addM = useAddEnvelopeMutation();
  const updateM = useUpdateEnvelopeMutation();
  const deleteM = useDeleteEnvelopeMutation();
  const transferM = useTransferFundsMutation();

  return useMemo(
    () => ({
      addEnvelope: (d: Partial<Envelope>) => addM.mutate(d),
      addEnvelopeAsync: (d: Partial<Envelope>) => addM.mutateAsync(d),
      updateEnvelope: (id: string, u: Partial<Envelope>) => updateM.mutate({ id, updates: u }),
      updateEnvelopeAsync: (id: string, u: Partial<Envelope>) =>
        updateM.mutateAsync({ id, updates: u }),
      deleteEnvelope: (o: { envelopeId: string; deleteBillsToo?: boolean }) =>
        deleteM.mutate({ id: o.envelopeId, deleteBillsToo: o.deleteBillsToo }),
      deleteEnvelopeAsync: (o: { envelopeId: string; deleteBillsToo?: boolean }) =>
        deleteM.mutateAsync({ id: o.envelopeId, deleteBillsToo: o.deleteBillsToo }),
      transferFunds: (o: {
        fromEnvelopeId: string;
        toEnvelopeId: string;
        amount: number;
        description?: string;
      }) =>
        transferM.mutate({
          from: o.fromEnvelopeId,
          to: o.toEnvelopeId,
          amount: o.amount,
          desc: o.description,
        }),
      transferFundsAsync: (o: {
        fromEnvelopeId: string;
        toEnvelopeId: string;
        amount: number;
        description?: string;
      }) =>
        transferM.mutateAsync({
          from: o.fromEnvelopeId,
          to: o.toEnvelopeId,
          amount: o.amount,
          desc: o.description,
        }),
      isProcessing: addM.isPending || updateM.isPending || deleteM.isPending || transferM.isPending,
      isAdding: addM.isPending,
      isUpdating: updateM.isPending,
      isDeleting: deleteM.isPending,
      isTransferring: transferM.isPending,
      error: addM.error || updateM.error || deleteM.error || transferM.error,
    }),
    [addM, updateM, deleteM, transferM]
  );
};

// --- Main Hook ---

export const useEnvelopes = (options: EnvelopesQueryOptions = {}) => {
  const queryClient = useQueryClient();
  const ops = useEnvelopeOperations();

  // --- Query Logic ---

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
      // Use internal update op
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
