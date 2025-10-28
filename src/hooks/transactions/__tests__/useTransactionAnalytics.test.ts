import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTransactionAnalytics } from "../useTransactionAnalytics";

describe("useTransactionAnalytics", () => {
  const mockTransactions = [
    {
      id: "1",
      description: "Grocery Store",
      amount: -120.5,
      date: "2024-01-15T10:00:00Z",
      category: "Food",
      tags: ["groceries"],
    },
    {
      id: "2",
      description: "Salary",
      amount: 3000.0,
      date: "2024-01-01T09:00:00Z",
      category: "Income",
      tags: ["salary"],
    },
    {
      id: "3",
      description: "Gas Station",
      amount: -45.75,
      date: "2024-01-10T16:30:00Z",
      category: "Transportation",
      tags: ["gas"],
    },
    {
      id: "4",
      description: "Restaurant",
      amount: -85.3,
      date: "2024-01-20T19:00:00Z",
      category: "Food",
      tags: ["dining"],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("calculateCategoryTotals", () => {
    it("should calculate totals by category", () => {
      const { result } = renderHook(() => useTransactionAnalytics(mockTransactions));

      const categoryTotals = result.current.calculateCategoryTotals();

      expect(categoryTotals["Food"]).toBe(205.8);
      expect(categoryTotals["Transportation"]).toBe(45.75);
      expect(categoryTotals["Income"]).toBe(3000.0);
    });

    it("should handle empty transactions", () => {
      const { result } = renderHook(() => useTransactionAnalytics([]));

      const categoryTotals = result.current.calculateCategoryTotals();

      expect(Object.keys(categoryTotals)).toHaveLength(0);
    });

    it("should exclude income from expense calculations", () => {
      const { result } = renderHook(() => useTransactionAnalytics(mockTransactions));

      const categoryTotals = result.current.calculateCategoryTotals({
        excludeIncome: true,
      });

      expect(categoryTotals["Food"]).toBe(205.8);
      expect(categoryTotals["Transportation"]).toBe(45.75);
      expect(categoryTotals["Income"]).toBeUndefined();
    });
  });

  describe("calculateMonthlyTrends", () => {
    it("should calculate monthly spending trends", () => {
      const { result } = renderHook(() => useTransactionAnalytics(mockTransactions));

      const trends = result.current.calculateMonthlyTrends();

      expect(trends["2024-01"]).toBeDefined();
      expect(trends["2024-01"].totalExpenses).toBe(251.55);
      expect(trends["2024-01"].totalIncome).toBe(3000.0);
      expect(trends["2024-01"].netAmount).toBe(2748.45);
      expect(trends["2024-01"].transactionCount).toBe(4);
    });

    it("should group transactions across multiple months", () => {
      const multiMonthTransactions = [
        ...mockTransactions,
        {
          id: "5",
          amount: -100,
          date: "2024-02-01T10:00:00Z",
          category: "Food",
        },
      ];

      const { result } = renderHook(() => useTransactionAnalytics(multiMonthTransactions));

      const trends = result.current.calculateMonthlyTrends();

      expect(Object.keys(trends)).toHaveLength(2);
      expect(trends["2024-01"]).toBeDefined();
      expect(trends["2024-02"]).toBeDefined();
      expect(trends["2024-02"].totalExpenses).toBe(100);
    });
  });

  describe("getTopCategories", () => {
    it("should return top spending categories", () => {
      const { result } = renderHook(() => useTransactionAnalytics(mockTransactions));

      const topCategories = result.current.getTopCategories(2);

      expect(topCategories).toHaveLength(2);
      expect(topCategories[0].category).toBe("Food");
      expect(topCategories[0].amount).toBe(205.8);
      expect(topCategories[1].category).toBe("Transportation");
      expect(topCategories[1].amount).toBe(45.75);
    });

    it("should limit results to specified count", () => {
      const { result } = renderHook(() => useTransactionAnalytics(mockTransactions));

      const topCategories = result.current.getTopCategories(1);

      expect(topCategories).toHaveLength(1);
      expect(topCategories[0].category).toBe("Food");
    });

    it("should include percentage of total spending", () => {
      const { result } = renderHook(() => useTransactionAnalytics(mockTransactions));

      const topCategories = result.current.getTopCategories();

      expect(topCategories[0].percentage).toBeCloseTo(81.8, 1);
      expect(topCategories[1].percentage).toBeCloseTo(18.2, 1);
    });
  });

  describe("calculateAverageTransactionAmount", () => {
    it("should calculate average transaction amounts", () => {
      const { result } = renderHook(() => useTransactionAnalytics(mockTransactions));

      const averages = result.current.calculateAverageTransactionAmount();

      expect(averages.overall).toBeCloseTo(62.89, 2);
      expect(averages.expenses).toBeCloseTo(83.85, 2);
      expect(averages.income).toBe(3000.0);
    });

    it("should handle transactions with only expenses", () => {
      const expenseOnlyTransactions = mockTransactions.filter((t) => t.amount < 0);
      const { result } = renderHook(() => useTransactionAnalytics(expenseOnlyTransactions));

      const averages = result.current.calculateAverageTransactionAmount();

      expect(averages.expenses).toBeCloseTo(83.85, 2);
      expect(averages.income).toBe(0);
    });
  });

  describe("getSpendingInsights", () => {
    it("should generate spending insights", () => {
      const { result } = renderHook(() => useTransactionAnalytics(mockTransactions));

      const insights = result.current.getSpendingInsights();

      expect(insights).toHaveProperty("topCategory");
      expect(insights).toHaveProperty("averageTransaction");
      expect(insights).toHaveProperty("monthlySpend");
      expect(insights).toHaveProperty("categoryCount");

      expect(insights.topCategory).toBe("Food");
      expect(insights.categoryCount).toBe(3);
    });

    it("should identify unusual spending patterns", () => {
      const { result } = renderHook(() => useTransactionAnalytics(mockTransactions));

      const insights = result.current.getSpendingInsights();

      expect(insights).toHaveProperty("unusualSpending");
      // Large salary transaction should be flagged as unusual
      expect(insights.unusualSpending).toBe(true);
    });
  });

  describe("filterByDateRange", () => {
    it("should filter transactions by date range", () => {
      const { result } = renderHook(() => useTransactionAnalytics(mockTransactions));

      const filtered = result.current.filterByDateRange({
        startDate: "2024-01-10",
        endDate: "2024-01-20",
      });

      expect(filtered).toHaveLength(3);
      expect(filtered.map((t) => t.id)).toEqual(["1", "3", "4"]);
    });

    it("should handle invalid date range", () => {
      const { result } = renderHook(() => useTransactionAnalytics(mockTransactions));

      const filtered = result.current.filterByDateRange({
        startDate: "2024-01-20",
        endDate: "2024-01-10", // end before start
      });

      expect(filtered).toHaveLength(0);
    });
  });

  describe("real-time updates", () => {
    it("should recalculate analytics when transactions change", () => {
      const { result, rerender } = renderHook(
        ({ transactions }) => useTransactionAnalytics(transactions),
        { initialProps: { transactions: mockTransactions } }
      );

      const initialCategoryTotals = result.current.calculateCategoryTotals();
      expect(initialCategoryTotals["Food"]).toBe(205.8);

      // Add a new transaction
      const newTransactions = [
        ...mockTransactions,
        {
          id: "5",
          description: "Coffee",
          amount: -15.5,
          date: "2024-01-25T08:00:00Z",
          category: "Food",
          tags: ["coffee"],
        },
      ];

      rerender({ transactions: newTransactions });

      const updatedCategoryTotals = result.current.calculateCategoryTotals();
      expect(updatedCategoryTotals["Food"]).toBe(221.3);
    });
  });

  describe("error handling", () => {
    it("should handle malformed transaction data", () => {
      const malformedTransactions = [
        { id: "1", amount: null, date: "invalid" },
        { id: "2", description: "Valid", amount: 100, date: "2024-01-01" },
      ];

      const { result } = renderHook(() => useTransactionAnalytics(malformedTransactions));

      // Should not throw and should handle valid transactions
      const categoryTotals = result.current.calculateCategoryTotals();
      expect(Object.keys(categoryTotals)).toHaveLength(1);
    });

    it("should handle undefined transactions", () => {
      const { result } = renderHook(() => useTransactionAnalytics(undefined));

      const categoryTotals = result.current.calculateCategoryTotals();
      expect(Object.keys(categoryTotals)).toHaveLength(0);
    });
  });
});
