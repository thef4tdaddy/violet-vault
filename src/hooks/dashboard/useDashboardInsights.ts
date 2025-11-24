import { useMemo } from "react";
import type { PaydayPrediction } from "@/utils/budgeting/paydayPredictor";
import type { Debt } from "@/db/types";

interface Insight {
  id: string;
  type: "info" | "warning" | "success";
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Hook for generating dashboard insights
 */
export const useDashboardInsights = (
  unassignedCash: number,
  debts: Debt[],
  paydayPrediction: PaydayPrediction | null,
  setActiveView: (view: string) => void
): Insight[] => {
  return useMemo(() => {
    const insightsList: Insight[] = [];

    if (unassignedCash > 0) {
      insightsList.push({
        id: "unassigned-cash",
        type: "info",
        message: `You have $${unassignedCash.toFixed(2)} unallocated`,
        action: {
          label: "Suggest Envelopes",
          onClick: () => setActiveView("envelopes"),
        },
      });
    }

    if (debts.length > 0) {
      const totalDebt = debts.reduce((sum, debt) => sum + (debt.currentBalance || 0), 0);
      insightsList.push({
        id: "debt-summary",
        type: "info",
        message: `Total debt: $${totalDebt.toFixed(2)}. Stay on track with your payments.`,
      });
    }

    if (paydayPrediction && paydayPrediction.confidence >= 80) {
      insightsList.push({
        id: "payday-confidence",
        type: "success",
        message: "High confidence payday prediction. You're managing your budget well!",
      });
    }

    return insightsList;
  }, [unassignedCash, debts, paydayPrediction, setActiveView]);
};
