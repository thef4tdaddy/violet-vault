import { validateImportedData } from "../validationUtils";

describe("validationUtils", () => {
  describe("validateImportedData", () => {
    const currentUser = { budgetId: "123" };

    it("should throw an error for invalid JSON", () => {
      expect(() => validateImportedData(null, currentUser)).toThrow(
        "Invalid backup file: not a valid JSON object.",
      );
    });

    it("should throw an error for missing envelopes data", () => {
      const importedData = { bills: [] };
      expect(() => validateImportedData(importedData, currentUser)).toThrow(
        "Invalid backup file: missing or invalid envelopes data.",
      );
    });

    it("should return validated data for a valid import file", () => {
      const importedData = {
        envelopes: [],
        bills: [],
        transactions: [],
        exportMetadata: { budgetId: "123" },
      };
      const { validatedData, hasBudgetIdMismatch } = validateImportedData(
        importedData,
        currentUser,
      );
      expect(validatedData).toBeDefined();
      expect(hasBudgetIdMismatch).toBe(false);
    });

    it("should detect a budgetId mismatch", () => {
      const importedData = {
        envelopes: [],
        exportMetadata: { budgetId: "456" },
      };
      const { hasBudgetIdMismatch } = validateImportedData(
        importedData,
        currentUser,
      );
      expect(hasBudgetIdMismatch).toBe(true);
    });
  });
});
