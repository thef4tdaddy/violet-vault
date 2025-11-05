import { useMemo } from "react";
import type { Envelope } from "@/db/types";

interface Debt {
  id: string;
  name: string;
  currentBalance: number;
  originalBalance?: number;
  status?: string;
}

interface Bill {
  id: string;
  dueDate: Date | string;
  [key: string]: unknown;
}

/**
 * Hook for calculating envelope spending data
 */
export const useEnvelopeSpendingData = (envelopes: Envelope[]) => {
  return useMemo(() => {
    if (envelopes.length === 0) return [];

    const totalSpent = envelopes.reduce((sum, env) => {
      const balance =
        typeof env?.currentBalance === "string"
          ? parseFloat(env.currentBalance)
          : env?.currentBalance || 0;
      return sum + (isNaN(balance) ? 0 : balance);
    }, 0);

    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-yellow-500",
      "bg-pink-500",
    ];

    return envelopes
      .map((env, index) => {
        const balance =
          typeof env?.currentBalance === "string"
            ? parseFloat(env.currentBalance)
            : env?.currentBalance || 0;
        const amount = isNaN(balance) ? 0 : balance;
        const percentage = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
        return {
          name: env.name,
          amount,
          percentage,
          color: colors[index % colors.length],
        };
      })
      .filter((item) => item.percentage > 0)
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);
  }, [envelopes]);
};

/**
 * Hook for calculating biweekly status
 */
export const useBiweeklyStatus = (
  totalEnvelopeBalance: number,
  totalSavingsBalance: number
) => {
  return useMemo(() => {
    const totalGoal = 1753.95;
    const currentProgress = totalEnvelopeBalance + totalSavingsBalance;
    const amountNeeded = Math.max(0, totalGoal - currentProgress);
    return { amountNeeded, totalGoal };
  }, [totalEnvelopeBalance, totalSavingsBalance]);
};

/**
 * Hook for preparing debt tracker data
 */
export const useDebtTrackerData = (debts: Debt[]) => {
  return useMemo(() => {
    return debts
      .filter((debt) => debt.status === "active")
      .map((debt) => ({
        id: debt.id,
        name: debt.name,
        currentBalance: debt.currentBalance || 0,
        originalBalance: debt.originalBalance || debt.currentBalance || 0,
        percentPaid:
          debt.originalBalance && debt.originalBalance > 0
            ? Math.round(
                ((debt.originalBalance - debt.currentBalance) / debt.originalBalance) * 100
              )
            : 0,
      }));
  }, [debts]);
};

/**
 * Hook for filtering upcoming bills
 */
export const useUpcomingBills = (bills: Bill[]) => {
  return useMemo(() => {
    const today = new Date();
    const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return bills
      .filter((bill) => {
        const dueDate = new Date(bill.dueDate);
        return dueDate >= today && dueDate <= sevenDaysLater;
      })
      .slice(0, 3);
  }, [bills]);
};
