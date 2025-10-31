/**
 * Domain Factories Tests
 * Tests for domain model factory functions
 */

import { describe, it, expect } from "vitest";
import {
  createEnvelope,
  createEnvelopePartial,
  createBill,
  createRecurringBill,
  createBillPartial,
  createTransaction,
  createIncomeTransaction,
  createTransferTransaction,
  createTransactionPartial,
  createSavingsGoal,
  createCompletedSavingsGoal,
  createSavingsGoalPartial,
  createEnvelopes,
  createBills,
  createTransactions,
  createSavingsGoals,
} from "../domainFactories";
import {
  validateEnvelope,
  validateBill,
  validateTransaction,
  validateSavingsGoal,
} from "@/domain/schemas";

describe("Domain Factories", () => {
  describe("createEnvelope", () => {
    it("should create a valid envelope with defaults", () => {
      const envelope = createEnvelope();

      expect(() => validateEnvelope(envelope)).not.toThrow();
      expect(envelope.id).toBeDefined();
      expect(envelope.name).toBeDefined();
      expect(envelope.category).toBeDefined();
      expect(envelope.archived).toBe(false);
      expect(envelope.lastModified).toBeGreaterThan(0);
    });

    it("should create envelope with custom properties", () => {
      const envelope = createEnvelope({
        name: "Custom Envelope",
        category: "custom-category",
        currentBalance: 1000,
      });

      expect(envelope.name).toBe("Custom Envelope");
      expect(envelope.category).toBe("custom-category");
      expect(envelope.currentBalance).toBe(1000);
    });

    it("should create envelope that passes schema validation", () => {
      const envelope = createEnvelope();
      const result = validateEnvelope(envelope);

      expect(result).toEqual(envelope);
    });
  });

  describe("createEnvelopePartial", () => {
    it("should create partial envelope with defaults", () => {
      const partial = createEnvelopePartial();

      expect(partial.name).toBeDefined();
    });

    it("should create partial envelope with overrides", () => {
      const partial = createEnvelopePartial({ currentBalance: 500 });

      expect(partial.currentBalance).toBe(500);
    });
  });

  describe("createBill", () => {
    it("should create a valid bill with defaults", () => {
      const bill = createBill();

      expect(() => validateBill(bill)).not.toThrow();
      expect(bill.id).toBeDefined();
      expect(bill.name).toBeDefined();
      expect(bill.amount).toBeGreaterThan(0);
      expect(bill.isPaid).toBe(false);
      expect(bill.isRecurring).toBe(false);
    });

    it("should create bill with custom properties", () => {
      const bill = createBill({
        name: "Electric Bill",
        amount: 150,
        isPaid: true,
      });

      expect(bill.name).toBe("Electric Bill");
      expect(bill.amount).toBe(150);
      expect(bill.isPaid).toBe(true);
    });

    it("should create bill that passes schema validation", () => {
      const bill = createBill();
      const result = validateBill(bill);

      expect(result).toEqual(bill);
    });
  });

  describe("createRecurringBill", () => {
    it("should create recurring bill", () => {
      const bill = createRecurringBill();

      expect(bill.isRecurring).toBe(true);
      expect(bill.frequency).toBeDefined();
      expect(["monthly", "quarterly", "annually"]).toContain(bill.frequency);
    });

    it("should create recurring bill with custom frequency", () => {
      const bill = createRecurringBill({ frequency: "monthly" });

      expect(bill.isRecurring).toBe(true);
      expect(bill.frequency).toBe("monthly");
    });
  });

  describe("createBillPartial", () => {
    it("should create partial bill with defaults", () => {
      const partial = createBillPartial();

      expect(partial.name).toBeDefined();
    });

    it("should create partial bill with overrides", () => {
      const partial = createBillPartial({ amount: 200 });

      expect(partial.amount).toBe(200);
    });
  });

  describe("createTransaction", () => {
    it("should create a valid transaction with defaults", () => {
      const transaction = createTransaction();

      expect(() => validateTransaction(transaction)).not.toThrow();
      expect(transaction.id).toBeDefined();
      expect(transaction.amount).toBeGreaterThan(0);
      expect(transaction.type).toBe("expense");
    });

    it("should create transaction with custom properties", () => {
      const transaction = createTransaction({
        amount: 75,
        type: "income",
        merchant: "Custom Merchant",
      });

      expect(transaction.amount).toBe(75);
      expect(transaction.type).toBe("income");
      expect(transaction.merchant).toBe("Custom Merchant");
    });

    it("should create transaction that passes schema validation", () => {
      const transaction = createTransaction();
      const result = validateTransaction(transaction);

      expect(result).toEqual(transaction);
    });
  });

  describe("createIncomeTransaction", () => {
    it("should create income transaction", () => {
      const transaction = createIncomeTransaction();

      expect(transaction.type).toBe("income");
      expect(transaction.category).toBe("income");
    });
  });

  describe("createTransferTransaction", () => {
    it("should create transfer transaction", () => {
      const transaction = createTransferTransaction();

      expect(transaction.type).toBe("transfer");
      expect(transaction.category).toBe("transfer");
    });
  });

  describe("createTransactionPartial", () => {
    it("should create partial transaction with defaults", () => {
      const partial = createTransactionPartial();

      expect(partial.description).toBeDefined();
    });

    it("should create partial transaction with overrides", () => {
      const partial = createTransactionPartial({ amount: 100 });

      expect(partial.amount).toBe(100);
    });
  });

  describe("createSavingsGoal", () => {
    it("should create a valid savings goal with defaults", () => {
      const goal = createSavingsGoal();

      expect(() => validateSavingsGoal(goal)).not.toThrow();
      expect(goal.id).toBeDefined();
      expect(goal.name).toBeDefined();
      expect(goal.targetAmount).toBeGreaterThan(0);
      expect(goal.currentAmount).toBeGreaterThanOrEqual(0);
      expect(goal.isCompleted).toBe(false);
    });

    it("should create savings goal with custom properties", () => {
      const goal = createSavingsGoal({
        name: "Vacation Fund",
        targetAmount: 5000,
        priority: "high",
      });

      expect(goal.name).toBe("Vacation Fund");
      expect(goal.targetAmount).toBe(5000);
      expect(goal.priority).toBe("high");
    });

    it("should create savings goal that passes schema validation", () => {
      const goal = createSavingsGoal();
      const result = validateSavingsGoal(goal);

      expect(result).toEqual(goal);
    });

    it("should create goal where current amount is less than target", () => {
      const goal = createSavingsGoal();

      expect(goal.currentAmount).toBeLessThanOrEqual(goal.targetAmount);
    });
  });

  describe("createCompletedSavingsGoal", () => {
    it("should create completed savings goal", () => {
      const goal = createCompletedSavingsGoal();

      expect(goal.isCompleted).toBe(true);
      expect(goal.currentAmount).toBe(goal.targetAmount);
    });
  });

  describe("createSavingsGoalPartial", () => {
    it("should create partial savings goal with defaults", () => {
      const partial = createSavingsGoalPartial();

      expect(partial.name).toBeDefined();
    });

    it("should create partial savings goal with overrides", () => {
      const partial = createSavingsGoalPartial({ targetAmount: 3000 });

      expect(partial.targetAmount).toBe(3000);
    });
  });

  describe("Batch Factories", () => {
    describe("createEnvelopes", () => {
      it("should create multiple envelopes", () => {
        const envelopes = createEnvelopes(5);

        expect(envelopes).toHaveLength(5);
        envelopes.forEach((envelope) => {
          expect(() => validateEnvelope(envelope)).not.toThrow();
        });
      });

      it("should create envelopes with overrides", () => {
        const envelopes = createEnvelopes(3, { category: "test-category" });

        expect(envelopes).toHaveLength(3);
        envelopes.forEach((envelope) => {
          expect(envelope.category).toBe("test-category");
        });
      });
    });

    describe("createBills", () => {
      it("should create multiple bills", () => {
        const bills = createBills(4);

        expect(bills).toHaveLength(4);
        bills.forEach((bill) => {
          expect(() => validateBill(bill)).not.toThrow();
        });
      });
    });

    describe("createTransactions", () => {
      it("should create multiple transactions", () => {
        const transactions = createTransactions(6);

        expect(transactions).toHaveLength(6);
        transactions.forEach((transaction) => {
          expect(() => validateTransaction(transaction)).not.toThrow();
        });
      });
    });

    describe("createSavingsGoals", () => {
      it("should create multiple savings goals", () => {
        const goals = createSavingsGoals(3);

        expect(goals).toHaveLength(3);
        goals.forEach((goal) => {
          expect(() => validateSavingsGoal(goal)).not.toThrow();
        });
      });
    });
  });
});
