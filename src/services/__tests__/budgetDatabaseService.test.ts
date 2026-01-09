// Budget Database Service Tests
import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from "vitest";
import { budgetDatabaseService } from "../budget/budgetDatabaseService";
import { budgetDb } from "../../db/budgetDb";

// Setup repeatable mocks for Dexie chains
const mockCollection = {
  equals: vi.fn().mockReturnThis(),
  toArray: vi.fn().mockResolvedValue([]),
};

// Mock the database
vi.mock("../../db/budgetDb", () => ({
  budgetDb: {
    open: vi.fn().mockResolvedValue(undefined),
    isOpen: vi.fn().mockReturnValue(true),
    envelopes: {
      toArray: vi.fn().mockResolvedValue([]),
      bulkPut: vi.fn().mockResolvedValue(undefined),
      where: vi.fn().mockReturnThis(),
      clear: vi.fn().mockResolvedValue(undefined),
    },
    transactions: {
      toArray: vi.fn().mockResolvedValue([]),
      clear: vi.fn().mockResolvedValue(undefined),
    },
    budget: {
      get: vi.fn().mockResolvedValue(null),
      clear: vi.fn().mockResolvedValue(undefined),
    },
    cache: {
      clear: vi.fn().mockResolvedValue(undefined),
    },
    auditLog: {
      clear: vi.fn().mockResolvedValue(undefined),
    },
    autoFundingRules: {
      clear: vi.fn().mockResolvedValue(undefined),
    },
    autoFundingHistory: {
      clear: vi.fn().mockResolvedValue(undefined),
    },
    offlineRequestQueue: {
      clear: vi.fn().mockResolvedValue(undefined),
    },
    bulkUpsertEnvelopes: vi.fn().mockResolvedValue(undefined),
    bulkUpsertTransactions: vi.fn().mockResolvedValue(undefined),
    saveEnvelopes: vi.fn().mockResolvedValue(undefined),
    saveTransactions: vi.fn().mockResolvedValue(undefined),
    getBudgetMetadata: vi.fn().mockResolvedValue(null),
    saveBudgetMetadata: vi.fn().mockResolvedValue(undefined),
    getDatabaseStats: vi.fn().mockResolvedValue({}),
    getActiveEnvelopes: vi.fn().mockResolvedValue([]),
    getEnvelopesByCategory: vi.fn().mockResolvedValue([]),
    getCachedValue: vi.fn().mockResolvedValue(null),
    setCachedValue: vi.fn().mockResolvedValue(undefined),
    clearCacheCategory: vi.fn().mockResolvedValue(undefined),
    getTransactionsByDateRange: vi.fn().mockResolvedValue([]),
    getTransactionsByEnvelope: vi.fn().mockResolvedValue([]),
    getAnalyticsData: vi.fn().mockResolvedValue({}),
    transaction: vi.fn().mockImplementation((_mode, _tables, fn) => fn()),
    bulkUpsertAutoFundingRules: vi.fn().mockResolvedValue(undefined),
    cleanupCache: vi.fn().mockResolvedValue(undefined),
    optimizeDatabase: vi.fn().mockResolvedValue(undefined),
    createBudgetCommit: vi.fn().mockResolvedValue("hash"),
    createBudgetChanges: vi.fn().mockResolvedValue(1),
    createBudgetBranch: vi.fn().mockResolvedValue(1),
    createBudgetTag: vi.fn().mockResolvedValue(1),
  },
}));

