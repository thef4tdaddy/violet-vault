import { useMemo } from "react";
import type { Transaction } from "../../db/types";

interface TransactionAnalytics {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  transactionCount: number;
  categoryBreakdown: Record<string, { income: number; expenses: number; count: number }>;
  dailyBreakdown: Record<string, { income: number; expenses: number; count: number }>;
  recentTransactions: Transaction[];
}

export const useTransactionAnalytics = (transactions: Transaction[] = []): TransactionAnalytics => {
  const analytics = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = Math.abs(
      transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)
    );
    const netAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const transactionCount = transactions.length;

    // Category breakdown
    const categoryBreakdown = transactions.reduce(
      (acc, t) => {
        const category = t.category || "uncategorized";
        if (!acc[category]) {
          acc[category] = { income: 0, expenses: 0, count: 0 };
        }

        if (t.amount > 0) {
          acc[category].income += t.amount;
        } else {
          acc[category].expenses += Math.abs(t.amount);
        }
        acc[category].count += 1;

        return acc;
      },
      {} as Record<string, { income: number; expenses: number; count: number }>
    );

    // Daily breakdown (for charts)
    const dailyBreakdown = transactions.reduce(
      (acc, t) => {
        const dateKey =
          t.date instanceof Date ? t.date.toISOString().split("T")[0] : String(t.date);
        if (!acc[dateKey]) {
          acc[dateKey] = { income: 0, expenses: 0, count: 0 };
        }

        if (t.amount > 0) {
          acc[dateKey].income += t.amount;
        } else {
          acc[dateKey].expenses += Math.abs(t.amount);
        }
        acc[dateKey].count += 1;

        return acc;
      },
      {} as Record<string, { income: number; expenses: number; count: number }>
    );

    // Recent transactions (last 7 days)
    const recentTransactions = (() => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      return transactions.filter((t) => new Date(t.date) >= sevenDaysAgo);
    })();

    return {
      totalIncome,
      totalExpenses,
      netAmount,
      transactionCount,
      categoryBreakdown,
      dailyBreakdown,
      recentTransactions,
    };
  }, [transactions]);

  return analytics;
};
