import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";
import { queryKeys, optimisticHelpers } from "@/utils/common/queryClient";
import { budgetDb } from "@/db/budgetDb";
import logger from "@/utils/common/logger";
import { type Transaction } from "@/db/types";
import {
  validateAndNormalizeTransaction,
  validateTransactionPartialSafe,
} from "@/domain/schemas/transaction";

// --- Types ---

export interface BillQueryOptions {
  status?: string;
  daysAhead?: number;
  category?: string;
  sortBy?: string;
  sortOrder?: string;
}

// Phase 2 Migration: Bills are now Scheduled Transactions
// A bill is a scheduled expense transaction with isScheduled=true
// Paid status is determined by finding matching non-scheduled payment transaction
type BillTransaction = Transaction & {
  isPaid?: boolean;
  paidDate?: string | Date;
  paidAmount?: number;
  paymentTransactionId?: string;
};

// --- Helpers ---

const triggerBillSync = (changeType: string) => {
  if (typeof window !== "undefined" && window.cloudSyncService) {
    window.cloudSyncService.triggerSyncForCriticalChange(`bill_${changeType}`);
  }
};

const createPaymentTransaction = (
  scheduledBill: Transaction,
  billId: string,
  paidAmount: number,
  paymentDate: string,
  envelopeId?: string
): Transaction => {
  // Validate inputs - explicit null/undefined check
  if (paidAmount == null || paidAmount <= 0) {
    throw new Error("Payment amount must be positive");
  }
  if (!paymentDate) {
    throw new Error("Payment date is required");
  }

  return {
    id: `${billId}_payment_${Date.now()}`,
    date: new Date(paymentDate),
    description: scheduledBill.description || "Bill Payment",
    amount: -Math.abs(paidAmount), // Negative for expense
    envelopeId: envelopeId || scheduledBill.envelopeId || "unassigned",
    category: scheduledBill.category || "Bills & Utilities",
    type: "expense" as const,
    isScheduled: false, // Payment is not scheduled, it's actual
    lastModified: Date.now(),
    createdAt: Date.now(),
    notes: `Payment for: ${scheduledBill.description || "Bill"} (Scheduled Bill ID: ${billId})`,
  };
};

// --- Query Logic ---

