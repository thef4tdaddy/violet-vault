import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest"; // Removed unused imports
import { useDashboardUI } from "../useDashboardUI";

describe("useDashboardUI", () => {
  it("should initialize with default state", () => {
    const { result } = renderHook(() => useDashboardUI());

    expect(result.current.showReconcileModal).toBe(false);
    expect(result.current.newTransaction).toEqual({
      amount: "",
      description: "",
      type: "expense",
      envelopeId: "",
      date: expect.any(String),
    });
  });

  it("should handle modal state changes", () => {
    const { result } = renderHook(() => useDashboardUI());

    act(() => {
      result.current.openReconcileModal();
    });
    expect(result.current.showReconcileModal).toBe(true);

    act(() => {
      result.current.closeReconcileModal();
    });
    expect(result.current.showReconcileModal).toBe(false);
  });

  it("should update transaction data", () => {
    const { result } = renderHook(() => useDashboardUI());

    act(() => {
      result.current.updateNewTransaction({ amount: "100", type: "income" });
    });

    expect(result.current.newTransaction.amount).toBe("100");
    expect(result.current.newTransaction.type).toBe("income");
  });

  it("should reset transaction data", () => {
    const { result } = renderHook(() => useDashboardUI());

    // Set some data first
    act(() => {
      result.current.updateNewTransaction({
        amount: "100",
        description: "Test",
      });
    });

    // Reset
    act(() => {
      result.current.resetNewTransaction();
    });

    expect(result.current.newTransaction.amount).toBe("");
    expect(result.current.newTransaction.description).toBe("");
  });
});
