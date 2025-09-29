import { describe, it, expect } from "vitest";
import {
  TransactionSchema,
  EnvelopeSchema,
  BudgetSchema,
  DebtAccountSchema,
  BillSchema,
  FinanceSchemas,
  validateTransaction,
  validateEnvelope,
  validateBill,
  validateDebtAccount,
  validateTransactionBatch,
} from "../index.js";

describe("Finance Domain Schemas", () => {
  describe("TransactionSchema", () => {
    it("should validate a basic transaction", () => {
      const transaction = {
        id: "txn_123",
        description: "Grocery shopping", 
        amount: -50.25,
        date: "2024-01-15T00:00:00.000Z",
        category: "Food & Dining",
        type: "expense",
      };

      const result = validateTransaction(transaction);
      expect(result.success).toBe(true);
      expect(result.data.id).toBe("txn_123");
      expect(result.data.amount).toBe(-50.25);
      expect(result.data.type).toBe("expense");
    });

    it("should handle string amounts and convert to numbers", () => {
      const transaction = {
        id: "txn_124",
        description: "Salary",
        amount: "3000.50",
        date: "2024-01-15",
        category: "Other",
        type: "income",
      };

      const result = validateTransaction(transaction);
      expect(result.success).toBe(true);
      expect(result.data.amount).toBe(3000.5);
      expect(typeof result.data.amount).toBe("number");
    });

    it("should fail validation for missing required fields", () => {
      const transaction = {
        id: "txn_125",
        // Missing description
        amount: 100,
        date: "2024-01-15",
      };

      const result = validateTransaction(transaction);
      expect(result.success).toBe(false);
      expect(result.formattedErrors).toHaveProperty("description");
    });
  });

  describe("EnvelopeSchema", () => {
    it("should validate a basic envelope", () => {
      const envelope = {
        id: "env_123",
        name: "Groceries",
        category: "Food & Dining",
        envelopeType: "variable",
        monthlyAmount: 400,
        currentBalance: 125.50,
      };

      const result = validateEnvelope(envelope);
      expect(result.success).toBe(true);
      expect(result.data.name).toBe("Groceries");
      expect(result.data.monthlyAmount).toBe(400);
      expect(result.data.currentBalance).toBe(125.5);
    });

    it("should apply default values", () => {
      const envelope = {
        id: "env_124",
        name: "Emergency Fund",
        category: "Emergency",
      };

      const result = validateEnvelope(envelope);
      expect(result.success).toBe(true);
      expect(result.data.envelopeType).toBe("variable");
      expect(result.data.monthlyAmount).toBe(0);
      expect(result.data.currentBalance).toBe(0);
      expect(result.data.color).toBe("#a855f7");
      expect(result.data.autoAllocate).toBe(true);
    });
  });

  describe("BillSchema", () => {
    it("should validate a basic bill", () => {
      const bill = {
        id: "bill_123",
        name: "Electric Bill",
        category: "Bills & Utilities",
        amount: 125.50,
        frequency: "monthly",
        dueDate: "2024-01-15T00:00:00.000Z",
      };

      const result = validateBill(bill);
      expect(result.success).toBe(true);
      expect(result.data.name).toBe("Electric Bill");
      expect(result.data.amount).toBe(125.5);
      expect(result.data.frequency).toBe("monthly");
    });
  });

  describe("DebtAccountSchema", () => {
    it("should validate a basic debt account", () => {
      const debt = {
        id: "debt_123",
        name: "Credit Card",
        creditor: "Bank of Example",
        type: "credit_card",
        currentBalance: 1500.75,
        minimumPayment: 45.00,
        interestRate: 18.5,
      };

      const result = validateDebtAccount(debt);
      expect(result.success).toBe(true);
      expect(result.data.name).toBe("Credit Card");
      expect(result.data.currentBalance).toBe(1500.75);
      expect(result.data.interestRate).toBe(18.5);
    });
  });
});
