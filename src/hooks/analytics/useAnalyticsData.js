import { useMemo } from "react";
import logger from "../../utils/common/logger";

/**
 * Custom hook for analytics data processing
 * Extracted from ChartsAndAnalytics.jsx for better reusability
 * Issue #151 - ChartsAndAnalytics refactoring
 */
export const useAnalyticsData = ({
  transactions = [],
  envelopes = [],
  timeFilter = "thisMonth",
}) => {
  // Validate and sanitize props to prevent runtime errors
  const safeTransactions = useMemo(
    () => (Array.isArray(transactions) ? transactions : []),
    [transactions],
  );
  const safeEnvelopes = useMemo(
    () => (Array.isArray(envelopes) ? envelopes : []),
    [envelopes],
  );

  // Date validation helper
  const isValidDate = useMemo(
    () => (dateString) => {
      if (!dateString) return false;
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date) && date.getFullYear() > 1900;
    },
    [],
  );

  // Safe division helper
  const safeDivision = (numerator, denominator, fallback = 0) => {
    return denominator === 0 ? fallback : numerator / denominator;
  };

  // Memoized date range calculations using timeFilter
  const getDateRange = useMemo(() => {
    const now = new Date();
    const ranges = {
      thisWeek: (() => {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        return startOfWeek;
      })(),
      thisMonth: new Date(now.getFullYear(), now.getMonth(), 1),
      lastMonth: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      thisYear: new Date(now.getFullYear(), 0, 1),
      "6months": new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()),
      all: new Date(2020, 0, 1),
    };
    return ranges[timeFilter] || ranges["thisMonth"];
  }, [timeFilter]);

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    return safeTransactions.filter((t) => {
      if (!t || !isValidDate(t.date)) return false;
      try {
        return new Date(t.date) >= getDateRange;
      } catch {
        logger.warn("Invalid date in transaction:", t.date);
        return false;
      }
    });
  }, [safeTransactions, getDateRange, isValidDate]);

  // Monthly spending trends
  const monthlyTrends = useMemo(() => {
    const grouped = {};

    filteredTransactions.forEach((transaction) => {
      if (
        !transaction ||
        !isValidDate(transaction.date) ||
        typeof transaction.amount !== "number"
      ) {
        return; // Skip invalid transactions
      }

      try {
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        if (!grouped[monthKey]) {
          grouped[monthKey] = {
            month: monthKey,
            income: 0,
            expenses: 0,
            net: 0,
            transactionCount: 0,
          };
        }

        if (transaction.amount > 0) {
          grouped[monthKey].income += transaction.amount;
        } else {
          grouped[monthKey].expenses += Math.abs(transaction.amount);
        }

        grouped[monthKey].net =
          grouped[monthKey].income - grouped[monthKey].expenses;
        grouped[monthKey].transactionCount++;
      } catch {
        logger.warn(
          "Error processing transaction in monthlyTrends:",
          transaction,
        );
        return;
      }
    });

    const results = Object.values(grouped).sort((a, b) =>
      a.month.localeCompare(b.month),
    );

    // Ensure we always return an array, even if empty
    return results.length > 0
      ? results
      : [
          {
            month: new Date().toISOString().slice(0, 7),
            income: 0,
            expenses: 0,
            net: 0,
            transactionCount: 0,
          },
        ];
  }, [filteredTransactions, isValidDate]);

  // Envelope spending breakdown
  const envelopeSpending = useMemo(() => {
    const spending = {};

    filteredTransactions.forEach((transaction) => {
      if (transaction.amount < 0 && transaction.envelopeId) {
        const envelope = safeEnvelopes.find(
          (e) => e.id === transaction.envelopeId,
        );
        const envelopeName = envelope ? envelope.name : "Unknown Envelope";

        if (!spending[envelopeName]) {
          spending[envelopeName] = {
            name: envelopeName,
            amount: 0,
            count: 0,
            color: envelope?.color || "#8B5CF6",
          };
        }

        spending[envelopeName].amount += Math.abs(transaction.amount);
        spending[envelopeName].count++;
      }
    });

    const results = Object.values(spending).sort((a, b) => b.amount - a.amount);
    // Ensure we always return a valid array
    return results.length > 0 ? results : [];
  }, [filteredTransactions, safeEnvelopes]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const categories = {};

    filteredTransactions.forEach((transaction) => {
      if (transaction.amount < 0) {
        const category = transaction.category || "Uncategorized";

        if (!categories[category]) {
          categories[category] = {
            name: category,
            amount: 0,
            count: 0,
          };
        }

        categories[category].amount += Math.abs(transaction.amount);
        categories[category].count++;
      }
    });

    return Object.values(categories).sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  // Weekly spending patterns
  const weeklyPatterns = useMemo(() => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const patterns = days.map((day) => ({ day, amount: 0, count: 0 }));

    filteredTransactions.forEach((transaction) => {
      if (
        transaction &&
        transaction.amount < 0 &&
        isValidDate(transaction.date)
      ) {
        try {
          const dayIndex = new Date(transaction.date).getDay();
          if (dayIndex >= 0 && dayIndex < 7) {
            patterns[dayIndex].amount += Math.abs(transaction.amount);
            patterns[dayIndex].count++;
          }
        } catch {
          logger.warn("Invalid date in weeklyPatterns:", transaction.date);
        }
      }
    });

    return patterns;
  }, [filteredTransactions, isValidDate]);

  // Envelope health analysis
  const envelopeHealth = useMemo(() => {
    return safeEnvelopes.filter(Boolean).map((envelope) => {
      const monthlyBudget = envelope.monthlyAmount || 0;
      const currentBalance = envelope.currentBalance || 0;
      const spent =
        envelope.spendingHistory?.reduce((sum, s) => sum + s.amount, 0) || 0;

      const healthScore = safeDivision(currentBalance, monthlyBudget, 1) * 100;
      let status = "healthy";

      if (healthScore < 20) status = "critical";
      else if (healthScore < 50) status = "warning";
      else if (healthScore > 150) status = "overfunded";

      return {
        name: envelope.name,
        currentBalance,
        monthlyBudget,
        spent,
        healthScore: Math.max(0, Math.min(200, healthScore)),
        status,
        color: envelope.color,
      };
    });
  }, [safeEnvelopes]);

  // Budget vs actual analysis
  const budgetVsActual = useMemo(() => {
    const analysis = {};

    safeEnvelopes.forEach((envelope) => {
      analysis[envelope.name] = {
        name: envelope.name,
        budgeted: envelope.monthlyAmount || 0,
        actual: 0,
        color: envelope.color,
      };
    });

    filteredTransactions.forEach((transaction) => {
      if (transaction.amount < 0 && transaction.envelopeId) {
        const envelope = safeEnvelopes.find(
          (e) => e.id === transaction.envelopeId,
        );
        if (envelope && analysis[envelope.name]) {
          analysis[envelope.name].actual += Math.abs(transaction.amount);
        }
      }
    });

    return Object.values(analysis).filter(
      (item) => item.budgeted > 0 || item.actual > 0,
    );
  }, [filteredTransactions, safeEnvelopes]);

  // Financial metrics
  const metrics = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = filteredTransactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const savingsRate =
      safeDivision(totalIncome - totalExpenses, totalIncome, 0) * 100;

    const avgMonthlyIncome =
      monthlyTrends.length > 0
        ? safeDivision(
            monthlyTrends.reduce((sum, m) => sum + m.income, 0),
            monthlyTrends.length,
            0,
          )
        : 0;

    const avgMonthlyExpenses =
      monthlyTrends.length > 0
        ? safeDivision(
            monthlyTrends.reduce((sum, m) => sum + m.expenses, 0),
            monthlyTrends.length,
            0,
          )
        : 0;

    return {
      totalIncome,
      totalExpenses,
      netCashFlow: totalIncome - totalExpenses,
      savingsRate,
      avgMonthlyIncome,
      avgMonthlyExpenses,
      transactionCount: filteredTransactions.length,
    };
  }, [filteredTransactions, monthlyTrends]);

  return {
    // Raw data
    filteredTransactions,
    // Processed analytics
    monthlyTrends,
    envelopeSpending,
    categoryBreakdown,
    weeklyPatterns,
    envelopeHealth,
    budgetVsActual,
    metrics,
    // Utilities
    isValidDate,
    safeDivision,
  };
};

export default useAnalyticsData;
