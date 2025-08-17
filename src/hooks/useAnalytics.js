import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useBudgetStore } from "../stores/budgetStore";
import { queryKeys } from "../utils/queryClient";
// import { budgetDb } from "../db/budgetDb"; // TODO: Use for offline fallback

/**
 * Specialized hook for analytics and reporting
 * Provides financial insights, charts data, and spending analysis with caching
 */
const useAnalytics = (options = {}) => {
  const queryClient = useQueryClient();
  const {
    period = "thisMonth", // 'thisWeek', 'thisMonth', 'lastMonth', 'thisYear', 'custom'
    customDateRange,
    includeTransfers = false,
    groupBy = "category", // 'category', 'envelope', 'date', 'day', 'week', 'month'
  } = options;

  // Get data from Zustand store
  const { envelopes, transactions, savingsGoals, unassignedCash, actualBalance, paycheckHistory } =
    useBudgetStore();

  // Helper function to get date range based on period
  const getDateRange = () => {
    const today = new Date();
    let startDate, endDate;

    switch (period) {
      case "thisWeek":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // End of week (Saturday)
        endDate.setHours(23, 59, 59, 999);
        break;
      case "thisMonth":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "lastMonth":
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "thisYear":
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "custom":
        if (customDateRange) {
          startDate = new Date(customDateRange.start);
          endDate = new Date(customDateRange.end);
          endDate.setHours(23, 59, 59, 999);
        } else {
          // Default to this month if no custom range provided
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          endDate.setHours(23, 59, 59, 999);
        }
        break;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
    }

    return { startDate, endDate };
  };

  // Main analytics query
  const analyticsQuery = useQuery({
    queryKey: queryKeys.analyticsSpending({
      period,
      customDateRange,
      includeTransfers,
      groupBy,
    }),
    queryFn: async () => {
      const { startDate, endDate } = getDateRange();

      // Filter transactions for the period
      const periodTransactions = (transactions || []).filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });

      // Filter out transfers if not included
      const analysisTransactions = includeTransfers
        ? periodTransactions
        : periodTransactions.filter((t) => t.type !== "transfer");

      // Basic calculations
      const totalIncome = analysisTransactions
        .filter((t) => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpenses = Math.abs(
        analysisTransactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)
      );

      const netAmount = totalIncome - totalExpenses;

      // Category breakdown
      const categoryBreakdown = analysisTransactions.reduce((acc, transaction) => {
        const category = transaction.category || "uncategorized";
        if (!acc[category]) {
          acc[category] = {
            income: 0,
            expenses: 0,
            net: 0,
            count: 0,
            transactions: [],
          };
        }

        if (transaction.amount > 0) {
          acc[category].income += transaction.amount;
        } else {
          acc[category].expenses += Math.abs(transaction.amount);
        }

        acc[category].net += transaction.amount;
        acc[category].count += 1;
        acc[category].transactions.push(transaction);

        return acc;
      }, {});

      // Envelope breakdown
      const envelopeBreakdown = analysisTransactions.reduce((acc, transaction) => {
        if (!transaction.envelopeId) return acc;

        const envelope = envelopes?.find((env) => env.id === transaction.envelopeId);
        const envelopeName = envelope?.name || "Unknown Envelope";

        if (!acc[envelopeName]) {
          acc[envelopeName] = {
            income: 0,
            expenses: 0,
            net: 0,
            count: 0,
            envelopeId: transaction.envelopeId,
          };
        }

        if (transaction.amount > 0) {
          acc[envelopeName].income += transaction.amount;
        } else {
          acc[envelopeName].expenses += Math.abs(transaction.amount);
        }

        acc[envelopeName].net += transaction.amount;
        acc[envelopeName].count += 1;

        return acc;
      }, {});

      // Time series data for charts
      const timeSeriesData = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dayTransactions = analysisTransactions.filter((t) => {
          const tDate = new Date(t.date);
          return tDate.toDateString() === currentDate.toDateString();
        });

        const dayIncome = dayTransactions
          .filter((t) => t.amount > 0)
          .reduce((sum, t) => sum + t.amount, 0);

        const dayExpenses = Math.abs(
          dayTransactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)
        );

        timeSeriesData.push({
          date: new Date(currentDate),
          income: dayIncome,
          expenses: dayExpenses,
          net: dayIncome - dayExpenses,
          transactionCount: dayTransactions.length,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Spending trends and insights
      const insights = {
        topSpendingCategories: Object.entries(categoryBreakdown)
          .filter(([, data]) => data.expenses > 0)
          .sort(([, a], [, b]) => b.expenses - a.expenses)
          .slice(0, 5)
          .map(([category, data]) => ({ category, ...data })),

        topIncomeCategories: Object.entries(categoryBreakdown)
          .filter(([, data]) => data.income > 0)
          .sort(([, a], [, b]) => b.income - a.income)
          .slice(0, 5)
          .map(([category, data]) => ({ category, ...data })),

        dailyAverage: {
          income: totalIncome / Math.max(1, timeSeriesData.length),
          expenses: totalExpenses / Math.max(1, timeSeriesData.length),
          net: netAmount / Math.max(1, timeSeriesData.length),
        },

        transactionFrequency: {
          total: analysisTransactions.length,
          income: analysisTransactions.filter((t) => t.amount > 0).length,
          expense: analysisTransactions.filter((t) => t.amount < 0).length,
        },
      };

      return {
        period,
        dateRange: { startDate, endDate },
        summary: {
          totalIncome,
          totalExpenses,
          netAmount,
          transactionCount: analysisTransactions.length,
        },
        categoryBreakdown,
        envelopeBreakdown,
        timeSeriesData,
        insights,
        transactions: analysisTransactions,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: true,
  });

  // Balance analytics query
  const balanceAnalyticsQuery = useQuery({
    queryKey: queryKeys.analyticsBalance(),
    queryFn: async () => {
      const totalEnvelopeBalance = (envelopes || []).reduce(
        (sum, env) => sum + (env.currentBalance || 0),
        0
      );

      const totalSavingsBalance = (savingsGoals || []).reduce(
        (sum, goal) => sum + (goal.currentAmount || 0),
        0
      );

      const totalVirtualBalance =
        totalEnvelopeBalance + totalSavingsBalance + (unassignedCash || 0);
      const difference = (actualBalance || 0) - totalVirtualBalance;

      // Envelope allocation analysis
      const envelopeAnalysis = (envelopes || []).map((envelope) => ({
        ...envelope,
        utilizationRate:
          envelope.targetAmount > 0 ? (envelope.currentBalance / envelope.targetAmount) * 100 : 0,
        isUnderfunded: (envelope.currentBalance || 0) < (envelope.targetAmount || 0),
        isOverfunded: (envelope.currentBalance || 0) > (envelope.targetAmount || 0),
        fundingGap: Math.max(0, (envelope.targetAmount || 0) - (envelope.currentBalance || 0)),
      }));

      const underfundedEnvelopes = envelopeAnalysis.filter((env) => env.isUnderfunded);
      const overfundedEnvelopes = envelopeAnalysis.filter((env) => env.isOverfunded);

      // Savings goal analysis
      const savingsAnalysis = (savingsGoals || []).map((goal) => ({
        ...goal,
        progressRate: goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0,
        remainingAmount: Math.max(0, (goal.targetAmount || 0) - (goal.currentAmount || 0)),
        isCompleted: (goal.currentAmount || 0) >= (goal.targetAmount || 0),
      }));

      return {
        balanceSummary: {
          actualBalance: actualBalance || 0,
          virtualBalance: totalVirtualBalance,
          difference,
          isBalanced: Math.abs(difference) < 0.01,
          totalEnvelopeBalance,
          totalSavingsBalance,
          unassignedCash: unassignedCash || 0,
        },
        envelopeAnalysis,
        savingsAnalysis,
        insights: {
          underfundedCount: underfundedEnvelopes.length,
          overfundedCount: overfundedEnvelopes.length,
          totalFundingGap: underfundedEnvelopes.reduce((sum, env) => sum + env.fundingGap, 0),
          averageUtilization:
            envelopeAnalysis.length > 0
              ? envelopeAnalysis.reduce((sum, env) => sum + env.utilizationRate, 0) /
                envelopeAnalysis.length
              : 0,
          completedSavingsGoals: savingsAnalysis.filter((goal) => goal.isCompleted).length,
          totalSavingsTarget: savingsAnalysis.reduce(
            (sum, goal) => sum + (goal.targetAmount || 0),
            0
          ),
        },
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  });

  // Paycheck trends query
  const paycheckTrendsQuery = useQuery({
    queryKey: queryKeys.paycheckPredictions(),
    queryFn: async () => {
      if (!paycheckHistory || paycheckHistory.length === 0) {
        return {
          trends: [],
          averageAmount: 0,
          frequency: null,
          growth: 0,
        };
      }

      // Sort paychecks by date
      const sortedPaychecks = [...paycheckHistory].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      const averageAmount =
        sortedPaychecks.reduce((sum, pc) => sum + pc.amount, 0) / sortedPaychecks.length;

      // Calculate frequency (days between paychecks)
      const intervals = [];
      for (let i = 1; i < sortedPaychecks.length; i++) {
        const current = new Date(sortedPaychecks[i].date);
        const previous = new Date(sortedPaychecks[i - 1].date);
        const days = Math.round((current - previous) / (1000 * 60 * 60 * 24));
        intervals.push(days);
      }

      const averageInterval =
        intervals.length > 0
          ? intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
          : 0;

      // Determine frequency type
      let frequency = "irregular";
      if (averageInterval >= 13 && averageInterval <= 15) frequency = "biweekly";
      else if (averageInterval >= 6 && averageInterval <= 8) frequency = "weekly";
      else if (averageInterval >= 27 && averageInterval <= 33) frequency = "monthly";

      // Calculate growth rate (compare recent vs older paychecks)
      let growth = 0;
      if (sortedPaychecks.length >= 4) {
        const recentAvg = sortedPaychecks.slice(-2).reduce((sum, pc) => sum + pc.amount, 0) / 2;
        const olderAvg = sortedPaychecks.slice(0, 2).reduce((sum, pc) => sum + pc.amount, 0) / 2;
        growth = ((recentAvg - olderAvg) / olderAvg) * 100;
      }

      return {
        trends: sortedPaychecks,
        averageAmount,
        frequency,
        averageInterval,
        growth,
        totalEarned: sortedPaychecks.reduce((sum, pc) => sum + pc.amount, 0),
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!paycheckHistory,
  });

  // Utility functions for chart data formatting
  const getChartData = (type) => {
    const data = analyticsQuery.data;
    if (!data) return [];

    switch (type) {
      case "categoryPie":
        return Object.entries(data.categoryBreakdown)
          .filter(([, categoryData]) => categoryData.expenses > 0)
          .map(([category, categoryData]) => ({
            name: category,
            value: categoryData.expenses,
            count: categoryData.count,
          }));

      case "dailyLine":
        return data.timeSeriesData.map((day) => ({
          date: day.date.toISOString().split("T")[0],
          income: day.income,
          expenses: day.expenses,
          net: day.net,
        }));

      case "envelopeBar":
        return Object.entries(data.envelopeBreakdown).map(([name, envelopeData]) => ({
          name,
          expenses: envelopeData.expenses,
          income: envelopeData.income,
          net: envelopeData.net,
        }));

      default:
        return [];
    }
  };

  return {
    // Data
    analytics: analyticsQuery.data,
    balanceAnalytics: balanceAnalyticsQuery.data,
    paycheckTrends: paycheckTrendsQuery.data,

    // Loading states
    isLoading: analyticsQuery.isLoading || balanceAnalyticsQuery.isLoading,
    isFetching: analyticsQuery.isFetching || balanceAnalyticsQuery.isFetching,
    isError: analyticsQuery.isError || balanceAnalyticsQuery.isError,
    error: analyticsQuery.error || balanceAnalyticsQuery.error,

    // Individual query states
    spendingLoading: analyticsQuery.isLoading,
    balanceLoading: balanceAnalyticsQuery.isLoading,
    paycheckLoading: paycheckTrendsQuery.isLoading,

    // Chart data helpers
    getChartData,

    // Utility functions
    getDateRange,

    // Query controls
    refetch: () => {
      analyticsQuery.refetch();
      balanceAnalyticsQuery.refetch();
      paycheckTrendsQuery.refetch();
    },
    invalidate: () => queryClient.invalidateQueries({ queryKey: queryKeys.analytics }),
  };
};

export default useAnalytics;
