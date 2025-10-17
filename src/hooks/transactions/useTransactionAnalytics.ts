import { useMemo } from "react";

export const useTransactionAnalytics = (transactions = []) => {
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
    const categoryBreakdown = transactions.reduce((acc, t) => {
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
    }, {});

    // Daily breakdown (for charts)
    const dailyBreakdown = transactions.reduce((acc, t) => {
      const date = t.date;
      if (!acc[date]) {
        acc[date] = { income: 0, expenses: 0, count: 0 };
      }

      if (t.amount > 0) {
        acc[date].income += t.amount;
      } else {
        acc[date].expenses += Math.abs(t.amount);
      }
      acc[date].count += 1;

      return acc;
    }, {});

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
