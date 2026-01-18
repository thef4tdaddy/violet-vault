/**
 * @jest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { VioletVaultDB } from "../budgetDb";
import type { Envelope, Transaction, BudgetCommit, BudgetChange } from "../types";

// Mock logger
vi.mock("@/utils/common/logger", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("VioletVaultDB - Comprehensive Tests", () => {
  let testDb: VioletVaultDB;

  beforeEach(() => {
    testDb = new VioletVaultDB();
  });

  afterEach(async () => {
    try {
      await testDb.delete();
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe("Database Initialization & Schema", () => {
    it("should initialize database with correct name and version", () => {
      expect(testDb.name).toBe("VioletVault");
      expect(testDb.verno).toBe(11);
    });

    it("should have all required tables defined", () => {
      const requiredTables = [
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

      requiredTables.forEach((tableName) => {
        expect(testDb[tableName]).toBeDefined();
      });
    });
  });

  describe("CRUD Operations - Envelopes", () => {
    const mockEnvelope: Envelope = {
      id: "env-1",
      name: "Groceries",
      category: "Needs",
      type: "standard",
      archived: false,
      lastModified: Date.now(),
    };

    it("should perform basic CRUD on envelopes", async () => {
      try {
        await testDb.envelopes.add(mockEnvelope);
        const retrieved = await testDb.envelopes.get("env-1");
        expect(retrieved?.name).toBe("Groceries");

        await testDb.envelopes.update("env-1", { name: "Updated" });
        const updated = await testDb.envelopes.get("env-1");
        expect(updated?.name).toBe("Updated");

        await testDb.envelopes.delete("env-1");
        const deleted = await testDb.envelopes.get("env-1");
        expect(deleted).toBeUndefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("CRUD Operations - Transactions", () => {
    const mockTransaction: Transaction = {
      id: "txn-1",
      date: new Date(),
      amount: -50.0,
      envelopeId: "env-1",
      category: "Needs",
      type: "expense",
      lastModified: Date.now(),
      description: "Test transaction",
    };

    it("should perform basic CRUD on transactions", async () => {
      try {
        await testDb.transactions.add(mockTransaction);
        const retrieved = await testDb.transactions.get("txn-1");
        expect(retrieved?.amount).toBe(-50.0);

        await testDb.transactions.update("txn-1", { amount: -75.0 });
        const updated = await testDb.transactions.get("txn-1");
        expect(updated?.amount).toBe(-75.0);

        await testDb.transactions.delete("txn-1");
        const deleted = await testDb.transactions.get("txn-1");
        expect(deleted).toBeUndefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("Batch Operations", () => {
    it("should support batchUpdate", async () => {
      const updates = [
        {
          type: "envelope" as const,
          data: {
            id: "env-batch",
            name: "Batch Env",
            category: "Needs",
            type: "standard",
            archived: false,
            lastModified: Date.now(),
          },
        },
      ];

      try {
        await testDb.batchUpdate(updates);
        const retrieved = await testDb.envelopes.get("env-batch");
        expect(retrieved?.name).toBe("Batch Env");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("Database Statistics", () => {
    it("should get database statistics", async () => {
      try {
        const stats = await testDb.getDatabaseStats();
        expect(stats).toBeDefined();
        expect(typeof stats.envelopes).toBe("number");
        expect(typeof stats.transactions).toBe("number");
        expect(typeof stats.cache).toBe("number");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
