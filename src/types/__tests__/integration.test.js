import { describe, it, expect } from "vitest";
import {
  validateTransaction,
  validateTransactionBatch,
  FinanceSchemas,
  validateFirebaseTransaction,
  ValidationUtils,
} from "../index.js";

describe("Integration Examples", () => {
  describe("CSV Import Validation", () => {
    it("should handle flexible CSV data formats", () => {
      const csvData = [
        {
          description: "Grocery Store",
          amount: "$-45.67", // With currency symbol and negative
          date: "01/15/2024", // MM/DD/YYYY format
          category: "Food & Dining",
        },
        {
          description: "Salary Deposit",
          amount: "3,500.00", // With comma separator
          date: "2024-01-15T00:00:00.000Z", // ISO format
          category: "Other",
        },
      ];

      const results = [];
      const errors = [];

      csvData.forEach((row, index) => {
        // Use TransactionImport schema for flexible parsing
        const testData = {
          id: `csv_${index}`,
          description: row.description,
          amount: row.amount,
          date: row.date,
          category: row.category,
        };
        
        // Debug: log what we're trying to validate
        console.log('Validating CSV row:', index, testData);
        
        const result = ValidationUtils.safeParse(FinanceSchemas.TransactionImport, testData);
        
        if (result.success) {
          console.log('Success! Result:', result.data);
          results.push(result.data);
        } else {
          console.log('Failed! Errors:', result.formattedErrors);
          errors.push({ row: index, errors: result.formattedErrors });
        }
      });

      expect(errors).toHaveLength(0);
      expect(results).toHaveLength(2);
      expect(results[0].amount).toBe(-45.67);
      expect(results[1].amount).toBe(3500);
    });
  });

  describe("Firebase Data Validation", () => {
    it("should validate Firebase transaction data", () => {
      const firebaseData = {
        id: "firebase_txn_123",
        description: "Coffee Shop",
        amount: -4.50,
        date: "2024-01-15T10:30:00.000Z",
        category: "Food & Dining",
        type: "expense",
        createdBy: "user123",
        createdAt: 1705317000000,
      };

      const result = validateFirebaseTransaction(firebaseData);
      expect(result.success).toBe(true);
      expect(result.data.id).toBe("firebase_txn_123");
      expect(result.data.amount).toBe(-4.5);
    });

    it("should handle readonly Firebase objects", () => {
      // Simulate readonly object from Firebase
      const readonlyData = Object.freeze({
        id: "readonly_txn",
        description: "Test Transaction",
        amount: -25.00,
        date: "2024-01-15",
        category: "Shopping",
      });

      const result = validateFirebaseTransaction(readonlyData);
      expect(result.success).toBe(true);
      // The schema should create a new extensible object
      expect(result.data).not.toBe(readonlyData);
    });
  });

  describe("Form Integration", () => {
    it("should validate partial form data", () => {
      const formData = {
        description: "Grocery shopping",
        amount: "125.50", // String input from form
        category: "Food & Dining",
        // Missing date, should get default
      };

      const result = ValidationUtils.safeParse(FinanceSchemas.TransactionForm, formData);
      expect(result.success).toBe(true);
      expect(result.data.amount).toBe(125.5); // Converted to number
      expect(result.data.type).toBe("expense"); // Default value
    });

    it("should provide user-friendly error messages", () => {
      const invalidFormData = {
        // Missing description
        amount: "", // Empty amount should default to 0, not error
        date: "invalid-date", // This should use current date as fallback
      };

      const result = ValidationUtils.safeParse(FinanceSchemas.TransactionForm, invalidFormData);
      expect(result.success).toBe(false);
      expect(result.formattedErrors).toHaveProperty("description");
      // Amount should not error since empty string becomes 0
    });
  });

  describe("Batch Validation Performance", () => {
    it("should efficiently validate large batches", () => {
      // Create 1000 test transactions
      const transactions = Array.from({ length: 1000 }, (_, i) => ({
        id: `batch_txn_${i}`,
        description: `Transaction ${i}`,
        amount: -Math.random() * 100,
        date: new Date().toISOString(),
        category: "Other",
        type: "expense",
      }));

      const startTime = Date.now();
      const result = validateTransactionBatch(transactions);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(result.validCount).toBe(1000);
      expect(result.errorCount).toBe(0);
      
      // Should complete in reasonable time (under 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe("Schema Defaults and Transformations", () => {
    it("should apply appropriate defaults for envelopes", () => {
      const minimalEnvelope = {
        id: "env_123",
        name: "Test Envelope",
        category: "Food & Dining",
      };

      const result = ValidationUtils.safeParse(FinanceSchemas.Envelope, minimalEnvelope);
      expect(result.success).toBe(true);
      expect(result.data.envelopeType).toBe("variable");
      expect(result.data.monthlyAmount).toBe(0);
      expect(result.data.currentBalance).toBe(0);
      expect(result.data.color).toBe("#a855f7");
      expect(result.data.autoAllocate).toBe(true);
      expect(result.data.archived).toBe(false);
    });

    it("should transform string amounts to numbers", () => {
      const transaction = {
        id: "txn_transform",
        description: "Amount transformation test",
        amount: "456.78",
        date: "2024-01-15",
        category: "Other",
      };

      const result = validateTransaction(transaction);
      expect(result.success).toBe(true);
      expect(typeof result.data.amount).toBe("number");
      expect(result.data.amount).toBe(456.78);
    });

    it("should handle date transformations", () => {
      const formats = [
        "2024-01-15",
        "2024-01-15T10:30:00.000Z",
        new Date("2024-01-15"),
      ];

      formats.forEach(dateFormat => {
        const transaction = {
          id: "txn_date_test",
          description: "Date test",
          amount: -50,
          date: dateFormat,
          category: "Other",
        };

        const result = validateTransaction(transaction);
        expect(result.success).toBe(true);
        expect(typeof result.data.date).toBe("string");
        expect(result.data.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
      });
    });
  });

  describe("Error Recovery Patterns", () => {
    it("should handle mixed valid/invalid data gracefully", () => {
      const mixedData = [
        {
          id: "valid_1",
          description: "Valid transaction",
          amount: -25.00,
          date: "2024-01-15",
          category: "Food & Dining",
        },
        {
          id: "invalid_1",
          // Missing description
          amount: "invalid",
          date: "2024-01-15",
        },
        {
          id: "valid_2",
          description: "Another valid transaction",
          amount: -30.00,
          date: "2024-01-16",
          category: "Shopping",
        },
      ];

      const result = validateTransactionBatch(mixedData);
      expect(result.success).toBe(false); // Because there are errors
      expect(result.validCount).toBe(2);
      expect(result.errorCount).toBe(1);
      expect(result.validData).toHaveLength(2);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].index).toBe(1); // Middle item failed
    });
  });
});