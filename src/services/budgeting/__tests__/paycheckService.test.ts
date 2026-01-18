/**
 * Tests for paycheck processing service layer
 * Tests the side effects and database operations
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getCurrentBalances,
  executeEnvelopeAllocations,
  enrichAllocationsWithNames,
  executePaycheckPlan,
} from "../paycheckService";
import { budgetDb, getBudgetMetadata, setBudgetMetadata } from "@/db/budgetDb";
import type { PaycheckExecutionPlan } from "@/utils/domain/budgeting/paycheckProcessingTypes";

// Mock dependencies
vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    envelopes: {
      get: vi.fn(),
      update: vi.fn(),
    },
    transactions: {
      add: vi.fn(),
    },
  },
  getBudgetMetadata: vi.fn(),
  setBudgetMetadata: vi.fn(),
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/services/transactions/paycheckTransactionService", () => ({
  createPaycheckTransactions: vi.fn(async () => ({
    incomeTransactionId: "income-tx-123",
    transferTransactionIds: ["transfer-tx-1", "transfer-tx-2"],
  })),
}));

describe("paycheckService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCurrentBalances", () => {
    it("should retrieve and calculate current balances", async () => {
      const mockMetadata = {
        actualBalance: 1000,
        unassignedCash: 500,
        isActualBalanceManual: false,
      };

      vi.mocked(getBudgetMetadata).mockResolvedValue(mockMetadata);

      const envelopesQuery = {
        data: [
          { currentBalance: 100, name: "Envelope 1" },
          { currentBalance: 200, name: "Envelope 2" },
        ],
      };

      const savingsGoalsQuery = {
        data: [{ currentBalance: 300, name: "Savings 1" }],
      };

      const balances = await getCurrentBalances(envelopesQuery, savingsGoalsQuery);

      expect(balances.actualBalance).toBe(1000);
      expect(balances.unassignedCash).toBe(500);
      expect(balances.virtualBalance).toBe(600); // 100 + 200 + 300
      expect(balances.isActualBalanceManual).toBe(false);
    });

    it("should handle missing metadata", async () => {
      vi.mocked(getBudgetMetadata).mockResolvedValue(null);

      const envelopesQuery = { data: [] };
      const savingsGoalsQuery = { data: [] };

      const balances = await getCurrentBalances(envelopesQuery, savingsGoalsQuery);

      expect(balances.actualBalance).toBe(0);
      expect(balances.unassignedCash).toBe(0);
      expect(balances.virtualBalance).toBe(0);
    });

    it("should handle undefined data arrays", async () => {
      vi.mocked(getBudgetMetadata).mockResolvedValue({
        actualBalance: 1000,
        unassignedCash: 500,
      });

      const envelopesQuery = { data: undefined };
      const savingsGoalsQuery = { data: undefined };

      const balances = await getCurrentBalances(envelopesQuery, savingsGoalsQuery);

      expect(balances.virtualBalance).toBe(0);
    });
  });

  describe("executeEnvelopeAllocations", () => {
    it("should update envelope balances", async () => {
      const mockEnvelope = {
        id: "env-1",
        name: "Groceries",
        currentBalance: 100,
      };

      vi.mocked(budgetDb.envelopes.get).mockResolvedValue(mockEnvelope);
      vi.mocked(budgetDb.envelopes.update).mockResolvedValue(1);

      const allocations = [
        { envelopeId: "env-1", amount: 50 },
        { envelopeId: "env-2", amount: 75 },
      ];

      await executeEnvelopeAllocations(allocations);

      expect(budgetDb.envelopes.get).toHaveBeenCalledTimes(2);
      expect(budgetDb.envelopes.update).toHaveBeenCalledWith("env-1", {
        currentBalance: 150,
      });
    });

    it("should handle empty allocations", async () => {
      await executeEnvelopeAllocations([]);

      expect(budgetDb.envelopes.get).not.toHaveBeenCalled();
      expect(budgetDb.envelopes.update).not.toHaveBeenCalled();
    });

    it("should skip missing envelopes", async () => {
      vi.mocked(budgetDb.envelopes.get).mockResolvedValue(undefined);

      const allocations = [{ envelopeId: "non-existent", amount: 50 }];

      await executeEnvelopeAllocations(allocations);

      expect(budgetDb.envelopes.get).toHaveBeenCalled();
      expect(budgetDb.envelopes.update).not.toHaveBeenCalled();
    });
  });

  describe("enrichAllocationsWithNames", () => {
    it("should enrich allocations without names", async () => {
      const mockEnvelope = {
        id: "env-1",
        name: "Groceries",
        currentBalance: 100,
      };

      vi.mocked(budgetDb.envelopes.get).mockResolvedValue(mockEnvelope);

      const allocations = [
        { envelopeId: "env-1", amount: 50 },
        { envelopeId: "env-2", amount: 75, envelopeName: "Existing Name" },
      ];

      const result = await enrichAllocationsWithNames(allocations);

      expect(result).toHaveLength(2);
      expect(result[0].envelopeName).toBe("Groceries");
      expect(result[1].envelopeName).toBe("Existing Name");
    });

    it("should not mutate original allocations", async () => {
      const mockEnvelope = {
        id: "env-1",
        name: "Groceries",
        currentBalance: 100,
      };

      vi.mocked(budgetDb.envelopes.get).mockResolvedValue(mockEnvelope);

      const allocations = [{ envelopeId: "env-1", amount: 50 }];
      const originalAllocations = JSON.parse(JSON.stringify(allocations));

      await enrichAllocationsWithNames(allocations);

      expect(allocations).toEqual(originalAllocations);
    });

    it("should handle envelope not found", async () => {
      vi.mocked(budgetDb.envelopes.get).mockResolvedValue(undefined);

      const allocations = [{ envelopeId: "env-1", amount: 50 }];

      const result = await enrichAllocationsWithNames(allocations);

      expect(result).toHaveLength(1);
      expect(result[0].envelopeName).toBeUndefined();
    });
  });

  describe("executePaycheckPlan", () => {
    const mockPlan: PaycheckExecutionPlan = {
      paycheckId: "paycheck_123",
      balanceUpdates: {
        actualBalance: 3000,
        unassignedCash: 1500,
      },
      envelopeAllocations: [{ envelopeId: "env-1", envelopeName: "Groceries", amount: 500 }],
      transactionCreation: {
        paycheckId: "paycheck_123",
        amount: 2000,
        payerName: "Employer Inc",
        notes: "Bi-weekly",
        allocations: [{ envelopeId: "env-1", envelopeName: "Groceries", amount: 500 }],
      },
      paycheckRecord: {
        id: "paycheck_123",
        date: new Date("2024-01-15"),
        amount: 2000,
        payerName: "Employer Inc",
        lastModified: 1705334400000,
        createdAt: 1705334400000,
        type: "income",
        category: "Income",
        envelopeId: "unassigned",
        isScheduled: false,
        mode: "allocate",
        unassignedCashBefore: 500,
        unassignedCashAfter: 1500,
        actualBalanceBefore: 1000,
        actualBalanceAfter: 3000,
        allocations: { "env-1": 500 },
        notes: "Bi-weekly",
      },
      validation: {
        isValid: true,
        errors: [],
        warnings: [],
      },
    };

    beforeEach(() => {
      vi.mocked(budgetDb.envelopes.get).mockResolvedValue({
        id: "env-1",
        name: "Groceries",
        currentBalance: 100,
      });
      vi.mocked(budgetDb.envelopes.update).mockResolvedValue(1);
      vi.mocked(budgetDb.transactions.add).mockResolvedValue("paycheck_123");
      vi.mocked(setBudgetMetadata).mockResolvedValue(undefined);
    });

    it("should execute paycheck plan successfully", async () => {
      const result = await executePaycheckPlan(mockPlan);

      expect(result).toBeDefined();
      expect(result.id).toBe("paycheck_123");
      expect(result.incomeTransactionId).toBe("income-tx-123");
      expect(setBudgetMetadata).toHaveBeenCalledWith({
        actualBalance: 3000,
        unassignedCash: 1500,
      });
      expect(budgetDb.envelopes.update).toHaveBeenCalled();
      expect(budgetDb.transactions.add).toHaveBeenCalled();
    });

    it("should handle validation errors", async () => {
      const invalidPlan = {
        ...mockPlan,
        validation: {
          isValid: false,
          errors: [{ type: "BALANCE_MISMATCH", message: "Balance mismatch", difference: 100 }],
          warnings: [],
        },
      };

      const result = await executePaycheckPlan(invalidPlan);

      expect(result).toBeDefined();
      // Should complete despite validation errors (warnings logged)
    });

    it("should handle transaction creation failure gracefully", async () => {
      const { createPaycheckTransactions } =
        await import("@/services/transactions/paycheckTransactionService");
      vi.mocked(createPaycheckTransactions).mockRejectedValue(
        new Error("Transaction creation failed")
      );

      const result = await executePaycheckPlan(mockPlan);

      expect(result).toBeDefined();
      expect(result.incomeTransactionId).toBeUndefined();
      expect(result.transferTransactionIds).toEqual([]);
    });

    it("should update metadata before envelope allocations", async () => {
      const calls: string[] = [];

      vi.mocked(setBudgetMetadata).mockImplementation(async () => {
        calls.push("metadata");
      });

      vi.mocked(budgetDb.envelopes.update).mockImplementation(async () => {
        calls.push("envelope");
        return 1;
      });

      await executePaycheckPlan(mockPlan);

      expect(calls[0]).toBe("metadata");
      expect(calls[1]).toBe("envelope");
    });

    it("should include transaction IDs in paycheck record", async () => {
      // Re-mock for this specific test
      const { createPaycheckTransactions } =
        await import("@/services/transactions/paycheckTransactionService");
      vi.mocked(createPaycheckTransactions).mockResolvedValue({
        incomeTransactionId: "income-tx-123",
        transferTransactionIds: ["transfer-tx-1", "transfer-tx-2"],
      });

      const result = await executePaycheckPlan(mockPlan);

      expect(result.incomeTransactionId).toBe("income-tx-123");
      expect(result.transferTransactionIds).toEqual(["transfer-tx-1", "transfer-tx-2"]);
    });
  });
});
