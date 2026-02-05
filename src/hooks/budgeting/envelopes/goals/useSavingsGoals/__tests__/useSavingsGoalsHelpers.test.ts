/**
 * Tests for useSavingsGoalsHelpers
 * Covers helper functions and mutations for savings goals
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createSavingsGoalHelpers, getEmptySummary } from "../useSavingsGoalsHelpers";
import type { ProcessedSavingsGoal } from "@/utils/domain/savings/savingsCalculations";

// Mock logger
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useSavingsGoalsHelpers", () => {
  describe("getEmptySummary", () => {
    it("should return empty summary with all zero values", () => {
      const result = getEmptySummary();

      expect(result).toEqual({
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
    });

    it("should return a new object on each call", () => {
      const result1 = getEmptySummary();
      const result2 = getEmptySummary();

      expect(result1).not.toBe(result2);
      expect(result1).toEqual(result2);
    });
  });

  describe("createSavingsGoalHelpers", () => {
    let mockGoals: ProcessedSavingsGoal[];
    let mockMutations: {
      addSavingsGoalMutation: { mutateAsync: ReturnType<typeof vi.fn> };
      updateSavingsGoalMutation: { mutateAsync: ReturnType<typeof vi.fn> };
      deleteSavingsGoalMutation: { mutateAsync: ReturnType<typeof vi.fn> };
      addContributionMutation: { mutateAsync: ReturnType<typeof vi.fn> };
      distributeFundsMutation: { mutateAsync: ReturnType<typeof vi.fn> };
    };

    beforeEach(() => {
      mockGoals = [
        {
          id: "goal_1",
          name: "Emergency Fund",
          targetAmount: 10000,
          currentAmount: 5000,
          isCompleted: false,
          urgency: "urgent",
          category: "savings",
          priority: "high",
          progressRate: 50,
          remainingAmount: 5000,
          daysRemaining: 30,
          monthlyNeeded: 1667,
          milestones: [],
          recommendedContribution: 1667,
        } as ProcessedSavingsGoal,
        {
          id: "goal_2",
          name: "Vacation",
          targetAmount: 5000,
          currentAmount: 5000,
          isCompleted: true,
          urgency: "none",
          category: "fun",
          priority: "low",
          progressRate: 100,
          remainingAmount: 0,
          daysRemaining: null,
          monthlyNeeded: 0,
          milestones: [],
          recommendedContribution: 0,
        } as ProcessedSavingsGoal,
        {
          id: "goal_3",
          name: "Car Repair",
          targetAmount: 3000,
          currentAmount: 1000,
          isCompleted: false,
          urgency: "overdue",
          category: "repair",
          priority: "high",
          progressRate: 33.33,
          remainingAmount: 2000,
          daysRemaining: -5,
          monthlyNeeded: 2000,
          milestones: [],
          recommendedContribution: 2000,
        } as ProcessedSavingsGoal,
        {
          id: "goal_4",
          name: "New Laptop",
          targetAmount: 2000,
          currentAmount: 500,
          isCompleted: false,
          urgency: "normal",
          category: "tech",
          priority: "medium",
          progressRate: 25,
          remainingAmount: 1500,
          daysRemaining: 60,
          monthlyNeeded: 750,
          milestones: [],
          recommendedContribution: 750,
        } as ProcessedSavingsGoal,
      ];

      mockMutations = {
        addSavingsGoalMutation: { mutateAsync: vi.fn().mockResolvedValue({ success: true }) },
        updateSavingsGoalMutation: { mutateAsync: vi.fn().mockResolvedValue({ success: true }) },
        deleteSavingsGoalMutation: { mutateAsync: vi.fn().mockResolvedValue({ success: true }) },
        addContributionMutation: { mutateAsync: vi.fn().mockResolvedValue({ success: true }) },
        distributeFundsMutation: { mutateAsync: vi.fn().mockResolvedValue({ success: true }) },
      };
    });

    describe("Mutation Helpers", () => {
      describe("addGoal", () => {
        it("should call addSavingsGoalMutation with provided data", async () => {
          const helpers = createSavingsGoalHelpers(mockGoals, mockMutations);
          const goalData = { name: "New Goal", targetAmount: 1000 };

          await helpers.addGoal(goalData);

          expect(mockMutations.addSavingsGoalMutation.mutateAsync).toHaveBeenCalledWith(goalData);
          expect(mockMutations.addSavingsGoalMutation.mutateAsync).toHaveBeenCalledTimes(1);
        });

        it("should return the result from mutation", async () => {
          const helpers = createSavingsGoalHelpers(mockGoals, mockMutations);
          const expectedResult = { success: true, id: "new_goal" };
          mockMutations.addSavingsGoalMutation.mutateAsync.mockResolvedValue(expectedResult);

          const result = await helpers.addGoal({ name: "Test" });

          expect(result).toEqual(expectedResult);
        });
      });

      describe("updateGoal", () => {
        it("should call updateSavingsGoalMutation with goalId and updates", async () => {
          const helpers = createSavingsGoalHelpers(mockGoals, mockMutations);
          const updates = { name: "Updated Goal", targetAmount: 2000 };

          await helpers.updateGoal("goal_1", updates);

          expect(mockMutations.updateSavingsGoalMutation.mutateAsync).toHaveBeenCalledWith({
            goalId: "goal_1",
            updates,
          });
          expect(mockMutations.updateSavingsGoalMutation.mutateAsync).toHaveBeenCalledTimes(1);
        });

        it("should return the result from mutation", async () => {
          const helpers = createSavingsGoalHelpers(mockGoals, mockMutations);
          const expectedResult = { success: true };
          mockMutations.updateSavingsGoalMutation.mutateAsync.mockResolvedValue(expectedResult);

          const result = await helpers.updateGoal("goal_1", { name: "Test" });

          expect(result).toEqual(expectedResult);
        });
      });

      describe("deleteGoal", () => {
        it("should call deleteSavingsGoalMutation with goalId", async () => {
          const helpers = createSavingsGoalHelpers(mockGoals, mockMutations);

          await helpers.deleteGoal("goal_1");

          expect(mockMutations.deleteSavingsGoalMutation.mutateAsync).toHaveBeenCalledWith(
            "goal_1"
          );
          expect(mockMutations.deleteSavingsGoalMutation.mutateAsync).toHaveBeenCalledTimes(1);
        });

        it("should return the result from mutation", async () => {
          const helpers = createSavingsGoalHelpers(mockGoals, mockMutations);
          const expectedResult = { success: true };
          mockMutations.deleteSavingsGoalMutation.mutateAsync.mockResolvedValue(expectedResult);

          const result = await helpers.deleteGoal("goal_1");

          expect(result).toEqual(expectedResult);
        });
      });

      describe("addContribution", () => {
        it("should call addContributionMutation with goalId, amount, and description", async () => {
          const helpers = createSavingsGoalHelpers(mockGoals, mockMutations);

          await helpers.addContribution("goal_1", 500, "Monthly contribution");

          expect(mockMutations.addContributionMutation.mutateAsync).toHaveBeenCalledWith({
            goalId: "goal_1",
            amount: 500,
            description: "Monthly contribution",
          });
          expect(mockMutations.addContributionMutation.mutateAsync).toHaveBeenCalledTimes(1);
        });

        it("should handle zero amount", async () => {
          const helpers = createSavingsGoalHelpers(mockGoals, mockMutations);

          await helpers.addContribution("goal_1", 0, "Zero contribution");

          expect(mockMutations.addContributionMutation.mutateAsync).toHaveBeenCalledWith({
            goalId: "goal_1",
            amount: 0,
            description: "Zero contribution",
          });
        });

        it("should return the result from mutation", async () => {
          const helpers = createSavingsGoalHelpers(mockGoals, mockMutations);
          const expectedResult = { success: true, newAmount: 5500 };
          mockMutations.addContributionMutation.mutateAsync.mockResolvedValue(expectedResult);

          const result = await helpers.addContribution("goal_1", 500, "Test");

          expect(result).toEqual(expectedResult);
        });
      });

      describe("distributeFunds", () => {
        it("should call distributeFundsMutation with distribution and description", async () => {
          const helpers = createSavingsGoalHelpers(mockGoals, mockMutations);
          const distribution = { goal_1: 500, goal_2: 300 };

          await helpers.distributeFunds(distribution, "Monthly distribution");

          expect(mockMutations.distributeFundsMutation.mutateAsync).toHaveBeenCalledWith({
            distribution,
            description: "Monthly distribution",
          });
          expect(mockMutations.distributeFundsMutation.mutateAsync).toHaveBeenCalledTimes(1);
        });

        it("should use empty string as default description", async () => {
          const helpers = createSavingsGoalHelpers(mockGoals, mockMutations);
          const distribution = { goal_1: 500 };

          await helpers.distributeFunds(distribution);

          expect(mockMutations.distributeFundsMutation.mutateAsync).toHaveBeenCalledWith({
            distribution,
            description: "",
          });
        });

        it("should handle empty distribution", async () => {
          const helpers = createSavingsGoalHelpers(mockGoals, mockMutations);

          await helpers.distributeFunds({}, "Empty");

          expect(mockMutations.distributeFundsMutation.mutateAsync).toHaveBeenCalledWith({
            distribution: {},
            description: "Empty",
          });
        });

        it("should return the result from mutation", async () => {
          const helpers = createSavingsGoalHelpers(mockGoals, mockMutations);
          const expectedResult = { success: true, totalDistributed: 800 };
          mockMutations.distributeFundsMutation.mutateAsync.mockResolvedValue(expectedResult);

          const result = await helpers.distributeFunds({ goal_1: 500, goal_2: 300 });

          expect(result).toEqual(expectedResult);
        });
      });
    });

    describe("Query Helpers", () => {
      describe("getGoalById", () => {
        it("should return goal when found", () => {
          const helpers = createSavingsGoalHelpers(mockGoals, mockMutations);

          const result = helpers.getGoalById("goal_1");

          expect(result).toEqual(mockGoals[0]);
        });

        it("should return null when goal not found", () => {
          const helpers = createSavingsGoalHelpers(mockGoals, mockMutations);

          const result = helpers.getGoalById("non_existent");

          expect(result).toBeNull();
        });

        it("should return first matching goal if multiple with same id exist", () => {
          const duplicateGoals = [
            ...mockGoals,
            { ...mockGoals[0], name: "Duplicate" } as ProcessedSavingsGoal,
          ];
          const helpers = createSavingsGoalHelpers(duplicateGoals, mockMutations);

          const result = helpers.getGoalById("goal_1");

          expect(result).toEqual(mockGoals[0]);
        });

        it("should handle empty goals array", () => {
          const helpers = createSavingsGoalHelpers([], mockMutations);

          const result = helpers.getGoalById("goal_1");

          expect(result).toBeNull();
        });
      });

      describe("getActiveGoals", () => {
        it("should return only non-completed goals", () => {
          const helpers = createSavingsGoalHelpers(mockGoals, mockMutations);

          const result = helpers.getActiveGoals();

          expect(result).toHaveLength(3);
          expect(result.every((goal) => !goal.isCompleted)).toBe(true);
          expect(result.map((g) => g.id)).toEqual(["goal_1", "goal_3", "goal_4"]);
        });

        it("should return empty array when all goals are completed", () => {
          const completedGoals = mockGoals.map((g) => ({ ...g, isCompleted: true }));
          const helpers = createSavingsGoalHelpers(completedGoals, mockMutations);

          const result = helpers.getActiveGoals();

          expect(result).toEqual([]);
        });

        it("should return all goals when none are completed", () => {
          const activeGoals = mockGoals.map((g) => ({ ...g, isCompleted: false }));
          const helpers = createSavingsGoalHelpers(activeGoals, mockMutations);

          const result = helpers.getActiveGoals();

          expect(result).toHaveLength(4);
        });

        it("should handle empty goals array", () => {
          const helpers = createSavingsGoalHelpers([], mockMutations);

          const result = helpers.getActiveGoals();

          expect(result).toEqual([]);
        });
      });

      describe("getCompletedGoals", () => {
        it("should return only completed goals", () => {
          const helpers = createSavingsGoalHelpers(mockGoals, mockMutations);

          const result = helpers.getCompletedGoals();

          expect(result).toHaveLength(1);
          expect(result.every((goal) => goal.isCompleted)).toBe(true);
          expect(result[0].id).toBe("goal_2");
        });

        it("should return empty array when no goals are completed", () => {
          const activeGoals = mockGoals.map((g) => ({ ...g, isCompleted: false }));
          const helpers = createSavingsGoalHelpers(activeGoals, mockMutations);

          const result = helpers.getCompletedGoals();

          expect(result).toEqual([]);
        });

        it("should return all goals when all are completed", () => {
          const completedGoals = mockGoals.map((g) => ({ ...g, isCompleted: true }));
          const helpers = createSavingsGoalHelpers(completedGoals, mockMutations);

          const result = helpers.getCompletedGoals();

          expect(result).toHaveLength(4);
        });

        it("should handle empty goals array", () => {
          const helpers = createSavingsGoalHelpers([], mockMutations);

          const result = helpers.getCompletedGoals();

          expect(result).toEqual([]);
        });
      });
    });

    describe("Filter Helpers", () => {
      describe("getUrgentGoals", () => {
        it("should return only urgent goals", () => {
          const helpers = createSavingsGoalHelpers(mockGoals, mockMutations);

          const result = helpers.getUrgentGoals();

          expect(result).toHaveLength(1);
          expect(result.every((goal) => goal.urgency === "urgent")).toBe(true);
          expect(result[0].id).toBe("goal_1");
        });

        it("should return empty array when no urgent goals exist", () => {
          const nonUrgentGoals = mockGoals.map((g) => ({ ...g, urgency: "normal" }));
          const helpers = createSavingsGoalHelpers(nonUrgentGoals, mockMutations);

          const result = helpers.getUrgentGoals();

          expect(result).toEqual([]);
        });

        it("should not include overdue goals", () => {
          const helpers = createSavingsGoalHelpers(mockGoals, mockMutations);

          const result = helpers.getUrgentGoals();

          expect(result.some((goal) => goal.urgency === "overdue")).toBe(false);
        });

        it("should handle empty goals array", () => {
          const helpers = createSavingsGoalHelpers([], mockMutations);

          const result = helpers.getUrgentGoals();

          expect(result).toEqual([]);
        });
      });

      describe("getOverdueGoals", () => {
        it("should return only overdue goals", () => {
          const helpers = createSavingsGoalHelpers(mockGoals, mockMutations);

          const result = helpers.getOverdueGoals();

          expect(result).toHaveLength(1);
          expect(result.every((goal) => goal.urgency === "overdue")).toBe(true);
          expect(result[0].id).toBe("goal_3");
        });

        it("should return empty array when no overdue goals exist", () => {
          const notOverdueGoals = mockGoals.map((g) => ({ ...g, urgency: "normal" }));
          const helpers = createSavingsGoalHelpers(notOverdueGoals, mockMutations);

          const result = helpers.getOverdueGoals();

          expect(result).toEqual([]);
        });

        it("should not include urgent goals", () => {
          const helpers = createSavingsGoalHelpers(mockGoals, mockMutations);

          const result = helpers.getOverdueGoals();

          expect(result.some((goal) => goal.urgency === "urgent")).toBe(false);
        });

        it("should handle empty goals array", () => {
          const helpers = createSavingsGoalHelpers([], mockMutations);

          const result = helpers.getOverdueGoals();

          expect(result).toEqual([]);
        });
      });

      describe("getGoalsByCategory", () => {
        it("should return goals matching the specified category", () => {
          const helpers = createSavingsGoalHelpers(mockGoals, mockMutations);

          const result = helpers.getGoalsByCategory("savings");

          expect(result).toHaveLength(1);
          expect(result[0].category).toBe("savings");
          expect(result[0].id).toBe("goal_1");
        });

        it("should return empty array when no goals match category", () => {
          const helpers = createSavingsGoalHelpers(mockGoals, mockMutations);

          const result = helpers.getGoalsByCategory("nonexistent");

          expect(result).toEqual([]);
        });

        it("should return multiple goals with same category", () => {
          const sameCategory = mockGoals.map((g) => ({ ...g, category: "savings" }));
          const helpers = createSavingsGoalHelpers(sameCategory, mockMutations);

          const result = helpers.getGoalsByCategory("savings");

          expect(result).toHaveLength(4);
        });

        it("should handle empty goals array", () => {
          const helpers = createSavingsGoalHelpers([], mockMutations);

          const result = helpers.getGoalsByCategory("savings");

          expect(result).toEqual([]);
        });
      });

      describe("getGoalsByPriority", () => {
        it("should return goals matching the specified priority", () => {
          const helpers = createSavingsGoalHelpers(mockGoals, mockMutations);

          const result = helpers.getGoalsByPriority("high");

          expect(result).toHaveLength(2);
          expect(result.every((goal) => goal.priority === "high")).toBe(true);
          expect(result.map((g) => g.id)).toEqual(["goal_1", "goal_3"]);
        });

        it("should return empty array when no goals match priority", () => {
          const helpers = createSavingsGoalHelpers(mockGoals, mockMutations);

          const result = helpers.getGoalsByPriority("critical");

          expect(result).toEqual([]);
        });

        it("should return single goal with unique priority", () => {
          const helpers = createSavingsGoalHelpers(mockGoals, mockMutations);

          const result = helpers.getGoalsByPriority("low");

          expect(result).toHaveLength(1);
          expect(result[0].priority).toBe("low");
        });

        it("should handle empty goals array", () => {
          const helpers = createSavingsGoalHelpers([], mockMutations);

          const result = helpers.getGoalsByPriority("high");

          expect(result).toEqual([]);
        });
      });

      describe("hasGoalsNeedingAttention", () => {
        it("should return true when there are urgent incomplete goals", () => {
          const helpers = createSavingsGoalHelpers(mockGoals, mockMutations);

          const result = helpers.hasGoalsNeedingAttention();

          expect(result).toBe(true);
        });

        it("should return true when there are overdue incomplete goals", () => {
          const overdueOnly = [mockGoals[2]]; // goal_3 is overdue and incomplete
          const helpers = createSavingsGoalHelpers(overdueOnly, mockMutations);

          const result = helpers.hasGoalsNeedingAttention();

          expect(result).toBe(true);
        });

        it("should return false when all urgent/overdue goals are completed", () => {
          const completedUrgent = mockGoals.map((g) => ({
            ...g,
            isCompleted: g.urgency === "urgent" || g.urgency === "overdue" ? true : g.isCompleted,
          }));
          const helpers = createSavingsGoalHelpers(completedUrgent, mockMutations);

          const result = helpers.hasGoalsNeedingAttention();

          expect(result).toBe(false);
        });

        it("should return false when no urgent or overdue goals exist", () => {
          const normalGoals = mockGoals.map((g) => ({ ...g, urgency: "normal" }));
          const helpers = createSavingsGoalHelpers(normalGoals, mockMutations);

          const result = helpers.hasGoalsNeedingAttention();

          expect(result).toBe(false);
        });

        it("should return false for empty goals array", () => {
          const helpers = createSavingsGoalHelpers([], mockMutations);

          const result = helpers.hasGoalsNeedingAttention();

          expect(result).toBe(false);
        });

        it("should return true when both urgent and overdue goals exist", () => {
          const urgentAndOverdue = [mockGoals[0], mockGoals[2]]; // goal_1 urgent, goal_3 overdue
          const helpers = createSavingsGoalHelpers(urgentAndOverdue, mockMutations);

          const result = helpers.hasGoalsNeedingAttention();

          expect(result).toBe(true);
        });
      });
    });

    describe("Integration Tests", () => {
      it("should create all helper functions", () => {
        const helpers = createSavingsGoalHelpers(mockGoals, mockMutations);

        expect(helpers).toHaveProperty("addGoal");
        expect(helpers).toHaveProperty("updateGoal");
        expect(helpers).toHaveProperty("deleteGoal");
        expect(helpers).toHaveProperty("addContribution");
        expect(helpers).toHaveProperty("distributeFunds");
        expect(helpers).toHaveProperty("getGoalById");
        expect(helpers).toHaveProperty("getActiveGoals");
        expect(helpers).toHaveProperty("getCompletedGoals");
        expect(helpers).toHaveProperty("getUrgentGoals");
        expect(helpers).toHaveProperty("getOverdueGoals");
        expect(helpers).toHaveProperty("getGoalsByCategory");
        expect(helpers).toHaveProperty("getGoalsByPriority");
        expect(helpers).toHaveProperty("hasGoalsNeedingAttention");
      });

      it("should work with different goal arrays without side effects", () => {
        const helpers1 = createSavingsGoalHelpers(mockGoals, mockMutations);
        const helpers2 = createSavingsGoalHelpers([mockGoals[0]], mockMutations);

        expect(helpers1.getActiveGoals()).toHaveLength(3);
        expect(helpers2.getActiveGoals()).toHaveLength(1);
      });

      it("should allow chaining query operations", () => {
        const helpers = createSavingsGoalHelpers(mockGoals, mockMutations);

        const activeGoals = helpers.getActiveGoals();
        const urgentActive = activeGoals.filter((g) => g.urgency === "urgent");

        expect(urgentActive).toHaveLength(1);
        expect(urgentActive[0].id).toBe("goal_1");
      });
    });
  });
});
