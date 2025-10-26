// Budget Database Service Tests
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { budgetDatabaseService } from "@/services/budgetDatabaseService";
import { budgetDb } from "@/db/budgetDb";

// Mock the database
vi.mock("../../db/budgetDb", () => ({
  budgetDb: {
    open: vi.fn(),
    close: vi.fn(),
    isOpen: vi.fn(),
    getDatabaseStats: vi.fn(),
    getActiveEnvelopes: vi.fn(),
    getEnvelopesByCategory: vi.fn(),
    bulkUpsertEnvelopes: vi.fn(),
    getTransactionsByDateRange: vi.fn(),
    getTransactionsByEnvelope: vi.fn(),
    getTransactionsByCategory: vi.fn(),
    getTransactionsByType: vi.fn(),
    bulkUpsertTransactions: vi.fn(),
    getBillsByCategory: vi.fn(),
    getPaidBills: vi.fn(),
    getUpcomingBills: vi.fn(),
    getOverdueBills: vi.fn(),
    bills: {
      toArray: vi.fn(),
      clear: vi.fn(),
    },
    bulkUpsertBills: vi.fn(),
    getSavingsGoalsByCategory: vi.fn(),
    getSavingsGoalsByPriority: vi.fn(),
    getCompletedSavingsGoals: vi.fn(),
    getActiveSavingsGoals: vi.fn(),
    savingsGoals: { toArray: vi.fn() },
    bulkUpsertSavingsGoals: vi.fn(),
    getPaychecksBySource: vi.fn(),
    getPaychecksByDateRange: vi.fn(),
    getPaycheckHistory: vi.fn(),
    bulkUpsertPaychecks: vi.fn(),
    debts: {
      toArray: vi.fn(),
      clear: vi.fn(),
    },
    bulkUpsertDebts: vi.fn(),
    budget: {
      get: vi.fn(),
      put: vi.fn(),
      clear: vi.fn(),
    },
    envelopes: { clear: vi.fn() },
    transactions: { clear: vi.fn() },
    bills: { clear: vi.fn() },
    savingsGoals: { clear: vi.fn() },
    paycheckHistory: { clear: vi.fn() },
    cache: { clear: vi.fn() },
    auditLog: { clear: vi.fn() },
    transaction: vi.fn(),
    getCachedValue: vi.fn(),
    setCachedValue: vi.fn(),
    clearCacheCategory: vi.fn(),
    getAnalyticsData: vi.fn(),
    batchUpdate: vi.fn(),
    optimizeDatabase: vi.fn(),
  },
}));

