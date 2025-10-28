/**
 * @jest-environment jsdom
 */

import { renderHook, act } from "@testing-library/react";
import { vi } from "vitest";
import { useDebtForm } from "../useDebtForm";
import { DEBT_TYPES, PAYMENT_FREQUENCIES } from "@/constants/debts";

interface DebtFormErrors {
  name?: string;
  creditor?: string;
  currentBalance?: string;
  originalBalance?: string;
  interestRate?: string;
  minimumPayment?: string;
  existingBillId?: string;
  submit?: string;
  [key: string]: string | undefined;
}

describe("useDebtForm", () => {
  const mockDebt = {
    id: "test-debt-1",
    name: "Test Debt",
    creditor: "Test Bank",
    type: DEBT_TYPES.CREDIT_CARD,
    currentBalance: 5000,
    originalBalance: 8000,
    interestRate: 18.5,
    minimumPayment: 150,
    paymentFrequency: PAYMENT_FREQUENCIES.MONTHLY,
    paymentDueDate: "2024-01-15",
    notes: "Test notes",
    envelopeId: "env-1",
  };

  const mockConnectedBill = {
    id: "bill-1",
    debtId: "test-debt-1",
    envelopeId: "env-1",
  };

  const mockConnectedEnvelope = {
    id: "env-1",
    name: "Debt Payments",
  };

  describe("Form initialization", () => {
    test("should initialize with default form state for new debt", () => {
      const { result } = renderHook(() => useDebtForm(null, true));

      expect(result.current.formData.name).toBe("");
      expect(result.current.formData.type).toBe(DEBT_TYPES.PERSONAL);
      expect(result.current.formData.paymentFrequency).toBe(PAYMENT_FREQUENCIES.MONTHLY);
      expect(result.current.formData.createBill).toBe(true);
      expect(result.current.isEditMode).toBe(false);
    });

    test("should initialize with debt data for edit mode", () => {
      const { result } = renderHook(() => useDebtForm(mockDebt, true));

      expect(result.current.formData.name).toBe("Test Debt");
      expect(result.current.formData.creditor).toBe("Test Bank");
      expect(result.current.formData.type).toBe(DEBT_TYPES.CREDIT_CARD);
      expect(result.current.formData.currentBalance).toBe("5000");
      expect(result.current.formData.originalBalance).toBe("8000");
      expect(result.current.formData.interestRate).toBe("18.5");
      expect(result.current.formData.minimumPayment).toBe("150");
      expect(result.current.formData.createBill).toBe(false);
      expect(result.current.isEditMode).toBe(true);
    });

    test("should set payment method based on connected bill", () => {
      const { result } = renderHook(() =>
        useDebtForm(mockDebt, true, mockConnectedBill, mockConnectedEnvelope)
      );

      expect(result.current.formData.paymentMethod).toBe("connect_existing_bill");
      expect(result.current.formData.existingBillId).toBe("bill-1");
    });
  });

  describe("Form validation", () => {
    test("should validate required fields", () => {
      const { result } = renderHook(() => useDebtForm(null, true));

      act(() => {
        const isValid = result.current.validateForm();
        expect(isValid).toBe(false);
      });

      const errors = result.current.errors as DebtFormErrors;
      expect(errors.name).toBe("Debt name is required");
      expect(errors.creditor).toBe("Creditor name is required");
      expect(errors.currentBalance).toBe("Valid current balance is required");
      expect(errors.minimumPayment).toBe("Valid minimum payment is required");
    });

    test("should validate numeric fields", () => {
      const { result } = renderHook(() => useDebtForm(null, true));

      act(() => {
        result.current.setFormData({
          name: "Test",
          creditor: "Test Bank",
          currentBalance: "-100",
          originalBalance: "-50",
          interestRate: "150",
          minimumPayment: "-25",
        });
      });

      act(() => {
        const isValid = result.current.validateForm();
        expect(isValid).toBe(false);
      });

      const errors = result.current.errors as DebtFormErrors;
      expect(errors.currentBalance).toBe("Valid current balance is required");
      expect(errors.originalBalance).toBe("Original balance must be positive");
      expect(errors.interestRate).toBe("Interest rate must be between 0 and 100");
      expect(errors.minimumPayment).toBe("Valid minimum payment is required");
    });

    test("should pass validation with valid data", () => {
      const { result } = renderHook(() => useDebtForm(null, true));

      act(() => {
        result.current.setFormData({
          name: "Test Debt",
          creditor: "Test Bank",
          currentBalance: "1000",
          originalBalance: "1200",
          interestRate: "15.5",
          minimumPayment: "50",
          envelopeId: "env-1",
        });
      });

      act(() => {
        const isValid = result.current.validateForm();
        expect(isValid).toBe(true);
      });

      expect(Object.keys(result.current.errors)).toHaveLength(0);
    });

    test("should validate connection-specific fields", () => {
      const { result } = renderHook(() => useDebtForm(null, true));

      act(() => {
        result.current.setFormData({
          name: "Test Debt",
          creditor: "Test Bank",
          currentBalance: "1000",
          minimumPayment: "50",
          paymentMethod: "connect_existing",
          existingBillId: "",
        });
      });

      act(() => {
        const isValid = result.current.validateForm();
        expect(isValid).toBe(false);
      });

      const errors = result.current.errors as DebtFormErrors;
      expect(errors.existingBillId).toBe("Please select a bill to connect");
    });
  });

  describe("Form updates", () => {
    test("should update form data and clear related errors", () => {
      const { result } = renderHook(() => useDebtForm(null, true));

      // First, create some errors
      act(() => {
        result.current.validateForm();
      });

      const errorsBeforeUpdate = result.current.errors as DebtFormErrors;
      expect(errorsBeforeUpdate.name).toBeTruthy();

      // Update the field that had an error
      act(() => {
        result.current.setFormData({ name: "Valid Name" });
      });

      expect(result.current.formData.name).toBe("Valid Name");
      const errorsAfterUpdate = result.current.errors as DebtFormErrors;
      expect(errorsAfterUpdate.name).toBeUndefined();
    });
  });

  describe("Form submission", () => {
    test("should handle successful submission for new debt", async () => {
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useDebtForm(null, true));

      act(() => {
        result.current.setFormData({
          name: "Test Debt",
          creditor: "Test Bank",
          currentBalance: "1000",
          minimumPayment: "50",
          envelopeId: "env-1",
        });
      });

      let submissionResult;
      await act(async () => {
        submissionResult = await result.current.handleSubmit(mockOnSubmit);
      });

      expect(submissionResult).toBe(true);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: "Test Debt",
        creditor: "Test Bank",
        type: DEBT_TYPES.PERSONAL,
        currentBalance: 1000,
        originalBalance: 1000, // Should default to current balance
        interestRate: 0,
        minimumPayment: 50,
        paymentFrequency: PAYMENT_FREQUENCIES.MONTHLY,
        paymentDueDate: "",
        notes: "",
        paymentMethod: "create_new",
        createBill: true,
        envelopeId: "env-1",
        existingBillId: "",
        newEnvelopeName: "",
        connectionData: {
          paymentMethod: "create_new",
          createBill: true,
          envelopeId: "env-1",
          existingBillId: "",
          newEnvelopeName: "",
        },
      });
    });

    test("should handle successful submission for debt edit", async () => {
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useDebtForm(mockDebt, true));

      let submissionResult;
      await act(async () => {
        submissionResult = await result.current.handleSubmit(mockOnSubmit);
      });

      expect(submissionResult).toBe(true);
      expect(mockOnSubmit).toHaveBeenCalledWith(
        "test-debt-1",
        expect.objectContaining({
          name: "Test Debt",
          creditor: "Test Bank",
          currentBalance: 5000,
          minimumPayment: 150,
        })
      );
    });

    test("should handle submission error", async () => {
      const mockOnSubmit = vi.fn().mockRejectedValue(new Error("Submission failed"));
      const { result } = renderHook(() => useDebtForm(null, true));

      act(() => {
        result.current.setFormData({
          name: "Test Debt",
          creditor: "Test Bank",
          currentBalance: "1000",
          minimumPayment: "50",
        });
      });

      let submissionResult;
      await act(async () => {
        submissionResult = await result.current.handleSubmit(mockOnSubmit);
      });

      expect(submissionResult).toBe(false);
      const errors = result.current.errors as DebtFormErrors;
      expect(errors.submit).toBe("Failed to create debt. Please try again.");
    });

    test("should not submit if validation fails", async () => {
      const mockOnSubmit = vi.fn();
      const { result } = renderHook(() => useDebtForm(null, true));

      // Don't set required fields
      let submissionResult;
      await act(async () => {
        submissionResult = await result.current.handleSubmit(mockOnSubmit);
      });

      expect(submissionResult).toBe(false);
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe("Form reset", () => {
    test("should reset form to initial state", () => {
      const { result } = renderHook(() => useDebtForm(null, true));

      // Modify form data
      act(() => {
        result.current.setFormData({
          name: "Test Debt",
          creditor: "Test Bank",
          currentBalance: "1000",
        });
      });

      // Reset form
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.formData.name).toBe("");
      expect(result.current.formData.creditor).toBe("");
      expect(result.current.formData.currentBalance).toBe("");
      expect(result.current.formData.createBill).toBe(true);
      expect(Object.keys(result.current.errors)).toHaveLength(0);
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe("Loading states", () => {
    test("should handle submitting state", async () => {
      const mockOnSubmit = vi
        .fn()
        .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      const { result } = renderHook(() => useDebtForm(null, true));

      act(() => {
        result.current.setFormData({
          name: "Test Debt",
          creditor: "Test Bank",
          currentBalance: "1000",
          minimumPayment: "50",
        });
      });

      expect(result.current.isSubmitting).toBe(false);

      const submissionPromise = act(async () => {
        return result.current.handleSubmit(mockOnSubmit);
      });

      expect(result.current.isSubmitting).toBe(true);

      await submissionPromise;

      expect(result.current.isSubmitting).toBe(false);
    });
  });
});
