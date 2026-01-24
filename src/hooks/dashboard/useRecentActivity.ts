/**
 * useRecentActivity Hook
 *
 * Aggregates recent financial activity data for the Activity Snapshot widget.
 * Combines data from transactions, bills, and paychecks into a unified activity feed.
 *
 * @module hooks/dashboard/useRecentActivity
 */

import { useMemo } from "react";
import { useTransactionQuery } from "@/hooks/budgeting/transactions/useTransactionQuery";
import { useBillsQuery } from "@/hooks/budgeting/transactions/scheduled/expenses/useBills";
import { useBudgetQueries } from "@/hooks/budgeting/core/useBudgetData/queries";
import type { Transaction } from "@/db/types";

/**
 * Activity item types for the activity feed
 */
export type ActivityType = "transaction" | "bill" | "paycheck";

/**
 * Bill status indicator types
 */
export type BillStatus = "overdue" | "due-soon" | "upcoming";

/**
 * Unified activity item interface
 */
export interface ActivityItem {
  /** Unique identifier */
  id: string;
  /** Type of activity */
  type: ActivityType;
  /** Display date for the activity */
  date: Date;
  /** Primary display text (merchant/bill name/payer) */
  title: string;
  /** Activity amount (positive for income, negative for expense) */
  amount: number;
  /** Optional category/description */
  category?: string;
  /** Whether the amount is income */
  isIncome: boolean;
  /** Status for bills (overdue, due-soon, upcoming) */
  billStatus?: BillStatus;
  /** Whether a bill has been paid */
  isPaid?: boolean;
  /** Allocation status for paychecks */
  allocationStatus?: "allocated" | "partial" | "unallocated";
  /** Original data reference */
  originalData: Transaction;
}

/**
 * Hook options
 */
export interface UseRecentActivityOptions {
  /** Number of recent transactions to show (default: 5) */
  transactionLimit?: number;
  /** Number of days ahead to look for bills (default: 7) */
  billDaysAhead?: number;
  /** Number of recent paychecks to show (default: 2) */
  paycheckLimit?: number;
  /** Whether to enable the hook */
  enabled?: boolean;
}

/**
 * Hook return type
 */
