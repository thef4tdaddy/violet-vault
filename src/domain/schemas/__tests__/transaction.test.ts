/**
 * Transaction Schema Tests
 */

import { describe, it, expect } from "vitest";
import {
  TransactionSchema,
  validateTransaction,
  validateAndNormalizeTransaction,
} from "../transaction";

describe("Transaction Schema Tests", () => {
  const now = Date.now();

  it("should validate a valid expense transaction", () => {
    const validExpense = {
      id: "txn-1",
      date: new Date(),
      amount: -50,
      envelopeId: "env-1",
      category: "Food",
      type: "expense",
      lastModified: now,
      description: "Lunch",
    };

    const result = TransactionSchema.safeParse(validExpense);
    expect(result.success).toBe(true);
  });

  it("should validate a valid income transaction", () => {
    const validIncome = {
      id: "txn-2",
      date: new Date(),
      amount: 2000,
      envelopeId: "unassigned",
      category: "Income",
      type: "income",
      lastModified: now,
    };

    const result = TransactionSchema.safeParse(validIncome);
    expect(result.success).toBe(true);
  });

  it("should validate a valid transfer transaction", () => {
    const validTransfer = {
      id: "txn-3",
      date: new Date(),
      amount: -500,
      envelopeId: "env-target",
      category: "Transfer",
      type: "transfer",
      lastModified: now,
      isInternalTransfer: true,
      fromEnvelopeId: "env-source",
      toEnvelopeId: "env-target",
    };

    const result = TransactionSchema.safeParse(validTransfer);
    expect(result.success).toBe(true);
  });

  it("should reject expense with positive amount", () => {
    const invalidExpense = {
      id: "txn-4",
      date: new Date(),
      amount: 100, // Positive for expense
      envelopeId: "env-1",
      category: "Food",
      type: "expense",
      lastModified: now,
    };

    const result = TransactionSchema.safeParse(invalidExpense);
    expect(result.success).toBe(false);
  });

  it("should normalize transaction amounts", () => {
    const expenseWithWrongSign = {
      id: "txn-5",
      date: new Date(),
      amount: 100, // Should be -100
      envelopeId: "env-1",
      category: "Food",
      type: "expense",
      lastModified: now,
    };

    const normalized = validateAndNormalizeTransaction(expenseWithWrongSign);
    expect(normalized.amount).toBe(-100);
  });

  it("should validate scheduled transactions", () => {
    const scheduledTx = {
      id: "txn-6",
      date: new Date(),
      amount: -1200,
      envelopeId: "env-rent",
      category: "Housing",
      type: "expense",
      lastModified: now,
      isScheduled: true,
      recurrenceRule: "FREQ=MONTHLY;BYMONTHDAY=1",
    };

    const result = TransactionSchema.safeParse(scheduledTx);
    expect(result.success).toBe(true);
  });

  it("should validate transactions with allocations", () => {
    const paycheckTx = {
      id: "txn-7",
      date: new Date(),
      amount: 3000,
      envelopeId: "unassigned",
      category: "Income",
      type: "income",
      lastModified: now,
      allocations: {
        "env-rent": 1200,
        "env-food": 600,
      },
    };

    const result = TransactionSchema.safeParse(paycheckTx);
    expect(result.success).toBe(true);
  });
});
