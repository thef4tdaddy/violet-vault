import { clearAllDexieData, importDataToDexie } from "../dexieUtils";
import { budgetDb } from "../../../db/budgetDb";
import { vi } from "vitest";

vi.mock("../../../db/budgetDb", () => ({
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
        envelopes: [{ id: 1 }],
        bills: [{ id: 1 }],
        allTransactions: [{ id: 1 }],
        savingsGoals: [{ id: 1 }],
        debts: [{ id: 1 }],
        paycheckHistory: [{ id: 1 }],
        auditLog: [{ id: 1 }],
      };
      await importDataToDexie(data);
      expect(budgetDb.envelopes.bulkAdd).toHaveBeenCalledWith(data.envelopes);
      expect(budgetDb.bills.bulkAdd).toHaveBeenCalledWith(data.bills);
      expect(budgetDb.transactions.bulkAdd).toHaveBeenCalledWith(data.allTransactions);
      expect(budgetDb.savingsGoals.bulkAdd).toHaveBeenCalledWith(data.savingsGoals);
      expect(budgetDb.debts.bulkAdd).toHaveBeenCalledWith(data.debts);
      expect(budgetDb.paycheckHistory.bulkAdd).toHaveBeenCalledWith(data.paycheckHistory);
      expect(budgetDb.auditLog.bulkAdd).toHaveBeenCalledWith(data.auditLog);
      expect(budgetDb.budget.put).toHaveBeenCalled();
    });
  });
});
