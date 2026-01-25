import { describe, it, expect, vi, beforeEach } from "vitest";
import { reverseEnvelopeAllocations, deletePaycheck } from "../paycheckDeletion";
import { budgetDb, getBudgetMetadata, setBudgetMetadata } from "@/db/budgetDb";
import logger from "@/utils/core/common/logger";

// Mock budgetDb
vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    envelopes: {
      get: vi.fn(),
      update: vi.fn(),
    },
    transactions: {
      get: vi.fn(),
      delete: vi.fn(),
    },
  },
  getBudgetMetadata: vi.fn(),
  setBudgetMetadata: vi.fn(),
}));

// Mock logger
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("paycheckDeletion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("reverseEnvelopeAllocations", () => {
    it("should do nothing if allocations are empty", async () => {
      await reverseEnvelopeAllocations([]);
      expect(budgetDb.envelopes.get).not.toHaveBeenCalled();
    });

    it("should subtract allocation amount from envelope balance", async () => {
      const allocations = [
        { envelopeId: "env1", amount: 100 },
        { envelopeId: "env2", amount: 200 },
      ];

      vi.mocked(budgetDb.envelopes.get).mockImplementation(async (id) => {
        if (id === "env1") return { id: "env1", currentBalance: 300 };
        if (id === "env2") return { id: "env2", currentBalance: 50 }; // Balance lower than allocation
        return null;
      });

      await reverseEnvelopeAllocations(allocations);

      expect(budgetDb.envelopes.update).toHaveBeenCalledWith("env1", {
        currentBalance: 200,
      });
      // Should not go below 0
      expect(budgetDb.envelopes.update).toHaveBeenCalledWith("env2", {
        currentBalance: 0,
      });
    });

    it("should default to 0 balance if currentBalance is missing", async () => {
      const allocations = [{ envelopeId: "env1", amount: 100 }];
      vi.mocked(budgetDb.envelopes.get).mockResolvedValue({ id: "env1" });

      await reverseEnvelopeAllocations(allocations);

      expect(budgetDb.envelopes.update).toHaveBeenCalledWith("env1", {
        currentBalance: 0,
      });
    });
  });

  describe("deletePaycheck", () => {
    it("should throw error if paycheck record is not found", async () => {
      vi.mocked(budgetDb.transactions.get).mockResolvedValue(null);

      await expect(deletePaycheck("p1")).rejects.toThrow("Paycheck record not found");
    });

    it("should reverse balances and envelope allocations", async () => {
      const paycheckRecord = {
        id: "p1",
        amount: 1000,
        unassignedCashBefore: 500,
        unassignedCashAfter: 1200, // unassignedCashChange = 700
        allocations: {
          env1: 300,
        },
      };

      vi.mocked(budgetDb.transactions.get).mockResolvedValue(paycheckRecord);
      vi.mocked(getBudgetMetadata).mockResolvedValue({
        actualBalance: 5000,
        unassignedCash: 2000,
      });
      vi.mocked(budgetDb.envelopes.get).mockResolvedValue({ id: "env1", currentBalance: 1000 });

      const result = await deletePaycheck("p1");

      expect(result).toEqual({ success: true, paycheckId: "p1" });

      // newActualBalance = 5000 - 1000 = 4000
      // newUnassignedCash = 2000 - 700 = 1300
      expect(setBudgetMetadata).toHaveBeenCalledWith({
        actualBalance: 4000,
        unassignedCash: 1300,
      });

      expect(budgetDb.envelopes.update).toHaveBeenCalledWith("env1", {
        currentBalance: 700,
      });
      expect(budgetDb.transactions.delete).toHaveBeenCalledWith("p1");
    });

    it("should handle legacy envelopeAllocations format", async () => {
      const paycheckRecord = {
        id: "p1",
        amount: 1000,
        unassignedCashBefore: 500,
        unassignedCashAfter: 500, // unassignedCashChange = 0
        envelopeAllocations: [{ envelopeId: "env1", amount: 300 }],
      };

      vi.mocked(budgetDb.transactions.get).mockResolvedValue(paycheckRecord);
      vi.mocked(getBudgetMetadata).mockResolvedValue({
        actualBalance: 5000,
        unassignedCash: 2000,
      });
      vi.mocked(budgetDb.envelopes.get).mockResolvedValue({ id: "env1", currentBalance: 1000 });

      await deletePaycheck("p1");

      expect(budgetDb.envelopes.update).toHaveBeenCalledWith("env1", {
        currentBalance: 700,
      });
    });

    it("should handle missing amounts and metadata values (defaults to 0)", async () => {
      const paycheckRecord = {
        id: "p1",
      };

      vi.mocked(budgetDb.transactions.get).mockResolvedValue(paycheckRecord);
      vi.mocked(getBudgetMetadata).mockResolvedValue(null);

      await deletePaycheck("p1");

      // newActualBalance = 0 - 0 = 0
      // newUnassignedCash = 0 - (0 - 0) = 0
      expect(setBudgetMetadata).toHaveBeenCalledWith({
        actualBalance: 0,
        unassignedCash: 0,
      });
    });
  });
});
