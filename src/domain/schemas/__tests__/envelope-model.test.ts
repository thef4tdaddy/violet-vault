/**
 * Envelope-Based Data Model Tests
 * Issue #1344: Testing & Documentation for Simplified Model
 *
 * Tests for the simplified envelope-based data model where:
 * - All savings goals are stored as envelopes with envelopeType: "savings"
 * - All supplemental accounts are stored as envelopes with envelopeType: "supplemental"
 * - All financial operations route through envelopes
 */

import { describe, it, expect } from "vitest";
import {
  EnvelopeSchema,
  EnvelopeTypeSchema,
  SavingsEnvelopeSchema,
  SupplementalAccountSchema,
  validateEnvelope,
  validateSavingsEnvelope,
  validateSupplementalAccount,
} from "../envelope";
import { TransactionSchema, validateAndNormalizeTransaction } from "../transaction";

describe("Envelope-Based Data Model (v2.0)", () => {
  const now = Date.now();

  describe("Envelope Type Classification", () => {
    it("should validate all supported envelope types", () => {
      const types = ["bill", "variable", "savings", "sinking_fund", "supplemental"];

      types.forEach((type) => {
        const result = EnvelopeTypeSchema.safeParse(type);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid envelope types", () => {
      const invalidTypes = ["expense", "income", "transfer", "unknown"];

      invalidTypes.forEach((type) => {
        const result = EnvelopeTypeSchema.safeParse(type);
        expect(result.success).toBe(false);
      });
    });

    it("should allow envelopes without envelopeType for backward compatibility", () => {
      const envelope = {
        id: "env-1",
        name: "Groceries",
        category: "Food",
        archived: false,
        lastModified: now,
      };

      const result = EnvelopeSchema.safeParse(envelope);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.envelopeType).toBeUndefined();
      }
    });
  });

  describe("Savings Goals as Envelopes", () => {
    it("should validate a savings goal stored as envelope", () => {
      const savingsGoal = {
        id: "savings-1",
        name: "Emergency Fund",
        category: "Savings",
        archived: false,
        lastModified: now,
        envelopeType: "savings" as const,
        targetAmount: 10000,
        currentBalance: 2500,
        priority: "high" as const,
        isPaused: false,
        isCompleted: false,
      };

      const result = SavingsEnvelopeSchema.safeParse(savingsGoal);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.envelopeType).toBe("savings");
        expect(result.data.targetAmount).toBe(10000);
        expect(result.data.currentBalance).toBe(2500);
      }
    });

    it("should validate sinking funds as savings envelopes with targetDate", () => {
      const sinkingFund = {
        id: "sinking-1",
        name: "Holiday Vacation 2025",
        category: "Travel",
        archived: false,
        lastModified: now,
        envelopeType: "savings" as const,
        targetAmount: 3000,
        currentBalance: 1500,
        targetDate: "2025-12-20",
        priority: "medium" as const,
        isPaused: false,
        isCompleted: false,
      };

      const result = SavingsEnvelopeSchema.safeParse(sinkingFund);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.envelopeType).toBe("savings");
        expect(result.data.targetDate).toBe("2025-12-20");
      }
    });

    it("should require targetAmount for savings envelopes", () => {
      const invalidSavings = {
        id: "savings-invalid",
        name: "Missing Target",
        category: "Savings",
        archived: false,
        lastModified: now,
        envelopeType: "savings" as const,
        // Missing targetAmount
      };

      const result = SavingsEnvelopeSchema.safeParse(invalidSavings);
      expect(result.success).toBe(false);
    });

    it("should default currentBalance to 0 for new savings envelopes", () => {
      const newSavings = {
        id: "savings-new",
        name: "New Goal",
        category: "Savings",
        archived: false,
        lastModified: now,
        envelopeType: "savings" as const,
        targetAmount: 5000,
      };

      const result = SavingsEnvelopeSchema.safeParse(newSavings);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currentBalance).toBe(0);
      }
    });
  });

  describe("Supplemental Accounts as Envelopes", () => {
    it("should validate an FSA account stored as envelope", () => {
      const fsaAccount = {
        id: "fsa-1",
        name: "Flexible Spending Account",
        category: "Healthcare",
        archived: false,
        lastModified: now,
        envelopeType: "supplemental" as const,
        currentBalance: 2000,
        annualContribution: 2850,
        accountType: "FSA" as const,
        isActive: true,
        expirationDate: "2025-03-15",
      };

      const result = SupplementalAccountSchema.safeParse(fsaAccount);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.envelopeType).toBe("supplemental");
        expect(result.data.accountType).toBe("FSA");
        expect(result.data.annualContribution).toBe(2850);
      }
    });

    it("should validate an HSA account stored as envelope", () => {
      const hsaAccount = {
        id: "hsa-1",
        name: "Health Savings Account",
        category: "Healthcare",
        archived: false,
        lastModified: now,
        envelopeType: "supplemental" as const,
        currentBalance: 5000,
        annualContribution: 3850,
        accountType: "HSA" as const,
        isActive: true,
        expirationDate: null, // HSA doesn't expire
      };

      const result = SupplementalAccountSchema.safeParse(hsaAccount);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.accountType).toBe("HSA");
        expect(result.data.expirationDate).toBeNull();
      }
    });

    it("should validate all supported account types", () => {
      const accountTypes = ["FSA", "HSA", "529", "IRA", "401K", "other"];

      accountTypes.forEach((accountType) => {
        const account = {
          id: `account-${accountType}`,
          name: `${accountType} Account`,
          category: "Investment",
          archived: false,
          lastModified: now,
          envelopeType: "supplemental" as const,
          accountType,
          isActive: true,
        };

        const result = SupplementalAccountSchema.safeParse(account);
        expect(result.success).toBe(true);
      });
    });

    it("should require envelopeType to be supplemental for supplemental accounts", () => {
      const invalidAccount = {
        id: "account-invalid",
        name: "Wrong Type Account",
        category: "Healthcare",
        archived: false,
        lastModified: now,
        envelopeType: "savings" as const, // Wrong type
        accountType: "FSA",
      };

      const result = SupplementalAccountSchema.safeParse(invalidAccount);
      expect(result.success).toBe(false);
    });
  });

  describe("Transaction Validation with Envelopes", () => {
    it("should validate income transaction to unassigned", () => {
      const incomeTransaction = {
        id: "txn-income-1",
        date: new Date(),
        amount: 2000,
        envelopeId: "unassigned",
        category: "Income",
        type: "income" as const,
        lastModified: now,
        description: "Paycheck from Employer",
      };

      const result = TransactionSchema.safeParse(incomeTransaction);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.envelopeId).toBe("unassigned");
        expect(result.data.type).toBe("income");
        expect(result.data.amount).toBeGreaterThan(0);
      }
    });

    it("should validate expense transaction from envelope", () => {
      const expenseTransaction = {
        id: "txn-expense-1",
        date: new Date(),
        amount: -50,
        envelopeId: "groceries-env",
        category: "Food",
        type: "expense" as const,
        lastModified: now,
        description: "Weekly groceries",
      };

      const result = TransactionSchema.safeParse(expenseTransaction);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("expense");
        expect(result.data.amount).toBeLessThan(0);
      }
    });

    it("should validate internal transfer transaction for paycheck allocation", () => {
      const transferTransaction = {
        id: "txn-transfer-1",
        date: new Date(),
        amount: -500,
        envelopeId: "rent-env",
        category: "Transfer",
        type: "transfer" as const,
        lastModified: now,
        description: "Paycheck allocation to Rent",
        isInternalTransfer: true,
        paycheckId: "paycheck-123",
        fromEnvelopeId: "unassigned",
        toEnvelopeId: "rent-env",
      };

      const result = TransactionSchema.safeParse(transferTransaction);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isInternalTransfer).toBe(true);
        expect(result.data.paycheckId).toBe("paycheck-123");
        expect(result.data.fromEnvelopeId).toBe("unassigned");
        expect(result.data.toEnvelopeId).toBe("rent-env");
      }
    });

    it("should normalize transaction amounts correctly", () => {
      // Expense with positive amount should be normalized to negative
      const expenseWithWrongSign = {
        id: "txn-1",
        date: new Date(),
        amount: 100, // Wrong: should be negative
        envelopeId: "food-env",
        category: "Food",
        type: "expense" as const,
        lastModified: now,
      };

      const normalized = validateAndNormalizeTransaction(expenseWithWrongSign);
      expect(normalized.amount).toBe(-100);

      // Income with negative amount should be normalized to positive
      const incomeWithWrongSign = {
        id: "txn-2",
        date: new Date(),
        amount: -500, // Wrong: should be positive
        envelopeId: "unassigned",
        category: "Income",
        type: "income" as const,
        lastModified: now,
      };

      const normalizedIncome = validateAndNormalizeTransaction(incomeWithWrongSign);
      expect(normalizedIncome.amount).toBe(500);
    });

    it("should require envelopeId for all transactions", () => {
      const transactionWithoutEnvelope = {
        id: "txn-invalid",
        date: new Date(),
        amount: 50,
        category: "Food",
        type: "expense" as const,
        lastModified: now,
        // Missing envelopeId
      };

      const result = TransactionSchema.safeParse(transactionWithoutEnvelope);
      expect(result.success).toBe(false);
    });
  });

  describe("Passthrough for Custom Metadata", () => {
    it("should allow passthrough of custom envelope fields", () => {
      const envelopeWithCustomFields = {
        id: "env-custom",
        name: "Custom Envelope",
        category: "Custom",
        archived: false,
        lastModified: now,
        customField1: "custom value",
        customField2: 123,
        nestedCustom: { key: "value" },
      };

      const result = EnvelopeSchema.safeParse(envelopeWithCustomFields);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.customField1).toBe("custom value");
        expect(result.data.customField2).toBe(123);
        expect(result.data.nestedCustom).toEqual({ key: "value" });
      }
    });
  });

  describe("Envelope Type Filtering Scenarios", () => {
    const testEnvelopes = [
      {
        id: "bill-1",
        name: "Rent",
        category: "Housing",
        archived: false,
        lastModified: now,
        envelopeType: "bill",
      },
      {
        id: "variable-1",
        name: "Groceries",
        category: "Food",
        archived: false,
        lastModified: now,
        envelopeType: "variable",
      },
      {
        id: "savings-1",
        name: "Emergency Fund",
        category: "Savings",
        archived: false,
        lastModified: now,
        envelopeType: "savings",
        targetAmount: 10000,
      },
      {
        id: "supplemental-1",
        name: "HSA",
        category: "Healthcare",
        archived: false,
        lastModified: now,
        envelopeType: "supplemental",
        accountType: "HSA",
      },
    ];

    it("should filter regular envelopes (bill, variable) for envelope UI", () => {
      const regularTypes = ["bill", "variable"];
      const regularEnvelopes = testEnvelopes.filter(
        (env) => env.envelopeType && regularTypes.includes(env.envelopeType)
      );

      expect(regularEnvelopes).toHaveLength(2);
      expect(regularEnvelopes.map((e) => e.name)).toEqual(["Rent", "Groceries"]);
    });

    it("should filter savings envelopes for savings goals page", () => {
      const savingsEnvelopes = testEnvelopes.filter((env) => env.envelopeType === "savings");

      expect(savingsEnvelopes).toHaveLength(1);
      expect(savingsEnvelopes[0].name).toBe("Emergency Fund");
    });

    it("should filter supplemental envelopes for supplemental accounts page", () => {
      const supplementalEnvelopes = testEnvelopes.filter(
        (env) => env.envelopeType === "supplemental"
      );

      expect(supplementalEnvelopes).toHaveLength(1);
      expect(supplementalEnvelopes[0].name).toBe("HSA");
    });

    it("should validate all test envelopes", () => {
      testEnvelopes.forEach((envelope) => {
        const result = validateEnvelope(envelope);
        expect(result).toBeDefined();
        expect(result.id).toBe(envelope.id);
      });
    });
  });

  describe("Data Migration Scenarios", () => {
    it("should convert legacy savings goal to savings envelope", () => {
      // Legacy savings goal structure
      const legacySavingsGoal = {
        id: "goal-legacy",
        name: "Car Fund",
        category: "Transportation",
        priority: "high",
        targetAmount: 15000,
        currentAmount: 5000, // Legacy field name
        isPaused: false,
        isCompleted: false,
        lastModified: now,
      };

      // Converted to savings envelope
      const convertedEnvelope = {
        id: legacySavingsGoal.id,
        name: legacySavingsGoal.name,
        category: legacySavingsGoal.category,
        archived: legacySavingsGoal.isCompleted,
        lastModified: legacySavingsGoal.lastModified,
        envelopeType: "savings" as const,
        targetAmount: legacySavingsGoal.targetAmount,
        currentBalance: legacySavingsGoal.currentAmount, // Renamed field
        priority: legacySavingsGoal.priority as "low" | "medium" | "high",
        isPaused: legacySavingsGoal.isPaused,
        isCompleted: legacySavingsGoal.isCompleted,
      };

      const result = validateSavingsEnvelope(convertedEnvelope);
      expect(result.envelopeType).toBe("savings");
      expect(result.currentBalance).toBe(5000);
    });

    it("should convert legacy supplemental account to supplemental envelope", () => {
      // Legacy supplemental account structure
      const legacySupplementalAccount = {
        id: "supp-legacy",
        name: "401K Account",
        type: "401K",
        balance: 50000,
        annualContribution: 22500,
        isActive: true,
      };

      // Converted to supplemental envelope
      const convertedEnvelope = {
        id: legacySupplementalAccount.id,
        name: legacySupplementalAccount.name,
        category: legacySupplementalAccount.type,
        archived: false,
        lastModified: now,
        envelopeType: "supplemental" as const,
        currentBalance: legacySupplementalAccount.balance,
        annualContribution: legacySupplementalAccount.annualContribution,
        accountType: legacySupplementalAccount.type as
          | "FSA"
          | "HSA"
          | "529"
          | "IRA"
          | "401K"
          | "other",
        isActive: legacySupplementalAccount.isActive,
      };

      const result = validateSupplementalAccount(convertedEnvelope);
      expect(result.envelopeType).toBe("supplemental");
      expect(result.currentBalance).toBe(50000);
      expect(result.accountType).toBe("401K");
    });
  });
});
