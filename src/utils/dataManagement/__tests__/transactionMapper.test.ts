/**
 * Tests for Transaction Mapper utility
 */

import { describe, it, expect } from "vitest";
import { mapRowsToTransactions, validateTransaction } from "../transactionMapper";
import type { ParsedCSVRow } from "../csvParser";

describe("transactionMapper", () => {
  describe("mapRowsToTransactions", () => {
    it("should map valid CSV rows to transactions", () => {
      const rows: ParsedCSVRow[] = [
        { date: "2024-01-01", amount: "100.00", description: "Grocery Store" },
        { date: "2024-01-02", amount: "-50.00", description: "Gas Station" },
      ];

      const mapping = {
        date: "date",
        amount: "amount",
        description: "description",
      };

      const result = mapRowsToTransactions(rows, mapping);

      expect(result.transactions).toHaveLength(2);
      expect(result.invalid).toHaveLength(0);

      expect(result.transactions[0]).toMatchObject({
        amount: 100.0,
        type: "income",
        description: "Grocery Store",
      });

      expect(result.transactions[1]).toMatchObject({
        amount: 50.0,
        type: "expense",
        description: "Gas Station",
      });
    });

    it("should handle ISO date format (YYYY-MM-DD)", () => {
      const rows: ParsedCSVRow[] = [{ date: "2024-01-15", amount: "100.00", description: "Store" }];

      const mapping = { date: "date", amount: "amount", description: "description" };
      const result = mapRowsToTransactions(rows, mapping);

      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0].date).toBeInstanceOf(Date);
    });

    it("should handle US date format (MM/DD/YYYY)", () => {
      const rows: ParsedCSVRow[] = [{ date: "01/15/2024", amount: "100.00", description: "Store" }];

      const mapping = { date: "date", amount: "amount", description: "description" };
      const result = mapRowsToTransactions(rows, mapping);

      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0].date).toBeInstanceOf(Date);
    });

    it("should handle amounts with currency symbols", () => {
      const rows: ParsedCSVRow[] = [
        { date: "2024-01-01", amount: "$100.00", description: "Store" },
        { date: "2024-01-02", amount: "€50.00", description: "Shop" },
        { date: "2024-01-03", amount: "£25.00", description: "Market" },
      ];

      const mapping = { date: "date", amount: "amount", description: "description" };
      const result = mapRowsToTransactions(rows, mapping);

      expect(result.transactions).toHaveLength(3);
      expect(result.transactions[0].amount).toBe(100.0);
      expect(result.transactions[1].amount).toBe(50.0);
      expect(result.transactions[2].amount).toBe(25.0);
    });

    it("should handle amounts with commas", () => {
      const rows: ParsedCSVRow[] = [
        { date: "2024-01-01", amount: "1,000.00", description: "Store" },
      ];

      const mapping = { date: "date", amount: "amount", description: "description" };
      const result = mapRowsToTransactions(rows, mapping);

      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0].amount).toBe(1000.0);
    });

    it("should handle negative amounts in parentheses", () => {
      const rows: ParsedCSVRow[] = [
        { date: "2024-01-01", amount: "(100.00)", description: "Store" },
      ];

      const mapping = { date: "date", amount: "amount", description: "description" };
      const result = mapRowsToTransactions(rows, mapping);

      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0].amount).toBe(100.0);
      expect(result.transactions[0].type).toBe("expense");
    });

    it("should include optional fields when provided", () => {
      const rows: ParsedCSVRow[] = [
        {
          date: "2024-01-01",
          amount: "100.00",
          description: "Store",
          category: "groceries",
          merchant: "Whole Foods",
          notes: "Weekly shopping",
        },
      ];

      const mapping = {
        date: "date",
        amount: "amount",
        description: "description",
        category: "category",
        merchant: "merchant",
        notes: "notes",
      };

      const result = mapRowsToTransactions(rows, mapping);

      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0]).toMatchObject({
        category: "groceries",
        merchant: "Whole Foods",
        notes: "Weekly shopping",
      });
    });

    it("should report invalid rows with missing date", () => {
      const rows: ParsedCSVRow[] = [
        { date: "", amount: "100.00", description: "Store" },
        { date: "2024-01-01", amount: "50.00", description: "Gas" },
      ];

      const mapping = { date: "date", amount: "amount", description: "description" };
      const result = mapRowsToTransactions(rows, mapping);

      expect(result.transactions).toHaveLength(1);
      expect(result.invalid).toHaveLength(1);
      expect(result.invalid[0].errors).toContain("Missing date");
    });

    it("should report invalid rows with missing amount", () => {
      const rows: ParsedCSVRow[] = [
        { date: "2024-01-01", amount: "", description: "Store" },
      ];

      const mapping = { date: "date", amount: "amount", description: "description" };
      const result = mapRowsToTransactions(rows, mapping);

      expect(result.transactions).toHaveLength(0);
      expect(result.invalid).toHaveLength(1);
      expect(result.invalid[0].errors).toContain("Missing amount");
    });

    it("should report invalid rows with invalid date format", () => {
      const rows: ParsedCSVRow[] = [
        { date: "invalid-date", amount: "100.00", description: "Store" },
      ];

      const mapping = { date: "date", amount: "amount", description: "description" };
      const result = mapRowsToTransactions(rows, mapping);

      expect(result.transactions).toHaveLength(0);
      expect(result.invalid).toHaveLength(1);
      expect(result.invalid[0].errors).toContain("Invalid date format");
    });

    it("should report invalid rows with invalid amount format", () => {
      const rows: ParsedCSVRow[] = [
        { date: "2024-01-01", amount: "not-a-number", description: "Store" },
      ];

      const mapping = { date: "date", amount: "amount", description: "description" };
      const result = mapRowsToTransactions(rows, mapping);

      expect(result.transactions).toHaveLength(0);
      expect(result.invalid).toHaveLength(1);
      expect(result.invalid[0].errors).toContain("Invalid amount format");
    });

    it("should use merchant as description fallback", () => {
      const rows: ParsedCSVRow[] = [
        { date: "2024-01-01", amount: "100.00", description: "", merchant: "Target" },
      ];

      const mapping = {
        date: "date",
        amount: "amount",
        description: "description",
        merchant: "merchant",
      };

      const result = mapRowsToTransactions(rows, mapping);

      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0].description).toBe("Target");
    });

    it("should default to uncategorized category", () => {
      const rows: ParsedCSVRow[] = [
        { date: "2024-01-01", amount: "100.00", description: "Store" },
      ];

      const mapping = { date: "date", amount: "amount", description: "description" };
      const result = mapRowsToTransactions(rows, mapping);

      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0].category).toBe("uncategorized");
    });
  });

  describe("validateTransaction", () => {
    it("should validate correct transaction", () => {
      const transaction = {
        id: "123",
        date: new Date("2024-01-01"),
        amount: 100.0,
        type: "expense",
        description: "Store",
        envelopeId: "env-1",
        createdAt: Date.now(),
        lastModified: Date.now(),
      };

      const errors = validateTransaction(transaction);

      expect(errors).toHaveLength(0);
    });

    it("should detect missing ID", () => {
      const transaction = {
        id: "",
        date: new Date("2024-01-01"),
        amount: 100.0,
        type: "expense",
        description: "Store",
        envelopeId: "env-1",
        createdAt: Date.now(),
        lastModified: Date.now(),
      };

      const errors = validateTransaction(transaction);

      expect(errors).toContain("Missing transaction ID");
    });

    it("should detect invalid date", () => {
      const transaction = {
        id: "123",
        date: new Date("invalid"),
        amount: 100.0,
        type: "expense",
        description: "Store",
        envelopeId: "env-1",
        createdAt: Date.now(),
        lastModified: Date.now(),
      };

      const errors = validateTransaction(transaction);

      expect(errors).toContain("Invalid date");
    });

    it("should detect invalid amount", () => {
      const transaction = {
        id: "123",
        date: new Date("2024-01-01"),
        amount: NaN,
        type: "expense",
        description: "Store",
        envelopeId: "env-1",
        createdAt: Date.now(),
        lastModified: Date.now(),
      };

      const errors = validateTransaction(transaction);

      expect(errors).toContain("Invalid amount");
    });

    it("should detect invalid transaction type", () => {
      const transaction = {
        id: "123",
        date: new Date("2024-01-01"),
        amount: 100.0,
        type: "invalid",
        description: "Store",
        envelopeId: "env-1",
        createdAt: Date.now(),
        lastModified: Date.now(),
      };

      const errors = validateTransaction(transaction);

      expect(errors).toContain("Invalid transaction type");
    });
  });
});
