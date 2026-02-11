/**
 * Tests for Performance Metrics Utility Functions
 * Comprehensive coverage for budget adherence, savings rate, spending efficiency, and balance stability
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  calculateBudgetAdherence,
  calculateSavingsRate,
  calculateSpendingEfficiency,
  calculateBalanceStability,
} from "../performanceMetricsUtils";
import type { AnalyticsData, BalanceData } from "@/types/analytics";

describe("performanceMetricsUtils", () => {
  describe("calculateBudgetAdherence", () => {
    let mockAnalytics: AnalyticsData;
    let mockBalance: BalanceData;

    beforeEach(() => {
      mockAnalytics = {} as AnalyticsData;
      mockBalance = {
        envelopeAnalysis: [],
      } as BalanceData;
    });

    it("should return 0 for empty envelope analysis", () => {
      const result = calculateBudgetAdherence(mockAnalytics, mockBalance);
      expect(result).toBe(0);
    });

    it("should return 0 for null envelope analysis", () => {
      mockBalance.envelopeAnalysis = null as unknown as BalanceData["envelopeAnalysis"];
      const result = calculateBudgetAdherence(mockAnalytics, mockBalance);
      expect(result).toBe(0);
    });

    it("should return 100 for envelopes under budget", () => {
      mockBalance.envelopeAnalysis = [
        { monthlyBudget: 1000, spent: 800 },
        { monthlyBudget: 500, spent: 400 },
      ];

      const result = calculateBudgetAdherence(mockAnalytics, mockBalance);
      expect(result).toBe(100);
    });

    it("should return 90 for envelopes at 90-100% of budget", () => {
      mockBalance.envelopeAnalysis = [
        { monthlyBudget: 1000, spent: 950 }, // 95% - at high utilization
        { monthlyBudget: 500, spent: 480 }, // 96% - at high utilization
      ];

      const result = calculateBudgetAdherence(mockAnalytics, mockBalance);
      // Both between 90-100%, so both score 90
      expect(result).toBe(90);
    });

    it("should return 90 for envelope at 100% utilization", () => {
      mockBalance.envelopeAnalysis = [
        { monthlyBudget: 1000, spent: 1000 }, // 100% - exactly on budget
      ];

      const result = calculateBudgetAdherence(mockAnalytics, mockBalance);
      expect(result).toBe(90);
    });

    it("should return 60 for envelopes moderately over budget (100-120%)", () => {
      mockBalance.envelopeAnalysis = [
        { monthlyBudget: 1000, spent: 1100 }, // 110% - moderately over
      ];

      const result = calculateBudgetAdherence(mockAnalytics, mockBalance);
      expect(result).toBe(60);
    });

    it("should return 20 for envelopes severely over budget (>120%)", () => {
      mockBalance.envelopeAnalysis = [
        { monthlyBudget: 1000, spent: 1500 }, // 150% - severely over
      ];

      const result = calculateBudgetAdherence(mockAnalytics, mockBalance);
      expect(result).toBe(20);
    });

    it("should handle envelopes with no budget set", () => {
      mockBalance.envelopeAnalysis = [
        { monthlyBudget: 0, spent: 500 }, // No budget = 100 score
        { monthlyBudget: 1000, spent: 800 }, // Under budget = 100 score
      ];

      const result = calculateBudgetAdherence(mockAnalytics, mockBalance);
      expect(result).toBe(100);
    });

    it("should handle null or undefined budget values", () => {
      mockBalance.envelopeAnalysis = [
        { monthlyBudget: null as unknown as number, spent: 500 },
        { monthlyBudget: undefined as unknown as number, spent: 300 },
      ];

      const result = calculateBudgetAdherence(mockAnalytics, mockBalance);
      expect(result).toBe(100); // Treats null/undefined as 0 = no budget
    });

    it("should handle null or undefined spent values", () => {
      mockBalance.envelopeAnalysis = [
        { monthlyBudget: 1000, spent: null as unknown as number },
        { monthlyBudget: 500, spent: undefined as unknown as number },
      ];

      const result = calculateBudgetAdherence(mockAnalytics, mockBalance);
      expect(result).toBe(100); // Treats null/undefined as 0 spent
    });

    it("should calculate average score correctly for mixed envelopes", () => {
      mockBalance.envelopeAnalysis = [
        { monthlyBudget: 1000, spent: 800 }, // 100 score
        { monthlyBudget: 500, spent: 600 }, // 60 score
        { monthlyBudget: 200, spent: 300 }, // 20 score
      ];

      const result = calculateBudgetAdherence(mockAnalytics, mockBalance);
      // (100 + 60 + 20) / 3 = 60
      expect(result).toBe(60);
    });

    it("should round the final score", () => {
      mockBalance.envelopeAnalysis = [
        { monthlyBudget: 1000, spent: 800 }, // 100
        { monthlyBudget: 500, spent: 600 }, // 60
      ];

      const result = calculateBudgetAdherence(mockAnalytics, mockBalance);
      // (100 + 60) / 2 = 80
      expect(result).toBe(80);
    });

    it("should handle edge case at exactly 90% utilization", () => {
      mockBalance.envelopeAnalysis = [{ monthlyBudget: 1000, spent: 900 }];

      const result = calculateBudgetAdherence(mockAnalytics, mockBalance);
      expect(result).toBe(100);
    });

    it("should handle edge case at exactly 100% utilization", () => {
      mockBalance.envelopeAnalysis = [{ monthlyBudget: 1000, spent: 1000 }];

      const result = calculateBudgetAdherence(mockAnalytics, mockBalance);
      expect(result).toBe(90);
    });

    it("should handle edge case at exactly 120% utilization", () => {
      mockBalance.envelopeAnalysis = [{ monthlyBudget: 1000, spent: 1200 }];

      const result = calculateBudgetAdherence(mockAnalytics, mockBalance);
      expect(result).toBe(60);
    });
  });

  describe("calculateSavingsRate", () => {
    let mockAnalytics: AnalyticsData;
    let mockBalance: BalanceData;

    beforeEach(() => {
      mockAnalytics = {
        totalIncome: 5000,
      } as AnalyticsData;
      mockBalance = {
        savingsGoals: [],
      } as BalanceData;
    });

    it("should return 0 for zero total income", () => {
      mockAnalytics.totalIncome = 0;
      const result = calculateSavingsRate(mockAnalytics, mockBalance);
      expect(result).toBe(0);
    });

    it("should return 0 for null total income", () => {
      mockAnalytics.totalIncome = null as unknown as number;
      const result = calculateSavingsRate(mockAnalytics, mockBalance);
      expect(result).toBe(0);
    });

    it("should return 100 for savings rate >= 20%", () => {
      mockBalance.savingsGoals = [{ currentAmount: 800 }, { currentAmount: 200 }];
      // 1000 / 5000 = 20%
      const result = calculateSavingsRate(mockAnalytics, mockBalance);
      expect(result).toBe(100);
    });

    it("should return 90 for savings rate >= 15%", () => {
      mockBalance.savingsGoals = [{ currentAmount: 750 }];
      // 750 / 5000 = 15%
      const result = calculateSavingsRate(mockAnalytics, mockBalance);
      expect(result).toBe(90);
    });

    it("should return 75 for savings rate >= 10%", () => {
      mockBalance.savingsGoals = [{ currentAmount: 500 }];
      // 500 / 5000 = 10%
      const result = calculateSavingsRate(mockAnalytics, mockBalance);
      expect(result).toBe(75);
    });

    it("should return 50 for savings rate >= 5%", () => {
      mockBalance.savingsGoals = [{ currentAmount: 250 }];
      // 250 / 5000 = 5%
      const result = calculateSavingsRate(mockAnalytics, mockBalance);
      expect(result).toBe(50);
    });

    it("should return 25 for savings rate < 5%", () => {
      mockBalance.savingsGoals = [{ currentAmount: 100 }];
      // 100 / 5000 = 2%
      const result = calculateSavingsRate(mockAnalytics, mockBalance);
      expect(result).toBe(25);
    });

    it("should handle null savings goals", () => {
      mockBalance.savingsGoals = null as unknown as BalanceData["savingsGoals"];
      const result = calculateSavingsRate(mockAnalytics, mockBalance);
      // With null savingsGoals, treated as 0 savings = 0% rate = score 25
      expect(result).toBe(25);
    });

    it("should handle empty savings goals", () => {
      mockBalance.savingsGoals = [];
      const result = calculateSavingsRate(mockAnalytics, mockBalance);
      // With empty array, 0 savings = 0% rate = score 25
      expect(result).toBe(25);
    });

    it("should handle null currentAmount in goals", () => {
      mockBalance.savingsGoals = [
        { currentAmount: null as unknown as number },
        { currentAmount: 500 },
      ];
      // 500 / 5000 = 10%
      const result = calculateSavingsRate(mockAnalytics, mockBalance);
      expect(result).toBe(75);
    });

    it("should sum multiple savings goals", () => {
      mockBalance.savingsGoals = [
        { currentAmount: 300 },
        { currentAmount: 200 },
        { currentAmount: 500 },
      ];
      // 1000 / 5000 = 20%
      const result = calculateSavingsRate(mockAnalytics, mockBalance);
      expect(result).toBe(100);
    });

    it("should handle savings greater than income", () => {
      mockBalance.savingsGoals = [{ currentAmount: 10000 }];
      // 10000 / 5000 = 200%
      const result = calculateSavingsRate(mockAnalytics, mockBalance);
      expect(result).toBe(100); // Capped at 100
    });
  });

  describe("calculateSpendingEfficiency", () => {
    let mockAnalytics: AnalyticsData;

    beforeEach(() => {
      mockAnalytics = {
        categoryBreakdown: [],
      } as AnalyticsData;
    });

    it("should return 0 for empty category breakdown", () => {
      const result = calculateSpendingEfficiency(mockAnalytics);
      expect(result).toBe(0);
    });

    it("should return 0 for null category breakdown", () => {
      mockAnalytics.categoryBreakdown = null as unknown as AnalyticsData["categoryBreakdown"];
      const result = calculateSpendingEfficiency(mockAnalytics);
      expect(result).toBe(0);
    });

    it("should return 100 for zero total spending", () => {
      mockAnalytics.categoryBreakdown = [
        { amount: 0 },
        { amount: 0 },
      ] as AnalyticsData["categoryBreakdown"];
      const result = calculateSpendingEfficiency(mockAnalytics);
      expect(result).toBe(100);
    });

    it("should calculate Gini coefficient for balanced spending", () => {
      mockAnalytics.categoryBreakdown = [
        { amount: 100 },
        { amount: 100 },
        { amount: 100 },
      ] as AnalyticsData["categoryBreakdown"];
      // Perfect balance = Gini ≈ 0 = high efficiency
      const result = calculateSpendingEfficiency(mockAnalytics);
      expect(result).toBeGreaterThanOrEqual(95);
    });

    it("should calculate Gini coefficient for unbalanced spending", () => {
      mockAnalytics.categoryBreakdown = [
        { amount: 1000 },
        { amount: 10 },
        { amount: 10 },
      ] as AnalyticsData["categoryBreakdown"];
      // High imbalance = higher Gini = lower efficiency
      const result = calculateSpendingEfficiency(mockAnalytics);
      expect(result).toBeLessThan(100);
    });

    it("should handle negative amounts (convert to absolute)", () => {
      mockAnalytics.categoryBreakdown = [
        { amount: -100 },
        { amount: -200 },
        { amount: -100 },
      ] as AnalyticsData["categoryBreakdown"];
      const result = calculateSpendingEfficiency(mockAnalytics);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(100);
    });

    it("should handle mixed positive and negative amounts", () => {
      mockAnalytics.categoryBreakdown = [
        { amount: 100 },
        { amount: -200 },
        { amount: 100 },
      ] as AnalyticsData["categoryBreakdown"];
      const result = calculateSpendingEfficiency(mockAnalytics);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(100);
    });

    it("should round the result", () => {
      mockAnalytics.categoryBreakdown = [
        { amount: 100 },
        { amount: 105 },
        { amount: 95 },
      ] as AnalyticsData["categoryBreakdown"];
      const result = calculateSpendingEfficiency(mockAnalytics);
      expect(Number.isInteger(result)).toBe(true);
    });

    it("should ensure result is never negative", () => {
      mockAnalytics.categoryBreakdown = [
        { amount: 10000 },
        { amount: 1 },
      ] as AnalyticsData["categoryBreakdown"];
      const result = calculateSpendingEfficiency(mockAnalytics);
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it("should handle single category", () => {
      mockAnalytics.categoryBreakdown = [{ amount: 500 }] as AnalyticsData["categoryBreakdown"];
      // Single category = perfect balance = Gini = 0
      const result = calculateSpendingEfficiency(mockAnalytics);
      expect(result).toBe(100);
    });
  });

  describe("calculateBalanceStability", () => {
    let mockBalance: BalanceData;

    beforeEach(() => {
      mockBalance = {
        actualBalance: 1000,
        virtualBalance: 1000,
      } as BalanceData;
    });

    it("should return 100 for perfectly matched balances", () => {
      const result = calculateBalanceStability(mockBalance);
      expect(result).toBe(100);
    });

    it("should return 100 for discrepancy <= 1%", () => {
      mockBalance.actualBalance = 1000;
      mockBalance.virtualBalance = 1005;
      // 5 / 1000 = 0.5%
      const result = calculateBalanceStability(mockBalance);
      expect(result).toBe(100);
    });

    it("should return 90 for discrepancy <= 3%", () => {
      mockBalance.actualBalance = 1000;
      mockBalance.virtualBalance = 1025;
      // 25 / 1000 = 2.5%
      const result = calculateBalanceStability(mockBalance);
      expect(result).toBe(90);
    });

    it("should return 75 for discrepancy <= 5%", () => {
      mockBalance.actualBalance = 1000;
      mockBalance.virtualBalance = 1040;
      // 40 / 1000 = 4%
      const result = calculateBalanceStability(mockBalance);
      expect(result).toBe(75);
    });

    it("should return 50 for discrepancy <= 10%", () => {
      mockBalance.actualBalance = 1000;
      mockBalance.virtualBalance = 1080;
      // 80 / 1000 = 8%
      const result = calculateBalanceStability(mockBalance);
      expect(result).toBe(50);
    });

    it("should return 25 for discrepancy > 10%", () => {
      mockBalance.actualBalance = 1000;
      mockBalance.virtualBalance = 1200;
      // 200 / 1000 = 20%
      const result = calculateBalanceStability(mockBalance);
      expect(result).toBe(25);
    });

    it("should return 50 for zero actual balance", () => {
      mockBalance.actualBalance = 0;
      mockBalance.virtualBalance = 100;
      const result = calculateBalanceStability(mockBalance);
      expect(result).toBe(50);
    });

    it("should handle null actual balance", () => {
      mockBalance.actualBalance = null as unknown as number;
      mockBalance.virtualBalance = 100;
      const result = calculateBalanceStability(mockBalance);
      expect(result).toBe(50);
    });

    it("should handle null virtual balance", () => {
      mockBalance.actualBalance = 1000;
      mockBalance.virtualBalance = null as unknown as number;
      // null treated as 0, so 1000 discrepancy / 1000 = 100% = score 25
      const result = calculateBalanceStability(mockBalance);
      expect(result).toBe(25);
    });

    it("should handle negative actual balance", () => {
      mockBalance.actualBalance = -1000;
      mockBalance.virtualBalance = -1050;
      // 50 / 1000 = 5% (uses absolute value)
      const result = calculateBalanceStability(mockBalance);
      expect(result).toBe(75);
    });

    it("should calculate discrepancy in both directions", () => {
      mockBalance.actualBalance = 1000;
      mockBalance.virtualBalance = 950;
      // 50 / 1000 = 5%
      const result1 = calculateBalanceStability(mockBalance);

      mockBalance.virtualBalance = 1050;
      // 50 / 1000 = 5%
      const result2 = calculateBalanceStability(mockBalance);

      expect(result1).toBe(result2);
    });

    it("should handle very small actual balance", () => {
      mockBalance.actualBalance = 1;
      mockBalance.virtualBalance = 2;
      // 1 / 1 = 100%
      const result = calculateBalanceStability(mockBalance);
      expect(result).toBe(25);
    });

    it("should handle edge case at exactly 1% discrepancy", () => {
      mockBalance.actualBalance = 1000;
      mockBalance.virtualBalance = 1010;
      // 10 / 1000 = 1%
      const result = calculateBalanceStability(mockBalance);
      expect(result).toBe(100);
    });

    it("should handle edge case at exactly 3% discrepancy", () => {
      mockBalance.actualBalance = 1000;
      mockBalance.virtualBalance = 1030;
      // 30 / 1000 = 3%
      const result = calculateBalanceStability(mockBalance);
      expect(result).toBe(90);
    });

    it("should handle edge case at exactly 5% discrepancy", () => {
      mockBalance.actualBalance = 1000;
      mockBalance.virtualBalance = 1050;
      // 50 / 1000 = 5%
      const result = calculateBalanceStability(mockBalance);
      expect(result).toBe(75);
    });

    it("should handle edge case at exactly 10% discrepancy", () => {
      mockBalance.actualBalance = 1000;
      mockBalance.virtualBalance = 1100;
      // 100 / 1000 = 10%
      const result = calculateBalanceStability(mockBalance);
      expect(result).toBe(50);
    });
  });
});
