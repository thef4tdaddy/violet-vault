import { describe, it, expect } from "vitest";
import { calculateInterestPortion } from "../interestCalculation";

describe("interestCalculation", () => {
  describe("calculateInterestPortion", () => {
    it("should calculate interest portion correctly for typical debt", () => {
      const debt = {
        interestRate: 18, // 18% APR
        currentBalance: 1000,
      };
      const paymentAmount = 100;

      // Monthly rate = 18% / 100 / 12 = 0.015
      // Interest = 1000 * 0.015 = 15
      const result = calculateInterestPortion(debt, paymentAmount);
      expect(result).toBe(15);
    });

    it("should calculate interest portion for different APR", () => {
      const debt = {
        interestRate: 24, // 24% APR
        currentBalance: 5000,
      };
      const paymentAmount = 200;

      // Monthly rate = 24% / 100 / 12 = 0.02
      // Interest = 5000 * 0.02 = 100
      const result = calculateInterestPortion(debt, paymentAmount);
      expect(result).toBe(100);
    });

    it("should cap interest at payment amount when interest exceeds payment", () => {
      const debt = {
        interestRate: 60, // 60% APR (very high)
        currentBalance: 10000,
      };
      const paymentAmount = 100;

      // Monthly rate = 60% / 100 / 12 = 0.05
      // Interest = 10000 * 0.05 = 500
      // But payment is only 100, so should return 100
      const result = calculateInterestPortion(debt, paymentAmount);
      expect(result).toBe(100);
    });

    it("should return 0 when interestRate is missing", () => {
      const debt = {
        currentBalance: 1000,
      };
      const paymentAmount = 100;

      const result = calculateInterestPortion(debt, paymentAmount);
      expect(result).toBe(0);
    });

    it("should return 0 when interestRate is 0", () => {
      const debt = {
        interestRate: 0,
        currentBalance: 1000,
      };
      const paymentAmount = 100;

      const result = calculateInterestPortion(debt, paymentAmount);
      expect(result).toBe(0);
    });

    it("should return 0 when interestRate is undefined", () => {
      const debt = {
        interestRate: undefined,
        currentBalance: 1000,
      };
      const paymentAmount = 100;

      const result = calculateInterestPortion(debt, paymentAmount);
      expect(result).toBe(0);
    });

    it("should return 0 when currentBalance is missing", () => {
      const debt = {
        interestRate: 18,
      };
      const paymentAmount = 100;

      const result = calculateInterestPortion(debt, paymentAmount);
      expect(result).toBe(0);
    });

    it("should return 0 when currentBalance is 0", () => {
      const debt = {
        interestRate: 18,
        currentBalance: 0,
      };
      const paymentAmount = 100;

      const result = calculateInterestPortion(debt, paymentAmount);
      expect(result).toBe(0);
    });

    it("should return 0 when currentBalance is undefined", () => {
      const debt = {
        interestRate: 18,
        currentBalance: undefined,
      };
      const paymentAmount = 100;

      const result = calculateInterestPortion(debt, paymentAmount);
      expect(result).toBe(0);
    });

    it("should return 0 when both interestRate and currentBalance are missing", () => {
      const debt = {};
      const paymentAmount = 100;

      const result = calculateInterestPortion(debt, paymentAmount);
      expect(result).toBe(0);
    });

    it("should handle small balance amounts", () => {
      const debt = {
        interestRate: 18,
        currentBalance: 10,
      };
      const paymentAmount = 5;

      // Monthly rate = 18% / 100 / 12 = 0.015
      // Interest = 10 * 0.015 = 0.15
      const result = calculateInterestPortion(debt, paymentAmount);
      expect(result).toBe(0.15);
    });

    it("should handle large balance amounts", () => {
      const debt = {
        interestRate: 12,
        currentBalance: 100000,
      };
      const paymentAmount = 2000;

      // Monthly rate = 12% / 100 / 12 = 0.01
      // Interest = 100000 * 0.01 = 1000
      const result = calculateInterestPortion(debt, paymentAmount);
      expect(result).toBe(1000);
    });

    it("should handle low interest rates", () => {
      const debt = {
        interestRate: 3, // 3% APR (typical mortgage rate)
        currentBalance: 200000,
      };
      const paymentAmount = 1500;

      // Monthly rate = 3% / 100 / 12 = 0.0025
      // Interest = 200000 * 0.0025 = 500
      const result = calculateInterestPortion(debt, paymentAmount);
      expect(result).toBe(500);
    });

    it("should handle decimal interest rates", () => {
      const debt = {
        interestRate: 15.99, // 15.99% APR
        currentBalance: 3000,
      };
      const paymentAmount = 150;

      // Monthly rate = 15.99% / 100 / 12 = 0.013325
      // Interest = 3000 * 0.013325 = 39.975
      const result = calculateInterestPortion(debt, paymentAmount);
      expect(result).toBeCloseTo(39.975, 3);
    });

    it("should handle decimal balance amounts", () => {
      const debt = {
        interestRate: 18,
        currentBalance: 1234.56,
      };
      const paymentAmount = 100;

      // Monthly rate = 18% / 100 / 12 = 0.015
      // Interest = 1234.56 * 0.015 = 18.5184
      const result = calculateInterestPortion(debt, paymentAmount);
      expect(result).toBeCloseTo(18.5184, 4);
    });

    it("should handle payment amount of 0", () => {
      const debt = {
        interestRate: 18,
        currentBalance: 1000,
      };
      const paymentAmount = 0;

      // Monthly rate = 18% / 100 / 12 = 0.015
      // Interest = 1000 * 0.015 = 15
      // But payment is 0, so should return 0 (min of interest and payment)
      const result = calculateInterestPortion(debt, paymentAmount);
      expect(result).toBe(0);
    });

    it("should handle very small payment amounts", () => {
      const debt = {
        interestRate: 18,
        currentBalance: 1000,
      };
      const paymentAmount = 5;

      // Monthly rate = 18% / 100 / 12 = 0.015
      // Interest = 1000 * 0.015 = 15
      // But payment is only 5, so should return 5
      const result = calculateInterestPortion(debt, paymentAmount);
      expect(result).toBe(5);
    });

    it("should handle exact match of interest and payment", () => {
      const debt = {
        interestRate: 18,
        currentBalance: 1000,
      };
      // Set payment exactly equal to the interest
      // Monthly rate = 18% / 100 / 12 = 0.015
      // Interest = 1000 * 0.015 = 15
      const paymentAmount = 15;

      const result = calculateInterestPortion(debt, paymentAmount);
      expect(result).toBe(15);
    });

    it("should handle interest rate of 100%", () => {
      const debt = {
        interestRate: 100, // 100% APR
        currentBalance: 1200,
      };
      const paymentAmount = 500;

      // Monthly rate = 100% / 100 / 12 = 0.08333...
      // Interest = 1200 * 0.08333... = 100
      const result = calculateInterestPortion(debt, paymentAmount);
      expect(result).toBeCloseTo(100, 2);
    });

    it("should maintain precision for complex calculations", () => {
      const debt = {
        interestRate: 19.99,
        currentBalance: 7543.21,
      };
      const paymentAmount = 250;

      // Monthly rate = 19.99% / 100 / 12 = 0.01665833...
      // Interest = 7543.21 * 0.01665833... ≈ 125.656...
      const result = calculateInterestPortion(debt, paymentAmount);

      // Calculate expected value
      const monthlyRate = 19.99 / 100 / 12;
      const expectedInterest = 7543.21 * monthlyRate;

      expect(result).toBeCloseTo(expectedInterest, 5);
      expect(result).toBeLessThanOrEqual(paymentAmount);
    });

    it("should handle edge case with very high interest exceeding payment many times over", () => {
      const debt = {
        interestRate: 200, // 200% APR (unrealistic but testing edge case)
        currentBalance: 50000,
      };
      const paymentAmount = 50;

      // Monthly rate = 200% / 100 / 12 = 0.16666...
      // Interest = 50000 * 0.16666... ≈ 8333.33
      // But payment is only 50, so should return 50
      const result = calculateInterestPortion(debt, paymentAmount);
      expect(result).toBe(50);
    });
  });
});
