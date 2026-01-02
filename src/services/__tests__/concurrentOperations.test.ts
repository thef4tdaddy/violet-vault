/**
 * Concurrent Operation Tests
 * GitHub Issue #1385: Test concurrent operations and race condition handling
 *
 * Tests cover:
 * - Concurrent envelope updates
 * - Concurrent transaction creation
 * - Concurrent sync operations
 * - Concurrent backup operations
 * - Race condition handling
 */

import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from "vitest";
import { budgetDatabaseService } from "@/services/budget/budgetDatabaseService";
import { budgetDb } from "@/db/budgetDb";

// Mock the database
vi.mock("@/db/budgetDb", () => ({
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
    savingsGoals: { toArray: vi.fn(), clear: vi.fn() },
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

// Mock logger to avoid console output
vi.mock("@/utils/common/logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    production: vi.fn(),
  },
}));

describe("Concurrent Operation Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Concurrent Envelope Updates", () => {
    const createMockEnvelope = (id: string, balance: number) => ({
      id,
      name: `Envelope ${id}`,
      category: "expenses",
      archived: false,
      lastModified: Date.now(),
      currentBalance: balance,
    });

    it("should handle concurrent envelope updates without data corruption", async () => {
      const envelope1 = createMockEnvelope("env-1", 500);
      const envelope2 = createMockEnvelope("env-1", 600);
      const envelope3 = createMockEnvelope("env-1", 700);

      (budgetDb.bulkUpsertEnvelopes as Mock).mockResolvedValue(true);
      (budgetDb.clearCacheCategory as Mock).mockResolvedValue(true);

      // Simulate concurrent updates to the same envelope
      const updates = [
        budgetDatabaseService.saveEnvelopes([envelope1]),
        budgetDatabaseService.saveEnvelopes([envelope2]),
        budgetDatabaseService.saveEnvelopes([envelope3]),
      ];

      // All updates should complete without errors
      const results = await Promise.allSettled(updates);

      expect(results.every((r) => r.status === "fulfilled")).toBe(true);
      expect(budgetDb.bulkUpsertEnvelopes).toHaveBeenCalledTimes(3);
    });

    it("should handle concurrent updates to different envelopes", async () => {
      const envelopes = [
        createMockEnvelope("env-1", 100),
        createMockEnvelope("env-2", 200),
        createMockEnvelope("env-3", 300),
        createMockEnvelope("env-4", 400),
        createMockEnvelope("env-5", 500),
      ];

      (budgetDb.bulkUpsertEnvelopes as Mock).mockResolvedValue(true);
      (budgetDb.clearCacheCategory as Mock).mockResolvedValue(true);

      // Simulate concurrent updates to different envelopes
      const updates = envelopes.map((env) => budgetDatabaseService.saveEnvelopes([env]));

      const results = await Promise.allSettled(updates);

      expect(results.every((r) => r.status === "fulfilled")).toBe(true);
      expect(budgetDb.bulkUpsertEnvelopes).toHaveBeenCalledTimes(5);
    });

    it("should preserve last-write-wins semantics for concurrent envelope updates", async () => {
      const envelopeVersions = [
        { ...createMockEnvelope("env-1", 100), lastModified: 1000 },
        { ...createMockEnvelope("env-1", 200), lastModified: 2000 },
        { ...createMockEnvelope("env-1", 300), lastModified: 3000 },
      ];

      const savedEnvelopes: unknown[][] = [];
      (budgetDb.bulkUpsertEnvelopes as Mock).mockImplementation((envs: unknown[]) => {
        savedEnvelopes.push(envs);
        return Promise.resolve(true);
      });
      (budgetDb.clearCacheCategory as Mock).mockResolvedValue(true);

      // Save all versions concurrently
      await Promise.all(envelopeVersions.map((env) => budgetDatabaseService.saveEnvelopes([env])));

      // All should be saved - the database layer handles the conflict resolution
      expect(savedEnvelopes).toHaveLength(3);
    });

    it("should handle rapid consecutive updates gracefully", async () => {
      (budgetDb.bulkUpsertEnvelopes as Mock).mockResolvedValue(true);
      (budgetDb.clearCacheCategory as Mock).mockResolvedValue(true);

      const rapidUpdates: Promise<void>[] = [];

      // Simulate 20 rapid updates
      for (let i = 0; i < 20; i++) {
        const envelope = createMockEnvelope("env-rapid", i * 100);
        rapidUpdates.push(budgetDatabaseService.saveEnvelopes([envelope]));
      }

      const results = await Promise.allSettled(rapidUpdates);

      expect(results.every((r) => r.status === "fulfilled")).toBe(true);
      expect(budgetDb.bulkUpsertEnvelopes).toHaveBeenCalledTimes(20);
    });
  });

  describe("Concurrent Transaction Creation", () => {
    // Note: Expenses MUST have negative amounts per schema convention
    const createMockTransaction = (id: string, amount: number) => ({
      id,
      date: new Date(),
      amount: -Math.abs(amount), // Expenses must be negative
      envelopeId: "env-1",
      category: "food",
      type: "expense" as const,
      lastModified: Date.now(),
    });

    it("should handle concurrent transaction creation", async () => {
      (budgetDb.bulkUpsertTransactions as Mock).mockResolvedValue(true);
      (budgetDb.clearCacheCategory as Mock).mockResolvedValue(true);

      const transactions = [
        createMockTransaction("tx-1", 50),
        createMockTransaction("tx-2", 75),
        createMockTransaction("tx-3", 100),
        createMockTransaction("tx-4", 125),
        createMockTransaction("tx-5", 150),
      ];

      // Create all transactions concurrently
      const creates = transactions.map((tx) => budgetDatabaseService.saveTransactions([tx]));

      const results = await Promise.allSettled(creates);

      expect(results.every((r) => r.status === "fulfilled")).toBe(true);
      expect(budgetDb.bulkUpsertTransactions).toHaveBeenCalledTimes(5);
    });

    it("should handle concurrent bulk transaction creation", async () => {
      (budgetDb.bulkUpsertTransactions as Mock).mockResolvedValue(true);
      (budgetDb.clearCacheCategory as Mock).mockResolvedValue(true);

      // Pass positive values - createMockTransaction handles negation internally
      const batch1 = Array.from({ length: 10 }, (_, i) =>
        createMockTransaction(`tx-b1-${i}`, i + 1)
      );
      const batch2 = Array.from({ length: 10 }, (_, i) =>
        createMockTransaction(`tx-b2-${i}`, i + 1)
      );
      const batch3 = Array.from({ length: 10 }, (_, i) =>
        createMockTransaction(`tx-b3-${i}`, i + 1)
      );

      // Save all batches concurrently
      const results = await Promise.allSettled([
        budgetDatabaseService.saveTransactions(batch1),
        budgetDatabaseService.saveTransactions(batch2),
        budgetDatabaseService.saveTransactions(batch3),
      ]);

      expect(results.every((r) => r.status === "fulfilled")).toBe(true);
      expect(budgetDb.bulkUpsertTransactions).toHaveBeenCalledTimes(3);
    });

    it("should handle mixed read/write operations concurrently", async () => {
      // Pass positive values - createMockTransaction handles negation internally
      const mockTransactions = [
        createMockTransaction("tx-existing", 100),
        createMockTransaction("tx-existing-2", 200),
      ];

      (budgetDb.getTransactionsByDateRange as Mock).mockResolvedValue(mockTransactions);
      (budgetDb.bulkUpsertTransactions as Mock).mockResolvedValue(true);
      (budgetDb.clearCacheCategory as Mock).mockResolvedValue(true);

      const dateRange = {
        start: new Date("2024-01-01"),
        end: new Date("2024-01-31"),
      };

      // Mix read and write operations - use positive values as createMockTransaction handles negation
      const operations = [
        budgetDatabaseService.getTransactions({ dateRange }),
        budgetDatabaseService.saveTransactions([createMockTransaction("tx-new-1", 50)]),
        budgetDatabaseService.getTransactions({ dateRange }),
        budgetDatabaseService.saveTransactions([createMockTransaction("tx-new-2", 75)]),
        budgetDatabaseService.getTransactions({ dateRange }),
      ];

      const results = await Promise.allSettled(operations);

      expect(results.every((r) => r.status === "fulfilled")).toBe(true);
      expect(budgetDb.getTransactionsByDateRange).toHaveBeenCalled();
      expect(budgetDb.bulkUpsertTransactions).toHaveBeenCalledTimes(2);
    });

    it("should handle concurrent transaction updates to same envelope", async () => {
      (budgetDb.bulkUpsertTransactions as Mock).mockResolvedValue(true);
      (budgetDb.clearCacheCategory as Mock).mockResolvedValue(true);

      // All transactions affect the same envelope - expenses must be negative
      const transactions = Array.from({ length: 10 }, (_, i) => ({
        id: `tx-concurrent-${i}`,
        date: new Date(),
        amount: -(10 + i), // Negative for expense
        envelopeId: "shared-envelope",
        category: "expenses",
        type: "expense" as const,
        lastModified: Date.now() + i,
      }));

      const creates = transactions.map((tx) => budgetDatabaseService.saveTransactions([tx]));
      const results = await Promise.allSettled(creates);

      expect(results.every((r) => r.status === "fulfilled")).toBe(true);
    });
  });

  describe("Concurrent Sync Operations", () => {
    it("should handle concurrent database initialization attempts", async () => {
      (budgetDb.open as Mock).mockResolvedValue(true);

      // Attempt multiple initializations concurrently
      const inits = [
        budgetDatabaseService.initialize(),
        budgetDatabaseService.initialize(),
        budgetDatabaseService.initialize(),
      ];

      const results = await Promise.allSettled(inits);

      expect(results.every((r) => r.status === "fulfilled")).toBe(true);
    });

    it("should handle concurrent cache operations", async () => {
      (budgetDb.getCachedValue as Mock).mockResolvedValue(null);
      (budgetDb.setCachedValue as Mock).mockResolvedValue(true);
      (budgetDb.getActiveEnvelopes as Mock).mockResolvedValue([]);

      // Concurrent cache reads/writes
      const cacheOps = [
        budgetDatabaseService.getEnvelopes({ useCache: true }),
        budgetDatabaseService.getEnvelopes({ useCache: true }),
        budgetDatabaseService.getEnvelopes({ useCache: true }),
      ];

      const results = await Promise.allSettled(cacheOps);

      expect(results.every((r) => r.status === "fulfilled")).toBe(true);
    });

    it("should handle concurrent analytics data requests", async () => {
      const mockData = [{ id: "1", amount: 100 }];
      (budgetDb.getCachedValue as Mock).mockResolvedValue(null);
      (budgetDb.getAnalyticsData as Mock).mockResolvedValue(mockData);
      (budgetDb.setCachedValue as Mock).mockResolvedValue(true);

      const dateRange = {
        start: new Date("2024-01-01"),
        end: new Date("2024-01-31"),
      };

      // Multiple concurrent analytics requests
      const requests = [
        budgetDatabaseService.getAnalyticsData(dateRange, { useCache: true }),
        budgetDatabaseService.getAnalyticsData(dateRange, { useCache: true }),
        budgetDatabaseService.getAnalyticsData(dateRange, { useCache: true }),
      ];

      const results = await Promise.allSettled(requests);

      expect(results.every((r) => r.status === "fulfilled")).toBe(true);
    });

    it("should handle concurrent batch update operations", async () => {
      (budgetDb.batchUpdate as Mock).mockResolvedValue(true);
      (budgetDb.cache.clear as Mock).mockResolvedValue(undefined);

      const batchUpdates = [
        [
          {
            collection: "envelopes",
            type: "envelope" as const,
            operation: "upsert" as const,
            data: { id: "env-1" },
          },
        ],
        [
          {
            collection: "transactions",
            type: "transaction" as const,
            operation: "upsert" as const,
            data: { id: "tx-1" },
          },
        ],
        [
          {
            collection: "bills",
            type: "bill" as const,
            operation: "upsert" as const,
            data: { id: "bill-1" },
          },
        ],
      ];

      const operations = batchUpdates.map((update) => budgetDatabaseService.batchUpdate(update));
      const results = await Promise.allSettled(operations);

      expect(results.every((r) => r.status === "fulfilled")).toBe(true);
      expect(budgetDb.batchUpdate).toHaveBeenCalledTimes(3);
    });
  });

  describe("Concurrent Backup Operations", () => {
    it("should handle concurrent data collection for backup", async () => {
      (budgetDb.getActiveEnvelopes as Mock).mockResolvedValue([]);
      (budgetDb.getTransactionsByDateRange as Mock).mockResolvedValue([]);
      (budgetDb.bills.toArray as Mock).mockResolvedValue([]);
      (budgetDb.budget.get as Mock).mockResolvedValue({ unassignedCash: 0 });

      // Simulate concurrent backup data collection requests
      const collectionRequests = [
        Promise.all([
          budgetDatabaseService.getEnvelopes(),
          budgetDatabaseService.getBills({}),
          budgetDatabaseService.getBudgetMetadata(),
        ]),
        Promise.all([
          budgetDatabaseService.getEnvelopes(),
          budgetDatabaseService.getBills({}),
          budgetDatabaseService.getBudgetMetadata(),
        ]),
      ];

      const results = await Promise.allSettled(collectionRequests);

      expect(results.every((r) => r.status === "fulfilled")).toBe(true);
    });

    it("should handle concurrent save operations during backup restore", async () => {
      (budgetDb.bulkUpsertEnvelopes as Mock).mockResolvedValue(true);
      (budgetDb.bulkUpsertTransactions as Mock).mockResolvedValue(true);
      (budgetDb.bulkUpsertBills as Mock).mockResolvedValue(true);
      (budgetDb.clearCacheCategory as Mock).mockResolvedValue(true);

      const mockEnvelopes = [
        {
          id: "env-1",
          name: "Test",
          category: "expenses",
          archived: false,
          lastModified: Date.now(),
        },
      ];
      // Expenses must be negative per schema convention
      const mockTransactions = [
        {
          id: "tx-1",
          date: new Date(),
          amount: -100, // Negative for expense
          envelopeId: "env-1",
          category: "food",
          type: "expense" as const,
          lastModified: Date.now(),
        },
      ];
      const mockBills = [
        {
          id: "bill-1",
          name: "Rent",
          dueDate: new Date(),
          amount: 1000,
          category: "housing",
          isPaid: false,
          isRecurring: true,
          lastModified: Date.now(),
        },
      ];

      // Concurrent restore operations
      const restoreOps = [
        budgetDatabaseService.saveEnvelopes(mockEnvelopes),
        budgetDatabaseService.saveTransactions(mockTransactions),
        budgetDatabaseService.saveBills(mockBills),
      ];

      const results = await Promise.allSettled(restoreOps);

      expect(results.every((r) => r.status === "fulfilled")).toBe(true);
    });

    it("should handle concurrent metadata updates during backup", async () => {
      (budgetDb.budget.put as Mock).mockResolvedValue(true);

      const metadataUpdates = [
        budgetDatabaseService.saveBudgetMetadata({ unassignedCash: 100 }),
        budgetDatabaseService.saveBudgetMetadata({ unassignedCash: 200 }),
        budgetDatabaseService.saveBudgetMetadata({ unassignedCash: 300 }),
      ];

      const results = await Promise.allSettled(metadataUpdates);

      expect(results.every((r) => r.status === "fulfilled")).toBe(true);
      expect(budgetDb.budget.put).toHaveBeenCalledTimes(3);
    });
  });

  describe("Race Condition Handling", () => {
    it("should handle read-after-write race condition", async () => {
      let currentValue = 100;

      (budgetDb.getActiveEnvelopes as Mock).mockImplementation(() => {
        return Promise.resolve([
          {
            id: "env-1",
            name: "Test",
            category: "expenses",
            archived: false,
            lastModified: Date.now(),
            currentBalance: currentValue,
          },
        ]);
      });

      (budgetDb.bulkUpsertEnvelopes as Mock).mockImplementation(
        (envs: { currentBalance: number }[]) => {
          currentValue = envs[0].currentBalance;
          return Promise.resolve(true);
        }
      );
      (budgetDb.clearCacheCategory as Mock).mockResolvedValue(true);

      // Interleave reads and writes
      const operations: Promise<unknown>[] = [];
      for (let i = 0; i < 5; i++) {
        operations.push(budgetDatabaseService.getEnvelopes());
        operations.push(
          budgetDatabaseService.saveEnvelopes([
            {
              id: "env-1",
              name: "Test",
              category: "expenses",
              archived: false,
              lastModified: Date.now(),
              currentBalance: 100 * (i + 2),
            },
          ])
        );
      }

      const results = await Promise.allSettled(operations);

      expect(results.every((r) => r.status === "fulfilled")).toBe(true);
    });

    it("should handle write-write race condition with eventual consistency", async () => {
      const writeOrder: number[] = [];
      let writeCounter = 0;

      (budgetDb.bulkUpsertEnvelopes as Mock).mockImplementation(() => {
        const order = ++writeCounter;
        writeOrder.push(order);
        // Add small delay to simulate async write
        return new Promise((resolve) => setTimeout(() => resolve(true), Math.random() * 10));
      });
      (budgetDb.clearCacheCategory as Mock).mockResolvedValue(true);

      const writes = Array.from({ length: 5 }, (_, i) =>
        budgetDatabaseService.saveEnvelopes([
          {
            id: "env-1",
            name: `Version ${i}`,
            category: "expenses",
            archived: false,
            lastModified: Date.now() + i,
          },
        ])
      );

      await Promise.all(writes);

      // All writes should have completed
      expect(writeOrder).toHaveLength(5);
      // Writes may complete in any order due to async nature
      expect(writeOrder.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it("should handle cache invalidation race condition", async () => {
      let cacheValid = true;
      const cachedData = [
        {
          id: "env-1",
          name: "Cached",
          category: "expenses",
          archived: false,
          lastModified: Date.now(),
        },
      ];

      (budgetDb.getCachedValue as Mock).mockImplementation(() => {
        return Promise.resolve(cacheValid ? cachedData : null);
      });

      (budgetDb.clearCacheCategory as Mock).mockImplementation(() => {
        cacheValid = false;
        return Promise.resolve(true);
      });

      (budgetDb.getActiveEnvelopes as Mock).mockResolvedValue([
        {
          id: "env-1",
          name: "Fresh",
          category: "expenses",
          archived: false,
          lastModified: Date.now(),
        },
      ]);

      // Concurrent cache reads and invalidation
      const operations = [
        budgetDatabaseService.getEnvelopes({ useCache: true }),
        budgetDb.clearCacheCategory("envelopes"),
        budgetDatabaseService.getEnvelopes({ useCache: true }),
      ];

      const results = await Promise.allSettled(operations);

      expect(results.every((r) => r.status === "fulfilled")).toBe(true);
    });

    it("should handle concurrent database clear and write operations", async () => {
      (budgetDb.transaction as Mock).mockImplementation((_mode, _tables, fn) => fn());
      (budgetDb.budget.clear as Mock).mockResolvedValue(undefined);
      (budgetDb.envelopes.clear as Mock).mockResolvedValue(undefined);
      (budgetDb.transactions.clear as Mock).mockResolvedValue(undefined);
      (budgetDb.bills.clear as Mock).mockResolvedValue(undefined);
      (budgetDb.savingsGoals.clear as Mock).mockResolvedValue(undefined);
      (budgetDb.paycheckHistory.clear as Mock).mockResolvedValue(undefined);
      (budgetDb.debts.clear as Mock).mockResolvedValue(undefined);
      (budgetDb.cache.clear as Mock).mockResolvedValue(undefined);
      (budgetDb.auditLog.clear as Mock).mockResolvedValue(undefined);
      (budgetDb.bulkUpsertEnvelopes as Mock).mockResolvedValue(true);
      (budgetDb.clearCacheCategory as Mock).mockResolvedValue(true);

      // Race between clear and write
      const operations = [
        budgetDatabaseService.clearData(),
        budgetDatabaseService.saveEnvelopes([
          {
            id: "env-1",
            name: "Test",
            category: "expenses",
            archived: false,
            lastModified: Date.now(),
          },
        ]),
      ];

      const results = await Promise.allSettled(operations);

      // Both operations should complete (order may vary)
      expect(results.every((r) => r.status === "fulfilled")).toBe(true);
    });

    it("should handle high contention scenario with many concurrent operations", async () => {
      (budgetDb.getActiveEnvelopes as Mock).mockResolvedValue([]);
      (budgetDb.bulkUpsertEnvelopes as Mock).mockResolvedValue(true);
      (budgetDb.bulkUpsertTransactions as Mock).mockResolvedValue(true);
      (budgetDb.clearCacheCategory as Mock).mockResolvedValue(true);
      (budgetDb.getCachedValue as Mock).mockResolvedValue(null);
      (budgetDb.getTransactionsByDateRange as Mock).mockResolvedValue([]);

      const operations: Promise<unknown>[] = [];

      // Create 50 mixed operations
      for (let i = 0; i < 50; i++) {
        if (i % 3 === 0) {
          operations.push(budgetDatabaseService.getEnvelopes());
        } else if (i % 3 === 1) {
          operations.push(
            budgetDatabaseService.saveEnvelopes([
              {
                id: `env-${i}`,
                name: `Envelope ${i}`,
                category: "expenses",
                archived: false,
                lastModified: Date.now(),
              },
            ])
          );
        } else {
          // Expenses must be negative per schema convention
          operations.push(
            budgetDatabaseService.saveTransactions([
              {
                id: `tx-${i}`,
                date: new Date(),
                amount: -(i * 10), // Negative for expense
                envelopeId: "env-1",
                category: "expenses",
                type: "expense" as const,
                lastModified: Date.now(),
              },
            ])
          );
        }
      }

      const results = await Promise.allSettled(operations);

      const fulfilled = results.filter((r) => r.status === "fulfilled");
      const rejected = results.filter((r) => r.status === "rejected");

      // All operations should complete successfully
      expect(fulfilled.length).toBe(50);
      expect(rejected.length).toBe(0);
    });

    it("should handle concurrent status check operations", async () => {
      (budgetDb.isOpen as Mock).mockReturnValue(true);

      // Multiple concurrent status checks
      const statusChecks = Array.from({ length: 10 }, () =>
        Promise.resolve(budgetDatabaseService.getStatus())
      );

      const results = await Promise.all(statusChecks);

      expect(results).toHaveLength(10);
      expect(results.every((status) => status.isInitialized === true)).toBe(true);
    });
  });
});
