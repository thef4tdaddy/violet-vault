/**
 * Utility functions for envelope health and budget analysis
 * Extracted from useAnalyticsData hook to reduce complexity
 */

import { safeDivision } from "./analyticsDataUtils";

interface Envelope {
  id?: string;
  name: string;
  monthlyAmount?: number;
  currentBalance?: number;
  spendingHistory?: Array<{ amount: number }>;
  color?: string;
}

interface EnvelopeHealth {
  name: string;
  currentBalance: number;
  monthlyBudget: number;
  spent: number;
  healthScore: number;
  status: string;
  color?: string;
}

/**
 * Calculate envelope health analysis
 */
export const calculateEnvelopeHealth = (envelopes: Envelope[]): EnvelopeHealth[] => {
  return envelopes.filter(Boolean).map((envelope) => {
    const monthlyBudget = envelope.monthlyAmount || 0;
    const currentBalance = envelope.currentBalance || 0;
    const spent = envelope.spendingHistory?.reduce((sum, s) => sum + s.amount, 0) || 0;

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
};

interface Transaction {
  amount?: number;
  envelopeId?: string;
}

interface BudgetVsActual {
  name: string;
  budgeted: number;
  actual: number;
  color?: string;
}

/**
 * Calculate budget vs actual analysis
 */
export const calculateBudgetVsActual = (
  transactions: Transaction[],
  envelopes: Envelope[]
): BudgetVsActual[] => {
  const analysis: Record<string, BudgetVsActual> = {};

  envelopes.forEach((envelope) => {
    analysis[envelope.name] = {
      name: envelope.name,
      budgeted: envelope.monthlyAmount || 0,
      actual: 0,
      color: envelope.color,
    };
  });

  transactions.forEach((transaction) => {
    if (transaction.amount && transaction.amount < 0 && transaction.envelopeId) {
      const envelope = envelopes.find((e) => e.id === transaction.envelopeId);
      if (envelope && analysis[envelope.name]) {
        analysis[envelope.name].actual += Math.abs(transaction.amount);
      }
    }
  });

  return Object.values(analysis).filter((item) => item.budgeted > 0 || item.actual > 0);
};

interface MonthlyTrend {
  income: number;
  expenses: number;
}

interface FinancialMetrics {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  savingsRate: number;
  avgMonthlyIncome: number;
  avgMonthlyExpenses: number;
  transactionCount: number;
}

/**
 * Calculate financial metrics
 */
export const calculateFinancialMetrics = (
  transactions: Transaction[],
  monthlyTrends: MonthlyTrend[]
): FinancialMetrics => {
  const totalIncome = transactions
    .filter((t) => t.amount && t.amount > 0)
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalExpenses = transactions
    .filter((t) => t.amount && t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  const savingsRate = safeDivision(totalIncome - totalExpenses, totalIncome, 0) * 100;

  const avgMonthlyIncome =
    monthlyTrends.length > 0
      ? safeDivision(
          monthlyTrends.reduce((sum, m) => sum + m.income, 0),
          monthlyTrends.length,
          0
        )
      : 0;

  const avgMonthlyExpenses =
    monthlyTrends.length > 0
      ? safeDivision(
          monthlyTrends.reduce((sum, m) => sum + m.expenses, 0),
          monthlyTrends.length,
          0
        )
      : 0;

  return {
    totalIncome,
    totalExpenses,
    netCashFlow: totalIncome - totalExpenses,
    savingsRate,
    avgMonthlyIncome,
    avgMonthlyExpenses,
    transactionCount: transactions.length,
  };
};
