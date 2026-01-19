import { useMemo } from "react";
import { useActualBalance } from "@/hooks/budgeting/metadata/useActualBalance";
import { useUnassignedCash } from "@/hooks/budgeting/metadata/useUnassignedCash";

/**
 * Account balances data structure
 */
export interface AccountBalances {
  checking: {
    balance: number;
    isManual: boolean;
  };
  savings: {
    balance: number;
  };
  unassigned: {
    amount: number;
    isNegative: boolean;
    isHigh: boolean;
  };
}

/**
 * Hook for aggregating account balance data for dashboard cards
 *
 * Combines data from multiple sources:
 * - Actual balance (checking account)
 * - Unassigned cash
 *
 * @returns Account balances and loading/error states
 */
export const useAccountBalances = () => {
  // Fetch actual balance data
  const {
    actualBalance,
    isActualBalanceManual,
    isLoading: isBalanceLoading,
    error: balanceError,
  } = useActualBalance();

  // Fetch unassigned cash data
  const {
    unassignedCash,
    isLoading: isUnassignedLoading,
    error: unassignedError,
  } = useUnassignedCash();

  // Compute derived values
  const accountBalances: AccountBalances = useMemo(() => {
    // For now, savings is tracked within the actual balance
    // In the future, this could be split out to separate accounts
    const savingsBalance = 0; // TODO: Implement savings account tracking

    // Determine if unassigned cash is high (threshold: > $500)
    const UNASSIGNED_HIGH_THRESHOLD = 500;
    const isUnassignedHigh = unassignedCash > UNASSIGNED_HIGH_THRESHOLD;

    return {
      checking: {
        balance: actualBalance,
        isManual: isActualBalanceManual,
      },
      savings: {
        balance: savingsBalance,
      },
      unassigned: {
        amount: unassignedCash,
        isNegative: unassignedCash < 0,
        isHigh: isUnassignedHigh,
      },
    };
  }, [actualBalance, isActualBalanceManual, unassignedCash]);

  // Aggregate loading and error states
  const isLoading = isBalanceLoading || isUnassignedLoading;
  const error = balanceError || unassignedError;

  return {
    accountBalances,
    isLoading,
    error,
  };
};
