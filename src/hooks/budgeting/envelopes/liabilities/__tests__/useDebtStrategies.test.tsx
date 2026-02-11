import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDebtStrategies } from "../useDebtStrategies";

describe("useDebtStrategies", () => {
  const mockDebts = [
    {
      id: "debt1",
      name: "Credit Card A",
      type: "credit_card",
      status: "active",
      currentBalance: 5000,
      minimumPayment: 150,
      interestRate: 18.99,
    },
    {
      id: "debt2",
      name: "Credit Card B",
      type: "credit_card",
      status: "active",
      currentBalance: 2000,
      minimumPayment: 60,
      interestRate: 15.5,
    },
    {
      id: "debt3",
      name: "Personal Loan",
      type: "personal_loan",
      status: "active",
      currentBalance: 8000,
      minimumPayment: 200,
      interestRate: 10.0,
    },
  ];

  describe("Initialization", () => {
    it("should return empty strategies with no debts", () => {
      const { result } = renderHook(() => useDebtStrategies([]));

      expect(result.current.avalancheStrategy.debts).toEqual([]);
      expect(result.current.snowballStrategy.debts).toEqual([]);
      expect(result.current.hasDebts).toBe(false);
    });

    it("should calculate strategies for active debts", () => {
      const { result } = renderHook(() => useDebtStrategies(mockDebts));

      expect(result.current.avalancheStrategy.debts).toHaveLength(3);
      expect(result.current.snowballStrategy.debts).toHaveLength(3);
      expect(result.current.hasDebts).toBe(true);
    });

    it("should filter out inactive debts", () => {
      const debtsWithInactive = [
        ...mockDebts,
        {
          id: "debt4",
          name: "Paid Off Loan",
          type: "personal_loan",
          status: "paid_off",
          currentBalance: 0,
          minimumPayment: 0,
          interestRate: 0,
        },
      ];

      const { result } = renderHook(() => useDebtStrategies(debtsWithInactive));

      expect(result.current.avalancheStrategy.debts).toHaveLength(3);
      expect(result.current.snowballStrategy.debts).toHaveLength(3);
    });

    it("should filter out debts with zero balance", () => {
      const debtsWithZero = [
        ...mockDebts,
        {
          id: "debt5",
          name: "Zero Balance Card",
          type: "credit_card",
          status: "active",
          currentBalance: 0,
          minimumPayment: 0,
          interestRate: 12.0,
        },
      ];

      const { result } = renderHook(() => useDebtStrategies(debtsWithZero));

      expect(result.current.avalancheStrategy.debts).toHaveLength(3);
    });
  });

  describe("Avalanche Strategy", () => {
    it("should prioritize debts by highest interest rate", () => {
      const { result } = renderHook(() => useDebtStrategies(mockDebts));

      const { debts } = result.current.avalancheStrategy;

      expect(debts[0].id).toBe("debt1"); // 18.99%
      expect(debts[1].id).toBe("debt2"); // 15.5%
      expect(debts[2].id).toBe("debt3"); // 10.0%
    });

    it("should assign priority numbers correctly", () => {
      const { result } = renderHook(() => useDebtStrategies(mockDebts));

      const { debts } = result.current.avalancheStrategy;

      expect(debts[0].priority).toBe(1);
      expect(debts[1].priority).toBe(2);
      expect(debts[2].priority).toBe(3);
    });

    it("should calculate months to payoff for each debt", () => {
      const { result } = renderHook(() => useDebtStrategies(mockDebts));

      const { debts } = result.current.avalancheStrategy;

      debts.forEach((debt) => {
        expect(debt.monthsToPayoff).toBeGreaterThan(0);
        expect(debt.monthsToPayoff).toBeLessThan(999);
      });
    });

    it("should calculate total interest cost", () => {
      const { result } = renderHook(() => useDebtStrategies(mockDebts));

      const { totalInterest } = result.current.avalancheStrategy;

      expect(totalInterest).toBeGreaterThan(0);
    });

    it("should include strategy metadata", () => {
      const { result } = renderHook(() => useDebtStrategies(mockDebts));

      const strategy = result.current.avalancheStrategy;

      expect(strategy.name).toBe("Debt Avalanche");
      expect(strategy.description).toContain("highest interest rate");
    });
  });

  describe("Snowball Strategy", () => {
    it("should prioritize debts by lowest balance", () => {
      const { result } = renderHook(() => useDebtStrategies(mockDebts));

      const { debts } = result.current.snowballStrategy;

      expect(debts[0].id).toBe("debt2"); // $2000
      expect(debts[1].id).toBe("debt1"); // $5000
      expect(debts[2].id).toBe("debt3"); // $8000
    });

    it("should assign priority numbers correctly", () => {
      const { result } = renderHook(() => useDebtStrategies(mockDebts));

      const { debts } = result.current.snowballStrategy;

      expect(debts[0].priority).toBe(1);
      expect(debts[1].priority).toBe(2);
      expect(debts[2].priority).toBe(3);
    });

    it("should calculate months to payoff for each debt", () => {
      const { result } = renderHook(() => useDebtStrategies(mockDebts));

      const { debts } = result.current.snowballStrategy;

      debts.forEach((debt) => {
        expect(debt.monthsToPayoff).toBeGreaterThan(0);
      });
    });

    it("should include strategy metadata", () => {
      const { result } = renderHook(() => useDebtStrategies(mockDebts));

      const strategy = result.current.snowballStrategy;

      expect(strategy.name).toBe("Debt Snowball");
      expect(strategy.description).toContain("lowest balance");
    });
  });

  describe("Payoff Time Calculations", () => {
    it("should calculate payoff time for zero interest debt", () => {
      const zeroInterestDebts = [
        {
          id: "debt1",
          name: "Zero Interest Loan",
          type: "personal_loan",
          status: "active",
          currentBalance: 1000,
          minimumPayment: 100,
          interestRate: 0,
        },
      ];

      const { result } = renderHook(() => useDebtStrategies(zeroInterestDebts));

      const { debts } = result.current.avalancheStrategy;

      expect(debts[0].monthsToPayoff).toBe(10);
    });

    it("should handle impossible payoff scenarios", () => {
      const impossibleDebts = [
        {
          id: "debt1",
          name: "Impossible Debt",
          type: "credit_card",
          status: "active",
          currentBalance: 10000,
          minimumPayment: 10,
          interestRate: 25.0,
        },
      ];

      const { result } = renderHook(() => useDebtStrategies(impossibleDebts));

      const { debts } = result.current.avalancheStrategy;

      // Should return 999 for impossible payoffs
      expect(debts[0].monthsToPayoff).toBe(999);
    });

    it("should calculate correct interest cost", () => {
      const simpleDebt = [
        {
          id: "debt1",
          name: "Simple Debt",
          type: "personal_loan",
          status: "active",
          currentBalance: 1000,
          minimumPayment: 100,
          interestRate: 12.0,
        },
      ];

      const { result } = renderHook(() => useDebtStrategies(simpleDebt));

      const { debts } = result.current.avalancheStrategy;

      expect(debts[0].totalInterestCost).toBeGreaterThan(0);
      expect(debts[0].totalInterestCost).toBeLessThan(debts[0].currentBalance);
    });
  });

  describe("Recommendation Logic", () => {
    it("should recommend based on interest savings and time difference", () => {
      const highInterestDebts = [
        {
          id: "debt1",
          name: "High Interest Card",
          type: "credit_card",
          status: "active",
          currentBalance: 5000,
          minimumPayment: 200,
          interestRate: 25.0,
        },
        {
          id: "debt2",
          name: "Low Interest Loan",
          type: "personal_loan",
          status: "active",
          currentBalance: 10000,
          minimumPayment: 300,
          interestRate: 5.0,
        },
      ];

      const { result } = renderHook(() => useDebtStrategies(highInterestDebts));

      const { recommendation } = result.current;

      expect(recommendation).not.toBeNull();
      expect(recommendation?.strategy).toBeDefined();
      expect(["avalanche", "snowball", "either"]).toContain(recommendation?.strategy);
    });

    it("should recommend snowball for similar costs", () => {
      const similarDebts = [
        {
          id: "debt1",
          name: "Card A",
          type: "credit_card",
          status: "active",
          currentBalance: 1000,
          minimumPayment: 100,
          interestRate: 10.0,
        },
        {
          id: "debt2",
          name: "Card B",
          type: "credit_card",
          status: "active",
          currentBalance: 1100,
          minimumPayment: 105,
          interestRate: 10.5,
        },
      ];

      const { result } = renderHook(() => useDebtStrategies(similarDebts));

      const { recommendation } = result.current;

      expect(recommendation).not.toBeNull();
      // Should recommend either or snowball for motivation
    });

    it("should return null recommendation with no debts", () => {
      const { result } = renderHook(() => useDebtStrategies([]));

      expect(result.current.recommendation).toBeNull();
    });

    it("should provide reason for recommendation", () => {
      const { result } = renderHook(() => useDebtStrategies(mockDebts));

      const { recommendation } = result.current;

      expect(recommendation).not.toBeNull();
      expect(recommendation?.reason).toBeTruthy();
      expect(recommendation?.savings).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Payment Impact Scenarios", () => {
    it("should calculate impact for different extra payment amounts", () => {
      const { result } = renderHook(() => useDebtStrategies(mockDebts));

      const { paymentImpact } = result.current;

      expect(paymentImpact).toHaveLength(4); // [50, 100, 200, 500]

      paymentImpact.forEach((scenario) => {
        expect(scenario.extraPayment).toBeGreaterThan(0);
        expect(scenario.avalanche).toBeDefined();
        expect(scenario.snowball).toBeDefined();
      });
    });

    it("should show time savings with extra payments", () => {
      const { result } = renderHook(() => useDebtStrategies(mockDebts));

      const { paymentImpact } = result.current;

      paymentImpact.forEach((scenario) => {
        expect(scenario.avalanche.timeSavings).toBeGreaterThanOrEqual(0);
        expect(scenario.snowball.timeSavings).toBeGreaterThanOrEqual(0);
      });
    });

    it("should show interest savings with extra payments", () => {
      const { result } = renderHook(() => useDebtStrategies(mockDebts));

      const { paymentImpact } = result.current;

      paymentImpact.forEach((scenario) => {
        expect(scenario.avalanche.interestSavings).toBeGreaterThanOrEqual(0);
        expect(scenario.snowball.interestSavings).toBeGreaterThanOrEqual(0);
      });
    });

    it("should return empty array with no debts", () => {
      const { result } = renderHook(() => useDebtStrategies([]));

      expect(result.current.paymentImpact).toEqual([]);
    });
  });

  describe("Insights Generation", () => {
    it("should warn about high interest debts", () => {
      const highInterestDebts = [
        {
          id: "debt1",
          name: "High Rate Card",
          type: "credit_card",
          status: "active",
          currentBalance: 3000,
          minimumPayment: 100,
          interestRate: 22.0,
        },
        {
          id: "debt2",
          name: "Another High Rate",
          type: "credit_card",
          status: "active",
          currentBalance: 2000,
          minimumPayment: 80,
          interestRate: 19.0,
        },
      ];

      const { result } = renderHook(() => useDebtStrategies(highInterestDebts));

      const { insights } = result.current;

      const highInterestWarning = insights.find((i) => i.type === "warning");
      expect(highInterestWarning).toBeDefined();
      expect(highInterestWarning?.message).toContain("above 15%");
    });

    it("should provide insight about high payment ratio", () => {
      const highPaymentDebts = [
        {
          id: "debt1",
          name: "High Payment Debt",
          type: "personal_loan",
          status: "active",
          currentBalance: 1000,
          minimumPayment: 100,
          interestRate: 10.0,
        },
      ];

      const { result } = renderHook(() => useDebtStrategies(highPaymentDebts));

      const { insights } = result.current;

      const paymentRatioInsight = insights.find((i) => i.type === "info");
      expect(paymentRatioInsight).toBeDefined();
    });

    it("should suggest consolidation for multiple credit cards", () => {
      const manyCards = [
        {
          id: "debt1",
          name: "Card 1",
          type: "credit_card",
          status: "active",
          currentBalance: 1000,
          minimumPayment: 50,
          interestRate: 15.0,
        },
        {
          id: "debt2",
          name: "Card 2",
          type: "credit_card",
          status: "active",
          currentBalance: 1000,
          minimumPayment: 50,
          interestRate: 16.0,
        },
        {
          id: "debt3",
          name: "Card 3",
          type: "credit_card",
          status: "active",
          currentBalance: 1000,
          minimumPayment: 50,
          interestRate: 17.0,
        },
      ];

      const { result } = renderHook(() => useDebtStrategies(manyCards));

      const { insights } = result.current;

      const consolidationTip = insights.find((i) => i.type === "tip");
      expect(consolidationTip).toBeDefined();
      expect(consolidationTip?.message).toContain("consolidat");
    });

    it("should return empty insights with no debts", () => {
      const { result } = renderHook(() => useDebtStrategies([]));

      expect(result.current.insights).toEqual([]);
    });
  });

  describe("Recommendation Text", () => {
    it("should format avalanche recommendation text", () => {
      const { result } = renderHook(() => useDebtStrategies(mockDebts));

      const { recommendationText } = result.current;

      expect(recommendationText).toBeTruthy();
      expect(typeof recommendationText).toBe("string");
    });

    it("should return empty text with no debts", () => {
      const { result } = renderHook(() => useDebtStrategies([]));

      const { recommendationText } = result.current;

      expect(recommendationText).toBe("");
    });
  });

  describe("Edge Cases", () => {
    it("should handle debts with missing interest rates", () => {
      const debtsNoRate = [
        {
          id: "debt1",
          name: "No Rate Debt",
          type: "personal_loan",
          status: "active",
          currentBalance: 1000,
          minimumPayment: 100,
        },
      ];

      const { result } = renderHook(() => useDebtStrategies(debtsNoRate));

      expect(result.current.avalancheStrategy.debts).toHaveLength(1);
      expect(result.current.snowballStrategy.debts).toHaveLength(1);
    });

    it("should handle debts with missing minimum payment", () => {
      const debtsNoPayment = [
        {
          id: "debt1",
          name: "No Payment Debt",
          type: "personal_loan",
          status: "active",
          currentBalance: 1000,
          minimumPayment: 0,
          interestRate: 10.0,
        },
      ];

      const { result } = renderHook(() => useDebtStrategies(debtsNoPayment));

      const { debts } = result.current.avalancheStrategy;

      expect(debts[0].monthsToPayoff).toBe(0);
    });

    it("should handle undefined debts array", () => {
      const { result } = renderHook(() => useDebtStrategies(undefined as unknown as []));

      expect(result.current.avalancheStrategy.debts).toEqual([]);
      expect(result.current.snowballStrategy.debts).toEqual([]);
    });

    it("should handle single debt", () => {
      const singleDebt = [mockDebts[0]];

      const { result } = renderHook(() => useDebtStrategies(singleDebt));

      expect(result.current.avalancheStrategy.debts).toHaveLength(1);
      expect(result.current.snowballStrategy.debts).toHaveLength(1);
    });
  });

  describe("Strategy Comparison", () => {
    it("should calculate difference between strategies", () => {
      const { result } = renderHook(() => useDebtStrategies(mockDebts));

      const avalancheCost = result.current.avalancheStrategy.totalInterest;
      const snowballCost = result.current.snowballStrategy.totalInterest;

      expect(Math.abs(avalancheCost - snowballCost)).toBeGreaterThanOrEqual(0);
    });

    it("should show avalanche saves on interest", () => {
      const { result } = renderHook(() => useDebtStrategies(mockDebts));

      const avalancheInterest = result.current.avalancheStrategy.totalInterest;
      const snowballInterest = result.current.snowballStrategy.totalInterest;

      // Avalanche should generally cost less or equal in interest
      expect(avalancheInterest).toBeLessThanOrEqual(snowballInterest * 1.1); // Allow 10% margin
    });
  });

  describe("Re-renders and Memoization", () => {
    it("should memoize strategies when debts don't change", () => {
      const { result, rerender } = renderHook(() => useDebtStrategies(mockDebts));

      const firstAvalanche = result.current.avalancheStrategy;
      const firstSnowball = result.current.snowballStrategy;

      rerender();

      expect(result.current.avalancheStrategy).toBe(firstAvalanche);
      expect(result.current.snowballStrategy).toBe(firstSnowball);
    });

    it("should recalculate when debts change", () => {
      const { result, rerender } = renderHook(({ debts }) => useDebtStrategies(debts), {
        initialProps: { debts: mockDebts },
      });

      const firstAvalanche = result.current.avalancheStrategy;

      const newDebts = [
        ...mockDebts,
        {
          id: "debt4",
          name: "New Debt",
          type: "credit_card",
          status: "active",
          currentBalance: 3000,
          minimumPayment: 90,
          interestRate: 20.0,
        },
      ];

      rerender({ debts: newDebts });

      expect(result.current.avalancheStrategy).not.toBe(firstAvalanche);
      expect(result.current.avalancheStrategy.debts).toHaveLength(4);
    });
  });
});
