import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";
import { queryKeys, optimisticHelpers } from "@/utils/common/queryClient";
import { budgetDb } from "@/db/budgetDb";
import logger from "@/utils/common/logger";
import { type LiabilityEnvelope, type Transaction, type Bill } from "@/db/types";
import { validateBillPartialSafe, validateBillSafe } from "@/domain/schemas/bill";
import { validateAndNormalizeTransaction } from "@/domain/schemas/transaction";

// --- Types ---

export interface BillQueryOptions {
  status?: string;
  daysAhead?: number;
  category?: string;
  sortBy?: string;
  sortOrder?: string;
}

type BillExtended = LiabilityEnvelope & {
  lastPaid?: string | number | Date;
  estimatedAmount?: number;
  [key: string]: unknown;
};

// --- Helpers ---

const triggerBillSync = (changeType: string) => {
  if (typeof window !== "undefined" && window.cloudSyncService) {
    window.cloudSyncService.triggerSyncForCriticalChange(`bill_${changeType}`);
  }
};

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
    isScheduled: false,
    lastModified: Date.now(),
    createdAt: Date.now(),
  };
};

// --- Query Logic ---

export const useBillQueryFunction = (options: BillQueryOptions = {}) => {
  const {
    status = "all",
    daysAhead = 30,
    category,
    sortBy = "dueDate",
    sortOrder = "asc",
  } = options;

  return useCallback(async () => {
    let bills: LiabilityEnvelope[] = [];

    try {
      // Get all liability type envelopes
      const envelopes = await budgetDb.envelopes.where("type").equals("liability").toArray();
      bills = envelopes as LiabilityEnvelope[];
      if (bills.length > 0) {
        logger.debug("TanStack Query: Bills (Liability Envelopes) loaded", { count: bills.length });
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
        if (!bill.dueDate) return false;
        const dueDate = new Date(bill.dueDate);
        return dueDate >= today && dueDate <= futureDate && !bill.isPaid;
      });
    } else if (status === "overdue") {
      filteredBills = filteredBills.filter((bill) => {
        if (!bill.dueDate) return false;
        const dueDate = new Date(bill.dueDate);
        return dueDate < today && !bill.isPaid;
      });
    } else if (status === "paid") {
      filteredBills = filteredBills.filter((bill) => bill.isPaid);
    } else if (status === "unpaid") {
      filteredBills = filteredBills.filter((bill) => !bill.isPaid);
    }

    if (category) {
      filteredBills = filteredBills.filter((bill) => bill.category === category);
    }

    filteredBills.sort((a, b) => {
      const billA = a as BillExtended;
      const billB = b as BillExtended;
      let aVal: string | number | Date = billA[sortBy as keyof BillExtended] as
        | string
        | number
        | Date;
      let bVal: string | number | Date = billB[sortBy as keyof BillExtended] as
        | string
        | number
        | Date;

      if (sortBy === "dueDate" || sortBy === "lastPaid") {
        aVal = new Date(String(aVal));
        bVal = new Date(String(bVal));
      }

      if (sortBy === "amount" || sortBy === "estimatedAmount") {
        aVal = parseFloat(String(aVal)) || 0;
        bVal = parseFloat(String(bVal)) || 0;
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
export const useUpcomingBillsQuery = (daysAhead = 30, billsData: LiabilityEnvelope[] = []) => {
  return useQuery({
    queryKey: queryKeys.upcomingBills(daysAhead),
    queryFn: async (): Promise<LiabilityEnvelope[]> => {
      const bills = billsData || [];
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);

      return bills.filter((bill) => {
        // Handle both day of month (number) and full date (string) for transition
        const dueDateRaw = bill.dueDate;
        if (!dueDateRaw) return false;

        let dueDate: Date;
        if (typeof dueDateRaw === "number") {
          dueDate = new Date();
          dueDate.setDate(dueDateRaw);
        } else if (dueDateRaw instanceof Date) {
          dueDate = dueDateRaw;
        } else {
          dueDate = new Date(dueDateRaw);
        }
        return dueDate >= today && dueDate <= futureDate && !bill.isPaid;
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

      const newBill = {
        id: uniqueId,
        name: (billData.name as string) || "Unnamed Bill",
        dueDate: new Date(billData.dueDate as string | Date),
        amount: (billData.amount as number) || 0,
        category: (billData.category as string) || "Uncategorized",
        isPaid: false,
        isRecurring: (billData.isRecurring as boolean) || false,
        type: "bill" as const,
        lastModified: Date.now(),
        ...billData,
        createdAt: Date.now(),
      };

      const validationResult = validateBillSafe(newBill);
      if (!validationResult.success) {
        throw new Error(
          `Invalid bill data: ${validationResult.error.issues.map((i) => i.message).join(", ")}`
        );
      }

      const validatedBill: Bill = {
        ...validationResult.data,
        dueDate:
          validationResult.data.dueDate instanceof Date
            ? validationResult.data.dueDate
            : new Date(String(validationResult.data.dueDate || new Date().toISOString())),
        envelopeId: validationResult.data.envelopeId || undefined,
      };

      await budgetDb.envelopes.add(validatedBill as LiabilityEnvelope);
      return validatedBill as LiabilityEnvelope;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.bills });
      const previousBills = queryClient.getQueryData(queryKeys.bills);
      return { previousBills };
    },
    onSuccess: (bill) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetMetadata });

      logger.info("✅ Bill added", { name: bill.name });
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
      const existingBill = await budgetDb.envelopes.get(billId);
      if (!existingBill) throw new Error(`Bill with ID ${billId} not found`);

      const validationResult = validateBillPartialSafe(updates);
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

      await budgetDb.envelopes.update(billId, validatedBill);
      return validatedBill;
    },
    onSuccess: (_bill, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
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
      await budgetDb.envelopes.delete(billId);
      return billId;
    },
    onSuccess: (billId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
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
      const bill = await budgetDb.envelopes.get(billId);
      if (!bill) throw new Error(`Bill with ID ${billId} not found`);

      const effectiveEnvelopeId = envelopeId || (bill as LiabilityEnvelope).envelopeId;
      if (!effectiveEnvelopeId || effectiveEnvelopeId.trim() === "") {
        throw new Error("Bill payment requires an envelope.");
      }

      const envelope = await budgetDb.envelopes.get(effectiveEnvelopeId);
      if (!envelope)
        throw new Error(`Cannot pay bill: Envelope "${effectiveEnvelopeId}" does not exist.`);

      const paymentDate = paidDate || new Date().toISOString().split("T")[0];

      await budgetDb.envelopes.update(billId, {
        isPaid: true,
        paidAmount,
        paidDate: paymentDate,
        lastModified: Date.now(),
      } as Record<string, unknown>);

      const rawPaymentTransaction = createPaymentTransaction(
        bill as LiabilityEnvelope,
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
