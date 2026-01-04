/**
 * Fixtures Tests
 * Tests for predefined test fixtures
 */

import { describe, it, expect } from "vitest";
import {
  standardEnvelopes,
  standardBills,
  sampleTransactions,
  sampleSavingsGoals,
  emptyBudgetState,
  fullBudgetState,
  generateLargeDataset,
  newUserScenario,
  activeUserScenario,
  overBudgetScenario,
} from "../fixtures";
import {
  validateEnvelope,
  validateBill,
  validateTransaction,
  validateSavingsGoal,
} from "@/domain/schemas";

describe("Test Fixtures", () => {
  describe("standardEnvelopes", () => {
    it("should have valid envelopes", () => {
      expect(standardEnvelopes).toHaveLength(5);

      standardEnvelopes.forEach((envelope) => {
        expect(() => validateEnvelope(envelope)).not.toThrow();
      });
    });

    it("should include common budget categories", () => {
      const categories = standardEnvelopes.map((e) => e.category);

      expect(categories).toContain("groceries");
      expect(categories).toContain("transportation");
      expect(categories).toContain("entertainment");
      expect(categories).toContain("utilities");
      expect(categories).toContain("healthcare");
    });
  });

  describe("standardBills", () => {
    it("should have valid bills", () => {
      expect(standardBills.length).toBeGreaterThan(0);

      standardBills.forEach((bill) => {
        expect(() => validateBill(bill)).not.toThrow();
      });
    });

    it("should include recurring bills", () => {
      const recurringBills = standardBills.filter((b) => b.isRecurring);

      expect(recurringBills.length).toBeGreaterThan(0);
    });

    it("should have reasonable amounts", () => {
      standardBills.forEach((bill) => {
        expect(bill.amount).toBeGreaterThan(0);
        expect(bill.amount).toBeLessThan(500);
      });
    });
  });

  describe("sampleTransactions", () => {
    it("should have valid transactions", () => {
      expect(sampleTransactions.length).toBeGreaterThan(0);

      sampleTransactions.forEach((transaction) => {
        expect(() => validateTransaction(transaction)).not.toThrow();
      });
    });

    it("should include different transaction types", () => {
      const types = sampleTransactions.map((t) => t.type);

      expect(types).toContain("income");
      expect(types).toContain("expense");
    });

    it("should have correct amount signs based on type", () => {
      sampleTransactions.forEach((transaction) => {
        if (transaction.type === "expense") {
          expect(transaction.amount).toBeLessThan(0);
        } else if (transaction.type === "income") {
          expect(transaction.amount).toBeGreaterThan(0);
        }
        // transfer can be either positive or negative
      });
    });
  });

  describe("sampleSavingsGoals", () => {
    it("should have valid savings goals", () => {
      expect(sampleSavingsGoals.length).toBeGreaterThan(0);

      sampleSavingsGoals.forEach((goal) => {
        expect(() => validateSavingsGoal(goal)).not.toThrow();
      });
    });

    it("should include completed and active goals", () => {
      const hasCompleted = sampleSavingsGoals.some((g) => g.isCompleted);
      const hasActive = sampleSavingsGoals.some((g) => !g.isCompleted);

      expect(hasCompleted).toBe(true);
      expect(hasActive).toBe(true);
    });

    it("should have valid progress tracking", () => {
      sampleSavingsGoals.forEach((goal) => {
        expect(goal.currentAmount).toBeLessThanOrEqual(goal.targetAmount);
        expect(goal.currentAmount).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe("emptyBudgetState", () => {
    it("should have empty arrays", () => {
      expect(emptyBudgetState.envelopes).toEqual([]);
      expect(emptyBudgetState.bills).toEqual([]);
      expect(emptyBudgetState.transactions).toEqual([]);
      expect(emptyBudgetState.savingsGoals).toEqual([]);
    });

    it("should have zero unassigned cash", () => {
      expect(emptyBudgetState.unassignedCash).toBe(0);
    });
  });

  describe("fullBudgetState", () => {
    it("should have all data populated", () => {
      expect(fullBudgetState.envelopes.length).toBeGreaterThan(0);
      expect(fullBudgetState.bills.length).toBeGreaterThan(0);
      expect(fullBudgetState.transactions.length).toBeGreaterThan(0);
      expect(fullBudgetState.savingsGoals.length).toBeGreaterThan(0);
    });

    it("should have positive unassigned cash", () => {
      expect(fullBudgetState.unassignedCash).toBeGreaterThan(0);
    });

    it("should contain valid entities", () => {
      fullBudgetState.envelopes.forEach((e) => {
        expect(() => validateEnvelope(e)).not.toThrow();
      });

      fullBudgetState.bills.forEach((b) => {
        expect(() => validateBill(b)).not.toThrow();
      });

      fullBudgetState.transactions.forEach((t) => {
        expect(() => validateTransaction(t)).not.toThrow();
      });

      fullBudgetState.savingsGoals.forEach((g) => {
        expect(() => validateSavingsGoal(g)).not.toThrow();
      });
    });
  });

  describe("generateLargeDataset", () => {
    it("should generate specified number of entities", () => {
      const dataset = generateLargeDataset({
        envelopes: 10,
        bills: 20,
        transactions: 50,
        savingsGoals: 5,
      });

      expect(dataset.envelopes).toHaveLength(10);
      expect(dataset.bills).toHaveLength(20);
      expect(dataset.transactions).toHaveLength(50);
      expect(dataset.savingsGoals).toHaveLength(5);
    });

    it("should generate valid entities", () => {
      const dataset = generateLargeDataset({
        envelopes: 5,
        bills: 5,
      });

      dataset.envelopes.forEach((e) => {
        expect(() => validateEnvelope(e)).not.toThrow();
      });

      dataset.bills.forEach((b) => {
        expect(() => validateBill(b)).not.toThrow();
      });
    });

    it("should handle zero count", () => {
      const dataset = generateLargeDataset({});

      expect(dataset.envelopes).toHaveLength(0);
      expect(dataset.bills).toHaveLength(0);
      expect(dataset.transactions).toHaveLength(0);
      expect(dataset.savingsGoals).toHaveLength(0);
    });
  });

  describe("Budget Scenarios", () => {
    describe("newUserScenario", () => {
      it("should have minimal data", () => {
        expect(newUserScenario.envelopes.length).toBeLessThanOrEqual(5);
        expect(newUserScenario.bills).toEqual([]);
        expect(newUserScenario.transactions).toEqual([]);
        expect(newUserScenario.savingsGoals).toEqual([]);
      });

      it("should have zero unassigned cash", () => {
        expect(newUserScenario.unassignedCash).toBe(0);
      });

      it("should have valid envelopes", () => {
        newUserScenario.envelopes.forEach((e) => {
          expect(() => validateEnvelope(e)).not.toThrow();
        });
      });
    });

    describe("activeUserScenario", () => {
      it("should have active data", () => {
        expect(activeUserScenario.envelopes.length).toBeGreaterThan(0);
        expect(activeUserScenario.bills.length).toBeGreaterThan(0);
        expect(activeUserScenario.transactions.length).toBeGreaterThan(0);
      });

      it("should have positive unassigned cash", () => {
        expect(activeUserScenario.unassignedCash).toBeGreaterThan(0);
      });

      it("should only have active savings goals", () => {
        const completedGoals = activeUserScenario.savingsGoals.filter((g) => g.isCompleted);
        expect(completedGoals).toHaveLength(0);
      });
    });

    describe("overBudgetScenario", () => {
      it("should have negative balances", () => {
        const negativeEnvelopes = overBudgetScenario.envelopes.filter(
          (e) => (e.currentBalance || 0) < 0
        );
        expect(negativeEnvelopes.length).toBeGreaterThan(0);
      });

      it("should have negative unassigned cash", () => {
        expect(overBudgetScenario.unassignedCash).toBeLessThan(0);
      });

      it("should have unpaid bills", () => {
        const unpaidBills = overBudgetScenario.bills.filter((b) => !b.isPaid);
        expect(unpaidBills.length).toBeGreaterThan(0);
      });
    });
  });
});
