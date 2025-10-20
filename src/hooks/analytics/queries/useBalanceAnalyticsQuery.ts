import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/utils/common/queryClient";
import { useBudgetStore } from "@/stores/ui/uiStore";

interface Envelope {
  id: string;
  name: string;
  currentBalance?: number;
  targetAmount?: number;
}

interface SavingsGoal {
  id: string;
  name: string;
  currentAmount?: number;
  targetAmount?: number;
}

interface StoreSelector {
  envelopes?: Envelope[];
  savingsGoals?: SavingsGoal[];
  unassignedCash?: number;
  actualBalance?: number;
}

interface EnvelopeAnalysis {
  id: string;
  name: string;
  currentBalance?: number;
  targetAmount?: number;
  utilizationRate: number;
  isUnderfunded: boolean;
  isOverfunded: boolean;
  fundingGap: number;
}

/**
 * Hook for balance analytics data fetching and calculations
 */
export const useBalanceAnalyticsQuery = () => {
  // Get data from Zustand store
  const { envelopes, savingsGoals, unassignedCash, actualBalance } = useBudgetStore((state: StoreSelector) => ({
    envelopes: state.envelopes,
    savingsGoals: state.savingsGoals,
    unassignedCash: state.unassignedCash,
    actualBalance: state.actualBalance,
  }));

  return useQuery({
    queryKey: queryKeys.analyticsBalance(),
    queryFn: async () => {
      const totalEnvelopeBalance = (envelopes || []).reduce(
        (sum: number, env: Envelope) => sum + (env.currentBalance || 0),
        0
      );

      const totalSavingsBalance = (savingsGoals || []).reduce(
        (sum: number, goal: SavingsGoal) => sum + (goal.currentAmount || 0),
        0
      );

      const totalVirtualBalance =
        totalEnvelopeBalance + totalSavingsBalance + (unassignedCash || 0);
      const difference = (actualBalance || 0) - totalVirtualBalance;

      // Envelope allocation analysis
      const envelopeAnalysis = (envelopes || []).map((envelope: Envelope) => ({
        ...envelope,
        utilizationRate:
          envelope.targetAmount > 0 ? (envelope.currentBalance / envelope.targetAmount) * 100 : 0,
        isUnderfunded: (envelope.currentBalance || 0) < (envelope.targetAmount || 0),
        isOverfunded: (envelope.currentBalance || 0) > (envelope.targetAmount || 0),
        fundingGap: Math.max(0, (envelope.targetAmount || 0) - (envelope.currentBalance || 0)),
      }));

      const underfundedEnvelopes = envelopeAnalysis.filter((env) => env.isUnderfunded);
      const overfundedEnvelopes = envelopeAnalysis.filter((env) => env.isOverfunded);

      // Savings goal analysis
      const savingsAnalysis = (savingsGoals || []).map((goal: SavingsGoal) => ({
        ...goal,
        progressRate: goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0,
        remainingAmount: Math.max(0, (goal.targetAmount || 0) - (goal.currentAmount || 0)),
        isCompleted: (goal.currentAmount || 0) >= (goal.targetAmount || 0),
      }));

      return {
        balanceSummary: {
          actualBalance: actualBalance || 0,
          virtualBalance: totalVirtualBalance,
          difference,
          isBalanced: Math.abs(difference) < 0.01,
          totalEnvelopeBalance,
          totalSavingsBalance,
          unassignedCash: unassignedCash || 0,
        },
        envelopeAnalysis,
        savingsAnalysis,
        insights: {
          underfundedCount: underfundedEnvelopes.length,
          overfundedCount: overfundedEnvelopes.length,
          totalFundingGap: underfundedEnvelopes.reduce((sum: number, env: EnvelopeAnalysis) => sum + env.fundingGap, 0),
          averageUtilization:
            envelopeAnalysis.length > 0
              ? envelopeAnalysis.reduce((sum: number, env: EnvelopeAnalysis) => sum + env.utilizationRate, 0) /
                envelopeAnalysis.length
              : 0,
          completedSavingsGoals: savingsAnalysis.filter((goal) => goal.isCompleted).length,
          totalSavingsTarget: savingsAnalysis.reduce(
            (sum: number, goal: SavingsGoal) => sum + (goal.targetAmount || 0),
            0
          ),
        },
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  });
};