export const useBillQueryFunction = (options: BillQueryOptions = {}) => {
  const {
    status = "all",
    daysAhead = 30,
    category,
    sortBy = "date",
    sortOrder = "asc",
  } = options;

  return useCallback(async () => {
    let bills: BillTransaction[] = [];

    try {
      // Phase 2 Migration: Query scheduled expense transactions (bills)
      const scheduledTransactions = await budgetDb.transactions
        .where("isScheduled")
        .equals(1) // Dexie stores booleans as 0/1 in IndexedDB
        .filter((txn) => txn.type === "expense")
        .toArray();

      // Get recent actual (non-scheduled) transactions to determine paid status
      // Limit to a recent time window to avoid loading the entire transaction history
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const actualTransactions = await budgetDb.transactions
        .where("date")
        .aboveOrEqual(sixMonthsAgo.toISOString())
        .filter((txn) => !txn.isScheduled && txn.type === "expense")
        .toArray();

      // Map scheduled transactions to bill objects with paid status
      bills = scheduledTransactions.map((scheduledBill) => {
        // Find matching payment transaction
        // Prioritize notes-based matching (most reliable) over heuristics
        let paymentTxn = actualTransactions.find((txn) =>
          txn.notes?.includes(`Scheduled Bill ID: ${scheduledBill.id}`)
        );

        // Fallback to heuristic matching if no notes-based match found
        if (!paymentTxn) {
          paymentTxn = actualTransactions.find(
            (txn) =>
              // Match by description similarity
              txn.description?.includes(scheduledBill.description || "") &&
              // Match by date (within 7 days)
              Math.abs(new Date(txn.date).getTime() - new Date(scheduledBill.date).getTime()) <
                7 * 24 * 60 * 60 * 1000 &&
              // Match by amount (within $0.01)
              Math.abs(Math.abs(txn.amount) - Math.abs(scheduledBill.amount)) < 0.01
          );
        }

        return {
          ...scheduledBill,
          isPaid: !!paymentTxn,
          paidDate: paymentTxn?.date,
          paidAmount: paymentTxn ? Math.abs(paymentTxn.amount) : undefined,
          paymentTransactionId: paymentTxn?.id,
          // Add computed fields for backward compatibility
          name: scheduledBill.description,
          dueDate: scheduledBill.date,
        } as BillTransaction;
      });

      if (bills.length > 0) {
        logger.debug("TanStack Query: Bills (Scheduled Transactions) loaded", {
          count: bills.length,
          paid: bills.filter((b) => b.isPaid).length,
        });
      }
    } catch (error) {
      logger.error("TanStack Query: Dexie fetch failed", error);
      return [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filteredBills = bills;

    if (status === "upcoming") {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);
      filteredBills = filteredBills.filter((bill) => {
        const billDate = new Date(bill.date);
        return billDate >= today && billDate <= futureDate && !bill.isPaid;
      });
    } else if (status === "overdue") {
      filteredBills = filteredBills.filter((bill) => {
        const billDate = new Date(bill.date);
        return billDate < today && !bill.isPaid;
      });
    } else if (status === "paid") {
      filteredBills = filteredBills.filter((bill) => bill.isPaid);
    } else if (status === "unpaid") {
      filteredBills = filteredBills.filter((bill) => !bill.isPaid);
    }

    if (category) {
      filteredBills = filteredBills.filter((bill) => bill.category === category);
    }

    // Sorting logic
    filteredBills.sort((a, b) => {
      let aVal: string | number | Date;
      let bVal: string | number | Date;

      if (sortBy === "date" || sortBy === "dueDate") {
        aVal = new Date(a.date);
        bVal = new Date(b.date);
      } else if (sortBy === "amount") {
        aVal = Math.abs(a.amount);
        bVal = Math.abs(b.amount);
      } else if (sortBy === "description" || sortBy === "name") {
        aVal = (a.description || "").toLowerCase();
        bVal = (b.description || "").toLowerCase();
      } else {
        aVal = a[sortBy as keyof BillTransaction] as string | number | Date;
        bVal = b[sortBy as keyof BillTransaction] as string | number | Date;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortOrder === "desc") {
        return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
      } else {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      }
    });

    return filteredBills;
  }, [status, daysAhead, category, sortBy, sortOrder]);
};

export const useBillsQuery = (options: BillQueryOptions = {}) => {
  const {
    status = "all",
    daysAhead = 30,
    category,
    sortBy = "dueDate",
    sortOrder = "asc",
  } = options;

  const queryFunction = useBillQueryFunction(options);

  return useQuery({
    queryKey: queryKeys.billsList({
      status,
      daysAhead,
      category,
      sortBy,
      sortOrder,
    }),
    queryFn: queryFunction,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
    initialData: undefined,
    enabled: true,
  });
};
export const useUpcomingBillsQuery = (daysAhead = 30, billsData: BillTransaction[] = []) => {
  return useQuery({
    queryKey: queryKeys.upcomingBills(daysAhead),
    queryFn: async (): Promise<BillTransaction[]> => {
      const bills = billsData || [];
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);

      return bills.filter((bill) => {
        const billDate = new Date(bill.date);
        return billDate >= today && billDate <= futureDate && !bill.isPaid;
      });
    },
    enabled: !!billsData,
    staleTime: 2 * 60 * 1000,
  });
};

export const useBillQueryEvents = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleImportCompleted = () => {
      logger.debug("Import detected, invalidating bills cache");
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
    };

    const handleInvalidateAll = () => {
      logger.debug("Invalidating all bill queries");
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    };

    window.addEventListener("importCompleted", handleImportCompleted);
    window.addEventListener("invalidateAllQueries", handleInvalidateAll);

    return () => {
      window.removeEventListener("importCompleted", handleImportCompleted);
      window.removeEventListener("invalidateAllQueries", handleInvalidateAll);
    };
  }, [queryClient]);
};

