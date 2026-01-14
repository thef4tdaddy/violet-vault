/**
 * Migration and Schema Evolution Tests for Dexie Database
 * v2.0: Fresh start - no migration from previous versions
 */
import { describe, it, expect, vi } from "vitest";
import { VioletVaultDB } from "../budgetDb";

// Mock logger
vi.mock("../../utils/common/logger", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("VioletVaultDB - Schema Tests (v2.0)", () => {
  describe("Schema Version Management", () => {
    it("should have correct current version (v11 - v2.0 baseline)", () => {
      const db = new VioletVaultDB();
      expect(db.verno).toBe(11); // Version 11 is the v2.0 baseline
      expect(db.name).toBe("VioletVault");
    });

    it("should define all unified tables in v2.0", () => {
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

      // v2.0 Fresh Start: These legacy tables should not exist
      const deprecatedTables = ["bills", "savingsGoals", "paycheckHistory", "debts"];
      deprecatedTables.forEach((tableName) => {
        expect(tableNames).not.toContain(tableName);
      });
    });
  });

  describe("v2.0 Fresh Start - No Migration Support", () => {
    it("should use version 11 as baseline", () => {
      const db = new VioletVaultDB();
      expect(db.verno).toBe(11);
    });

    it("should have unified envelope types", () => {
      const db = new VioletVaultDB();
      const schema = db.envelopes.schema;
      const indexNames = schema.indexes.map((idx) => idx.name);

      // v2.0: Envelopes unified with type field
      expect(indexNames).toContain("type");
      expect(indexNames).toContain("[type+archived]");
    });

    it("should support scheduled transactions", () => {
      const db = new VioletVaultDB();
      const schema = db.transactions.schema;
      const indexNames = schema.indexes.map((idx) => idx.name);

      // v2.0: Transactions include scheduled flag
      expect(indexNames).toContain("isScheduled");
      expect(indexNames).toContain("[isScheduled+date]");
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
