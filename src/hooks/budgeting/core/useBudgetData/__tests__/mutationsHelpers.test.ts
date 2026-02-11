import { describe, it, expect, vi, beforeEach } from "vitest";
import { budgetDb, getBudgetMetadata, setBudgetMetadata } from "@/db/budgetDb";
import logger from "@/utils/core/common/logger";
import {
  reversePaycheckBalances,
  reverseEnvelopeAllocations,
  deleteAssociatedPaycheck,
  processTransactionDeletion,
} from "../mutationsHelpers";

// Mock dependencies
vi.mock("@/db/budgetDb", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
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
  };
});

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("mutationsHelpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("reversePaycheckBalances", () => {
    it("should calculate and update new metadata correctly", async () => {
      const paycheck = { amount: 1000, unassignedCashAfter: 500, unassignedCashBefore: 200 } as any;
      const metadata = { actualBalance: 5000, unassignedCash: 2000 } as any;

      await reversePaycheckBalances(paycheck, metadata);

      expect(setBudgetMetadata).toHaveBeenCalledWith({
        actualBalance: 4000, // 5000 - 1000
        unassignedCash: 1700, // 2000 - (500 - 200)
      });
    });
  });

  describe("reverseEnvelopeAllocations", () => {
    it("should handle empty allocations", async () => {
      await reverseEnvelopeAllocations([]);
      expect(budgetDb.envelopes.get).not.toHaveBeenCalled();
    });

    it("should update envelope balances", async () => {
      const allocations = [{ envelopeId: "env1", amount: 100 }];
      (budgetDb.envelopes.get as any).mockResolvedValue({ id: "env1", currentBalance: 500 });

      await reverseEnvelopeAllocations(allocations);

      expect(budgetDb.envelopes.update).toHaveBeenCalledWith("env1", {
        currentBalance: 400,
      });
    });

    it("should not allow negative balances", async () => {
      const allocations = [{ envelopeId: "env1", amount: 600 }];
      (budgetDb.envelopes.get as any).mockResolvedValue({ id: "env1", currentBalance: 500 });

      await reverseEnvelopeAllocations(allocations);

      expect(budgetDb.envelopes.update).toHaveBeenCalledWith("env1", {
        currentBalance: 0,
      });
    });
  });

  describe("deleteAssociatedPaycheck", () => {
    it("should return false if paycheck not found", async () => {
      (budgetDb.transactions.get as any).mockResolvedValue(null);
      const result = await deleteAssociatedPaycheck("p1", "t1");
      expect(result.deletedPaycheck).toBe(false);
    });

    it("should return false if record is not a paycheck", async () => {
      (budgetDb.transactions.get as any).mockResolvedValue({ id: "p1" }); // No allocations
      const result = await deleteAssociatedPaycheck("p1", "t1");
      expect(result.deletedPaycheck).toBe(false);
      expect(logger.warn).toHaveBeenCalled();
    });

    it("should delete paycheck and reverse effects", async () => {
      const paycheck = {
        id: "p1",
        amount: 1000,
        envelopeAllocations: [{ envelopeId: "e1", amount: 100 }],
      };
      (budgetDb.transactions.get as any).mockResolvedValue(paycheck);
      (getBudgetMetadata as any).mockResolvedValue({ actualBalance: 5000 });

      const result = await deleteAssociatedPaycheck("p1", "t1");

      expect(result.deletedPaycheck).toBe("p1");
      expect(budgetDb.transactions.delete).toHaveBeenCalledWith("p1");
    });
  });

  describe("processTransactionDeletion", () => {
    it("should throw error if transaction not found", async () => {
      (budgetDb.transactions.get as any).mockResolvedValue(null);
      await expect(processTransactionDeletion("t1")).rejects.toThrow("Transaction not found");
    });

    it("should delete simple transaction", async () => {
      (budgetDb.transactions.get as any).mockResolvedValue({ id: "t1" });
      const result = await processTransactionDeletion("t1");
      expect(result.success).toBe(true);
      expect(budgetDb.transactions.delete).toHaveBeenCalledWith("t1");
    });

    it("should handle linked paycheck", async () => {
      (budgetDb.transactions.get as any).mockImplementation((id: string) => {
        if (id === "t1") return Promise.resolve({ id: "t1", paycheckId: "p1" });
        if (id === "p1") return Promise.resolve({ id: "p1", amount: 0, envelopeAllocations: [{}] });
        return Promise.resolve(null);
      });

      const result = await processTransactionDeletion("t1");
      expect(result.deletedPaycheck).toBe("p1");
      expect(budgetDb.transactions.delete).toHaveBeenCalledWith("t1");
    });
  });
});
