import { backupCurrentData, validateBackupStructure } from "../backupUtils";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock logger
vi.mock("../../common/logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../../db/budgetDb", () => ({
  budgetDb: {
    envelopes: {
      toArray: vi.fn(() =>
        Promise.resolve([
          {
            id: "1",
            name: "Groceries",
            category: "Food",
            archived: false,
            lastModified: Date.now(),
          },
          {
            id: "2",
            name: "Vacation Fund",
            category: "Savings",
            archived: false,
            lastModified: Date.now(),
            envelopeType: "savings",
            targetAmount: 5000,
            currentBalance: 1000,
          },
          {
            id: "3",
            name: "FSA",
            category: "Health",
            archived: false,
            lastModified: Date.now(),
            envelopeType: "supplemental",
            accountType: "FSA",
          },
        ])
      ),
    },
    bills: { toArray: vi.fn(() => Promise.resolve([])) },
    transactions: { toArray: vi.fn(() => Promise.resolve([])) },
    debts: { toArray: vi.fn(() => Promise.resolve([])) },
    paycheckHistory: { toArray: vi.fn(() => Promise.resolve([])) },
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
    // Clear localStorage before each test
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

    it("should include all envelope types in backup (v2.0 model)", async () => {
      const setItemSpy = vi.spyOn(localStorage, "setItem");

      await backupCurrentData();

      // Get the last call to setItem
      const lastCall = setItemSpy.mock.calls[setItemSpy.mock.calls.length - 1];
      const backupData = JSON.parse(lastCall[1] as string);

      // Verify all envelope types are included
      expect(backupData.envelopes).toHaveLength(3);
      expect(backupData.envelopes[1].envelopeType).toBe("savings");
      expect(backupData.envelopes[2].envelopeType).toBe("supplemental");

      // Verify no savingsGoals array exists (v2.0 model)
      expect(backupData.savingsGoals).toBeUndefined();
    });
  });

  describe("validateBackupStructure", () => {
    const validEnvelope = {
      id: "env-1",
      name: "Groceries",
      category: "Food",
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
    };

    const validBill = {
      id: "bill-1",
      name: "Electric",
      dueDate: new Date().toISOString(),
      amount: 100,
      category: "Utilities",
      isPaid: false,
      isRecurring: true,
      lastModified: Date.now(),
    };

    const validDebt = {
      id: "debt-1",
      name: "Credit Card",
      creditor: "Bank",
      type: "credit_card",
      status: "active",
      currentBalance: 1000,
      minimumPayment: 50,
      lastModified: Date.now(),
    };

    const validPaycheckHistory = {
      id: "paycheck-1",
      processedAt: new Date().toISOString(),
      amount: 2000,
      payerName: "Employer",
      lastModified: Date.now(),
    };

    it("should validate empty backup data as valid", () => {
      const result = validateBackupStructure({});

      expect(result.isValid).toBe(true);
      expect(result.validCounts.envelopes).toBe(0);
      expect(result.invalidCounts.envelopes).toBe(0);
      expect(result.warnings).toHaveLength(0);
    });

    it("should validate valid backup data", () => {
      const result = validateBackupStructure({
        envelopes: [validEnvelope],
        transactions: [validTransaction],
        bills: [validBill],
        debts: [validDebt],
        paycheckHistory: [validPaycheckHistory],
      });

      expect(result.isValid).toBe(true);
      expect(result.validCounts.envelopes).toBe(1);
      expect(result.validCounts.transactions).toBe(1);
      expect(result.validCounts.bills).toBe(1);
      expect(result.validCounts.debts).toBe(1);
      expect(result.validCounts.paycheckHistory).toBe(1);
      expect(result.warnings).toHaveLength(0);
    });

    it("should detect invalid envelopes", () => {
      const invalidEnvelope = { id: "", name: "", category: "" }; // Missing required fields

      const result = validateBackupStructure({
        envelopes: [validEnvelope, invalidEnvelope],
      });

      expect(result.isValid).toBe(false);
      expect(result.validCounts.envelopes).toBe(1);
      expect(result.invalidCounts.envelopes).toBe(1);
      expect(result.warnings.some((w) => w.startsWith("Invalid envelope:"))).toBe(true);
    });

    it("should detect invalid transactions", () => {
      const invalidTransaction = { id: "", amount: "not-a-number" }; // Invalid type

      const result = validateBackupStructure({
        transactions: [validTransaction, invalidTransaction],
      });

      expect(result.isValid).toBe(false);
      expect(result.validCounts.transactions).toBe(1);
      expect(result.invalidCounts.transactions).toBe(1);
      expect(result.warnings.some((w) => w.startsWith("Invalid transaction:"))).toBe(true);
    });

    it("should detect invalid bills", () => {
      const invalidBill = { id: "", name: "" }; // Missing required fields

      const result = validateBackupStructure({
        bills: [validBill, invalidBill],
      });

      expect(result.isValid).toBe(false);
      expect(result.validCounts.bills).toBe(1);
      expect(result.invalidCounts.bills).toBe(1);
      expect(result.warnings.some((w) => w.startsWith("Invalid bill:"))).toBe(true);
    });

    it("should detect invalid debts", () => {
      const invalidDebt = { id: "", name: "" }; // Missing required fields

      const result = validateBackupStructure({
        debts: [validDebt, invalidDebt],
      });

      expect(result.isValid).toBe(false);
      expect(result.validCounts.debts).toBe(1);
      expect(result.invalidCounts.debts).toBe(1);
      expect(result.warnings.some((w) => w.startsWith("Invalid debt:"))).toBe(true);
    });

    it("should detect invalid paycheck history", () => {
      const invalidPaycheck = { id: "", amount: -100 }; // Invalid amount

      const result = validateBackupStructure({
        paycheckHistory: [validPaycheckHistory, invalidPaycheck],
      });

      expect(result.isValid).toBe(false);
      expect(result.validCounts.paycheckHistory).toBe(1);
      expect(result.invalidCounts.paycheckHistory).toBe(1);
      expect(result.warnings.some((w) => w.startsWith("Invalid paycheck history:"))).toBe(true);
    });

    it("should validate multiple data types with mixed validity", () => {
      const result = validateBackupStructure({
        envelopes: [validEnvelope, { id: "" }],
        transactions: [validTransaction, { id: "" }],
        bills: [validBill],
        debts: [validDebt],
        paycheckHistory: [validPaycheckHistory],
      });

      expect(result.isValid).toBe(false);
      expect(result.validCounts.envelopes).toBe(1);
      expect(result.invalidCounts.envelopes).toBe(1);
      expect(result.validCounts.transactions).toBe(1);
      expect(result.invalidCounts.transactions).toBe(1);
      expect(result.validCounts.bills).toBe(1);
      expect(result.invalidCounts.bills).toBe(0);
      expect(result.warnings).toHaveLength(2);
    });
  });
});
