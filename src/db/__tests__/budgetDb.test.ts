/**
 */
import { describe, it, expect, vi } from "vitest";
import { budgetDb, queryHelpers, VioletVaultDB } from "../budgetDb";

// Mock logger to avoid console output during tests
vi.mock("@/utils/common/logger", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("Typed Dexie Database", () => {
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
        "auditLog",
        "cache",
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
      expect(typeof VioletVaultDB).toBe("function");
      expect(budgetDb).toBeDefined();
      expect(queryHelpers).toBeDefined();
    });

    it("should have typed query methods on budgetDb instance", () => {
      const typedMethods = [
        "getActiveEnvelopes",
        "getEnvelopesByCategory",
        "getTransactionsByDateRange",
        "getTransactionsByEnvelope",
        "getTransactionsByCategory",
        "getTransactionsByType",
        "batchUpdate",
        "bulkUpsertEnvelopes",
        "bulkUpsertTransactions",
        "getAnalyticsData",
        "getCachedValue",
        "setCachedValue",
        "cleanupCache",
        "clearCacheCategory",
        "optimizeDatabase",
        "getDatabaseStats",
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
        "getAnalyticsData",
      ];

      helperMethods.forEach((method) => {
        expect(typeof queryHelpers[method]).toBe("function");
      });
    });
  });

  describe("Database Statistics", () => {
    it("should return database statistics", async () => {
      try {
        const stats = await budgetDb.getDatabaseStats();

        expect(stats).toBeDefined();
        expect(typeof stats).toBe("object");
        expect(typeof stats.lastOptimized).toBe("number");

        const expectedStats = ["envelopes", "transactions", "cache"];

        expectedStats.forEach((stat) => {
          expect(typeof stats[stat]).toBe("number");
          expect(stats[stat]).toBeGreaterThanOrEqual(0);
        });
      } catch (error) {
        expect(error.message).toContain("IndexedDB");
      }
    });
  });
});
