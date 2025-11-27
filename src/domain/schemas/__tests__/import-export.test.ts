import { describe, it, expect } from "vitest";
import {
  ExportMetadataSchema,
  ImportedDataSchema,
  ImportEnvelopeSchema,
  ImportTransactionSchema,
  ImportBillSchema,
  ImportDebtSchema,
  LegacySupplementalAccountSchema,
  validateImportedDataStructure,
  validateImportedDataStructureSafe,
  validateEnvelopes,
  validateTransactions,
  validateBills,
  validateDebts,
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
        dataSource: "dexie",
        exportedFrom: "develop-branch",
        budgetId: "budget-123",
        userColor: "#FF0000",
        modelVersion: "envelope-based",
        syncContext: {
          note: "Test note",
          originalBudgetId: "budget-123",
          exportTimestamp: 1704067200000,
        },
      };

      const result = ExportMetadataSchema.safeParse(metadata);
      expect(result.success).toBe(true);
    });

    it("should validate minimal export metadata", () => {
      const metadata = {};
      const result = ExportMetadataSchema.safeParse(metadata);
      expect(result.success).toBe(true);
    });
  });

  describe("ImportEnvelopeSchema", () => {
    it("should validate a complete envelope", () => {
      const envelope = {
        id: "env-1",
        name: "Groceries",
        category: "Food",
        archived: false,
        lastModified: 1704067200000,
        currentBalance: 500,
        targetAmount: 1000,
        envelopeType: "variable",
      };

      const result = ImportEnvelopeSchema.safeParse(envelope);
      expect(result.success).toBe(true);
    });

    it("should validate a savings envelope", () => {
      const envelope = {
        id: "env-2",
        name: "Vacation",
        category: "Savings",
        envelopeType: "savings",
        currentBalance: 1000,
        targetAmount: 5000,
        priority: "high",
        isPaused: false,
        isCompleted: false,
        targetDate: "2024-12-31",
        monthlyContribution: 200,
      };

      const result = ImportEnvelopeSchema.safeParse(envelope);
      expect(result.success).toBe(true);
    });

    it("should validate a supplemental envelope", () => {
      const envelope = {
        id: "env-3",
        name: "FSA",
        category: "Healthcare",
        envelopeType: "supplemental",
        currentBalance: 2000,
        annualContribution: 2850,
        expirationDate: "2024-12-31",
        isActive: true,
        accountType: "FSA",
      };

      const result = ImportEnvelopeSchema.safeParse(envelope);
      expect(result.success).toBe(true);
    });

    it("should fail for missing required fields", () => {
      const envelope = { name: "Test" }; // missing id
      const result = ImportEnvelopeSchema.safeParse(envelope);
      expect(result.success).toBe(false);
    });
  });

  describe("ImportTransactionSchema", () => {
    it("should validate a complete transaction", () => {
      const transaction = {
        id: "txn-1",
        date: "2024-01-15",
        amount: -50.0,
        envelopeId: "env-1",
        category: "Groceries",
        type: "expense",
        description: "Grocery shopping",
      };

      const result = ImportTransactionSchema.safeParse(transaction);
      expect(result.success).toBe(true);
    });

    it("should fail for missing id", () => {
      const transaction = {
        date: "2024-01-15",
        amount: -50.0,
      };

      const result = ImportTransactionSchema.safeParse(transaction);
      expect(result.success).toBe(false);
    });
  });

  describe("ImportBillSchema", () => {
    it("should validate a complete bill", () => {
      const bill = {
        id: "bill-1",
        name: "Electricity",
        dueDate: "2024-01-15",
        amount: 150,
        category: "Utilities",
        isPaid: false,
        isRecurring: true,
        frequency: "monthly",
      };

      const result = ImportBillSchema.safeParse(bill);
      expect(result.success).toBe(true);
    });

    it("should fail for negative amount", () => {
      const bill = {
        id: "bill-1",
        name: "Test",
        dueDate: "2024-01-15",
        amount: -100,
      };

      const result = ImportBillSchema.safeParse(bill);
      expect(result.success).toBe(false);
    });
  });

  describe("ImportDebtSchema", () => {
    it("should validate a complete debt", () => {
      const debt = {
        id: "debt-1",
        name: "Car Loan",
        creditor: "Bank",
        type: "auto",
        status: "active",
        currentBalance: 15000,
        minimumPayment: 350,
        interestRate: 5.5,
      };

      const result = ImportDebtSchema.safeParse(debt);
      expect(result.success).toBe(true);
    });
  });

  describe("LegacySupplementalAccountSchema", () => {
    it("should validate legacy supplemental account format", () => {
      const account = {
        id: "supp-1",
        name: "HSA",
        category: "Healthcare",
        currentBalance: 3000,
        annualContribution: 3850,
        isActive: true,
        accountType: "HSA",
      };

      const result = LegacySupplementalAccountSchema.safeParse(account);
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
          },
        ],
        bills: [
          {
            id: "bill-1",
            name: "Electric",
            dueDate: "2024-01-15",
            amount: 100,
          },
        ],
        transactions: [
          {
            id: "txn-1",
            date: "2024-01-10",
            amount: -50,
          },
        ],
        debts: [],
        exportMetadata: {
          appVersion: "2.0.0",
          budgetId: "budget-123",
        },
      };

      const result = ImportedDataSchema.safeParse(importData);
      expect(result.success).toBe(true);
    });

    it("should validate with legacy savingsGoals array", () => {
      const importData = {
        envelopes: [],
        savingsGoals: [
          {
            id: "goal-1",
            name: "Emergency Fund",
            category: "Savings",
            targetAmount: 10000,
            currentAmount: 2500,
          },
        ],
      };

      const result = ImportedDataSchema.safeParse(importData);
      expect(result.success).toBe(true);
    });

    it("should validate with legacy supplementalAccounts array", () => {
      const importData = {
        envelopes: [],
        supplementalAccounts: [
          {
            id: "supp-1",
            name: "FSA",
            currentBalance: 500,
          },
        ],
      };

      const result = ImportedDataSchema.safeParse(importData);
      expect(result.success).toBe(true);
    });

    it("should fail for missing envelopes", () => {
      const importData = {
        bills: [],
      };

      const result = ImportedDataSchema.safeParse(importData);
      expect(result.success).toBe(false);
    });

    it("should validate allTransactions array", () => {
      const importData = {
        envelopes: [],
        allTransactions: [
          {
            id: "txn-1",
            date: "2024-01-10",
            amount: -50,
          },
        ],
      };

      const result = ImportedDataSchema.safeParse(importData);
      expect(result.success).toBe(true);
    });
  });

  describe("validateImportedDataStructure", () => {
    it("should return validated data for valid input", () => {
      const input = {
        envelopes: [{ id: "env-1", name: "Test", category: "Test" }],
      };

      const result = validateImportedDataStructure(input);
      expect(result.envelopes).toHaveLength(1);
    });

    it("should throw for invalid input", () => {
      const input = { bills: [] }; // missing envelopes

      expect(() => validateImportedDataStructure(input)).toThrow();
    });
  });

  describe("validateImportedDataStructureSafe", () => {
    it("should return success for valid input", () => {
      const input = {
        envelopes: [{ id: "env-1", name: "Test", category: "Test" }],
      };

      const result = validateImportedDataStructureSafe(input);
      expect(result.success).toBe(true);
    });

    it("should return failure for invalid input", () => {
      const input = { bills: [] };

      const result = validateImportedDataStructureSafe(input);
      expect(result.success).toBe(false);
    });
  });

  describe("validateEnvelopes", () => {
    it("should return valid envelopes", () => {
      const envelopes = [
        {
          id: "env-1",
          name: "Test",
          category: "Test",
          archived: false,
          lastModified: 1704067200000,
        },
      ];

      const result = validateEnvelopes(envelopes);
      expect(result.valid).toHaveLength(1);
      expect(result.invalid).toHaveLength(0);
    });

    it("should identify invalid envelopes", () => {
      const envelopes = [
        { id: "", name: "Test", category: "Test", archived: false, lastModified: 1704067200000 }, // Invalid: empty id
        {
          id: "env-1",
          name: "Valid",
          category: "Test",
          archived: false,
          lastModified: 1704067200000,
        },
      ];

      const result = validateEnvelopes(envelopes);
      expect(result.valid).toHaveLength(1);
      expect(result.invalid).toHaveLength(1);
      expect(result.invalid[0].index).toBe(0);
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
          lastModified: 1704067200000,
        },
      ];

      const result = validateTransactions(transactions);
      expect(result.valid).toHaveLength(1);
      expect(result.invalid).toHaveLength(0);
    });

    it("should identify invalid transactions", () => {
      const transactions = [
        { id: "", date: "2024-01-15", amount: -50 }, // Invalid: empty id
      ];

      const result = validateTransactions(transactions);
      expect(result.invalid).toHaveLength(1);
    });
  });

  describe("validateBills", () => {
    it("should return valid bills", () => {
      const bills = [
        {
          id: "bill-1",
          name: "Test",
          dueDate: "2024-01-15",
          amount: 100,
          category: "Utilities",
          isPaid: false,
          isRecurring: false,
          lastModified: 1704067200000,
        },
      ];

      const result = validateBills(bills);
      expect(result.valid).toHaveLength(1);
      expect(result.invalid).toHaveLength(0);
    });
  });

  describe("validateDebts", () => {
    it("should return valid debts", () => {
      const debts = [
        {
          id: "debt-1",
          name: "Test",
          creditor: "Bank",
          type: "personal",
          status: "active",
          currentBalance: 1000,
          minimumPayment: 50,
          lastModified: 1704067200000,
        },
      ];

      const result = validateDebts(debts);
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

      const result = formatValidationErrors(envelopeErrors, [], [], []);
      expect(result).toContain("1 envelope(s) have validation errors:");
      expect(result.some((msg) => msg.includes("Test Envelope"))).toBe(true);
    });

    it("should format transaction errors", () => {
      const transactionErrors = [
        {
          index: 0,
          data: { description: "Test Transaction" },
          errors: ["id: Required"],
        },
      ];

      const result = formatValidationErrors([], transactionErrors, [], []);
      expect(result).toContain("1 transaction(s) have validation errors:");
    });

    it("should format bill errors", () => {
      const billErrors = [
        {
          index: 0,
          data: { name: "Test Bill" },
          errors: ["id: Required"],
        },
      ];

      const result = formatValidationErrors([], [], billErrors, []);
      expect(result).toContain("1 bill(s) have validation errors:");
    });

    it("should format debt errors", () => {
      const debtErrors = [
        {
          index: 0,
          data: { name: "Test Debt" },
          errors: ["id: Required"],
        },
      ];

      const result = formatValidationErrors([], [], [], debtErrors);
      expect(result).toContain("1 debt(s) have validation errors:");
    });

    it("should return empty array for no errors", () => {
      const result = formatValidationErrors([], [], [], []);
      expect(result).toHaveLength(0);
    });

    it("should truncate errors when there are more than 3", () => {
      const envelopeErrors = [
        { index: 0, data: { name: "Env1" }, errors: ["error1"] },
        { index: 1, data: { name: "Env2" }, errors: ["error2"] },
        { index: 2, data: { name: "Env3" }, errors: ["error3"] },
        { index: 3, data: { name: "Env4" }, errors: ["error4"] },
        { index: 4, data: { name: "Env5" }, errors: ["error5"] },
      ];

      const result = formatValidationErrors(envelopeErrors, [], [], []);
      expect(result.some((msg) => msg.includes("... and 2 more"))).toBe(true);
    });
  });
});
