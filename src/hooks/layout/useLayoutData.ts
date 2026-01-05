import { useMemo } from "react";
import useBudgetData from "../budgeting/useBudgetData";
import {
  useUnassignedCash,
  useActualBalance,
  useBudgetMetadataQuery,
} from "../budgeting/useBudgetMetadata";
import useBills from "../bills/useBills";
import {
  calculateEnvelopeData,
  calculateEnvelopeTotals,
} from "../../utils/budgeting/envelopeCalculations";
import type { Transaction as DbTransaction, Bill as DbBill } from "@/db/types";

/**
 * Centralized layout data provider hook
 * Consolidates all TanStack Query calls used across layout components
 * Eliminates duplicate data fetching and provides consistent calculated values
 *
 * @returns {Object} Combined layout data with calculated values
 * @example
 * const { totalBiweeklyNeed, budgetData, bills, unassignedCash } = useLayoutData();
 */
export const useLayoutData = () => {
  // Core TanStack Query hooks
  const budgetData = useBudgetData();
  const { unassignedCash } = useUnassignedCash();
  const { supplementalAccounts } = useBudgetMetadataQuery();

  // Called for side effects - maintains existing behavior
  useActualBalance();

  const bills = useBills();

  // Filter out null/undefined transactions for safe operations
  const safeTransactions = useMemo<DbTransaction[]>(() => {
    return (budgetData.transactions || [])
      .filter((t): t is DbTransaction => {
        if (!t || typeof t !== "object") {
          return false;
        }

        const record = t as Partial<DbTransaction> & { amount?: unknown };
        return (
          typeof record.id === "string" &&
          (record.date instanceof Date || typeof record.date === "string") &&
          typeof record.amount === "number" &&
          typeof record.envelopeId === "string" &&
          typeof record.category === "string" &&
          (record.type === "income" || record.type === "expense" || record.type === "transfer") &&
          typeof record.lastModified === "number"
        );
      })
      .map((transaction) => ({
        ...transaction,
        date: transaction.date instanceof Date ? transaction.date : new Date(transaction.date),
      }));
  }, [budgetData.transactions]);

  const billsList = useMemo<DbBill[]>(() => {
    return (bills?.bills || [])
      .filter((bill): bill is DbBill => {
        if (!bill || typeof bill !== "object") {
          return false;
        }

        const record = bill as Partial<DbBill>;
        return (
          typeof record.id === "string" &&
          typeof record.name === "string" &&
          (record.dueDate instanceof Date || typeof record.dueDate === "string") &&
          typeof record.amount === "number" &&
          typeof record.category === "string" &&
          typeof record.isPaid === "boolean" &&
          typeof record.isRecurring === "boolean" &&
          typeof record.lastModified === "number"
        );
      })
      .map((bill) => ({
        ...bill,
        dueDate: bill.dueDate instanceof Date ? bill.dueDate : new Date(bill.dueDate),
      }));
  }, [bills?.bills]);

  // Calculate derived values using existing utilities
  const envelopeSummary = useMemo(() => {
    if (!budgetData.envelopes || budgetData.envelopes.length === 0) {
      return {
        totalBiweeklyNeed: 0,
        totalAllocated: 0,
        totalBalance: 0,
        totalSpent: 0,
        totalUpcoming: 0,
        billsDueCount: 0,
      };
    }

    // Use actual transactions and bills so totals/spending are accurate
    const normalizedTransactions = safeTransactions.map((transaction) => ({
      ...transaction,
      date:
        transaction.date instanceof Date
          ? transaction.date.toISOString().split("T")[0]
          : String(transaction.date),
    }));

    const processedEnvelopeData = calculateEnvelopeData(
      budgetData.envelopes,
      normalizedTransactions,
      billsList
    );
    return calculateEnvelopeTotals(processedEnvelopeData);
  }, [budgetData.envelopes, safeTransactions, billsList]);

  return {
    ...budgetData,

    // Safe filtered data
    transactions: safeTransactions,

    // Additional query results
    unassignedCash,
    bills: bills as ReturnType<typeof useBills>,

    // Budget object with operations and state
    budget: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      supplementalAccounts: (supplementalAccounts || []) as any[], // SupplementalAccounts still needs typing in future refactor
    },

    // Calculated values using existing utilities
    totalBiweeklyNeed: envelopeSummary.totalBiweeklyNeed,
    envelopeSummary,

    // Loading states
    isLoading: !!(budgetData.isLoading || (bills && bills.isLoading)),

    // Error states
    hasError:
      !!budgetData.envelopesError ||
      !!budgetData.transactionsError ||
      !!budgetData.billsError ||
      !!budgetData.dashboardError,
  };
};

export type LayoutDataType = ReturnType<typeof useLayoutData>;
export default useLayoutData;
