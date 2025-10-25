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
  });

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
        return new Promise((resolve, reject) => {
          addSavingsGoalMutation.mutate(goalData, {
            onSuccess: (data) => resolve(data),
            onError: (error) => reject(error),
          });
        });
      },

      // Update existing goal
      updateGoal: async (goalId: string, updates: unknown) => {
        logger.debug("Updating savings goal:", { goalId, updates });
        return new Promise((resolve, reject) => {
          updateSavingsGoalMutation.mutate(
            { goalId, updates },
            {
              onSuccess: (data) => resolve(data),
              onError: (error) => reject(error),
            }
          );
        });
      },

      // Delete a goal
      deleteGoal: async (goalId: string) => {
        logger.debug("Deleting savings goal:", goalId);
        return new Promise((resolve, reject) => {
          deleteSavingsGoalMutation.mutate(goalId, {
            onSuccess: (data) => resolve(data),
            onError: (error) => reject(error),
          });
        });
      },

      // Add contribution to goal
      addContribution: async (goalId: string, amount: number, description: string) => {
        logger.debug("Adding contribution:", { goalId, amount, description });
        return new Promise((resolve, reject) => {
          addContributionMutation.mutate(
            {
              goalId,
              amount,
              description,
            },
            {
              onSuccess: (data) => resolve(data),
              onError: (error) => reject(error),
            }
          );
        });
      },

      // Distribute funds across multiple goals
      distributeFunds: async (distribution: unknown, description: string) => {
        logger.debug("Distributing funds:", { distribution, description });
        return new Promise((resolve, reject) => {
          distributeFundsMutation.mutate(
            {
              distribution,
              description,
            },
            {
              onSuccess: (data) => resolve(data),
              onError: (error) => reject(error),
            }
          );
        });
      },

      // Find goal by ID
      getGoalById: (goalId: string) => {
        return savingsGoals.find((goal) => goal.id === goalId) || null;
      },

      // Get active goals only
      getActiveGoals: () => {
        return savingsGoals.filter((goal: { isCompleted: boolean }) => !goal.isCompleted);
      },

      // Get completed goals only
      getCompletedGoals: () => {
        return savingsGoals.filter((goal: { isCompleted: boolean }) => goal.isCompleted);
      },

      // Get goals by urgency
      getUrgentGoals: () => {
        return savingsGoals.filter((goal: { urgency: string }) => goal.urgency === "urgent");
      },

      // Get overdue goals
      getOverdueGoals: () => {
        return savingsGoals.filter((goal: { urgency: string }) => goal.urgency === "overdue");
      },

      // Get goals by category
      getGoalsByCategory: (category: string) => {
        return savingsGoals.filter((goal: { category: string }) => goal.category === category);
      },

      // Get goals by priority
      getGoalsByPriority: (priority: string) => {
        return savingsGoals.filter((goal: { priority: string }) => goal.priority === priority);
      },

      // Check if any goals need attention
      hasGoalsNeedingAttention: () => {
        return savingsGoals.some(
          (goal: { urgency: string }) =>
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
