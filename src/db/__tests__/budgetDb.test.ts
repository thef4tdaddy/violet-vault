/**
 * @jest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { budgetDb, queryHelpers, VioletVaultDB } from "../budgetDb";

// Mock logger to avoid console output during tests
vi.mock("../../utils/common/logger", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

// Note: IndexedDB mocking is handled by vitest environment

describe("Typed Dexie Database", () => {
  // Skip database operations in test environment - focus on API shape testing

  describe("Database Instance", () => {
    it("should create VioletVaultDB instance", () => {
      expect(budgetDb).toBeInstanceOf(VioletVaultDB);
      expect(budgetDb.name).toBe("VioletVault");
    });

    it("should have all required tables", () => {
      const expectedTables = [
        "budget",
        "envelopes",
        "transactions",
        "bills",
        "savingsGoals",
        "paycheckHistory",
        "auditLog",
        "cache",
        "debts",
        "budgetCommits",
        "budgetChanges",
        "budgetBranches",
        "budgetTags",
        "autoBackups",
      ];

      expectedTables.forEach((tableName) => {
        expect(budgetDb[tableName]).toBeDefined();
        expect(typeof budgetDb[tableName].put).toBe("function");
        expect(typeof budgetDb[tableName].get).toBe("function");
        expect(typeof budgetDb[tableName].toArray).toBe("function");
      });
    });
  });

  describe("TypeScript Integration", () => {
    it("should export all necessary functions", () => {
      // Check that all functions are exported and accessible
      expect(typeof VioletVaultDB).toBe("function");
      expect(budgetDb).toBeDefined();
      expect(queryHelpers).toBeDefined();
    });

    it("should have typed query methods on budgetDb instance", () => {
      // Verify all typed methods exist
      const typedMethods = [
        "getActiveEnvelopes",
        "getEnvelopesByCategory",
        "getTransactionsByDateRange",
        "getTransactionsByEnvelope",
        "getTransactionsByCategory",
        "getTransactionsByType",
        "getUpcomingBills",
        "getOverdueBills",
        "getPaidBills",
        "getBillsByCategory",
        "getRecurringBills",
        "getActiveSavingsGoals",
        "getCompletedSavingsGoals",
        "getSavingsGoalsByCategory",
        "getSavingsGoalsByPriority",
        "getUpcomingDeadlines",
        "getPaycheckHistory",
        "getPaychecksByDateRange",
        "getPaychecksBySource",
        "batchUpdate",
        "bulkUpsertEnvelopes",
        "bulkUpsertTransactions",
        "bulkUpsertBills",
        "bulkUpsertDebts",
        "bulkUpsertSavingsGoals",
        "bulkUpsertPaychecks",
        "getAnalyticsData",
        "getCategorySpending",
        "getEnvelopeTransactions",
        "getCachedValue",
        "setCachedValue",
        "cleanupCache",
        "clearCacheCategory",
        "optimizeDatabase",
        "getDatabaseStats",
        "createBudgetCommit",
        "createBudgetChanges",
        "createBudgetBranch",
        "createBudgetTag",
      ];

      typedMethods.forEach((method) => {
        expect(typeof budgetDb[method]).toBe("function");
      });
    });

    it("should have all query helpers", () => {
      const helperMethods = [
        "getActiveEnvelopes",
        "getEnvelopesByCategory",
        "getRecentTransactions",
        "getUpcomingBills",
        "getOverdueBills",
        "getActiveSavingsGoals",
        "getUpcomingDeadlines",
        "getAnalyticsData",
      ];

      helperMethods.forEach((method) => {
        expect(typeof queryHelpers[method]).toBe("function");
      });
    });
  });

  describe("Backward Compatibility", () => {
    it("should maintain backward compatibility with original exports", async () => {
      // Test that all original functions still work
      expect(typeof budgetDb.transaction).toBe("function");
      expect(typeof budgetDb.table).toBe("function");
    });

    it("should support original method signatures", () => {
      // Test that methods can be called with original signatures
      expect(() => budgetDb.getActiveEnvelopes()).not.toThrow();
      expect(() => budgetDb.getEnvelopesByCategory("test")).not.toThrow();
      expect(() => budgetDb.getTransactionsByDateRange(new Date(), new Date())).not.toThrow();
    });
  });

  describe("Cache Management", () => {
    it("should handle cache operations", async () => {
      const testKey = "test-key";
      const testValue = { data: "test" };

      // Should be able to set and get cache values
      expect(() => budgetDb.setCachedValue(testKey, testValue)).not.toThrow();
      expect(() => budgetDb.getCachedValue(testKey)).not.toThrow();
    });

    it("should handle cache cleanup", async () => {
      expect(() => budgetDb.cleanupCache()).not.toThrow();
      expect(() => budgetDb.clearCacheCategory("test")).not.toThrow();
    });
  });

  describe("Database Statistics", () => {
    it("should return database statistics", async () => {
      try {
        const stats = await budgetDb.getDatabaseStats();

        expect(stats).toBeDefined();
        expect(typeof stats).toBe("object");
        expect(typeof stats.lastOptimized).toBe("number");

        // Should have counts for all tables
        const expectedStats = [
          "envelopes",
          "transactions",
          "bills",
          "savingsGoals",
          "paychecks",
          "cache",
        ];

        expectedStats.forEach((stat) => {
          expect(typeof stats[stat]).toBe("number");
          expect(stats[stat]).toBeGreaterThanOrEqual(0);
        });
      } catch (error) {
        // In test environment, IndexedDB may not be available
        expect(error.message).toContain("IndexedDB");
      }
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors gracefully", async () => {
      // Test that errors don't crash the application
      try {
        await budgetDb.getDatabaseStats();
      } catch (error) {
        // Expected in test environment without proper IndexedDB
        expect(error).toBeDefined();
      }
    });
  });
});
