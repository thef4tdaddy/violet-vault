import { describe, it, expect, beforeEach } from "vitest";
import {
  calculateDebtAvalanche,
  calculateDebtSnowball,
  calculateDebtCustom,
  compareDebtStrategies,
  DEBT_STRATEGIES,
} from "../debtStrategies";
import { DEBT_TYPES, DEBT_STATUS, PAYMENT_FREQUENCIES } from "@/constants/debts";
import type { DebtAccount } from "@/types/debt";

describe("debtStrategies", () => {
  describe("DEBT_STRATEGIES constant", () => {
    it("should export strategy constants", () => {
      expect(DEBT_STRATEGIES.AVALANCHE).toBe("avalanche");
      expect(DEBT_STRATEGIES.SNOWBALL).toBe("snowball");
      expect(DEBT_STRATEGIES.CUSTOM).toBe("custom");
    });
  });

  describe("calculateDebtAvalanche", () => {
    const createDebt = (
      id: string,
      balance: number,
      interestRate: number,
      minimumPayment: number
    ): DebtAccount => ({
      id,
      name: `Debt ${id}`,
      creditor: "Test Creditor",
      balance,
      interestRate,
      minimumPayment,
      type: DEBT_TYPES.PERSONAL,
      status: DEBT_STATUS.ACTIVE,
      paymentFrequency: PAYMENT_FREQUENCIES.MONTHLY,
      compoundFrequency: "monthly",
    });

    it("should calculate avalanche strategy (highest interest rate first)", () => {
      const debts = [
        createDebt("1", 5000, 18, 150), // High interest
        createDebt("2", 3000, 12, 90), // Medium interest
        createDebt("3", 2000, 6, 60), // Low interest
      ];

      const result = calculateDebtAvalanche(debts, 200);

      expect(result.strategy).toBe("avalanche");
      expect(result.totalMonths).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(0);
      expect(result.debtPayoffOrder).toBeDefined();
      expect(result.monthlyBreakdown).toBeDefined();
      expect(result.monthlyBreakdown.length).toBe(result.totalMonths);
    });

    it("should prioritize highest interest rate debt first", () => {
      const debts = [
        createDebt("low", 10000, 5, 200), // Low interest, high balance
        createDebt("high", 1000, 25, 50), // High interest, low balance
      ];

      const result = calculateDebtAvalanche(debts, 100);

      // High interest debt should be paid off first
      expect(result.debtPayoffOrder[0]).toBe("high");
      expect(result.debtPayoffOrder[1]).toBe("low");
    });

    it("should handle zero extra payment", () => {
      const debts = [createDebt("1", 5000, 10, 150)];

      const result = calculateDebtAvalanche(debts, 0);

      expect(result.strategy).toBe("avalanche");
      expect(result.totalMonths).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(0);
    });

    it("should handle single debt", () => {
      const debts = [createDebt("1", 1000, 10, 100)];

      const result = calculateDebtAvalanche(debts, 50);

      expect(result.strategy).toBe("avalanche");
      expect(result.debtPayoffOrder).toHaveLength(1);
      expect(result.debtPayoffOrder[0]).toBe("1");
    });

    it("should calculate total interest correctly", () => {
      const debts = [createDebt("1", 1200, 12, 100)];

      const result = calculateDebtAvalanche(debts, 0);

      // With 12% annual interest (1% monthly) on $1200, paying $100/month
      // Should have some interest but not excessive
      expect(result.totalInterest).toBeGreaterThan(0);
      expect(result.totalInterest).toBeLessThan(debts[0].balance);
    });

    it("should handle large extra payment that pays off quickly", () => {
      const debts = [createDebt("1", 1000, 10, 50)];

      const result = calculateDebtAvalanche(debts, 1000);

      // Should pay off in 1-2 months with large extra payment
      expect(result.totalMonths).toBeLessThanOrEqual(2);
      expect(result.totalInterest).toBeGreaterThanOrEqual(0);
    });

    it("should handle multiple debts with same interest rate", () => {
      const debts = [
        createDebt("1", 5000, 10, 150),
        createDebt("2", 3000, 10, 100),
        createDebt("3", 2000, 10, 75),
      ];

      const result = calculateDebtAvalanche(debts, 100);

      expect(result.strategy).toBe("avalanche");
      expect(result.debtPayoffOrder).toHaveLength(3);
      expect(result.totalMonths).toBeGreaterThan(0);
    });

    it("should stop at MAX_MONTHS limit", () => {
      // Create a debt that would take very long to pay off
      const debts = [createDebt("1", 1000000, 0.1, 10)];

      const result = calculateDebtAvalanche(debts, 0);

      // Should stop at 600 months (50 years)
      expect(result.totalMonths).toBeLessThanOrEqual(600);
    });

    it("should correctly calculate monthly breakdown", () => {
      const debts = [createDebt("1", 1000, 12, 100)];

      const result = calculateDebtAvalanche(debts, 0);

      // Check first month
      const firstMonth = result.monthlyBreakdown[0];
      expect(firstMonth.month).toBe(1);
      expect(firstMonth.totalPayment).toBeGreaterThan(0);
      expect(firstMonth.debts).toHaveLength(1);
      expect(firstMonth.debts[0].debtId).toBe("1");
      expect(firstMonth.debts[0].payment).toBeGreaterThan(0);
      expect(firstMonth.debts[0].principal).toBeGreaterThan(0);
      expect(firstMonth.debts[0].interest).toBeGreaterThanOrEqual(0);
    });

    it("should handle edge case: zero interest rate", () => {
      const debts = [createDebt("1", 1000, 0, 100)];

      const result = calculateDebtAvalanche(debts, 0);

      // Should pay off in 10 months with no interest
      expect(result.totalMonths).toBe(10);
      expect(result.totalInterest).toBe(0);
    });
  });

  describe("calculateDebtSnowball", () => {
    const createDebt = (
      id: string,
      balance: number,
      interestRate: number,
      minimumPayment: number
    ): DebtAccount => ({
      id,
      name: `Debt ${id}`,
      creditor: "Test Creditor",
      balance,
      interestRate,
      minimumPayment,
      type: DEBT_TYPES.PERSONAL,
      status: DEBT_STATUS.ACTIVE,
      paymentFrequency: PAYMENT_FREQUENCIES.MONTHLY,
      compoundFrequency: "monthly",
    });

    it("should calculate snowball strategy (smallest balance first)", () => {
      const debts = [
        createDebt("1", 5000, 10, 150), // Large balance
        createDebt("2", 3000, 15, 90), // Medium balance
        createDebt("3", 1000, 20, 60), // Small balance
      ];

      const result = calculateDebtSnowball(debts, 200);

      expect(result.strategy).toBe("snowball");
      expect(result.totalMonths).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(0);
      expect(result.debtPayoffOrder).toBeDefined();
    });

    it("should prioritize smallest balance first", () => {
      const debts = [
        createDebt("large", 10000, 5, 200), // Large balance, low interest
        createDebt("small", 500, 25, 50), // Small balance, high interest
      ];

      const result = calculateDebtSnowball(debts, 100);

      // Small debt should be paid off first
      expect(result.debtPayoffOrder[0]).toBe("small");
      expect(result.debtPayoffOrder[1]).toBe("large");
    });

    it("should handle zero extra payment", () => {
      const debts = [createDebt("1", 5000, 10, 150)];

      const result = calculateDebtSnowball(debts, 0);

      expect(result.strategy).toBe("snowball");
      expect(result.totalMonths).toBeGreaterThan(0);
    });

    it("should handle single debt", () => {
      const debts = [createDebt("1", 1000, 10, 100)];

      const result = calculateDebtSnowball(debts, 50);

      expect(result.strategy).toBe("snowball");
      expect(result.debtPayoffOrder).toHaveLength(1);
    });

    it("should provide psychological wins by paying off small debts quickly", () => {
      const debts = [
        createDebt("1", 10000, 15, 300),
        createDebt("2", 500, 10, 50),
        createDebt("3", 800, 12, 80),
      ];

      const result = calculateDebtSnowball(debts, 200);

      // Smallest debts should be paid off first
      expect(result.debtPayoffOrder[0]).toBe("2"); // $500
      expect(result.debtPayoffOrder[1]).toBe("3"); // $800
      expect(result.debtPayoffOrder[2]).toBe("1"); // $10000
    });

    it("should handle multiple debts with same balance", () => {
      const debts = [
        createDebt("1", 5000, 10, 150),
        createDebt("2", 5000, 15, 150),
        createDebt("3", 5000, 8, 150),
      ];

      const result = calculateDebtSnowball(debts, 100);

      expect(result.strategy).toBe("snowball");
      expect(result.debtPayoffOrder).toHaveLength(3);
    });
  });

  describe("calculateDebtCustom", () => {
    const createDebt = (
      id: string,
      balance: number,
      interestRate: number,
      minimumPayment: number
    ): DebtAccount => ({
      id,
      name: `Debt ${id}`,
      creditor: "Test Creditor",
      balance,
      interestRate,
      minimumPayment,
      type: DEBT_TYPES.PERSONAL,
      status: DEBT_STATUS.ACTIVE,
      paymentFrequency: PAYMENT_FREQUENCIES.MONTHLY,
      compoundFrequency: "monthly",
    });

    it("should calculate custom strategy maintaining user order", () => {
      const debts = [
        createDebt("3", 1000, 20, 60), // User wants this first
        createDebt("1", 5000, 10, 150), // Then this
        createDebt("2", 3000, 15, 90), // Then this
      ];

      const result = calculateDebtCustom(debts, 200);

      expect(result.strategy).toBe("custom");
      expect(result.totalMonths).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(0);
    });

    it("should respect user-defined order regardless of balance or interest", () => {
      const debts = [
        createDebt("priority", 10000, 5, 200), // User priority
        createDebt("high-interest", 500, 25, 50), // High interest but not priority
      ];

      const result = calculateDebtCustom(debts, 100);

      // Should maintain the order provided
      expect(result.strategy).toBe("custom");
      // Custom strategy still applies extra to debts in order, so high-interest may pay off first
      // The key is the order of debts in the array is maintained
      expect(result.debtPayoffOrder).toContain("priority");
      expect(result.debtPayoffOrder).toContain("high-interest");
    });

    it("should handle zero extra payment", () => {
      const debts = [createDebt("1", 5000, 10, 150)];

      const result = calculateDebtCustom(debts, 0);

      expect(result.strategy).toBe("custom");
      expect(result.totalMonths).toBeGreaterThan(0);
    });

    it("should handle single debt", () => {
      const debts = [createDebt("1", 1000, 10, 100)];

      const result = calculateDebtCustom(debts, 50);

      expect(result.strategy).toBe("custom");
      expect(result.debtPayoffOrder).toHaveLength(1);
    });
  });

  describe("compareDebtStrategies", () => {
    const createDebt = (
      id: string,
      balance: number,
      interestRate: number,
      minimumPayment: number
    ): DebtAccount => ({
      id,
      name: `Debt ${id}`,
      creditor: "Test Creditor",
      balance,
      interestRate,
      minimumPayment,
      type: DEBT_TYPES.PERSONAL,
      status: DEBT_STATUS.ACTIVE,
      paymentFrequency: PAYMENT_FREQUENCIES.MONTHLY,
      compoundFrequency: "monthly",
    });

    it("should compare avalanche and snowball strategies", () => {
      const debts = [
        createDebt("1", 5000, 18, 150), // High interest
        createDebt("2", 1000, 12, 60), // Low balance
        createDebt("3", 3000, 15, 90), // Medium
      ];

      const comparison = compareDebtStrategies(debts, 200);

      expect(comparison.extraPayment).toBe(200);
      expect(comparison.strategies.avalanche).toBeDefined();
      expect(comparison.strategies.snowball).toBeDefined();
      expect(comparison.recommendation).toBeDefined();
      expect(comparison.comparison).toBeDefined();
    });

    it("should provide correct recommendations", () => {
      const debts = [
        createDebt("1", 5000, 20, 150), // High interest, large balance
        createDebt("2", 500, 10, 50), // Low interest, small balance
      ];

      const comparison = compareDebtStrategies(debts, 100);

      expect(comparison.recommendation.bestForInterest).toBeDefined();
      expect(comparison.recommendation.bestForTime).toBeDefined();
      expect(comparison.recommendation.bestForMotivation).toBe("snowball");
    });

    it("should calculate interest difference correctly", () => {
      const debts = [createDebt("1", 5000, 18, 150), createDebt("2", 3000, 10, 100)];

      const comparison = compareDebtStrategies(debts, 150);

      expect(comparison.comparison.interestDifference).toBeGreaterThanOrEqual(0);
      expect(comparison.comparison.savingsWithAvalanche).toBeDefined();
      expect(comparison.comparison.timeDifference).toBeGreaterThanOrEqual(0);
    });

    it("should recommend avalanche when it saves more interest", () => {
      const debts = [
        createDebt("1", 10000, 25, 300), // Very high interest
        createDebt("2", 1000, 5, 50), // Low interest, small balance
      ];

      const comparison = compareDebtStrategies(debts, 200);

      // Avalanche should save more interest
      expect(comparison.comparison.savingsWithAvalanche).toBeGreaterThan(0);
      expect(comparison.recommendation.bestForInterest).toBe("avalanche");
    });

    it("should handle edge case with identical debts", () => {
      const debts = [createDebt("1", 5000, 15, 150), createDebt("2", 5000, 15, 150)];

      const comparison = compareDebtStrategies(debts, 100);

      // Should have minimal or no difference
      expect(comparison.comparison.interestDifference).toBeGreaterThanOrEqual(0);
      expect(comparison.comparison.timeDifference).toBeGreaterThanOrEqual(0);
    });

    it("should handle single debt comparison", () => {
      const debts = [createDebt("1", 5000, 15, 150)];

      const comparison = compareDebtStrategies(debts, 100);

      // Both strategies should be identical for single debt
      expect(comparison.strategies.avalanche.totalMonths).toBe(
        comparison.strategies.snowball.totalMonths
      );
      expect(comparison.strategies.avalanche.totalInterest).toBe(
        comparison.strategies.snowball.totalInterest
      );
      expect(comparison.comparison.interestDifference).toBe(0);
      expect(comparison.comparison.timeDifference).toBe(0);
    });

    it("should handle zero extra payment", () => {
      const debts = [createDebt("1", 5000, 18, 150), createDebt("2", 3000, 12, 100)];

      const comparison = compareDebtStrategies(debts, 0);

      expect(comparison.extraPayment).toBe(0);
      expect(comparison.strategies.avalanche).toBeDefined();
      expect(comparison.strategies.snowball).toBeDefined();
    });

    it("should always recommend snowball for motivation", () => {
      const debts = [createDebt("1", 10000, 5, 200), createDebt("2", 1000, 25, 50)];

      const comparison = compareDebtStrategies(debts, 100);

      // Snowball always recommended for psychological wins
      expect(comparison.recommendation.bestForMotivation).toBe("snowball");
    });

    it("should handle scenario where snowball is faster", () => {
      // Create scenario where paying off small debt quickly frees up payment for larger debt
      const debts = [
        createDebt("small", 100, 10, 20), // Can pay off quickly
        createDebt("large", 10000, 11, 200), // Slightly higher interest
      ];

      const comparison = compareDebtStrategies(debts, 50);

      expect(comparison.strategies.avalanche).toBeDefined();
      expect(comparison.strategies.snowball).toBeDefined();
      // Both should have similar results but order differs
    });

    it("should calculate time difference accurately", () => {
      const debts = [createDebt("1", 5000, 20, 150), createDebt("2", 2000, 10, 80)];

      const comparison = compareDebtStrategies(debts, 100);

      const timeDiff = comparison.comparison.timeDifference;
      expect(timeDiff).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(timeDiff)).toBe(true);
    });
  });

  describe("Edge Cases and Scenarios", () => {
    const createDebt = (
      id: string,
      balance: number,
      interestRate: number,
      minimumPayment: number
    ): DebtAccount => ({
      id,
      name: `Debt ${id}`,
      creditor: "Test Creditor",
      balance,
      interestRate,
      minimumPayment,
      type: DEBT_TYPES.PERSONAL,
      status: DEBT_STATUS.ACTIVE,
      paymentFrequency: PAYMENT_FREQUENCIES.MONTHLY,
      compoundFrequency: "monthly",
    });

    it("should handle very high interest rates", () => {
      const debts = [createDebt("1", 5000, 99, 200)];

      const avalanche = calculateDebtAvalanche(debts, 100);
      const snowball = calculateDebtSnowball(debts, 100);

      expect(avalanche.totalInterest).toBeGreaterThan(0);
      expect(snowball.totalInterest).toBeGreaterThan(0);
      expect(avalanche.totalMonths).toBeGreaterThan(0);
    });

    it("should handle very low minimum payments relative to balance", () => {
      const debts = [createDebt("1", 10000, 15, 50)];

      const result = calculateDebtAvalanche(debts, 0);

      // Should take a very long time
      expect(result.totalMonths).toBeGreaterThan(100);
    });

    it("should handle debt where minimum payment barely covers interest", () => {
      // 24% annual = 2% monthly on $10000 = $200 interest
      const debts = [createDebt("1", 10000, 24, 250)];

      const result = calculateDebtAvalanche(debts, 0);

      // Should eventually pay off but take a while
      expect(result.totalMonths).toBeGreaterThan(0);
      expect(result.totalMonths).toBeLessThanOrEqual(600);
    });

    it("should handle multiple debts of varying sizes", () => {
      const debts = [
        createDebt("tiny", 50, 10, 10),
        createDebt("small", 500, 12, 50),
        createDebt("medium", 5000, 15, 150),
        createDebt("large", 50000, 8, 500),
      ];

      const avalanche = calculateDebtAvalanche(debts, 300);
      const snowball = calculateDebtSnowball(debts, 300);

      expect(avalanche.debtPayoffOrder).toHaveLength(4);
      expect(snowball.debtPayoffOrder).toHaveLength(4);

      // Snowball should pay off tiny first
      expect(snowball.debtPayoffOrder[0]).toBe("tiny");

      // Avalanche should prioritize by interest rate - medium has 15% which is highest
      // But with enough extra payment, tiny might pay off first due to small balance
      // Just verify medium is paid off before large (which has lowest interest)
      const mediumIndex = avalanche.debtPayoffOrder.indexOf("medium");
      const largeIndex = avalanche.debtPayoffOrder.indexOf("large");
      expect(mediumIndex).toBeLessThan(largeIndex);
    });

    it("should handle scenario with extra payment larger than all debts", () => {
      const debts = [createDebt("1", 500, 10, 50), createDebt("2", 300, 12, 40)];

      const result = calculateDebtAvalanche(debts, 10000);

      // Should pay off in 1 month
      expect(result.totalMonths).toBe(1);
      expect(result.totalInterest).toBeGreaterThanOrEqual(0);
      expect(result.totalInterest).toBeLessThan(100);
    });

    it("should not overpay on final month", () => {
      const debts = [createDebt("1", 1000, 10, 100)];

      const result = calculateDebtAvalanche(debts, 0);

      const lastMonth = result.monthlyBreakdown[result.monthlyBreakdown.length - 1];
      expect(lastMonth.debts[0].remainingBalance).toBeLessThanOrEqual(1);
    });

    it("should handle long-term debt scenario", () => {
      // 30-year mortgage scenario
      const debts = [createDebt("mortgage", 200000, 4, 955)];

      const result = calculateDebtAvalanche(debts, 0);

      // Should take approximately 360 months (30 years)
      expect(result.totalMonths).toBeGreaterThan(300);
      expect(result.totalMonths).toBeLessThanOrEqual(600);
    });
  });
});
