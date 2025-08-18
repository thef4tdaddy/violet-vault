import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryKeys } from "../utils/queryClient";
import { budgetDb } from "../db/budgetDb";
import BudgetHistoryTracker from "../utils/budgetHistoryTracker";
import logger from "../utils/logger.js";

const useDebts = () => {
  const queryClient = useQueryClient();

  // Event listeners for data import and sync invalidation
  useEffect(() => {
    const handleImportCompleted = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.debts });
      queryClient.invalidateQueries({ queryKey: queryKeys.debtsList });
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

  const queryFunction = async () => {
    try {
      const debts = await budgetDb.debts.toArray();
      return debts || [];
    } catch (error) {
      logger.warn("Dexie query failed", {
        error: error.message,
        source: "useDebts",
      });
      return [];
    }
  };

  const debtsQuery = useQuery({
    queryKey: queryKeys.debtsList(),
    queryFn: queryFunction,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
    enabled: true,
  });

  const addDebtMutation = useMutation({
    mutationKey: ["debts", "add"],
    mutationFn: async (debtData) => {
      const debt = debtData.id ? debtData : { id: crypto.randomUUID(), ...debtData };

      await budgetDb.debts.add(debt);

      // Track the change in budget history
      await BudgetHistoryTracker.trackDebtChange({
        debtId: debt.id,
        changeType: "add",
        previousData: null,
        newData: debt,
        author: debtData.author || "Unknown User",
      });

      return debt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.debts });
    },
  });

  const updateDebtMutation = useMutation({
    mutationKey: ["debts", "update"],
    mutationFn: async ({ id, updates, author = "Unknown User" }) => {
      // Get previous data for tracking
      const previousData = await budgetDb.debts.get(id);

      await budgetDb.debts.update(id, {
        ...updates,
        lastModified: Date.now(),
      });

      // Get updated data for tracking
      const newData = await budgetDb.debts.get(id);

      // Track the change in budget history
      await BudgetHistoryTracker.trackDebtChange({
        debtId: id,
        changeType: "modify",
        previousData,
        newData,
        author,
      });

      return { id, ...updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.debts });
    },
  });

  const deleteDebtMutation = useMutation({
    mutationKey: ["debts", "delete"],
    mutationFn: async ({ id, author = "Unknown User" }) => {
      // Get data before deletion for tracking
      const previousData = await budgetDb.debts.get(id);

      await budgetDb.debts.delete(id);

      // Track the change in budget history
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.debts });
    },
  });

  const recordPaymentMutation = useMutation({
    mutationKey: ["debts", "recordPayment"],
    mutationFn: async ({ id, payment, author = "Unknown User" }) => {
      const debt = await budgetDb.debts.get(id);
      if (debt) {
        const history = [...(debt.paymentHistory || []), { ...payment }];
        const newBalance = Math.max(0, (debt.currentBalance || 0) - payment.amount);

        const updatedDebt = {
          ...debt,
          currentBalance: newBalance,
          paymentHistory: history,
          lastModified: Date.now(),
        };

        await budgetDb.debts.update(id, {
          currentBalance: newBalance,
          paymentHistory: history,
          lastModified: Date.now(),
        });

        // Track the payment in budget history
        await BudgetHistoryTracker.trackDebtChange({
          debtId: id,
          changeType: "modify",
          previousData: debt,
          newData: updatedDebt,
          author,
        });
      }
      return { id, payment };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.debts });
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
export default useDebts;
