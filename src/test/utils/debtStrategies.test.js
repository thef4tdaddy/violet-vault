import { describe, it, expect } from "vitest";
import { calculateDebtAvalanche, calculateDebtSnowball } from "../../utils/debtStrategies";

describe("Debt Strategy Calculations", () => {
  const mockDebts = [
    {
      id: "1",
      name: "Credit Card A",
      currentBalance: 5000,
      interestRate: 18.5,
      minimumPayment: 150,
      status: "active",
    },
    {
      id: "2",
      name: "Credit Card B",
      currentBalance: 3000,
      interestRate: 24.9,
      minimumPayment: 100,
      status: "active",
    },
    {
      id: "3",
      name: "Personal Loan",
      currentBalance: 8000,
      interestRate: 12.0,
      minimumPayment: 200,
      status: "active",
    },
  ];

  describe("calculateDebtAvalanche", () => {
    it("should prioritize highest interest rate debts first", () => {
      const result = calculateDebtAvalanche(mockDebts, 300);

      expect(result).toBeDefined();
      expect(result.payoffOrder).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.payoffOrder[0].debtId).toBe("2"); // Credit Card B should be first (24.9%)
    });

    it("should handle zero extra payment", () => {
      const result = calculateDebtAvalanche(mockDebts, 0);
      expect(result).toBeDefined();
      expect(result.totalInterest).toBeGreaterThan(0);
    });
  });

  describe("calculateDebtSnowball", () => {
    it("should prioritize smallest balance debts first", () => {
      const result = calculateDebtSnowball(mockDebts, 300);

      expect(result).toBeDefined();
      expect(result.payoffOrder).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.payoffOrder[0].debtId).toBe("2"); // Credit Card B should be first ($3,000)
    });
  });
});
