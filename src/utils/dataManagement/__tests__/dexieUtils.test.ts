import { clearAllDexieData, importDataToDexie } from "../dexieUtils";
import { budgetDb } from "@/db/budgetDb";
import { vi, describe, it, expect, afterEach } from "vitest";

vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    transaction: vi.fn((_mode, _tables, callback) => callback()),
    envelopes: {
      clear: vi.fn(),
      bulkAdd: vi.fn(),
      toCollection: vi.fn(() => ({ delete: vi.fn() })),
    },
    bills: {
      clear: vi.fn(),
      bulkAdd: vi.fn(),
      toCollection: vi.fn(() => ({ delete: vi.fn() })),
    },
    transactions: {
      clear: vi.fn(),
      bulkAdd: vi.fn(),
      toCollection: vi.fn(() => ({ delete: vi.fn() })),
    },
    savingsGoals: {
      clear: vi.fn(),
      bulkAdd: vi.fn(),
      toCollection: vi.fn(() => ({ delete: vi.fn() })),
    },
    debts: {
      clear: vi.fn(),
      bulkAdd: vi.fn(),
      toCollection: vi.fn(() => ({ delete: vi.fn() })),
    },
    paycheckHistory: {
      clear: vi.fn(),
      bulkAdd: vi.fn(),
      toCollection: vi.fn(() => ({ delete: vi.fn() })),
    },
    auditLog: {
      clear: vi.fn(),
      bulkAdd: vi.fn(),
      toCollection: vi.fn(() => ({ delete: vi.fn() })),
    },
    budget: {
      clear: vi.fn(),
      put: vi.fn(),
      toCollection: vi.fn(() => ({ delete: vi.fn() })),
    },
  },
}));

