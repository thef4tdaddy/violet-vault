// Bill Mutation Functions - CRUD operations and data modifications
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, optimisticHelpers } from "../../../utils/common/queryClient";
import { budgetDb } from "../../../db/budgetDb";
import logger from "../../../utils/common/logger";
import type { Transaction, Bill } from "../../../db/types";

interface CloudSyncService {
  triggerSyncForCriticalChange(change: string): void;
}

interface WindowWithCloudSync extends Window {
  cloudSyncService?: CloudSyncService;
}

// Helper to trigger sync for bill changes
const triggerBillSync = (changeType: string) => {
  const windowWithSync = window as unknown as WindowWithCloudSync;
  if (typeof windowWithSync !== "undefined" && windowWithSync.cloudSyncService) {
    windowWithSync.cloudSyncService.triggerSyncForCriticalChange(`bill_${changeType}`);
  }
};

// Helper to create payment transaction record
const createPaymentTransaction = (
  bill: Bill,
  billId: string,
  paidAmount: number,
  paymentDate: string,
  envelopeId?: string
): Transaction => {
  return {
    id: `${billId}_payment_${Date.now()}`,
    date: new Date(paymentDate),
    description: bill.name || "Bill Payment",
    amount: -Math.abs(paidAmount), // Negative for expense
    envelopeId: envelopeId || "unassigned",
    category: bill.category || "Bills & Utilities",
    type: "expense" as const,
    lastModified: Date.now(),
    createdAt: Date.now(),
  };
};

interface PaymentUpdateParams {
  queryClient: ReturnType<typeof useQueryClient>;
  envelopeId: string;
  paidAmount: number;
  paymentDate: string;
  billId: string;
  transactionId: string;
}

// Helper to update envelope balance after payment
const updateEnvelopeForPayment = async ({
  queryClient,
  envelopeId,
  paidAmount,
  paymentDate,
  billId,
  transactionId,
}: PaymentUpdateParams) => {
  const envelope = await budgetDb.envelopes.get(envelopeId);
  if (!envelope) return;

  const newBalance = (envelope.currentBalance || 0) - paidAmount;
  const envelopeUpdate = {
    currentBalance: newBalance,
    updatedAt: new Date().toISOString(),
    lastTransaction: {
      type: "bill_payment",
      amount: -paidAmount,
      date: paymentDate,
      billId: billId,
      transactionId: transactionId,
    },
    name: envelope.name || `Envelope ${envelopeId}`,
    category: envelope.category || "Other",
  };

  await budgetDb.envelopes.update(envelopeId, envelopeUpdate);
  await optimisticHelpers.updateEnvelope(queryClient, envelopeId, {
    currentBalance: newBalance,
  });

  logger.debug("💰 Updated envelope balance for bill payment", {
    envelopeId,
    envelopeName: envelope.name,
    oldBalance: envelope.currentBalance || 0,
    newBalance,
    paidAmount,
  });
};

/**
 * Add bill mutation hook
 */
