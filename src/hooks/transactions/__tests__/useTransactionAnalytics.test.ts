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

  describe("basic analytics", () => {
    it("should calculate total income correctly", () => {
      const { result } = renderHook(() => useTransactionAnalytics(mockTransactions));

      expect(result.current.totalIncome).toBe(3000.0);
    });

    it("should calculate total expenses correctly", () => {
      const { result } = renderHook(() => useTransactionAnalytics(mockTransactions));

      expect(result.current.totalExpenses).toBe(251.55);
    });

    it("should calculate net amount correctly", () => {
      const { result } = renderHook(() => useTransactionAnalytics(mockTransactions));

      expect(result.current.netAmount).toBe(2748.45);
    });

    it("should count transactions correctly", () => {
      const { result } = renderHook(() => useTransactionAnalytics(mockTransactions));

      expect(result.current.transactionCount).toBe(4);
    });
  });

  describe("categoryBreakdown", () => {
    it("should group transactions by category", () => {
      const { result } = renderHook(() => useTransactionAnalytics(mockTransactions));

      const categoryBreakdown = result.current.categoryBreakdown;

      expect(categoryBreakdown["Food"]).toBeDefined();
      expect(categoryBreakdown["Food"].expenses).toBe(205.8);
      expect(categoryBreakdown["Food"].count).toBe(2);

      expect(categoryBreakdown["Income"]).toBeDefined();
      expect(categoryBreakdown["Income"].income).toBe(3000.0);
      expect(categoryBreakdown["Income"].count).toBe(1);

      expect(categoryBreakdown["Transportation"]).toBeDefined();
      expect(categoryBreakdown["Transportation"].expenses).toBe(45.75);
      expect(categoryBreakdown["Transportation"].count).toBe(1);
    });

    it("should handle transactions without categories", () => {
      const transactionsWithoutCategory = [
        { id: "1", description: "Test", amount: 100, date: "2024-01-01" },
        { id: "2", description: "Test 2", amount: -50, date: "2024-01-02", category: "Food" },
      ];

      const { result } = renderHook(() => useTransactionAnalytics(transactionsWithoutCategory));

      const categoryBreakdown = result.current.categoryBreakdown;

      expect(categoryBreakdown["uncategorized"]).toBeDefined();
      expect(categoryBreakdown["uncategorized"].income).toBe(100);
      expect(categoryBreakdown["Food"]).toBeDefined();
      expect(categoryBreakdown["Food"].expenses).toBe(50);
    });
  });

  describe("dailyBreakdown", () => {
    it("should group transactions by date", () => {
      const { result } = renderHook(() => useTransactionAnalytics(mockTransactions));

      const dailyBreakdown = result.current.dailyBreakdown;

      expect(dailyBreakdown["2024-01-01T09:00:00Z"]).toBeDefined();
      expect(dailyBreakdown["2024-01-01T09:00:00Z"].income).toBe(3000.0);

      expect(dailyBreakdown["2024-01-15T10:00:00Z"]).toBeDefined();
      expect(dailyBreakdown["2024-01-15T10:00:00Z"].expenses).toBe(120.5);
    });
  });

  describe("recentTransactions", () => {
    it("should return transactions from last 7 days", () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const twoWeeksAgo = new Date(today);
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const recentTransactions = [
        { id: "1", description: "Recent", amount: -10, date: yesterday.toISOString() },
        { id: "2", description: "Last week", amount: -20, date: weekAgo.toISOString() },
        { id: "3", description: "Old", amount: -30, date: twoWeeksAgo.toISOString() },
      ];

      const { result } = renderHook(() => useTransactionAnalytics(recentTransactions));

      expect(result.current.recentTransactions.length).toBeGreaterThanOrEqual(1);
      expect(result.current.recentTransactions.length).toBeLessThanOrEqual(2);
    });
  });

  describe("real-time updates", () => {
    it("should recalculate analytics when transactions change", () => {
      const { result, rerender } = renderHook(
        ({ transactions }) => useTransactionAnalytics(transactions),
        { initialProps: { transactions: mockTransactions } }
      );

      const initialExpenses = result.current.totalExpenses;
      expect(initialExpenses).toBe(251.55);

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

      const updatedExpenses = result.current.totalExpenses;
      expect(updatedExpenses).toBe(267.05);
      expect(result.current.categoryBreakdown["Food"].expenses).toBe(221.3);
    });
  });

  describe("edge cases", () => {
    it("should handle empty transaction list", () => {
      const { result } = renderHook(() => useTransactionAnalytics([]));

      expect(result.current.totalIncome).toBe(0);
      expect(result.current.totalExpenses).toBe(0);
      expect(result.current.netAmount).toBe(0);
      expect(result.current.transactionCount).toBe(0);
    });

    it("should handle undefined transactions", () => {
      const { result } = renderHook(() => useTransactionAnalytics());

      expect(result.current.totalIncome).toBe(0);
      expect(result.current.totalExpenses).toBe(0);
      expect(result.current.netAmount).toBe(0);
      expect(result.current.transactionCount).toBe(0);
    });
  });
});
