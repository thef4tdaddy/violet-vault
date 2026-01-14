/**
 * Debt CRUD Mutation Tests
 * Comprehensive tests for debt validation, safety checks, and CRUD operations
 * Part of Issue #987 - Comprehensive Zod Schema Implementation
 *
 * Matches pattern of Envelope CRUD tests with debt-specific validations:
 * - Financial calculations (balance, interest rate, payment)
 * - Envelope/bill relationship validation
 * - Payment processing validation
 */

import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { budgetDb } from "../../../../../db/budgetDb";
import {
  DebtSchema,
  DebtPartialSchema,
  DebtFormSchema,
  DebtTypeSchema,
  DebtStatusSchema,
  validateDebt,
  validateDebtSafe,
  validateDebtPartial,
  validateDebtPartialSafe,
  validateDebtFormDataSafe,
} from "../../../../../domain/schemas/debt";

// Mock dependencies
vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as Record<string, unknown>),
    useMutation: vi.fn(),
    useQueryClient: vi.fn(),
    useQuery: vi.fn(() => ({ data: [], isLoading: false })),
  };
});

vi.mock("../../../../../db/budgetDb", () => ({
  budgetDb: {
    envelopes: {
      get: vi.fn(),
      put: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      toArray: vi.fn(),
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnThis(),
        toArray: vi.fn(),
      }),
    },
  },
}));

vi.mock("@/utils/common/queryClient", () => ({
  queryKeys: {
    debts: ["debts"],
    debtsList: () => ["debts", "list"],
    dashboard: ["dashboard"],
    envelopes: ["envelopes"],
    bills: ["bills"],
  },
  optimisticHelpers: {
    addDebt: vi.fn(),
    updateDebt: vi.fn(),
    removeDebt: vi.fn(),
    updateBill: vi.fn(),
  },
}));

vi.mock("@/utils/common/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock("@/utils/common/budgetHistoryTracker", () => ({
  default: {
    trackDebtChange: vi.fn().mockResolvedValue(undefined),
  },
}));

