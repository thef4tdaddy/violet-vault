import { useMutation, useQueryClient, QueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { budgetDb, getUnassignedCash, setUnassignedCash } from "../../db/budgetDb.ts";
import { queryKeys, optimisticHelpers } from "../../utils/common/queryClient.ts";
import { AUTO_CLASSIFY_ENVELOPE_TYPE } from "../../constants/categories.ts";
import {
  validateEnvelopeSafe,
  validateEnvelopePartialSafe,
} from "../../domain/schemas/envelope.ts";
import { validateAndNormalizeTransaction } from "../../domain/schemas/transaction.ts";
import type { Envelope, Transaction } from "../../db/types.ts";

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
  if (!e.envelopeType) e.envelopeType = AUTO_CLASSIFY_ENVELOPE_TYPE(e.category || "expenses");
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
    const bills = await budgetDb.bills.where("envelopeId").equals(id).toArray();
    for (const b of bills) {
      if (deleteBillsToo) await budgetDb.bills.delete(b.id);
      else {
        await budgetDb.bills.update(b.id, { envelopeId: undefined });
        await optimisticHelpers.updateBill(queryClient, b.id, { envelopeId: undefined });
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

export const useEnvelopeOperations = () => {
  const queryClient = useQueryClient();
  const handleSuccess = useCallback(
    (type: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      triggerSync(type);
    },
    [queryClient]
  );

  const addM = useMutation({
    mutationFn: createAddEnvelopeOp(queryClient),
    onSuccess: () => handleSuccess("created"),
  });

  const updateM = useMutation({
    mutationFn: createUpdateEnvelopeOp(queryClient),
    onSuccess: () => handleSuccess("updated"),
  });

  const deleteM = useMutation({
    mutationFn: createDeleteEnvelopeOp(queryClient),
    onSuccess: () => {
      handleSuccess("deleted");
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
    },
  });

  const transferM = useMutation({
    mutationFn: createTransferOp(queryClient),
    onSuccess: () => {
      handleSuccess("transfer");
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
    },
  });

  return {
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
  };
};

export default useEnvelopeOperations;