export const useAddBillMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["bills", "add"],
    mutationFn: async (billData: Record<string, unknown>) => {
      // Generate unique ID with better collision resistance
      const uniqueId = `bill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newBill = {
        id: uniqueId,
        name: (billData.name as string) || "Unnamed Bill",
        dueDate: new Date(billData.dueDate as string | Date),
        amount: (billData.amount as number) || 0,
        category: (billData.category as string) || "Uncategorized",
        isPaid: false, // Default to unpaid
        isRecurring: (billData.isRecurring as boolean) || false,
        lastModified: Date.now(),
        ...billData,
        createdAt: Date.now(),
      };

      // Persist to Dexie (optimistic update handled by React Query)
      await budgetDb.bills.add(newBill);

      return newBill;
    },
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.bills });

      // Snapshot previous value for rollback
      const previousBills = queryClient.getQueryData(queryKeys.bills);
      return { previousBills };
    },
    onSuccess: (bill) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
      queryClient.invalidateQueries({
        queryKey: (queryKeys.billsList as unknown as () => unknown[])(),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetMetadata });

      // Log successful bill addition
      logger.info("✅ Bill added", {
        name: bill.name,
        amount: bill.amount,
        dueDate: bill.dueDate,
        category: bill.category,
        isRecurring: bill.isRecurring,
      });

      // Trigger cloud sync
      triggerBillSync("add");
    },
    onError: (
      error: Error,
      _billData: Record<string, unknown>,
      context: { previousBills?: unknown } | undefined
    ) => {
      logger.error("Failed to add bill:", error);
      // Rollback optimistic update if needed
      if (context?.previousBills) {
        queryClient.setQueryData(queryKeys.bills, context.previousBills);
      }
    },
  });
};

/**
 * Update bill mutation hook
 */
export const useUpdateBillMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["bills", "update"],
    mutationFn: async ({
      billId,
      updates,
    }: {
      billId: string;
      updates: Record<string, unknown>;
    }) => {
      const existingBill = await budgetDb.bills.get(billId);
      if (!existingBill) {
        throw new Error(`Bill with ID ${billId} not found`);
      }

      const updatedBill = {
        ...existingBill,
        ...updates,
        id: billId, // Ensure ID stays the same
        lastModified: Date.now(),
      };

      // Update in Dexie (optimistic update handled by React Query)
      await budgetDb.bills.update(billId, updatedBill);

      return updatedBill;
    },
    onSuccess: (bill, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
      queryClient.invalidateQueries({
        queryKey: (queryKeys.billsList as unknown as () => unknown[])(),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetMetadata });

      // Log successful bill update
      logger.info("✅ Bill updated", {
        name: bill.name,
        billId: variables.billId,
        updates: Object.keys(variables.updates),
      });

      triggerBillSync("update");
    },
    onError: (error: Error) => {
      logger.error("Failed to update bill:", error);
    },
  });
};

/**
 * Delete bill mutation hook
 */
export const useDeleteBillMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["bills", "delete"],
    mutationFn: async (billId: string) => {
      // Delete from Dexie (optimistic update handled by React Query)
      await budgetDb.bills.delete(billId);

      return billId;
    },
    onSuccess: (billId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
      queryClient.invalidateQueries({
        queryKey: (queryKeys.billsList as unknown as () => unknown[])(),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetMetadata });

      // Log successful bill deletion
      logger.info("✅ Bill deleted", {
        billId: billId,
      });

      triggerBillSync("delete");
    },
    onError: (error: Error) => {
      logger.error("Failed to delete bill:", error);
    },
  });
};

/**
 * Mark bill paid mutation hook
 */
export const useMarkBillPaidMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["bills", "markPaid"],
    mutationFn: async ({
      billId,
      paidAmount,
      paidDate,
      envelopeId,
    }: {
      billId: string;
      paidAmount: number;
      paidDate?: string;
      envelopeId?: string;
    }) => {
      const bill = await budgetDb.bills.get(billId);
      if (!bill) {
        throw new Error(`Bill with ID ${billId} not found`);
      }

      const paymentDate = paidDate || new Date().toISOString().split("T")[0];

      // Apply to Dexie directly (optimistic update handled by React Query)
      // Note: These properties extend the Bill interface for payment tracking
      await budgetDb.bills.update(billId, {
        isPaid: true,
        paidAmount,
        paidDate: paymentDate,
        envelopeId,
        lastPaid: new Date().toISOString(),
        lastModified: Date.now(),
      } as Partial<Bill> & {
        paidAmount?: number;
        paidDate?: string;
        lastPaid?: string;
      });

      // Create transaction record for the bill payment
      const paymentTransaction = createPaymentTransaction(
        bill,
        billId,
        paidAmount,
        paymentDate,
        envelopeId
      );

      // Add transaction to Dexie
      await budgetDb.transactions.put(paymentTransaction);
      await optimisticHelpers.addTransaction(queryClient, paymentTransaction);

      // If bill is linked to envelope, update envelope balance
      if (envelopeId && paidAmount) {
        await updateEnvelopeForPayment({
          queryClient,
          envelopeId,
          paidAmount,
          paymentDate,
          billId,
          transactionId: paymentTransaction.id,
        });
      }

      return { billId, paymentTransaction };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
      queryClient.invalidateQueries({
        queryKey: (queryKeys.billsList as unknown as () => unknown[])(),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });

      // Log successful bill payment
      logger.info("✅ Bill marked as paid", {
        billId: variables.billId,
        paidAmount: variables.paidAmount,
        envelope: variables.envelopeId || "unassigned",
        transactionCreated: !!data.paymentTransaction,
      });

      triggerBillSync("mark_paid");
    },
    onError: (error: Error) => {
      logger.error("Failed to mark bill as paid:", error);
    },
  });
};
