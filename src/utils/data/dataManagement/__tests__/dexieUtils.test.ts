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
    transactions: {
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
      expect(budgetDb.transactions.clear).toHaveBeenCalled();
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
            type: "standard",
            archived: false,
            lastModified: Date.now(),
          },
        ],
        transactions: [{ id: "tx-1", date: "2024-01-01", amount: 10, type: "income" }],
        auditLog: [{ id: "audit-1" }],
      };
      await importDataToDexie(data);
      expect(budgetDb.envelopes.bulkAdd).toHaveBeenCalled();
      expect(budgetDb.transactions.bulkAdd).toHaveBeenCalled();
      expect(budgetDb.auditLog.bulkAdd).toHaveBeenCalled();
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

      expect(budgetDb.envelopes.bulkAdd).toHaveBeenCalled();
      const envelopesArg = vi.mocked(budgetDb.envelopes.bulkAdd).mock.calls[0][0] as any[];
      expect(envelopesArg).toHaveLength(1);
      expect(envelopesArg[0].id).toBe("goal-1");
      expect(envelopesArg[0].type).toBe("goal");
      expect(envelopesArg[0].currentBalance).toBe(5000);
      expect(envelopesArg[0].targetAmount).toBe(10000);
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

      expect(budgetDb.envelopes.bulkAdd).toHaveBeenCalled();
      const envelopesArg = vi.mocked(budgetDb.envelopes.bulkAdd).mock.calls[0][0] as any[];
      expect(envelopesArg).toHaveLength(1);
      expect(envelopesArg[0].id).toBe("supp-1");
      expect(envelopesArg[0].type).toBe("supplemental");
      expect(envelopesArg[0].currentBalance).toBe(2000);
    });
  });
});
