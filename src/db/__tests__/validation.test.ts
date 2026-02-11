/**
 * Validation Layer Tests
 * Tests for Zod validation in database operations
 * Part of Issue #1537: Phase 1.8 - Add Zod Validation Layer to Database Operations
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { budgetDb } from "../budgetDb";

// Mock logger to avoid console output during tests
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("Database Validation Layer", () => {
  beforeEach(async () => {
    // Use fake-indexeddb for testing
    await budgetDb.open();
  });

  afterEach(async () => {
    // Clean up after each test
    try {
      await budgetDb.delete();
    } catch (error) {
      // Ignore errors during cleanup
    }
  });

  describe("Envelope Validation", () => {
    it("should reject envelope with missing required fields", async () => {
      const invalidEnvelope = {
        name: "Test Envelope",
        // Missing id, category, archived, lastModified, currentBalance
      };

      await expect(budgetDb.addEnvelope(invalidEnvelope)).rejects.toThrow();
    });

    it("should reject envelope with invalid type", async () => {
      const invalidEnvelope = {
        id: "env-1",
        name: "Test",
        category: "Housing",
        archived: false,
        lastModified: Date.now(),
        currentBalance: 100,
        type: "invalid-type", // Invalid type
      };

      await expect(budgetDb.addEnvelope(invalidEnvelope)).rejects.toThrow();
    });

    it("should accept valid standard envelope", async () => {
      const validEnvelope = {
        id: "env-1",
        name: "Test Envelope",
        category: "Housing",
        archived: false,
        lastModified: Date.now(),
        currentBalance: 100,
        color: "#3B82F6",
        autoAllocate: true,
        type: "standard",
      };

      const result = await budgetDb.addEnvelope(validEnvelope);
      expect(result).toBe("env-1");
    });

    it("should accept valid goal envelope", async () => {
      const validGoal = {
        id: "goal-1",
        name: "Vacation Fund",
        category: "Savings",
        archived: false,
        lastModified: Date.now(),
        currentBalance: 500,
        color: "#10B981",
        autoAllocate: true,
        type: "goal",
        targetAmount: 2000,
        priority: "high",
        isPaused: false,
        isCompleted: false,
      };

      const result = await budgetDb.addEnvelope(validGoal);
      expect(result).toBe("goal-1");
    });

    it("should update envelope with partial data", async () => {
      const envelope = {
        id: "env-1",
        name: "Original Name",
        category: "Housing",
        archived: false,
        lastModified: Date.now(),
        currentBalance: 100,
        color: "#3B82F6",
        autoAllocate: true,
        type: "standard",
      };

      await budgetDb.addEnvelope(envelope);

      const updates = {
        name: "Updated Name",
        currentBalance: 200,
      };

      const result = await budgetDb.updateEnvelope("env-1", updates);
      expect(result).toBe(1);
    });

    it("should put (upsert) valid envelope", async () => {
      const envelope = {
        id: "env-1",
        name: "Test Envelope",
        category: "Housing",
        archived: false,
        lastModified: Date.now(),
        currentBalance: 100,
        color: "#3B82F6",
        autoAllocate: true,
        type: "standard",
      };

      const result = await budgetDb.putEnvelope(envelope);
      expect(result).toBe("env-1");
    });

    it("should bulk upsert valid envelopes", async () => {
      const envelopes = [
        {
          id: "env-1",
          name: "Envelope 1",
          category: "Housing",
          archived: false,
          lastModified: Date.now(),
          currentBalance: 100,
          color: "#3B82F6",
          autoAllocate: true,
          type: "standard",
        },
        {
          id: "env-2",
          name: "Envelope 2",
          category: "Food",
          archived: false,
          lastModified: Date.now(),
          currentBalance: 200,
          color: "#EF4444",
          autoAllocate: true,
          type: "standard",
        },
      ];

      await expect(budgetDb.bulkUpsertEnvelopesValidated(envelopes)).resolves.not.toThrow();
    });

    it("should reject bulk upsert with invalid envelope", async () => {
      const envelopes = [
        {
          id: "env-1",
          name: "Valid Envelope",
          category: "Housing",
          archived: false,
          lastModified: Date.now(),
          currentBalance: 100,
          color: "#3B82F6",
          autoAllocate: true,
          type: "standard",
        },
        {
          id: "env-2",
          // Missing required fields
          name: "Invalid Envelope",
        },
      ];

      await expect(budgetDb.bulkUpsertEnvelopesValidated(envelopes)).rejects.toThrow();
    });
  });

  describe("Transaction Validation", () => {
    it("should reject transaction with missing required fields", async () => {
      const invalidTransaction = {
        amount: -50,
        // Missing id, date, envelopeId, category, type, lastModified
      };

      await expect(budgetDb.addTransaction(invalidTransaction)).rejects.toThrow();
    });

    it("should reject expense with positive amount", async () => {
      const invalidTransaction = {
        id: "txn-1",
        date: new Date(),
        amount: 50, // Should be negative for expense
        envelopeId: "env-1",
        category: "Food",
        type: "expense",
        lastModified: Date.now(),
      };

      await expect(budgetDb.addTransaction(invalidTransaction)).rejects.toThrow();
    });

    it("should reject income with negative amount", async () => {
      const invalidTransaction = {
        id: "txn-1",
        date: new Date(),
        amount: -1000, // Should be positive for income
        envelopeId: "env-1",
        category: "Salary",
        type: "income",
        lastModified: Date.now(),
      };

      await expect(budgetDb.addTransaction(invalidTransaction)).rejects.toThrow();
    });

    it("should accept valid expense transaction", async () => {
      const validTransaction = {
        id: "txn-1",
        date: new Date(),
        amount: -50,
        envelopeId: "env-1",
        category: "Food",
        type: "expense",
        lastModified: Date.now(),
        description: "Groceries",
      };

      const result = await budgetDb.addTransaction(validTransaction);
      expect(result).toBe("txn-1");
    });

    it("should accept valid income transaction", async () => {
      const validTransaction = {
        id: "txn-2",
        date: new Date(),
        amount: 1000,
        envelopeId: "env-1",
        category: "Salary",
        type: "income",
        lastModified: Date.now(),
        description: "Paycheck",
      };

      const result = await budgetDb.addTransaction(validTransaction);
      expect(result).toBe("txn-2");
    });

    it("should update transaction with partial data", async () => {
      const transaction = {
        id: "txn-1",
        date: new Date(),
        amount: -50,
        envelopeId: "env-1",
        category: "Food",
        type: "expense",
        lastModified: Date.now(),
      };

      await budgetDb.addTransaction(transaction);

      const updates = {
        description: "Updated description",
      };

      const result = await budgetDb.updateTransaction("txn-1", updates);
      expect(result).toBe(1);
    });

    it("should put (upsert) valid transaction", async () => {
      const transaction = {
        id: "txn-1",
        date: new Date(),
        amount: -50,
        envelopeId: "env-1",
        category: "Food",
        type: "expense",
        lastModified: Date.now(),
      };

      const result = await budgetDb.putTransaction(transaction);
      expect(result).toBe("txn-1");
    });

    it("should bulk upsert valid transactions", async () => {
      const transactions = [
        {
          id: "txn-1",
          date: new Date(),
          amount: -50,
          envelopeId: "env-1",
          category: "Food",
          type: "expense",
          lastModified: Date.now(),
        },
        {
          id: "txn-2",
          date: new Date(),
          amount: 1000,
          envelopeId: "env-1",
          category: "Salary",
          type: "income",
          lastModified: Date.now(),
        },
      ];

      await expect(budgetDb.bulkUpsertTransactionsValidated(transactions)).resolves.not.toThrow();
    });

    it("should reject bulk upsert with invalid transaction", async () => {
      const transactions = [
        {
          id: "txn-1",
          date: new Date(),
          amount: -50,
          envelopeId: "env-1",
          category: "Food",
          type: "expense",
          lastModified: Date.now(),
        },
        {
          id: "txn-2",
          // Missing required fields
          amount: 100,
        },
      ];

      await expect(budgetDb.bulkUpsertTransactionsValidated(transactions)).rejects.toThrow();
    });
  });

  describe("Auto-Funding Rule Validation", () => {
    it("should reject rule with missing required fields", async () => {
      const invalidRule = {
        name: "Test Rule",
        // Missing other required fields
      };

      await expect(budgetDb.addAutoFundingRule(invalidRule)).rejects.toThrow();
    });

    it("should accept valid auto-funding rule", async () => {
      const validRule = {
        id: "rule-1",
        name: "Monthly Savings",
        description: "Auto-fund savings monthly",
        type: "scheduled",
        trigger: "monthly",
        priority: 1,
        enabled: true,
        createdAt: new Date().toISOString(),
        lastExecuted: null,
        executionCount: 0,
        config: {
          sourceType: "unassigned",
          sourceId: null,
          targetType: "envelope",
          targetId: "env-savings",
          targetIds: [],
          amount: 500,
          percentage: 0,
          conditions: [],
          scheduleConfig: {},
        },
        lastModified: Date.now(),
      };

      const result = await budgetDb.addAutoFundingRule(validRule);
      expect(result).toBe("rule-1");
    });

    it("should update rule with partial data", async () => {
      const rule = {
        id: "rule-1",
        name: "Test Rule",
        description: "Test description",
        type: "scheduled",
        trigger: "monthly",
        priority: 1,
        enabled: true,
        createdAt: new Date().toISOString(),
        lastExecuted: null,
        executionCount: 0,
        config: {
          sourceType: "unassigned",
          sourceId: null,
          targetType: "envelope",
          targetId: "env-1",
          targetIds: [],
          amount: 100,
          percentage: 0,
          conditions: [],
          scheduleConfig: {},
        },
        lastModified: Date.now(),
      };

      await budgetDb.addAutoFundingRule(rule);

      const updates = {
        enabled: false,
      };

      const result = await budgetDb.updateAutoFundingRule("rule-1", updates);
      expect(result).toBe(1);
    });
  });

  describe("Execution Record Validation", () => {
    it("should accept valid execution record", async () => {
      const validRecord = {
        id: "exec-1",
        trigger: "manual",
        totalFunded: 500,
        success: true,
        executedAt: new Date().toISOString(),
        rulesExecuted: 2,
        lastModified: Date.now(),
      };

      const result = await budgetDb.addExecutionRecord(validRecord);
      expect(result).toBe("exec-1");
    });

    it("should reject record with missing required fields", async () => {
      const invalidRecord = {
        trigger: "manual",
        // Missing id and lastModified
      };

      await expect(budgetDb.addExecutionRecord(invalidRecord)).rejects.toThrow();
    });
  });

  describe("Error Messages", () => {
    it("should provide descriptive error messages for validation failures", async () => {
      const invalidEnvelope = {
        id: "", // Invalid: empty string
        name: "", // Invalid: empty string
        category: "",
        archived: false,
        lastModified: Date.now(),
        currentBalance: -100, // Invalid: negative balance
        type: "standard",
      };

      try {
        await budgetDb.addEnvelope(invalidEnvelope);
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as any).message).toContain("Invalid Envelope");
      }
    });
  });
});
