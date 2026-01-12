import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { calculatePayoffProjection } from "../payoffProjection";

describe("calculatePayoffProjection", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("valid debt payoff scenarios", () => {
    it("should calculate payoff projection for a standard debt", () => {
      const debt = {
        currentBalance: 10000,
        minimumPayment: 300,
        interestRate: 18,
      };

      const result = calculatePayoffProjection(debt);

      expect(result.monthsToPayoff).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(0);
      expect(result.payoffDate).toBeTruthy();
      expect(typeof result.payoffDate).toBe("string");
    });

    it("should calculate payoff projection with string inputs", () => {
      const debt = {
        currentBalance: "5000",
        minimumPayment: "200",
        interestRate: "12",
      };

      const result = calculatePayoffProjection(debt);

      expect(result.monthsToPayoff).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(0);
      expect(result.payoffDate).toBeTruthy();
    });

    it("should calculate correct months to payoff", () => {
      const debt = {
        currentBalance: 1000,
        minimumPayment: 100,
        interestRate: 10,
      };

      const result = calculatePayoffProjection(debt);

      // With low interest and high payment, should pay off quickly
      expect(result.monthsToPayoff).toBeLessThan(15);
      expect(result.monthsToPayoff).toBeGreaterThan(0);
    });

    it("should calculate payoff date correctly based on months", () => {
      const debt = {
        currentBalance: 1200,
        minimumPayment: 100,
        interestRate: 0.1, // Very low interest
      };

      const result = calculatePayoffProjection(debt);

      expect(result.monthsToPayoff).toBeGreaterThan(0);
      expect(result.payoffDate).toBeTruthy();

      // Verify payoff date is in the future
      const payoffDate = new Date(result.payoffDate!);
      const currentDate = new Date("2024-01-15T00:00:00.000Z");
      expect(payoffDate.getTime()).toBeGreaterThan(currentDate.getTime());
    });

    it("should handle mixed numeric and string inputs", () => {
      const debt = {
        currentBalance: "3000",
        minimumPayment: 150,
        interestRate: "8.5",
      };

      const result = calculatePayoffProjection(debt);

      expect(result.monthsToPayoff).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(0);
      expect(result.payoffDate).toBeTruthy();
    });
  });

  describe("invalid or missing data scenarios", () => {
    it("should return null projection when currentBalance is 0", () => {
      const debt = {
        currentBalance: 0,
        minimumPayment: 200,
        interestRate: 10,
      };

      const result = calculatePayoffProjection(debt);

      expect(result).toEqual({
        monthsToPayoff: null,
        totalInterest: null,
        payoffDate: null,
      });
    });

    it("should return null projection when currentBalance is negative", () => {
      const debt = {
        currentBalance: -1000,
        minimumPayment: 200,
        interestRate: 10,
      };

      const result = calculatePayoffProjection(debt);

      expect(result).toEqual({
        monthsToPayoff: null,
        totalInterest: null,
        payoffDate: null,
      });
    });

    it("should return null projection when currentBalance is missing", () => {
      const debt = {
        minimumPayment: 200,
        interestRate: 10,
      };

      const result = calculatePayoffProjection(debt);

      expect(result).toEqual({
        monthsToPayoff: null,
        totalInterest: null,
        payoffDate: null,
      });
    });

    it("should return null projection when minimumPayment is 0", () => {
      const debt = {
        currentBalance: 5000,
        minimumPayment: 0,
        interestRate: 10,
      };

      const result = calculatePayoffProjection(debt);

      expect(result).toEqual({
        monthsToPayoff: null,
        totalInterest: null,
        payoffDate: null,
      });
    });

    it("should return null projection when minimumPayment is negative", () => {
      const debt = {
        currentBalance: 5000,
        minimumPayment: -100,
        interestRate: 10,
      };

      const result = calculatePayoffProjection(debt);

      expect(result).toEqual({
        monthsToPayoff: null,
        totalInterest: null,
        payoffDate: null,
      });
    });

    it("should return null projection when minimumPayment is missing", () => {
      const debt = {
        currentBalance: 5000,
        interestRate: 10,
      };

      const result = calculatePayoffProjection(debt);

      expect(result).toEqual({
        monthsToPayoff: null,
        totalInterest: null,
        payoffDate: null,
      });
    });

    it("should return null projection when interestRate is 0", () => {
      const debt = {
        currentBalance: 5000,
        minimumPayment: 200,
        interestRate: 0,
      };

      const result = calculatePayoffProjection(debt);

      expect(result).toEqual({
        monthsToPayoff: null,
        totalInterest: null,
        payoffDate: null,
      });
    });

    it("should return null projection when interestRate is negative", () => {
      const debt = {
        currentBalance: 5000,
        minimumPayment: 200,
        interestRate: -5,
      };

      const result = calculatePayoffProjection(debt);

      expect(result).toEqual({
        monthsToPayoff: null,
        totalInterest: null,
        payoffDate: null,
      });
    });

    it("should return null projection when interestRate is missing", () => {
      const debt = {
        currentBalance: 5000,
        minimumPayment: 200,
      };

      const result = calculatePayoffProjection(debt);

      expect(result).toEqual({
        monthsToPayoff: null,
        totalInterest: null,
        payoffDate: null,
      });
    });

    it("should handle empty object input", () => {
      const debt = {};

      const result = calculatePayoffProjection(debt);

      expect(result).toEqual({
        monthsToPayoff: null,
        totalInterest: null,
        payoffDate: null,
      });
    });
  });

  describe("payment doesn't cover interest scenarios", () => {
    it("should return null projection when payment equals monthly interest", () => {
      const debt = {
        currentBalance: 10000,
        minimumPayment: 50, // 10000 * (0.06 / 12) = 50
        interestRate: 6,
      };

      const result = calculatePayoffProjection(debt);

      expect(result).toEqual({
        monthsToPayoff: null,
        totalInterest: null,
        payoffDate: null,
      });
    });

    it("should return null projection when payment is less than monthly interest", () => {
      const debt = {
        currentBalance: 20000,
        minimumPayment: 50, // Monthly interest would be ~333 at 20% rate
        interestRate: 20,
      };

      const result = calculatePayoffProjection(debt);

      expect(result).toEqual({
        monthsToPayoff: null,
        totalInterest: null,
        payoffDate: null,
      });
    });

    it("should return valid projection when payment covers more than interest", () => {
      const debt = {
        currentBalance: 15000,
        minimumPayment: 250, // Monthly interest: 15000 * (0.18 / 12) = 225
        interestRate: 18,
      };

      const result = calculatePayoffProjection(debt);

      // Payment covers interest, so should calculate
      expect(result.monthsToPayoff).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(0);
      expect(result.payoffDate).toBeTruthy();
    });
  });

  describe("log calculation edge cases", () => {
    it("should return null when logValue is 0", () => {
      // This happens when (currentBalance * monthlyRate) / minimumPayment = 1
      const debt = {
        currentBalance: 12000,
        minimumPayment: 100, // 12000 * (0.10 / 12) = 100
        interestRate: 10,
      };

      const result = calculatePayoffProjection(debt);

      expect(result).toEqual({
        monthsToPayoff: null,
        totalInterest: null,
        payoffDate: null,
      });
    });

    it("should return null when logValue is 0", () => {
      // This happens when (currentBalance * monthlyRate) / minimumPayment = 1
      const debt = {
        currentBalance: 12000,
        minimumPayment: 100, // 12000 * (0.10 / 12) = 100
        interestRate: 10,
      };

      const result = calculatePayoffProjection(debt);

      expect(result).toEqual({
        monthsToPayoff: null,
        totalInterest: null,
        payoffDate: null,
      });
    });

    it("should return null when logValue is negative", () => {
      // This can happen with very high balance and very low payment relative to interest
      const debt = {
        currentBalance: 100000,
        minimumPayment: 500, // Monthly interest: 100000 * (0.15 / 12) = 1250
        interestRate: 15,
      };

      const result = calculatePayoffProjection(debt);

      expect(result).toEqual({
        monthsToPayoff: null,
        totalInterest: null,
        payoffDate: null,
      });
    });

    it("should handle edge case with floating point precision where logValue could be zero", () => {
      // This tests defensive code at line 50-55 for logValue <= 0
      // In theory, this is caught by the earlier check, but we test it for completeness

      // Use very precise numbers to potentially trigger floating point edge cases
      const debt = {
        currentBalance: 999999.99,
        minimumPayment: 8333.3333, // Trying to match monthly interest exactly
        interestRate: 10.000001,
      };

      const result = calculatePayoffProjection(debt);

      // Should return null (either from first check or second check)
      expect(result.monthsToPayoff).toBeNull();
      expect(result.totalInterest).toBeNull();
      expect(result.payoffDate).toBeNull();
    });

    it("should calculate when logValue is positive and valid", () => {
      const debt = {
        currentBalance: 5000,
        minimumPayment: 250, // Monthly interest: 5000 * (0.12 / 12) = 50
        interestRate: 12,
      };

      const result = calculatePayoffProjection(debt);

      expect(result.monthsToPayoff).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(0);
      expect(result.payoffDate).toBeTruthy();
    });
  });

  describe("calculatedMonths validation", () => {
    it("should return null when calculatedMonths is not finite", () => {
      // Mock Math.log to return a value that makes calculatedMonths infinite
      const logSpy = vi.spyOn(Math, "log").mockReturnValue(Infinity);

      const debt = {
        currentBalance: 5000,
        minimumPayment: 200,
        interestRate: 10,
      };

      const result = calculatePayoffProjection(debt);

      expect(result).toEqual({
        monthsToPayoff: null,
        totalInterest: null,
        payoffDate: null,
      });

      logSpy.mockRestore();
    });

    it("should return null when calculatedMonths is negative", () => {
      // Mock Math.ceil to return negative value
      const ceilSpy = vi.spyOn(Math, "ceil").mockReturnValue(-5);

      const debt = {
        currentBalance: 5000,
        minimumPayment: 200,
        interestRate: 10,
      };

      const result = calculatePayoffProjection(debt);

      expect(result).toEqual({
        monthsToPayoff: null,
        totalInterest: null,
        payoffDate: null,
      });

      ceilSpy.mockRestore();
    });

    it("should return null when calculatedMonths is 0", () => {
      // Mock Math.ceil to return 0
      const ceilSpy = vi.spyOn(Math, "ceil").mockReturnValue(0);

      const debt = {
        currentBalance: 5000,
        minimumPayment: 200,
        interestRate: 10,
      };

      const result = calculatePayoffProjection(debt);

      expect(result).toEqual({
        monthsToPayoff: null,
        totalInterest: null,
        payoffDate: null,
      });

      ceilSpy.mockRestore();
    });
  });

  describe("calculatedInterest validation", () => {
    it("should return partial projection when calculatedInterest is negative", () => {
      // This shouldn't normally happen, but testing the validation path
      // When payment * months < balance, calculatedInterest will be negative
      // Mock the calculation to force 1 month
      const ceilSpy = vi.spyOn(Math, "ceil").mockReturnValue(1);

      const debt = {
        currentBalance: 10000,
        minimumPayment: 5000,
        interestRate: 0.01,
      };

      const result = calculatePayoffProjection(debt);

      ceilSpy.mockRestore();

      // With forced 1 month and 5000 payment, totalPayments = 5000
      // calculatedInterest = 5000 - 10000 = -5000 (negative)
      expect(result.monthsToPayoff).toBe(1);
      expect(result.totalInterest).toBeNull();
      expect(result.payoffDate).toBeNull();
    });

    it("should return partial projection when calculatedInterest is not finite", () => {
      const ceilSpy = vi.spyOn(Math, "ceil").mockReturnValue(Infinity);

      const debt = {
        currentBalance: 5000,
        minimumPayment: 200,
        interestRate: 10,
      };

      // First, bypass the calculatedMonths check
      const result = calculatePayoffProjection(debt);

      ceilSpy.mockRestore();

      // Should fail at calculatedMonths validation
      expect(result.monthsToPayoff).toBeNull();
    });
  });

  describe("try-catch error handling", () => {
    it("should handle errors in calculation and return null projection", () => {
      // Mock Math.log to throw an error
      const logSpy = vi.spyOn(Math, "log").mockImplementation(() => {
        throw new Error("Calculation error");
      });

      const debt = {
        currentBalance: 5000,
        minimumPayment: 200,
        interestRate: 10,
      };

      const result = calculatePayoffProjection(debt);

      expect(result).toEqual({
        monthsToPayoff: null,
        totalInterest: null,
        payoffDate: null,
      });

      logSpy.mockRestore();
    });

    it("should handle errors during date calculation", () => {
      // Use real timers for this test
      vi.useRealTimers();

      // This test verifies the function doesn't crash on date operations
      const debt = {
        currentBalance: 1000,
        minimumPayment: 100,
        interestRate: 5,
      };

      const result = calculatePayoffProjection(debt);

      // Should successfully calculate even with date operations
      expect(result.monthsToPayoff).toBeGreaterThan(0);
      expect(result.payoffDate).toBeTruthy();
      expect(() => new Date(result.payoffDate!)).not.toThrow();

      // Restore fake timers
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-01-15T00:00:00.000Z"));
    });
  });

  describe("date calculation", () => {
    it("should calculate payoff date correctly for short term debt", () => {
      // Use real timers for this test
      vi.useRealTimers();

      const debt = {
        currentBalance: 1200,
        minimumPayment: 400,
        interestRate: 12,
      };

      const result = calculatePayoffProjection(debt);

      const payoffDate = new Date(result.payoffDate!);
      const currentDate = new Date();

      // Should be a few months in the future
      expect(payoffDate.getTime()).toBeGreaterThan(currentDate.getTime());
      expect(result.monthsToPayoff).toBeLessThan(6);

      // Restore fake timers
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-01-15T00:00:00.000Z"));
    });

    it("should calculate payoff date correctly for long term debt", () => {
      // Use real timers for this test
      vi.useRealTimers();

      const debt = {
        currentBalance: 50000,
        minimumPayment: 500,
        interestRate: 8,
      };

      const result = calculatePayoffProjection(debt);

      const payoffDate = new Date(result.payoffDate!);
      const currentDate = new Date();

      // Should be many years in the future
      expect(payoffDate.getTime()).toBeGreaterThan(currentDate.getTime());
      expect(result.monthsToPayoff).toBeGreaterThan(100);

      // Restore fake timers
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-01-15T00:00:00.000Z"));
    });

    it("should return ISO string format for payoff date", () => {
      // Use real timers for this test
      vi.useRealTimers();

      const debt = {
        currentBalance: 3000,
        minimumPayment: 300,
        interestRate: 10,
      };

      const result = calculatePayoffProjection(debt);

      expect(result.payoffDate).toBeTruthy();
      expect(typeof result.payoffDate).toBe("string");
      // Should be valid ISO 8601 format
      expect(() => new Date(result.payoffDate!)).not.toThrow();
      expect(result.payoffDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);

      // Restore fake timers
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-01-15T00:00:00.000Z"));
    });
  });

  describe("realistic debt scenarios", () => {
    beforeEach(() => {
      // Use real timers for all realistic debt scenario tests
      vi.useRealTimers();
    });

    afterEach(() => {
      // Restore fake timers after each test
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-01-15T00:00:00.000Z"));
    });

    it("should handle credit card debt scenario", () => {
      const debt = {
        currentBalance: 8500,
        minimumPayment: 250,
        interestRate: 19.99,
      };

      const result = calculatePayoffProjection(debt);

      expect(result.monthsToPayoff).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(0);
      expect(result.payoffDate).toBeTruthy();

      // Verify interest is significant for high-rate debt
      expect(result.totalInterest!).toBeGreaterThan(500);
    });

    it("should handle auto loan scenario", () => {
      const debt = {
        currentBalance: 25000,
        minimumPayment: 450,
        interestRate: 4.5,
      };

      const result = calculatePayoffProjection(debt);

      expect(result.monthsToPayoff).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(0);
      expect(result.payoffDate).toBeTruthy();

      // Auto loan should pay off in reasonable time (5-7 years typical)
      expect(result.monthsToPayoff).toBeLessThan(90);
    });

    it("should handle personal loan scenario", () => {
      const debt = {
        currentBalance: 15000,
        minimumPayment: 450,
        interestRate: 9.5,
      };

      const result = calculatePayoffProjection(debt);

      expect(result.monthsToPayoff).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(0);
      expect(result.payoffDate).toBeTruthy();
    });

    it("should handle mortgage scenario with low rate", () => {
      const debt = {
        currentBalance: 250000,
        minimumPayment: 1500,
        interestRate: 3.5,
      };

      const result = calculatePayoffProjection(debt);

      expect(result.monthsToPayoff).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(0);
      expect(result.payoffDate).toBeTruthy();

      // Mortgage typically takes many years
      expect(result.monthsToPayoff).toBeGreaterThan(200);
    });

    it("should handle student loan scenario", () => {
      const debt = {
        currentBalance: 35000,
        minimumPayment: 350,
        interestRate: 5.8,
      };

      const result = calculatePayoffProjection(debt);

      expect(result.monthsToPayoff).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(0);
      expect(result.payoffDate).toBeTruthy();
    });
  });

  describe("edge cases with very small or large values", () => {
    beforeEach(() => {
      // Use real timers for these tests
      vi.useRealTimers();
    });

    afterEach(() => {
      // Restore fake timers
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-01-15T00:00:00.000Z"));
    });

    it("should handle very small balance", () => {
      const debt = {
        currentBalance: 10,
        minimumPayment: 5,
        interestRate: 10,
      };

      const result = calculatePayoffProjection(debt);

      expect(result.monthsToPayoff).toBeGreaterThan(0);
      expect(result.monthsToPayoff).toBeLessThan(5);
      expect(result.totalInterest!).toBeGreaterThanOrEqual(0);
    });

    it("should handle very large balance", () => {
      const debt = {
        currentBalance: 1000000,
        minimumPayment: 10000,
        interestRate: 6,
      };

      const result = calculatePayoffProjection(debt);

      expect(result.monthsToPayoff).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(0);
      expect(result.payoffDate).toBeTruthy();
    });

    it("should handle very low interest rate", () => {
      const debt = {
        currentBalance: 5000,
        minimumPayment: 200,
        interestRate: 0.01,
      };

      const result = calculatePayoffProjection(debt);

      expect(result.monthsToPayoff).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(0);
      // With very low interest, should pay off in ~25 months
      expect(result.monthsToPayoff).toBeLessThan(30);
    });

    it("should handle very high interest rate", () => {
      const debt = {
        currentBalance: 5000,
        minimumPayment: 500,
        interestRate: 35,
      };

      const result = calculatePayoffProjection(debt);

      expect(result.monthsToPayoff).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(0);
      // High interest means more interest paid
      expect(result.totalInterest!).toBeGreaterThan(500);
    });
  });

  describe("data type parsing", () => {
    beforeEach(() => {
      // Use real timers for these tests
      vi.useRealTimers();
    });

    afterEach(() => {
      // Restore fake timers
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-01-15T00:00:00.000Z"));
    });

    it("should parse numeric string values correctly", () => {
      const debt = {
        currentBalance: "12345.67",
        minimumPayment: "234.56",
        interestRate: "8.99",
      };

      const result = calculatePayoffProjection(debt);

      expect(result.monthsToPayoff).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(0);
      expect(result.payoffDate).toBeTruthy();
    });

    it("should handle whitespace in string values", () => {
      const debt = {
        currentBalance: " 5000 ",
        minimumPayment: " 200 ",
        interestRate: " 10 ",
      };

      const result = calculatePayoffProjection(debt);

      expect(result.monthsToPayoff).toBeGreaterThan(0);
    });

    it("should handle non-numeric strings as 0", () => {
      const debt = {
        currentBalance: "abc",
        minimumPayment: "def",
        interestRate: "ghi",
      };

      const result = calculatePayoffProjection(debt);

      expect(result).toEqual({
        monthsToPayoff: null,
        totalInterest: null,
        payoffDate: null,
      });
    });

    it("should handle partial numeric strings", () => {
      const debt = {
        currentBalance: "5000abc",
        minimumPayment: "200xyz",
        interestRate: "10%",
      };

      const result = calculatePayoffProjection(debt);

      // parseFloat will parse "5000" from "5000abc"
      expect(result.monthsToPayoff).toBeGreaterThan(0);
    });

    it("should handle undefined values in object", () => {
      const debt = {
        currentBalance: undefined,
        minimumPayment: undefined,
        interestRate: undefined,
      };

      const result = calculatePayoffProjection(debt);

      expect(result).toEqual({
        monthsToPayoff: null,
        totalInterest: null,
        payoffDate: null,
      });
    });

    it("should handle null values in object", () => {
      const debt = {
        currentBalance: null,
        minimumPayment: null,
        interestRate: null,
      };

      const result = calculatePayoffProjection(debt);

      expect(result).toEqual({
        monthsToPayoff: null,
        totalInterest: null,
        payoffDate: null,
      });
    });
  });
});
