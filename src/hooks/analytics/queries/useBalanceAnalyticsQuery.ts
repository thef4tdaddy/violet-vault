import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/utils/common/queryClient";
import { useEnvelopesQuery } from "@/hooks/budgeting/useEnvelopesQuery";
import { useSavingsGoals } from "@/hooks/common/useSavingsGoals";
import { useBudgetMetadata } from "@/hooks/budgeting/useBudgetMetadata";

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
 * Updated to use TanStack Query hooks instead of Zustand store
 * This ensures data is fetched from Dexie (single source of truth)
 */
export const useBalanceAnalyticsQuery = () => {
  // Get data from TanStack Query (Dexie as source of truth)
  const { envelopes } = useEnvelopesQuery();
  const { savingsGoals } = useSavingsGoals();
  const { unassignedCash, actualBalance } = useBudgetMetadata();

  return useQuery({
    queryKey: queryKeys.analyticsBalance(),
    queryFn: async () => {
      const totalEnvelopeBalance = (envelopes || []).reduce(
        (sum: number, env: Envelope) => sum + (env.currentBalance || 0),
        0
      );

      const totalSavingsBalance = (savingsGoals || []).reduce(
        (sum: number, goal: unknown) => {
          const g = goal as SavingsGoal;
          return sum + (g.currentAmount || 0);
        },
        0
      );

      const totalVirtualBalance =
        totalEnvelopeBalance + totalSavingsBalance + (unassignedCash || 0);
      const difference = (actualBalance || 0) - totalVirtualBalance;

      // Envelope allocation analysis
      const envelopeAnalysis = (envelopes || []).map((envelope: Envelope) => ({
        ...envelope,
        utilizationRate:
          (envelope.targetAmount || 0) > 0 ? ((envelope.currentBalance || 0) / (envelope.targetAmount || 0)) * 100 : 0,
        isUnderfunded: (envelope.currentBalance || 0) < (envelope.targetAmount || 0),
        isOverfunded: (envelope.currentBalance || 0) > (envelope.targetAmount || 0),
        fundingGap: Math.max(0, (envelope.targetAmount || 0) - (envelope.currentBalance || 0)),
      }));

      const underfundedEnvelopes = envelopeAnalysis.filter((env) => env.isUnderfunded);
      const overfundedEnvelopes = envelopeAnalysis.filter((env) => env.isOverfunded);

      // Savings goal analysis
      const savingsAnalysis = (savingsGoals || []).map((goal: unknown) => {
        const g = goal as SavingsGoal;
        return {
          ...g,
          progressRate: (g.targetAmount || 0) > 0 ? ((g.currentAmount || 0) / (g.targetAmount || 0)) * 100 : 0,
          remainingAmount: Math.max(0, (g.targetAmount || 0) - (g.currentAmount || 0)),
          isCompleted: (g.currentAmount || 0) >= (g.targetAmount || 0),
        };
      });

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
          totalFundingGap: underfundedEnvelopes.reduce(
            (sum: number, env: EnvelopeAnalysis) => sum + env.fundingGap,
            0
          ),
          averageUtilization:
            envelopeAnalysis.length > 0
              ? envelopeAnalysis.reduce(
                  (sum: number, env: EnvelopeAnalysis) => sum + env.utilizationRate,
                  0
                ) / envelopeAnalysis.length
              : 0,
          completedSavingsGoals: savingsAnalysis.filter((goal) => goal.isCompleted).length,
          totalSavingsTarget: savingsAnalysis.reduce(
            (sum: number, goal: unknown) => {
              const g = goal as SavingsGoal;
              return sum + (g.targetAmount || 0);
            },
            0
          ),
        },
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  });
};
