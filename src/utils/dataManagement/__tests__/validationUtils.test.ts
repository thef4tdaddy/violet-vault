import { validateImportedData, type ValidationResult } from "../validationUtils";

describe("validationUtils", () => {
  describe("validateImportedData", () => {
    const currentUser = { budgetId: "123" };

    it("should throw an error for invalid JSON", () => {
      expect(() => validateImportedData(null, currentUser)).toThrow(
        "Invalid backup file: not a valid JSON object."
      );
    });

    it("should throw an error for missing envelopes data", () => {
      const importedData = { bills: [] };
      expect(() => validateImportedData(importedData, currentUser)).toThrow(
        "Invalid backup file: missing or invalid envelopes data."
      );
    });

    it("should return validated data for a valid import file", () => {
      const importedData = {
        envelopes: [],
        bills: [],
        transactions: [],
        exportMetadata: { budgetId: "123" },
      };
      const result = validateImportedData(importedData, currentUser);
      expect(result.validatedData).toBeDefined();
      expect(result.hasBudgetIdMismatch).toBe(false);
      expect(result.validationWarnings).toBeDefined();
      expect(result.itemValidation).toBeDefined();
    });

    it("should detect a budgetId mismatch", () => {
      const importedData = {
        envelopes: [],
        exportMetadata: { budgetId: "456" },
      };
      const { hasBudgetIdMismatch } = validateImportedData(importedData, currentUser);
      expect(hasBudgetIdMismatch).toBe(true);
    });

    it("should return validation warnings for items that pass import validation but fail strict validation", () => {
      // ImportEnvelopeSchema is more permissive than EnvelopeSchema
      // This envelope passes ImportEnvelopeSchema (has id and name) but fails EnvelopeSchema (missing lastModified as positive int)
      const importedData = {
        envelopes: [
          { id: "env-1", name: "Envelope without lastModified", category: "Test" }, // Missing required lastModified for EnvelopeSchema
          {
            id: "env-2",
            name: "Valid Envelope",
            category: "Test",
            archived: false,
            lastModified: Date.now(),
          },
        ],
      };
      const result: ValidationResult = validateImportedData(importedData, currentUser);
      // The first envelope should fail strict EnvelopeSchema validation because lastModified is missing
      expect(result.itemValidation.envelopes.invalid.length).toBeGreaterThan(0);
    });

    it("should unify allTransactions from transactions array", () => {
      const importedData = {
        envelopes: [],
        transactions: [
          {
            id: "txn-1",
            date: "2024-01-15",
            amount: -50,
            envelopeId: "env-1",
            category: "Test",
            type: "expense",
            lastModified: Date.now(),
          },
        ],
      };
      const result = validateImportedData(importedData, currentUser);
      expect(result.validatedData.allTransactions).toHaveLength(1);
    });

    it("should use allTransactions when available", () => {
      const importedData = {
        envelopes: [],
        allTransactions: [
          {
            id: "txn-1",
            date: "2024-01-15",
            amount: -50,
            envelopeId: "env-1",
            category: "Test",
            type: "expense",
            lastModified: Date.now(),
          },
          {
            id: "txn-2",
            date: "2024-01-16",
            amount: -100,
            envelopeId: "env-1",
            category: "Test",
            type: "expense",
            lastModified: Date.now(),
          },
        ],
        transactions: [
          {
            id: "txn-3",
            date: "2024-01-17",
            amount: -25,
            envelopeId: "env-1",
            category: "Test",
            type: "expense",
            lastModified: Date.now(),
          },
        ],
      };
      const result = validateImportedData(importedData, currentUser);
      expect(result.validatedData.allTransactions).toHaveLength(2);
    });

    it("should support legacy savingsGoals format", () => {
      const importedData = {
        envelopes: [],
        savingsGoals: [
          {
            id: "goal-1",
            name: "Emergency Fund",
            category: "Savings",
            targetAmount: 10000,
            currentAmount: 2500,
            lastModified: Date.now(),
          },
        ],
      };
      const result = validateImportedData(importedData, currentUser);
      expect(result.validatedData).toBeDefined();
    });

    it("should support legacy supplementalAccounts format", () => {
      const importedData = {
        envelopes: [],
        supplementalAccounts: [{ id: "supp-1", name: "FSA", currentBalance: 500 }],
      };
      const result = validateImportedData(importedData, currentUser);
      expect(result.validatedData).toBeDefined();
    });

    it("should validate export metadata", () => {
      const importedData = {
        envelopes: [],
        exportMetadata: {
          exportedBy: "TestUser",
          appVersion: "2.0.0",
          budgetId: "123",
          modelVersion: "envelope-based",
        },
      };
      const result = validateImportedData(importedData, currentUser);
      expect(result.importBudgetId).toBe("123");
    });
  });
});
