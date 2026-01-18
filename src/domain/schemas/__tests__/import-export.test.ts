import { describe, it, expect } from "vitest";
import {
  ExportMetadataSchema,
  ImportedDataSchema,
  validateImportedDataStructure,
  validateImportedDataStructureSafe,
  validateEnvelopes,
  validateTransactions,
  formatValidationErrors,
} from "../import-export";

describe("import-export schemas", () => {
  describe("ExportMetadataSchema", () => {
    it("should validate complete export metadata", () => {
      const metadata = {
        exportedBy: "TestUser",
        exportDate: "2024-01-01T00:00:00.000Z",
        appVersion: "2.0.0",
        dataVersion: "2.0",
        budgetId: "budget-123",
      };

      const result = ExportMetadataSchema.safeParse(metadata);
      expect(result.success).toBe(true);
    });
  });

  describe("ImportedDataSchema", () => {
    it("should validate complete import data structure", () => {
      const importData = {
        envelopes: [
          {
            id: "env-1",
            name: "Groceries",
            category: "Food",
            type: "standard",
            lastModified: Date.now(),
          },
        ],
        transactions: [
          {
            id: "txn-1",
            date: "2024-01-10",
            amount: -50,
            envelopeId: "env-1",
            category: "Food",
            type: "expense",
            lastModified: Date.now(),
          },
        ],
        exportMetadata: {
          appVersion: "2.0.0",
          budgetId: "budget-123",
        },
      };

      const result = ImportedDataSchema.safeParse(importData);
      expect(result.success).toBe(true);
    });
  });

  describe("validateEnvelopes", () => {
    it("should return valid envelopes", () => {
      const envelopes = [
        {
          id: "env-1",
          name: "Test",
          category: "Test",
          type: "standard",
          archived: false,
          lastModified: Date.now(),
        },
      ];

      const result = validateEnvelopes(envelopes);
      expect(result.valid).toHaveLength(1);
      expect(result.invalid).toHaveLength(0);
    });

    it("should identify invalid envelopes", () => {
      const envelopes = [
        { id: "", name: "Test", category: "Test", archived: false, lastModified: Date.now() }, // Missing type and empty id
      ];

      const result = validateEnvelopes(envelopes);
      expect(result.valid).toHaveLength(0);
      expect(result.invalid).toHaveLength(1);
    });
  });

  describe("validateTransactions", () => {
    it("should return valid transactions", () => {
      const transactions = [
        {
          id: "txn-1",
          date: "2024-01-15",
          amount: -50,
          envelopeId: "env-1",
          category: "Test",
          type: "expense",
          lastModified: Date.now(),
        },
      ];

      const result = validateTransactions(transactions);
      expect(result.valid).toHaveLength(1);
      expect(result.invalid).toHaveLength(0);
    });
  });

  describe("formatValidationErrors", () => {
    it("should format envelope errors", () => {
      const envelopeErrors = [
        {
          index: 0,
          data: { name: "Test Envelope" },
          errors: ["id: Required"],
        },
      ];

      const result = formatValidationErrors(envelopeErrors, []);
      expect(result).toContain("1 envelope(s) have validation errors:");
    });
  });
});
