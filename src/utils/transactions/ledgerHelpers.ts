/**
 * Utility functions for TransactionLedger calculations and configurations
 */
import type { Transaction, Envelope } from "@/types/finance";

/**
 * Calculate transaction totals and net cash flow
 */
export const calculateTransactionTotals = (
  transactions: Transaction[]
): { totalIncome: number; totalExpenses: number; netCashFlow: number } => {
  const totalIncome = transactions
    .filter((t) => t && typeof t.amount === "number" && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t && typeof t.amount === "number" && t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netCashFlow = totalIncome - totalExpenses;

  return {
    totalIncome,
    totalExpenses,
    netCashFlow,
  };
};

/**
 * Get filter configurations for StandardFilters component
 */
export const getTransactionFilterConfigs = (
  envelopes: Envelope[]
): Array<{
  key: string;
  type: string;
  defaultValue: string;
  options: Array<{ value: string | number; label: string }>;
}> => [
  {
    key: "dateFilter",
    type: "select",
    defaultValue: "all",
    options: [
      { value: "all", label: "All Time" },
      { value: "today", label: "Today" },
      { value: "week", label: "This Week" },
      { value: "month", label: "This Month" },
    ],
  },
  {
    key: "typeFilter",
    type: "select",
    defaultValue: "all",
    options: [
      { value: "all", label: "All Types" },
      { value: "income", label: "Income" },
      { value: "expense", label: "Expenses" },
    ],
  },
  {
    key: "envelopeFilter",
    type: "select",
    defaultValue: "all",
    options: [
      { value: "all", label: "All Envelopes" },
      { value: "", label: "Unassigned" },
      ...envelopes.map((env) => ({ value: env.id, label: env.name })),
    ],
  },
  {
    key: "sortBy",
    type: "select",
    defaultValue: "date",
    options: [
      { value: "date", label: "Date" },
      { value: "amount", label: "Amount" },
      { value: "description", label: "Description" },
    ],
  },
];

/**
 * Format transaction count and net cash flow for display
 */
export const formatLedgerSummary = (transactionCount: number, netCashFlow: number): string => {
  return `${transactionCount} transactions • Net: $${netCashFlow.toFixed(2)}`;
};
