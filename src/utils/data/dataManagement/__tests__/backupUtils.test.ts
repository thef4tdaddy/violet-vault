import { backupCurrentData, validateBackupStructure } from "../backupUtils";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock logger
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    envelopes: {
      toArray: vi.fn(() =>
        Promise.resolve([
          {
            id: "1",
            name: "Groceries",
            category: "Food",
            type: "standard",
            archived: false,
            lastModified: Date.now(),
          },
          {
            id: "2",
            name: "Vacation Fund",
            category: "Savings",
            type: "goal",
            archived: false,
            lastModified: Date.now(),
            targetAmount: 5000,
            currentBalance: 1000,
          },
          {
            id: "3",
            name: "FSA",
            category: "Health",
            type: "supplemental",
            archived: false,
            lastModified: Date.now(),
            accountType: "FSA",
          },
        ])
      ),
    },
    transactions: { toArray: vi.fn(() => Promise.resolve([])) },
    auditLog: { toArray: vi.fn(() => Promise.resolve([])) },
  },
  getBudgetMetadata: vi.fn(() =>
    Promise.resolve({
      unassignedCash: 100,
      biweeklyAllocation: 500,
      actualBalance: 1500,
      isActualBalanceManual: false,
    })
  ),
}));

describe("backupUtils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("backupCurrentData", () => {
    it("should backup current data to localStorage", async () => {
      const setItemSpy = vi.spyOn(localStorage, "setItem");
      await backupCurrentData();
      expect(setItemSpy).toHaveBeenCalledWith(
        expect.stringContaining("dexie_backup_"),
        expect.any(String)
      );
    });

    it("should include all envelope types in backup", async () => {
      const setItemSpy = vi.spyOn(localStorage, "setItem");
      await backupCurrentData();
      const lastCall = setItemSpy.mock.calls[setItemSpy.mock.calls.length - 1];
      const backupData = JSON.parse(lastCall[1] as string);

      expect(backupData.envelopes).toHaveLength(3);
      expect(backupData.envelopes[1].type).toBe("goal");
      expect(backupData.envelopes[2].type).toBe("supplemental");
    });
  });

  describe("validateBackupStructure", () => {
    const validEnvelope = {
      id: "env-1",
      name: "Groceries",
      category: "Food",
      type: "standard",
      archived: false,
      lastModified: Date.now(),
    };

    const validTransaction = {
      id: "txn-1",
      date: new Date().toISOString(),
      amount: -50,
      envelopeId: "env-1",
      category: "Food",
      type: "expense",
      lastModified: Date.now(),
      description: "Test",
    };

    it("should validate empty backup data as valid", () => {
      const result = validateBackupStructure({});
      expect(result.isValid).toBe(true);
      expect(result.validCounts.envelopes).toBe(0);
      expect(result.invalidCounts.envelopes).toBe(0);
    });

    it("should validate valid backup data", () => {
      const result = validateBackupStructure({
        envelopes: [validEnvelope],
        transactions: [validTransaction],
      });
      expect(result.isValid).toBe(true);
      expect(result.validCounts.envelopes).toBe(1);
      expect(result.validCounts.transactions).toBe(1);
    });

    it("should detect invalid envelopes", () => {
      const invalidEnvelope = { id: "bad", name: "", type: "standard" }; // Name required
      const result = validateBackupStructure({
        envelopes: [validEnvelope, invalidEnvelope],
      });
      expect(result.isValid).toBe(false);
      expect(result.validCounts.envelopes).toBe(1);
      expect(result.invalidCounts.envelopes).toBe(1);
    });

    it("should detect invalid transactions", () => {
      const invalidTransaction = { id: "bad", amount: "not-a-number" };
      const result = validateBackupStructure({
        transactions: [validTransaction, invalidTransaction],
      });
      expect(result.isValid).toBe(false);
      expect(result.validCounts.transactions).toBe(1);
      expect(result.invalidCounts.transactions).toBe(1);
    });
  });
});
