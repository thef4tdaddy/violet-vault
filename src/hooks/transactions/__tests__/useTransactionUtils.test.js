import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import useTransactionUtils from "../useTransactionUtils";

describe("useTransactionUtils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockTransactions = [
    {
      id: "1",
      description: "Grocery Store",
      amount: -50.25,
      date: "2024-01-15T10:00:00Z",
      category: "Food",
      tags: ["groceries", "food"],
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
      amount: -35.0,
      date: "2024-01-10T16:30:00Z",
      category: "Transportation",
      tags: ["gas", "car"],
    },
  ];

  describe("filterTransactions", () => {
    it("should filter transactions by search term", () => {
      const { result } = renderHook(() => useTransactionUtils());

      const filtered = result.current.filterTransactions(mockTransactions, {
        search: "grocery",
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].description).toBe("Grocery Store");
    });

    it("should filter transactions by category", () => {
      const { result } = renderHook(() => useTransactionUtils());

      const filtered = result.current.filterTransactions(mockTransactions, {
        category: "Food",
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].category).toBe("Food");
    });

    it("should filter transactions by date range", () => {
      const { result } = renderHook(() => useTransactionUtils());

      const filtered = result.current.filterTransactions(mockTransactions, {
        startDate: "2024-01-10",
        endDate: "2024-01-20",
      });

      expect(filtered).toHaveLength(2);
      expect(filtered.map((t) => t.id)).toContain("1");
      expect(filtered.map((t) => t.id)).toContain("3");
    });

    it("should filter transactions by amount range", () => {
      const { result } = renderHook(() => useTransactionUtils());

      const filtered = result.current.filterTransactions(mockTransactions, {
        minAmount: -100,
        maxAmount: 0,
      });

      expect(filtered).toHaveLength(2);
      expect(filtered.every((t) => t.amount < 0)).toBe(true);
    });

    it("should combine multiple filters", () => {
      const { result } = renderHook(() => useTransactionUtils());

      const filtered = result.current.filterTransactions(mockTransactions, {
        search: "gas",
        category: "Transportation",
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].description).toBe("Gas Station");
    });
  });

  describe("sortTransactions", () => {
    it("should sort transactions by date descending by default", () => {
      const { result } = renderHook(() => useTransactionUtils());

      const sorted = result.current.sortTransactions(mockTransactions);

      expect(sorted[0].date).toBe("2024-01-15T10:00:00Z");
      expect(sorted[1].date).toBe("2024-01-10T16:30:00Z");
      expect(sorted[2].date).toBe("2024-01-01T09:00:00Z");
    });

    it("should sort transactions by date ascending", () => {
      const { result } = renderHook(() => useTransactionUtils());

      const sorted = result.current.sortTransactions(mockTransactions, {
        field: "date",
        direction: "asc",
      });

      expect(sorted[0].date).toBe("2024-01-01T09:00:00Z");
      expect(sorted[1].date).toBe("2024-01-10T16:30:00Z");
      expect(sorted[2].date).toBe("2024-01-15T10:00:00Z");
    });

    it("should sort transactions by amount", () => {
      const { result } = renderHook(() => useTransactionUtils());

      const sorted = result.current.sortTransactions(mockTransactions, {
        field: "amount",
        direction: "desc",
      });

      expect(sorted[0].amount).toBe(3000.0);
      expect(sorted[1].amount).toBe(-35.0);
      expect(sorted[2].amount).toBe(-50.25);
    });

    it("should sort transactions by description", () => {
      const { result } = renderHook(() => useTransactionUtils());

      const sorted = result.current.sortTransactions(mockTransactions, {
        field: "description",
        direction: "asc",
      });

      expect(sorted[0].description).toBe("Gas Station");
      expect(sorted[1].description).toBe("Grocery Store");
      expect(sorted[2].description).toBe("Salary");
    });
  });

  describe("calculateTransactionTotals", () => {
    it("should calculate correct totals", () => {
      const { result } = renderHook(() => useTransactionUtils());

      const totals =
        result.current.calculateTransactionTotals(mockTransactions);

      expect(totals.income).toBe(3000.0);
      expect(totals.expenses).toBe(85.25);
      expect(totals.net).toBe(2914.75);
      expect(totals.count).toBe(3);
    });

    it("should handle empty transaction list", () => {
      const { result } = renderHook(() => useTransactionUtils());

      const totals = result.current.calculateTransactionTotals([]);

      expect(totals.income).toBe(0);
      expect(totals.expenses).toBe(0);
      expect(totals.net).toBe(0);
      expect(totals.count).toBe(0);
    });

    it("should handle only income transactions", () => {
      const incomeTransactions = [
        { id: "1", amount: 1000 },
        { id: "2", amount: 500 },
      ];

      const { result } = renderHook(() => useTransactionUtils());

      const totals =
        result.current.calculateTransactionTotals(incomeTransactions);

      expect(totals.income).toBe(1500);
      expect(totals.expenses).toBe(0);
      expect(totals.net).toBe(1500);
    });
  });

  describe("groupTransactionsByCategory", () => {
    it("should group transactions by category", () => {
      const { result } = renderHook(() => useTransactionUtils());

      const grouped =
        result.current.groupTransactionsByCategory(mockTransactions);

      expect(Object.keys(grouped)).toHaveLength(3);
      expect(grouped["Food"]).toHaveLength(1);
      expect(grouped["Income"]).toHaveLength(1);
      expect(grouped["Transportation"]).toHaveLength(1);
    });

    it("should handle transactions without categories", () => {
      const transactionsWithoutCategory = [
        { id: "1", description: "Test", amount: 100 },
        { id: "2", description: "Test 2", amount: 200, category: "Food" },
      ];

      const { result } = renderHook(() => useTransactionUtils());

      const grouped = result.current.groupTransactionsByCategory(
        transactionsWithoutCategory,
      );

      expect(grouped["Uncategorized"]).toHaveLength(1);
      expect(grouped["Food"]).toHaveLength(1);
    });
  });

  describe("formatTransactionAmount", () => {
    it("should format positive amounts correctly", () => {
      const { result } = renderHook(() => useTransactionUtils());

      const formatted = result.current.formatTransactionAmount(1234.56);

      expect(formatted).toBe("+$1,234.56");
    });

    it("should format negative amounts correctly", () => {
      const { result } = renderHook(() => useTransactionUtils());

      const formatted = result.current.formatTransactionAmount(-1234.56);

      expect(formatted).toBe("-$1,234.56");
    });

    it("should format zero correctly", () => {
      const { result } = renderHook(() => useTransactionUtils());

      const formatted = result.current.formatTransactionAmount(0);

      expect(formatted).toBe("$0.00");
    });

    it("should handle custom options", () => {
      const { result } = renderHook(() => useTransactionUtils());

      const formatted = result.current.formatTransactionAmount(1234.56, {
        currency: "EUR",
        showSign: false,
      });

      expect(formatted).toBe("€1,234.56");
    });
  });

  describe("validateTransaction", () => {
    it("should validate complete transaction", () => {
      const validTransaction = {
        description: "Test Transaction",
        amount: 100,
        date: "2024-01-15",
        category: "Food",
      };

      const { result } = renderHook(() => useTransactionUtils());

      const validation = result.current.validateTransaction(validTransaction);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual({});
    });

    it("should detect missing required fields", () => {
      const invalidTransaction = {
        amount: 100,
      };

      const { result } = renderHook(() => useTransactionUtils());

      const validation = result.current.validateTransaction(invalidTransaction);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.description).toBeDefined();
      expect(validation.errors.date).toBeDefined();
    });

    it("should validate amount format", () => {
      const invalidTransaction = {
        description: "Test",
        amount: "invalid",
        date: "2024-01-15",
      };

      const { result } = renderHook(() => useTransactionUtils());

      const validation = result.current.validateTransaction(invalidTransaction);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.amount).toBeDefined();
    });

    it("should validate date format", () => {
      const invalidTransaction = {
        description: "Test",
        amount: 100,
        date: "invalid-date",
      };

      const { result } = renderHook(() => useTransactionUtils());

      const validation = result.current.validateTransaction(invalidTransaction);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.date).toBeDefined();
    });
  });
});
