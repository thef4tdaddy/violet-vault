/**
 * Tests for Paycheck Transaction Service
 * Issue #1340: Ensure Proper Transaction Creation for Paycheck Processing
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createPaycheckTransactions } from "../paycheckTransactionService";
import { budgetDb } from "@/db/budgetDb";

// Mock the database
vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    transactions: {
      put: vi.fn().mockResolvedValue("mock-id"),
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
          count: vi.fn().mockResolvedValue(0),
        }),
      }),
      bulkDelete: vi.fn().mockResolvedValue(undefined),
    },
  },
}));

describe("paycheckTransactionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createPaycheckTransactions", () => {
    it("should create income transaction to unassigned", async () => {
      const paycheckData = {
        paycheckId: "paycheck_123",
        amount: 1000,
        payerName: "Test Employer",
      };

      const result = await createPaycheckTransactions(paycheckData, []);

      // Should have created income transaction
      expect(result.incomeTransaction).toBeDefined();
      expect(result.incomeTransaction.envelopeId).toBe("unassigned");
      expect(result.incomeTransaction.type).toBe("income");
      expect(result.incomeTransaction.amount).toBe(1000);
      expect(result.incomeTransaction.paycheckId).toBe("paycheck_123");
      expect(result.incomeTransaction.isInternalTransfer).toBe(false);

      // Should have saved to database
      expect(budgetDb.transactions.put).toHaveBeenCalledTimes(1);
    });

    it("should create transfer transactions for allocations", async () => {
      const paycheckData = {
        paycheckId: "paycheck_456",
        amount: 1000,
        payerName: "Test Employer",
      };

      const allocations = [
        { envelopeId: "env_1", envelopeName: "Groceries", amount: 300 },
        { envelopeId: "env_2", envelopeName: "Bills", amount: 500 },
      ];

      const result = await createPaycheckTransactions(paycheckData, allocations);

      // Should have income transaction
      expect(result.incomeTransaction).toBeDefined();
      expect(result.incomeTransactionId).toContain("income_paycheck_456");

      // Should have transfer transactions
      expect(result.transferTransactions).toHaveLength(2);
      expect(result.transferTransactionIds).toHaveLength(2);

      // First transfer - Groceries
      const groceriesTransfer = result.transferTransactions.find((t) => t.envelopeId === "env_1");
      expect(groceriesTransfer).toBeDefined();
      expect(groceriesTransfer?.type).toBe("transfer");
      expect(groceriesTransfer?.amount).toBe(-300); // Negative because leaving unassigned
      expect(groceriesTransfer?.isInternalTransfer).toBe(true);
      expect(groceriesTransfer?.fromEnvelopeId).toBe("unassigned");
      expect(groceriesTransfer?.toEnvelopeId).toBe("env_1");
      expect(groceriesTransfer?.paycheckId).toBe("paycheck_456");

      // Second transfer - Bills
      const billsTransfer = result.transferTransactions.find((t) => t.envelopeId === "env_2");
      expect(billsTransfer).toBeDefined();
      expect(billsTransfer?.type).toBe("transfer");
      expect(billsTransfer?.amount).toBe(-500);
      expect(billsTransfer?.isInternalTransfer).toBe(true);

      // Should have saved all transactions to database (1 income + 2 transfers)
      expect(budgetDb.transactions.put).toHaveBeenCalledTimes(3);
    });

    it("should skip allocations with zero or negative amounts", async () => {
      const paycheckData = {
        paycheckId: "paycheck_789",
        amount: 1000,
        payerName: "Test Employer",
      };

      const allocations = [
        { envelopeId: "env_1", envelopeName: "Valid", amount: 300 },
        { envelopeId: "env_2", envelopeName: "Zero", amount: 0 },
        { envelopeId: "env_3", envelopeName: "Negative", amount: -100 },
      ];

      const result = await createPaycheckTransactions(paycheckData, allocations);

      // Should only have one transfer transaction (for the valid allocation)
      expect(result.transferTransactions).toHaveLength(1);
      expect(result.transferTransactions[0].envelopeId).toBe("env_1");

      // Should have saved 2 transactions (1 income + 1 valid transfer)
      expect(budgetDb.transactions.put).toHaveBeenCalledTimes(2);
    });

    it("should handle empty allocations (simple paycheck)", async () => {
      const paycheckData = {
        paycheckId: "paycheck_simple",
        amount: 500,
        payerName: "Side Job",
      };

      const result = await createPaycheckTransactions(paycheckData, []);

      // Should only have income transaction
      expect(result.incomeTransaction).toBeDefined();
      expect(result.transferTransactions).toHaveLength(0);
      expect(result.transferTransactionIds).toHaveLength(0);

      // Should have saved only income transaction
      expect(budgetDb.transactions.put).toHaveBeenCalledTimes(1);
    });

    it("should validate transactions with Zod schema", async () => {
      const paycheckData = {
        paycheckId: "paycheck_valid",
        amount: 1000,
        payerName: "Employer",
      };

      const allocations = [{ envelopeId: "env_1", envelopeName: "Groceries", amount: 300 }];

      const result = await createPaycheckTransactions(paycheckData, allocations);

      // Income transaction should have required fields
      expect(result.incomeTransaction.id).toBeTruthy();
      expect(result.incomeTransaction.date).toBeDefined();
      expect(result.incomeTransaction.category).toBe("Income");
      expect(result.incomeTransaction.lastModified).toBeGreaterThan(0);

      // Transfer transaction should have required fields
      expect(result.transferTransactions[0].id).toBeTruthy();
      expect(result.transferTransactions[0].date).toBeDefined();
      expect(result.transferTransactions[0].category).toBe("Transfer");
    });

    it("should include description with payer name", async () => {
      const paycheckData = {
        paycheckId: "paycheck_desc",
        amount: 2000,
        payerName: "ACME Corp",
      };

      const allocations = [{ envelopeId: "env_rent", envelopeName: "Rent", amount: 1500 }];

      const result = await createPaycheckTransactions(paycheckData, allocations);

      expect(result.incomeTransaction.description).toContain("ACME Corp");
      expect(result.transferTransactions[0].description).toContain("Rent");
    });

    it("should use custom date if provided", async () => {
      const customDate = new Date("2024-01-15");
      const paycheckData = {
        paycheckId: "paycheck_date",
        amount: 1000,
        payerName: "Employer",
        date: customDate,
      };

      const result = await createPaycheckTransactions(paycheckData, []);

      // The date should match or be a string representation
      const transactionDate = new Date(result.incomeTransaction.date);
      expect(transactionDate.toDateString()).toBe(customDate.toDateString());
    });
  });
});
