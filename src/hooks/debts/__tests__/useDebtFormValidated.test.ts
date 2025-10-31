/**
 * Tests for useDebtFormValidated Hook
 * Part of Issue #987 - Comprehensive Zod Schema Implementation (Phase 3)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useDebtFormValidated } from "../useDebtFormValidated";
import type { Debt } from "@/types/debts";

describe("useDebtFormValidated", () => {
  const mockDebt: Debt = {
    id: "debt-1",
    name: "Credit Card",
    creditor: "Bank of America",
    type: "credit_card",
    status: "active",
    currentBalance: 5000,
    minimumPayment: 150,
    interestRate: 18.5,
    originalBalance: 6000,
    paymentFrequency: "monthly",
    compoundFrequency: "monthly",
    notes: "Test debt",
    lastModified: Date.now(),
    createdAt: Date.now(),
  };

  const mockSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with empty form for new debt", () => {
    const { result } = renderHook(() =>
      useDebtFormValidated({
        debt: null,
        isOpen: true,
        onSubmit: mockSubmit,
      })
    );

    expect(result.current.data.name).toBe("");
    expect(result.current.data.creditor).toBe("");
    expect(result.current.data.type).toBe("personal");
    expect(result.current.isEditMode).toBe(false);
    expect(result.current.errors).toEqual({});
  });

  it("should initialize with debt data for editing", () => {
    const { result } = renderHook(() =>
      useDebtFormValidated({
        debt: mockDebt,
        isOpen: true,
        onSubmit: mockSubmit,
      })
    );

    expect(result.current.data.name).toBe("Credit Card");
    expect(result.current.data.creditor).toBe("Bank of America");
    expect(result.current.data.type).toBe("credit_card");
    expect(result.current.data.currentBalance).toBe("5000");
    expect(result.current.isEditMode).toBe(true);
  });

  it("should update field value", () => {
    const { result } = renderHook(() =>
      useDebtFormValidated({
        debt: null,
        isOpen: true,
        onSubmit: mockSubmit,
      })
    );

    act(() => {
      result.current.updateField("name", "New Debt");
    });

    expect(result.current.data.name).toBe("New Debt");
    expect(result.current.isDirty).toBe(true);
  });

  it("should validate required fields", () => {
    const { result } = renderHook(() =>
      useDebtFormValidated({
        debt: null,
        isOpen: true,
        onSubmit: mockSubmit,
      })
    );

    act(() => {
      result.current.validate();
    });

    // Should have errors for required fields
    expect(result.current.errors.name).toBeDefined();
    expect(result.current.errors.creditor).toBeDefined();
    expect(result.current.errors.currentBalance).toBeDefined();
    expect(result.current.isValid).toBe(false);
  });

  it("should clear errors when fields are updated", () => {
    const { result } = renderHook(() =>
      useDebtFormValidated({
        debt: null,
        isOpen: true,
        onSubmit: mockSubmit,
      })
    );

    // First validate to get errors
    act(() => {
      result.current.validate();
    });

    expect(result.current.errors.name).toBeDefined();

    // Update field should clear its error
    act(() => {
      result.current.updateField("name", "My Debt");
    });

    expect(result.current.errors.name).toBeUndefined();
  });

  it("should handle form submission with valid data", async () => {
    const { result } = renderHook(() =>
      useDebtFormValidated({
        debt: null,
        isOpen: true,
        onSubmit: mockSubmit,
      })
    );

    // Fill in required fields
    act(() => {
      result.current.updateFormData({
        name: "Credit Card",
        creditor: "Chase",
        currentBalance: "1000",
        minimumPayment: "50",
        interestRate: "15",
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });

    expect(mockSubmit).toHaveBeenCalledWith(null, expect.objectContaining({
      name: "Credit Card",
      creditor: "Chase",
    }));
  });

  it("should not submit with invalid data", async () => {
    const { result } = renderHook(() =>
      useDebtFormValidated({
        debt: null,
        isOpen: true,
        onSubmit: mockSubmit,
      })
    );

    // Try to submit empty form
    await act(async () => {
      await result.current.handleSubmit();
    });

    // Should not call onSubmit
    expect(mockSubmit).not.toHaveBeenCalled();
    expect(result.current.isValid).toBe(false);
  });

  it("should reset form to initial state", () => {
    const { result } = renderHook(() =>
      useDebtFormValidated({
        debt: null,
        isOpen: true,
        onSubmit: mockSubmit,
      })
    );

    // Update some fields
    act(() => {
      result.current.updateFormData({
        name: "Test Debt",
        creditor: "Test Bank",
      });
    });

    expect(result.current.isDirty).toBe(true);

    // Reset form
    act(() => {
      result.current.resetForm();
    });

    expect(result.current.data.name).toBe("");
    expect(result.current.data.creditor).toBe("");
    expect(result.current.isDirty).toBe(false);
    expect(result.current.errors).toEqual({});
  });

  it("should set canSubmit to true only when form is valid", () => {
    const { result } = renderHook(() =>
      useDebtFormValidated({
        debt: null,
        isOpen: true,
        onSubmit: mockSubmit,
      })
    );

    // Initially invalid (empty required fields)
    expect(result.current.canSubmit).toBe(false);

    // Fill in required fields
    act(() => {
      result.current.updateFormData({
        name: "Credit Card",
        creditor: "Chase",
        currentBalance: "1000",
        minimumPayment: "50",
      });
      result.current.validate();
    });

    // Should be valid now
    expect(result.current.canSubmit).toBe(true);
  });
});
