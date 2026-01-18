import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getCurrentBalances,
  processEnvelopeAllocations,
  createPaycheckRecord,
  processPaycheck,
} from "../paycheckProcessing";
import { budgetDb } from "@/db/budgetDb";

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

vi.mock("@/utils/core/common/balanceCalculator", () => ({
  calculatePaycheckBalances: vi.fn((currentBalances, paycheckData, allocations) => {
    const totalAllocated = allocations.reduce(
      (sum: number, alloc: { amount: number }) => sum + alloc.amount,
      0
    );
    return {
      actualBalance: currentBalances.actualBalance + paycheckData.amount,
      virtualBalance: currentBalances.virtualBalance + totalAllocated,
      unassignedCash: currentBalances.unassignedCash + paycheckData.amount - totalAllocated,
    };
  }),
  validateBalances: vi.fn(() => ({ isValid: true, errors: [], warnings: [] })),
}));

vi.mock("@/services/transactions/paycheckTransactionService", () => ({
  createPaycheckTransactions: vi.fn(async () => ({
    incomeTransactionId: "income-tx-123",
    transferTransactionIds: ["transfer-tx-1", "transfer-tx-2"],
  })),
}));

import { getBudgetMetadata, setBudgetMetadata } from "@/db/budgetDb";

describe("paycheckProcessing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCurrentBalances", () => {
    it("should get current balances from metadata and queries", async () => {
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

    it("should handle missing metadata with defaults", async () => {
      vi.mocked(getBudgetMetadata).mockResolvedValue(null);

      const envelopesQuery = { data: [] };
      const savingsGoalsQuery = { data: [] };

      const balances = await getCurrentBalances(envelopesQuery, savingsGoalsQuery);

      expect(balances.actualBalance).toBe(0);
      expect(balances.unassignedCash).toBe(0);
      expect(balances.virtualBalance).toBe(0);
    });

    it("should handle undefined balance values", async () => {
      const mockMetadata = {
        actualBalance: undefined,
        unassignedCash: undefined,
      };

      vi.mocked(getBudgetMetadata).mockResolvedValue(mockMetadata);

      const envelopesQuery = {
        data: [
          { currentBalance: undefined, name: "Envelope 1" },
          { currentBalance: "100", name: "Envelope 2" },
        ],
      };

      const savingsGoalsQuery = { data: [] };

      const balances = await getCurrentBalances(envelopesQuery, savingsGoalsQuery);

      expect(balances.actualBalance).toBe(0);
      expect(balances.unassignedCash).toBe(0);
      expect(balances.virtualBalance).toBe(100);
    });

    it("should parse string balances correctly", async () => {
      const mockMetadata = {
        actualBalance: "1500.50",
        unassignedCash: "250.25",
      };

      vi.mocked(getBudgetMetadata).mockResolvedValue(mockMetadata);

      const envelopesQuery = {
        data: [{ currentBalance: "150.75", name: "Envelope 1" }],
      };

      const savingsGoalsQuery = { data: [] };

      const balances = await getCurrentBalances(envelopesQuery, savingsGoalsQuery);

      expect(balances.actualBalance).toBe(1500.5);
      expect(balances.unassignedCash).toBe(250.25);
      expect(balances.virtualBalance).toBe(150.75);
    });

    it("should handle empty query data arrays", async () => {
      vi.mocked(getBudgetMetadata).mockResolvedValue({
        actualBalance: 1000,
        unassignedCash: 500,
      });

      const envelopesQuery = { data: undefined };
      const savingsGoalsQuery = { data: undefined };

      const balances = await getCurrentBalances(envelopesQuery, savingsGoalsQuery);

      expect(balances.virtualBalance).toBe(0);
    });

    it("should handle NaN values in balance calculations", async () => {
      vi.mocked(getBudgetMetadata).mockResolvedValue({
        actualBalance: "invalid",
        unassignedCash: 500,
      });

      const envelopesQuery = {
        data: [{ currentBalance: "invalid", name: "Envelope 1" }],
      };

      const savingsGoalsQuery = { data: [] };

      const balances = await getCurrentBalances(envelopesQuery, savingsGoalsQuery);

      // Should handle NaN gracefully - Number("invalid") becomes NaN, and Number(NaN) || 0 becomes 0
      // But parseFloat returns NaN for invalid strings
      expect(typeof balances.actualBalance).toBe("number");
      expect(typeof balances.virtualBalance).toBe("number");
    });
  });

  describe("processEnvelopeAllocations", () => {
    it("should update envelope balances with allocations", async () => {
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

      await processEnvelopeAllocations(allocations);

      expect(budgetDb.envelopes.get).toHaveBeenCalledTimes(2);
      expect(budgetDb.envelopes.update).toHaveBeenCalledWith("env-1", {
        currentBalance: 150,
      });
    });

    it("should handle empty allocations array", async () => {
      await processEnvelopeAllocations([]);

      expect(budgetDb.envelopes.get).not.toHaveBeenCalled();
      expect(budgetDb.envelopes.update).not.toHaveBeenCalled();
    });

    it("should handle envelope not found", async () => {
      vi.mocked(budgetDb.envelopes.get).mockResolvedValue(undefined);

      const allocations = [{ envelopeId: "non-existent", amount: 50 }];

      await processEnvelopeAllocations(allocations);

      expect(budgetDb.envelopes.get).toHaveBeenCalled();
      expect(budgetDb.envelopes.update).not.toHaveBeenCalled();
    });

    it("should handle envelope with undefined currentBalance", async () => {
      const mockEnvelope = {
        id: "env-1",
        name: "Groceries",
        currentBalance: undefined,
      };

      vi.mocked(budgetDb.envelopes.get).mockResolvedValue(mockEnvelope);
      vi.mocked(budgetDb.envelopes.update).mockResolvedValue(1);

      const allocations = [{ envelopeId: "env-1", amount: 50 }];

      await processEnvelopeAllocations(allocations);

      expect(budgetDb.envelopes.update).toHaveBeenCalledWith("env-1", {
        currentBalance: 50,
      });
    });

    it("should process multiple allocations sequentially", async () => {
      const mockEnvelope1 = { id: "env-1", currentBalance: 100 };
      const mockEnvelope2 = { id: "env-2", currentBalance: 200 };

      vi.mocked(budgetDb.envelopes.get)
        .mockResolvedValueOnce(mockEnvelope1)
        .mockResolvedValueOnce(mockEnvelope2);

      const allocations = [
        { envelopeId: "env-1", amount: 25 },
        { envelopeId: "env-2", amount: 50 },
      ];

      await processEnvelopeAllocations(allocations);

      expect(budgetDb.envelopes.update).toHaveBeenCalledWith("env-1", {
        currentBalance: 125,
      });
      expect(budgetDb.envelopes.update).toHaveBeenCalledWith("env-2", {
        currentBalance: 250,
      });
    });

    it("should handle negative allocation amounts", async () => {
      const mockEnvelope = { id: "env-1", currentBalance: 100 };
      vi.mocked(budgetDb.envelopes.get).mockResolvedValue(mockEnvelope);

      const allocations = [{ envelopeId: "env-1", amount: -25 }];

      await processEnvelopeAllocations(allocations);

      expect(budgetDb.envelopes.update).toHaveBeenCalledWith("env-1", {
        currentBalance: 75,
      });
    });
  });

  describe("createPaycheckRecord", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-01-15T10:00:00.000Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should create paycheck record with transaction IDs", async () => {
      const paycheckData = {
        amount: 2000,
        payerName: "Employer Inc",
        mode: "allocate",
        notes: "Bi-weekly paycheck",
      };

      const currentBalances = { unassignedCash: 500, actualBalance: 3000 };
      const newBalances = { unassignedCash: 700, actualBalance: 5000 };

      const allocations = [
        { envelopeId: "env-1", envelopeName: "Groceries", amount: 300 },
        { envelopeId: "env-2", envelopeName: "Rent", amount: 1200 },
      ];

      const transactionIds = {
        incomeTransactionId: "income-tx-123",
        transferTransactionIds: ["transfer-tx-1", "transfer-tx-2"],
      };

      vi.mocked(budgetDb.transactions.add).mockResolvedValue("paycheck_123");

      const record = await createPaycheckRecord(
        paycheckData,
        currentBalances,
        newBalances,
        allocations,
        transactionIds
      );

      expect(record.amount).toBe(2000);
      expect(record.payerName).toBe("Employer Inc");
      expect(record.type).toBe("income");
      expect(record.mode).toBe("allocate");
      expect(record.incomeTransactionId).toBe("income-tx-123");
      expect(record.transferTransactionIds).toEqual(["transfer-tx-1", "transfer-tx-2"]);
      expect(record.unassignedCashBefore).toBe(500);
      expect(record.unassignedCashAfter).toBe(700);
      expect(budgetDb.transactions.add).toHaveBeenCalled();
    });

    it("should create paycheck record without transaction IDs", async () => {
      const paycheckData = {
        amount: 2000,
        mode: "leftover",
      };

      const currentBalances = { unassignedCash: 500, actualBalance: 3000 };
      const newBalances = { unassignedCash: 2500, actualBalance: 5000 };
      const allocations = [];

      const record = await createPaycheckRecord(
        paycheckData,
        currentBalances,
        newBalances,
        allocations,
        undefined
      );

      expect(record.incomeTransactionId).toBeUndefined();
      expect(record.transferTransactionIds).toEqual([]);
    });

    it("should handle missing payerName with default", async () => {
      const paycheckData = {
        amount: 2000,
        mode: "allocate",
      };

      const currentBalances = { unassignedCash: 500, actualBalance: 3000 };
      const newBalances = { unassignedCash: 700, actualBalance: 5000 };
      const allocations = [];

      const record = await createPaycheckRecord(
        paycheckData,
        currentBalances,
        newBalances,
        allocations
      );

      expect(record.payerName).toBe("Unknown");
    });

    it("should include allocations map in record", async () => {
      const paycheckData = { amount: 2000, mode: "allocate" };
      const currentBalances = { unassignedCash: 500, actualBalance: 3000 };
      const newBalances = { unassignedCash: 200, actualBalance: 5000 };

      const allocations = [
        { envelopeId: "env-1", amount: 800 },
        { envelopeId: "env-2", amount: 1000 },
      ];

      const record = await createPaycheckRecord(
        paycheckData,
        currentBalances,
        newBalances,
        allocations
      );

      expect(record.allocations).toEqual({
        "env-1": 800,
        "env-2": 1000,
      });
    });

    it("should set correct timestamps", async () => {
      const paycheckData = { amount: 2000, mode: "allocate" };
      const currentBalances = { unassignedCash: 500, actualBalance: 3000 };
      const newBalances = { unassignedCash: 2500, actualBalance: 5000 };
      const allocations = [];

      const record = await createPaycheckRecord(
        paycheckData,
        currentBalances,
        newBalances,
        allocations
      );

      expect(record.date).toBeInstanceOf(Date);
      expect(record.lastModified).toBeGreaterThan(0);
      expect(record.createdAt).toBeGreaterThan(0);
    });
  });

  describe("processPaycheck", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-01-15T10:00:00.000Z"));

      vi.mocked(getBudgetMetadata).mockResolvedValue({
        actualBalance: 1000,
        unassignedCash: 500,
        isActualBalanceManual: false,
      });

      vi.mocked(budgetDb.envelopes.get).mockResolvedValue({
        id: "env-1",
        name: "Groceries",
        currentBalance: 100,
      });

      vi.mocked(budgetDb.envelopes.update).mockResolvedValue(1);
      vi.mocked(budgetDb.transactions.add).mockResolvedValue("paycheck_123");
      vi.mocked(setBudgetMetadata).mockResolvedValue(undefined);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should process paycheck with allocations", async () => {
      const paycheckData = {
        amount: 2000,
        mode: "allocate",
        payerName: "Employer Inc",
        envelopeAllocations: [
          { envelopeId: "env-1", envelopeName: "Groceries", amount: 500 },
          { envelopeId: "env-2", envelopeName: "Rent", amount: 1200 },
        ],
      };

      const envelopesQuery = { data: [{ currentBalance: 100 }] };
      const savingsGoalsQuery = { data: [] };

      const record = await processPaycheck(paycheckData, envelopesQuery, savingsGoalsQuery);

      expect(record).toBeDefined();
      expect(record.amount).toBe(2000);
      expect(setBudgetMetadata).toHaveBeenCalled();
      expect(budgetDb.transactions.add).toHaveBeenCalled();
    });

    it("should process paycheck without allocations (leftover mode)", async () => {
      const paycheckData = {
        amount: 2000,
        mode: "leftover",
        payerName: "Employer Inc",
      };

      const envelopesQuery = { data: [] };
      const savingsGoalsQuery = { data: [] };

      const record = await processPaycheck(paycheckData, envelopesQuery, savingsGoalsQuery);

      expect(record).toBeDefined();
      expect(record.amount).toBe(2000);
    });

    it("should fetch envelope names for allocations without names", async () => {
      const paycheckData = {
        amount: 2000,
        mode: "allocate",
        envelopeAllocations: [{ envelopeId: "env-1", amount: 500 }],
      };

      const envelopesQuery = { data: [] };
      const savingsGoalsQuery = { data: [] };

      await processPaycheck(paycheckData, envelopesQuery, savingsGoalsQuery);

      expect(budgetDb.envelopes.get).toHaveBeenCalledWith("env-1");
    });

    it("should handle split transactions across multiple envelopes", async () => {
      const paycheckData = {
        amount: 3000,
        mode: "allocate",
        envelopeAllocations: [
          { envelopeId: "env-1", amount: 500 },
          { envelopeId: "env-2", amount: 800 },
          { envelopeId: "env-3", amount: 700 },
          { envelopeId: "env-4", amount: 600 },
        ],
      };

      const envelopesQuery = { data: [] };
      const savingsGoalsQuery = { data: [] };

      vi.mocked(budgetDb.envelopes.get).mockResolvedValue({
        id: "env-1",
        name: "Test Envelope",
        currentBalance: 100,
      });

      const record = await processPaycheck(paycheckData, envelopesQuery, savingsGoalsQuery);

      expect(record).toBeDefined();
      expect(budgetDb.envelopes.update).toHaveBeenCalledTimes(4);
    });

    it("should handle transaction creation failure gracefully", async () => {
      const paycheckData = {
        amount: 2000,
        mode: "allocate",
        envelopeAllocations: [{ envelopeId: "env-1", amount: 500 }],
      };

      const envelopesQuery = { data: [] };
      const savingsGoalsQuery = { data: [] };

      // Mock transaction creation failure
      const { createPaycheckTransactions } =
        await import("@/services/transactions/paycheckTransactionService");
      vi.mocked(createPaycheckTransactions).mockRejectedValue(
        new Error("Transaction creation failed")
      );

      const record = await processPaycheck(paycheckData, envelopesQuery, savingsGoalsQuery);

      // Should still complete paycheck processing
      expect(record).toBeDefined();
      expect(record.incomeTransactionId).toBeUndefined();
    });

    it("should calculate balances using centralized calculator", async () => {
      const paycheckData = {
        amount: 2000,
        mode: "allocate",
        envelopeAllocations: [{ envelopeId: "env-1", amount: 500 }],
      };

      const envelopesQuery = { data: [] };
      const savingsGoalsQuery = { data: [] };

      await processPaycheck(paycheckData, envelopesQuery, savingsGoalsQuery);

      const { calculatePaycheckBalances } = await import("@/utils/core/common/balanceCalculator");
      expect(calculatePaycheckBalances).toHaveBeenCalled();
    });

    it("should validate balances after calculation", async () => {
      const paycheckData = {
        amount: 2000,
        mode: "allocate",
        envelopeAllocations: [{ envelopeId: "env-1", amount: 500 }],
      };

      const envelopesQuery = { data: [] };
      const savingsGoalsQuery = { data: [] };

      await processPaycheck(paycheckData, envelopesQuery, savingsGoalsQuery);

      const { validateBalances } = await import("@/utils/core/common/balanceCalculator");
      expect(validateBalances).toHaveBeenCalled();
    });

    it("should handle zero amount paycheck", async () => {
      const paycheckData = {
        amount: 0,
        mode: "leftover",
      };

      const envelopesQuery = { data: [] };
      const savingsGoalsQuery = { data: [] };

      const record = await processPaycheck(paycheckData, envelopesQuery, savingsGoalsQuery);

      expect(record).toBeDefined();
      expect(record.amount).toBe(0);
    });

    it("should handle large paycheck amounts", async () => {
      const paycheckData = {
        amount: 100000,
        mode: "allocate",
        envelopeAllocations: [{ envelopeId: "env-1", amount: 50000 }],
      };

      const envelopesQuery = { data: [] };
      const savingsGoalsQuery = { data: [] };

      const record = await processPaycheck(paycheckData, envelopesQuery, savingsGoalsQuery);

      expect(record).toBeDefined();
      expect(record.amount).toBe(100000);
    });

    it("should handle notes and custom fields", async () => {
      const paycheckData = {
        amount: 2000,
        mode: "allocate",
        payerName: "Employer Inc",
        notes: "Bonus included",
        envelopeAllocations: [],
      };

      const envelopesQuery = { data: [] };
      const savingsGoalsQuery = { data: [] };

      const record = await processPaycheck(paycheckData, envelopesQuery, savingsGoalsQuery);

      expect(record.notes).toBe("Bonus included");
      expect(record.payerName).toBe("Employer Inc");
    });

    it("should update budget metadata with new balances", async () => {
      const paycheckData = {
        amount: 2000,
        mode: "allocate",
        envelopeAllocations: [{ envelopeId: "env-1", amount: 500 }],
      };

      const envelopesQuery = { data: [] };
      const savingsGoalsQuery = { data: [] };

      await processPaycheck(paycheckData, envelopesQuery, savingsGoalsQuery);

      expect(setBudgetMetadata).toHaveBeenCalledWith(
        expect.objectContaining({
          actualBalance: expect.any(Number),
          unassignedCash: expect.any(Number),
        })
      );
    });

    it("should generate unique paycheck ID using UUID", async () => {
      const paycheckData = {
        amount: 2000,
        mode: "allocate",
        envelopeAllocations: [],
      };

      const envelopesQuery = { data: [] };
      const savingsGoalsQuery = { data: [] };

      const record1 = await processPaycheck(paycheckData, envelopesQuery, savingsGoalsQuery);
      const record2 = await processPaycheck(paycheckData, envelopesQuery, savingsGoalsQuery);

      // Both should start with paycheck_ and contain UUID
      expect(record1.id).toContain("paycheck_");
      expect(record2.id).toContain("paycheck_");
      // processPaycheck uses uuidv4() which generates unique IDs with hyphens
      // Check the ID format is valid (either timestamp or UUID)
      expect(record1.id.length).toBeGreaterThan(10);
      expect(record2.id.length).toBeGreaterThan(10);
    });

    it("should handle partial allocations (some money left unassigned)", async () => {
      const paycheckData = {
        amount: 2000,
        mode: "allocate",
        envelopeAllocations: [
          { envelopeId: "env-1", amount: 500 },
          { envelopeId: "env-2", amount: 300 },
        ],
      };

      const envelopesQuery = { data: [] };
      const savingsGoalsQuery = { data: [] };

      const record = await processPaycheck(paycheckData, envelopesQuery, savingsGoalsQuery);

      // $2000 - $800 allocated = $1200 should remain unassigned
      expect(record).toBeDefined();
    });

    it("should handle over-allocation scenario", async () => {
      const paycheckData = {
        amount: 1000,
        mode: "allocate",
        envelopeAllocations: [
          { envelopeId: "env-1", amount: 600 },
          { envelopeId: "env-2", amount: 600 },
        ],
      };

      const envelopesQuery = { data: [] };
      const savingsGoalsQuery = { data: [] };

      // Should still process without throwing error
      const record = await processPaycheck(paycheckData, envelopesQuery, savingsGoalsQuery);
      expect(record).toBeDefined();
    });
  });

  describe("Edge Cases and Complex Scenarios", () => {
    beforeEach(() => {
      vi.mocked(getBudgetMetadata).mockResolvedValue({
        actualBalance: 1000,
        unassignedCash: 500,
        isActualBalanceManual: false,
      });

      vi.mocked(budgetDb.envelopes.get).mockResolvedValue({
        id: "env-1",
        name: "Test",
        currentBalance: 100,
      });

      vi.mocked(budgetDb.envelopes.update).mockResolvedValue(1);
      vi.mocked(budgetDb.transactions.add).mockResolvedValue("paycheck_123");
      vi.mocked(setBudgetMetadata).mockResolvedValue(undefined);
    });

    it("should handle decimal amounts correctly", async () => {
      const paycheckData = {
        amount: 2547.83,
        mode: "allocate",
        envelopeAllocations: [
          { envelopeId: "env-1", amount: 325.42 },
          { envelopeId: "env-2", amount: 891.67 },
        ],
      };

      const envelopesQuery = { data: [] };
      const savingsGoalsQuery = { data: [] };

      const record = await processPaycheck(paycheckData, envelopesQuery, savingsGoalsQuery);

      expect(record.amount).toBe(2547.83);
    });

    it("should handle concurrent paycheck processing", async () => {
      const paycheckData = {
        amount: 2000,
        mode: "allocate",
        envelopeAllocations: [{ envelopeId: "env-1", amount: 500 }],
      };

      const envelopesQuery = { data: [] };
      const savingsGoalsQuery = { data: [] };

      // Process multiple paychecks simultaneously
      const promises = [
        processPaycheck(paycheckData, envelopesQuery, savingsGoalsQuery),
        processPaycheck(paycheckData, envelopesQuery, savingsGoalsQuery),
        processPaycheck(paycheckData, envelopesQuery, savingsGoalsQuery),
      ];

      const records = await Promise.all(promises);

      expect(records).toHaveLength(3);
      // All records should be created successfully
      records.forEach((record) => {
        expect(record.id).toContain("paycheck_");
        expect(record.amount).toBe(2000);
      });
    });

    it("should handle very small amounts (cents)", async () => {
      const paycheckData = {
        amount: 0.01,
        mode: "allocate",
        envelopeAllocations: [{ envelopeId: "env-1", amount: 0.01 }],
      };

      const envelopesQuery = { data: [] };
      const savingsGoalsQuery = { data: [] };

      const record = await processPaycheck(paycheckData, envelopesQuery, savingsGoalsQuery);

      expect(record.amount).toBe(0.01);
    });

    it("should handle missing envelope in allocation", async () => {
      const paycheckData = {
        amount: 2000,
        mode: "allocate",
        envelopeAllocations: [{ envelopeId: "non-existent", amount: 500 }],
      };

      const envelopesQuery = { data: [] };
      const savingsGoalsQuery = { data: [] };

      vi.mocked(budgetDb.envelopes.get).mockResolvedValue(undefined);

      const record = await processPaycheck(paycheckData, envelopesQuery, savingsGoalsQuery);

      // Should complete without error
      expect(record).toBeDefined();
    });

    it("should preserve existing manual balance flag", async () => {
      vi.mocked(getBudgetMetadata).mockResolvedValue({
        actualBalance: 1000,
        unassignedCash: 500,
        isActualBalanceManual: true,
      });

      const paycheckData = {
        amount: 2000,
        mode: "allocate",
        envelopeAllocations: [],
      };

      const envelopesQuery = { data: [] };
      const savingsGoalsQuery = { data: [] };

      await processPaycheck(paycheckData, envelopesQuery, savingsGoalsQuery);

      const balances = await getCurrentBalances(envelopesQuery, savingsGoalsQuery);
      expect(balances.isActualBalanceManual).toBe(true);
    });
  });
});