export interface UseRecentActivityReturn {
  /** Recent transactions (last N) */
  recentTransactions: ActivityItem[];
  /** Upcoming bills (within N days) */
  upcomingBills: ActivityItem[];
  /** Recent paychecks (last N) */
  recentPaychecks: ActivityItem[];
  /** All activities combined and sorted */
  allActivity: ActivityItem[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  isError: boolean;
  /** Error object */
  error: Error | null;
  /** Refetch function */
  refetch: () => void;
}

/**
 * Get bill status based on due date
 */
const getBillStatus = (dueDate: Date, isPaid: boolean): BillStatus | undefined => {
  if (isPaid) return undefined;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDateNormalized = new Date(dueDate);
  dueDateNormalized.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil(
    (dueDateNormalized.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return "overdue";
  if (diffDays <= 2) return "due-soon";
  return "upcoming";
};

/**
 * Get paycheck allocation status
 */
const getPaycheckAllocationStatus = (
  paycheck: Transaction
): "allocated" | "partial" | "unallocated" => {
  const allocations = paycheck.allocations;

  if (!allocations || Object.keys(allocations).length === 0) {
    return "unallocated";
  }

  const totalAllocated = Object.values(allocations).reduce((sum, amount) => sum + (amount || 0), 0);

  if (totalAllocated >= Math.abs(paycheck.amount) * 0.99) {
    return "allocated";
  }

  return "partial";
};

/**
 * Transform transaction to activity item
 */
const transactionToActivityItem = (transaction: Transaction): ActivityItem => ({
  id: transaction.id,
  type: "transaction",
  date: new Date(transaction.date),
  title: transaction.description || transaction.merchant || "Transaction",
  amount: transaction.amount,
  category: transaction.category,
  isIncome: transaction.amount > 0,
  originalData: transaction,
});

/**
 * Transform bill (scheduled transaction) to activity item
 */
const billToActivityItem = (bill: Transaction & { isPaid?: boolean }): ActivityItem => {
  const dueDate = new Date(bill.date);
  const isPaid = bill.isPaid ?? false;

  return {
    id: bill.id,
    type: "bill",
    date: dueDate,
    title: bill.description || "Bill",
    amount: Math.abs(bill.amount),
    category: bill.category,
    isIncome: false,
    billStatus: getBillStatus(dueDate, isPaid),
    isPaid,
    originalData: bill,
  };
};

/**
 * Transform paycheck (income transaction with allocations) to activity item
 */
const paycheckToActivityItem = (paycheck: Transaction): ActivityItem => ({
  id: paycheck.id,
  type: "paycheck",
  date: new Date(paycheck.date),
  title: paycheck.payerName || paycheck.description || "Paycheck",
  amount: paycheck.amount,
  category: "Income",
  isIncome: true,
  allocationStatus: getPaycheckAllocationStatus(paycheck),
  originalData: paycheck,
});

/**
 * Custom hook for fetching recent financial activity
 *
 * Aggregates data from multiple sources:
 * - Recent transactions (last N)
 * - Upcoming bills (due within N days)
 * - Recent paychecks (last N)
 *
 * @param options - Configuration options
 * @returns Aggregated activity data with loading/error states
 *
 * @example
 * ```tsx
 * const { recentTransactions, upcomingBills, recentPaychecks, isLoading } = useRecentActivity({
 *   transactionLimit: 5,
 *   billDaysAhead: 7,
 *   paycheckLimit: 2,
 * });
 * ```
 */
export const useRecentActivity = (
  options: UseRecentActivityOptions = {}
): UseRecentActivityReturn => {
  const { transactionLimit = 5, billDaysAhead = 7, paycheckLimit = 2, enabled = true } = options;

  // Fetch recent transactions
  const transactionsQuery = useTransactionQuery({
    limit: transactionLimit * 2, // Fetch extra to filter out scheduled/paychecks
    sortOrder: "desc",
    enabled,
  });

  // Fetch upcoming bills (scheduled expense transactions)
  const billsQuery = useBillsQuery({
    status: "upcoming",
    daysAhead: billDaysAhead,
    sortBy: "dueDate",
    sortOrder: "asc",
    enabled,
  });

  // Fetch paycheck history
  const { paycheckHistoryQuery, paycheckHistory } = useBudgetQueries();

  // Process recent transactions (exclude scheduled and paycheck transactions)
  const recentTransactions = useMemo(() => {
    const transactions = transactionsQuery.transactions || [];

    return transactions
      .filter((t: Transaction) => !t.isScheduled && !t.allocations)
      .slice(0, transactionLimit)
      .map(transactionToActivityItem);
  }, [transactionsQuery.transactions, transactionLimit]);

  // Process upcoming bills (already filtered by useBillsQuery with status: "upcoming" and daysAhead)
  const upcomingBills = useMemo(() => {
    const bills = billsQuery.data || [];
    return bills.map(billToActivityItem);
  }, [billsQuery.data]);

  // Process recent paychecks
  const recentPaychecks = useMemo(() => {
    const paychecks = paycheckHistory || [];

    return paychecks.slice(0, paycheckLimit).map(paycheckToActivityItem);
  }, [paycheckHistory, paycheckLimit]);

  // Combine all activity and sort by date
  const allActivity = useMemo(() => {
    return [...recentTransactions, ...upcomingBills, ...recentPaychecks].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
  }, [recentTransactions, upcomingBills, recentPaychecks]);

  // Combined loading state
  const isLoading =
    transactionsQuery.isLoading || billsQuery.isLoading || paycheckHistoryQuery.isLoading;

  // Combined error state
  const isError = transactionsQuery.isError || billsQuery.isError || paycheckHistoryQuery.isError;

  // Get first error
  const error = transactionsQuery.error || billsQuery.error || paycheckHistoryQuery.error || null;

  // Combined refetch
  const refetch = () => {
    transactionsQuery.refetch();
    billsQuery.refetch();
    paycheckHistoryQuery.refetch();
  };

  return {
    recentTransactions,
    upcomingBills,
    recentPaychecks,
    allActivity,
    isLoading,
    isError,
    error,
    refetch,
  };
};

export default useRecentActivity;
