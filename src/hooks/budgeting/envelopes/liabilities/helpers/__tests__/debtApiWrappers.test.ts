/**
 * Tests for Debt API Wrappers
 * Comprehensive coverage for API wrapper functions and grouping utilities
 */

import { describe, it, expect, vi } from "vitest";
import { createAPIWrappers, groupDebtsByStatus, groupDebtsByType } from "../debtApiWrappers";
import type { DebtAccount } from "@/types/debt";

describe("debtApiWrappers", () => {
  describe("createAPIWrappers", () => {
    describe("createEnvelopeWrapper", () => {
      it("should create envelope with addEnvelopeAsync when provided", async () => {
        const mockAddEnvelopeAsync = vi.fn().mockResolvedValue({ id: "envelope-123" });
        const mockCreateEnvelope = vi.fn();
        const mockAddBillAsync = vi.fn();
        const mockUpdateBillAsync = vi.fn();
        const mockCreateTransaction = vi.fn();

        const wrappers = createAPIWrappers(
          mockAddEnvelopeAsync,
          mockCreateEnvelope,
          mockAddBillAsync,
          mockUpdateBillAsync,
          mockCreateTransaction
        );

        const result = await wrappers.createEnvelopeWrapper({ name: "Test Envelope" });

        expect(mockAddEnvelopeAsync).toHaveBeenCalledWith({ name: "Test Envelope" });
        expect(mockCreateEnvelope).not.toHaveBeenCalled();
        expect(result).toEqual({ id: "envelope-123" });
      });

      it("should create envelope with createEnvelope when addEnvelopeAsync is undefined", async () => {
        const mockCreateEnvelope = vi.fn().mockResolvedValue({ id: "envelope-456" });
        const mockAddBillAsync = vi.fn();
        const mockUpdateBillAsync = vi.fn();
        const mockCreateTransaction = vi.fn();

        const wrappers = createAPIWrappers(
          undefined,
          mockCreateEnvelope,
          mockAddBillAsync,
          mockUpdateBillAsync,
          mockCreateTransaction
        );

        const result = await wrappers.createEnvelopeWrapper({ name: "Test Envelope" });

        expect(mockCreateEnvelope).toHaveBeenCalledWith({ name: "Test Envelope" });
        expect(result).toEqual({ id: "envelope-456" });
      });

      it("should handle envelope data with additional properties", async () => {
        const mockAddEnvelopeAsync = vi.fn().mockResolvedValue({
          id: "envelope-789",
          name: "Test",
          category: "debt",
        });
        const mockCreateEnvelope = vi.fn();
        const mockAddBillAsync = vi.fn();
        const mockUpdateBillAsync = vi.fn();
        const mockCreateTransaction = vi.fn();

        const wrappers = createAPIWrappers(
          mockAddEnvelopeAsync,
          mockCreateEnvelope,
          mockAddBillAsync,
          mockUpdateBillAsync,
          mockCreateTransaction
        );

        const result = await wrappers.createEnvelopeWrapper({
          name: "Test",
          category: "debt",
        });

        expect(result.id).toBe("envelope-789");
      });
    });

    describe("createBillWrapper", () => {
      it("should create bill with basic data", async () => {
        const mockAddEnvelopeAsync = vi.fn();
        const mockCreateEnvelope = vi.fn();
        const mockAddBillAsync = vi.fn().mockResolvedValue({
          id: "bill-123",
          debtId: "debt-456",
          amount: 500,
        });
        const mockUpdateBillAsync = vi.fn();
        const mockCreateTransaction = vi.fn();

        const wrappers = createAPIWrappers(
          mockAddEnvelopeAsync,
          mockCreateEnvelope,
          mockAddBillAsync,
          mockUpdateBillAsync,
          mockCreateTransaction
        );

        const result = await wrappers.createBillWrapper({
          debtId: "debt-456",
          amount: 500,
        });

        expect(mockAddBillAsync).toHaveBeenCalledWith({
          debtId: "debt-456",
          amount: 500,
        });
        expect(result).toEqual({
          id: "bill-123",
          debtId: "debt-456",
          amount: 500,
          dueDate: undefined,
        });
      });

      it("should convert Date object to ISO string for dueDate", async () => {
        const mockAddEnvelopeAsync = vi.fn();
        const mockCreateEnvelope = vi.fn();
        const testDate = new Date("2026-02-15T10:00:00Z");
        const mockAddBillAsync = vi.fn().mockResolvedValue({
          id: "bill-123",
          dueDate: testDate,
        });
        const mockUpdateBillAsync = vi.fn();
        const mockCreateTransaction = vi.fn();

        const wrappers = createAPIWrappers(
          mockAddEnvelopeAsync,
          mockCreateEnvelope,
          mockAddBillAsync,
          mockUpdateBillAsync,
          mockCreateTransaction
        );

        const result = await wrappers.createBillWrapper({
          name: "Test Bill",
          dueDate: testDate,
        });

        expect(result.dueDate).toBe(testDate.toISOString());
      });

      it("should preserve string dueDate", async () => {
        const mockAddEnvelopeAsync = vi.fn();
        const mockCreateEnvelope = vi.fn();
        const dateString = "2026-02-15T10:00:00Z";
        const mockAddBillAsync = vi.fn().mockResolvedValue({
          id: "bill-123",
          dueDate: dateString,
        });
        const mockUpdateBillAsync = vi.fn();
        const mockCreateTransaction = vi.fn();

        const wrappers = createAPIWrappers(
          mockAddEnvelopeAsync,
          mockCreateEnvelope,
          mockAddBillAsync,
          mockUpdateBillAsync,
          mockCreateTransaction
        );

        const result = await wrappers.createBillWrapper({
          name: "Test Bill",
          dueDate: dateString,
        });

        expect(result.dueDate).toBe(dateString);
      });

      it("should handle bill with all optional fields", async () => {
        const mockAddEnvelopeAsync = vi.fn();
        const mockCreateEnvelope = vi.fn();
        const mockAddBillAsync = vi.fn().mockResolvedValue({
          id: "bill-789",
          debtId: "debt-999",
          envelopeId: "envelope-888",
          amount: 1000,
          dueDate: "2026-03-01",
        });
        const mockUpdateBillAsync = vi.fn();
        const mockCreateTransaction = vi.fn();

        const wrappers = createAPIWrappers(
          mockAddEnvelopeAsync,
          mockCreateEnvelope,
          mockAddBillAsync,
          mockUpdateBillAsync,
          mockCreateTransaction
        );

        const result = await wrappers.createBillWrapper({
          debtId: "debt-999",
          envelopeId: "envelope-888",
          amount: 1000,
        });

        expect(result).toEqual({
          id: "bill-789",
          debtId: "debt-999",
          envelopeId: "envelope-888",
          amount: 1000,
          dueDate: "2026-03-01",
        });
      });

      it("should handle undefined dueDate", async () => {
        const mockAddEnvelopeAsync = vi.fn();
        const mockCreateEnvelope = vi.fn();
        const mockAddBillAsync = vi.fn().mockResolvedValue({
          id: "bill-123",
          amount: 500,
        });
        const mockUpdateBillAsync = vi.fn();
        const mockCreateTransaction = vi.fn();

        const wrappers = createAPIWrappers(
          mockAddEnvelopeAsync,
          mockCreateEnvelope,
          mockAddBillAsync,
          mockUpdateBillAsync,
          mockCreateTransaction
        );

        const result = await wrappers.createBillWrapper({
          amount: 500,
        });

        expect(result.dueDate).toBeUndefined();
      });

      it("should handle non-standard dueDate types as undefined", async () => {
        const mockAddEnvelopeAsync = vi.fn();
        const mockCreateEnvelope = vi.fn();
        const mockAddBillAsync = vi.fn().mockResolvedValue({
          id: "bill-123",
          dueDate: 12345,
        });
        const mockUpdateBillAsync = vi.fn();
        const mockCreateTransaction = vi.fn();

        const wrappers = createAPIWrappers(
          mockAddEnvelopeAsync,
          mockCreateEnvelope,
          mockAddBillAsync,
          mockUpdateBillAsync,
          mockCreateTransaction
        );

        const result = await wrappers.createBillWrapper({
          amount: 500,
        });

        expect(result.dueDate).toBeUndefined();
      });
    });

    describe("updateBillWrapper", () => {
      it("should update bill with id and data", async () => {
        const mockAddEnvelopeAsync = vi.fn();
        const mockCreateEnvelope = vi.fn();
        const mockAddBillAsync = vi.fn();
        const mockUpdateBillAsync = vi.fn().mockResolvedValue(undefined);
        const mockCreateTransaction = vi.fn();

        const wrappers = createAPIWrappers(
          mockAddEnvelopeAsync,
          mockCreateEnvelope,
          mockAddBillAsync,
          mockUpdateBillAsync,
          mockCreateTransaction
        );

        await wrappers.updateBillWrapper("bill-123", { amount: 750 });

        expect(mockUpdateBillAsync).toHaveBeenCalledWith("bill-123", { amount: 750 });
      });

      it("should handle empty updates", async () => {
        const mockAddEnvelopeAsync = vi.fn();
        const mockCreateEnvelope = vi.fn();
        const mockAddBillAsync = vi.fn();
        const mockUpdateBillAsync = vi.fn().mockResolvedValue(undefined);
        const mockCreateTransaction = vi.fn();

        const wrappers = createAPIWrappers(
          mockAddEnvelopeAsync,
          mockCreateEnvelope,
          mockAddBillAsync,
          mockUpdateBillAsync,
          mockCreateTransaction
        );

        await wrappers.updateBillWrapper("bill-456", {});

        expect(mockUpdateBillAsync).toHaveBeenCalledWith("bill-456", {});
      });

      it("should handle multiple field updates", async () => {
        const mockAddEnvelopeAsync = vi.fn();
        const mockCreateEnvelope = vi.fn();
        const mockAddBillAsync = vi.fn();
        const mockUpdateBillAsync = vi.fn().mockResolvedValue(undefined);
        const mockCreateTransaction = vi.fn();

        const wrappers = createAPIWrappers(
          mockAddEnvelopeAsync,
          mockCreateEnvelope,
          mockAddBillAsync,
          mockUpdateBillAsync,
          mockCreateTransaction
        );

        const updates = {
          amount: 1200,
          dueDate: "2026-04-01",
          isPaid: true,
        };

        await wrappers.updateBillWrapper("bill-789", updates);

        expect(mockUpdateBillAsync).toHaveBeenCalledWith("bill-789", updates);
      });
    });

    describe("createTransactionWrapper", () => {
      it("should create transaction with data", async () => {
        const mockAddEnvelopeAsync = vi.fn();
        const mockCreateEnvelope = vi.fn();
        const mockAddBillAsync = vi.fn();
        const mockUpdateBillAsync = vi.fn();
        const mockCreateTransaction = vi.fn().mockResolvedValue(undefined);

        const wrappers = createAPIWrappers(
          mockAddEnvelopeAsync,
          mockCreateEnvelope,
          mockAddBillAsync,
          mockUpdateBillAsync,
          mockCreateTransaction
        );

        const transactionData = {
          amount: -500,
          description: "Debt payment",
          envelopeId: "envelope-123",
        };

        await wrappers.createTransactionWrapper(transactionData);

        expect(mockCreateTransaction).toHaveBeenCalledWith(transactionData);
      });

      it("should handle transaction with all fields", async () => {
        const mockAddEnvelopeAsync = vi.fn();
        const mockCreateEnvelope = vi.fn();
        const mockAddBillAsync = vi.fn();
        const mockUpdateBillAsync = vi.fn();
        const mockCreateTransaction = vi.fn().mockResolvedValue(undefined);

        const wrappers = createAPIWrappers(
          mockAddEnvelopeAsync,
          mockCreateEnvelope,
          mockAddBillAsync,
          mockUpdateBillAsync,
          mockCreateTransaction
        );

        const transactionData = {
          amount: -750,
          description: "Credit card payment",
          envelopeId: "envelope-456",
          date: "2026-02-01",
          category: "debt",
        };

        await wrappers.createTransactionWrapper(transactionData);

        expect(mockCreateTransaction).toHaveBeenCalledWith(transactionData);
      });

      it("should handle empty transaction data", async () => {
        const mockAddEnvelopeAsync = vi.fn();
        const mockCreateEnvelope = vi.fn();
        const mockAddBillAsync = vi.fn();
        const mockUpdateBillAsync = vi.fn();
        const mockCreateTransaction = vi.fn().mockResolvedValue(undefined);

        const wrappers = createAPIWrappers(
          mockAddEnvelopeAsync,
          mockCreateEnvelope,
          mockAddBillAsync,
          mockUpdateBillAsync,
          mockCreateTransaction
        );

        await wrappers.createTransactionWrapper({});

        expect(mockCreateTransaction).toHaveBeenCalledWith({});
      });
    });

    describe("all wrappers integration", () => {
      it("should create all wrappers successfully", () => {
        const mockAddEnvelopeAsync = vi.fn();
        const mockCreateEnvelope = vi.fn();
        const mockAddBillAsync = vi.fn();
        const mockUpdateBillAsync = vi.fn();
        const mockCreateTransaction = vi.fn();

        const wrappers = createAPIWrappers(
          mockAddEnvelopeAsync,
          mockCreateEnvelope,
          mockAddBillAsync,
          mockUpdateBillAsync,
          mockCreateTransaction
        );

        expect(wrappers.createEnvelopeWrapper).toBeDefined();
        expect(wrappers.createBillWrapper).toBeDefined();
        expect(wrappers.updateBillWrapper).toBeDefined();
        expect(wrappers.createTransactionWrapper).toBeDefined();
        expect(typeof wrappers.createEnvelopeWrapper).toBe("function");
        expect(typeof wrappers.createBillWrapper).toBe("function");
        expect(typeof wrappers.updateBillWrapper).toBe("function");
        expect(typeof wrappers.createTransactionWrapper).toBe("function");
      });
    });
  });

  describe("groupDebtsByStatus", () => {
    const mockDebts: DebtAccount[] = [
      {
        id: "debt-1",
        name: "Credit Card A",
        creditor: "Bank A",
        balance: 1000,
        interestRate: 15.99,
        minimumPayment: 50,
        type: "credit_card",
        status: "active",
        paymentFrequency: "monthly",
        compoundFrequency: "monthly",
      },
      {
        id: "debt-2",
        name: "Credit Card B",
        creditor: "Bank B",
        balance: 2000,
        interestRate: 18.99,
        minimumPayment: 75,
        type: "credit_card",
        status: "active",
        paymentFrequency: "monthly",
        compoundFrequency: "monthly",
      },
      {
        id: "debt-3",
        name: "Student Loan",
        creditor: "Lender C",
        balance: 5000,
        interestRate: 5.5,
        minimumPayment: 150,
        type: "student",
        status: "paid_off",
        paymentFrequency: "monthly",
        compoundFrequency: "monthly",
      },
      {
        id: "debt-4",
        name: "Personal Loan",
        creditor: "Lender D",
        balance: 3000,
        interestRate: 12.0,
        minimumPayment: 100,
        type: "personal",
        status: "deferred",
        paymentFrequency: "monthly",
        compoundFrequency: "monthly",
      },
    ];

    it("should group debts by status correctly", () => {
      const statusValues = {
        ACTIVE: "active",
        PAID_OFF: "paid_off",
        DEFERRED: "deferred",
        DEFAULT: "default",
      };

      const grouped = groupDebtsByStatus(mockDebts, statusValues);

      expect(grouped.active).toHaveLength(2);
      expect(grouped.paid_off).toHaveLength(1);
      expect(grouped.deferred).toHaveLength(1);
      expect(grouped.default).toHaveLength(0);
    });

    it("should return empty arrays for statuses with no matching debts", () => {
      const statusValues = {
        ACTIVE: "active",
        PAID_OFF: "paid_off",
        DEFERRED: "deferred",
        DEFAULT: "default",
      };

      const grouped = groupDebtsByStatus(mockDebts, statusValues);

      expect(grouped.default).toEqual([]);
    });

    it("should handle empty debt array", () => {
      const statusValues = {
        ACTIVE: "active",
        PAID_OFF: "paid_off",
      };

      const grouped = groupDebtsByStatus([], statusValues);

      expect(grouped.active).toEqual([]);
      expect(grouped.paid_off).toEqual([]);
    });

    it("should handle empty status values", () => {
      const grouped = groupDebtsByStatus(mockDebts, {});

      expect(Object.keys(grouped)).toHaveLength(0);
    });

    it("should preserve debt object properties", () => {
      const statusValues = {
        ACTIVE: "active",
      };

      const grouped = groupDebtsByStatus(mockDebts, statusValues);
      const activeDebt = grouped.active[0];

      expect(activeDebt).toBeDefined();
      expect(activeDebt.id).toBe("debt-1");
      expect(activeDebt.name).toBe("Credit Card A");
      expect(activeDebt.balance).toBe(1000);
    });

    it("should work with single status", () => {
      const statusValues = {
        ACTIVE: "active",
      };

      const grouped = groupDebtsByStatus(mockDebts, statusValues);

      expect(Object.keys(grouped)).toHaveLength(1);
      expect(grouped.active).toHaveLength(2);
    });
  });

  describe("groupDebtsByType", () => {
    const mockDebts: DebtAccount[] = [
      {
        id: "debt-1",
        name: "Credit Card A",
        creditor: "Bank A",
        balance: 1000,
        interestRate: 15.99,
        minimumPayment: 50,
        type: "credit_card",
        status: "active",
        paymentFrequency: "monthly",
        compoundFrequency: "monthly",
      },
      {
        id: "debt-2",
        name: "Credit Card B",
        creditor: "Bank B",
        balance: 2000,
        interestRate: 18.99,
        minimumPayment: 75,
        type: "credit_card",
        status: "active",
        paymentFrequency: "monthly",
        compoundFrequency: "monthly",
      },
      {
        id: "debt-3",
        name: "Student Loan",
        creditor: "Lender C",
        balance: 5000,
        interestRate: 5.5,
        minimumPayment: 150,
        type: "student",
        status: "active",
        paymentFrequency: "monthly",
        compoundFrequency: "monthly",
      },
      {
        id: "debt-4",
        name: "Mortgage",
        creditor: "Bank D",
        balance: 200000,
        interestRate: 3.5,
        minimumPayment: 1200,
        type: "mortgage",
        status: "active",
        paymentFrequency: "monthly",
        compoundFrequency: "monthly",
      },
      {
        id: "debt-5",
        name: "Auto Loan",
        creditor: "Auto Finance",
        balance: 15000,
        interestRate: 4.5,
        minimumPayment: 350,
        type: "auto",
        status: "active",
        paymentFrequency: "monthly",
        compoundFrequency: "monthly",
      },
    ];

    it("should group debts by type correctly", () => {
      const typeValues = {
        CREDIT_CARD: "credit_card",
        STUDENT: "student",
        MORTGAGE: "mortgage",
        AUTO: "auto",
        PERSONAL: "personal",
      };

      const grouped = groupDebtsByType(mockDebts, typeValues);

      expect(grouped.credit_card).toHaveLength(2);
      expect(grouped.student).toHaveLength(1);
      expect(grouped.mortgage).toHaveLength(1);
      expect(grouped.auto).toHaveLength(1);
      expect(grouped.personal).toHaveLength(0);
    });

    it("should return empty arrays for types with no matching debts", () => {
      const typeValues = {
        CREDIT_CARD: "credit_card",
        BUSINESS: "business",
      };

      const grouped = groupDebtsByType(mockDebts, typeValues);

      expect(grouped.business).toEqual([]);
    });

    it("should handle empty debt array", () => {
      const typeValues = {
        CREDIT_CARD: "credit_card",
        STUDENT: "student",
      };

      const grouped = groupDebtsByType([], typeValues);

      expect(grouped.credit_card).toEqual([]);
      expect(grouped.student).toEqual([]);
    });

    it("should handle empty type values", () => {
      const grouped = groupDebtsByType(mockDebts, {});

      expect(Object.keys(grouped)).toHaveLength(0);
    });

    it("should preserve debt object properties", () => {
      const typeValues = {
        CREDIT_CARD: "credit_card",
      };

      const grouped = groupDebtsByType(mockDebts, typeValues);
      const creditCardDebt = grouped.credit_card[0];

      expect(creditCardDebt).toBeDefined();
      expect(creditCardDebt.id).toBe("debt-1");
      expect(creditCardDebt.name).toBe("Credit Card A");
      expect(creditCardDebt.type).toBe("credit_card");
    });

    it("should work with single type", () => {
      const typeValues = {
        MORTGAGE: "mortgage",
      };

      const grouped = groupDebtsByType(mockDebts, typeValues);

      expect(Object.keys(grouped)).toHaveLength(1);
      expect(grouped.mortgage).toHaveLength(1);
    });

    it("should handle all debt types", () => {
      const allDebts: DebtAccount[] = [
        {
          id: "1",
          name: "Mortgage",
          creditor: "Bank",
          balance: 200000,
          interestRate: 3.5,
          minimumPayment: 1200,
          type: "mortgage",
          status: "active",
          paymentFrequency: "monthly",
          compoundFrequency: "monthly",
        },
        {
          id: "2",
          name: "Auto",
          creditor: "Dealer",
          balance: 15000,
          interestRate: 4.5,
          minimumPayment: 350,
          type: "auto",
          status: "active",
          paymentFrequency: "monthly",
          compoundFrequency: "monthly",
        },
        {
          id: "3",
          name: "Credit Card",
          creditor: "Bank",
          balance: 1000,
          interestRate: 15.99,
          minimumPayment: 50,
          type: "credit_card",
          status: "active",
          paymentFrequency: "monthly",
          compoundFrequency: "monthly",
        },
        {
          id: "4",
          name: "Chapter 13",
          creditor: "Trustee",
          balance: 10000,
          interestRate: 0,
          minimumPayment: 500,
          type: "chapter13",
          status: "active",
          paymentFrequency: "monthly",
          compoundFrequency: "monthly",
        },
        {
          id: "5",
          name: "Student Loan",
          creditor: "Lender",
          balance: 5000,
          interestRate: 5.5,
          minimumPayment: 150,
          type: "student",
          status: "active",
          paymentFrequency: "monthly",
          compoundFrequency: "monthly",
        },
        {
          id: "6",
          name: "Personal Loan",
          creditor: "Lender",
          balance: 3000,
          interestRate: 12.0,
          minimumPayment: 100,
          type: "personal",
          status: "active",
          paymentFrequency: "monthly",
          compoundFrequency: "monthly",
        },
        {
          id: "7",
          name: "Business Loan",
          creditor: "Bank",
          balance: 50000,
          interestRate: 7.5,
          minimumPayment: 800,
          type: "business",
          status: "active",
          paymentFrequency: "monthly",
          compoundFrequency: "monthly",
        },
        {
          id: "8",
          name: "Other Debt",
          creditor: "Other",
          balance: 2000,
          interestRate: 10.0,
          minimumPayment: 75,
          type: "other",
          status: "active",
          paymentFrequency: "monthly",
          compoundFrequency: "monthly",
        },
      ];

      const typeValues = {
        MORTGAGE: "mortgage",
        AUTO: "auto",
        CREDIT_CARD: "credit_card",
        CHAPTER13: "chapter13",
        STUDENT: "student",
        PERSONAL: "personal",
        BUSINESS: "business",
        OTHER: "other",
      };

      const grouped = groupDebtsByType(allDebts, typeValues);

      expect(grouped.mortgage).toHaveLength(1);
      expect(grouped.auto).toHaveLength(1);
      expect(grouped.credit_card).toHaveLength(1);
      expect(grouped.chapter13).toHaveLength(1);
      expect(grouped.student).toHaveLength(1);
      expect(grouped.personal).toHaveLength(1);
      expect(grouped.business).toHaveLength(1);
      expect(grouped.other).toHaveLength(1);
    });
  });
});
