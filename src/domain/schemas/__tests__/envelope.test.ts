/**
 * Envelope Schema Tests
 * Tests for envelope validation schemas including SupplementalAccountSchema and SavingsEnvelopeSchema
 * Part of Issue #1335: Database Schema Migration for Savings Goals and Supplemental Accounts
 */

import { describe, it, expect } from "vitest";
import {
  EnvelopeSchema,
  EnvelopeTypeSchema,
  EnvelopePrioritySchema,
  SupplementalAccountSchema,
  SavingsEnvelopeSchema,
  validateEnvelope,
  validateEnvelopeSafe,
  validateSupplementalAccount,
  validateSupplementalAccountSafe,
  validateSavingsEnvelope,
  validateSavingsEnvelopeSafe,
} from "../envelope";

describe("Envelope Schema Tests", () => {
  describe("EnvelopeTypeSchema", () => {
    it("should validate valid envelope types", () => {
      expect(EnvelopeTypeSchema.parse("bill")).toBe("bill");
      expect(EnvelopeTypeSchema.parse("variable")).toBe("variable");
      expect(EnvelopeTypeSchema.parse("savings")).toBe("savings");
      expect(EnvelopeTypeSchema.parse("sinking_fund")).toBe("sinking_fund");
      expect(EnvelopeTypeSchema.parse("supplemental")).toBe("supplemental");
    });

    it("should reject invalid envelope types", () => {
      expect(() => EnvelopeTypeSchema.parse("invalid")).toThrow();
    });
  });

  describe("EnvelopePrioritySchema", () => {
    it("should validate valid priority values", () => {
      expect(EnvelopePrioritySchema.parse("low")).toBe("low");
      expect(EnvelopePrioritySchema.parse("medium")).toBe("medium");
      expect(EnvelopePrioritySchema.parse("high")).toBe("high");
    });

    it("should reject invalid priority values", () => {
      expect(() => EnvelopePrioritySchema.parse("urgent")).toThrow();
    });
  });

  describe("EnvelopeSchema", () => {
    const validEnvelope = {
      id: "env-123",
      name: "Groceries",
      category: "Food",
      archived: false,
      lastModified: Date.now(),
    };

    it("should validate a basic envelope", () => {
      const result = EnvelopeSchema.safeParse(validEnvelope);
      expect(result.success).toBe(true);
    });

    it("should validate an envelope with all optional fields", () => {
      const fullEnvelope = {
        ...validEnvelope,
        createdAt: Date.now() - 1000,
        currentBalance: 150.5,
        targetAmount: 500,
        description: "Monthly grocery budget",
        envelopeType: "variable",
        autoAllocate: true,
        monthlyBudget: 500,
        biweeklyAllocation: 250,
        billId: "bill-123",
        debtId: "debt-123",
        priority: "high",
        isPaused: false,
        isCompleted: false,
        targetDate: "2025-12-31",
        monthlyContribution: 100,
        annualContribution: 1200,
        expirationDate: "2025-12-31",
        isActive: true,
        accountType: "FSA",
      };

      const result = EnvelopeSchema.safeParse(fullEnvelope);
      expect(result.success).toBe(true);
    });

    it("should allow passthrough for additional metadata fields", () => {
      const envelopeWithMetadata = {
        ...validEnvelope,
        customField: "custom value",
        anotherField: 123,
      };

      const result = EnvelopeSchema.safeParse(envelopeWithMetadata);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.customField).toBe("custom value");
        expect(result.data.anotherField).toBe(123);
      }
    });

    it("should reject envelope without id", () => {
      const invalidEnvelope = { ...validEnvelope, id: "" };
      const result = EnvelopeSchema.safeParse(invalidEnvelope);
      expect(result.success).toBe(false);
    });

    it("should reject envelope without name", () => {
      const invalidEnvelope = { ...validEnvelope, name: "" };
      const result = EnvelopeSchema.safeParse(invalidEnvelope);
      expect(result.success).toBe(false);
    });

    it("should reject negative currentBalance", () => {
      const invalidEnvelope = { ...validEnvelope, currentBalance: -100 };
      const result = EnvelopeSchema.safeParse(invalidEnvelope);
      expect(result.success).toBe(false);
    });

    it("should reject negative targetAmount", () => {
      const invalidEnvelope = { ...validEnvelope, targetAmount: -100 };
      const result = EnvelopeSchema.safeParse(invalidEnvelope);
      expect(result.success).toBe(false);
    });
  });

  describe("validateEnvelope", () => {
    it("should return validated envelope for valid data", () => {
      const validEnvelope = {
        id: "env-123",
        name: "Groceries",
        category: "Food",
        archived: false,
        lastModified: Date.now(),
      };

      const result = validateEnvelope(validEnvelope);
      expect(result.id).toBe("env-123");
      expect(result.name).toBe("Groceries");
    });

    it("should throw error for invalid data", () => {
      const invalidEnvelope = { id: "", name: "", category: "", archived: false, lastModified: -1 };
      expect(() => validateEnvelope(invalidEnvelope)).toThrow();
    });
  });

  describe("validateEnvelopeSafe", () => {
    it("should return success result for valid data", () => {
      const validEnvelope = {
        id: "env-123",
        name: "Groceries",
        category: "Food",
        archived: false,
        lastModified: Date.now(),
      };

      const result = validateEnvelopeSafe(validEnvelope);
      expect(result.success).toBe(true);
    });

    it("should return error result for invalid data", () => {
      const invalidEnvelope = { id: "", name: "", category: "", archived: false, lastModified: -1 };
      const result = validateEnvelopeSafe(invalidEnvelope);
      expect(result.success).toBe(false);
    });
  });

  describe("SupplementalAccountSchema", () => {
    const validSupplementalAccount = {
      id: "sup-123",
      name: "Health Savings Account",
      category: "Healthcare",
      archived: false,
      lastModified: Date.now(),
      envelopeType: "supplemental" as const,
      isActive: true,
    };

    it("should validate a basic supplemental account", () => {
      const result = SupplementalAccountSchema.safeParse(validSupplementalAccount);
      expect(result.success).toBe(true);
    });

    it("should validate a supplemental account with all fields", () => {
      const fullAccount = {
        ...validSupplementalAccount,
        annualContribution: 3650,
        expirationDate: "2025-12-31",
        accountType: "HSA",
        description: "Health Savings Account for medical expenses",
      };

      const result = SupplementalAccountSchema.safeParse(fullAccount);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.annualContribution).toBe(3650);
        expect(result.data.accountType).toBe("HSA");
      }
    });

    it("should require envelopeType to be supplemental", () => {
      const invalidAccount = {
        ...validSupplementalAccount,
        envelopeType: "savings",
      };

      const result = SupplementalAccountSchema.safeParse(invalidAccount);
      expect(result.success).toBe(false);
    });

    it("should allow null expirationDate for accounts without expiration", () => {
      const accountWithNullExpiration = {
        ...validSupplementalAccount,
        expirationDate: null,
      };

      const result = SupplementalAccountSchema.safeParse(accountWithNullExpiration);
      expect(result.success).toBe(true);
    });

    it("should reject negative annualContribution", () => {
      const invalidAccount = {
        ...validSupplementalAccount,
        annualContribution: -100,
      };

      const result = SupplementalAccountSchema.safeParse(invalidAccount);
      expect(result.success).toBe(false);
    });
  });

  describe("validateSupplementalAccount", () => {
    it("should return validated supplemental account for valid data", () => {
      const validAccount = {
        id: "sup-123",
        name: "FSA Account",
        category: "Healthcare",
        archived: false,
        lastModified: Date.now(),
        envelopeType: "supplemental" as const,
        accountType: "FSA",
        annualContribution: 2850,
      };

      const result = validateSupplementalAccount(validAccount);
      expect(result.id).toBe("sup-123");
      expect(result.accountType).toBe("FSA");
    });

    it("should throw error for invalid supplemental account", () => {
      const invalidAccount = {
        id: "sup-123",
        name: "FSA Account",
        category: "Healthcare",
        archived: false,
        lastModified: Date.now(),
        envelopeType: "variable", // Wrong type
      };

      expect(() => validateSupplementalAccount(invalidAccount)).toThrow();
    });
  });

  describe("validateSupplementalAccountSafe", () => {
    it("should return success result for valid supplemental account", () => {
      const validAccount = {
        id: "sup-123",
        name: "HSA Account",
        category: "Healthcare",
        archived: false,
        lastModified: Date.now(),
        envelopeType: "supplemental" as const,
      };

      const result = validateSupplementalAccountSafe(validAccount);
      expect(result.success).toBe(true);
    });

    it("should return error result for invalid supplemental account", () => {
      const invalidAccount = {
        id: "sup-123",
        name: "HSA Account",
        category: "Healthcare",
        archived: false,
        lastModified: Date.now(),
        envelopeType: "bill", // Wrong type
      };

      const result = validateSupplementalAccountSafe(invalidAccount);
      expect(result.success).toBe(false);
    });
  });

  describe("SavingsEnvelopeSchema", () => {
    const validSavingsEnvelope = {
      id: "sav-123",
      name: "Emergency Fund",
      category: "Savings",
      archived: false,
      lastModified: Date.now(),
      envelopeType: "savings" as const,
      targetAmount: 10000,
    };

    it("should validate a basic savings envelope", () => {
      const result = SavingsEnvelopeSchema.safeParse(validSavingsEnvelope);
      expect(result.success).toBe(true);
    });

    it("should validate a savings envelope with all fields", () => {
      const fullSavingsEnvelope = {
        ...validSavingsEnvelope,
        currentBalance: 2500,
        priority: "high",
        isPaused: false,
        isCompleted: false,
        targetDate: "2026-12-31",
        monthlyContribution: 500,
        description: "6-month emergency fund goal",
      };

      const result = SavingsEnvelopeSchema.safeParse(fullSavingsEnvelope);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currentBalance).toBe(2500);
        expect(result.data.priority).toBe("high");
        expect(result.data.targetDate).toBe("2026-12-31");
      }
    });

    it("should require envelopeType to be savings", () => {
      const invalidEnvelope = {
        ...validSavingsEnvelope,
        envelopeType: "variable",
      };

      const result = SavingsEnvelopeSchema.safeParse(invalidEnvelope);
      expect(result.success).toBe(false);
    });

    it("should require targetAmount", () => {
      const envelopeWithoutTarget = {
        id: "sav-123",
        name: "Emergency Fund",
        category: "Savings",
        archived: false,
        lastModified: Date.now(),
        envelopeType: "savings" as const,
      };

      const result = SavingsEnvelopeSchema.safeParse(envelopeWithoutTarget);
      expect(result.success).toBe(false);
    });

    it("should apply defaults for optional fields", () => {
      const result = SavingsEnvelopeSchema.safeParse(validSavingsEnvelope);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currentBalance).toBe(0);
        expect(result.data.priority).toBe("medium");
        expect(result.data.isPaused).toBe(false);
        expect(result.data.isCompleted).toBe(false);
      }
    });

    it("should reject negative targetAmount", () => {
      const invalidEnvelope = {
        ...validSavingsEnvelope,
        targetAmount: -1000,
      };

      const result = SavingsEnvelopeSchema.safeParse(invalidEnvelope);
      expect(result.success).toBe(false);
    });

    it("should reject negative currentBalance", () => {
      const invalidEnvelope = {
        ...validSavingsEnvelope,
        currentBalance: -500,
      };

      const result = SavingsEnvelopeSchema.safeParse(invalidEnvelope);
      expect(result.success).toBe(false);
    });
  });

  describe("validateSavingsEnvelope", () => {
    it("should return validated savings envelope for valid data", () => {
      const validEnvelope = {
        id: "sav-123",
        name: "Vacation Fund",
        category: "Travel",
        archived: false,
        lastModified: Date.now(),
        envelopeType: "savings" as const,
        targetAmount: 5000,
        currentBalance: 1500,
      };

      const result = validateSavingsEnvelope(validEnvelope);
      expect(result.id).toBe("sav-123");
      expect(result.targetAmount).toBe(5000);
      expect(result.currentBalance).toBe(1500);
    });

    it("should throw error for invalid savings envelope", () => {
      const invalidEnvelope = {
        id: "sav-123",
        name: "Vacation Fund",
        category: "Travel",
        archived: false,
        lastModified: Date.now(),
        envelopeType: "bill", // Wrong type
        targetAmount: 5000,
      };

      expect(() => validateSavingsEnvelope(invalidEnvelope)).toThrow();
    });
  });

  describe("validateSavingsEnvelopeSafe", () => {
    it("should return success result for valid savings envelope", () => {
      const validEnvelope = {
        id: "sav-123",
        name: "Car Fund",
        category: "Transportation",
        archived: false,
        lastModified: Date.now(),
        envelopeType: "savings" as const,
        targetAmount: 15000,
      };

      const result = validateSavingsEnvelopeSafe(validEnvelope);
      expect(result.success).toBe(true);
    });

    it("should return error result for invalid savings envelope", () => {
      const invalidEnvelope = {
        id: "sav-123",
        name: "Car Fund",
        category: "Transportation",
        archived: false,
        lastModified: Date.now(),
        envelopeType: "supplemental", // Wrong type
        targetAmount: 15000,
      };

      const result = validateSavingsEnvelopeSafe(invalidEnvelope);
      expect(result.success).toBe(false);
    });
  });
});
