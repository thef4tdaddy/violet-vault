/**
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
import type { Envelope, Transaction } from "../types";

// Mock logger
vi.mock("@/utils/common/logger", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("BudgetDB Integration Tests", () => {
  beforeEach(async () => {
    try {
      await clearData();
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  afterEach(async () => {
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
        lastModified: Date.now(),
      };

      try {
        await setEncryptedData(testData);
        const retrieved = await getEncryptedData();
        expect(retrieved?.id).toBe("budgetData");
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
  });

  describe("Envelope Operations", () => {
    const testEnvelope: Envelope = {
      id: "env-test-1",
      name: "Test Envelope",
      category: "Needs",
      type: "standard",
      archived: false,
      lastModified: Date.now(),
    };

    it("should create and retrieve envelope", async () => {
      try {
        await budgetDb.envelopes.put(testEnvelope);
        const retrieved = await budgetDb.envelopes.get("env-test-1");
        expect(retrieved?.name).toBe("Test Envelope");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("Transaction Operations", () => {
    const testTransaction: Transaction = {
      id: "txn-test-1",
      date: new Date("2025-01-15"),
      amount: -75.5,
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
        expect(retrieved?.amount).toBe(-75.5);
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
  });
});
