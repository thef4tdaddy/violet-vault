import { backupCurrentData } from "../backupUtils";
import { vi, describe, it, expect } from "vitest";

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
  describe("backupCurrentData", () => {
    it("should backup current data to localStorage", async () => {
      const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

      await backupCurrentData();

      expect(setItemSpy).toHaveBeenCalledWith(
        expect.stringContaining("dexie_backup_"),
        expect.any(String)
      );
    });

    it("should include all envelope types in backup (v2.0 model)", async () => {
      const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

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
});
