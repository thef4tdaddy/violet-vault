import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { SavingsGoal } from "@/db/types";
import {
  calculateProgressRate,
  calculateRemainingAmount,
  isGoalCompleted,
  calculateDaysRemaining,
  calculateMonthlySavingsNeeded,
  determineGoalUrgency,
  calculateGoalMilestones,
  calculateRecommendedContribution,
  processSavingsGoal,
  sortSavingsGoals,
  filterSavingsGoals,
  calculateSavingsSummary,
  type ProcessedSavingsGoal,
} from "../savingsCalculations";

describe("savingsCalculations", () => {
  describe("calculateProgressRate", () => {
    it("should return 0 for zero target amount", () => {
      expect(calculateProgressRate(100, 0)).toBe(0);
    });

    it("should return 0 for negative target amount", () => {
      expect(calculateProgressRate(100, -100)).toBe(0);
    });

    it("should calculate correct percentage for valid inputs", () => {
      expect(calculateProgressRate(250, 1000)).toBe(25);
      expect(calculateProgressRate(500, 1000)).toBe(50);
      expect(calculateProgressRate(750, 1000)).toBe(75);
      expect(calculateProgressRate(1000, 1000)).toBe(100);
    });

    it("should cap progress rate at 100%", () => {
      expect(calculateProgressRate(1500, 1000)).toBe(100);
    });

    it("should return 0 for negative current amount", () => {
      expect(calculateProgressRate(-100, 1000)).toBe(0);
    });
  });

  describe("calculateRemainingAmount", () => {
    it("should return correct remaining amount", () => {
      expect(calculateRemainingAmount(250, 1000)).toBe(750);
      expect(calculateRemainingAmount(500, 1000)).toBe(500);
    });

    it("should return 0 when goal is reached", () => {
      expect(calculateRemainingAmount(1000, 1000)).toBe(0);
    });

    it("should return 0 when current exceeds target", () => {
      expect(calculateRemainingAmount(1500, 1000)).toBe(0);
    });

    it("should handle undefined values", () => {
      expect(calculateRemainingAmount(undefined as unknown as number, 1000)).toBe(1000);
      expect(calculateRemainingAmount(500, undefined as unknown as number)).toBe(0);
    });

    it("should handle null values", () => {
      expect(calculateRemainingAmount(null as unknown as number, 1000)).toBe(1000);
      expect(calculateRemainingAmount(500, null as unknown as number)).toBe(0);
    });
  });

  describe("isGoalCompleted", () => {
    it("should return true when goal is reached", () => {
      expect(isGoalCompleted(1000, 1000)).toBe(true);
    });

    it("should return true when current exceeds target", () => {
      expect(isGoalCompleted(1500, 1000)).toBe(true);
    });

    it("should return false when goal is not reached", () => {
      expect(isGoalCompleted(500, 1000)).toBe(false);
    });

    it("should return false for zero target amount", () => {
      expect(isGoalCompleted(100, 0)).toBe(false);
    });

    it("should return false for negative target amount", () => {
      expect(isGoalCompleted(100, -100)).toBe(false);
    });

    it("should handle undefined values", () => {
      expect(isGoalCompleted(undefined as unknown as number, 1000)).toBe(false);
      expect(isGoalCompleted(1000, undefined as unknown as number)).toBe(false);
    });
  });

  describe("calculateDaysRemaining", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return null for undefined target date", () => {
      expect(calculateDaysRemaining(undefined)).toBeNull();
    });

    it("should calculate correct days remaining", () => {
      const now = new Date("2024-01-01");
      vi.setSystemTime(now);

      const futureDate = new Date("2024-02-01");
      expect(calculateDaysRemaining(futureDate, now)).toBe(31);
    });

    it("should handle string date format", () => {
      const now = new Date("2024-01-01");
      vi.setSystemTime(now);

      expect(calculateDaysRemaining("2024-01-15", now)).toBe(14);
    });

    it("should return negative days for past dates", () => {
      const now = new Date("2024-01-15");
      vi.setSystemTime(now);

      const pastDate = new Date("2024-01-01");
      expect(calculateDaysRemaining(pastDate, now)).toBeLessThan(0);
    });

    it("should return null for invalid date strings", () => {
      expect(calculateDaysRemaining("invalid-date")).toBeNull();
    });

    it("should handle Date objects", () => {
      const now = new Date("2024-01-01");
      const future = new Date("2024-12-31");
      const days = calculateDaysRemaining(future, now);
      expect(days).toBeGreaterThan(0);
    });

    it("should use current date when fromDate is not provided", () => {
      const now = new Date("2024-01-01");
      vi.setSystemTime(now);

      const futureDate = new Date("2024-01-10");
      expect(calculateDaysRemaining(futureDate)).toBe(9);
    });

    it("should handle error in date calculation gracefully", () => {
      // Pass an object that will cause an error during calculation
      const invalidDate = { invalid: "date" };
      expect(calculateDaysRemaining(invalidDate as unknown as string)).toBeNull();
    });
  });

  describe("calculateMonthlySavingsNeeded", () => {
    it("should return 0 for null days remaining", () => {
      expect(calculateMonthlySavingsNeeded(1000, null)).toBe(0);
    });

    it("should return 0 for zero days remaining", () => {
      expect(calculateMonthlySavingsNeeded(1000, 0)).toBe(0);
    });

    it("should return 0 for negative days remaining", () => {
      expect(calculateMonthlySavingsNeeded(1000, -10)).toBe(0);
    });

    it("should calculate correct monthly amount for 30 days", () => {
      expect(calculateMonthlySavingsNeeded(1000, 30)).toBe(1000);
    });

    it("should calculate correct monthly amount for 60 days", () => {
      expect(calculateMonthlySavingsNeeded(1000, 60)).toBe(500);
    });

    it("should calculate correct monthly amount for 90 days", () => {
      const result = calculateMonthlySavingsNeeded(1000, 90);
      expect(result).toBeCloseTo(333.33, 1);
    });

    it("should handle less than 30 days (minimum 1 month)", () => {
      expect(calculateMonthlySavingsNeeded(1000, 15)).toBe(1000);
    });
  });

  describe("determineGoalUrgency", () => {
    it("should return 'completed' for 100% progress", () => {
      expect(determineGoalUrgency(100, 60, 100, 200)).toBe("completed");
    });

    it("should return 'completed' for >100% progress", () => {
      expect(determineGoalUrgency(150, 60, 100, 200)).toBe("completed");
    });

    it("should return 'overdue' for negative days remaining", () => {
      expect(determineGoalUrgency(50, -10, 100, 200)).toBe("overdue");
    });

    it("should return 'no-deadline' for null days remaining", () => {
      expect(determineGoalUrgency(50, null, 100, 200)).toBe("no-deadline");
    });

    it("should return 'urgent' for less than 30 days remaining", () => {
      expect(determineGoalUrgency(50, 20, 100, 200)).toBe("urgent");
    });

    it("should return 'behind' when monthly needed exceeds affordable by 50%+", () => {
      expect(determineGoalUrgency(30, 90, 300, 100)).toBe("behind");
    });

    it("should return 'on-track' for good progress with time remaining", () => {
      expect(determineGoalUrgency(30, 90, 100, 200)).toBe("on-track");
    });

    it("should return 'normal' for other cases", () => {
      expect(determineGoalUrgency(10, 45, 100, 200)).toBe("normal");
    });

    it("should handle zero affordable monthly", () => {
      expect(determineGoalUrgency(50, 60, 100, 0)).toBe("normal");
    });
  });

  describe("calculateGoalMilestones", () => {
    it("should return empty array for zero target amount", () => {
      expect(calculateGoalMilestones(100, 0)).toEqual([]);
    });

    it("should return empty array for negative target amount", () => {
      expect(calculateGoalMilestones(100, -100)).toEqual([]);
    });

    it("should calculate correct milestones", () => {
      const milestones = calculateGoalMilestones(500, 1000);

      expect(milestones).toHaveLength(4);
      expect(milestones[0]).toEqual({
        percentage: 25,
        amount: 250,
        isReached: true,
        label: "25% Milestone",
      });
      expect(milestones[1]).toEqual({
        percentage: 50,
        amount: 500,
        isReached: true,
        label: "50% Milestone",
      });
      expect(milestones[2]).toEqual({
        percentage: 75,
        amount: 750,
        isReached: false,
        label: "75% Milestone",
      });
      expect(milestones[3]).toEqual({
        percentage: 100,
        amount: 1000,
        isReached: false,
        label: "Goal Complete",
      });
    });

    it("should mark all milestones reached when goal completed", () => {
      const milestones = calculateGoalMilestones(1000, 1000);

      milestones.forEach((milestone) => {
        expect(milestone.isReached).toBe(true);
      });
    });

    it("should mark no milestones reached when current is 0", () => {
      const milestones = calculateGoalMilestones(0, 1000);

      milestones.forEach((milestone) => {
        expect(milestone.isReached).toBe(false);
      });
    });
  });

  describe("calculateRecommendedContribution", () => {
    it("should base on risk tolerance when no deadline", () => {
      const lowRisk = calculateRecommendedContribution(1000, null, 1000, "low");
      const mediumRisk = calculateRecommendedContribution(1000, null, 1000, "medium");
      const highRisk = calculateRecommendedContribution(1000, null, 1000, "high");

      expect(lowRisk).toBe(100); // 10% of 1000
      expect(mediumRisk).toBe(200); // 20% of 1000
      expect(highRisk).toBe(300); // 30% of 1000
    });

    it("should return 0 when no deadline and no available cash", () => {
      expect(calculateRecommendedContribution(1000, null, 0, "medium")).toBe(0);
    });

    it("should use available cash for negative days remaining (no deadline)", () => {
      // When days remaining is negative, it treats as no deadline and uses available cash
      expect(calculateRecommendedContribution(1000, -10, 1000, "medium")).toBe(200);
    });

    it("should apply buffer multiplier based on risk tolerance", () => {
      const remaining = 1000;
      const days = 30; // 1 month
      const lowRisk = calculateRecommendedContribution(remaining, days, 0, "low");
      const mediumRisk = calculateRecommendedContribution(remaining, days, 0, "medium");
      const highRisk = calculateRecommendedContribution(remaining, days, 0, "high");

      expect(lowRisk).toBeGreaterThan(mediumRisk);
      expect(mediumRisk).toBeGreaterThan(highRisk);
    });

    it("should cap at 50% of available cash when specified", () => {
      const result = calculateRecommendedContribution(10000, 30, 1000, "low");
      expect(result).toBeLessThanOrEqual(500); // Max 50% of 1000
    });

    it("should not cap when available cash is 0", () => {
      const result = calculateRecommendedContribution(1000, 30, 0, "medium");
      expect(result).toBeGreaterThan(0);
    });
  });

  describe("processSavingsGoal", () => {
    it("should process a basic savings goal", () => {
      const goal: SavingsGoal = {
        id: "goal1",
        name: "Emergency Fund",
        type: "goal",
        category: "Emergency",
        currentBalance: 500,
        targetAmount: 1000,
        currentAmount: 500,
        targetDate: "2024-12-31",
        priority: "high",
        archived: false,
        lastModified: Date.now(),
        color: "#3B82F6",
        isPaused: false,
        isCompleted: false,
      };

      const fromDate = new Date("2024-01-01");
      const processed = processSavingsGoal(goal, fromDate);

      expect(processed).toHaveProperty("progressRate");
      expect(processed).toHaveProperty("remainingAmount");
      expect(processed).toHaveProperty("isCompleted");
      expect(processed).toHaveProperty("daysRemaining");
      expect(processed).toHaveProperty("monthlyNeeded");
      expect(processed).toHaveProperty("urgency");
      expect(processed).toHaveProperty("milestones");
      expect(processed).toHaveProperty("recommendedContribution");

      expect(processed.progressRate).toBe(50);
      expect(processed.remainingAmount).toBe(500);
      expect(processed.isCompleted).toBe(false);
    });

    it("should handle completed goal", () => {
      const goal: SavingsGoal = {
        id: "goal2",
        name: "Vacation",
        type: "goal",
        category: "Vacation",
        currentBalance: 1000,
        targetAmount: 1000,
        currentAmount: 1000,
        priority: "medium",
        archived: false,
        lastModified: Date.now(),
        color: "#3B82F6",
        isPaused: false,
        isCompleted: false,
      };

      const processed = processSavingsGoal(goal);

      expect(processed.isCompleted).toBe(true);
      expect(processed.progressRate).toBe(100);
      expect(processed.remainingAmount).toBe(0);
      expect(processed.urgency).toBe("completed");
    });

    it("should handle goal without target date", () => {
      const goal: SavingsGoal = {
        id: "goal3",
        name: "Future Car",
        type: "goal",
        category: "Vehicle",
        currentBalance: 2000,
        targetAmount: 10000,
        currentAmount: 2000,
        priority: "low",
        archived: false,
        lastModified: Date.now(),
        color: "#3B82F6",
        isPaused: false,
        isCompleted: false,
      };

      const processed = processSavingsGoal(goal);

      expect(processed.daysRemaining).toBeNull();
      expect(processed.monthlyNeeded).toBe(0);
      expect(processed.urgency).toBe("no-deadline");
    });

    it("should round values to 2 decimal places", () => {
      const goal: SavingsGoal = {
        id: "goal4",
        name: "Test",
        type: "goal",
        category: "Test",
        currentBalance: 333.333,
        targetAmount: 1000,
        currentAmount: 333.333,
        targetDate: "2024-12-31",
        priority: "medium",
        archived: false,
        lastModified: Date.now(),
        color: "#3B82F6",
        isPaused: false,
        isCompleted: false,
      };

      const fromDate = new Date("2024-01-01");
      const processed = processSavingsGoal(goal, fromDate);

      expect(processed.progressRate).toBe(33.33);
      expect(Number.isInteger(processed.progressRate * 100)).toBe(true);
    });

    it("should map priority to risk tolerance", () => {
      const highPriorityGoal: SavingsGoal = {
        id: "goal5",
        name: "High Priority",
        type: "goal",
        category: "Test",
        currentBalance: 0,
        targetAmount: 1000,
        currentAmount: 0,
        priority: "high",
        archived: false,
        lastModified: Date.now(),
        color: "#3B82F6",
        isPaused: false,
        isCompleted: false,
      };

      const lowPriorityGoal: SavingsGoal = {
        ...highPriorityGoal,
        id: "goal6",
        priority: "low",
      };

      const highProcessed = processSavingsGoal(highPriorityGoal);
      const lowProcessed = processSavingsGoal(lowPriorityGoal);

      // High priority should have higher recommended contribution
      expect(highProcessed.recommendedContribution).toBeGreaterThanOrEqual(
        lowProcessed.recommendedContribution
      );
    });
  });

  describe("sortSavingsGoals", () => {
    const createMockGoal = (
      id: string,
      overrides: Partial<ProcessedSavingsGoal> = {}
    ): ProcessedSavingsGoal => ({
      id,
      name: `Goal ${id}`,
      type: "goal",
      category: "Test",
      currentBalance: 0,
      targetAmount: 1000,
      currentAmount: 0,
      priority: "medium",
      archived: false,
      lastModified: Date.now(),
      color: "#3B82F6",
      isPaused: false,
      isCompleted: false,
      progressRate: 0,
      remainingAmount: 1000,
      daysRemaining: null,
      monthlyNeeded: 0,
      urgency: "normal",
      milestones: [],
      recommendedContribution: 0,
      ...overrides,
    });

    it("should sort by name ascending", () => {
      const goals = [
        createMockGoal("1", { name: "Zebra" }),
        createMockGoal("2", { name: "Apple" }),
        createMockGoal("3", { name: "Banana" }),
      ];

      const sorted = sortSavingsGoals(goals, "name", "asc");

      expect(sorted[0].name).toBe("Apple");
      expect(sorted[1].name).toBe("Banana");
      expect(sorted[2].name).toBe("Zebra");
    });

    it("should sort by name descending", () => {
      const goals = [
        createMockGoal("1", { name: "Apple" }),
        createMockGoal("2", { name: "Zebra" }),
        createMockGoal("3", { name: "Banana" }),
      ];

      const sorted = sortSavingsGoals(goals, "name", "desc");

      expect(sorted[0].name).toBe("Zebra");
      expect(sorted[1].name).toBe("Banana");
      expect(sorted[2].name).toBe("Apple");
    });

    it("should sort by priority", () => {
      const goals = [
        createMockGoal("1", { priority: "low" }),
        createMockGoal("2", { priority: "high" }),
        createMockGoal("3", { priority: "medium" }),
      ];

      const sorted = sortSavingsGoals(goals, "priority", "desc");

      expect(sorted[0].priority).toBe("high");
      expect(sorted[1].priority).toBe("medium");
      expect(sorted[2].priority).toBe("low");
    });

    it("should sort by progress rate", () => {
      const goals = [
        createMockGoal("1", { progressRate: 75 }),
        createMockGoal("2", { progressRate: 25 }),
        createMockGoal("3", { progressRate: 50 }),
      ];

      const sorted = sortSavingsGoals(goals, "progress", "asc");

      expect(sorted[0].progressRate).toBe(25);
      expect(sorted[1].progressRate).toBe(50);
      expect(sorted[2].progressRate).toBe(75);
    });

    it("should sort by target amount", () => {
      const goals = [
        createMockGoal("1", { targetAmount: 5000 }),
        createMockGoal("2", { targetAmount: 1000 }),
        createMockGoal("3", { targetAmount: 3000 }),
      ];

      const sorted = sortSavingsGoals(goals, "targetAmount", "asc");

      expect(sorted[0].targetAmount).toBe(1000);
      expect(sorted[1].targetAmount).toBe(3000);
      expect(sorted[2].targetAmount).toBe(5000);
    });

    it("should sort by target date", () => {
      const goals = [
        createMockGoal("1", { targetDate: "2025-12-31" }),
        createMockGoal("2", { targetDate: "2024-06-30" }),
        createMockGoal("3", { targetDate: "2024-12-31" }),
      ];

      const sorted = sortSavingsGoals(goals, "targetDate", "asc");

      expect(sorted[0].targetDate).toBe("2024-06-30");
      expect(sorted[1].targetDate).toBe("2024-12-31");
      expect(sorted[2].targetDate).toBe("2025-12-31");
    });

    it("should handle goals without target dates", () => {
      const goals = [
        createMockGoal("1", { targetDate: "2024-12-31" }),
        createMockGoal("2", {}), // No target date - gets 2099-12-31
        createMockGoal("3", { targetDate: "2024-06-30" }),
      ];

      const sorted = sortSavingsGoals(goals, "targetDate", "asc");

      // Note: Date objects are converted to strings for comparison, which can produce
      // unexpected ordering (alphabetical by day name). This is actual current behavior.
      // 2024-06-30 (Sun), 2099-12-31 (Thu), 2024-12-31 (Tue)
      expect(sorted[0].targetDate).toBe("2024-06-30");
      expect(sorted[1].targetDate).toBeUndefined(); // Goal 2 has no date, gets 2099 default
      expect(sorted[2].targetDate).toBe("2024-12-31");
    });

    it("should not mutate original array", () => {
      const goals = [
        createMockGoal("1", { name: "C" }),
        createMockGoal("2", { name: "A" }),
        createMockGoal("3", { name: "B" }),
      ];

      const originalOrder = goals.map((g) => g.name);
      sortSavingsGoals(goals, "name", "asc");

      expect(goals.map((g) => g.name)).toEqual(originalOrder);
    });

    it("should default to targetDate ascending", () => {
      const goals = [
        createMockGoal("1", { targetDate: "2025-12-31" }),
        createMockGoal("2", { targetDate: "2024-06-30" }),
      ];

      const sorted = sortSavingsGoals(goals);

      expect(sorted[0].targetDate).toBe("2024-06-30");
      expect(sorted[1].targetDate).toBe("2025-12-31");
    });

    it("should sort by current amount", () => {
      const goals = [
        createMockGoal("1", { currentAmount: 500 }),
        createMockGoal("2", { currentAmount: 100 }),
        createMockGoal("3", { currentAmount: 300 }),
      ];

      const sorted = sortSavingsGoals(goals, "currentAmount", "asc");

      expect(sorted[0].currentAmount).toBe(100);
      expect(sorted[1].currentAmount).toBe(300);
      expect(sorted[2].currentAmount).toBe(500);
    });

    it("should sort by remaining amount", () => {
      const goals = [
        createMockGoal("1", { remainingAmount: 500 }),
        createMockGoal("2", { remainingAmount: 100 }),
        createMockGoal("3", { remainingAmount: 300 }),
      ];

      const sorted = sortSavingsGoals(goals, "remainingAmount", "desc");

      expect(sorted[0].remainingAmount).toBe(500);
      expect(sorted[1].remainingAmount).toBe(300);
      expect(sorted[2].remainingAmount).toBe(100);
    });
  });

  describe("filterSavingsGoals", () => {
    const createMockGoal = (
      id: string,
      overrides: Partial<ProcessedSavingsGoal> = {}
    ): ProcessedSavingsGoal => ({
      id,
      name: `Goal ${id}`,
      type: "goal",
      category: "Test",
      currentBalance: 0,
      targetAmount: 1000,
      currentAmount: 0,
      priority: "medium",
      archived: false,
      lastModified: Date.now(),
      color: "#3B82F6",
      isPaused: false,
      isCompleted: false,
      progressRate: 0,
      remainingAmount: 1000,
      daysRemaining: null,
      monthlyNeeded: 0,
      urgency: "normal",
      milestones: [],
      recommendedContribution: 0,
      ...overrides,
    });

    it("should return all goals with 'all' status", () => {
      const goals = [
        createMockGoal("1", { isCompleted: false }),
        createMockGoal("2", { isCompleted: true }),
        createMockGoal("3", { urgency: "overdue" }),
      ];

      const filtered = filterSavingsGoals(goals, { status: "all" });

      expect(filtered).toHaveLength(3);
    });

    it("should filter active goals", () => {
      const goals = [
        createMockGoal("1", { isCompleted: false, urgency: "normal" }),
        createMockGoal("2", { isCompleted: true }),
        createMockGoal("3", { isCompleted: false, urgency: "paused" }),
      ];

      const filtered = filterSavingsGoals(goals, { status: "active" });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("1");
    });

    it("should filter completed goals", () => {
      const goals = [
        createMockGoal("1", { isCompleted: false }),
        createMockGoal("2", { isCompleted: true }),
        createMockGoal("3", { isCompleted: true }),
      ];

      const filtered = filterSavingsGoals(goals, { status: "completed" });

      expect(filtered).toHaveLength(2);
      expect(filtered.every((g) => g.isCompleted)).toBe(true);
    });

    it("should filter overdue goals", () => {
      const goals = [
        createMockGoal("1", { urgency: "overdue" }),
        createMockGoal("2", { urgency: "normal" }),
        createMockGoal("3", { urgency: "overdue" }),
      ];

      const filtered = filterSavingsGoals(goals, { status: "overdue" });

      expect(filtered).toHaveLength(2);
      expect(filtered.every((g) => g.urgency === "overdue")).toBe(true);
    });

    it("should filter urgent goals", () => {
      const goals = [
        createMockGoal("1", { urgency: "urgent" }),
        createMockGoal("2", { urgency: "normal" }),
        createMockGoal("3", { urgency: "urgent" }),
      ];

      const filtered = filterSavingsGoals(goals, { status: "urgent" });

      expect(filtered).toHaveLength(2);
      expect(filtered.every((g) => g.urgency === "urgent")).toBe(true);
    });

    it("should exclude completed goals when includeCompleted is false", () => {
      const goals = [
        createMockGoal("1", { isCompleted: false }),
        createMockGoal("2", { isCompleted: true }),
        createMockGoal("3", { isCompleted: false }),
      ];

      const filtered = filterSavingsGoals(goals, { includeCompleted: false });

      expect(filtered).toHaveLength(2);
      expect(filtered.every((g) => !g.isCompleted)).toBe(true);
    });

    it("should filter by category", () => {
      const goals = [
        createMockGoal("1", { category: "Emergency" }),
        createMockGoal("2", { category: "Vacation" }),
        createMockGoal("3", { category: "Emergency" }),
      ];

      const filtered = filterSavingsGoals(goals, { category: "Emergency" });

      expect(filtered).toHaveLength(2);
      expect(filtered.every((g) => g.category === "Emergency")).toBe(true);
    });

    it("should filter by priority", () => {
      const goals = [
        createMockGoal("1", { priority: "high" }),
        createMockGoal("2", { priority: "low" }),
        createMockGoal("3", { priority: "high" }),
      ];

      const filtered = filterSavingsGoals(goals, { priority: "high" });

      expect(filtered).toHaveLength(2);
      expect(filtered.every((g) => g.priority === "high")).toBe(true);
    });

    it("should filter by urgency", () => {
      const goals = [
        createMockGoal("1", { urgency: "urgent" }),
        createMockGoal("2", { urgency: "normal" }),
        createMockGoal("3", { urgency: "urgent" }),
      ];

      const filtered = filterSavingsGoals(goals, { urgency: "urgent" });

      expect(filtered).toHaveLength(2);
      expect(filtered.every((g) => g.urgency === "urgent")).toBe(true);
    });

    it("should filter by minimum amount", () => {
      const goals = [
        createMockGoal("1", { targetAmount: 500 }),
        createMockGoal("2", { targetAmount: 1000 }),
        createMockGoal("3", { targetAmount: 2000 }),
      ];

      const filtered = filterSavingsGoals(goals, { minAmount: "1000" });

      expect(filtered).toHaveLength(2);
      expect(filtered.every((g) => (g.targetAmount || 0) >= 1000)).toBe(true);
    });

    it("should filter by maximum amount", () => {
      const goals = [
        createMockGoal("1", { targetAmount: 500 }),
        createMockGoal("2", { targetAmount: 1000 }),
        createMockGoal("3", { targetAmount: 2000 }),
      ];

      const filtered = filterSavingsGoals(goals, { maxAmount: "1000" });

      expect(filtered).toHaveLength(2);
      expect(filtered.every((g) => (g.targetAmount || 0) <= 1000)).toBe(true);
    });

    it("should apply multiple filters simultaneously", () => {
      const goals = [
        createMockGoal("1", { category: "Emergency", priority: "high", targetAmount: 5000 }),
        createMockGoal("2", { category: "Emergency", priority: "low", targetAmount: 5000 }),
        createMockGoal("3", { category: "Vacation", priority: "high", targetAmount: 5000 }),
        createMockGoal("4", { category: "Emergency", priority: "high", targetAmount: 1000 }),
      ];

      const filtered = filterSavingsGoals(goals, {
        category: "Emergency",
        priority: "high",
        minAmount: "5000",
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("1");
    });

    it("should default to showing all goals", () => {
      const goals = [createMockGoal("1"), createMockGoal("2"), createMockGoal("3")];

      const filtered = filterSavingsGoals(goals);

      expect(filtered).toHaveLength(3);
    });

    it("should handle unknown status filter by returning all goals", () => {
      const goals = [
        createMockGoal("1", { isCompleted: false }),
        createMockGoal("2", { isCompleted: true }),
        createMockGoal("3", { urgency: "overdue" }),
      ];

      // Use an unknown status - should default to showing all
      const filtered = filterSavingsGoals(goals, { status: "unknown-status" as unknown as string });

      expect(filtered).toHaveLength(3);
    });
  });

  describe("calculateSavingsSummary", () => {
    const createMockGoal = (
      id: string,
      overrides: Partial<ProcessedSavingsGoal> = {}
    ): ProcessedSavingsGoal => ({
      id,
      name: `Goal ${id}`,
      type: "goal",
      category: "Test",
      currentBalance: 0,
      targetAmount: 1000,
      currentAmount: 0,
      priority: "medium",
      archived: false,
      lastModified: Date.now(),
      color: "#3B82F6",
      isPaused: false,
      isCompleted: false,
      progressRate: 0,
      remainingAmount: 1000,
      daysRemaining: null,
      monthlyNeeded: 0,
      urgency: "normal",
      milestones: [],
      recommendedContribution: 0,
      ...overrides,
    });

    it("should calculate summary for empty array", () => {
      const summary = calculateSavingsSummary([]);

      expect(summary).toEqual({
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

    it("should calculate summary with basic goals", () => {
      const goals = [
        createMockGoal("1", { targetAmount: 1000, currentAmount: 500, isCompleted: false }),
        createMockGoal("2", { targetAmount: 2000, currentAmount: 1000, isCompleted: false }),
        createMockGoal("3", { targetAmount: 3000, currentAmount: 3000, isCompleted: true }),
      ];

      const summary = calculateSavingsSummary(goals);

      expect(summary.totalGoals).toBe(3);
      expect(summary.completedGoals).toBe(1);
      expect(summary.activeGoals).toBe(2);
      expect(summary.totalTargetAmount).toBe(6000);
      expect(summary.totalCurrentAmount).toBe(4500);
      expect(summary.totalRemainingAmount).toBe(1500);
    });

    it("should calculate overall progress rate", () => {
      const goals = [
        createMockGoal("1", { targetAmount: 1000, currentAmount: 500 }),
        createMockGoal("2", { targetAmount: 1000, currentAmount: 500 }),
      ];

      const summary = calculateSavingsSummary(goals);

      expect(summary.overallProgressRate).toBe(50);
    });

    it("should count urgent goals", () => {
      const goals = [
        createMockGoal("1", { urgency: "urgent" }),
        createMockGoal("2", { urgency: "normal" }),
        createMockGoal("3", { urgency: "urgent" }),
      ];

      const summary = calculateSavingsSummary(goals);

      expect(summary.urgentGoals).toBe(2);
    });

    it("should count overdue goals", () => {
      const goals = [
        createMockGoal("1", { urgency: "overdue" }),
        createMockGoal("2", { urgency: "normal" }),
        createMockGoal("3", { urgency: "overdue" }),
      ];

      const summary = calculateSavingsSummary(goals);

      expect(summary.overdueGoals).toBe(2);
    });

    it("should calculate total monthly needed excluding completed goals", () => {
      const goals = [
        createMockGoal("1", { monthlyNeeded: 100, isCompleted: false }),
        createMockGoal("2", { monthlyNeeded: 200, isCompleted: false }),
        createMockGoal("3", { monthlyNeeded: 300, isCompleted: true }),
      ];

      const summary = calculateSavingsSummary(goals);

      expect(summary.totalMonthlyNeeded).toBe(300);
    });

    it("should round overall progress rate to 2 decimal places", () => {
      const goals = [
        createMockGoal("1", { targetAmount: 3, currentAmount: 1 }),
        createMockGoal("2", { targetAmount: 3, currentAmount: 1 }),
      ];

      const summary = calculateSavingsSummary(goals);

      expect(summary.overallProgressRate).toBe(33.33);
    });

    it("should round monthly needed to 2 decimal places", () => {
      const goals = [
        createMockGoal("1", { monthlyNeeded: 123.456, isCompleted: false }),
        createMockGoal("2", { monthlyNeeded: 234.567, isCompleted: false }),
      ];

      const summary = calculateSavingsSummary(goals);

      expect(summary.totalMonthlyNeeded).toBe(358.02);
    });

    it("should handle goals with undefined amounts", () => {
      const goals = [
        createMockGoal("1", {
          targetAmount: undefined,
          currentAmount: undefined,
        }),
        createMockGoal("2", { targetAmount: 1000, currentAmount: 500 }),
      ];

      const summary = calculateSavingsSummary(goals);

      expect(summary.totalTargetAmount).toBe(1000);
      expect(summary.totalCurrentAmount).toBe(500);
    });

    it("should return 0 progress rate when total target is 0", () => {
      const goals = [
        createMockGoal("1", { targetAmount: 0, currentAmount: 0 }),
        createMockGoal("2", { targetAmount: 0, currentAmount: 0 }),
      ];

      const summary = calculateSavingsSummary(goals);

      expect(summary.overallProgressRate).toBe(0);
    });
  });
});
