import { backupCurrentData } from "../backupUtils";
import { budgetDb, getBudgetMetadata } from "../../../db/budgetDb";
import { vi } from "vitest";

vi.mock("../../../db/budgetDb", () => ({
  budgetDb: {
    envelopes: { 
      toArray: vi.fn(() => Promise.resolve([{ id: 1, name: "Groceries" }]))
    },
    bills: { toArray: vi.fn() },
    transactions: { toArray: vi.fn() },
    savingsGoals: { toArray: vi.fn() },
    debts: { toArray: vi.fn() },
    paycheckHistory: { toArray: vi.fn() },
    auditLog: { toArray: vi.fn() },
  },
  getBudgetMetadata: vi.fn(() => Promise.resolve({ unassignedCash: 100 })),
}));

describe("backupUtils", () => {
  describe("backupCurrentData", () => {
    it("should backup current data to localStorage", async () => {
      const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

      await backupCurrentData();

      expect(setItemSpy).toHaveBeenCalledWith(
        expect.stringContaining("dexie_backup_"),
        expect.any(String)
      );
    });
  });
});
