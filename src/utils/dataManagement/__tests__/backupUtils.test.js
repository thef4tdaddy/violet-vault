import { backupCurrentData } from "../backupUtils";
import { budgetDb, getBudgetMetadata } from "../../../db/budgetDb";
import { vi } from "vitest";

vi.mock("../../../db/budgetDb", () => ({
  budgetDb: {
    envelopes: { toArray: vi.fn() },
    bills: { toArray: vi.fn() },
    transactions: { toArray: vi.fn() },
    savingsGoals: { toArray: vi.fn() },
    debts: { toArray: vi.fn() },
    paycheckHistory: { toArray: vi.fn() },
    auditLog: { toArray: vi.fn() },
  },
  getBudgetMetadata: vi.fn(),
}));

describe("backupUtils", () => {
  describe("backupCurrentData", () => {
    it("should backup current data to localStorage", async () => {
      const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

      budgetDb.envelopes.toArray.mockResolvedValue([
        { id: 1, name: "Groceries" },
      ]);
      getBudgetMetadata.mockResolvedValue({ unassignedCash: 100 });

      await backupCurrentData();

      expect(setItemSpy).toHaveBeenCalledWith(
        expect.stringContaining("dexie_backup_"),
        expect.any(String),
      );
    });
  });
});
