/**
 * Helper functions for useSavingsGoals hook
 * Extracted to reduce function length
 */
import logger from "@/utils/common/logger";
import type { ProcessedSavingsGoal } from "@/utils/savings/savingsCalculations";

interface MutationHandler {
  mutateAsync: <T = unknown>(variables: T) => Promise<unknown>;
  isPending?: boolean;
  isError?: boolean;
  error?: Error | null;
  [key: string]: unknown;
}

interface MutationHelpers {
  addSavingsGoalMutation: MutationHandler;
  updateSavingsGoalMutation: MutationHandler;
  deleteSavingsGoalMutation: MutationHandler;
  addContributionMutation: MutationHandler;
  distributeFundsMutation: MutationHandler;
}

/**
 * Create helper functions for savings goals operations
 */
export const createSavingsGoalHelpers = (
  savingsGoals: ProcessedSavingsGoal[],
  mutations: MutationHelpers
) => ({
  // Add a new savings goal
  addGoal: async (goalData: unknown) => {
    logger.debug("Adding savings goal", goalData as Record<string, unknown>);
    return mutations.addSavingsGoalMutation.mutateAsync(goalData as never);
  },

  // Update existing goal
  updateGoal: async (goalId: string, updates: unknown) => {
    logger.debug("Updating savings goal", { goalId, updates } as Record<string, unknown>);
    return mutations.updateSavingsGoalMutation.mutateAsync({ goalId, updates } as never);
  },

  // Delete a goal
  deleteGoal: async (goalId: string) => {
    logger.debug("Deleting savings goal", { goalId } as Record<string, unknown>);
    return mutations.deleteSavingsGoalMutation.mutateAsync(goalId as never);
  },

  // Add contribution to goal
  addContribution: async (goalId: string, amount: number, description: string) => {
    logger.debug("Adding contribution:", { goalId, amount, description });
    return mutations.addContributionMutation.mutateAsync({
      goalId,
      amount,
      description,
    } as never);
  },

  // Distribute funds across multiple goals
  distributeFunds: async (distribution: Record<string, number>, description: string = "") => {
    logger.debug("Distributing funds:", { distribution, description });
    return mutations.distributeFundsMutation.mutateAsync({
      distribution,
      description,
    });
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
      (goal) => !goal.isCompleted && (goal.urgency === "urgent" || goal.urgency === "overdue")
    );
  },
});

/**
 * Calculate empty summary statistics
 */
export const getEmptySummary = () => ({
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
});
