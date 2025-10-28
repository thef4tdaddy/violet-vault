import { useMemo } from "react";
import useBudgetData from "../budgeting/useBudgetData";
import { useUnassignedCash, useActualBalance } from "../budgeting/useBudgetMetadata";
import useBills from "../bills/useBills";
import {
  calculateEnvelopeData,
  calculateEnvelopeTotals,
} from "../../utils/budgeting/envelopeCalculations";

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

  // Called for side effects - maintains existing behavior
  useActualBalance();

  const bills = useBills();

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

    // Use existing utility with empty arrays for transactions and bills
    // since we're only calculating envelope-based metrics
    const processedEnvelopeData = calculateEnvelopeData(budgetData.envelopes, [], []);
    return calculateEnvelopeTotals(processedEnvelopeData);
  }, [budgetData.envelopes]);

  // Filter out null/undefined transactions for safe operations
  const safeTransactions = useMemo(() => {
    return (budgetData.transactions || []).filter(
      (t) => t && typeof t === "object" && typeof t.amount === "number"
    );
  }, [budgetData.transactions]);

  return {
    // Original budget data
    ...budgetData,

    // Safe filtered data
    transactions: safeTransactions,

    // Additional query results
    unassignedCash,
    bills,

    // Calculated values using existing utilities
    totalBiweeklyNeed: envelopeSummary.totalBiweeklyNeed,
    envelopeSummary,

    // Loading states
    isLoading: budgetData.isLoading || bills.isLoading,

    // Error states
    hasError: !!budgetData.error || !!bills.error,
  };
};

export default useLayoutData;
