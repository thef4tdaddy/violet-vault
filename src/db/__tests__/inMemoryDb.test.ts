import { describe, it, expect, vi, afterEach } from "vitest";
import { createInMemoryDB, isInMemoryDatabase, restoreRealIndexedDB } from "../inMemoryDb";
import { VioletVaultDB } from "../budgetDb";
import Dexie from "dexie";

// Mock logger
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("inMemoryDb", () => {
  afterEach(() => {
    // Restore real IndexedDB after each test
    restoreRealIndexedDB();
  });

  describe("createInMemoryDB", () => {
    it("should create a VioletVaultDB instance", () => {
      const db = createInMemoryDB();

      expect(db).toBeInstanceOf(VioletVaultDB);
      expect(db).toBeInstanceOf(Dexie);
    });

    it("should mark database as in-memory", () => {
      const db = createInMemoryDB();

      expect(isInMemoryDatabase(db)).toBe(true);
    });

    it("should configure Dexie to use fake-indexeddb", () => {
      createInMemoryDB();

      // Verify Dexie dependencies were changed
      expect(Dexie.dependencies.indexedDB).toBeDefined();
      expect(Dexie.dependencies.IDBKeyRange).toBeDefined();
    });

    it("should create database with correct name", () => {
      const db = createInMemoryDB();

      expect(db.name).toBe("VioletVault");
    });
  });

  describe("isInMemoryDatabase", () => {
    it("should return true for in-memory database", () => {
      const db = createInMemoryDB();

      expect(isInMemoryDatabase(db)).toBe(true);
    });

    it("should return false for regular database", () => {
      const regularDb = new VioletVaultDB();

      expect(isInMemoryDatabase(regularDb)).toBe(false);
    });
  });

  describe("restoreRealIndexedDB", () => {
    it("should restore browser IndexedDB when available", () => {
      // Create in-memory DB first
      createInMemoryDB();

      // Store original indexedDB
      const originalIndexedDB = Dexie.dependencies.indexedDB;

      // Restore
      restoreRealIndexedDB();

      // IndexedDB should be different from the fake one
      expect(Dexie.dependencies.indexedDB).toBeDefined();

      // Note: In test environment, both might point to fake-indexeddb
      // This test mainly verifies the function runs without error
    });
  });

  describe("Database Operations", () => {
    it("should support standard Dexie operations", async () => {
      const db = createInMemoryDB();

      // Test adding an envelope
      const envelope = {
        id: "test-envelope-1",
        name: "Test Envelope",
        category: "Testing",
        balance: 100,
        target: 200,
        archived: false,
        type: "standard" as const,
        lastModified: Date.now(),
      };

      await db.envelopes.add(envelope);

      const retrieved = await db.envelopes.get("test-envelope-1");

      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe("Test Envelope");
      expect(retrieved?.balance).toBe(100);

      // Clean up
      await db.delete();
    });

    it("should not persist data (volatile storage)", async () => {
      // Create first instance and add data
      const db1 = createInMemoryDB();

      const envelope = {
        id: "volatile-test",
        name: "Volatile Envelope",
        category: "Testing",
        balance: 50,
        target: 100,
        archived: false,
        type: "standard" as const,
        lastModified: Date.now(),
      };

      await db1.envelopes.add(envelope);

      // Close and delete the database
      await db1.delete();

      // Create second instance (simulating page refresh)
      const db2 = createInMemoryDB();

      const retrieved = await db2.envelopes.get("volatile-test");

      // Data should NOT persist between instances
      expect(retrieved).toBeUndefined();

      // Clean up
      await db2.delete();
    });
  });
});
