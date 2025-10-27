/**
 * Query functions for budget data
 * These functions fetch data directly from Dexie (primary data source)
 */

import { budgetDb, getBudgetMetadata } from "../../../db/budgetDb";
import logger from "../../../utils/common/logger.ts";

interface TransactionFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  envelopeId?: string;
}

interface Bill {
  dueDate: Date | string;
  [key: string]: unknown;
}

export const queryFunctions = {
  envelopes: async () => {
    const cachedEnvelopes = await budgetDb.envelopes.toArray();
    return cachedEnvelopes || [];
  },

  transactions: async (filters: TransactionFilters = {}) => {
    let result;

    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      result = await budgetDb.getTransactionsByDateRange(start, end);
    } else {
      result = await budgetDb.transactions.orderBy("date").reverse().toArray();
    }

    // Apply additional filters
    if (filters.envelopeId) {
      result = result.filter((t) => t.envelopeId === filters.envelopeId);
    }

    return result || [];
  },

  bills: async () => {
    const cachedBills = await budgetDb.bills.toArray();
    return cachedBills || [];
  },

  savingsGoals: async () => {
    const cachedSavingsGoals = await budgetDb.savingsGoals.toArray();
    return cachedSavingsGoals || [];
  },

  paycheckHistory: async () => {
    try {
      const cachedPaychecks = await budgetDb.paycheckHistory.orderBy("date").reverse().toArray();
      return cachedPaychecks || [];
    } catch (error) {
      logger.warn("Failed to fetch paycheck history from Dexie", error);
      return [];
    }
  },

  dashboardSummary: async () => {
    // Load budget metadata from Dexie (includes unassigned cash)
    const budgetMetadata = await getBudgetMetadata();

    // Fetch data from Dexie instead of undefined variables
    const cachedEnvelopes = await budgetDb.envelopes.toArray();
    const cachedSavingsGoals = await budgetDb.savingsGoals.toArray();
    const cachedBills = await budgetDb.bills.toArray();
    const cachedTransactions = await budgetDb.transactions
      .orderBy("date")
      .reverse()
      .limit(10)
      .toArray();

    // Safe calculation with NaN prevention
    const safeEnvelopes = Array.isArray(cachedEnvelopes) ? cachedEnvelopes : [];
    const safeSavingsGoals = Array.isArray(cachedSavingsGoals) ? cachedSavingsGoals : [];
    const safeBills = Array.isArray(cachedBills) ? cachedBills : [];
    const safeTransactions = Array.isArray(cachedTransactions) ? cachedTransactions : [];

    const totalEnvelopeBalance = safeEnvelopes.reduce((sum, env) => {
      const balance = parseFloat((env?.currentBalance as string | number | undefined) as string) || 0;
      return sum + (isNaN(balance) ? 0 : balance);
    }, 0);

    const totalSavingsBalance = safeSavingsGoals.reduce((sum, goal) => {
      const amount = parseFloat((goal?.currentAmount as string | number | undefined) as string) || 0;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    // Ensure all values are numbers, not NaN
    const unassignedCashValue = parseFloat((budgetMetadata?.unassignedCash as string | number | undefined) as string) || 0;
    const actualBalanceValue = parseFloat((budgetMetadata?.actualBalance as string | number | undefined) as string) || 0;

    const summary = {
      totalEnvelopeBalance: isNaN(totalEnvelopeBalance) ? 0 : totalEnvelopeBalance,
      totalSavingsBalance: isNaN(totalSavingsBalance) ? 0 : totalSavingsBalance,
      unassignedCash: isNaN(unassignedCashValue) ? 0 : unassignedCashValue,
      actualBalance: isNaN(actualBalanceValue) ? 0 : actualBalanceValue,
      recentTransactions: safeTransactions.slice(0, 10),
      upcomingBills: (safeBills as Bill[]).filter((bill) => {
        const dueDate = new Date(bill.dueDate);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return dueDate <= thirtyDaysFromNow;
      }),
    };

    // Calculate difference for balance reconciliation with NaN protection
    summary.virtualBalance =
      summary.totalEnvelopeBalance + summary.totalSavingsBalance + summary.unassignedCash;
    summary.balanceDifference = summary.actualBalance - summary.virtualBalance;

    return summary;
  },
};
