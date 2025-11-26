// Savings Goals Mutation Functions - CRUD operations and data modifications
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, optimisticHelpers } from "../../../utils/common/queryClient";
import { budgetDb } from "../../../db/budgetDb";
import logger from "../../../utils/common/logger";
import type { SavingsGoal } from "../../../db/types";

// Helper to trigger sync for savings goal changes
const triggerSavingsGoalSync = (changeType: string) => {
  if (typeof window !== "undefined" && window.cloudSyncService) {
    window.cloudSyncService.triggerSyncForCriticalChange(`savings_goal_${changeType}`);
  }
};

// Type for new goal data (without id, createdAt, lastModified which are auto-generated)
type NewSavingsGoalData = Omit<SavingsGoal, "id" | "createdAt" | "lastModified">;

/**
 * Add savings goal mutation hook
 */
export const useAddSavingsGoalMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["savingsGoals", "add"],
    mutationFn: async (goalData: NewSavingsGoalData) => {
      const newGoal = {
        id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...goalData,
        createdAt: Date.now(),
        lastModified: Date.now(),
      } as SavingsGoal;

      // Apply optimistic update first
      await optimisticHelpers.addSavingsGoal(newGoal);

      // Then persist to Dexie (redundant as optimisticHelpers already does this)
      // await budgetDb.savingsGoals.add(newGoal);

      return newGoal;
    },
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.savingsGoals });

      // Snapshot previous value for rollback
      const previousGoals = queryClient.getQueryData(queryKeys.savingsGoals);
      return { previousGoals };
    },
    onSuccess: (goal) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals });
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoalsList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });

      // Log successful savings goal addition
      logger.info("✅ Savings goal added", {
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
      });

      // Trigger cloud sync
      triggerSavingsGoalSync("add");
    },
    onError: (error, _goalData, context) => {
      logger.error("Failed to add savings goal:", error);
      // Rollback optimistic update if needed
      if (context?.previousGoals) {
        queryClient.setQueryData(queryKeys.savingsGoals, context.previousGoals);
      }
    },
  });
};

/**
 * Update savings goal mutation hook
 */
export const useUpdateSavingsGoalMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["savingsGoals", "update"],
    mutationFn: async ({ goalId, updates }: { goalId: string; updates: Partial<SavingsGoal> }) => {
      const existingGoal = await budgetDb.savingsGoals.get(goalId);
      if (!existingGoal) {
        throw new Error(`Savings goal with ID ${goalId} not found`);
      }

      const updatedGoal: SavingsGoal = {
        ...existingGoal,
        ...updates,
        id: goalId, // Ensure ID stays the same
        lastModified: Date.now(),
      };

      // Apply optimistic update
      await optimisticHelpers.updateSavingsGoal(goalId, {
        ...updates,
        lastModified: Date.now(),
      });

      // Update in Dexie (redundant as optimisticHelpers already does this)
      // await budgetDb.savingsGoals.update(goalId, updatedGoal);

      return updatedGoal;
    },
    onSuccess: (goal, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals });
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoalsList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });

      // Log successful savings goal update
      logger.info("✅ Savings goal updated", {
        name: goal.name,
        goalId: variables.goalId,
        updates: Object.keys(variables.updates),
      });

      triggerSavingsGoalSync("update");
    },
    onError: (error) => {
      logger.error("Failed to update savings goal:", error);
    },
  });
};

/**
 * Delete savings goal mutation hook
 */
export const useDeleteSavingsGoalMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["savingsGoals", "delete"],
    mutationFn: async (goalId: string) => {
      // Apply optimistic update
      await optimisticHelpers.deleteSavingsGoal(goalId);

      // Delete from Dexie (redundant as optimisticHelpers already does this)
      // await budgetDb.savingsGoals.delete(goalId);

      return goalId;
    },
    onSuccess: (goalId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals });
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoalsList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });

      // Log successful savings goal deletion
      logger.info("✅ Savings goal deleted", {
        goalId: goalId,
      });

      triggerSavingsGoalSync("delete");
    },
    onError: (error) => {
      logger.error("Failed to delete savings goal:", error);
    },
  });
};

/**
 * Add contribution to savings goal mutation hook
 */
