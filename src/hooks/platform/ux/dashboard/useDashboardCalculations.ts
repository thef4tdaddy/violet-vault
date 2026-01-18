import { useMemo } from "react";
import type { Envelope, SavingsGoal } from "./types";

/**
 * Hook for dashboard balance calculations and reconciliation logic
 * Extracts balance calculations and difference analysis
 */
export const useDashboardCalculations = (
  envelopes: Envelope[] = [],
  savingsGoals: SavingsGoal[] = [],
  unassignedCash: number = 0,
  actualBalance: number = 0
) => {
  const calculations = useMemo(() => {
    // Calculate totals
    const totalEnvelopeBalance = envelopes.reduce((sum, env) => {
      const balance = parseFloat(String(env?.currentBalance || "0")) || 0;
      return sum + (isNaN(balance) ? 0 : balance);
    }, 0);

    const totalSavingsBalance = savingsGoals.reduce((sum, goal) => {
      const amount = parseFloat(String(goal?.currentAmount || "0")) || 0;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    // Ensure unassignedCash is not NaN
    const safeUnassignedCash =
      typeof unassignedCash === "number" && !isNaN(unassignedCash) ? unassignedCash : 0;
    const totalVirtualBalance = totalEnvelopeBalance + totalSavingsBalance + safeUnassignedCash;

    // Calculate difference
    const difference = actualBalance - totalVirtualBalance;
    const isBalanced = Math.abs(difference) < 0.01; // Allow for rounding differences

    return {
      totalEnvelopeBalance,
      totalSavingsBalance,
      safeUnassignedCash,
      totalVirtualBalance,
      difference,
      isBalanced,
    };
  }, [envelopes, savingsGoals, unassignedCash, actualBalance]);

  return calculations;
};