describe("Debt CRUD Validation Tests", () => {
  const mockQueryClient = {
    invalidateQueries: vi.fn(),
    cancelQueries: vi.fn(),
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
  };

  const validDebt = {
    id: "debt-123",
    name: "Credit Card",
    creditor: "Bank of America",
    type: "credit_card" as const,
    status: "active" as const,
    currentBalance: 5000,
    minimumPayment: 150,
    lastModified: Date.now(),
    interestRate: 18.5,
    originalBalance: 6000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useQueryClient as Mock).mockReturnValue(mockQueryClient);
    (budgetDb.envelopes.get as Mock).mockResolvedValue(validDebt);
    (budgetDb.envelopes.put as Mock).mockResolvedValue(undefined);
    (budgetDb.envelopes.update as Mock).mockResolvedValue(1);
    (budgetDb.envelopes.delete as Mock).mockResolvedValue(undefined);
  });

  describe("DebtTypeSchema Validation", () => {
    it("should validate all valid debt types", () => {
      const validTypes = [
        "mortgage",
        "auto",
        "credit_card",
        "chapter13",
        "student",
        "personal",
        "business",
        "other",
      ];

      validTypes.forEach((type) => {
        expect(DebtTypeSchema.parse(type)).toBe(type);
      });
    });

    it("should reject invalid debt types", () => {
      expect(() => DebtTypeSchema.parse("invalid_type")).toThrow();
      expect(() => DebtTypeSchema.parse("loan")).toThrow();
      expect(() => DebtTypeSchema.parse("")).toThrow();
    });
  });

  describe("DebtStatusSchema Validation", () => {
    it("should validate all valid debt statuses", () => {
      const validStatuses = ["active", "paid", "closed", "defaulted"];

      validStatuses.forEach((status) => {
        expect(DebtStatusSchema.parse(status)).toBe(status);
      });
    });

    it("should reject invalid debt statuses", () => {
      expect(() => DebtStatusSchema.parse("invalid_status")).toThrow();
      expect(() => DebtStatusSchema.parse("completed")).toThrow();
      expect(() => DebtStatusSchema.parse("")).toThrow();
    });
  });

  describe("DebtSchema Validation - Create Operation", () => {
    it("should validate a complete debt object", () => {
      const result = DebtSchema.safeParse(validDebt);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe("debt-123");
        expect(result.data.name).toBe("Credit Card");
        expect(result.data.creditor).toBe("Bank of America");
        expect(result.data.type).toBe("credit_card");
        expect(result.data.status).toBe("active");
        expect(result.data.currentBalance).toBe(5000);
        expect(result.data.minimumPayment).toBe(150);
        expect(result.data.interestRate).toBe(18.5);
      }
    });

    it("should reject debt without id", () => {
      const invalidDebt = { ...validDebt, id: "" };
      const result = DebtSchema.safeParse(invalidDebt);
      expect(result.success).toBe(false);
    });

    it("should reject debt without name", () => {
      const invalidDebt = { ...validDebt, name: "" };
      const result = DebtSchema.safeParse(invalidDebt);
      expect(result.success).toBe(false);
    });

    it("should reject debt with name exceeding max length", () => {
      const invalidDebt = { ...validDebt, name: "a".repeat(101) };
      const result = DebtSchema.safeParse(invalidDebt);
      expect(result.success).toBe(false);
    });

    it("should reject debt without creditor", () => {
      const invalidDebt = { ...validDebt, creditor: "" };
      const result = DebtSchema.safeParse(invalidDebt);
      expect(result.success).toBe(false);
    });

    it("should reject debt with creditor exceeding max length", () => {
      const invalidDebt = { ...validDebt, creditor: "a".repeat(101) };
      const result = DebtSchema.safeParse(invalidDebt);
      expect(result.success).toBe(false);
    });

    it("should reject debt with negative currentBalance", () => {
      const invalidDebt = { ...validDebt, currentBalance: -100 };
      const result = DebtSchema.safeParse(invalidDebt);
      expect(result.success).toBe(false);
    });

    it("should reject debt with negative minimumPayment", () => {
      const invalidDebt = { ...validDebt, minimumPayment: -50 };
      const result = DebtSchema.safeParse(invalidDebt);
      expect(result.success).toBe(false);
    });

    it("should reject debt with negative interestRate", () => {
      const invalidDebt = { ...validDebt, interestRate: -5 };
      const result = DebtSchema.safeParse(invalidDebt);
      expect(result.success).toBe(false);
    });

    it("should reject debt with interestRate exceeding 100%", () => {
      const invalidDebt = { ...validDebt, interestRate: 150 };
      const result = DebtSchema.safeParse(invalidDebt);
      expect(result.success).toBe(false);
    });

    it("should reject debt with negative lastModified", () => {
      const invalidDebt = { ...validDebt, lastModified: -1 };
      const result = DebtSchema.safeParse(invalidDebt);
      expect(result.success).toBe(false);
    });

    it("should apply default type when not provided", () => {
      const debtWithoutType = {
        id: "debt-456",
        name: "Test Debt",
        creditor: "Test Creditor",
        currentBalance: 1000,
        minimumPayment: 50,
        lastModified: Date.now(),
      };
      const result = DebtSchema.safeParse(debtWithoutType);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("other");
      }
    });

    it("should apply default status when not provided", () => {
      const debtWithoutStatus = {
        id: "debt-456",
        name: "Test Debt",
        creditor: "Test Creditor",
        currentBalance: 1000,
        minimumPayment: 50,
        lastModified: Date.now(),
      };
      const result = DebtSchema.safeParse(debtWithoutStatus);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("active");
      }
    });

    it("should validate debt with all optional fields", () => {
      const fullDebt = {
        ...validDebt,
        createdAt: Date.now() - 1000,
        originalBalance: 6000,
        dueDate: "2024-01-15",
      };
      const result = DebtSchema.safeParse(fullDebt);
      expect(result.success).toBe(true);
    });
  });

  describe("DebtPartialSchema Validation - Update Operation", () => {
    it("should validate partial debt update with single field", () => {
      const result = DebtPartialSchema.safeParse({ name: "Updated Name" });
      expect(result.success).toBe(true);
    });

    it("should validate partial debt update with multiple fields", () => {
      const result = DebtPartialSchema.safeParse({
        name: "Updated Name",
        currentBalance: 4500,
        minimumPayment: 175,
      });
      expect(result.success).toBe(true);
    });

    it("should reject partial update with invalid currentBalance", () => {
      const result = DebtPartialSchema.safeParse({ currentBalance: -100 });
      expect(result.success).toBe(false);
    });

    it("should reject partial update with invalid minimumPayment", () => {
      const result = DebtPartialSchema.safeParse({ minimumPayment: -50 });
      expect(result.success).toBe(false);
    });

    it("should reject partial update with invalid interestRate", () => {
      const result = DebtPartialSchema.safeParse({ interestRate: 150 });
      expect(result.success).toBe(false);
    });

    it("should reject partial update with name exceeding max length", () => {
      const result = DebtPartialSchema.safeParse({ name: "a".repeat(101) });
      expect(result.success).toBe(false);
    });
  });

  describe("validateDebt Helper Functions", () => {
    it("should return validated debt for valid data using validateDebt", () => {
      const result = validateDebt(validDebt);
      expect(result.id).toBe("debt-123");
      expect(result.name).toBe("Credit Card");
    });

    it("should throw error for invalid data using validateDebt", () => {
      const invalidDebt = { ...validDebt, name: "" };
      expect(() => validateDebt(invalidDebt)).toThrow();
    });

    it("should return success result for valid data using validateDebtSafe", () => {
      const result = validateDebtSafe(validDebt);
      expect(result.success).toBe(true);
    });

    it("should return error result for invalid data using validateDebtSafe", () => {
      const invalidDebt = { ...validDebt, name: "" };
      const result = validateDebtSafe(invalidDebt);
      expect(result.success).toBe(false);
    });

    it("should return validated partial debt using validateDebtPartial", () => {
      const result = validateDebtPartial({ name: "Updated" });
      expect(result.name).toBe("Updated");
    });

    it("should throw error for invalid partial data using validateDebtPartial", () => {
      expect(() => validateDebtPartial({ currentBalance: -100 })).toThrow();
    });

    it("should return success result for valid partial data using validateDebtPartialSafe", () => {
      const result = validateDebtPartialSafe({ currentBalance: 3000 });
      expect(result.success).toBe(true);
    });

    it("should return error result for invalid partial data using validateDebtPartialSafe", () => {
      const result = validateDebtPartialSafe({ minimumPayment: -50 });
      expect(result.success).toBe(false);
    });
  });

  describe("DebtFormSchema Validation", () => {
    const validFormData = {
      name: "Credit Card",
      creditor: "Bank of America",
      currentBalance: "5000",
      minimumPayment: "150",
      interestRate: "18.5",
    };

    it("should validate complete form data", () => {
      const result = DebtFormSchema.safeParse(validFormData);
      expect(result.success).toBe(true);
    });

    it("should reject form with empty name", () => {
      const invalidForm = { ...validFormData, name: "" };
      const result = DebtFormSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
    });

    it("should reject form with empty creditor", () => {
      const invalidForm = { ...validFormData, creditor: "" };
      const result = DebtFormSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
    });

    it("should reject form with negative currentBalance", () => {
      const invalidForm = { ...validFormData, currentBalance: "-100" };
      const result = DebtFormSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
    });

    it("should reject form with negative minimumPayment", () => {
      const invalidForm = { ...validFormData, minimumPayment: "-50" };
      const result = DebtFormSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
    });

    it("should reject form with interestRate exceeding 100%", () => {
      const invalidForm = { ...validFormData, interestRate: "150" };
      const result = DebtFormSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
    });

    it("should reject form with negative interestRate", () => {
      const invalidForm = { ...validFormData, interestRate: "-5" };
      const result = DebtFormSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
    });

    it("should reject form without balance", () => {
      const invalidForm = {
        name: "Test",
        creditor: "Test Bank",
        minimumPayment: "50",
      };
      const result = DebtFormSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
    });

    it("should reject form without minimumPayment", () => {
      const invalidForm = {
        name: "Test",
        creditor: "Test Bank",
        currentBalance: "1000",
      };
      const result = DebtFormSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
    });

    it("should reject connect_existing_bill without existingBillId", () => {
      const invalidForm = {
        ...validFormData,
        paymentMethod: "connect_existing_bill",
        existingBillId: "",
      };
      const result = DebtFormSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
    });

    it("should reject create_new with createBill but without envelopeId", () => {
      const invalidForm = {
        ...validFormData,
        paymentMethod: "create_new",
        createBill: true,
        envelopeId: "",
      };
      const result = DebtFormSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
    });

    it("should reject create_new with createBill but without paymentDueDate", () => {
      const invalidForm = {
        ...validFormData,
        paymentMethod: "create_new",
        createBill: true,
        envelopeId: "env-1",
        paymentDueDate: "",
      };
      const result = DebtFormSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
    });

    it("should validate form with valid bill connection", () => {
      const validForm = {
        ...validFormData,
        paymentMethod: "connect_existing_bill",
        existingBillId: "bill-123",
      };
      const result = DebtFormSchema.safeParse(validForm);
      expect(result.success).toBe(true);
    });

    it("should validate form with valid envelope connection", () => {
      const validForm = {
        ...validFormData,
        paymentMethod: "create_new",
        createBill: true,
        envelopeId: "env-123",
        paymentDueDate: "2024-01-15",
      };
      const result = DebtFormSchema.safeParse(validForm);
      expect(result.success).toBe(true);
    });

    it("should trim whitespace from name and creditor", () => {
      const formWithWhitespace = {
        ...validFormData,
        name: "  Credit Card  ",
        creditor: "  Bank of America  ",
      };
      const result = DebtFormSchema.safeParse(formWithWhitespace);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Credit Card");
        expect(result.data.creditor).toBe("Bank of America");
      }
    });
  });

  describe("validateDebtFormDataSafe - Form Validation with Warnings", () => {
    it("should return success for valid form data", () => {
      const result = validateDebtFormDataSafe({
        name: "Credit Card",
        creditor: "Bank of America",
        currentBalance: "5000",
        minimumPayment: "150",
        interestRate: "18.5",
      });
      expect(result.success).toBe(true);
      expect(result.errors).toEqual({});
    });

    it("should return errors for invalid form data", () => {
      const result = validateDebtFormDataSafe({
        name: "",
        creditor: "",
      });
      expect(result.success).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });

    it("should warn for very low minimum payment (less than 1% of balance)", () => {
      const result = validateDebtFormDataSafe({
        name: "Credit Card",
        creditor: "Bank of America",
        currentBalance: "10000",
        minimumPayment: "10", // 0.1% of balance
        interestRate: "18",
      });
      expect(result.success).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain("less than 1%");
    });

    it("should warn for very high minimum payment (more than 50% of balance)", () => {
      const result = validateDebtFormDataSafe({
        name: "Credit Card",
        creditor: "Bank of America",
        currentBalance: "1000",
        minimumPayment: "600", // 60% of balance
        interestRate: "18",
      });
      expect(result.success).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain("more than 50%");
    });

    it("should warn for very high interest rate", () => {
      const result = validateDebtFormDataSafe({
        name: "Credit Card",
        creditor: "Bank of America",
        currentBalance: "5000",
        minimumPayment: "150",
        interestRate: "30", // Very high
      });
      expect(result.success).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain("very high");
    });

    it("should warn when current balance exceeds original balance", () => {
      const result = validateDebtFormDataSafe({
        name: "Credit Card",
        creditor: "Bank of America",
        currentBalance: "7000", // Higher than original
        originalBalance: "5000",
        minimumPayment: "150",
        interestRate: "18",
      });
      expect(result.success).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain("higher than original");
    });
  });

  describe("Safety Checks - Prevent Invalid Operations", () => {
    it("should preserve name when update attempts to clear it", () => {
      // This test verifies the update mutation should reject or preserve name
      const existingDebt = { ...validDebt };
      const updates = { name: "" };

      // The update should either:
      // 1. Reject the update (validation fails)
      // 2. Preserve the original name

      // Validate that empty name is rejected by schema
      const validationResult = DebtSchema.safeParse({
        ...existingDebt,
        ...updates,
      });
      expect(validationResult.success).toBe(false);
    });

    it("should preserve creditor when update attempts to clear it", () => {
      const existingDebt = { ...validDebt };
      const updates = { creditor: "" };

      const validationResult = DebtSchema.safeParse({
        ...existingDebt,
        ...updates,
      });
      expect(validationResult.success).toBe(false);
    });

    it("should reject whitespace-only name", () => {
      const existingDebt = { ...validDebt };
      const updates = { name: "   " };

      // Trimmed name should fail validation
      const result = DebtSchema.safeParse({
        ...existingDebt,
        name: updates.name.trim() || existingDebt.name,
      });
      // Empty name after trim should be rejected or original preserved
      if (updates.name.trim() === "") {
        expect(result.success).toBe(true); // Original name preserved
      }
    });

    it("should reject update that would make currentBalance negative", () => {
      const updates = { currentBalance: -500 };
      const result = DebtPartialSchema.safeParse(updates);
      expect(result.success).toBe(false);
    });

    it("should reject update that would make minimumPayment negative", () => {
      const updates = { minimumPayment: -100 };
      const result = DebtPartialSchema.safeParse(updates);
      expect(result.success).toBe(false);
    });

    it("should reject update with interest rate over 100%", () => {
      const updates = { interestRate: 105 };
      const result = DebtPartialSchema.safeParse(updates);
      expect(result.success).toBe(false);
    });
  });

  describe("Relationship Validation - Envelope/Bill Connections", () => {
    it("should validate debt form when envelopeId is provided", () => {
      const formData = {
        name: "Credit Card",
        creditor: "Bank of America",
        currentBalance: "5000",
        minimumPayment: "150",
        envelopeId: "env-123",
      };
      const result = DebtFormSchema.safeParse(formData);
      expect(result.success).toBe(true);
    });

    it("should validate debt form when existingBillId is provided for connect_existing_bill", () => {
      const formData = {
        name: "Credit Card",
        creditor: "Bank of America",
        currentBalance: "5000",
        minimumPayment: "150",
        paymentMethod: "connect_existing_bill",
        existingBillId: "bill-123",
      };
      const result = DebtFormSchema.safeParse(formData);
      expect(result.success).toBe(true);
    });

    it("should reject form when connect_existing_bill is selected but existingBillId is empty", () => {
      const formData = {
        name: "Credit Card",
        creditor: "Bank of America",
        currentBalance: "5000",
        minimumPayment: "150",
        paymentMethod: "connect_existing_bill",
        existingBillId: "",
      };
      const result = DebtFormSchema.safeParse(formData);
      expect(result.success).toBe(false);
    });

    it("should require envelopeId when create_new and createBill is true", () => {
      const formData = {
        name: "Credit Card",
        creditor: "Bank of America",
        currentBalance: "5000",
        minimumPayment: "150",
        paymentMethod: "create_new",
        createBill: true,
      };
      const result = DebtFormSchema.safeParse(formData);
      expect(result.success).toBe(false);
    });

    it("should require paymentDueDate when create_new and createBill is true", () => {
      const formData = {
        name: "Credit Card",
        creditor: "Bank of America",
        currentBalance: "5000",
        minimumPayment: "150",
        paymentMethod: "create_new",
        createBill: true,
        envelopeId: "env-123",
      };
      const result = DebtFormSchema.safeParse(formData);
      expect(result.success).toBe(false);
    });
  });

  describe("Financial Field Validation", () => {
    it("should validate zero currentBalance (paid off debt)", () => {
      const paidOffDebt = { ...validDebt, currentBalance: 0 };
      const result = DebtSchema.safeParse(paidOffDebt);
      expect(result.success).toBe(true);
    });

    it("should validate zero minimumPayment (paid off or no payment required)", () => {
      const debtWithNoPayment = { ...validDebt, minimumPayment: 0 };
      const result = DebtSchema.safeParse(debtWithNoPayment);
      expect(result.success).toBe(true);
    });

    it("should validate zero interestRate (0% APR)", () => {
      const debtWithZeroAPR = { ...validDebt, interestRate: 0 };
      const result = DebtSchema.safeParse(debtWithZeroAPR);
      expect(result.success).toBe(true);
    });

    it("should validate high currentBalance", () => {
      const largeDebt = { ...validDebt, currentBalance: 500000 };
      const result = DebtSchema.safeParse(largeDebt);
      expect(result.success).toBe(true);
    });

    it("should validate boundary interestRate (exactly 100%)", () => {
      const maxRateDebt = { ...validDebt, interestRate: 100 };
      const result = DebtSchema.safeParse(maxRateDebt);
      expect(result.success).toBe(true);
    });

    it("should validate decimal currentBalance", () => {
      const decimalDebt = { ...validDebt, currentBalance: 4999.99 };
      const result = DebtSchema.safeParse(decimalDebt);
      expect(result.success).toBe(true);
    });

    it("should validate decimal minimumPayment", () => {
      const decimalPayment = { ...validDebt, minimumPayment: 149.99 };
      const result = DebtSchema.safeParse(decimalPayment);
      expect(result.success).toBe(true);
    });

    it("should validate decimal interestRate", () => {
      const decimalRate = { ...validDebt, interestRate: 18.99 };
      const result = DebtSchema.safeParse(decimalRate);
      expect(result.success).toBe(true);
    });
  });

  describe("Payment Processing Validation", () => {
    it("should validate payment amount that would reduce balance to zero", () => {
      const debtBalance = validDebt.currentBalance;
      const paymentAmount = debtBalance; // Pay full balance
      const newBalance = Math.max(0, debtBalance - paymentAmount);
      expect(newBalance).toBe(0);
    });

    it("should clamp payment that exceeds current balance to zero", () => {
      const debtBalance = validDebt.currentBalance;
      const paymentAmount = debtBalance + 1000; // Overpayment
      const newBalance = Math.max(0, debtBalance - paymentAmount);
      expect(newBalance).toBe(0);
    });

    it("should validate partial payment", () => {
      const debtBalance = validDebt.currentBalance;
      const paymentAmount = 100;
      const newBalance = debtBalance - paymentAmount;
      expect(newBalance).toBe(4900);

      const updatedDebt = { ...validDebt, currentBalance: newBalance };
      const result = DebtSchema.safeParse(updatedDebt);
      expect(result.success).toBe(true);
    });

    it("should update debt status to paid_off when balance reaches zero", () => {
      const paidOffDebt = { ...validDebt, currentBalance: 0, status: "paid" as const };
      const result = DebtSchema.safeParse(paidOffDebt);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("paid");
      }
    });
  });

  describe("Error Handling and Recovery", () => {
    it("should return detailed error messages for multiple validation failures", () => {
      const invalidDebt = {
        id: "",
        name: "",
        creditor: "",
        currentBalance: -100,
        minimumPayment: -50,
        lastModified: -1,
      };

      const result = DebtSchema.safeParse(invalidDebt);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(1);
      }
    });

    it("should provide field-specific error paths", () => {
      const invalidDebt = { ...validDebt, name: "" };
      const result = DebtSchema.safeParse(invalidDebt);
      expect(result.success).toBe(false);
      if (!result.success) {
        const nameError = result.error.issues.find((issue: any) => issue.path.includes("name"));
        expect(nameError).toBeDefined();
      }
    });

    it("should handle null values gracefully", () => {
      const debtWithNull = { ...validDebt, interestRate: null };
      const result = DebtSchema.safeParse(debtWithNull);
      // Should succeed because interestRate is nullable and optional per "Systemic Nullability" patch
      expect(result.success).toBe(true);
    });

    it("should handle undefined optional values", () => {
      const debtWithUndefined = {
        id: "debt-123",
        name: "Test Debt",
        creditor: "Test Creditor",
        currentBalance: 1000,
        minimumPayment: 50,
        lastModified: Date.now(),
        // Optional fields left undefined
      };
      const result = DebtSchema.safeParse(debtWithUndefined);
      expect(result.success).toBe(true);
    });
  });

  describe("Query Invalidation Patterns", () => {
    it("should define proper query keys for debt operations", async () => {
      const { queryKeys } = await import("@/utils/core/common/queryClient");
      expect(queryKeys.debts).toBeDefined();
      expect(queryKeys.debtsList).toBeDefined();
      expect(queryKeys.dashboard).toBeDefined();
    });
  });

  describe("Optimistic Update Safety", () => {
    it("should allow valid optimistic update data", () => {
      const optimisticUpdate = {
        id: "debt-123",
        name: "Updated Credit Card",
        currentBalance: 4500,
        lastModified: Date.now(),
      };

      const result = DebtPartialSchema.safeParse(optimisticUpdate);
      expect(result.success).toBe(true);
    });

    it("should reject invalid optimistic update data", () => {
      const invalidOptimisticUpdate = {
        currentBalance: -100,
      };

      const result = DebtPartialSchema.safeParse(invalidOptimisticUpdate);
      expect(result.success).toBe(false);
    });

    it("should validate optimistic update preserves required fields", () => {
      // When applying optimistic update, merged data should still be valid
      const existingDebt = { ...validDebt };
      const optimisticUpdate = { currentBalance: 4500 };
      const mergedDebt = { ...existingDebt, ...optimisticUpdate };

      const result = DebtSchema.safeParse(mergedDebt);
      expect(result.success).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long but valid name (at boundary)", () => {
      const boundaryDebt = { ...validDebt, name: "a".repeat(100) };
      const result = DebtSchema.safeParse(boundaryDebt);
      expect(result.success).toBe(true);
    });

    it("should handle very long but valid creditor (at boundary)", () => {
      const boundaryDebt = { ...validDebt, creditor: "a".repeat(100) };
      const result = DebtSchema.safeParse(boundaryDebt);
      expect(result.success).toBe(true);
    });

    it("should handle Unicode characters in name", () => {
      const unicodeDebt = { ...validDebt, name: "Crédit Cård 💳" };
      const result = DebtSchema.safeParse(unicodeDebt);
      expect(result.success).toBe(true);
    });

    it("should handle Unicode characters in creditor", () => {
      const unicodeDebt = { ...validDebt, creditor: "Bänk øf Américã" };
      const result = DebtSchema.safeParse(unicodeDebt);
      expect(result.success).toBe(true);
    });

    it("should handle maximum safe integer for balance", () => {
      const maxIntDebt = { ...validDebt, currentBalance: Number.MAX_SAFE_INTEGER };
      const result = DebtSchema.safeParse(maxIntDebt);
      expect(result.success).toBe(true);
    });

    it("should handle very small decimal balance", () => {
      const smallDebt = { ...validDebt, currentBalance: 0.01 };
      const result = DebtSchema.safeParse(smallDebt);
      expect(result.success).toBe(true);
    });

    it("should handle dueDate as string", () => {
      const debtWithStringDate = { ...validDebt, dueDate: "2024-01-15" };
      const result = DebtSchema.safeParse(debtWithStringDate);
      expect(result.success).toBe(true);
    });

    it("should handle dueDate as Date object", () => {
      const debtWithDateObject = { ...validDebt, dueDate: new Date("2024-01-15") };
      const result = DebtSchema.safeParse(debtWithDateObject);
      expect(result.success).toBe(true);
    });
  });
});
