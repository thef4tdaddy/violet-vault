import { backupCurrentData } from "../backupUtils";
import { vi, describe, it, expect } from "vitest";

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
