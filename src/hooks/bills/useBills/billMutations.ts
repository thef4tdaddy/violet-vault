// Bill Mutation Functions - CRUD operations and data modifications
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, optimisticHelpers } from "../../../utils/common/queryClient";
import { budgetDb } from "../../../db/budgetDb";
import logger from "../../../utils/common/logger";
import type { Transaction, Bill } from "../../../db/types";
import { validateBillPartialSafe, validateBillSafe } from "@/domain/schemas/bill";
import { validateAndNormalizeTransaction } from "@/domain/schemas/transaction";

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

      // Validate with Zod schema before saving
      const validationResult = validateBillSafe(newBill);
      if (!validationResult.success) {
        const errorMessages = validationResult.error.issues
          .map((issue) => issue.message)
          .join(", ");
        logger.error("Bill validation failed", { errors: validationResult.error.issues });
        throw new Error(`Invalid bill data: ${errorMessages}`);
      }

      // Persist to Dexie (optimistic update handled by React Query)
      await budgetDb.bills.add(validationResult.data);

      return validationResult.data;
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

      // Validate updates with Zod schema
      const validationResult = validateBillPartialSafe(updates);
      if (!validationResult.success) {
        const errorMessages = validationResult.error.issues
          .map((issue) => issue.message)
          .join(", ");
        logger.error("Bill update validation failed", {
          billId,
          errors: validationResult.error.issues,
        });
        throw new Error(`Invalid bill update data: ${errorMessages}`);
      }

      // Merge validated updates with existing bill
      const validatedBill = {
        ...existingBill,
        ...validationResult.data,
        id: billId,
        lastModified: Date.now(),
      };

      // Update in Dexie (optimistic update handled by React Query)
      await budgetDb.bills.update(billId, validatedBill);

      return validatedBill;
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

      // ARCHITECTURE: Bills are just planned transactions. Paying a bill = creating a transaction.
      // Envelopes are where all money is kept (source of truth).
      // Behind the scenes: Supplemental accounts and savings goals are stored as envelopes
      // (for data consistency and transaction routing), but filtered from envelope UI.
      // CRITICAL: Bills route through envelopes - envelope is required for payment
      const effectiveEnvelopeId = envelopeId || bill.envelopeId;
      if (!effectiveEnvelopeId || effectiveEnvelopeId.trim() === "") {
        throw new Error(
          "Bill payment requires an envelope. Envelopes are the source of truth for all financial operations."
        );
      }

      // Validate envelope exists (envelopes are source of truth)
      // Note: Behind the scenes, this could be a regular envelope, supplemental account, or savings goal
      // (all stored as envelopes in the database, but filtered from envelope UI)
      const envelope = await budgetDb.envelopes.get(effectiveEnvelopeId);
      if (!envelope) {
        throw new Error(
          `Cannot pay bill: Envelope "${effectiveEnvelopeId}" does not exist. All bill payments must route through an existing envelope.`
        );
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
      // Transaction MUST have envelope (envelopes are source of truth)
      const rawPaymentTransaction = createPaymentTransaction(
        bill,
        billId,
        paidAmount,
        paymentDate,
        effectiveEnvelopeId // Use validated envelope ID
      );

      // Validate and normalize transaction with Zod schema
      const paymentTransaction = validateAndNormalizeTransaction(rawPaymentTransaction);

      // ARCHITECTURE: Bills are just planned transactions. Paying a bill = creating a transaction.
      // Envelopes are where all money is kept. The transaction will update the envelope balance.
      // Add transaction to Dexie
      await budgetDb.transactions.put(paymentTransaction);
      await optimisticHelpers.addTransaction(queryClient, paymentTransaction);

      // Note: Envelope balance update is now handled by useTransactionBalanceUpdater when transaction is added.
      // No need for direct envelope update here.

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
