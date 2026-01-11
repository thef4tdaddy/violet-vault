import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryKeys } from "@/utils/common/queryClient";
import { budgetDb } from "@/db/budgetDb";
import BudgetHistoryTracker from "@/utils/common/budgetHistoryTracker";
import logger from "@/utils/common/logger.ts";
import { validateDebtSafe, validateDebtPartialSafe } from "@/domain/schemas/debt";
import type { LiabilityEnvelope } from "@/db/types";

// Query function for fetching debts
const fetchDebtsWithMigration = async () => {
  try {
    const envelopes = await budgetDb.envelopes.where("type").equals("liability").toArray();
    const debts = envelopes as LiabilityEnvelope[];

    // One-time migration: Fix debts with undefined status
    const debtsNeedingStatus = debts.filter((debt) => !debt.status);
    if (debtsNeedingStatus.length > 0) {
      logger.info(`🔧 Fixing ${debtsNeedingStatus.length} debts with undefined status`);
      for (const debt of debtsNeedingStatus) {
        // Explicitly cast to Record<string, unknown> to allow partial updates of legacy data
        await budgetDb.envelopes.update(debt.id, {
          status: "active",
        } as Partial<LiabilityEnvelope>);
        logger.debug(`✅ Updated debt "${debt.name}" status to active`);
      }
      const updatedEnvelopes = await budgetDb.envelopes.where("type").equals("liability").toArray();
      return updatedEnvelopes as LiabilityEnvelope[];
    }

    return debts || [];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.warn("Dexie query failed", {
      error: errorMessage,
      source: "useDebts",
    });
    return [];
  }
};

// Mutation function for adding a debt
const addDebtToDb = async (debtData: {
  id?: string;
  status?: string;
  author?: string;
  [key: string]: unknown;
}) => {
  const debt = debtData.id
    ? { status: "active", type: "liability", ...debtData }
    : { id: crypto.randomUUID(), status: "active", type: "liability", ...debtData };

  // Validate with Zod schema before saving
  const validationResult = validateDebtSafe(debt);
  if (!validationResult.success) {
    // Safety check: ensure issues is an array before map
    if (!validationResult.error || !validationResult.error.issues) {
      throw new Error("Invalid debt data: Validation error structure is invalid");
    }
    const issues = Array.isArray(validationResult.error.issues)
      ? validationResult.error.issues
      : [];
    const errorMessages = issues.map((issue) => issue?.message || "Validation error").join(", ");
    logger.error("Debt validation failed", { errors: issues });
    throw new Error(`Invalid debt data: ${errorMessages}`);
  }

  await budgetDb.envelopes.put(validationResult.data);

  await BudgetHistoryTracker.trackDebtChange({
    debtId: validationResult.data.id,
    changeType: "add",
    previousData: null as never,
    newData: validationResult.data as never,
    author: debtData.author || "Unknown User",
  });

  // Fetch the complete debt from DB to return proper type
  const savedDebt = await budgetDb.envelopes.get(validationResult.data.id);
  if (!savedDebt) {
    throw new Error("Failed to retrieve saved debt");
  }
  return savedDebt;
};

// Mutation function for updating a debt
const updateDebtInDb = async ({
  id,
  updates,
  author = "Unknown User",
}: {
  id: string;
  updates: Record<string, unknown>;
  author?: string;
}) => {
  const previousData = await budgetDb.envelopes.get(id); // Use envelopes instead of debts

  // Validate updates with Zod schema
  const validationResult = validateDebtPartialSafe(updates);
  if (!validationResult.success) {
    // Safety check: ensure issues is an array before map
    if (!validationResult.error || !validationResult.error.issues) {
      throw new Error("Invalid debt update data: Validation error structure is invalid");
    }
    const issues = Array.isArray(validationResult.error.issues)
      ? validationResult.error.issues
      : [];
    const errorMessages = issues.map((issue) => issue?.message || "Validation error").join(", ");
    logger.error("Debt update validation failed", {
      debtId: id,
      errors: issues,
    });
    throw new Error(`Invalid debt update data: ${errorMessages}`);
  }

  await budgetDb.envelopes.update(id, {
    ...validationResult.data,
    lastModified: Date.now(),
  });

  const newData = await budgetDb.envelopes.get(id);

  await BudgetHistoryTracker.trackDebtChange({
    debtId: id,
    changeType: "modify",
    previousData: (previousData || null) as never,
    newData: (newData || null) as never,
    author,
  });

  return { id, ...validationResult.data };
};

