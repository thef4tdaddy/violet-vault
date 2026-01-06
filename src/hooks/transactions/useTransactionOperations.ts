import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { budgetDb } from "../../db/budgetDb.ts";
import { queryKeys, optimisticHelpers } from "../../utils/common/queryClient.ts";
import { useTransactionBalanceUpdater } from "./useTransactionBalanceUpdater.ts";
import type { Transaction } from "../../db/types.ts";
import {
  normalizeTransactionAmount,
  validateAndNormalizeTransaction,
  validateTransactionPartialSafe,
} from "@/domain/schemas/transaction";

export interface TransactionInput {
  date?: string;
  amount?: number;
  type?: "income" | "expense" | "transfer";
  category?: string;
  description?: string;
  envelopeId?: string;
  merchant?: string;
  receiptUrl?: string;
  notes?: string;
  [key: string]: unknown;
}

const triggerSync = (changePath: string) => {
  const ws = window as unknown as {
    cloudSyncService?: { triggerSyncForCriticalChange: (path: string) => void };
  };
  if (ws.cloudSyncService)
    ws.cloudSyncService.triggerSyncForCriticalChange(`transaction_${changePath}`);
};

/**
 * Consolidated Transaction Operations Hook
 */
export const useTransactionOperations = () => {
  const queryClient = useQueryClient();
  const { updateBalancesForTransaction } = useTransactionBalanceUpdater();

  const handleSuccess = useCallback(
    (type: string, invalidateEnvelopes = false) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      if (invalidateEnvelopes) queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      triggerSync(type);
    },
    [queryClient]
  );

  const addM = useMutation({
    mutationFn: async (data: TransactionInput): Promise<Transaction> => {
      const envelope = await budgetDb.envelopes.get(data.envelopeId || "");
      if (!envelope) throw new Error("Envelope not found");

      const raw: Transaction = {
        id: Date.now().toString(),
        date: new Date(data.date || new Date().toISOString().split("T")[0]),
        type: data.type || "expense",
        category: data.category || envelope.category || "other",
        amount: data.amount || 0,
        envelopeId: data.envelopeId!,
        description: data.description,
        createdAt: Date.now(),
        lastModified: Date.now(),
      };

      const validated = validateAndNormalizeTransaction(normalizeTransactionAmount(raw));
      const final: Transaction = {
        ...validated,
        date: new Date(validated.date as string),
      } as Transaction;

      await optimisticHelpers.addTransaction(queryClient, final);
      await budgetDb.transactions.put(final);
      await updateBalancesForTransaction(final);
      return final;
    },
    onSuccess: () => handleSuccess("added", true),
  });

  const updateM = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Transaction> }) => {
      const validation = validateTransactionPartialSafe(updates);
      if (!validation.success) throw new Error("Invalid data");
      const normalized = { ...validation.data, lastModified: Date.now() };
      if (normalized.date)
        (normalized as Record<string, unknown>).date = new Date(normalized.date as string);

      await optimisticHelpers.updateTransaction(
        queryClient,
        id,
        normalized as Partial<Transaction>
      );
      await budgetDb.transactions.update(id, normalized as Partial<Transaction>);
      return { id, updates: normalized };
    },
    onSuccess: () => handleSuccess("updated"),
  });

  const deleteM = useMutation({
    mutationFn: async (id: string) => {
      const txn = await budgetDb.transactions.get(id);
      await optimisticHelpers.removeTransaction(queryClient, id);
      await budgetDb.transactions.delete(id);
      if (txn) await updateBalancesForTransaction(txn, true);
      return id;
    },
    onSuccess: () => handleSuccess("deleted"),
  });

  const splitM = useMutation({
    mutationFn: async ({
      originalId,
      splits,
    }: {
      originalId: string;
      splits: TransactionInput[];
    }) => {
      const original = await budgetDb.transactions.get(originalId);
      if (!original) throw new Error("Not found");
      await budgetDb.transactions.delete(originalId);
      await updateBalancesForTransaction(original, true);

      for (const split of splits) {
        const s: Transaction = {
          id: `${originalId}-s-${Date.now()}-${Math.random()}`,
          date: original.date,
          amount: split.amount || 0,
          envelopeId: split.envelopeId || original.envelopeId,
          category: split.category || original.category,
          type: original.type,
          lastModified: Date.now(),
        };
        await budgetDb.transactions.put(s);
        await updateBalancesForTransaction(s);
      }
      return originalId;
    },
    onSuccess: () => handleSuccess("split"),
  });

  const bulkM = useMutation({
    mutationFn: async ({
      operation,
      transactions,
      updates,
    }: {
      operation: string;
      transactions: Transaction[];
      updates?: Partial<Transaction>;
    }) => {
      const results = [];
      if (operation === "delete") {
        for (const t of transactions) {
          await deleteM.mutateAsync(t.id);
          results.push(t.id);
        }
      } else if (operation === "update" || operation === "classify") {
        if (!updates) throw new Error("Updates required for bulk update");
        for (const t of transactions) {
          await updateM.mutateAsync({ id: t.id, updates });
          results.push(t.id);
        }
      }
      return results;
    },
    onSuccess: () => handleSuccess("bulk"),
  });

  return {
    addTransaction: useCallback((d: TransactionInput) => addM.mutateAsync(d), [addM]),
    updateTransaction: useCallback(
      (id: string, u: Partial<Transaction>) => updateM.mutateAsync({ id, updates: u }),
      [updateM]
    ),
    deleteTransaction: useCallback((id: string) => deleteM.mutateAsync(id), [deleteM]),
    splitTransaction: useCallback(
      (id: string, s: TransactionInput[]) => splitM.mutateAsync({ originalId: id, splits: s }),
      [splitM]
    ),
    bulkOperation: useCallback(
      (op: string, trans: Transaction[], u?: Partial<Transaction>) =>
        bulkM.mutateAsync({ operation: op, transactions: trans, updates: u }),
      [bulkM]
    ),
    isProcessing:
      addM.isPending ||
      updateM.isPending ||
      deleteM.isPending ||
      splitM.isPending ||
      bulkM.isPending,
    error: addM.error || updateM.error || deleteM.error || splitM.error || bulkM.error,
  };
};

export default useTransactionOperations;
