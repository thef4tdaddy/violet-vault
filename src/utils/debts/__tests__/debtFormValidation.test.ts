/**
 * Tests for debt form validation utilities
 */

import {
  validateDebtFormData,
  calculateDebtMetrics,
  formatDebtMetrics,
} from "../debtFormValidation";

describe("validateDebtFormData", () => {
  describe("Basic validation", () => {
    test("should validate required fields", () => {
      const formData = {};
      const result = validateDebtFormData(formData);

      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe("Debt name is required");
      expect(result.errors.creditor).toBe("Creditor name is required");
      expect(result.errors.currentBalance).toBe("Valid current balance is required");
      expect(result.errors.minimumPayment).toBe("Valid minimum payment is required");
    });

    test("should pass validation with valid data", () => {
      const formData = {
        name: "Test Debt",
        creditor: "Test Bank",
        type: "credit_card",
        currentBalance: "1000",
        interestRate: "18.5",
        minimumPayment: "50",
        paymentFrequency: "monthly",
      };

      const result = validateDebtFormData(formData);

      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
      expect(result.parsedData.currentBalance).toBe(1000);
      expect(result.parsedData.interestRate).toBe(18.5);
      expect(result.parsedData.minimumPayment).toBe(50);
    });
  });

  describe("Financial validation", () => {
    test("should validate negative balances", () => {
      const formData = {
        name: "Test",
        creditor: "Bank",
        currentBalance: "-100",
        originalBalance: "-50",
        minimumPayment: "-25",
      };

      const result = validateDebtFormData(formData);

      expect(result.errors.currentBalance).toBe("Valid current balance is required");
      expect(result.errors.originalBalance).toBe("Original balance must be positive");
      expect(result.errors.minimumPayment).toBe("Valid minimum payment is required");
    });

    test("should validate interest rate range", () => {
      const formData = {
        name: "Test",
        creditor: "Bank",
        currentBalance: "1000",
        minimumPayment: "50",
        interestRate: "150", // Invalid: > 100
      };

      const result = validateDebtFormData(formData);

      expect(result.errors.interestRate).toBe("Interest rate must be between 0 and 100");
    });

    test("should handle zero interest rate", () => {
      const formData = {
        name: "Test",
        creditor: "Bank",
        currentBalance: "1000",
        minimumPayment: "50",
        interestRate: "0",
      };

      const result = validateDebtFormData(formData);

      expect(result.isValid).toBe(true);
      expect(result.parsedData.interestRate).toBe(0);
    });
  });

  describe("Business logic warnings", () => {
    test("should warn about very low minimum payments", () => {
      const formData = {
        name: "Test",
        creditor: "Bank",
        currentBalance: "10000",
        minimumPayment: "50", // 0.5% of balance
        interestRate: "18",
      };

      const result = validateDebtFormData(formData);

      expect(result.warnings).toContain(
        "Minimum payment is less than 1% of balance - this will take very long to pay off"
      );
    });

    test("should warn about very high minimum payments", () => {
      const formData = {
        name: "Test",
        creditor: "Bank",
        currentBalance: "1000",
        minimumPayment: "600", // 60% of balance
        interestRate: "18",
      };

      const result = validateDebtFormData(formData);

      expect(result.warnings).toContain(
        "Minimum payment is more than 50% of balance - verify this is correct"
      );
    });

    test("should warn about high interest rates", () => {
      const formData = {
        name: "Test",
        creditor: "Bank",
        currentBalance: "1000",
        minimumPayment: "50",
        interestRate: "29.99",
      };

      const result = validateDebtFormData(formData);

      expect(result.warnings).toContain(
        "Interest rate is very high - consider debt consolidation options"
      );
    });

    test("should warn when current balance exceeds original balance", () => {
      const formData = {
        name: "Test",
        creditor: "Bank",
        currentBalance: "1200",
        originalBalance: "1000",
        minimumPayment: "50",
        interestRate: "18",
      };

      const result = validateDebtFormData(formData);

      expect(result.warnings).toContain(
        "Current balance is higher than original balance - interest and fees may have accrued"
      );
    });
  });

  describe("Data parsing", () => {
    test("should parse numeric fields correctly", () => {
      const formData = {
        name: "Test Debt",
        creditor: "Test Bank",
        currentBalance: "1000.50",
        originalBalance: "1200.75",
        interestRate: "18.25",
        minimumPayment: "75.00",
      };

      const result = validateDebtFormData(formData);

      expect(result.parsedData.currentBalance).toBe(1000.5);
      expect(result.parsedData.originalBalance).toBe(1200.75);
      expect(result.parsedData.interestRate).toBe(18.25);
      expect(result.parsedData.minimumPayment).toBe(75);
    });

    test("should default original balance to current balance when not provided", () => {
      const formData = {
        name: "Test",
        creditor: "Bank",
        currentBalance: "1000",
        minimumPayment: "50",
      };

      const result = validateDebtFormData(formData);

      expect(result.parsedData.originalBalance).toBe(1000);
    });
  });
});

