import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { queryKeys, optimisticHelpers } from "../utils/queryClient";
import { budgetDb } from "../db/budgetDb";
import logger from "../utils/logger";

/**
 * Specialized hook for savings goals management
 * Provides savings goal operations with progress tracking, deadline monitoring, and funding strategies
 */
const useSavingsGoals = (options = {}) => {
  const queryClient = useQueryClient();
  const {
    status = "all", // 'all', 'active', 'completed', 'paused', 'overdue'
    sortBy = "targetDate",
    sortOrder = "asc",
    includeCompleted = true,
  } = options;

  // Removed Zustand dependencies - data now handled by TanStack Query → Dexie

  // TanStack Query function - hydrates from Dexie, Dexie syncs with Firebase
  const queryFunction = useCallback(async () => {
    logger.debug("TanStack Query: Fetching savings goals from Dexie");

    try {
      let goals = [];

      // Always fetch from Dexie (single source of truth for local data)
      goals = await budgetDb.savingsGoals.toArray();

      logger.debug("TanStack Query: Loaded from Dexie", { count: goals.length });
    } catch (error) {
      logger.error("TanStack Query: Dexie fetch failed", error);
      // Return empty array when Dexie fails (no fallback to Zustand)
      return [];
    }

    // Enrich goals with calculated fields
    const today = new Date();
    const enrichedGoals = goals.map((goal) => {
      const currentAmount = goal.currentAmount || 0;
      const targetAmount = goal.targetAmount || 0;
      const targetDate = goal.targetDate ? new Date(goal.targetDate) : null;

      // Progress calculations
      const progressRate = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
      const remainingAmount = Math.max(0, targetAmount - currentAmount);
      const isCompleted = currentAmount >= targetAmount;

      // Timeline calculations
      let daysRemaining = null;
      let isOverdue = false;
      let timelineStatus = "on-track";

      if (targetDate) {
        daysRemaining = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
        isOverdue = daysRemaining < 0 && !isCompleted;

        if (isOverdue) {
          timelineStatus = "overdue";
        } else if (daysRemaining <= 30 && !isCompleted) {
          timelineStatus = "urgent";
        } else if (progressRate < 50 && daysRemaining <= 90) {
          timelineStatus = "behind";
        }
      }

      // Suggested monthly contribution
      let suggestedMonthlyContribution = 0;
      if (targetDate && daysRemaining > 0 && remainingAmount > 0) {
        const monthsRemaining = Math.max(1, daysRemaining / 30);
        suggestedMonthlyContribution = remainingAmount / monthsRemaining;
      }

      return {
        ...goal,
        // Calculated fields
        progressRate: Math.round(progressRate * 100) / 100,
        remainingAmount,
        isCompleted,
        daysRemaining,
        isOverdue,
        timelineStatus,
        suggestedMonthlyContribution: Math.round(suggestedMonthlyContribution * 100) / 100,

        // Goal category/priority
        priority: goal.priority || "medium",
        category: goal.category || "general",
      };
    });

    // Apply status filters
    let filteredGoals = enrichedGoals;

    switch (status) {
      case "active":
        filteredGoals = filteredGoals.filter((goal) => !goal.isCompleted && !goal.isPaused);
        break;
      case "completed":
        filteredGoals = filteredGoals.filter((goal) => goal.isCompleted);
        break;
      case "paused":
        filteredGoals = filteredGoals.filter((goal) => goal.isPaused);
        break;
      case "overdue":
        filteredGoals = filteredGoals.filter((goal) => goal.isOverdue);
        break;
      case "urgent":
        filteredGoals = filteredGoals.filter((goal) => goal.timelineStatus === "urgent");
        break;
      default:
        if (!includeCompleted) {
          filteredGoals = filteredGoals.filter((goal) => !goal.isCompleted);
        }
    }

    // Apply sorting
    filteredGoals.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      // Handle date fields
      if (sortBy === "targetDate" || sortBy === "createdAt") {
        aVal = aVal ? new Date(aVal) : new Date(0);
        bVal = bVal ? new Date(bVal) : new Date(0);
      }

      // Handle numeric fields
      if (sortBy === "targetAmount" || sortBy === "currentAmount" || sortBy === "progressRate") {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }

      // Handle priority
      if (sortBy === "priority") {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        aVal = priorityOrder[aVal] || 0;
        bVal = priorityOrder[bVal] || 0;
      }

      // Handle string fields
      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortOrder === "desc") {
        return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
      } else {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      }
    });

    return filteredGoals;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, sortBy, sortOrder, includeCompleted]);

  // Main savings goals query
  const savingsGoalsQuery = useQuery({
    queryKey: queryKeys.savingsGoalsList({
      status,
      sortBy,
      sortOrder,
      includeCompleted,
    }),
    queryFn: queryFunction,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false, // Don't refetch if data is fresh
    refetchOnWindowFocus: false, // Don't refetch on window focus
    placeholderData: (previousData) => previousData, // Use previous data during refetch
    initialData: undefined, // Remove initialData to prevent persister errors
    enabled: true,
  });

  // Listen for import completion to force refresh
  useEffect(() => {
    const handleImportCompleted = () => {
      logger.debug("Import detected, invalidating savings goals cache");
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals });
    };

    const handleInvalidateAll = () => {
      logger.debug("Invalidating all savings goal queries");
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals });
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoalsList });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    };

    window.addEventListener("importCompleted", handleImportCompleted);
    window.addEventListener("invalidateAllQueries", handleInvalidateAll);

    return () => {
      window.removeEventListener("importCompleted", handleImportCompleted);
      window.removeEventListener("invalidateAllQueries", handleInvalidateAll);
    };
  }, [queryClient]);

  // Add savings goal mutation
  const addSavingsGoalMutation = useMutation({
    mutationKey: ["savingsGoals", "add"],
    mutationFn: async (goalData) => {
      const newGoal = {
        id: Date.now().toString(),
        currentAmount: 0,
        priority: "medium",
        category: "general",
        isPaused: false,
        createdAt: new Date().toISOString(),
        ...goalData,
      };

      // Apply optimistic update
      await optimisticHelpers.addSavingsGoal(newGoal);

      // Apply to Dexie directly
      await budgetDb.savingsGoals.add(newGoal);

      return newGoal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error) => {
      logger.error("Failed to add savings goal:", error);
      // TODO: Implement rollback logic
    },
  });

  // Update savings goal mutation
  const updateSavingsGoalMutation = useMutation({
    mutationKey: ["savingsGoals", "update"],
    mutationFn: async ({ id, updates }) => {
      // Apply optimistic update
      await optimisticHelpers.updateSavingsGoal(id, updates);

      // Apply to Dexie directly
      await budgetDb.savingsGoals.update(id, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      return { id, updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error) => {
      logger.error("Failed to update savings goal:", error);
      // TODO: Implement rollback logic
    },
  });

  // Delete savings goal mutation
  const deleteSavingsGoalMutation = useMutation({
    mutationKey: ["savingsGoals", "delete"],
    mutationFn: async (goalId) => {
      // Apply optimistic update
      await optimisticHelpers.removeSavingsGoal(goalId);

      // Apply to Dexie directly
      await budgetDb.savingsGoals.delete(goalId);

      return goalId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error) => {
      logger.error("Failed to delete savings goal:", error);
      // TODO: Implement rollback logic
    },
  });

  // Contribute to savings goal mutation
  const contributeToGoalMutation = useMutation({
    mutationKey: ["savingsGoals", "contribute"],
    mutationFn: async ({ goalId, amount, source = "manual" }) => {
      // Get current goal from Dexie
      const goal = await budgetDb.savingsGoals.get(goalId);
      if (!goal) {
        throw new Error("Savings goal not found");
      }

      const newAmount = (goal.currentAmount || 0) + amount;

      // Update goal in Dexie directly
      await budgetDb.savingsGoals.update(goalId, {
        currentAmount: newAmount,
        updatedAt: new Date().toISOString(),
      });

      // Apply optimistic update
      await optimisticHelpers.updateSavingsGoal(goalId, {
        currentAmount: newAmount,
      });

      return { goalId, amount, source, newAmount };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error) => {
      logger.error("Failed to contribute to savings goal:", error);
      // TODO: Implement rollback logic
    },
  });

  // Computed values and analytics
  const goals = savingsGoalsQuery.data || [];

  const analytics = {
    totalGoals: goals.length,
    activeGoals: goals.filter((goal) => !goal.isCompleted && !goal.isPaused).length,
    completedGoals: goals.filter((goal) => goal.isCompleted).length,
    pausedGoals: goals.filter((goal) => goal.isPaused).length,
    overdueGoals: goals.filter((goal) => goal.isOverdue).length,
    urgentGoals: goals.filter((goal) => goal.timelineStatus === "urgent").length,

    // Amount calculations
    totalTargetAmount: goals.reduce((sum, goal) => sum + (goal.targetAmount || 0), 0),
    totalCurrentAmount: goals.reduce((sum, goal) => sum + (goal.currentAmount || 0), 0),
    totalRemainingAmount: goals.reduce((sum, goal) => sum + (goal.remainingAmount || 0), 0),

    // Progress calculations
    overallProgressRate:
      goals.length > 0 ? goals.reduce((sum, goal) => sum + goal.progressRate, 0) / goals.length : 0,

    completionRate:
      goals.length > 0 ? (goals.filter((goal) => goal.isCompleted).length / goals.length) * 100 : 0,

    // Priority breakdown
    priorityBreakdown: goals.reduce((acc, goal) => {
      const priority = goal.priority || "medium";
      if (!acc[priority]) {
        acc[priority] = { count: 0, amount: 0, remaining: 0 };
      }
      acc[priority].count += 1;
      acc[priority].amount += goal.currentAmount || 0;
      acc[priority].remaining += goal.remainingAmount || 0;
      return acc;
    }, {}),

    // Category breakdown
    categoryBreakdown: goals.reduce((acc, goal) => {
      const category = goal.category || "general";
      if (!acc[category]) {
        acc[category] = { count: 0, amount: 0, remaining: 0, completed: 0 };
      }
      acc[category].count += 1;
      acc[category].amount += goal.currentAmount || 0;
      acc[category].remaining += goal.remainingAmount || 0;
      if (goal.isCompleted) acc[category].completed += 1;
      return acc;
    }, {}),

    // Timeline insights
    upcomingDeadlines: goals
      .filter(
        (goal) =>
          goal.targetDate && goal.daysRemaining && goal.daysRemaining <= 30 && !goal.isCompleted
      )
      .sort((a, b) => (a.daysRemaining || 0) - (b.daysRemaining || 0)),

    monthlyContributionNeeded: goals
      .filter((goal) => !goal.isCompleted && !goal.isPaused)
      .reduce((sum, goal) => sum + (goal.suggestedMonthlyContribution || 0), 0),
  };

  // Utility functions
  const getGoalById = (id) => goals.find((goal) => goal.id === id);

  const getGoalsByCategory = (category) => goals.filter((goal) => goal.category === category);

  const getGoalsByPriority = (priority) => goals.filter((goal) => goal.priority === priority);

  const getGoalsByStatus = (goalStatus) => {
    switch (goalStatus) {
      case "completed":
        return goals.filter((goal) => goal.isCompleted);
      case "active":
        return goals.filter((goal) => !goal.isCompleted && !goal.isPaused);
      case "paused":
        return goals.filter((goal) => goal.isPaused);
      case "overdue":
        return goals.filter((goal) => goal.isOverdue);
      case "urgent":
        return goals.filter((goal) => goal.timelineStatus === "urgent");
      default:
        return goals;
    }
  };

  const getAvailableCategories = () => {
    const categories = new Set(goals.map((goal) => goal.category));
    return Array.from(categories).filter(Boolean).sort();
  };

  // Strategic planning helpers
  const getOptimalContributionPlan = () => {
    const activeGoals = goals.filter((goal) => !goal.isCompleted && !goal.isPaused);

    // Sort by deadline urgency and priority
    const prioritizedGoals = activeGoals.sort((a, b) => {
      // Overdue goals first
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;

      // Then by days remaining (urgent first)
      if (a.daysRemaining && b.daysRemaining) {
        if (a.daysRemaining !== b.daysRemaining) {
          return a.daysRemaining - b.daysRemaining;
        }
      }

      // Then by priority (high first)
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority] || 0;
      const bPriority = priorityOrder[b.priority] || 0;

      return bPriority - aPriority;
    });

    return prioritizedGoals.map((goal) => ({
      goalId: goal.id,
      name: goal.name,
      priority: goal.priority,
      daysRemaining: goal.daysRemaining,
      suggestedContribution: goal.suggestedMonthlyContribution,
      remainingAmount: goal.remainingAmount,
      isUrgent: goal.timelineStatus === "urgent" || goal.isOverdue,
    }));
  };

  const getGoalProgress = (goalId) => {
    const goal = getGoalById(goalId);
    if (!goal) return null;

    return {
      current: goal.currentAmount || 0,
      target: goal.targetAmount || 0,
      percentage: goal.progressRate || 0,
      remaining: goal.remainingAmount || 0,
      isCompleted: goal.isCompleted,
      timelineStatus: goal.timelineStatus,
      daysRemaining: goal.daysRemaining,
      suggestedMonthlyContribution: goal.suggestedMonthlyContribution,
    };
  };

  return {
    // Data
    savingsGoals: goals,
    ...analytics,
    availableCategories: getAvailableCategories(),

    // Loading states
    isLoading: savingsGoalsQuery.isLoading,
    isFetching: savingsGoalsQuery.isFetching,
    isError: savingsGoalsQuery.isError,
    error: savingsGoalsQuery.error,

    // Mutation functions
    addSavingsGoal: addSavingsGoalMutation.mutate,
    addSavingsGoalAsync: addSavingsGoalMutation.mutateAsync,
    updateSavingsGoal: updateSavingsGoalMutation.mutate,
    updateSavingsGoalAsync: updateSavingsGoalMutation.mutateAsync,
    deleteSavingsGoal: deleteSavingsGoalMutation.mutate,
    deleteSavingsGoalAsync: deleteSavingsGoalMutation.mutateAsync,
    contributeToGoal: contributeToGoalMutation.mutate,
    contributeToGoalAsync: contributeToGoalMutation.mutateAsync,

    // Mutation states
    isAdding: addSavingsGoalMutation.isPending,
    isUpdating: updateSavingsGoalMutation.isPending,
    isDeleting: deleteSavingsGoalMutation.isPending,
    isContributing: contributeToGoalMutation.isPending,

    // Utility functions
    getGoalById,
    getGoalsByCategory,
    getGoalsByPriority,
    getGoalsByStatus,
    getOptimalContributionPlan,
    getGoalProgress,

    // Query controls
    refetch: savingsGoalsQuery.refetch,
    invalidate: () => queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals }),
  };
};

export { useSavingsGoals };
export default useSavingsGoals;
