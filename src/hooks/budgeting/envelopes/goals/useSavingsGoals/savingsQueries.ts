// Savings Goals Query Functions - Data fetching and filtering logic
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { queryKeys } from "@/utils/common/queryClient";
import { budgetDb } from "@/db/budgetDb";
import logger from "@/utils/common/logger";
import {
  processSavingsGoal,
  sortSavingsGoals,
  filterSavingsGoals,
  type ProcessedSavingsGoal,
} from "@/utils/savings/savingsCalculations";
import { type GoalEnvelope } from "@/db/types";

export interface SavingsGoalsQueryOptions {
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  includeCompleted?: boolean;
}

/**
 * Core savings goals data fetching query function
 */
export const useSavingsGoalsQueryFunction = (
  options: SavingsGoalsQueryOptions = {}
): (() => Promise<ProcessedSavingsGoal[]>) => {
  const {
    status = "all",
    sortBy = "targetDate",
    sortOrder = "asc",
    includeCompleted = true,
  } = options;

  return useCallback(async () => {
    logger.debug("TanStack Query: Fetching savings goals from Dexie");

    try {
      const goals: GoalEnvelope[] = (await budgetDb.envelopes
        .where("type")
        .equals("goal")
        .toArray()) as GoalEnvelope[];

      // Always fetch from Dexie (single source of truth for local data)

      logger.debug("TanStack Query: Loaded savings goals from Dexie", {
        count: goals.length,
      });

      // Process goals with calculations
      const processedGoals = goals.map((goal) => processSavingsGoal(goal));

      // Apply filtering
      const filteredGoals = filterSavingsGoals(processedGoals, {
        status,
        includeCompleted,
      });

      // Apply sorting
      const sortedGoals = sortSavingsGoals(filteredGoals, sortBy, sortOrder);

      logger.debug("TanStack Query returning processed savings goals", {
        originalCount: goals.length,
        processedCount: processedGoals.length,
        filteredCount: filteredGoals.length,
        finalCount: sortedGoals.length,
        status,
      });

      return sortedGoals;
    } catch (error) {
      logger.error("TanStack Query: Savings goals fetch failed", error);
      return [];
    }
  }, [status, sortBy, sortOrder, includeCompleted]);
};

/**
 * Main savings goals query hook
 */
export const useSavingsGoalsQuery = (options: SavingsGoalsQueryOptions = {}) => {
  const {
    status = "all",
    sortBy = "targetDate",
    sortOrder = "asc",
    includeCompleted = true,
  } = options;

  const queryFunction = useSavingsGoalsQueryFunction(options);

  return useQuery<ProcessedSavingsGoal[]>({
    queryKey: [...queryKeys.savingsGoalsList(), status, sortBy, sortOrder, includeCompleted],
    queryFn: queryFunction,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
    enabled: true,
  });
};

/**
 * Active savings goals query (non-completed goals for dashboard)
 */
export const useActiveSavingsGoalsQuery = (savingsData: ProcessedSavingsGoal[] = []) => {
  return useQuery<ProcessedSavingsGoal[]>({
    queryKey: queryKeys.activeSavingsGoals(),
    queryFn: async () => {
      return filterSavingsGoals(savingsData, {
        status: "active",
        includeCompleted: false,
      });
    },
    enabled: !!savingsData,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Query event listeners for cache invalidation
 */
export const useSavingsGoalsQueryEvents = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleImportCompleted = () => {
      logger.debug("Import detected, invalidating savings goals cache");
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals });
    };

    const handleInvalidateAll = () => {
      logger.debug("Invalidating all savings goals queries");
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals });
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoalsList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    };

    window.addEventListener("importCompleted", handleImportCompleted);
    window.addEventListener("invalidateAllQueries", handleInvalidateAll);

    return () => {
      window.removeEventListener("importCompleted", handleImportCompleted);
      window.removeEventListener("invalidateAllQueries", handleInvalidateAll);
    };
  }, [queryClient]);
};
