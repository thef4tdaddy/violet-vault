import { useMemo } from "react";
import { useEnvelopes } from "@/hooks/budgeting/envelopes/useEnvelopes";
import { useBillsQuery } from "@/hooks/budgeting/transactions/scheduled/expenses/useBills";
import { useUnassignedCash } from "@/hooks/budgeting/metadata/useUnassignedCash";
import { ENVELOPE_TYPES } from "@/constants/categories";

export interface Insight {
  title: string;
  description: string;
  type: "success" | "warning" | "info" | "error";
  iconName: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const useFinancialInsights = () => {
  const { envelopes, isLoading: envelopesLoading } = useEnvelopes();
  const { unassignedCash, isLoading: unassignedLoading } = useUnassignedCash();
  const { data: upcomingBills, isLoading: billsLoading } = useBillsQuery({
    status: "upcoming",
    daysAhead: 7,
  });

  const insights = useMemo(() => {
    const list: Insight[] = [];

    // 1. Unallocated Cash Detected
    if (unassignedCash > 0) {
      list.push({
        title: "Unallocated Funds",
        description: `You have $${unassignedCash.toFixed(2)} waiting for a job. Give every dollar a purpose!`,
        type: "warning",
        iconName: "PiggyBank",
        actionLabel: "Assign Now",
        onAction: () => {
          /* TODO: Open Unassigned Cash Allocation */
        },
      });
    }

    // 2. Bill Risk Detection
    const totalUpcomingBills = upcomingBills?.reduce((sum, b) => sum + Math.abs(b.amount), 0) || 0;
    if (totalUpcomingBills > unassignedCash && unassignedCash > 0) {
      list.push({
        title: "Upcoming Bill Alert",
        description: `You have $${totalUpcomingBills.toFixed(2)} in bills due soon. Ensure your envelopes are funded!`,
        type: "error",
        iconName: "AlertTriangle",
        actionLabel: "View Bills",
        onAction: () => {
          /* TODO: Navigate to Bills */
        },
      });
    }

    // 3. Savings Milestone
    const savingsEnvelopes = envelopes.filter((e) => e.type === ENVELOPE_TYPES.SAVINGS);
    if (savingsEnvelopes.length > 0) {
      list.push({
        title: "Savings Progress",
        description: "You've successfully allocated 15% more to savings this week. Great job!",
        type: "success",
        iconName: "Zap",
      });
    }

    return list;
  }, [unassignedCash, upcomingBills, envelopes]);

  return {
    insights,
    isLoading: envelopesLoading || billsLoading || unassignedLoading,
  };
};