describe("calculateDebtMetrics", () => {
  describe("Basic calculations", () => {
    test("should calculate metrics for standard debt", () => {
      const debtData = {
        currentBalance: 5000,
        originalBalance: 6000,
        interestRate: 18,
        minimumPayment: 150,
        paymentFrequency: "monthly",
      };

      const metrics = calculateDebtMetrics(debtData);

      expect(metrics).toBeTruthy();
      expect(metrics.totalPaid).toBe(1000);
      expect(metrics.paymentToBalanceRatio).toBeCloseTo(0.03);
      expect(metrics.monthsToPayoff).toBeGreaterThan(0);
      expect(metrics.totalInterest).toBeGreaterThan(0);
      expect(metrics.isPaymentSufficient).toBe(true);
      expect(metrics.monthlyInterestCost).toBeCloseTo(75);
    });

    test("should handle zero interest debt", () => {
      const debtData = {
        currentBalance: 1000,
        originalBalance: 1000,
        interestRate: 0,
        minimumPayment: 100,
        paymentFrequency: "monthly",
      };

      const metrics = calculateDebtMetrics(debtData);

      expect(metrics.monthsToPayoff).toBe(10);
      expect(metrics.totalInterest).toBe(0);
      expect(metrics.isPaymentSufficient).toBe(true);
      expect(metrics.monthlyInterestCost).toBe(0);
    });

    test("should handle insufficient payment (payment only covers interest)", () => {
      const debtData = {
        currentBalance: 10000,
        originalBalance: 10000,
        interestRate: 24, // 2% monthly
        minimumPayment: 150, // Less than monthly interest of $200
        paymentFrequency: "monthly",
      };

      const metrics = calculateDebtMetrics(debtData);

      expect(metrics.isPaymentSufficient).toBe(false);
      expect(metrics.monthsToPayoff).toBeNull();
      expect(metrics.totalInterest).toBeNull();
    });
  });

  describe("Payment frequency calculations", () => {
    test("should handle weekly payments", () => {
      const debtData = {
        currentBalance: 1000,
        originalBalance: 1000,
        interestRate: 12,
        minimumPayment: 50,
        paymentFrequency: "weekly",
      };

      const metrics = calculateDebtMetrics(debtData);

      expect(metrics).toBeTruthy();
      expect(metrics.monthsToPayoff).toBeGreaterThan(0);
    });

    test("should handle biweekly payments", () => {
      const debtData = {
        currentBalance: 1000,
        originalBalance: 1000,
        interestRate: 12,
        minimumPayment: 100,
        paymentFrequency: "biweekly",
      };

      const metrics = calculateDebtMetrics(debtData);

      expect(metrics).toBeTruthy();
      expect(metrics.monthsToPayoff).toBeGreaterThan(0);
    });
  });

  describe("Edge cases", () => {
    test("should return null for invalid input", () => {
      const debtData = {
        currentBalance: 0,
        minimumPayment: 0,
      };

      const metrics = calculateDebtMetrics(debtData);

      expect(metrics).toBeNull();
    });

    test("should handle missing payment frequency", () => {
      const debtData = {
        currentBalance: 1000,
        originalBalance: 1000,
        interestRate: 18,
        minimumPayment: 100,
        // paymentFrequency missing - should default to monthly
      };

      const metrics = calculateDebtMetrics(debtData);

      expect(metrics).toBeTruthy();
      expect(metrics.monthsToPayoff).toBeGreaterThan(0);
    });
  });
});

describe("formatDebtMetrics", () => {
  test("should format payoff time correctly", () => {
    const metrics = {
      monthsToPayoff: 25,
      totalInterest: 500.75,
      isPaymentSufficient: true,
      monthlyInterestCost: 25.5,
    };

    const formatted = formatDebtMetrics(metrics);

    expect(formatted.payoffTime).toBe("2 years 1 month");
    expect(formatted.totalInterest).toBe("$500.75");
    expect(formatted.monthlyInterest).toBe("$25.50");
    expect(formatted.isPaymentSufficient).toBe(true);
  });

  test("should format months-only payoff time", () => {
    const metrics = {
      monthsToPayoff: 8,
      totalInterest: 100.25,
      isPaymentSufficient: true,
      monthlyInterestCost: 15.75,
    };

    const formatted = formatDebtMetrics(metrics);

    expect(formatted.payoffTime).toBe("8 months");
  });

  test("should handle insufficient payment", () => {
    const metrics = {
      monthsToPayoff: null,
      totalInterest: null,
      isPaymentSufficient: false,
      monthlyInterestCost: 50,
    };

    const formatted = formatDebtMetrics(metrics);

    expect(formatted.payoffTime).toBe("Payment insufficient (covers interest only)");
    expect(formatted.totalInterest).toBe("N/A");
    expect(formatted.isPaymentSufficient).toBe(false);
  });

  test("should return null for null input", () => {
    const formatted = formatDebtMetrics(null);

    expect(formatted).toBeNull();
  });

  test("should handle exact years", () => {
    const metrics = {
      monthsToPayoff: 24,
      totalInterest: 300,
      isPaymentSufficient: true,
      monthlyInterestCost: 20,
    };

    const formatted = formatDebtMetrics(metrics);

    expect(formatted.payoffTime).toBe("2 years");
  });
});