describe("BudgetDatabaseService", () => {
  const mockEnvelopes = [
    {
      id: "1",
      name: "Food",
      category: "expenses",
      archived: false,
      lastModified: 1700000000000,
      type: "standard",
      autoAllocate: true,
      color: "#3B82F6",
      currentBalance: 0,
    },
    {
      id: "2",
      name: "Gas",
      category: "expenses",
      archived: false,
      lastModified: 1700000000000,
      type: "standard",
      autoAllocate: true,
      color: "#3B82F6",
      currentBalance: 0,
    },
  ];

  const mockTransactions = [
    {
      id: "1",
      date: "2024-01-01",
      amount: -100,
      envelopeId: "env1",
      category: "food",
      type: "expense",
      lastModified: 1700000000000,
      isScheduled: false,
    },
    {
      id: "2",
      date: "2024-01-02",
      amount: -50,
      envelopeId: "env2",
      category: "gas",
      type: "expense",
      lastModified: 1700000000000,
      isScheduled: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Default toArray to avoid validation errors with undefined
    (budgetDb.envelopes.toArray as Mock).mockResolvedValue([]);
    (budgetDb.transactions.toArray as Mock).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("initialize", () => {
    it("should initialize successfully", async () => {
      (budgetDb.open as Mock).mockResolvedValue(true);

      const result = await budgetDatabaseService.initialize();

      expect(result).toBe(true);
      expect(budgetDb.open).toHaveBeenCalledTimes(1);
    });

    it("should handle initialization errors", async () => {
      const error = new Error("Database connection failed");
      (budgetDb.open as Mock).mockRejectedValue(error);

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

      (budgetDb.getDatabaseStats as Mock).mockResolvedValue(mockStats);

      const result = await budgetDatabaseService.getStats();

      expect(result).toEqual(mockStats);
      expect(budgetDb.getDatabaseStats).toHaveBeenCalledTimes(1);
    });
  });

  describe("getEnvelopes", () => {
    it("should get active envelopes with default options", async () => {
      (budgetDb.getActiveEnvelopes as Mock).mockResolvedValue(mockEnvelopes);

      const result = await budgetDatabaseService.getEnvelopes();

      expect(result).toEqual(mockEnvelopes);
      expect(budgetDb.getActiveEnvelopes).toHaveBeenCalledTimes(1);
    });

    it("should get envelopes by category", async () => {
      const categoryEnvelopes = [mockEnvelopes[0]];
      (budgetDb.getEnvelopesByCategory as Mock).mockResolvedValue(categoryEnvelopes);

      const result = await budgetDatabaseService.getEnvelopes({
        category: "expenses",
        includeArchived: false,
      });

      expect(result).toEqual(categoryEnvelopes);
      expect(budgetDb.getEnvelopesByCategory).toHaveBeenCalledWith("expenses", false);
    });

    it("should use cached data when available", async () => {
      const cachedEnvelopes = [mockEnvelopes[0]];
      (budgetDb.getCachedValue as Mock).mockResolvedValue(cachedEnvelopes);

      const result = await budgetDatabaseService.getEnvelopes({
        useCache: true,
      });

      expect(result).toEqual(cachedEnvelopes);
      expect(budgetDb.getCachedValue).toHaveBeenCalledWith("budget_db_envelopes_active", 300000);
    });

    it("should return empty array for invalid envelope data", async () => {
      const invalidData = [{ id: "1", name: "Missing required fields" }];

      (budgetDb.getActiveEnvelopes as Mock).mockResolvedValue(invalidData);

      const result = await budgetDatabaseService.getEnvelopes();

      expect(result).toEqual([]);
    });
  });

  describe("saveEnvelopes", () => {
    it("should save envelopes and invalidate cache", async () => {
      (budgetDb.envelopes.bulkPut as Mock).mockResolvedValue(true);
      (budgetDb.clearCacheCategory as Mock).mockResolvedValue(true);

      await budgetDatabaseService.saveEnvelopes(mockEnvelopes);

      expect(budgetDb.bulkUpsertEnvelopes).toHaveBeenCalled();
      expect(budgetDb.clearCacheCategory).toHaveBeenCalledWith("envelopes");
    });

    it("should throw error for invalid envelope data", async () => {
      const invalidEnvelopes = [{ id: "1", name: "Missing required fields" }];

      await expect(budgetDatabaseService.saveEnvelopes(invalidEnvelopes as any)).rejects.toThrow(
        /Invalid envelopes data/i
      );
    });
  });

  describe("getTransactions", () => {
    it("should get transactions by date range", async () => {
      const dateRange = {
        start: new Date("2024-01-01"),
        end: new Date("2024-01-31"),
      };

      (budgetDb.getTransactionsByDateRange as Mock).mockResolvedValue(mockTransactions);

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
      const envelopeTransactions = [mockTransactions[0]];
      (budgetDb.getTransactionsByEnvelope as Mock).mockResolvedValue(envelopeTransactions);

      const result = await budgetDatabaseService.getTransactions({
        envelopeId: "env1",
      });

      expect(result).toEqual(envelopeTransactions);
      expect(budgetDb.getTransactionsByEnvelope).toHaveBeenCalledWith("env1", undefined);
    });

    it("should limit results when specified", async () => {
      const longMockTransactions = Array.from({ length: 200 }, (_, i) => ({
        id: `${i}`,
        date: "2024-01-01",
        amount: -100,
        envelopeId: "env1",
        category: "food",
        type: "expense" as const,
        lastModified: 1700000000000,
        isScheduled: false,
      }));

      const dateRange = {
        start: new Date("2024-01-01"),
        end: new Date("2024-01-31"),
      };

      (budgetDb.getTransactionsByDateRange as Mock).mockResolvedValue(longMockTransactions);

      const result = await budgetDatabaseService.getTransactions({
        dateRange,
        limit: 50,
      });

      expect(result).toHaveLength(50);
      expect(result).toEqual(longMockTransactions.slice(0, 50));
    });

    it("should return empty array for invalid transaction data from database", async () => {
      const invalidData = [{ id: "1", amount: "invalid" }];

      const dateRange = {
        start: new Date("2024-01-01"),
        end: new Date("2024-01-31"),
      };

      (budgetDb.getTransactionsByDateRange as Mock).mockResolvedValue(invalidData);

      const result = await budgetDatabaseService.getTransactions({
        dateRange,
      });

      expect(result).toEqual([]);
    });
  });

  describe("saveTransactions", () => {
    it("should save valid transactions", async () => {
      const transactions = [
        {
          id: "1",
          date: new Date(),
          amount: -100,
          envelopeId: "env1",
          category: "food",
          type: "expense" as const,
          lastModified: Date.now(),
          isScheduled: false,
        },
      ];

      (budgetDb.bulkUpsertTransactions as Mock).mockResolvedValue(true);
      (budgetDb.clearCacheCategory as Mock).mockResolvedValue(true);

      await budgetDatabaseService.saveTransactions(transactions);

      expect(budgetDb.bulkUpsertTransactions).toHaveBeenCalled();
      expect(budgetDb.clearCacheCategory).toHaveBeenCalledWith("transactions");
    });

    it("should throw error for invalid transaction data", async () => {
      const invalidTransactions = [{ id: "1", amount: "invalid" }];

      await expect(
        budgetDatabaseService.saveTransactions(invalidTransactions as any)
      ).rejects.toThrow(/Invalid transactions data/i);
    });
  });

  describe("getBills", () => {
    it("should get bills by payment status", async () => {
      const upcomingBills = [
        {
          id: "1",
          name: "Electric Bill",
          type: "bill",
          dueDate: "2024-01-15",
          amount: 100,
          category: "utilities",
          isPaid: false,
          isRecurring: true,
          lastModified: 1700000000000,
          autoAllocate: true,
          color: "#3B82F6",
          currentBalance: 0,
          archived: false,
          interestRate: 0,
          minimumPayment: 0,
          status: "active" as const,
        },
      ];
      const overdueBills = [
        {
          id: "2",
          name: "Water Bill",
          type: "bill",
          dueDate: "2024-01-01",
          amount: 50,
          category: "utilities",
          isPaid: false,
          isRecurring: true,
          lastModified: 1700000000000,
          autoAllocate: true,
          color: "#3B82F6",
          currentBalance: 0,
          archived: false,
          interestRate: 0,
          minimumPayment: 0,
          status: "active" as const,
        },
      ];

      // Reset the chain and set return value for this test
      const mockResult = {
        toArray: vi.fn().mockResolvedValue([...overdueBills, ...upcomingBills]),
      };
      (budgetDb.envelopes.where as Mock).mockReturnValue({
        equals: vi.fn().mockReturnValue(mockResult),
      });

      const result = await budgetDatabaseService.getBills({
        isPaid: false,
      });

      expect(result).toEqual([...overdueBills, ...upcomingBills]);
      expect(budgetDb.envelopes.where).toHaveBeenCalledWith("[type+archived]");
    });

    it("should get paid bills", async () => {
      const paidBills = [
        {
          id: "1",
          name: "Electric Bill",
          type: "bill",
          dueDate: "2024-01-01",
          amount: 100,
          category: "utilities",
          isPaid: true,
          isRecurring: true,
          lastModified: 1700000000000,
          autoAllocate: true,
          color: "#3B82F6",
          currentBalance: 0,
          archived: false,
          interestRate: 0,
          minimumPayment: 0,
          status: "paid" as const,
        },
      ];

      const mockResult = {
        toArray: vi.fn().mockResolvedValue(paidBills),
      };
      (budgetDb.envelopes.where as Mock).mockReturnValue({
        equals: vi.fn().mockReturnValue(mockResult),
      });

      const result = await budgetDatabaseService.getBills({
        isPaid: true,
      });

      expect(result).toEqual(paidBills);
    });
  });

  describe("getBudgetMetadata", () => {
    it("should return budget metadata", async () => {
      const mockMetadata = {
        unassignedCash: 1000,
        actualBalance: 5000,
        lastModified: Date.now(),
      };

      (budgetDb.budget.get as Mock).mockResolvedValue(mockMetadata);

      const result = await budgetDatabaseService.getBudgetMetadata();

      expect(result).toEqual(mockMetadata);
      expect(budgetDb.budget.get).toHaveBeenCalledWith("metadata");
    });

    it("should return null when no metadata exists", async () => {
      (budgetDb.budget.get as Mock).mockResolvedValue(undefined);

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

      (budgetDb.getCachedValue as Mock).mockResolvedValue(null);
      (budgetDb.getAnalyticsData as Mock).mockResolvedValue(mockData);
      (budgetDb.setCachedValue as Mock).mockResolvedValue(true);

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

      (budgetDb.getCachedValue as Mock).mockResolvedValue(cachedData);

      const result = await budgetDatabaseService.getAnalyticsData(dateRange, {
        useCache: true,
      });

      expect(result).toEqual(cachedData);
      expect(budgetDb.getAnalyticsData).not.toHaveBeenCalled();
    });
  });

  describe("clearData", () => {
    it("should clear all budget data", async () => {
      (budgetDb.transaction as Mock).mockImplementation((_mode, _tables, fn) => fn());

      await budgetDatabaseService.clearData();

      expect(budgetDb.budget.clear).toHaveBeenCalledTimes(1);
      expect(budgetDb.envelopes.clear).toHaveBeenCalledTimes(1);
      expect(budgetDb.transactions.clear).toHaveBeenCalledTimes(1);
      expect(budgetDb.cache.clear).toHaveBeenCalledTimes(2);
      expect(budgetDb.auditLog.clear).toHaveBeenCalledTimes(1);
      expect(budgetDb.autoFundingRules.clear).toHaveBeenCalledTimes(1);
      expect(budgetDb.autoFundingHistory.clear).toHaveBeenCalledTimes(1);
      expect(budgetDb.offlineRequestQueue.clear).toHaveBeenCalledTimes(1);
    });
  });

  describe("getStatus", () => {
    it("should return service status", () => {
      (budgetDb.isOpen as Mock).mockReturnValue(true);

      const status = budgetDatabaseService.getStatus();

      expect(status).toEqual({
        isInitialized: true,
        cachePrefix: "budget_db_",
        defaultCacheTtl: 300000,
      });
    });
  });
});
