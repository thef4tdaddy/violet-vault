/**
 * Tests for Minimal Analytics Service
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  calculateHeatmap,
  calculateTrends,
  calculateCategoryBreakdown,
  getQuickStats,
  invalidateAnalyticsCache,
  isWebWorkerSupported,
} from "../minimalAnalyticsService";
import type { Transaction } from "../minimalAnalyticsService";

// Mock logger
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock db
vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    cache: {
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn(() => Promise.resolve([])),
        })),
      })),
      bulkDelete: vi.fn(() => Promise.resolve()),
    },
  },
}));

describe("minimalAnalyticsService", () => {
  const mockTransactions: Transaction[] = [
    {
      id: "1",
      date: "2024-01-15",
      amount: -50.0,
      category: "Groceries",
      envelopeId: "env1",
    },
    {
      id: "2",
      date: "2024-01-15",
      amount: -30.0,
      category: "Transportation",
      envelopeId: "env2",
    },
    {
      id: "3",
      date: "2024-01-16",
      amount: -75.5,
      category: "Groceries",
      envelopeId: "env1",
    },
    {
      id: "4",
      date: "2024-01-16",
      amount: 1000.0,
      category: "Salary",
      envelopeId: "env3",
    },
    {
      id: "5",
      date: "2024-02-01",
      amount: -100.0,
      category: "Utilities",
      envelopeId: "env4",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("calculateHeatmap", () => {
    it("should calculate daily spending heatmap", async () => {
      const result = await calculateHeatmap(mockTransactions, false);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // Check structure
      const firstEntry = result[0];
      expect(firstEntry).toHaveProperty("date");
      expect(firstEntry).toHaveProperty("value");
      expect(firstEntry).toHaveProperty("transactions");
    });

    it("should skip income transactions in heatmap", async () => {
      const result = await calculateHeatmap(mockTransactions, false);

      // Income transaction should not be counted
      const totalValue = result.reduce((sum, entry) => sum + entry.value, 0);
      expect(totalValue).toBeCloseTo(255.5, 2); // -50 -30 -75.50 -100
    });

    it("should group transactions by date", async () => {
      const result = await calculateHeatmap(mockTransactions, false);

      // Should have entries for different dates
      const jan15Entry = result.find((entry) => entry.date === "2024-01-15");
      const jan16Entry = result.find((entry) => entry.date === "2024-01-16");
      const feb01Entry = result.find((entry) => entry.date === "2024-02-01");

      expect(jan15Entry).toBeDefined();
      expect(jan16Entry).toBeDefined();
      expect(feb01Entry).toBeDefined();

      expect(jan15Entry?.value).toBeCloseTo(80.0, 2);
      expect(jan15Entry?.transactions).toBe(2);

      expect(jan16Entry?.value).toBeCloseTo(75.5, 2);
      expect(jan16Entry?.transactions).toBe(1);
    });

    it("should handle empty transactions array", async () => {
      const result = await calculateHeatmap([], false);
      expect(result).toEqual([]);
    });

    it("should complete within performance target for 1k transactions", async () => {
      // Generate 1000 transactions
      const largeDataset: Transaction[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `tx${i}`,
        date: new Date(2024, 0, 1 + (i % 30)).toISOString(),
        amount: -(Math.random() * 100 + 10),
        category: ["Groceries", "Transportation", "Utilities"][i % 3],
      }));

      const startTime = performance.now();
      await calculateHeatmap(largeDataset, false);
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(50); // Target: <50ms for 1k transactions
    });
  });

  describe("calculateTrends", () => {
    it("should calculate monthly trends", async () => {
      const result = await calculateTrends(mockTransactions, "monthly", false);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // Check structure
      const firstEntry = result[0];
      expect(firstEntry).toHaveProperty("period");
      expect(firstEntry).toHaveProperty("income");
      expect(firstEntry).toHaveProperty("expenses");
      expect(firstEntry).toHaveProperty("net");
      expect(firstEntry).toHaveProperty("count");
    });

    it("should separate income and expenses", async () => {
      const result = await calculateTrends(mockTransactions, "monthly", false);

      const janEntry = result.find((entry) => entry.period === "2024-01");
      expect(janEntry).toBeDefined();
      expect(janEntry?.income).toBe(1000.0);
      expect(janEntry?.expenses).toBeCloseTo(155.5, 2);
      expect(janEntry?.net).toBeCloseTo(844.5, 2);
    });

    it("should calculate daily trends", async () => {
      const result = await calculateTrends(mockTransactions, "daily", false);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].period).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD format
    });

    it("should calculate weekly trends", async () => {
      const result = await calculateTrends(mockTransactions, "weekly", false);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].period).toMatch(/^\d{4}-W\d{2}$/); // YYYY-W## format
    });

    it("should sort trends by period", async () => {
      const result = await calculateTrends(mockTransactions, "monthly", false);

      for (let i = 1; i < result.length; i++) {
        expect(result[i].period >= result[i - 1].period).toBe(true);
      }
    });

    it("should handle empty transactions array", async () => {
      const result = await calculateTrends([], "monthly", false);
      expect(result).toEqual([]);
    });

    it("should complete within performance target for 5k transactions", async () => {
      // Generate 5000 transactions
      const largeDataset: Transaction[] = Array.from({ length: 5000 }, (_, i) => ({
        id: `tx${i}`,
        date: new Date(2024, 0, 1 + (i % 365)).toISOString(),
        amount: i % 2 === 0 ? -(Math.random() * 100) : Math.random() * 1000,
        category: ["Groceries", "Salary"][i % 2],
      }));

      const startTime = performance.now();
      await calculateTrends(largeDataset, "monthly", false);
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(200); // Target: <200ms for 5k transactions
    });
  });

  describe("calculateCategoryBreakdown", () => {
    it("should calculate category breakdown", () => {
      const result = calculateCategoryBreakdown(mockTransactions);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // Check structure
      const firstEntry = result[0];
      expect(firstEntry).toHaveProperty("category");
      expect(firstEntry).toHaveProperty("amount");
      expect(firstEntry).toHaveProperty("count");
      expect(firstEntry).toHaveProperty("percentage");
    });

    it("should skip income transactions", () => {
      const result = calculateCategoryBreakdown(mockTransactions);

      // Should not include "Salary" category (income)
      const salaryCategory = result.find((entry) => entry.category === "Salary");
      expect(salaryCategory).toBeUndefined();
    });

    it("should calculate correct amounts per category", () => {
      const result = calculateCategoryBreakdown(mockTransactions);

      const groceries = result.find((entry) => entry.category === "Groceries");
      expect(groceries?.amount).toBeCloseTo(125.5, 2); // 50 + 75.50
      expect(groceries?.count).toBe(2);

      const transportation = result.find((entry) => entry.category === "Transportation");
      expect(transportation?.amount).toBe(30.0);
      expect(transportation?.count).toBe(1);

      const utilities = result.find((entry) => entry.category === "Utilities");
      expect(utilities?.amount).toBe(100.0);
      expect(utilities?.count).toBe(1);
    });

    it("should calculate percentages correctly", () => {
      const result = calculateCategoryBreakdown(mockTransactions);

      const totalExpenses = 255.5; // 50 + 30 + 75.50 + 100
      const groceries = result.find((entry) => entry.category === "Groceries");

      expect(groceries?.percentage).toBeCloseTo((125.5 / totalExpenses) * 100, 1);
    });

    it("should sort by amount descending", () => {
      const result = calculateCategoryBreakdown(mockTransactions);

      for (let i = 1; i < result.length; i++) {
        expect(result[i].amount <= result[i - 1].amount).toBe(true);
      }
    });

    it("should handle uncategorized transactions", () => {
      const txnsWithUncategorized: Transaction[] = [
        { id: "1", date: "2024-01-01", amount: -50 },
        { id: "2", date: "2024-01-01", amount: -30, category: "" },
      ];

      const result = calculateCategoryBreakdown(txnsWithUncategorized);

      const uncategorized = result.find((entry) => entry.category === "Uncategorized");
      expect(uncategorized).toBeDefined();
      expect(uncategorized?.amount).toBe(80);
      expect(uncategorized?.count).toBe(2);
    });
  });

  describe("getQuickStats", () => {
    it("should calculate quick statistics", () => {
      const result = getQuickStats(mockTransactions);

      expect(result).toBeDefined();
      expect(result).toHaveProperty("totalIncome");
      expect(result).toHaveProperty("totalExpenses");
      expect(result).toHaveProperty("netCashFlow");
      expect(result).toHaveProperty("transactionCount");
      expect(result).toHaveProperty("avgTransaction");
    });

    it("should calculate correct totals", () => {
      const result = getQuickStats(mockTransactions);

      expect(result.totalIncome).toBe(1000.0);
      expect(result.totalExpenses).toBeCloseTo(255.5, 2);
      expect(result.netCashFlow).toBeCloseTo(744.5, 2);
      expect(result.transactionCount).toBe(5);
    });

    it("should calculate average transaction", () => {
      const result = getQuickStats(mockTransactions);

      const expectedAvg = (1000.0 + 255.5) / 5;
      expect(result.avgTransaction).toBeCloseTo(expectedAvg, 2);
    });

    it("should handle empty transactions array", () => {
      const result = getQuickStats([]);

      expect(result.totalIncome).toBe(0);
      expect(result.totalExpenses).toBe(0);
      expect(result.netCashFlow).toBe(0);
      expect(result.transactionCount).toBe(0);
      expect(result.avgTransaction).toBe(0);
    });

    it("should complete within performance target for 10k transactions", () => {
      // Generate 10000 transactions
      const largeDataset: Transaction[] = Array.from({ length: 10000 }, (_, i) => ({
        id: `tx${i}`,
        date: new Date(2024, 0, 1 + (i % 365)).toISOString(),
        amount: i % 2 === 0 ? -(Math.random() * 100) : Math.random() * 1000,
        category: ["Groceries", "Salary"][i % 2],
      }));

      const startTime = performance.now();
      getQuickStats(largeDataset);
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(500); // Target: <500ms for 10k transactions
    });
  });

  describe("invalidateAnalyticsCache", () => {
    it("should invalidate analytics cache", async () => {
      await invalidateAnalyticsCache();

      // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe("isWebWorkerSupported", () => {
    it("should check for Web Worker support", () => {
      const result = isWebWorkerSupported();
      expect(typeof result).toBe("boolean");
    });
  });
});
