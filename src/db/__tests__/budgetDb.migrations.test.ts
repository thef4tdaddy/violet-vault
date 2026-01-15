/**
 * Migration and Schema Evolution Tests for Dexie Database
 */
import { describe, it, expect, vi } from "vitest";
import { VioletVaultDB } from "../budgetDb";

// Mock logger
vi.mock("@/utils/common/logger", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("VioletVaultDB - Schema Tests", () => {
  describe("Schema Version Management", () => {
    it("should have correct current version", () => {
      const db = new VioletVaultDB();
      expect(db.verno).toBe(11); // Updated to version 11
      expect(db.name).toBe("VioletVault");
    });

    it("should define all simplified tables in current version", () => {
      const db = new VioletVaultDB();
      const tableNames = db.tables.map((t) => t.name);

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
        "offlineRequestQueue",
        "autoFundingRules",
        "autoFundingHistory",
      ];

      expectedTables.forEach((tableName) => {
        expect(tableNames).toContain(tableName);
      });
    });

    it("should not have deprecated legacy tables", () => {
      const db = new VioletVaultDB();
      const tableNames = db.tables.map((t) => t.name);

      const deprecatedTables = ["bills", "savingsGoals", "paycheckHistory", "debts"];
      deprecatedTables.forEach((tableName) => {
        expect(tableNames).not.toContain(tableName);
      });
    });
  });

  describe("Index Configuration (v11)", () => {
    it("should have new envelope indexes", () => {
      const db = new VioletVaultDB();
      const schema = db.envelopes.schema;
      const indexNames = schema.indexes.map((idx) => idx.name);

      expect(indexNames).toContain("type");
      expect(indexNames).toContain("[type+archived]");
    });

    it("should have scheduled transaction index", () => {
      const db = new VioletVaultDB();
      const schema = db.transactions.schema;
      const indexNames = schema.indexes.map((idx) => idx.name);

      expect(indexNames).toContain("isScheduled");
    });
  });

  describe("Database Instance Management", () => {
    it("should support database opening and closing", async () => {
      const db = new VioletVaultDB();
      try {
        await db.open();
        expect(db.isOpen()).toBe(true);
        await db.close();
        expect(db.isOpen()).toBe(false);
      } catch (error) {
        expect(error.message).toContain("IndexedDB");
      }
    });
  });
});