// --- Mutation Logic ---

export const useAddBillMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["bills", "add"],
    mutationFn: async (billData: Record<string, unknown>) => {
      const uniqueId = `bill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Phase 2 Migration: Create a scheduled expense transaction
      const newBill: Partial<Transaction> = {
        id: uniqueId,
        description: (billData.name as string) || (billData.description as string) || "Unnamed Bill",
        // Normalize date to string for consistency
        date: new Date(billData.dueDate as string | Date).toISOString().split("T")[0],
        amount: -Math.abs((billData.amount as number) || 0), // Negative for expense
        envelopeId: (billData.envelopeId as string) || "unassigned",
        category: (billData.category as string) || "Bills & Utilities",
        type: "expense" as const,
        isScheduled: true, // This is a scheduled bill
        recurrenceRule: (billData.recurrenceRule as string) || undefined,
        lastModified: Date.now(),
        createdAt: Date.now(),
        notes: (billData.notes as string) || undefined,
      };

      const validatedBill = validateAndNormalizeTransaction(newBill);

      await budgetDb.transactions.add(validatedBill);
      return validatedBill;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.bills });
      const previousBills = queryClient.getQueryData(queryKeys.bills);
      return { previousBills };
    },
    onSuccess: (bill) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetMetadata });

      logger.info("✅ Bill added", { description: bill.description });
      triggerBillSync("add");
    },
    onError: (error, _, context) => {
      logger.error("Failed to add bill:", error);
      if (context?.previousBills) {
        queryClient.setQueryData(queryKeys.bills, context.previousBills);
      }
    },
  });
};

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
      const existingBill = await budgetDb.transactions.get(billId);
      if (!existingBill) throw new Error(`Bill with ID ${billId} not found`);

      // Map common bill fields to transaction fields
      const transactionUpdates: Record<string, unknown> = { ...updates };
      if (updates.name) {
        transactionUpdates.description = updates.name;
        delete transactionUpdates.name;
      }
      if (updates.dueDate) {
        transactionUpdates.date = updates.dueDate;
        delete transactionUpdates.dueDate;
      }
      if (updates.amount) {
        transactionUpdates.amount = -Math.abs(updates.amount as number);
      }

      const validationResult = validateTransactionPartialSafe(transactionUpdates);
      if (!validationResult.success) {
        throw new Error(
          `Invalid bill update data: ${validationResult.error.issues
            .map((i) => i.message)
            .join(", ")}`
        );
      }

      const validatedBill = {
        ...existingBill,
        ...validationResult.data,
        id: billId,
        lastModified: Date.now(),
      };

      await budgetDb.transactions.update(billId, validatedBill);
      return validatedBill;
    },
    onSuccess: (_bill, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetMetadata });

      logger.info("✅ Bill updated", { billId: variables.billId });
      triggerBillSync("update");
    },
    onError: (error) => logger.error("Failed to update bill:", error),
  });
};

export const useDeleteBillMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["bills", "delete"],
    mutationFn: async (billId: string) => {
      // Phase 2 Migration: Delete from transactions table
      // Also find and delete any associated payment transactions
      const paymentsToDelete = await budgetDb.transactions
        .filter(
          (txn) =>
            txn.isScheduled === false &&
            txn.type === "expense" &&
            (txn.notes?.includes(`Scheduled Bill ID: ${billId}`) || txn.notes?.includes(billId))
        )
        .toArray();

      // Delete the scheduled bill
      await budgetDb.transactions.delete(billId);

      // Delete associated payments
      for (const payment of paymentsToDelete) {
        await budgetDb.transactions.delete(payment.id);
        logger.info("🗑️ Deleted associated payment", { paymentId: payment.id, billId });
      }

      return billId;
    },
    onSuccess: (billId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetMetadata });

      logger.info("✅ Bill deleted", { billId });
      triggerBillSync("delete");
    },
    onError: (error) => logger.error("Failed to delete bill:", error),
  });
};

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
      // Phase 2 Migration: Get scheduled transaction (bill)
      const scheduledBill = await budgetDb.transactions.get(billId);
      if (!scheduledBill) throw new Error(`Bill with ID ${billId} not found`);

      const effectiveEnvelopeId = envelopeId || scheduledBill.envelopeId;
      if (!effectiveEnvelopeId || effectiveEnvelopeId.trim() === "") {
        throw new Error("Bill payment requires an envelope.");
      }

      const envelope = await budgetDb.envelopes.get(effectiveEnvelopeId);
      if (!envelope)
        throw new Error(`Cannot pay bill: Envelope "${effectiveEnvelopeId}" does not exist.`);

      const paymentDate = paidDate || new Date().toISOString().split("T")[0];

      // Create the actual payment transaction (non-scheduled)
      const rawPaymentTransaction = createPaymentTransaction(
        scheduledBill,
        billId,
        paidAmount,
        paymentDate,
        effectiveEnvelopeId
      );

      const zodValidated = validateAndNormalizeTransaction(rawPaymentTransaction);

      const paymentTransaction: Transaction = {
        ...zodValidated,
        date: zodValidated.date instanceof Date ? zodValidated.date : new Date(zodValidated.date),
        description: zodValidated.description ?? undefined,
        merchant: zodValidated.merchant ?? undefined,
        receiptUrl: zodValidated.receiptUrl ?? undefined,
        isInternalTransfer:
          typeof zodValidated.isInternalTransfer === "boolean"
            ? zodValidated.isInternalTransfer
            : undefined,
        paycheckId: zodValidated.paycheckId ?? undefined,
        fromEnvelopeId: zodValidated.fromEnvelopeId ?? undefined,
        toEnvelopeId: zodValidated.toEnvelopeId ?? undefined,
      };

      // Add the payment transaction
      await budgetDb.transactions.put(paymentTransaction);
      await optimisticHelpers.addTransaction(queryClient, paymentTransaction);

      return { billId, paymentTransaction };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });

      logger.info("✅ Bill marked as paid", { billId: data.billId });
      triggerBillSync("mark_paid");
    },
    onError: (error) => logger.error("Failed to mark bill as paid:", error),
  });
};

// --- Main Hook ---

const useBills = (options: BillQueryOptions = {}) => {
  useBillQueryEvents();
  const billsQuery = useBillsQuery(options);

  const addBillMutation = useAddBillMutation();
  const updateBillMutation = useUpdateBillMutation();
  const deleteBillMutation = useDeleteBillMutation();
  const markBillPaidMutation = useMarkBillPaidMutation();

  const operations = useMemo(
    () => ({
      addBill: addBillMutation.mutate,
      addBillAsync: addBillMutation.mutateAsync,
      updateBill: updateBillMutation.mutate,
      updateBillAsync: updateBillMutation.mutateAsync,
      deleteBill: deleteBillMutation.mutate,
      deleteBillAsync: deleteBillMutation.mutateAsync,
      markBillPaid: markBillPaidMutation.mutate,
      markBillPaidAsync: markBillPaidMutation.mutateAsync,
    }),
    [addBillMutation, updateBillMutation, deleteBillMutation, markBillPaidMutation]
  );

  return {
    bills: billsQuery.data || [],
    isLoading: billsQuery.isLoading,
    isError: billsQuery.isError,
    error: billsQuery.error,
    refetch: billsQuery.refetch,
    ...operations,
    isProcessing:
      addBillMutation.isPending ||
      updateBillMutation.isPending ||
      deleteBillMutation.isPending ||
      markBillPaidMutation.isPending,
  };
};

export default useBills;
