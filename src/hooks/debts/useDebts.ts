import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryKeys } from "../../utils/common/queryClient";
import { budgetDb } from "../../db/budgetDb";
import BudgetHistoryTracker from "../../utils/common/budgetHistoryTracker";
import logger from "../../utils/common/logger.ts";

// Query function for fetching debts
const fetchDebtsWithMigration = async () => {
  try {
    const debts = await budgetDb.debts.toArray();

    // One-time migration: Fix debts with undefined status
    const debtsNeedingStatus = debts.filter((debt) => !debt.status);
    if (debtsNeedingStatus.length > 0) {
      logger.info(`🔧 Fixing ${debtsNeedingStatus.length} debts with undefined status`);
      for (const debt of debtsNeedingStatus) {
        await budgetDb.debts.update(debt.id, { status: "active" });
        logger.debug(`✅ Updated debt "${debt.name}" status to active`);
      }
      return await budgetDb.debts.toArray();
    }

    return debts || [];
  } catch (error) {
    logger.warn("Dexie query failed", {
      error: error.message,
      source: "useDebts",
    });
    return [];
  }
};

// Mutation function for adding a debt
const addDebtToDb = async (debtData) => {
  const debt = debtData.id
    ? { status: "active", ...debtData }
    : { id: crypto.randomUUID(), status: "active", ...debtData };

  await budgetDb.debts.put(debt);

  await BudgetHistoryTracker.trackDebtChange({
    debtId: debt.id,
    changeType: "add",
    previousData: null,
    newData: debt,
    author: debtData.author || "Unknown User",
  });

  return debt;
};

// Mutation function for updating a debt
const updateDebtInDb = async ({ id, updates, author = "Unknown User" }) => {
  const previousData = await budgetDb.debts.get(id);

  await budgetDb.debts.update(id, {
    ...updates,
    lastModified: Date.now(),
  });

  const newData = await budgetDb.debts.get(id);

  await BudgetHistoryTracker.trackDebtChange({
    debtId: id,
    changeType: "modify",
    previousData,
    newData,
    author,
  });

  return { id, ...updates };
};

// Mutation function for deleting a debt
const deleteDebtFromDb = async ({ id, author = "Unknown User" }) => {
  const previousData = await budgetDb.debts.get(id);

  await budgetDb.debts.delete(id);

  if (previousData) {
    await BudgetHistoryTracker.trackDebtChange({
      debtId: id,
      changeType: "delete",
      previousData,
      newData: null,
      author,
    });
  }

  return id;
};

// Mutation function for recording a payment
const recordPaymentInDb = async ({ id, payment, author = "Unknown User" }) => {
  const debt = await budgetDb.debts.get(id);
  if (debt) {
    // Note: paymentHistory is not in the Debt type but may exist in data
    // We keep track of it in memory for history tracking but don't persist it
    const newBalance = Math.max(0, (debt.currentBalance || 0) - payment.amount);

    const updatedDebt = {
      ...debt,
      currentBalance: newBalance,
      lastModified: Date.now(),
    };

    await budgetDb.debts.update(id, {
      currentBalance: newBalance,
      lastModified: Date.now(),
    } as never);

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
        interestRate: debt.interestRate,
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

  const getDebtById = (id) => (debtsQuery.data || []).find((d) => d.id === id);

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