export const useAddContributionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["savingsGoals", "contribute"],
    mutationFn: async ({
      goalId,
      amount,
      description,
    }: {
      goalId: string;
      amount: string | number;
      description?: string;
    }) => {
      const goal = await budgetDb.savingsGoals.get(goalId);
      if (!goal) {
        throw new Error(`Savings goal with ID ${goalId} not found`);
      }

      const contributionAmount = typeof amount === "string" ? parseFloat(amount) : amount;
      if (isNaN(contributionAmount) || contributionAmount <= 0) {
        throw new Error("Invalid contribution amount");
      }

      const updatedCurrentAmount = (goal.currentAmount || 0) + contributionAmount;

      const updatedGoal: SavingsGoal = {
        ...goal,
        currentAmount: updatedCurrentAmount,
        lastModified: Date.now(),
      };

      // Apply optimistic update
      await optimisticHelpers.updateSavingsGoal(goalId, updatedGoal);

      // Update in Dexie
      await budgetDb.savingsGoals.update(goalId, updatedGoal);

      // Create transaction record for the contribution
      const contributionTransaction = {
        id: `${goalId}_contribution_${Date.now()}`,
        date: new Date().toISOString().split("T")[0] as unknown as Date,
        description: `Contribution to ${goal.name}${description ? `: ${description}` : ""}`,
        amount: -Math.abs(contributionAmount), // Negative for expense
        envelopeId: "unassigned", // Could be linked to specific envelope later
        category: "Savings",
        type: "expense" as const,
        lastModified: Date.now(),
        createdAt: Date.now(),
      };

      // Add transaction to Dexie
      await budgetDb.transactions.put(contributionTransaction);
      await optimisticHelpers.addTransaction(queryClient, contributionTransaction);

      logger.debug("💰 Added contribution to savings goal", {
        goalId,
        goalName: goal.name,
        contributionAmount,
        newCurrentAmount: updatedCurrentAmount,
      });

      return { updatedGoal, contributionTransaction };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals });
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoalsList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });

      triggerSavingsGoalSync("contribute");
    },
    onError: (error) => {
      logger.error("Failed to add contribution to savings goal:", error);
    },
  });
};

/**
 * Distribute funds to multiple savings goals mutation hook
 */
export const useDistributeFundsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["savingsGoals", "distribute"],
    mutationFn: async ({
      distribution,
      description = "Fund distribution",
    }: {
      distribution: Record<string, string | number>;
      description?: string;
    }) => {
      const results = [];
      const totalAmount = Object.values(distribution).reduce<number>((sum, amount) => {
        const numAmount = Number(amount);
        return sum + (isNaN(numAmount) ? 0 : numAmount);
      }, 0);

      if (totalAmount <= 0) {
        throw new Error("No funds to distribute");
      }

      // Process each goal in the distribution
      for (const [goalId, amount] of Object.entries(distribution)) {
        const contributionAmount = typeof amount === "string" ? parseFloat(amount) : amount;
        if (contributionAmount <= 0) continue;

        const goal = await budgetDb.savingsGoals.get(goalId);
        if (!goal) {
          logger.warn(`Savings goal ${goalId} not found during distribution`);
          continue;
        }

        const updatedCurrentAmount = (goal.currentAmount || 0) + contributionAmount;

        const updatedGoal: SavingsGoal = {
          ...goal,
          currentAmount: updatedCurrentAmount,
          lastModified: Date.now(),
        };

        // Apply optimistic update
        await optimisticHelpers.updateSavingsGoal(goalId, updatedGoal);

        // Update in Dexie
        await budgetDb.savingsGoals.update(goalId, updatedGoal);

        // Create transaction record
        const contributionTransaction = {
          id: `${goalId}_distribution_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          date: new Date().toISOString().split("T")[0] as unknown as Date,
          description: `Distribution to ${goal.name}${description !== "Fund distribution" ? `: ${description}` : ""}`,
          amount: -Math.abs(contributionAmount),
          envelopeId: "unassigned",
          category: "Savings",
          type: "expense" as const,
          lastModified: Date.now(),
          createdAt: Date.now(),
        };

        await budgetDb.transactions.put(contributionTransaction);
        await optimisticHelpers.addTransaction(queryClient, contributionTransaction);

        results.push({
          goalId,
          goalName: goal.name,
          amount: contributionAmount,
          updatedGoal,
          transaction: contributionTransaction,
        });
      }

      logger.debug("💰 Distributed funds to savings goals", {
        totalAmount,
        goalsUpdated: results.length,
        distribution,
      });

      return {
        totalAmount,
        results,
        summary: `Distributed $${totalAmount.toFixed(2)} across ${results.length} savings goals`,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals });
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoalsList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });

      triggerSavingsGoalSync("distribute");
    },
    onError: (error) => {
      logger.error("Failed to distribute funds to savings goals:", error);
    },
  });
};
