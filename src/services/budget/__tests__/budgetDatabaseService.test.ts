import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { budgetDatabaseService } from "../budgetDatabaseService";
import { budgetDb } from "@/db/budgetDb";
import logger from "@/utils/core/common/logger";
import type { Envelope } from "@/domain/schemas/envelope";
import type { Transaction } from "@/domain/schemas/transaction";

// Create mock store factory
const createMockStore = () => ({
  where: vi.fn().mockReturnThis(),
  equals: vi.fn().mockReturnThis(),
  above: vi.fn().mockReturnThis(),
  anyOf: vi.fn().mockReturnThis(),
  reverse: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  sortBy: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  first: vi.fn(),
  toArray: vi.fn().mockResolvedValue([]),
  add: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  bulkDelete: vi.fn(),
  modify: vi.fn(),
  count: vi.fn(),
  clear: vi.fn().mockResolvedValue(undefined),
  get: vi.fn(),
  put: vi.fn().mockResolvedValue(undefined),
});

// Mock dependencies
vi.mock("@/db/budgetDb", () => {
  const createMockStore = () => ({
    where: vi.fn().mockReturnThis(),
    equals: vi.fn().mockReturnThis(),
    above: vi.fn().mockReturnThis(),
    anyOf: vi.fn().mockReturnThis(),
    reverse: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    sortBy: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    first: vi.fn(),
    toArray: vi.fn().mockResolvedValue([]),
    add: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    bulkDelete: vi.fn(),
    modify: vi.fn(),
    count: vi.fn(),
    clear: vi.fn().mockResolvedValue(undefined),
    get: vi.fn(),
    put: vi.fn().mockResolvedValue(undefined),
  });

  return {
    budgetDb: {
      envelopes: createMockStore(),
      transactions: createMockStore(),
      budget: createMockStore(),
      cache: createMockStore(),
      auditLog: createMockStore(),
      autoFundingRules: createMockStore(),
      autoFundingHistory: createMockStore(),
      offlineRequestQueue: createMockStore(),
      open: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
      isOpen: vi.fn().mockReturnValue(true),
      getEnvelopesByCategory: vi.fn().mockResolvedValue([]),
      getActiveEnvelopes: vi.fn().mockResolvedValue([]),
      bulkUpsertEnvelopes: vi.fn().mockResolvedValue(undefined),
      getTransactionsByEnvelope: vi.fn().mockResolvedValue([]),
      getTransactionsByCategory: vi.fn().mockResolvedValue([]),
      getTransactionsByType: vi.fn().mockResolvedValue([]),
      getTransactionsByDateRange: vi.fn().mockResolvedValue([]),
      bulkUpsertTransactions: vi.fn().mockResolvedValue(undefined),
      getCachedValue: vi.fn().mockResolvedValue(null),
      setCachedValue: vi.fn().mockResolvedValue(undefined),
      clearCacheCategory: vi.fn().mockResolvedValue(undefined),
      getAnalyticsData: vi.fn().mockResolvedValue([]),
      batchUpdate: vi.fn().mockResolvedValue(undefined),
      optimizeDatabase: vi.fn().mockResolvedValue(undefined),
      getDatabaseStats: vi.fn().mockResolvedValue({
        envelopes: 0,
        transactions: 0,
        size: 0,
      }),
    },
  };
});

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock Zod schemas
vi.mock("@/domain/schemas/envelope", async () => {
  const actual = await vi.importActual("@/domain/schemas/envelope");
  return actual;
});

vi.mock("@/domain/schemas/transaction", async () => {
  const actual = await vi.importActual("@/domain/schemas/transaction");
  return actual;
});