// Mutation function for deleting a debt
const deleteDebtFromDb = async ({
  id,
  author = "Unknown User",
}: {
  id: string;
  author?: string;
}) => {
  const previousData = await budgetDb.envelopes.get(id);

  await budgetDb.envelopes.delete(id);

  if (previousData) {
    await BudgetHistoryTracker.trackDebtChange({
      debtId: id,
      changeType: "delete",
      previousData: previousData as never,
      newData: null as never,
      author,
    });
  }

  return id;
};

// Mutation function for recording a payment
const recordPaymentInDb = async ({
  id,
  payment,
  author = "Unknown User",
}: {
  id: string;
  payment: { amount: number; [key: string]: unknown };
  author?: string;
}) => {
  const debt = (await budgetDb.envelopes.get(id)) as LiabilityEnvelope | undefined;
  if (debt) {
    // Note: paymentHistory is not in the Debt type but may exist in data
    // We keep track of it in memory for history tracking but don't persist it
    const newBalance = Math.max(0, (debt.currentBalance || 0) - payment.amount);

    const updatedDebt = {
      ...debt,
      currentBalance: newBalance,
      lastModified: Date.now(),
    } as LiabilityEnvelope;

    await budgetDb.envelopes.update(id, {
      currentBalance: newBalance,
      lastModified: Date.now(),
    });

    await BudgetHistoryTracker.trackDebtChange({
      debtId: id,
      changeType: "modify",
      previousData: debt,
      newData: updatedDebt,
      author,
    });
  }
  return { id, payment };
};

const useDebts = () => {
  const queryClient = useQueryClient();

  // Event listeners for data import and sync invalidation
  useEffect(() => {
    const handleImportCompleted = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.debts });
      queryClient.invalidateQueries({ queryKey: queryKeys.debtsList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    };

    const handleInvalidateAll = () => {
      queryClient.invalidateQueries();
    };

    window.addEventListener("importCompleted", handleImportCompleted);
    window.addEventListener("invalidateAllQueries", handleInvalidateAll);

    return () => {
      window.removeEventListener("importCompleted", handleImportCompleted);
      window.removeEventListener("invalidateAllQueries", handleInvalidateAll);
    };
  }, [queryClient]);

  const debtsQuery = useQuery({
    queryKey: queryKeys.debtsList(),
    queryFn: fetchDebtsWithMigration,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
    enabled: true,
  });

  const addDebtMutation = useMutation({
    mutationKey: ["debts", "add"],
    mutationFn: addDebtToDb,
    onSuccess: (debt) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.debts });

      // Log successful debt addition
      logger.info("✅ Debt added", {
        name: debt.name,
        type: debt.type,
        currentBalance: debt.currentBalance,
        interestRate: (debt as LiabilityEnvelope).interestRate,
      });
    },
  });

  const updateDebtMutation = useMutation({
    mutationKey: ["debts", "update"],
    mutationFn: updateDebtInDb,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.debts });

      // Log successful debt update
      logger.info("✅ Debt updated", {
        debtId: variables.id,
        updates: Object.keys(variables.updates || {}),
      });
    },
  });

  const deleteDebtMutation = useMutation({
    mutationKey: ["debts", "delete"],
    mutationFn: deleteDebtFromDb,
    onSuccess: (_, debtId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.debts });

      // Log successful debt deletion
      logger.info("✅ Debt deleted", {
        debtId: debtId,
      });
    },
  });

  const recordPaymentMutation = useMutation({
    mutationKey: ["debts", "recordPayment"],
    mutationFn: recordPaymentInDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.debts });

      // Log successful debt payment
      logger.info("✅ Debt payment recorded");
    },
  });

  const getDebtById = (id: string) => (debtsQuery.data || []).find((d) => d.id === id);

  return {
    debts: debtsQuery.data || [],
    isLoading: debtsQuery.isLoading,
    isFetching: debtsQuery.isFetching,
    isError: debtsQuery.isError,
    error: debtsQuery.error,

    addDebt: addDebtMutation.mutate,
    addDebtAsync: addDebtMutation.mutateAsync,
    updateDebt: updateDebtMutation.mutate,
    updateDebtAsync: updateDebtMutation.mutateAsync,
    deleteDebt: deleteDebtMutation.mutate,
    deleteDebtAsync: deleteDebtMutation.mutateAsync,
    recordDebtPayment: recordPaymentMutation.mutate,
    recordDebtPaymentAsync: recordPaymentMutation.mutateAsync,

    getDebtById,

    refetch: debtsQuery.refetch,
    invalidate: () => queryClient.invalidateQueries({ queryKey: queryKeys.debts }),
  };
};

export { useDebts };
