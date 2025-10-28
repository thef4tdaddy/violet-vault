import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTransactionUtils } from "../useTransactionUtils";

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
      envelopeId: "env1",
      tags: ["groceries", "food"],
    },
    {
      id: "2",
      description: "Salary",
      amount: 3000.0,
      date: "2024-01-01T09:00:00Z",
      category: "Income",
      envelopeId: "env2",
      tags: ["salary"],
    },
    {
      id: "3",
      description: "Gas Station",
      amount: -35.0,
      date: "2024-01-10T16:30:00Z",
      category: "Transportation",
      envelopeId: "env1",
      tags: ["gas", "car"],
    },
  ];

  describe("getTransactionById", () => {
    it("should find transaction by id", () => {
      const { result } = renderHook(() => useTransactionUtils(mockTransactions));

      const transaction = result.current.getTransactionById("1");

      expect(transaction).toBeDefined();
      expect(transaction?.id).toBe("1");
      expect(transaction?.description).toBe("Grocery Store");
    });

    it("should return undefined for non-existent id", () => {
      const { result } = renderHook(() => useTransactionUtils(mockTransactions));

      const transaction = result.current.getTransactionById("999");

      expect(transaction).toBeUndefined();
    });
  });

  describe("getTransactionsByEnvelope", () => {
    it("should filter transactions by envelope id", () => {
      const { result } = renderHook(() => useTransactionUtils(mockTransactions));

      const filtered = result.current.getTransactionsByEnvelope("env1");

      expect(filtered).toHaveLength(2);
      expect(filtered.map((t) => t.id)).toContain("1");
      expect(filtered.map((t) => t.id)).toContain("3");
    });

    it("should return empty array for non-existent envelope", () => {
      const { result } = renderHook(() => useTransactionUtils(mockTransactions));

      const filtered = result.current.getTransactionsByEnvelope("nonexistent");

      expect(filtered).toHaveLength(0);
    });
  });

  describe("getTransactionsByCategory", () => {
    it("should filter transactions by category", () => {
      const { result } = renderHook(() => useTransactionUtils(mockTransactions));

      const filtered = result.current.getTransactionsByCategory("Food");

      expect(filtered).toHaveLength(1);
      expect(filtered[0].category).toBe("Food");
    });

    it("should return empty array for non-existent category", () => {
      const { result } = renderHook(() => useTransactionUtils(mockTransactions));

      const filtered = result.current.getTransactionsByCategory("NonExistent");

      expect(filtered).toHaveLength(0);
    });
  });

  describe("availableCategories", () => {
    it("should return sorted list of unique categories", () => {
      const { result } = renderHook(() => useTransactionUtils(mockTransactions));

      const categories = result.current.availableCategories;

      expect(categories).toHaveLength(3);
      expect(categories).toContain("Food");
      expect(categories).toContain("Income");
      expect(categories).toContain("Transportation");
      expect(categories).toEqual(categories.slice().sort());
    });

    it("should handle transactions with no categories", () => {
      const transactionsWithoutCategory = [
        { id: "1", description: "Test", amount: 100, category: undefined },
        { id: "2", description: "Test 2", amount: 200, category: "Food" },
      ];

      const { result } = renderHook(() => useTransactionUtils(transactionsWithoutCategory));

      const categories = result.current.availableCategories;

      expect(categories).toHaveLength(1);
      expect(categories).toContain("Food");
    });
  });

  describe("date range helpers", () => {
    it("should return current month date range", () => {
      const { result } = renderHook(() => useTransactionUtils(mockTransactions));

      const { start, end } = result.current.getThisMonth();

      expect(start).toBeInstanceOf(Date);
      expect(end).toBeInstanceOf(Date);
      expect(start.getDate()).toBe(1);
    });

    it("should return last month date range", () => {
      const { result } = renderHook(() => useTransactionUtils(mockTransactions));

      const { start, end } = result.current.getLastMonth();

      expect(start).toBeInstanceOf(Date);
      expect(end).toBeInstanceOf(Date);
      expect(start.getDate()).toBe(1);
    });

    it("should return last 30 days date range", () => {
      const { result } = renderHook(() => useTransactionUtils(mockTransactions));

      const { start, end } = result.current.getLast30Days();

      expect(start).toBeInstanceOf(Date);
      expect(end).toBeInstanceOf(Date);
      
      const daysDiff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBeGreaterThanOrEqual(29);
      expect(daysDiff).toBeLessThanOrEqual(30);
    });
  });
});
