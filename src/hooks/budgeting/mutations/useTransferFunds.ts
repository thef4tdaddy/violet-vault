import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, optimisticHelpers } from "@/utils/common/queryClient";
import { budgetDb } from "@/db/budgetDb";
import type { Transaction } from "@/db/types";
import logger from "@/utils/common/logger";
import { validateAndNormalizeTransaction } from "@/domain/schemas/transaction";

interface TransferFundsData {
  fromEnvelopeId: string;
  toEnvelopeId: string;
  amount: number;
  description?: string;
}

// Helper to trigger sync for envelope changes
const triggerEnvelopeSync = (changeType: string) => {
  if (typeof window !== "undefined" && window.cloudSyncService) {
    window.cloudSyncService.triggerSyncForCriticalChange(`envelope_${changeType}`);
  }
};

export const useTransferFunds = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["envelopes", "transfer"],
    mutationFn: async ({
      fromEnvelopeId,
      toEnvelopeId,
      amount,
      description,
    }: TransferFundsData) => {
      // Get current envelopes from Dexie for transfer calculation
      const fromEnvelope = await budgetDb.envelopes.get(fromEnvelopeId);
      const toEnvelope = await budgetDb.envelopes.get(toEnvelopeId);

      if (!fromEnvelope || !toEnvelope) {
        throw new Error("Source or target envelope not found");
      }

      if ((fromEnvelope?.currentBalance ?? 0) < amount) {
        throw new Error("Insufficient balance in source envelope");
      }

      const fromBalance = fromEnvelope?.currentBalance ?? 0;
      const toBalance = toEnvelope?.currentBalance ?? 0;

      // Update balances in Dexie directly
      await budgetDb.envelopes.update(fromEnvelopeId, {
        currentBalance: fromBalance - amount,
        lastModified: Date.now(),
      });

      await budgetDb.envelopes.update(toEnvelopeId, {
        currentBalance: toBalance + amount,
        lastModified: Date.now(),
      });

      // Create transfer transaction in Dexie
      const transaction = createTransferTransaction(
        fromEnvelopeId,
        toEnvelopeId,
        amount,
        description
      );

      await budgetDb.transactions.put(transaction);

      // Apply optimistic updates to cache
      await optimisticHelpers.updateEnvelope(queryClient, fromEnvelopeId, {
        currentBalance: fromBalance - amount,
      });

      await optimisticHelpers.updateEnvelope(queryClient, toEnvelopeId, {
        currentBalance: toBalance + amount,
      });

      await optimisticHelpers.addTransaction(queryClient, transaction);

      return { success: true, transaction, fromEnvelopeId, toEnvelopeId, amount };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });

      // Log successful fund transfer
      logger.info("✅ Funds transferred between envelopes", {
        amount: data.amount,
        fromEnvelope: data.fromEnvelopeId,
        toEnvelope: data.toEnvelopeId,
        transactionId: data.transaction.id,
      });

      triggerEnvelopeSync("updated");
      triggerEnvelopeSync("transfer");
    },
    onError: (error) => {
      logger.error("Failed to transfer funds:", error);
    },
  });
};

/**
 * Helper to construct and validate a transfer transaction object
 */
const createTransferTransaction = (
  fromEnvelopeId: string,
  toEnvelopeId: string,
  amount: number,
  description?: string
): Transaction => {
  const rawTransaction = {
    id: `transfer_${Date.now()}`,
    amount,
    envelopeId: fromEnvelopeId,
    category: "transfer",
    type: "transfer" as const,
    date: new Date(),
    lastModified: Date.now(),
    description: description || `Transfer: ${fromEnvelopeId} → ${toEnvelopeId}`,
  };

  const validatedTransaction = validateAndNormalizeTransaction(rawTransaction);

  return {
    ...validatedTransaction,
    date:
      validatedTransaction.date instanceof Date
        ? validatedTransaction.date
        : new Date(validatedTransaction.date),
    description: validatedTransaction.description ?? undefined,
    merchant: validatedTransaction.merchant ?? undefined,
    receiptUrl: validatedTransaction.receiptUrl ?? undefined,
    isInternalTransfer:
      typeof validatedTransaction.isInternalTransfer === "boolean"
        ? validatedTransaction.isInternalTransfer
        : undefined,
    paycheckId: validatedTransaction.paycheckId ?? undefined,
    toEnvelopeId: validatedTransaction.toEnvelopeId ?? undefined,
    fromEnvelopeId: validatedTransaction.fromEnvelopeId ?? undefined,
  };
};
