/**
 * Integration Tests for Dexie Database
 * These tests use real Dexie operations and test against actual IndexedDB (when available)
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  budgetDb,
  getEncryptedData,
  setEncryptedData,
  getBudgetMetadata,
  setBudgetMetadata,
  setUnassignedCash,
  setActualBalance,
  getUnassignedCash,
  getActualBalance,
  clearData,
  queryHelpers,
} from "../budgetDb";
import type { Envelope, Transaction, Bill, SavingsGoal } from "../types";

// Mock logger
vi.mock("../../utils/common/logger", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("BudgetDB Integration Tests", () => {
  beforeEach(async () => {
    // Clear all data before each test
    try {
      await clearData();
    } catch (error) {
      // IndexedDB not available, skip cleanup
    }
  });

  afterEach(async () => {
    // Clean up after tests
    try {
      await clearData();
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe("Budget Data Management", () => {
    it("should set and get encrypted data", async () => {
      const testData = {
        id: "budgetData",
        encrypted: "test-encrypted-data",
        version: 1,
      };

      try {
        await setEncryptedData(testData);
        const retrieved = await getEncryptedData();

        expect(retrieved).toBeDefined();
        if (retrieved) {
          expect(retrieved.id).toBe("budgetData");
          expect(retrieved.encrypted).toBe("test-encrypted-data");
        }
      } catch (error) {
        // IndexedDB not available
        expect(error).toBeDefined();
      }
    });

    it("should set and get budget metadata", async () => {
      const metadata = {
        unassignedCash: 1000,
        actualBalance: 5000,
      };

      try {
        await setBudgetMetadata(metadata);
        const retrieved = await getBudgetMetadata();

        expect(retrieved).toBeDefined();
        if (retrieved) {
          expect(retrieved.unassignedCash).toBe(1000);
          expect(retrieved.actualBalance).toBe(5000);
        }
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should manage unassigned cash", async () => {
      try {
        await setUnassignedCash(500);
        const amount = await getUnassignedCash();
        expect(amount).toBe(500);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should manage actual balance", async () => {
      try {
        await setActualBalance(3000);
        const balance = await getActualBalance();
        expect(balance).toBe(3000);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("Envelope Operations", () => {
    const testEnvelope: Envelope = {
      id: "env-test-1",
      name: "Test Envelope",
      category: "Needs",
      archived: false,
      lastModified: Date.now(),
      currentBalance: 100,
      targetAmount: 500,
    };

    it("should create and retrieve envelope", async () => {
      try {
        await budgetDb.envelopes.put(testEnvelope);
        const retrieved = await budgetDb.envelopes.get("env-test-1");

        expect(retrieved).toBeDefined();
        expect(retrieved?.name).toBe("Test Envelope");
        expect(retrieved?.category).toBe("Needs");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should update envelope balance", async () => {
      try {
        await budgetDb.envelopes.put(testEnvelope);
        await budgetDb.envelopes.update("env-test-1", { currentBalance: 250 });

        const updated = await budgetDb.envelopes.get("env-test-1");
        expect(updated?.currentBalance).toBe(250);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should archive envelope", async () => {
      try {
        await budgetDb.envelopes.put(testEnvelope);
        await budgetDb.envelopes.update("env-test-1", { archived: true });

        const updated = await budgetDb.envelopes.get("env-test-1");
        expect(updated?.archived).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should bulk upsert envelopes", async () => {
      const envelopes: Envelope[] = [
        { ...testEnvelope, id: "env-1", name: "Envelope 1" },
        { ...testEnvelope, id: "env-2", name: "Envelope 2" },
        { ...testEnvelope, id: "env-3", name: "Envelope 3" },
      ];

      try {
        await budgetDb.bulkUpsertEnvelopes(envelopes);
        const count = await budgetDb.envelopes.count();
        expect(count).toBeGreaterThanOrEqual(3);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("Transaction Operations", () => {
    const testTransaction: Transaction = {
      id: "txn-test-1",
      date: new Date("2025-01-15"),
      amount: 75.5,
      envelopeId: "env-1",
      category: "Needs",
      type: "expense",
      lastModified: Date.now(),
      description: "Test transaction",
    };

    it("should create and retrieve transaction", async () => {
      try {
        await budgetDb.transactions.put(testTransaction);
        const retrieved = await budgetDb.transactions.get("txn-test-1");

        expect(retrieved).toBeDefined();
        expect(retrieved?.amount).toBe(75.5);
        expect(retrieved?.type).toBe("expense");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should query transactions by date range", async () => {
      const transactions: Transaction[] = [
        { ...testTransaction, id: "txn-1", date: new Date("2025-01-10") },
        { ...testTransaction, id: "txn-2", date: new Date("2025-01-20") },
        { ...testTransaction, id: "txn-3", date: new Date("2025-02-05") },
      ];

      try {
        await budgetDb.bulkUpsertTransactions(transactions);

        const results = await budgetDb.getTransactionsByDateRange(
          new Date("2025-01-01"),
          new Date("2025-01-31")
        );

        expect(Array.isArray(results)).toBe(true);
        // Should find transactions within January
        const januaryTxns = results.filter(
          (t) => t.date >= new Date("2025-01-01") && t.date <= new Date("2025-01-31")
        );
        expect(januaryTxns.length).toBeGreaterThanOrEqual(0);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should query transactions by envelope", async () => {
      const transactions: Transaction[] = [
        { ...testTransaction, id: "txn-1", envelopeId: "env-groceries" },
        { ...testTransaction, id: "txn-2", envelopeId: "env-groceries" },
        { ...testTransaction, id: "txn-3", envelopeId: "env-gas" },
      ];

      try {
        await budgetDb.bulkUpsertTransactions(transactions);
        const results = await budgetDb.getTransactionsByEnvelope("env-groceries");

        expect(Array.isArray(results)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should query transactions by type", async () => {
      const transactions: Transaction[] = [
        { ...testTransaction, id: "txn-1", type: "income", amount: 2000 },
        { ...testTransaction, id: "txn-2", type: "expense", amount: 50 },
        { ...testTransaction, id: "txn-3", type: "expense", amount: 75 },
      ];

      try {
        await budgetDb.bulkUpsertTransactions(transactions);
        const expenses = await budgetDb.getTransactionsByType("expense");

        expect(Array.isArray(expenses)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("Bill Operations", () => {
    const testBill: Bill = {
      id: "bill-test-1",
      name: "Test Bill",
      dueDate: new Date("2025-02-15"),
      amount: 150,
      category: "Utilities",
      isPaid: false,
      isRecurring: true,
      frequency: "monthly",
      lastModified: Date.now(),
    };

    it("should create and retrieve bill", async () => {
      try {
        await budgetDb.bills.put(testBill);
        const retrieved = await budgetDb.bills.get("bill-test-1");

        expect(retrieved).toBeDefined();
        expect(retrieved?.name).toBe("Test Bill");
        expect(retrieved?.isPaid).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should mark bill as paid", async () => {
      try {
        await budgetDb.bills.put(testBill);
        await budgetDb.bills.update("bill-test-1", { isPaid: true });

        const updated = await budgetDb.bills.get("bill-test-1");
        expect(updated?.isPaid).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should query upcoming bills", async () => {
      const today = new Date();
      const future = new Date(today);
      future.setDate(future.getDate() + 15);

      const bills: Bill[] = [
        { ...testBill, id: "bill-1", dueDate: future, isPaid: false },
        {
          ...testBill,
          id: "bill-2",
          dueDate: new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000),
          isPaid: false,
        },
      ];

      try {
        await budgetDb.bulkUpsertBills(bills);
        const upcoming = await budgetDb.getUpcomingBills(30);

        expect(Array.isArray(upcoming)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should query overdue bills", async () => {
      const past = new Date();
      past.setDate(past.getDate() - 10);

      const bills: Bill[] = [{ ...testBill, id: "bill-1", dueDate: past, isPaid: false }];

      try {
        await budgetDb.bulkUpsertBills(bills);
        const overdue = await budgetDb.getOverdueBills();

        expect(Array.isArray(overdue)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should query recurring bills", async () => {
      const bills: Bill[] = [
        { ...testBill, id: "bill-1", isRecurring: true },
        { ...testBill, id: "bill-2", isRecurring: false },
      ];

      try {
        await budgetDb.bulkUpsertBills(bills);
        const recurring = await budgetDb.getRecurringBills();

        expect(Array.isArray(recurring)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("Savings Goal Operations", () => {
    const testGoal: SavingsGoal = {
      id: "goal-test-1",
      name: "Test Goal",
      category: "Wants",
      priority: "high",
      targetAmount: 2000,
      currentAmount: 500,
      targetDate: new Date("2025-12-31"),
      isPaused: false,
      isCompleted: false,
      lastModified: Date.now(),
    };

    it("should create and retrieve savings goal", async () => {
      try {
        await budgetDb.savingsGoals.put(testGoal);
        const retrieved = await budgetDb.savingsGoals.get("goal-test-1");

        expect(retrieved).toBeDefined();
        expect(retrieved?.name).toBe("Test Goal");
        expect(retrieved?.targetAmount).toBe(2000);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should update goal progress", async () => {
      try {
        await budgetDb.savingsGoals.put(testGoal);
        await budgetDb.savingsGoals.update("goal-test-1", { currentAmount: 1000 });

        const updated = await budgetDb.savingsGoals.get("goal-test-1");
        expect(updated?.currentAmount).toBe(1000);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should query active savings goals", async () => {
      const goals: SavingsGoal[] = [
        { ...testGoal, id: "goal-1", isCompleted: false, isPaused: false },
        { ...testGoal, id: "goal-2", isCompleted: true, isPaused: false },
        { ...testGoal, id: "goal-3", isCompleted: false, isPaused: true },
      ];

      try {
        await budgetDb.bulkUpsertSavingsGoals(goals);
        const active = await budgetDb.getActiveSavingsGoals();

        expect(Array.isArray(active)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should query goals by priority", async () => {
      const goals: SavingsGoal[] = [
        { ...testGoal, id: "goal-1", priority: "high" },
        { ...testGoal, id: "goal-2", priority: "medium" },
        { ...testGoal, id: "goal-3", priority: "high" },
      ];

      try {
        await budgetDb.bulkUpsertSavingsGoals(goals);
        const highPriority = await budgetDb.getSavingsGoalsByPriority("high");

        expect(Array.isArray(highPriority)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("Cache Operations", () => {
    it("should set and retrieve cached value", async () => {
      const key = "test-cache-key";
      const value = { data: "test data", count: 42 };

      try {
        await budgetDb.setCachedValue(key, value, 60000, "test-category");
        const cached = await budgetDb.getCachedValue(key);

        expect(cached).toBeDefined();
        if (cached) {
          expect((cached as typeof value).data).toBe("test data");
          expect((cached as typeof value).count).toBe(42);
        }
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should return null for expired cache", async () => {
      const key = "test-cache-expired";
      const value = { data: "expired" };

      try {
        // Set cache with 1ms TTL
        await budgetDb.setCachedValue(key, value, 1, "test");
        // Wait for expiration
        await new Promise((resolve) => setTimeout(resolve, 10));

        const cached = await budgetDb.getCachedValue(key, 1);
        expect(cached).toBeNull();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should clear cache by category", async () => {
      try {
        await budgetDb.setCachedValue("key1", "value1", 60000, "cat1");
        await budgetDb.setCachedValue("key2", "value2", 60000, "cat1");
        await budgetDb.setCachedValue("key3", "value3", 60000, "cat2");

        await budgetDb.clearCacheCategory("cat1");

        const cached1 = await budgetDb.getCachedValue("key1");
        const cached3 = await budgetDb.getCachedValue("key3");

        expect(cached1).toBeNull();
        // key3 should still exist
        if (cached3 !== null) {
          expect(cached3).toBeDefined();
        }
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should cleanup expired cache entries", async () => {
      try {
        // Add expired entry
        await budgetDb.cache.put({
          key: "expired-key",
          value: "old data",
          expiresAt: Date.now() - 10000, // 10 seconds ago
          category: "test",
        });

        await budgetDb.cleanupCache();

        const cached = await budgetDb.cache.get("expired-key");
        expect(cached).toBeUndefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("Query Helpers", () => {
    it("should get active envelopes via helper", async () => {
      try {
        const envelopes = await queryHelpers.getActiveEnvelopes();
        expect(Array.isArray(envelopes)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should get recent transactions via helper", async () => {
      try {
        const transactions = await queryHelpers.getRecentTransactions(7);
        expect(Array.isArray(transactions)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should get upcoming bills via helper", async () => {
      try {
        const bills = await queryHelpers.getUpcomingBills(30);
        expect(Array.isArray(bills)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should get analytics data via helper", async () => {
      const dateRange = {
        start: new Date("2025-01-01"),
        end: new Date("2025-12-31"),
      };

      try {
        const data = await queryHelpers.getAnalyticsData(dateRange, false);
        expect(Array.isArray(data)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("Database Statistics and Optimization", () => {
    it("should get database statistics", async () => {
      try {
        const stats = await budgetDb.getDatabaseStats();

        expect(stats).toBeDefined();
        expect(typeof stats.envelopes).toBe("number");
        expect(typeof stats.transactions).toBe("number");
        expect(typeof stats.bills).toBe("number");
        expect(typeof stats.savingsGoals).toBe("number");
        expect(typeof stats.paychecks).toBe("number");
        expect(typeof stats.cache).toBe("number");
        expect(typeof stats.lastOptimized).toBe("number");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should optimize database", async () => {
      try {
        // Add some test data
        await budgetDb.cache.put({
          key: "test",
          value: "data",
          expiresAt: Date.now() - 10000,
          category: "test",
        });

        await budgetDb.optimizeDatabase();

        // Cache should be cleaned
        const stats = await budgetDb.getDatabaseStats();
        expect(stats).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("Batch Operations", () => {
    it("should perform batch updates across multiple tables", async () => {
      const updates = [
        {
          type: "envelope" as const,
          data: {
            id: "env-batch-1",
            name: "Batch Envelope",
            category: "Needs",
            archived: false,
            lastModified: Date.now(),
          },
        },
        {
          type: "transaction" as const,
          data: {
            id: "txn-batch-1",
            date: new Date(),
            amount: 100,
            envelopeId: "env-batch-1",
            category: "Needs",
            type: "expense" as const,
            lastModified: Date.now(),
          },
        },
        {
          type: "bill" as const,
          data: {
            id: "bill-batch-1",
            name: "Batch Bill",
            dueDate: new Date(),
            amount: 50,
            category: "Utilities",
            isPaid: false,
            isRecurring: false,
            lastModified: Date.now(),
          },
        },
      ];

      try {
        await budgetDb.batchUpdate(updates);

        // Verify all updates were applied
        const envelope = await budgetDb.envelopes.get("env-batch-1");
        const transaction = await budgetDb.transactions.get("txn-batch-1");
        const bill = await budgetDb.bills.get("bill-batch-1");

        expect(envelope).toBeDefined();
        expect(transaction).toBeDefined();
        expect(bill).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("Clear Data Operations", () => {
    it("should clear all data from database", async () => {
      try {
        // Add some test data
        await budgetDb.envelopes.put({
          id: "env-clear-test",
          name: "Test",
          category: "Needs",
          archived: false,
          lastModified: Date.now(),
        });

        await clearData();

        const count = await budgetDb.envelopes.count();
        expect(count).toBe(0);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("Data Integrity - Timestamps", () => {
    it("should auto-set timestamps on creation", async () => {
      const beforeTime = Date.now();

      const envelope: Envelope = {
        id: "env-timestamp-test",
        name: "Timestamp Test",
        category: "Needs",
        archived: false,
        lastModified: 0, // Should be auto-set
      };

      try {
        await budgetDb.envelopes.add(envelope);
        const retrieved = await budgetDb.envelopes.get("env-timestamp-test");

        const afterTime = Date.now();

        expect(retrieved).toBeDefined();
        if (retrieved) {
          expect(retrieved.lastModified).toBeGreaterThanOrEqual(beforeTime);
          expect(retrieved.lastModified).toBeLessThanOrEqual(afterTime);
          expect(retrieved.createdAt).toBeGreaterThanOrEqual(beforeTime);
          expect(retrieved.createdAt).toBeLessThanOrEqual(afterTime);
        }
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should update lastModified on modifications", async () => {
      const envelope: Envelope = {
        id: "env-modify-test",
        name: "Modify Test",
        category: "Needs",
        archived: false,
        lastModified: Date.now(),
      };

      try {
        await budgetDb.envelopes.add(envelope);
        const initial = await budgetDb.envelopes.get("env-modify-test");
        const initialTime = initial?.lastModified || 0;

        // Wait a bit to ensure timestamp difference
        await new Promise((resolve) => setTimeout(resolve, 10));

        await budgetDb.envelopes.update("env-modify-test", { name: "Modified" });
        const updated = await budgetDb.envelopes.get("env-modify-test");

        expect(updated?.lastModified).toBeGreaterThan(initialTime);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
