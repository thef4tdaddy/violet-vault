/**
 * Query functions for budget data
 * These functions fetch data directly from Dexie (primary data source)
 */

import { budgetDb, getBudgetMetadata } from "@/db/budgetDb";
import logger from "@/utils/core/common/logger.ts";
import type { Transaction } from "@/db/types";

export interface TransactionFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  envelopeId?: string;
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
    // Phase 2: Bills are scheduled transactions
    const transactions = await budgetDb.transactions
      .filter((t) => t.isScheduled === true)
      .toArray();
    return transactions || [];
  },

  savingsGoals: async () => {
    // Phase 2: Savings Goals are goal envelopes
    const goals = await budgetDb.envelopes.where("type").equals("goal").toArray();
    return goals || [];
  },

  paycheckHistory: async () => {
    try {
      // Phase 1 Fix: Use budgetDb.getPaycheckHistory() which queries transactions table
      // Filters: type === "income" && !!allocations
      const cachedPaychecks = await budgetDb.getPaycheckHistory();

      // Sort by processedAt (preferred) or date (legacy), most recent first
      const sorted = cachedPaychecks.sort((a, b) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pA = a as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pB = b as any;
        const dateA = new Date(Number(pA.processedAt) || Number(pA.date) || 0).getTime();
        const dateB = new Date(Number(pB.processedAt) || Number(pB.date) || 0).getTime();
        return dateB - dateA; // Descending order (newest first)
      });

      return sorted || [];
    } catch (error) {
      logger.warn("Failed to fetch paycheck history from Dexie", {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  },

  dashboardSummary: async () => {
    // Load budget metadata from Dexie (includes unassigned cash)
    const budgetMetadata = await getBudgetMetadata();

    // Fetch data from Dexie instead of undefined variables
    // Fetch data from Dexie
    const cachedEnvelopes = await budgetDb.envelopes.toArray();
    const cachedSavingsGoals = await budgetDb.envelopes.where("type").equals("goal").toArray();
    const cachedBills = await budgetDb.transactions.filter((t) => t.isScheduled === true).toArray();
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
      const balance = Number(env?.currentBalance) || 0;
      return sum + (isNaN(balance) ? 0 : balance);
    }, 0);

    const totalSavingsBalance = safeSavingsGoals.reduce(
      (sum: number, goal: Record<string, unknown>) => {
        const amount = Number(goal?.currentAmount) || 0;
        return sum + (isNaN(amount) ? 0 : amount);
      },
      0
    );

    // Ensure all values are numbers, not NaN
    const unassignedCashValue =
      parseFloat(budgetMetadata?.unassignedCash as string | number | undefined as string) || 0;
    const actualBalanceValue =
      parseFloat(budgetMetadata?.actualBalance as string | number | undefined as string) || 0;

    const summary = {
      totalEnvelopeBalance: isNaN(totalEnvelopeBalance) ? 0 : totalEnvelopeBalance,
      totalSavingsBalance: isNaN(totalSavingsBalance) ? 0 : totalSavingsBalance,
      unassignedCash: isNaN(unassignedCashValue) ? 0 : unassignedCashValue,
      actualBalance: isNaN(actualBalanceValue) ? 0 : actualBalanceValue,
      recentTransactions: safeTransactions.slice(0, 10),
      upcomingBills: (safeBills as unknown as Transaction[]).filter((bill) => {
        if (!bill.date) return false;
        const dueDate = new Date(bill.date);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return dueDate <= thirtyDaysFromNow;
      }),
      virtualBalance: 0,
      balanceDifference: 0,
    };

    // Calculate difference for balance reconciliation with NaN protection
    summary.virtualBalance =
      summary.totalEnvelopeBalance + summary.totalSavingsBalance + summary.unassignedCash;
    summary.balanceDifference = summary.actualBalance - summary.virtualBalance;

    return summary;
  },
};
