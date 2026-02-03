import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  validatePaycheckDeletion,
  reverseEnvelopeAllocations,
  calculateReversedBalances,
  deletePaycheckRecord,
  invalidatePaycheckCaches,
  type Paycheck,
  type BudgetDbTransactions,
} from "../paycheckDeletionUtils";
import logger from "@/utils/core/common/logger";

// Mock logger to avoid noise
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("paycheckDeletionUtils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validatePaycheckDeletion", () => {
    it("should throw error when paycheckId is missing", () => {
      const paycheckHistory: Paycheck[] = [];
      expect(() => validatePaycheckDeletion("", paycheckHistory)).toThrow(
        "Paycheck ID is required for deletion"
      );
      expect(() => validatePaycheckDeletion(null as unknown as string, paycheckHistory)).toThrow(
        "Paycheck ID is required for deletion"
      );
      expect(() =>
        validatePaycheckDeletion(undefined as unknown as string, paycheckHistory)
      ).toThrow("Paycheck ID is required for deletion");
    });

    it("should throw error when paycheck is not found in history", () => {
      const paycheckHistory: Paycheck[] = [
        {
          id: "paycheck1",
          amount: 1000,
          mode: "allocate",
          date: "2026-01-01",
          userId: "user1",
          budgetId: "budget1",
          unassignedCashBefore: 0,
          unassignedCashAfter: 0,
          timestamp: Date.now(),
        },
      ];

      expect(() => validatePaycheckDeletion("nonexistent", paycheckHistory)).toThrow(
        "Paycheck with ID nonexistent not found in paycheckHistory"
      );
    });

    it("should return paycheck when found by string id", () => {
      const paycheck: Paycheck = {
        id: "paycheck1",
        amount: 1500,
        mode: "allocate",
        date: "2026-01-01",
        userId: "user1",
        budgetId: "budget1",
        unassignedCashBefore: 0,
        unassignedCashAfter: 500,
        timestamp: Date.now(),
        envelopeAllocations: [{ envelopeId: "env1", amount: 1000 }],
      };

      const paycheckHistory: Paycheck[] = [paycheck];
      const result = validatePaycheckDeletion("paycheck1", paycheckHistory);

      expect(result).toEqual(paycheck);
      expect(logger.info).toHaveBeenCalledWith(
        "Found paycheck to delete",
        expect.objectContaining({
          paycheckId: "paycheck1",
          amount: 1500,
          mode: "allocate",
          allocations: 1,
        })
      );
    });

    it("should return paycheck when found by number id", () => {
      const paycheck: Paycheck = {
        id: 123,
        amount: 2000,
        mode: "leftover",
        date: "2026-01-15",
        userId: "user1",
        budgetId: "budget1",
        unassignedCashBefore: 0,
        unassignedCashAfter: 2000,
        timestamp: Date.now(),
      };

      const paycheckHistory: Paycheck[] = [paycheck];
      const result = validatePaycheckDeletion(123, paycheckHistory);

      expect(result).toEqual(paycheck);
      expect(logger.info).toHaveBeenCalledWith(
        "Found paycheck to delete",
        expect.objectContaining({
          paycheckId: 123,
          amount: 2000,
          mode: "leftover",
          allocations: 0,
        })
      );
    });

    it("should handle paycheck without envelopeAllocations", () => {
      const paycheck: Paycheck = {
        id: "paycheck1",
        amount: 1000,
        mode: "leftover",
        date: "2026-01-01",
        userId: "user1",
        budgetId: "budget1",
        unassignedCashBefore: 0,
        unassignedCashAfter: 1000,
        timestamp: Date.now(),
      };

      const paycheckHistory: Paycheck[] = [paycheck];
      const result = validatePaycheckDeletion("paycheck1", paycheckHistory);

      expect(result).toEqual(paycheck);
      expect(logger.info).toHaveBeenCalledWith(
        "Found paycheck to delete",
        expect.objectContaining({
          allocations: 0,
        })
      );
    });
  });

  describe("reverseEnvelopeAllocations", () => {
    it("should return 0 when mode is not allocate", async () => {
      const paycheck: Paycheck = {
        id: "paycheck1",
        amount: 1000,
        mode: "leftover",
        date: "2026-01-01",
        userId: "user1",
        budgetId: "budget1",
        unassignedCashBefore: 0,
        unassignedCashAfter: 1000,
        timestamp: Date.now(),
      };

      const budgetDb = {
        envelopes: {
          get: vi.fn(),
          update: vi.fn(),
        },
      };

      const result = await reverseEnvelopeAllocations(paycheck, budgetDb);

      expect(result).toBe(0);
      expect(budgetDb.envelopes.get).not.toHaveBeenCalled();
      expect(budgetDb.envelopes.update).not.toHaveBeenCalled();
    });

    it("should return 0 when no envelopeAllocations exist", async () => {
      const paycheck: Paycheck = {
        id: "paycheck1",
        amount: 1000,
        mode: "allocate",
        date: "2026-01-01",
        userId: "user1",
        budgetId: "budget1",
        unassignedCashBefore: 0,
        unassignedCashAfter: 0,
        timestamp: Date.now(),
      };

      const budgetDb = {
        envelopes: {
          get: vi.fn(),
          update: vi.fn(),
        },
      };

      const result = await reverseEnvelopeAllocations(paycheck, budgetDb);

      expect(result).toBe(0);
      expect(budgetDb.envelopes.get).not.toHaveBeenCalled();
    });

    it("should reverse envelope allocations and calculate leftover", async () => {
      const paycheck: Paycheck = {
        id: "paycheck1",
        amount: 2000,
        mode: "allocate",
        date: "2026-01-01",
        userId: "user1",
        budgetId: "budget1",
        unassignedCashBefore: 0,
        unassignedCashAfter: 500,
        timestamp: Date.now(),
        envelopeAllocations: [
          { envelopeId: "env1", amount: 800 },
          { envelopeId: "env2", amount: 700 },
        ],
      };

      const budgetDb = {
        envelopes: {
          get: vi.fn().mockImplementation(async (id: string | number) => {
            if (id === "env1") return { id: "env1", currentBalance: 1000 };
            if (id === "env2") return { id: "env2", currentBalance: 1500 };
            return null;
          }),
          update: vi.fn(),
        },
      };

      const result = await reverseEnvelopeAllocations(paycheck, budgetDb);

      // Total allocated: 800 + 700 = 1500
      // Leftover: 2000 - 1500 = 500
      expect(result).toBe(500);

      expect(budgetDb.envelopes.update).toHaveBeenCalledWith("env1", {
        currentBalance: 200, // 1000 - 800
      });
      expect(budgetDb.envelopes.update).toHaveBeenCalledWith("env2", {
        currentBalance: 800, // 1500 - 700
      });

      expect(logger.debug).toHaveBeenCalledWith("Reversed envelope allocation", {
        envelopeId: "env1",
        amount: 800,
      });
      expect(logger.debug).toHaveBeenCalledWith("Reversed envelope allocation", {
        envelopeId: "env2",
        amount: 700,
      });
    });

    it("should handle envelope with missing currentBalance", async () => {
      const paycheck: Paycheck = {
        id: "paycheck1",
        amount: 1000,
        mode: "allocate",
        date: "2026-01-01",
        userId: "user1",
        budgetId: "budget1",
        unassignedCashBefore: 0,
        unassignedCashAfter: 0,
        timestamp: Date.now(),
        envelopeAllocations: [{ envelopeId: "env1", amount: 500 }],
      };

      const budgetDb = {
        envelopes: {
          get: vi.fn().mockResolvedValue({ id: "env1" }), // No currentBalance
          update: vi.fn(),
        },
      };

      const result = await reverseEnvelopeAllocations(paycheck, budgetDb);

      expect(result).toBe(500); // 1000 - 500
      expect(budgetDb.envelopes.update).toHaveBeenCalledWith("env1", {
        currentBalance: 0, // Math.max(0, 0 - 500)
      });
    });

    it("should not allow negative balance when reversing", async () => {
      const paycheck: Paycheck = {
        id: "paycheck1",
        amount: 1000,
        mode: "allocate",
        date: "2026-01-01",
        userId: "user1",
        budgetId: "budget1",
        unassignedCashBefore: 0,
        unassignedCashAfter: 0,
        timestamp: Date.now(),
        envelopeAllocations: [{ envelopeId: "env1", amount: 800 }],
      };

      const budgetDb = {
        envelopes: {
          get: vi.fn().mockResolvedValue({ id: "env1", currentBalance: 500 }),
          update: vi.fn(),
        },
      };

      await reverseEnvelopeAllocations(paycheck, budgetDb);

      expect(budgetDb.envelopes.update).toHaveBeenCalledWith("env1", {
        currentBalance: 0, // Math.max(0, 500 - 800)
      });
    });

    it("should skip envelope if not found", async () => {
      const paycheck: Paycheck = {
        id: "paycheck1",
        amount: 1000,
        mode: "allocate",
        date: "2026-01-01",
        userId: "user1",
        budgetId: "budget1",
        unassignedCashBefore: 0,
        unassignedCashAfter: 0,
        timestamp: Date.now(),
        envelopeAllocations: [{ envelopeId: "nonexistent", amount: 500 }],
      };

      const budgetDb = {
        envelopes: {
          get: vi.fn().mockResolvedValue(null),
          update: vi.fn(),
        },
      };

      const result = await reverseEnvelopeAllocations(paycheck, budgetDb);

      expect(result).toBe(500); // 1000 - 500
      expect(budgetDb.envelopes.update).not.toHaveBeenCalled();
    });

    it("should return 0 when allocations is in legacy format but envelopeAllocations is undefined", async () => {
      // Note: The actual code checks for envelopeAllocations first, so if it's undefined,
      // it returns 0 before checking the legacy allocations format
      const paycheck: Paycheck = {
        id: "paycheck1",
        amount: 1000,
        mode: "allocate",
        date: "2026-01-01",
        userId: "user1",
        budgetId: "budget1",
        unassignedCashBefore: 0,
        unassignedCashAfter: 0,
        timestamp: Date.now(),
        allocations: [{ envelopeId: "env1", amount: 600 }] as never,
      };

      const budgetDb = {
        envelopes: {
          get: vi.fn().mockResolvedValue({ id: "env1", currentBalance: 1000 }),
          update: vi.fn(),
        },
      };

      const result = await reverseEnvelopeAllocations(paycheck, budgetDb);

      // Since envelopeAllocations is undefined, function returns 0 early
      expect(result).toBe(0);
      expect(budgetDb.envelopes.update).not.toHaveBeenCalled();
    });
  });

  describe("calculateReversedBalances", () => {
    it("should calculate balances for leftover mode paycheck", async () => {
      const paycheck: Paycheck = {
        id: "paycheck1",
        amount: 1000,
        mode: "leftover",
        date: "2026-01-01",
        userId: "user1",
        budgetId: "budget1",
        unassignedCashBefore: 500,
        unassignedCashAfter: 1500,
        timestamp: Date.now(),
      };

      const budgetDb = {
        envelopes: {
          get: vi.fn(),
          update: vi.fn(),
        },
      };

      const getBudgetMetadata = vi.fn().mockResolvedValue({
        actualBalance: 5000,
        unassignedCash: 2000,
      });

      const result = await calculateReversedBalances(paycheck, budgetDb, getBudgetMetadata);

      expect(result).toEqual({
        currentActualBalance: 5000,
        currentUnassignedCash: 2000,
        newActualBalance: 4000, // 5000 - 1000
        newUnassignedCash: 1000, // Math.max(0, 2000 - 1000)
      });

      expect(logger.info).toHaveBeenCalledWith(
        "Reversing leftover mode paycheck from unassigned cash"
      );
    });

    it("should calculate balances for allocate mode paycheck", async () => {
      const paycheck: Paycheck = {
        id: "paycheck1",
        amount: 2000,
        mode: "allocate",
        date: "2026-01-01",
        userId: "user1",
        budgetId: "budget1",
        unassignedCashBefore: 500,
        unassignedCashAfter: 1000,
        timestamp: Date.now(),
        envelopeAllocations: [
          { envelopeId: "env1", amount: 800 },
          { envelopeId: "env2", amount: 700 },
        ],
      };

      const budgetDb = {
        envelopes: {
          get: vi.fn().mockImplementation(async (id: string | number) => {
            if (id === "env1") return { id: "env1", currentBalance: 1000 };
            if (id === "env2") return { id: "env2", currentBalance: 1500 };
            return null;
          }),
          update: vi.fn(),
        },
      };

      const getBudgetMetadata = vi.fn().mockResolvedValue({
        actualBalance: 5000,
        unassignedCash: 2000,
      });

      const result = await calculateReversedBalances(paycheck, budgetDb, getBudgetMetadata);

      // Total allocated: 800 + 700 = 1500
      // Leftover: 2000 - 1500 = 500
      expect(result).toEqual({
        currentActualBalance: 5000,
        currentUnassignedCash: 2000,
        newActualBalance: 3000, // 5000 - 2000
        newUnassignedCash: 1500, // Math.max(0, 2000 - 500)
      });
    });

    it("should handle null metadata gracefully", async () => {
      // Note: Negative actualBalance can occur when metadata is null/corrupted
      // The function calculates the new balance but doesn't validate it -
      // balance validation should happen at the caller level
      const paycheck: Paycheck = {
        id: "paycheck1",
        amount: 1000,
        mode: "leftover",
        date: "2026-01-01",
        userId: "user1",
        budgetId: "budget1",
        unassignedCashBefore: 0,
        unassignedCashAfter: 1000,
        timestamp: Date.now(),
      };

      const budgetDb = {
        envelopes: {
          get: vi.fn(),
          update: vi.fn(),
        },
      };

      const getBudgetMetadata = vi.fn().mockResolvedValue(null);

      const result = await calculateReversedBalances(paycheck, budgetDb, getBudgetMetadata);

      expect(result).toEqual({
        currentActualBalance: 0,
        currentUnassignedCash: 0,
        newActualBalance: -1000, // 0 - 1000 (negative allowed for calculation)
        newUnassignedCash: 0, // Math.max(0, 0 - 1000)
      });
    });

    it("should not allow negative unassignedCash", async () => {
      const paycheck: Paycheck = {
        id: "paycheck1",
        amount: 3000,
        mode: "leftover",
        date: "2026-01-01",
        userId: "user1",
        budgetId: "budget1",
        unassignedCashBefore: 0,
        unassignedCashAfter: 3000,
        timestamp: Date.now(),
      };

      const budgetDb = {
        envelopes: {
          get: vi.fn(),
          update: vi.fn(),
        },
      };

      const getBudgetMetadata = vi.fn().mockResolvedValue({
        actualBalance: 5000,
        unassignedCash: 1000,
      });

      const result = await calculateReversedBalances(paycheck, budgetDb, getBudgetMetadata);

      expect(result.newUnassignedCash).toBe(0); // Math.max(0, 1000 - 3000)
    });

    it("should handle allocate mode with legacy allocations format", async () => {
      // Note: calculateReversedBalances checks for legacy allocations array,
      // but reverseEnvelopeAllocations returns 0 when envelopeAllocations is undefined
      const paycheck: Paycheck = {
        id: "paycheck1",
        amount: 1000,
        mode: "allocate",
        date: "2026-01-01",
        userId: "user1",
        budgetId: "budget1",
        unassignedCashBefore: 0,
        unassignedCashAfter: 0,
        timestamp: Date.now(),
        allocations: [{ envelopeId: "env1", amount: 1000 }] as never,
      };

      const budgetDb = {
        envelopes: {
          get: vi.fn().mockResolvedValue({ id: "env1", currentBalance: 1500 }),
          update: vi.fn(),
        },
      };

      const getBudgetMetadata = vi.fn().mockResolvedValue({
        actualBalance: 5000,
        unassignedCash: 2000,
      });

      const result = await calculateReversedBalances(paycheck, budgetDb, getBudgetMetadata);

      // reverseEnvelopeAllocations returns 0 since envelopeAllocations is undefined
      // leftoverAmount = 0, so unassignedCash unchanged
      expect(result).toEqual({
        currentActualBalance: 5000,
        currentUnassignedCash: 2000,
        newActualBalance: 4000,
        newUnassignedCash: 2000, // Math.max(0, 2000 - 0)
      });
    });
  });

  describe("deletePaycheckRecord", () => {
    it("should delete paycheck from transactions table by string id", async () => {
      const budgetDb: { transactions: BudgetDbTransactions } = {
        transactions: {
          get: vi.fn().mockResolvedValue({ id: "paycheck1", amount: 1000 }),
          delete: vi.fn(),
        },
      };

      await deletePaycheckRecord("paycheck1", budgetDb);

      expect(budgetDb.transactions.get).toHaveBeenCalledWith("paycheck1");
      expect(budgetDb.transactions.delete).toHaveBeenCalledWith("paycheck1");
      expect(logger.info).toHaveBeenCalledWith(
        "Deleting paycheck from Dexie (transactions table)",
        {
          paycheckId: "paycheck1",
          paycheckIdType: "string",
        }
      );
      expect(logger.info).toHaveBeenCalledWith("Successfully deleted paycheck from Dexie");
    });

    it("should delete paycheck from transactions table by number id", async () => {
      const budgetDb: { transactions: BudgetDbTransactions } = {
        transactions: {
          get: vi.fn().mockResolvedValue({ id: 123, amount: 1000 }),
          delete: vi.fn(),
        },
      };

      await deletePaycheckRecord(123, budgetDb);

      expect(budgetDb.transactions.get).toHaveBeenCalledWith(123);
      expect(budgetDb.transactions.delete).toHaveBeenCalledWith(123);
      expect(logger.info).toHaveBeenCalledWith(
        "Deleting paycheck from Dexie (transactions table)",
        {
          paycheckId: 123,
          paycheckIdType: "number",
        }
      );
    });

    it("should warn when paycheck not found in Dexie", async () => {
      const budgetDb: { transactions: BudgetDbTransactions } = {
        transactions: {
          get: vi.fn().mockResolvedValue(null),
          delete: vi.fn(),
        },
      };

      await deletePaycheckRecord("nonexistent", budgetDb);

      expect(budgetDb.transactions.get).toHaveBeenCalledWith("nonexistent");
      expect(budgetDb.transactions.delete).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith("Paycheck not found in Dexie database", {
        paycheckId: "nonexistent",
      });
    });

    it("should handle undefined paycheck in Dexie", async () => {
      const budgetDb: { transactions: BudgetDbTransactions } = {
        transactions: {
          get: vi.fn().mockResolvedValue(undefined),
          delete: vi.fn(),
        },
      };

      await deletePaycheckRecord("paycheck1", budgetDb);

      expect(budgetDb.transactions.delete).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith("Paycheck not found in Dexie database", {
        paycheckId: "paycheck1",
      });
    });
  });

  describe("invalidatePaycheckCaches", () => {
    it("should invalidate all related query caches", async () => {
      const queryClient = {
        invalidateQueries: vi.fn(),
      };

      const queryKeys = {
        paycheckHistory: () => ["paycheckHistory"],
        envelopes: ["envelopes"],
        budgetMetadata: ["budgetMetadata"],
        dashboard: ["dashboard"],
      };

      await invalidatePaycheckCaches(queryClient, queryKeys);

      expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(4);
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["paycheckHistory"],
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["envelopes"],
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["budgetMetadata"],
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["dashboard"],
      });
    });

    it("should handle different query key structures", async () => {
      const queryClient = {
        invalidateQueries: vi.fn(),
      };

      const queryKeys = {
        paycheckHistory: () => ["paycheckHistory", { filter: "all" }],
        envelopes: ["envelopes", "list"],
        budgetMetadata: ["budget", "metadata"],
        dashboard: ["dashboard", "overview"],
      };

      await invalidatePaycheckCaches(queryClient, queryKeys);

      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["paycheckHistory", { filter: "all" }],
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["envelopes", "list"],
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["budget", "metadata"],
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["dashboard", "overview"],
      });
    });
  });

  describe("Integration scenarios", () => {
    it("should handle complete deletion workflow for allocate mode", async () => {
      // Setup
      const paycheck: Paycheck = {
        id: "paycheck1",
        amount: 2000,
        mode: "allocate",
        date: "2026-01-01",
        userId: "user1",
        budgetId: "budget1",
        unassignedCashBefore: 500,
        unassignedCashAfter: 1000,
        timestamp: Date.now(),
        envelopeAllocations: [
          { envelopeId: "env1", amount: 1200 },
          { envelopeId: "env2", amount: 300 },
        ],
      };

      const paycheckHistory = [paycheck];

      // Validate
      const validated = validatePaycheckDeletion("paycheck1", paycheckHistory);
      expect(validated).toEqual(paycheck);

      // Calculate balances
      const budgetDb = {
        envelopes: {
          get: vi.fn().mockImplementation(async (id: string | number) => {
            if (id === "env1") return { id: "env1", currentBalance: 2000 };
            if (id === "env2") return { id: "env2", currentBalance: 1000 };
            return null;
          }),
          update: vi.fn(),
        },
      };

      const getBudgetMetadata = vi.fn().mockResolvedValue({
        actualBalance: 10000,
        unassignedCash: 3000,
      });

      const balances = await calculateReversedBalances(paycheck, budgetDb, getBudgetMetadata);

      // Leftover: 2000 - (1200 + 300) = 500
      expect(balances).toEqual({
        currentActualBalance: 10000,
        currentUnassignedCash: 3000,
        newActualBalance: 8000,
        newUnassignedCash: 2500, // 3000 - 500
      });
    });

    it("should handle complete deletion workflow for leftover mode", async () => {
      const paycheck: Paycheck = {
        id: "paycheck2",
        amount: 1500,
        mode: "leftover",
        date: "2026-01-02",
        userId: "user1",
        budgetId: "budget1",
        unassignedCashBefore: 1000,
        unassignedCashAfter: 2500,
        timestamp: Date.now(),
      };

      const paycheckHistory = [paycheck];

      const validated = validatePaycheckDeletion("paycheck2", paycheckHistory);
      expect(validated).toEqual(paycheck);

      const budgetDb = {
        envelopes: {
          get: vi.fn(),
          update: vi.fn(),
        },
      };

      const getBudgetMetadata = vi.fn().mockResolvedValue({
        actualBalance: 8000,
        unassignedCash: 3000,
      });

      const balances = await calculateReversedBalances(paycheck, budgetDb, getBudgetMetadata);

      expect(balances).toEqual({
        currentActualBalance: 8000,
        currentUnassignedCash: 3000,
        newActualBalance: 6500, // 8000 - 1500
        newUnassignedCash: 1500, // 3000 - 1500
      });
    });
  });
});
