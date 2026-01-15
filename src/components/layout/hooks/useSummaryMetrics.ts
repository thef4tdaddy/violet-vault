import { useMemo } from "react";
import { useUnassignedCash } from "@/hooks/budgeting/metadata/useBudgetMetadata";
import { useEnvelopes } from "@/hooks/budgeting/envelopes/useEnvelopes";
import useSavingsGoals from "@/hooks/budgeting/envelopes/goals/useSavingsGoals";
import {
  calculateEnvelopeData,
  calculateEnvelopeTotals,
} from "@/utils/domain/budgeting/envelopeCalculations";

export interface SummaryMetric {
  key: string;
  icon: string;
  label: string;
  value: number;
  variant: "default" | "success" | "warning" | "danger" | "info";
  subtitle?: string;
  onClick?: () => void;
  ariaLabel?: string;
  dataTour?: string;
}

/**
 * Custom hook to calculate and return summary metrics for the dashboard
 * Extracted from SummaryCards component for better separation of concerns
 *
 * @param onUnassignedCashClick - Callback function when unassigned cash card is clicked
 * @param onTotalCashClick - Callback function when total cash card is clicked
 * @returns Object containing metrics array and loading state
 */
export const useSummaryMetrics = (
  onUnassignedCashClick: () => void,
  onTotalCashClick: () => void
) => {
  // Get data from TanStack Query hooks
  const { unassignedCash } = useUnassignedCash();
  const { envelopes = [], isLoading: envelopesLoading } = useEnvelopes();
  const { savingsGoals = [], isLoading: savingsLoading } = useSavingsGoals();

  // Calculate totals
  const metrics = useMemo(() => {
    const totalEnvelopeBalance = envelopes.reduce(
      (sum: number, env: { currentBalance?: number }) => sum + (env.currentBalance || 0),
      0
    );

    const totalSavingsBalance = savingsGoals.reduce(
      (sum: number, goal: { currentAmount?: number | string }) =>
        sum + (typeof goal.currentAmount === "number" ? goal.currentAmount : 0),
      0
    );

    const totalCash = totalEnvelopeBalance + totalSavingsBalance + unassignedCash;

    // Calculate biweekly needs using existing utility
    const processedEnvelopeData = calculateEnvelopeData(envelopes, [], []);
    const envelopeSummary = calculateEnvelopeTotals(processedEnvelopeData);
    const biweeklyNeed = envelopeSummary.totalBiweeklyNeed;

    const summaryMetrics: SummaryMetric[] = [
      {
        key: "total-cash",
        icon: "Wallet",
        label: "Total Cash",
        value: totalCash,
        variant: "default",
        onClick: onTotalCashClick,
        ariaLabel: "Set actual balance",
        dataTour: "actual-balance",
      },
      {
        key: "unassigned-cash",
        icon: "TrendingUp",
        label: "Unassigned Cash",
        value: unassignedCash,
        variant: unassignedCash < 0 ? "danger" : "success",
        onClick: onUnassignedCashClick,
        ariaLabel: "Distribute unassigned cash",
      },
      {
        key: "savings-total",
        icon: "Target",
        label: "Savings Total",
        value: totalSavingsBalance,
        variant: "info",
      },
      {
        key: "biweekly-remaining",
        icon: "DollarSign",
        label: "Biweekly Remaining",
        value: biweeklyNeed,
        variant: "warning",
        subtitle: `Total allocation: $${biweeklyNeed.toFixed(2)}`,
      },
    ];

    return summaryMetrics;
  }, [envelopes, savingsGoals, unassignedCash, onUnassignedCashClick, onTotalCashClick]);

  return {
    metrics,
    isLoading: envelopesLoading || savingsLoading,
  };
};
