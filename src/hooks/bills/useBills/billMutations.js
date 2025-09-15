// Bill Mutation Functions - CRUD operations and data modifications
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  queryKeys,
  optimisticHelpers,
} from "../../../utils/common/queryClient";
import { budgetDb } from "../../../db/budgetDb";
import logger from "../../../utils/common/logger";

// Helper to trigger sync for bill changes
const triggerBillSync = (changeType) => {
  if (typeof window !== "undefined" && window.cloudSyncService) {
    window.cloudSyncService.triggerSyncForCriticalChange(`bill_${changeType}`);
  }
};

/**
 * Add bill mutation hook
 */
export const useAddBillMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["bills", "add"],
    mutationFn: async (billData) => {
      // Generate unique ID with better collision resistance
      const uniqueId = `bill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newBill = {
        id: uniqueId,
        ...billData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPaid: false, // Default to unpaid
      };

      // Apply optimistic update first
      await optimisticHelpers.addBill(newBill);

      // Then persist to Dexie
      await budgetDb.bills.add(newBill);

      logger.debug("✅ Added bill:", newBill);

      return newBill;
    },
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.bills });

      // Snapshot previous value for rollback
      const previousBills = queryClient.getQueryData(queryKeys.bills);
      return { previousBills };
    },
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
      queryClient.invalidateQueries({ queryKey: queryKeys.billsList });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetMetadata });

      // Trigger cloud sync
      triggerBillSync("add");
    },
    onError: (error, billData, context) => {
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
    mutationFn: async ({ billId, updates }) => {
      const existingBill = await budgetDb.bills.get(billId);
      if (!existingBill) {
        throw new Error(`Bill with ID ${billId} not found`);
      }

      const updatedBill = {
        ...existingBill,
        ...updates,
        id: billId, // Ensure ID stays the same
        updatedAt: new Date().toISOString(),
      };

      // Apply optimistic update
      await optimisticHelpers.updateBill(billId, updatedBill);

      // Update in Dexie
      await budgetDb.bills.update(billId, updatedBill);

      logger.debug("✅ Updated bill:", updatedBill);

      return updatedBill;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
      queryClient.invalidateQueries({ queryKey: queryKeys.billsList });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetMetadata });

      triggerBillSync("update");
    },
    onError: (error) => {
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
    mutationFn: async (billId) => {
      // Apply optimistic update
      await optimisticHelpers.deleteBill(billId);

      // Delete from Dexie
      await budgetDb.bills.delete(billId);

      logger.debug("✅ Deleted bill:", billId);

      return billId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
      queryClient.invalidateQueries({ queryKey: queryKeys.billsList });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetMetadata });

      triggerBillSync("delete");
    },
    onError: (error) => {
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
    mutationFn: async ({ billId, paidAmount, paidDate, envelopeId }) => {
      const bill = await budgetDb.bills.get(billId);
      if (!bill) {
        throw new Error(`Bill with ID ${billId} not found`);
      }

      const paymentDate = paidDate || new Date().toISOString().split("T")[0];

      const paidData = {
        isPaid: true,
        paidAmount: paidAmount,
        paidDate: paymentDate,
        envelopeId: envelopeId,
        lastPaid: new Date().toISOString(),
      };

      // Apply optimistic update
      await optimisticHelpers.updateBill(billId, paidData);

      // Apply to Dexie directly
      await budgetDb.bills.update(billId, {
        ...paidData,
        updatedAt: new Date().toISOString(),
      });

      // Create transaction record for the bill payment
      const paymentTransaction = {
        id: `${billId}_payment_${Date.now()}`,
        date: paymentDate,
        description:
          bill.provider || bill.description || bill.name || "Bill Payment",
        amount: -Math.abs(paidAmount), // Negative for expense
        envelopeId: envelopeId || "unassigned",
        category: bill.category || "Bills & Utilities",
        type: "expense",
        source: "bill_payment",
        billId: billId,
        notes: `Payment for ${bill.provider || bill.description || bill.name}`,
        createdAt: new Date().toISOString(),
      };

      // Add transaction to Dexie
      await budgetDb.transactions.put(paymentTransaction);
      await optimisticHelpers.addTransaction(paymentTransaction);

      // If bill is linked to envelope, update envelope balance
      if (envelopeId && paidAmount) {
        const envelope = await budgetDb.envelopes.get(envelopeId);
        if (envelope) {
          const newBalance = (envelope.currentBalance || 0) - paidAmount;

          const envelopeUpdate = {
            currentBalance: newBalance,
            updatedAt: new Date().toISOString(),
            lastTransaction: {
              type: "bill_payment",
              amount: -paidAmount,
              date: paymentDate,
              billId: billId,
              transactionId: paymentTransaction.id,
            },
            name: envelope.name || `Envelope ${envelopeId}`,
            category: envelope.category || "Other",
          };

          await budgetDb.envelopes.update(envelopeId, envelopeUpdate);
          await optimisticHelpers.updateEnvelope(envelopeId, {
            currentBalance: newBalance,
          });

          logger.debug("💰 Updated envelope balance for bill payment", {
            envelopeId,
            envelopeName: envelope.name,
            oldBalance: envelope.currentBalance || 0,
            newBalance,
            paidAmount,
          });
        }
      }

      return { billId, paymentTransaction };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
      queryClient.invalidateQueries({ queryKey: queryKeys.billsList });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });

      triggerBillSync("mark_paid");
    },
    onError: (error) => {
      logger.error("Failed to mark bill as paid:", error);
    },
  });
};
