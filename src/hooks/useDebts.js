import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBudgetStore } from "../stores/budgetStore";
import { queryKeys } from "../utils/queryClient";
import { budgetDb } from "../db/budgetDb";

const useDebts = () => {
  const queryClient = useQueryClient();
  const {
    debts: zustandDebts,
    addDebt: zustandAddDebt,
    updateDebt: zustandUpdateDebt,
    deleteDebt: zustandDeleteDebt,
    recordDebtPayment: zustandRecordDebtPayment,
    setDebts: zustandSetDebts,
  } = useBudgetStore();

  const queryFunction = async () => {
    let debts = [];
    if (zustandDebts && zustandDebts.length > 0) {
      debts = [...zustandDebts];
    } else {
      try {
        debts = await budgetDb.debts.toArray();
        if (debts.length > 0) {
          zustandSetDebts(debts);
        }
      } catch (error) {
        console.warn("Dexie query failed:", error);
      }
    }
    return debts;
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
      zustandAddDebt(debt);
      try {
        await budgetDb.debts.add(debt);
      } catch (error) {
        console.warn("Failed to persist debt to Dexie:", error);
      }
      return debt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.debts });
    },
  });

  const updateDebtMutation = useMutation({
    mutationKey: ["debts", "update"],
    mutationFn: async ({ id, updates }) => {
      const updatedDebt = { id, ...updates };
      zustandUpdateDebt(updatedDebt);
      try {
        await budgetDb.debts.update(id, {
          ...updates,
          lastModified: Date.now(),
        });
      } catch (error) {
        console.warn("Failed to update debt in Dexie:", error);
      }
      return updatedDebt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.debts });
    },
  });

  const deleteDebtMutation = useMutation({
    mutationKey: ["debts", "delete"],
    mutationFn: async (id) => {
      zustandDeleteDebt(id);
      try {
        await budgetDb.debts.delete(id);
      } catch (error) {
        console.warn("Failed to delete debt from Dexie:", error);
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.debts });
    },
  });

  const recordPaymentMutation = useMutation({
    mutationKey: ["debts", "recordPayment"],
    mutationFn: async ({ id, payment }) => {
      zustandRecordDebtPayment(id, payment);
      try {
        const debt = await budgetDb.debts.get(id);
        if (debt) {
          const history = [...(debt.paymentHistory || []), { ...payment }];
          const newBalance = Math.max(0, (debt.currentBalance || 0) - payment.amount);
          await budgetDb.debts.update(id, {
            currentBalance: newBalance,
            paymentHistory: history,
            lastModified: Date.now(),
          });
        }
      } catch (error) {
        console.warn("Failed to record debt payment in Dexie:", error);
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

export default useDebts;
