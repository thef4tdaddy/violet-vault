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
import { calculateSavingsSummary } from "@/utils/savings/savingsCalculations";
import { createSavingsGoalHelpers, getEmptySummary } from "./useSavingsGoalsHelpers";

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
  }) as {
    data: SavingsGoal[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
    isFetching: boolean;
    isStale: boolean;
  };

  // Mutation hooks
  const addSavingsGoalMutation = useAddSavingsGoalMutation();
  const updateSavingsGoalMutation = useUpdateSavingsGoalMutation();
  const deleteSavingsGoalMutation = useDeleteSavingsGoalMutation();
  const addContributionMutation = useAddContributionMutation();
  const distributeFundsMutation = useDistributeFundsMutation();

  // Calculate summary statistics
  const summary = useMemo(() => {
    if (!savingsGoals.length) return getEmptySummary();
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
    () =>
      createSavingsGoalHelpers(savingsGoals, {
        addSavingsGoalMutation,
        updateSavingsGoalMutation,
        deleteSavingsGoalMutation,
        addContributionMutation,
        distributeFundsMutation,
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