describe("BudgetDatabaseService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("initialize", () => {
    it("should initialize successfully", async () => {
      budgetDb.open.mockResolvedValue(true);

      const result = await budgetDatabaseService.initialize();

      expect(result).toBe(true);
      expect(budgetDb.open).toHaveBeenCalledTimes(1);
    });

    it("should handle initialization errors", async () => {
      const error = new Error("Database connection failed");
      budgetDb.open.mockRejectedValue(error);

      await expect(budgetDatabaseService.initialize()).rejects.toThrow(
        "Database connection failed"
      );
    });
  });

  describe("getStats", () => {
    it("should return database statistics", async () => {
      const mockStats = {
        envelopes: 10,
        transactions: 100,
        bills: 5,
        savingsGoals: 3,
        paychecks: 20,
        cache: 15,
      };

      budgetDb.getDatabaseStats.mockResolvedValue(mockStats);

      const result = await budgetDatabaseService.getStats();

      expect(result).toEqual(mockStats);
      expect(budgetDb.getDatabaseStats).toHaveBeenCalledTimes(1);
    });
  });

  describe("getEnvelopes", () => {
    it("should get active envelopes with default options", async () => {
      const mockEnvelopes = [
        { id: "1", name: "Food", archived: false },
        { id: "2", name: "Gas", archived: false },
      ];

      budgetDb.getActiveEnvelopes.mockResolvedValue(mockEnvelopes);

      const result = await budgetDatabaseService.getEnvelopes();

      expect(result).toEqual(mockEnvelopes);
      expect(budgetDb.getActiveEnvelopes).toHaveBeenCalledTimes(1);
    });

    it("should get envelopes by category", async () => {
      const mockEnvelopes = [{ id: "1", name: "Food", category: "expenses", archived: false }];

      budgetDb.getEnvelopesByCategory.mockResolvedValue(mockEnvelopes);

      const result = await budgetDatabaseService.getEnvelopes({
        category: "expenses",
        includeArchived: false,
      });

      expect(result).toEqual(mockEnvelopes);
      expect(budgetDb.getEnvelopesByCategory).toHaveBeenCalledWith("expenses", false);
    });

    it("should use cached data when available", async () => {
      const mockEnvelopes = [{ id: "1", name: "Food" }];

      budgetDb.getCachedValue.mockResolvedValue(mockEnvelopes);

      const result = await budgetDatabaseService.getEnvelopes({
        useCache: true,
      });

      expect(result).toEqual(mockEnvelopes);
      expect(budgetDb.getCachedValue).toHaveBeenCalledWith("budget_db_envelopes_active", 300000);
    });
  });

  describe("saveEnvelopes", () => {
    it("should save envelopes and invalidate cache", async () => {
      const envelopes = [
        { id: "1", name: "Food" },
        { id: "2", name: "Gas" },
      ];

      budgetDb.bulkUpsertEnvelopes.mockResolvedValue(true);
      budgetDb.clearCacheCategory.mockResolvedValue(true);

      await budgetDatabaseService.saveEnvelopes(envelopes);

      expect(budgetDb.bulkUpsertEnvelopes).toHaveBeenCalledWith(envelopes);
      expect(budgetDb.clearCacheCategory).toHaveBeenCalledWith("envelopes");
    });
  });

  describe("getTransactions", () => {
    it("should get transactions by date range", async () => {
      const mockTransactions = [
        { id: "1", date: "2024-01-01", amount: 100 },
        { id: "2", date: "2024-01-02", amount: 50 },
      ];

      const dateRange = {
        start: new Date("2024-01-01"),
        end: new Date("2024-01-31"),
      };

      budgetDb.getTransactionsByDateRange.mockResolvedValue(mockTransactions);

      const result = await budgetDatabaseService.getTransactions({
        dateRange,
        limit: 100,
      });

      expect(result).toEqual(mockTransactions);
      expect(budgetDb.getTransactionsByDateRange).toHaveBeenCalledWith(
        dateRange.start,
        dateRange.end
      );
    });

    it("should get transactions by envelope", async () => {
      const mockTransactions = [{ id: "1", envelopeId: "env1", amount: 100 }];

      budgetDb.getTransactionsByEnvelope.mockResolvedValue(mockTransactions);

      const result = await budgetDatabaseService.getTransactions({
        envelopeId: "env1",
      });

      expect(result).toEqual(mockTransactions);
      expect(budgetDb.getTransactionsByEnvelope).toHaveBeenCalledWith("env1", undefined);
    });

    it("should limit results when specified", async () => {
      const mockTransactions = Array.from({ length: 200 }, (_, i) => ({
        id: `${i}`,
        amount: 100,
      }));

      const dateRange = {
        start: new Date("2024-01-01"),
        end: new Date("2024-01-31"),
      };

      budgetDb.getTransactionsByDateRange.mockResolvedValue(mockTransactions);

      const result = await budgetDatabaseService.getTransactions({
        dateRange,
        limit: 50,
      });

      expect(result).toHaveLength(50);
      expect(result).toEqual(mockTransactions.slice(0, 50));
    });
  });

  describe("getBills", () => {
    it("should get bills by payment status", async () => {
      const upcomingBills = [{ id: "1", isPaid: false, dueDate: new Date() }];
      const overdueBills = [{ id: "2", isPaid: false, dueDate: new Date() }];

      budgetDb.getUpcomingBills.mockResolvedValue(upcomingBills);
      budgetDb.getOverdueBills.mockResolvedValue(overdueBills);

      const result = await budgetDatabaseService.getBills({
        isPaid: false,
        daysAhead: 30,
      });

      expect(result).toEqual([...overdueBills, ...upcomingBills]);
      expect(budgetDb.getUpcomingBills).toHaveBeenCalledWith(30);
      expect(budgetDb.getOverdueBills).toHaveBeenCalledTimes(1);
    });

    it("should get paid bills", async () => {
      const paidBills = [{ id: "1", isPaid: true }];

      budgetDb.getPaidBills.mockResolvedValue(paidBills);

      const result = await budgetDatabaseService.getBills({
        isPaid: true,
      });

      expect(result).toEqual(paidBills);
      expect(budgetDb.getPaidBills).toHaveBeenCalledTimes(1);
    });
  });

  describe("getBudgetMetadata", () => {
    it("should return budget metadata", async () => {
      const mockMetadata = {
        unassignedCash: 1000,
        actualBalance: 5000,
        lastModified: Date.now(),
      };

      budgetDb.budget.get.mockResolvedValue(mockMetadata);

      const result = await budgetDatabaseService.getBudgetMetadata();

      expect(result).toEqual(mockMetadata);
      expect(budgetDb.budget.get).toHaveBeenCalledWith("metadata");
    });

    it("should return null when no metadata exists", async () => {
      budgetDb.budget.get.mockResolvedValue(undefined);

      const result = await budgetDatabaseService.getBudgetMetadata();

      expect(result).toBeNull();
    });
  });

  describe("getAnalyticsData", () => {
    it("should return analytics data with caching", async () => {
      const dateRange = {
        start: new Date("2024-01-01"),
        end: new Date("2024-01-31"),
      };
      const mockData = [{ id: "1", amount: 100 }];

      budgetDb.getCachedValue.mockResolvedValue(null);
      budgetDb.getAnalyticsData.mockResolvedValue(mockData);
      budgetDb.setCachedValue.mockResolvedValue(true);

      const result = await budgetDatabaseService.getAnalyticsData(dateRange, {
        includeTransfers: false,
        useCache: true,
      });

      expect(result).toEqual(mockData);
      expect(budgetDb.getAnalyticsData).toHaveBeenCalledWith(dateRange, false);
      expect(budgetDb.setCachedValue).toHaveBeenCalled();
    });

    it("should return cached data when available", async () => {
      const dateRange = {
        start: new Date("2024-01-01"),
        end: new Date("2024-01-31"),
      };
      const cachedData = [{ id: "cached", amount: 200 }];

      budgetDb.getCachedValue.mockResolvedValue(cachedData);

      const result = await budgetDatabaseService.getAnalyticsData(dateRange, {
        useCache: true,
      });

      expect(result).toEqual(cachedData);
      expect(budgetDb.getAnalyticsData).not.toHaveBeenCalled();
    });
  });

  describe("clearData", () => {
    it("should clear all budget data", async () => {
      budgetDb.transaction.mockImplementation((mode, tables, fn) => fn());

      await budgetDatabaseService.clearData();

      expect(budgetDb.budget.clear).toHaveBeenCalledTimes(1);
      expect(budgetDb.envelopes.clear).toHaveBeenCalledTimes(1);
      expect(budgetDb.transactions.clear).toHaveBeenCalledTimes(1);
      expect(budgetDb.bills.clear).toHaveBeenCalledTimes(1);
      expect(budgetDb.savingsGoals.clear).toHaveBeenCalledTimes(1);
      expect(budgetDb.paycheckHistory.clear).toHaveBeenCalledTimes(1);
      expect(budgetDb.cache.clear).toHaveBeenCalledTimes(1);
      expect(budgetDb.auditLog.clear).toHaveBeenCalledTimes(1);
    });
  });

  describe("getStatus", () => {
    it("should return service status", () => {
      budgetDb.isOpen.mockReturnValue(true);

      const status = budgetDatabaseService.getStatus();

      expect(status).toEqual({
        isInitialized: true,
        cachePrefix: "budget_db_",
        defaultCacheTtl: 300000,
      });
    });
  });
});
