import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { usePaycheckForm } from "../usePaycheckForm";
import * as paycheckUtils from "@/utils/budgeting/paycheckUtils";

// Mock the utils
vi.mock("@/utils/budgeting/paycheckUtils", () => ({
  validatePaycheckForm: vi.fn(),
  validateAllocations: vi.fn(),
  getUniquePayers: vi.fn(),
}));

describe("usePaycheckForm", () => {
  const mockCurrentUser = { userName: "John Doe" };
  const mockPaycheckHistory = [
    { id: "1", payerName: "Employer A", amount: 1000, date: new Date() } as any,
  ];

  it("should initialize with default values", () => {
    const { result } = renderHook(() => usePaycheckForm([], mockCurrentUser));

    expect(result.current.formData).toEqual({
      amount: "",
      payerName: "John Doe",
      allocationMode: "allocate",
    });
    expect(result.current.errors).toEqual({});
  });

  it("should update form fields and clear errors", () => {
    const { result } = renderHook(() => usePaycheckForm([], mockCurrentUser));

    act(() => {
      result.current.setErrors({ amount: "Required" });
    });
    expect(result.current.errors.amount).toBe("Required");

    act(() => {
      result.current.updateFormField("amount", "1000");
    });

    expect(result.current.formData.amount).toBe("1000");
    expect(result.current.errors.amount).toBeUndefined();
  });

  it("should reset form to initial values", () => {
    const { result } = renderHook(() => usePaycheckForm([], mockCurrentUser));

    act(() => {
      result.current.updateFormField("amount", "1000");
      result.current.updateFormField("payerName", "New Payer");
    });

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.formData).toEqual({
      amount: "",
      payerName: "John Doe",
      allocationMode: "allocate",
    });
  });

  it("should validate form and merge errors", () => {
    const { result } = renderHook(() => usePaycheckForm([], mockCurrentUser));

    (paycheckUtils.validatePaycheckForm as any).mockReturnValue({
      isValid: false,
      errors: { amount: "Invalid amount" },
    });
    (paycheckUtils.validateAllocations as any).mockReturnValue({
      isValid: false,
      message: "Allocations do not match total",
    });

    act(() => {
      result.current.updateFormField("amount", "1000");
    });

    let isValid;
    act(() => {
      isValid = result.current.validateForm({ allocations: [] });
    });

    expect(isValid).toBe(false);
    expect(result.current.errors).toEqual({
      amount: "Invalid amount",
      allocations: "Allocations do not match total",
    });
  });

  it("should call getUniquePayers for suggestions", () => {
    const mockPayers = ["Employer A", "Employer B"];
    (paycheckUtils.getUniquePayers as any).mockReturnValue(mockPayers);

    const { result } = renderHook(() => usePaycheckForm(mockPaycheckHistory, mockCurrentUser));

    expect(result.current.uniquePayers).toEqual(mockPayers);
    expect(paycheckUtils.getUniquePayers).toHaveBeenCalledWith(mockPaycheckHistory, []);
  });
});