describe("dexieUtils", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("clearAllDexieData", () => {
    it("should clear all tables", async () => {
      await clearAllDexieData();
      expect(budgetDb.envelopes.clear).toHaveBeenCalled();
      expect(budgetDb.bills.clear).toHaveBeenCalled();
      expect(budgetDb.transactions.clear).toHaveBeenCalled();
      expect(budgetDb.savingsGoals.clear).toHaveBeenCalled();
      expect(budgetDb.debts.clear).toHaveBeenCalled();
      expect(budgetDb.paycheckHistory.clear).toHaveBeenCalled();
      expect(budgetDb.auditLog.clear).toHaveBeenCalled();
      expect(budgetDb.budget.clear).toHaveBeenCalled();
    });
  });

  describe("importDataToDexie", () => {
    it("should import data to all tables", async () => {
      const data = {
        envelopes: [
          {
            id: "env-1",
            name: "Groceries",
            category: "Food",
            archived: false,
            lastModified: Date.now(),
          },
        ],
        bills: [{ id: "bill-1" }],
        allTransactions: [{ id: "tx-1" }],
        debts: [{ id: "debt-1" }],
        paycheckHistory: [{ id: "paycheck-1" }],
        auditLog: [{ id: "audit-1" }],
      };
      await importDataToDexie(data);
      // Envelopes should be added
      expect(budgetDb.envelopes.bulkAdd).toHaveBeenCalled();
      expect(budgetDb.bills.bulkAdd).toHaveBeenCalledWith(data.bills);
      expect(budgetDb.transactions.bulkAdd).toHaveBeenCalledWith(data.allTransactions);
      // savingsGoals table is no longer used - goals are now imported as envelopes
      expect(budgetDb.savingsGoals.bulkAdd).not.toHaveBeenCalled();
      expect(budgetDb.debts.bulkAdd).toHaveBeenCalledWith(data.debts);
      expect(budgetDb.paycheckHistory.bulkAdd).toHaveBeenCalledWith(data.paycheckHistory);
      expect(budgetDb.auditLog.bulkAdd).toHaveBeenCalledWith(data.auditLog);
      expect(budgetDb.budget.put).toHaveBeenCalled();
    });

    it("should convert legacy savingsGoals to envelopes", async () => {
      const data = {
        envelopes: [],
        savingsGoals: [
          {
            id: "goal-1",
            name: "Emergency Fund",
            category: "Savings",
            priority: "high",
            targetAmount: 10000,
            currentAmount: 5000,
            isPaused: false,
            isCompleted: false,
            lastModified: Date.now(),
          },
        ],
      };
      await importDataToDexie(data);

      // Savings goals should be converted to envelopes with envelopeType: "savings"
      expect(budgetDb.envelopes.bulkAdd).toHaveBeenCalled();
      const envelopesArg = vi.mocked(budgetDb.envelopes.bulkAdd).mock.calls[0][0] as Array<{
        id: string;
        name: string;
        envelopeType: string;
        currentBalance: number;
        targetAmount: number;
      }>;
      expect(envelopesArg).toHaveLength(1);
      expect(envelopesArg[0].id).toBe("goal-1");
      expect(envelopesArg[0].name).toBe("Emergency Fund");
      expect(envelopesArg[0].envelopeType).toBe("savings");
      expect(envelopesArg[0].currentBalance).toBe(5000);
      expect(envelopesArg[0].targetAmount).toBe(10000);

      // savingsGoals table should NOT be called
      expect(budgetDb.savingsGoals.bulkAdd).not.toHaveBeenCalled();
    });

    it("should convert legacy supplementalAccounts to envelopes", async () => {
      const data = {
        envelopes: [],
        supplementalAccounts: [
          {
            id: "supp-1",
            name: "Health FSA",
            category: "Healthcare",
            currentBalance: 2000,
            annualContribution: 2850,
            isActive: true,
            accountType: "FSA",
            lastModified: Date.now(),
          },
        ],
      };
      await importDataToDexie(data);

      // Supplemental accounts should be converted to envelopes with envelopeType: "supplemental"
      expect(budgetDb.envelopes.bulkAdd).toHaveBeenCalled();
      const envelopesArg = vi.mocked(budgetDb.envelopes.bulkAdd).mock.calls[0][0] as Array<{
        id: string;
        name: string;
        envelopeType: string;
        currentBalance: number;
        annualContribution: number;
        accountType: string;
      }>;
      expect(envelopesArg).toHaveLength(1);
      expect(envelopesArg[0].id).toBe("supp-1");
      expect(envelopesArg[0].name).toBe("Health FSA");
      expect(envelopesArg[0].envelopeType).toBe("supplemental");
      expect(envelopesArg[0].currentBalance).toBe(2000);
      expect(envelopesArg[0].annualContribution).toBe(2850);
      expect(envelopesArg[0].accountType).toBe("FSA");
    });

    it("should not create duplicate envelopes when savings/supplemental already exist", async () => {
      const data = {
        envelopes: [
          {
            id: "goal-1",
            name: "Emergency Fund",
            category: "Savings",
            envelopeType: "savings",
            currentBalance: 5000,
            targetAmount: 10000,
            archived: false,
            lastModified: Date.now(),
          },
        ],
        savingsGoals: [
          {
            id: "goal-1", // Same ID as envelope above
            name: "Emergency Fund",
            category: "Savings",
            priority: "high",
            targetAmount: 10000,
            currentAmount: 5000,
            lastModified: Date.now(),
          },
        ],
      };
      await importDataToDexie(data);

      // Should only have 1 envelope (no duplicates)
      expect(budgetDb.envelopes.bulkAdd).toHaveBeenCalled();
      const envelopesArg = vi.mocked(budgetDb.envelopes.bulkAdd).mock.calls[0][0] as unknown[];
      expect(envelopesArg).toHaveLength(1);
    });

    it("should not store supplementalAccounts in budget metadata", async () => {
      const data = {
        envelopes: [],
        supplementalAccounts: [
          {
            id: "supp-1",
            name: "HSA",
            currentBalance: 1000,
            lastModified: Date.now(),
          },
        ],
        unassignedCash: 100,
        biweeklyAllocation: 500,
        actualBalance: 1000,
      };
      await importDataToDexie(data);

      // Budget metadata should not contain supplementalAccounts
      expect(budgetDb.budget.put).toHaveBeenCalled();
      const budgetArg = vi.mocked(budgetDb.budget.put).mock.calls[0][0] as Record<string, unknown>;
      expect(budgetArg.supplementalAccounts).toBeUndefined();
      expect(budgetArg.unassignedCash).toBe(100);
      expect(budgetArg.biweeklyAllocation).toBe(500);
      expect(budgetArg.actualBalance).toBe(1000);
    });
  });
});
