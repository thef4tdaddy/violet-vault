// Main useSavingsGoals Hook - Orchestrates all savings goal functionality
import { useMemo } from "react";
import { useSavingsGoalsQuery, useSavingsGoalsQueryEvents } from "./savingsQueries";
import {
  useAddSavingsGoalMutation,
  useUpdateSavingsGoalMutation,
  useDeleteSavingsGoalMutation,
  useAddContributionMutation,
  useDistributeFundsMutation,
} from "./savingsMutations";
import { calculateSavingsSummary } from "../../../utils/savings/savingsCalculations";
import logger from "../../../utils/common/logger";

interface UseSavingsGoalsOptions {
  status?: string;
  sortBy?: string;
  sortOrder?: string;
  includeCompleted?: boolean;
}

interface SavingsGoal {
  id: string;
  isCompleted: boolean;
  urgency: string;
  category: string;
  priority: string;
  [key: string]: unknown;
}

/**
 * Main savings goals hook - combines queries, mutations, and calculations
 */
const useSavingsGoals = (options: UseSavingsGoalsOptions = {}) => {
  const {
    status = "all",
    sortBy = "targetDate",
    sortOrder = "asc",
    includeCompleted = true,
  } = options;

  // Initialize query event listeners (always call the hook)
  useSavingsGoalsQueryEvents();

  // Core data query
  const {
    data: savingsGoals = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    isStale,
  } = useSavingsGoalsQuery({
    status,
    sortBy,
    sortOrder,
    includeCompleted,
  }) as { data: SavingsGoal[]; isLoading: boolean; isError: boolean; error: Error | null; refetch: () => void; isFetching: boolean; isStale: boolean };

  // Mutation hooks
  const addSavingsGoalMutation = useAddSavingsGoalMutation();
  const updateSavingsGoalMutation = useUpdateSavingsGoalMutation();
  const deleteSavingsGoalMutation = useDeleteSavingsGoalMutation();
  const addContributionMutation = useAddContributionMutation();
  const distributeFundsMutation = useDistributeFundsMutation();

  // Calculate summary statistics
  const summary = useMemo(() => {
    if (!savingsGoals.length) {
      return {
        totalGoals: 0,
        completedGoals: 0,
        activeGoals: 0,
        totalTargetAmount: 0,
        totalCurrentAmount: 0,
        totalRemainingAmount: 0,
        overallProgressRate: 0,
        urgentGoals: 0,
        overdueGoals: 0,
        totalMonthlyNeeded: 0,
      };
    }

    return calculateSavingsSummary(savingsGoals);
  }, [savingsGoals]);

  // Loading states
  const isAnyMutationLoading = useMemo(() => {
    return (
      addSavingsGoalMutation.isPending ||
      updateSavingsGoalMutation.isPending ||
      deleteSavingsGoalMutation.isPending ||
      addContributionMutation.isPending ||
      distributeFundsMutation.isPending
    );
  }, [
    addSavingsGoalMutation.isPending,
    updateSavingsGoalMutation.isPending,
    deleteSavingsGoalMutation.isPending,
    addContributionMutation.isPending,
    distributeFundsMutation.isPending,
  ]);

  // Helper functions for common operations
  const helpers = useMemo(
    () => ({
      // Add a new savings goal
      addGoal: async (goalData: unknown) => {
        logger.debug("Adding savings goal:", goalData);
        return addSavingsGoalMutation.mutateAsync(goalData as never);
      },

      // Update existing goal
      updateGoal: async (goalId: string, updates: unknown) => {
        logger.debug("Updating savings goal:", { goalId, updates });
        return updateSavingsGoalMutation.mutateAsync({ goalId, updates } as never);
      },

      // Delete a goal
      deleteGoal: async (goalId: string) => {
        logger.debug("Deleting savings goal:", goalId);
        return deleteSavingsGoalMutation.mutateAsync(goalId as never);
      },

      // Add contribution to goal
      addContribution: async (goalId: string, amount: number, description: string) => {
        logger.debug("Adding contribution:", { goalId, amount, description });
        return addContributionMutation.mutateAsync({
          goalId,
          amount,
          description,
        } as never);
      },

      // Distribute funds across multiple goals
      distributeFunds: async (distribution: unknown, description: string) => {
        logger.debug("Distributing funds:", { distribution, description });
        return distributeFundsMutation.mutateAsync({
          distribution,
          description,
        } as never);
      },

      // Find goal by ID
      getGoalById: (goalId: string) => {
        return savingsGoals.find((goal) => goal.id === goalId) || null;
      },

      // Get active goals only
      getActiveGoals: () => {
        return savingsGoals.filter((goal) => !goal.isCompleted);
      },

      // Get completed goals only
      getCompletedGoals: () => {
        return savingsGoals.filter((goal) => goal.isCompleted);
      },

      // Get goals by urgency
      getUrgentGoals: () => {
        return savingsGoals.filter((goal) => goal.urgency === "urgent");
      },

      // Get overdue goals
      getOverdueGoals: () => {
        return savingsGoals.filter((goal) => goal.urgency === "overdue");
      },

      // Get goals by category
      getGoalsByCategory: (category: string) => {
        return savingsGoals.filter((goal) => goal.category === category);
      },

      // Get goals by priority
      getGoalsByPriority: (priority: string) => {
        return savingsGoals.filter((goal) => goal.priority === priority);
      },

      // Check if any goals need attention
      hasGoalsNeedingAttention: () => {
        return savingsGoals.some(
          (goal) =>
            goal.urgency === "urgent" || goal.urgency === "overdue" || goal.urgency === "behind"
        );
      },
    }),
    [
      savingsGoals,
      addSavingsGoalMutation,
      updateSavingsGoalMutation,
      deleteSavingsGoalMutation,
      addContributionMutation,
      distributeFundsMutation,
    ]
  );

  return {
    // Data
    savingsGoals,
    summary,

    // Loading states
    isLoading,
    isError,
    error,
    isFetching,
    isStale,
    isAnyMutationLoading,

    // Actions
    refetch,
    helpers,

    // Individual mutation states (for granular loading states)
    mutations: {
      add: addSavingsGoalMutation,
      update: updateSavingsGoalMutation,
      delete: deleteSavingsGoalMutation,
      contribute: addContributionMutation,
      distribute: distributeFundsMutation,
    },
  };
};

export default useSavingsGoals;