describe("BudgetDatabaseService", () => {
  // Mock data
  const mockEnvelope: Envelope = {
    id: "env-1",
    name: "Groceries",
    category: "Food",
    type: "standard",
    archived: false,
    lastModified: Date.now(),
    currentBalance: 100,
    color: "#3B82F6",
    autoAllocate: true,
  };

  const mockBillEnvelope: Envelope = {
    id: "bill-1",
    name: "Electric Bill",
    category: "Utilities",
    type: "bill",
    archived: false,
    lastModified: Date.now(),
    currentBalance: 50,
    color: "#EF4444",
    autoAllocate: true,
    minimumPayment: 50,
    isPaid: false,
    status: "active",
    interestRate: 0,
  };

  const mockGoalEnvelope: Envelope = {
    id: "goal-1",
    name: "Vacation Fund",
    category: "Savings",
    type: "goal",
    archived: false,
    lastModified: Date.now(),
    currentBalance: 500,
    targetAmount: 2000,
    color: "#10B981",
    autoAllocate: true,
    priority: "high",
    isPaused: false,
    isCompleted: false,
  };

  const mockTransaction: Transaction = {
    id: "txn-1",
    date: new Date("2024-01-15"),
    amount: -50.0,
    envelopeId: "env-1",
    category: "Food",
    type: "expense",
    lastModified: Date.now(),
    description: "Grocery shopping",
    isScheduled: false,
  };

  const mockIncomeTransaction: Transaction = {
    id: "txn-2",
    date: new Date("2024-01-01"),
    amount: 1000.0,
    envelopeId: "env-2",
    category: "Income",
    type: "income",
    lastModified: Date.now(),
    description: "Paycheck",
    isScheduled: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initialize", () => {
    it("should initialize successfully and log info", async () => {
      const result = await budgetDatabaseService.initialize();

      expect(result).toBe(true);
      expect(budgetDb.open).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith("Budget database service initialized");
    });

    it("should throw error and log on initialization failure", async () => {
      const error = new Error("Database open failed");
      (budgetDb.open as Mock).mockRejectedValueOnce(error);

      await expect(budgetDatabaseService.initialize()).rejects.toThrow("Database open failed");
      expect(logger.error).toHaveBeenCalledWith("Failed to initialize database service", error);
    });
  });

  describe("getStats", () => {
    it("should return database stats", async () => {
      const mockStats = { envelopes: 10, transactions: 50, size: 1024 };
      (budgetDb.getDatabaseStats as Mock).mockResolvedValue(mockStats);

      const result = await budgetDatabaseService.getStats();

      expect(result).toEqual(mockStats);
      expect(budgetDb.getDatabaseStats).toHaveBeenCalled();
    });

    it("should throw error and log on failure", async () => {
      const error = new Error("Stats fetch failed");
      (budgetDb.getDatabaseStats as Mock).mockRejectedValueOnce(error);

      await expect(budgetDatabaseService.getStats()).rejects.toThrow("Stats fetch failed");
      expect(logger.error).toHaveBeenCalledWith("Failed to get database stats", error);
    });
  });

  describe("getEnvelopes", () => {
    it("should get active envelopes with default options", async () => {
      (budgetDb.getActiveEnvelopes as Mock).mockResolvedValue([mockEnvelope]);

      const result = await budgetDatabaseService.getEnvelopes();

      expect(result).toEqual([mockEnvelope]);
      expect(budgetDb.getActiveEnvelopes).toHaveBeenCalled();
    });

    it("should get envelopes by category", async () => {
      (budgetDb.getEnvelopesByCategory as Mock).mockResolvedValue([mockEnvelope]);

      const result = await budgetDatabaseService.getEnvelopes({ category: "Food" });

      expect(result).toEqual([mockEnvelope]);
      expect(budgetDb.getEnvelopesByCategory).toHaveBeenCalledWith("Food", false);
    });

    it("should get envelopes by category including archived", async () => {
      (budgetDb.getEnvelopesByCategory as Mock).mockResolvedValue([mockEnvelope]);

      await budgetDatabaseService.getEnvelopes({ category: "Food", includeArchived: true });

      expect(budgetDb.getEnvelopesByCategory).toHaveBeenCalledWith("Food", true);
    });

    it("should get envelopes by type using compound index", async () => {
      const mockStore = createMockStore();
      mockStore.toArray.mockResolvedValue([mockBillEnvelope]);
      mockStore.equals.mockReturnValue(mockStore);
      (budgetDb.envelopes.where as Mock).mockReturnValue(mockStore);

      const result = await budgetDatabaseService.getEnvelopes({ type: "bill" });

      expect(result).toEqual([mockBillEnvelope]);
      expect(budgetDb.envelopes.where).toHaveBeenCalledWith("[type+archived]");
      expect(mockStore.equals).toHaveBeenCalledWith(["bill", 0]);
    });

    it("should get envelopes by type including archived", async () => {
      const mockStore = createMockStore();
      mockStore.toArray.mockResolvedValue([mockBillEnvelope]);
      mockStore.equals.mockReturnValue(mockStore);
      (budgetDb.envelopes.where as Mock).mockReturnValue(mockStore);

      await budgetDatabaseService.getEnvelopes({ type: "bill", includeArchived: true });

      expect(budgetDb.envelopes.where).toHaveBeenCalledWith("type");
      expect(mockStore.equals).toHaveBeenCalledWith("bill");
    });

    it("should use cache when useCache is true", async () => {
      (budgetDb.getCachedValue as Mock).mockResolvedValue([mockEnvelope]);

      const result = await budgetDatabaseService.getEnvelopes({ useCache: true });

      expect(result).toEqual([mockEnvelope]);
      expect(budgetDb.getCachedValue).toHaveBeenCalledWith("budget_db_envelopes_active", 300000);
      expect(budgetDb.getActiveEnvelopes).not.toHaveBeenCalled();
    });

    it("should fetch and cache envelopes when cache is empty", async () => {
      (budgetDb.getCachedValue as Mock).mockResolvedValue(null);
      (budgetDb.getActiveEnvelopes as Mock).mockResolvedValue([mockEnvelope]);

      const result = await budgetDatabaseService.getEnvelopes({ useCache: true });

      expect(result).toEqual([mockEnvelope]);
      expect(budgetDb.getActiveEnvelopes).toHaveBeenCalled();
      expect(budgetDb.setCachedValue).toHaveBeenCalledWith(
        "budget_db_envelopes_active",
        [mockEnvelope],
        300000
      );
    });

    it("should filter envelopes by isPaid", async () => {
      const paidBill = { ...mockBillEnvelope, isPaid: true };
      (budgetDb.getActiveEnvelopes as Mock).mockResolvedValue([mockBillEnvelope, paidBill]);

      const result = await budgetDatabaseService.getEnvelopes({ isPaid: false });

      expect(result).toEqual([mockBillEnvelope]);
    });

    it("should filter envelopes by isCompleted", async () => {
      const completedGoal = { ...mockGoalEnvelope, isCompleted: true };
      (budgetDb.getActiveEnvelopes as Mock).mockResolvedValue([mockGoalEnvelope, completedGoal]);

      const result = await budgetDatabaseService.getEnvelopes({ isCompleted: false });

      expect(result).toEqual([mockGoalEnvelope]);
    });

    it("should get envelopes excluding archived without type filter", async () => {
      const mockStore = createMockStore();
      mockStore.toArray.mockResolvedValue([mockEnvelope]);
      mockStore.equals.mockReturnValue(mockStore);
      (budgetDb.envelopes.where as Mock).mockReturnValue(mockStore);

      const result = await budgetDatabaseService.getEnvelopes({ useCache: false });

      expect(result).toEqual([mockEnvelope]);
      expect(budgetDb.envelopes.where).toHaveBeenCalledWith("archived");
      expect(mockStore.equals).toHaveBeenCalledWith(0);
    });

    it("should return empty array on validation failure", async () => {
      const invalidData = [{ id: "bad", name: "" }]; // Invalid: missing required fields
      (budgetDb.getActiveEnvelopes as Mock).mockResolvedValue(invalidData);

      const result = await budgetDatabaseService.getEnvelopes();

      expect(result).toEqual([]);
      expect(logger.error).toHaveBeenCalledWith(
        "Failed to validate envelopes from database",
        expect.objectContaining({
          error: expect.any(Object),
        })
      );
    });

    it("should throw error and log on fetch failure", async () => {
      const error = new Error("Fetch failed");
      (budgetDb.getActiveEnvelopes as Mock).mockRejectedValueOnce(error);

      await expect(budgetDatabaseService.getEnvelopes()).rejects.toThrow("Fetch failed");
      expect(logger.error).toHaveBeenCalledWith("Failed to get envelopes", error);
    });
  });

  describe("saveEnvelopes", () => {
    it("should validate and save envelopes", async () => {
      await budgetDatabaseService.saveEnvelopes([mockEnvelope]);

      expect(budgetDb.bulkUpsertEnvelopes).toHaveBeenCalledWith([mockEnvelope]);
      expect(budgetDb.clearCacheCategory).toHaveBeenCalledWith("envelopes");
    });

    it("should throw error on validation failure", async () => {
      const invalidEnvelope = { id: "bad", name: "" } as Envelope; // Missing required fields

      await expect(budgetDatabaseService.saveEnvelopes([invalidEnvelope])).rejects.toThrow(
        "Invalid envelopes data"
      );
      expect(logger.error).toHaveBeenCalledWith(
        "Failed to validate envelopes for save",
        expect.any(Object)
      );
      expect(budgetDb.bulkUpsertEnvelopes).not.toHaveBeenCalled();
    });

    it("should invalidate cache after save", async () => {
      await budgetDatabaseService.saveEnvelopes([mockEnvelope]);

      expect(budgetDb.clearCacheCategory).toHaveBeenCalledWith("envelopes");
    });
  });

  describe("getBills", () => {
    it("should get bills with type=bill", async () => {
      const mockStore = createMockStore();
      mockStore.toArray.mockResolvedValue([mockBillEnvelope]);
      mockStore.equals.mockReturnValue(mockStore);
      (budgetDb.envelopes.where as Mock).mockReturnValue(mockStore);

      const result = await budgetDatabaseService.getBills();

      expect(result).toEqual([mockBillEnvelope]);
      expect(budgetDb.envelopes.where).toHaveBeenCalledWith("[type+archived]");
      expect(mockStore.equals).toHaveBeenCalledWith(["bill", 0]);
    });

    it("should pass through additional options", async () => {
      (budgetDb.getEnvelopesByCategory as Mock).mockResolvedValue([mockBillEnvelope]);

      await budgetDatabaseService.getBills({ category: "Utilities" });

      expect(budgetDb.getEnvelopesByCategory).toHaveBeenCalledWith("Utilities", false);
    });
  });

  describe("getSavingsGoals", () => {
    it("should get savings goals with type=goal", async () => {
      const mockStore = createMockStore();
      mockStore.toArray.mockResolvedValue([mockGoalEnvelope]);
      mockStore.equals.mockReturnValue(mockStore);
      (budgetDb.envelopes.where as Mock).mockReturnValue(mockStore);

      const result = await budgetDatabaseService.getSavingsGoals();

      expect(result).toEqual([mockGoalEnvelope]);
      expect(budgetDb.envelopes.where).toHaveBeenCalledWith("[type+archived]");
      expect(mockStore.equals).toHaveBeenCalledWith(["goal", 0]);
    });

    it("should pass through additional options", async () => {
      (budgetDb.getEnvelopesByCategory as Mock).mockResolvedValue([mockGoalEnvelope]);

      await budgetDatabaseService.getSavingsGoals({ category: "Savings" });

      expect(budgetDb.getEnvelopesByCategory).toHaveBeenCalledWith("Savings", false);
    });
  });

  describe("saveBills", () => {
    it("should validate and save bills", async () => {
      await budgetDatabaseService.saveBills([mockBillEnvelope]);

      expect(budgetDb.bulkUpsertEnvelopes).toHaveBeenCalledWith([mockBillEnvelope]);
      expect(budgetDb.clearCacheCategory).toHaveBeenCalledWith("envelopes");
    });

    it("should throw error on validation failure", async () => {
      const invalidBill = { id: "bad", name: "" } as Envelope;

      await expect(budgetDatabaseService.saveBills([invalidBill])).rejects.toThrow(
        "Invalid bills data"
      );
    });
  });

  describe("saveSavingsGoals", () => {
    it("should validate and save savings goals", async () => {
      await budgetDatabaseService.saveSavingsGoals([mockGoalEnvelope]);

      expect(budgetDb.bulkUpsertEnvelopes).toHaveBeenCalledWith([mockGoalEnvelope]);
      expect(budgetDb.clearCacheCategory).toHaveBeenCalledWith("envelopes");
    });

    it("should throw error on validation failure", async () => {
      const invalidGoal = { id: "bad", name: "" } as Envelope;

      await expect(budgetDatabaseService.saveSavingsGoals([invalidGoal])).rejects.toThrow(
        "Invalid savings goals data"
      );
    });

    it("should handle and log bulkUpsert errors", async () => {
      const error = new Error("Upsert failed");
      (budgetDb.bulkUpsertEnvelopes as Mock).mockRejectedValueOnce(error);

      await expect(budgetDatabaseService.saveSavingsGoals([mockGoalEnvelope])).rejects.toThrow(
        "Upsert failed"
      );
      expect(logger.error).toHaveBeenCalledWith("Failed to bulkUpsert savings goals", error);
    });
  });

  describe("getTransactions", () => {
    it("should get transactions by envelope ID", async () => {
      (budgetDb.getTransactionsByEnvelope as Mock).mockResolvedValue([mockTransaction]);

      const result = await budgetDatabaseService.getTransactions({ envelopeId: "env-1" });

      expect(result).toEqual([mockTransaction]);
      expect(budgetDb.getTransactionsByEnvelope).toHaveBeenCalledWith("env-1", undefined);
    });

    it("should get transactions by envelope ID with date range", async () => {
      const dateRange = { start: new Date("2024-01-01"), end: new Date("2024-01-31") };
      (budgetDb.getTransactionsByEnvelope as Mock).mockResolvedValue([mockTransaction]);

      await budgetDatabaseService.getTransactions({ envelopeId: "env-1", dateRange });

      expect(budgetDb.getTransactionsByEnvelope).toHaveBeenCalledWith("env-1", dateRange);
    });

    it("should get transactions by category", async () => {
      (budgetDb.getTransactionsByCategory as Mock).mockResolvedValue([mockTransaction]);

      const result = await budgetDatabaseService.getTransactions({ category: "Food" });

      expect(result).toEqual([mockTransaction]);
      expect(budgetDb.getTransactionsByCategory).toHaveBeenCalledWith("Food", undefined);
    });

    it("should get transactions by type", async () => {
      (budgetDb.getTransactionsByType as Mock).mockResolvedValue([mockTransaction]);

      const result = await budgetDatabaseService.getTransactions({ type: "expense" });

      expect(result).toEqual([mockTransaction]);
      expect(budgetDb.getTransactionsByType).toHaveBeenCalledWith("expense", undefined);
    });

    it("should get transactions by date range", async () => {
      const dateRange = { start: new Date("2024-01-01"), end: new Date("2024-01-31") };
      (budgetDb.getTransactionsByDateRange as Mock).mockResolvedValue([mockTransaction]);

      const result = await budgetDatabaseService.getTransactions({ dateRange });

      expect(result).toEqual([mockTransaction]);
      expect(budgetDb.getTransactionsByDateRange).toHaveBeenCalledWith(
        dateRange.start,
        dateRange.end
      );
    });

    it("should limit transactions from date range query", async () => {
      const dateRange = { start: new Date("2024-01-01"), end: new Date("2024-01-31") };
      const transactions = Array.from({ length: 200 }, (_, i) => ({
        ...mockTransaction,
        id: `txn-${i}`,
      }));
      (budgetDb.getTransactionsByDateRange as Mock).mockResolvedValue(transactions);

      const result = await budgetDatabaseService.getTransactions({ dateRange, limit: 50 });

      expect(result.length).toBe(50);
    });

    it("should use cache for recent transactions", async () => {
      (budgetDb.getCachedValue as Mock).mockResolvedValue([mockTransaction]);

      const result = await budgetDatabaseService.getTransactions({ useCache: true });

      expect(result).toEqual([mockTransaction]);
      expect(budgetDb.getCachedValue).toHaveBeenCalledWith(
        "budget_db_recent_transactions_100",
        60000
      );
    });

    it("should fetch and cache recent transactions when cache is empty", async () => {
      (budgetDb.getCachedValue as Mock).mockResolvedValue(null);
      (budgetDb.getTransactionsByDateRange as Mock).mockResolvedValue([mockTransaction]);

      const result = await budgetDatabaseService.getTransactions({ useCache: true, limit: 50 });

      expect(result).toEqual([mockTransaction]);
      expect(budgetDb.setCachedValue).toHaveBeenCalledWith(
        "budget_db_recent_transactions_50",
        [mockTransaction],
        60000
      );
    });

    it("should get default transactions ordered by date descending", async () => {
      const mockStore = createMockStore();
      mockStore.toArray.mockResolvedValue([mockTransaction]);
      (budgetDb.transactions.orderBy as Mock).mockReturnValue(mockStore);

      const result = await budgetDatabaseService.getTransactions({});

      expect(result).toEqual([mockTransaction]);
      expect(budgetDb.transactions.orderBy).toHaveBeenCalledWith("date");
      expect(mockStore.reverse).toHaveBeenCalled();
      expect(mockStore.limit).toHaveBeenCalledWith(100);
    });

    it("should respect custom limit", async () => {
      const mockStore = createMockStore();
      mockStore.toArray.mockResolvedValue([mockTransaction]);
      (budgetDb.transactions.orderBy as Mock).mockReturnValue(mockStore);

      await budgetDatabaseService.getTransactions({ limit: 25 });

      expect(mockStore.limit).toHaveBeenCalledWith(25);
    });

    it("should return empty array on validation failure", async () => {
      const invalidData = [{ id: "bad", amount: "not-a-number" }];
      (budgetDb.getTransactionsByEnvelope as Mock).mockResolvedValue(invalidData);

      const result = await budgetDatabaseService.getTransactions({ envelopeId: "env-1" });

      expect(result).toEqual([]);
      expect(logger.error).toHaveBeenCalledWith(
        "Failed to validate transactions from database",
        expect.objectContaining({
          error: expect.any(Object),
        })
      );
    });

    it("should throw error and log on fetch failure", async () => {
      const error = new Error("Fetch failed");
      (budgetDb.getTransactionsByEnvelope as Mock).mockRejectedValueOnce(error);

      await expect(budgetDatabaseService.getTransactions({ envelopeId: "env-1" })).rejects.toThrow(
        "Fetch failed"
      );
      expect(logger.error).toHaveBeenCalledWith("Failed to get transactions", error);
    });
  });

  describe("saveTransactions", () => {
    it("should validate, normalize dates, and save transactions", async () => {
      await budgetDatabaseService.saveTransactions([mockTransaction]);

      expect(budgetDb.bulkUpsertTransactions).toHaveBeenCalledWith([
        expect.objectContaining({
          ...mockTransaction,
          date: expect.any(Date),
        }),
      ]);
      expect(budgetDb.clearCacheCategory).toHaveBeenCalledWith("transactions");
      expect(logger.debug).toHaveBeenCalledWith("Saved 1 transactions");
    });

    it("should normalize string dates to Date objects", async () => {
      const txnWithStringDate = {
        ...mockTransaction,
        date: "2024-01-15" as unknown as Date,
      };

      await budgetDatabaseService.saveTransactions([txnWithStringDate]);

      expect(budgetDb.bulkUpsertTransactions).toHaveBeenCalledWith([
        expect.objectContaining({
          date: expect.any(Date),
        }),
      ]);
    });

    it("should throw error on validation failure", async () => {
      const invalidTransaction = { id: "bad", amount: "not-a-number" } as unknown as Transaction;

      await expect(budgetDatabaseService.saveTransactions([invalidTransaction])).rejects.toThrow(
        "Invalid transactions data"
      );
      expect(logger.error).toHaveBeenCalledWith(
        "Failed to validate transactions for save",
        expect.any(Object)
      );
    });

    it("should throw error and log on save failure", async () => {
      const error = new Error("Save failed");
      (budgetDb.bulkUpsertTransactions as Mock).mockRejectedValueOnce(error);

      await expect(budgetDatabaseService.saveTransactions([mockTransaction])).rejects.toThrow(
        "Save failed"
      );
      expect(logger.error).toHaveBeenCalledWith("Failed to save transactions", error);
    });

    it("should invalidate cache after save", async () => {
      await budgetDatabaseService.saveTransactions([mockTransaction]);

      expect(budgetDb.clearCacheCategory).toHaveBeenCalledWith("transactions");
    });
  });

  describe("getBudgetMetadata", () => {
    it("should get budget metadata", async () => {
      const metadata = {
        id: "metadata",
        lastModified: Date.now(),
        unassignedCash: 500,
        actualBalance: 10000,
      };
      (budgetDb.budget.get as Mock).mockResolvedValue(metadata);

      const result = await budgetDatabaseService.getBudgetMetadata();

      expect(result).toEqual(metadata);
      expect(budgetDb.budget.get).toHaveBeenCalledWith("metadata");
    });

    it("should return null if metadata does not exist", async () => {
      (budgetDb.budget.get as Mock).mockResolvedValue(undefined);

      const result = await budgetDatabaseService.getBudgetMetadata();

      expect(result).toBeNull();
    });

    it("should throw error and log on failure", async () => {
      const error = new Error("Get failed");
      (budgetDb.budget.get as Mock).mockRejectedValueOnce(error);

      await expect(budgetDatabaseService.getBudgetMetadata()).rejects.toThrow("Get failed");
      expect(logger.error).toHaveBeenCalledWith("Failed to get budget metadata", error);
    });
  });

  describe("saveBudgetMetadata", () => {
    it("should save budget metadata with timestamp", async () => {
      const metadata = { unassignedCash: 500, actualBalance: 10000 };

      await budgetDatabaseService.saveBudgetMetadata(metadata);

      expect(budgetDb.budget.put).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "metadata",
          lastModified: expect.any(Number),
          unassignedCash: 500,
          actualBalance: 10000,
        })
      );
      expect(logger.debug).toHaveBeenCalledWith("Saved budget metadata");
    });

    it("should throw error and log on failure", async () => {
      const error = new Error("Save failed");
      (budgetDb.budget.put as Mock).mockRejectedValueOnce(error);

      await expect(budgetDatabaseService.saveBudgetMetadata({})).rejects.toThrow("Save failed");
      expect(logger.error).toHaveBeenCalledWith("Failed to save budget metadata", error);
    });
  });

  describe("getEncryptedBudgetData", () => {
    it("should get encrypted budget data", async () => {
      const encryptedData = {
        id: "budgetData",
        lastModified: Date.now(),
        version: 1,
        encryptedContent: "encrypted-data",
      };
      (budgetDb.budget.get as Mock).mockResolvedValue(encryptedData);

      const result = await budgetDatabaseService.getEncryptedBudgetData();

      expect(result).toEqual(encryptedData);
      expect(budgetDb.budget.get).toHaveBeenCalledWith("budgetData");
    });

    it("should return null if encrypted data does not exist", async () => {
      (budgetDb.budget.get as Mock).mockResolvedValue(undefined);

      const result = await budgetDatabaseService.getEncryptedBudgetData();

      expect(result).toBeNull();
    });

    it("should return null and log on error", async () => {
      const error = new Error("Get failed");
      (budgetDb.budget.get as Mock).mockRejectedValueOnce(error);

      const result = await budgetDatabaseService.getEncryptedBudgetData();

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith("Failed to get encrypted budget data", error);
    });
  });

  describe("saveEncryptedBudgetData", () => {
    it("should save encrypted budget data with timestamp and version", async () => {
      const data = { encryptedContent: "encrypted-data", version: 2 };

      await budgetDatabaseService.saveEncryptedBudgetData(data);

      expect(budgetDb.budget.put).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "budgetData",
          lastModified: expect.any(Number),
          version: 2,
          encryptedContent: "encrypted-data",
        })
      );
      expect(logger.debug).toHaveBeenCalledWith("Saved encrypted budget data");
    });

    it("should default version to 1 if not provided", async () => {
      const data = { encryptedContent: "encrypted-data" };

      await budgetDatabaseService.saveEncryptedBudgetData(data);

      expect(budgetDb.budget.put).toHaveBeenCalledWith(
        expect.objectContaining({
          version: 1,
        })
      );
    });

    it("should throw error and log on failure", async () => {
      const error = new Error("Save failed");
      (budgetDb.budget.put as Mock).mockRejectedValueOnce(error);

      await expect(budgetDatabaseService.saveEncryptedBudgetData({})).rejects.toThrow(
        "Save failed"
      );
      expect(logger.error).toHaveBeenCalledWith("Failed to save encrypted budget data", error);
    });
  });

  describe("getAnalyticsData", () => {
    it("should get analytics data for date range", async () => {
      const dateRange = { start: new Date("2024-01-01"), end: new Date("2024-01-31") };
      const analyticsData = [{ category: "Food", total: -500 }];
      (budgetDb.getAnalyticsData as Mock).mockResolvedValue(analyticsData);

      const result = await budgetDatabaseService.getAnalyticsData(dateRange);

      expect(result).toEqual(analyticsData);
      expect(budgetDb.getAnalyticsData).toHaveBeenCalledWith(dateRange, false);
    });

    it("should include transfers when specified", async () => {
      const dateRange = { start: new Date("2024-01-01"), end: new Date("2024-01-31") };
      (budgetDb.getAnalyticsData as Mock).mockResolvedValue([]);

      await budgetDatabaseService.getAnalyticsData(dateRange, { includeTransfers: true });

      expect(budgetDb.getAnalyticsData).toHaveBeenCalledWith(dateRange, true);
    });

    it("should use cache when enabled", async () => {
      const dateRange = { start: new Date("2024-01-01"), end: new Date("2024-01-31") };
      const cachedData = [{ category: "Food", total: -500 }];
      (budgetDb.getCachedValue as Mock).mockResolvedValue(cachedData);

      const result = await budgetDatabaseService.getAnalyticsData(dateRange, { useCache: true });

      expect(result).toEqual(cachedData);
      expect(budgetDb.getCachedValue).toHaveBeenCalled();
      expect(budgetDb.getAnalyticsData).not.toHaveBeenCalled();
    });

    it("should fetch and cache analytics when cache is empty", async () => {
      const dateRange = { start: new Date("2024-01-01"), end: new Date("2024-01-31") };
      const analyticsData = [{ category: "Food", total: -500 }];
      (budgetDb.getCachedValue as Mock).mockResolvedValue(null);
      (budgetDb.getAnalyticsData as Mock).mockResolvedValue(analyticsData);

      const result = await budgetDatabaseService.getAnalyticsData(dateRange, { useCache: true });

      expect(result).toEqual(analyticsData);
      expect(budgetDb.getAnalyticsData).toHaveBeenCalledWith(dateRange, false);
      expect(budgetDb.setCachedValue).toHaveBeenCalledWith(
        expect.stringContaining("analytics"),
        analyticsData,
        300000
      );
    });

    it("should throw error and log on failure", async () => {
      const dateRange = { start: new Date("2024-01-01"), end: new Date("2024-01-31") };
      const error = new Error("Analytics fetch failed");
      (budgetDb.getAnalyticsData as Mock).mockRejectedValueOnce(error);

      await expect(budgetDatabaseService.getAnalyticsData(dateRange)).rejects.toThrow(
        "Analytics fetch failed"
      );
      expect(logger.error).toHaveBeenCalledWith("Failed to get analytics data", error);
    });
  });

  describe("batchUpdate", () => {
    it("should perform batch update and invalidate caches", async () => {
      const updates = [
        {
          collection: "envelopes",
          type: "envelope" as const,
          operation: "upsert" as const,
          data: mockEnvelope,
        },
        {
          collection: "transactions",
          type: "transaction" as const,
          operation: "upsert" as const,
          data: mockTransaction,
        },
      ];

      await budgetDatabaseService.batchUpdate(updates);

      expect(budgetDb.batchUpdate).toHaveBeenCalledWith(updates);
      expect(budgetDb.cache.clear).toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalledWith("Completed batch update with 2 operations");
    });

    it("should throw error and log on failure", async () => {
      const error = new Error("Batch update failed");
      (budgetDb.batchUpdate as Mock).mockRejectedValueOnce(error);

      await expect(budgetDatabaseService.batchUpdate([])).rejects.toThrow("Batch update failed");
      expect(logger.error).toHaveBeenCalledWith("Failed to perform batch update", error);
    });
  });

  describe("optimize", () => {
    it("should optimize database and log info", async () => {
      await budgetDatabaseService.optimize();

      expect(budgetDb.optimizeDatabase).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith("Database optimization completed");
    });

    it("should throw error and log on failure", async () => {
      const error = new Error("Optimization failed");
      (budgetDb.optimizeDatabase as Mock).mockRejectedValueOnce(error);

      await expect(budgetDatabaseService.optimize()).rejects.toThrow("Optimization failed");
      expect(logger.error).toHaveBeenCalledWith("Failed to optimize database", error);
    });
  });

  describe("clearData", () => {
    it("should clear all data and caches", async () => {
      await budgetDatabaseService.clearData();

      expect(budgetDb.envelopes.clear).toHaveBeenCalled();
      expect(budgetDb.transactions.clear).toHaveBeenCalled();
      expect(budgetDb.budget.clear).toHaveBeenCalled();
      expect(budgetDb.cache.clear).toHaveBeenCalled();
      expect(budgetDb.auditLog.clear).toHaveBeenCalled();
      expect(budgetDb.autoFundingRules.clear).toHaveBeenCalled();
      expect(budgetDb.autoFundingHistory.clear).toHaveBeenCalled();
      expect(budgetDb.offlineRequestQueue.clear).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith("All budget data cleared");
    });

    it("should throw error and log on failure", async () => {
      const error = new Error("Clear failed");
      (budgetDb.envelopes.clear as Mock).mockRejectedValueOnce(error);

      await expect(budgetDatabaseService.clearData()).rejects.toThrow("Clear failed");
      expect(logger.error).toHaveBeenCalledWith("Failed to clear data", error);
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
      expect(budgetDb.isOpen).toHaveBeenCalled();
    });

    it("should return false when database is not open", () => {
      (budgetDb.isOpen as Mock).mockReturnValue(false);

      const status = budgetDatabaseService.getStatus();

      expect(status.isInitialized).toBe(false);
    });
  });

  describe("cleanup", () => {
    it("should close database and log info", async () => {
      await budgetDatabaseService.cleanup();

      expect(budgetDb.close).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith("Budget database service cleaned up");
    });

    it("should log error on cleanup failure but not throw", async () => {
      const error = new Error("Close failed");
      (budgetDb.close as Mock).mockRejectedValueOnce(error);

      await expect(budgetDatabaseService.cleanup()).resolves.not.toThrow();
      expect(logger.error).toHaveBeenCalledWith("Failed to cleanup database service", error);
    });
  });

  describe("validation helpers", () => {
    it("should validate output and return empty array on schema error", async () => {
      const invalidEnvelopes = [
        { id: "bad-1", name: "" }, // Missing required fields
        { id: "bad-2", category: "" },
      ];
      (budgetDb.getActiveEnvelopes as Mock).mockResolvedValue(invalidEnvelopes);

      const result = await budgetDatabaseService.getEnvelopes();

      expect(result).toEqual([]);
      expect(logger.error).toHaveBeenCalledWith(
        "Failed to validate envelopes from database",
        expect.objectContaining({
          error: expect.any(Object),
          rawData: expect.any(Array),
        })
      );
    });

    it("should validate input and throw error on schema failure", async () => {
      const invalidEnvelopes = [
        { id: "bad-1", name: "" }, // Missing required fields
      ] as Envelope[];

      await expect(budgetDatabaseService.saveEnvelopes(invalidEnvelopes)).rejects.toThrow(
        "Invalid envelopes data"
      );
      expect(logger.error).toHaveBeenCalledWith(
        "Failed to validate envelopes for save",
        expect.any(Object)
      );
    });

    it("should limit logged raw data to 5 items", async () => {
      const invalidEnvelopes = Array.from({ length: 10 }, (_, i) => ({
        id: `bad-${i}`,
        name: "",
      }));
      (budgetDb.getActiveEnvelopes as Mock).mockResolvedValue(invalidEnvelopes);

      await budgetDatabaseService.getEnvelopes();

      expect(logger.error).toHaveBeenCalledWith(
        "Failed to validate envelopes from database",
        expect.objectContaining({
          rawData: expect.arrayContaining([]),
        })
      );
      const logCall = (logger.error as Mock).mock.calls[0];
      expect(logCall[1].rawData.length).toBeLessThanOrEqual(5);
    });
  });

  describe("cache invalidation", () => {
    it("should invalidate envelope cache after saveEnvelopes", async () => {
      await budgetDatabaseService.saveEnvelopes([mockEnvelope]);

      expect(budgetDb.clearCacheCategory).toHaveBeenCalledWith("envelopes");
    });

    it("should invalidate envelope cache after saveBills", async () => {
      await budgetDatabaseService.saveBills([mockBillEnvelope]);

      expect(budgetDb.clearCacheCategory).toHaveBeenCalledWith("envelopes");
    });

    it("should invalidate envelope cache after saveSavingsGoals", async () => {
      await budgetDatabaseService.saveSavingsGoals([mockGoalEnvelope]);

      expect(budgetDb.clearCacheCategory).toHaveBeenCalledWith("envelopes");
    });

    it("should invalidate transaction cache after saveTransactions", async () => {
      await budgetDatabaseService.saveTransactions([mockTransaction]);

      expect(budgetDb.clearCacheCategory).toHaveBeenCalledWith("transactions");
    });

    it("should invalidate all caches after batchUpdate", async () => {
      await budgetDatabaseService.batchUpdate([]);

      expect(budgetDb.cache.clear).toHaveBeenCalled();
    });

    it("should invalidate all caches after clearData", async () => {
      await budgetDatabaseService.clearData();

      expect(budgetDb.cache.clear).toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("should handle empty envelope arrays", async () => {
      await budgetDatabaseService.saveEnvelopes([]);

      expect(budgetDb.bulkUpsertEnvelopes).toHaveBeenCalledWith([]);
    });

    it("should handle empty transaction arrays", async () => {
      await budgetDatabaseService.saveTransactions([]);

      expect(budgetDb.bulkUpsertTransactions).toHaveBeenCalledWith([]);
      expect(logger.debug).toHaveBeenCalledWith("Saved 0 transactions");
    });

    it("should handle batch update with empty array", async () => {
      await budgetDatabaseService.batchUpdate([]);

      expect(budgetDb.batchUpdate).toHaveBeenCalledWith([]);
      expect(logger.debug).toHaveBeenCalledWith("Completed batch update with 0 operations");
    });

    it("should handle null metadata values", async () => {
      const metadata = {
        id: "metadata",
        lastModified: Date.now(),
        unassignedCash: null,
      };
      (budgetDb.budget.get as Mock).mockResolvedValue(metadata);

      const result = await budgetDatabaseService.getBudgetMetadata();

      expect(result).toEqual(metadata);
    });

    it("should handle missing optional fields in envelopes", async () => {
      const minimalEnvelope: Envelope = {
        id: "env-min",
        name: "Minimal",
        category: "Test",
        type: "standard",
        archived: false,
        lastModified: Date.now(),
        currentBalance: 0,
        color: "#3B82F6",
        autoAllocate: true,
      };
      (budgetDb.getActiveEnvelopes as Mock).mockResolvedValue([minimalEnvelope]);

      const result = await budgetDatabaseService.getEnvelopes();

      expect(result).toEqual([minimalEnvelope]);
    });

    it("should handle transactions with all optional fields", async () => {
      const fullTransaction: Transaction = {
        ...mockTransaction,
        description: "Full transaction",
        merchant: "Test Merchant",
        receiptUrl: "https://example.com/receipt.pdf",
        isScheduled: true,
        recurrenceRule: "FREQ=MONTHLY",
        createdAt: Date.now(),
      };
      (budgetDb.getTransactionsByEnvelope as Mock).mockResolvedValue([fullTransaction]);

      const result = await budgetDatabaseService.getTransactions({ envelopeId: "env-1" });

      expect(result).toEqual([fullTransaction]);
    });
  });
});
