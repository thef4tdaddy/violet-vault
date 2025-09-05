import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useLayoutData } from "../useLayoutData";

// Mock all dependencies
vi.mock("../../budgeting/useBudgetData", () => ({
  default: vi.fn(() => ({
    envelopes: [],
    transactions: [],
    isLoading: false,
    error: null,
  })),
}));

vi.mock("../../budgeting/useBudgetMetadata", () => ({
  useUnassignedCash: vi.fn(() => ({ unassignedCash: 1000 })),
  useActualBalance: vi.fn(),
}));

vi.mock("../../bills/useBills", () => ({
  default: vi.fn(() => ({
    bills: [],
    isLoading: false,
    error: null,
  })),
}));

vi.mock("../../../utils/budgeting/envelopeCalculations", () => ({
  calculateEnvelopeSummary: vi.fn(() => ({
    totalBiweeklyNeed: 500,
    totalAllocated: 2000,
    totalBalance: 1500,
    totalSpent: 300,
    totalUpcoming: 200,
    billsDueCount: 3,
  })),
}));

// Import mocked dependencies
import useBudgetData from "../../budgeting/useBudgetData";
import {
  useUnassignedCash,
  useActualBalance,
} from "../../budgeting/useBudgetMetadata";
import useBills from "../../bills/useBills";
import { calculateEnvelopeSummary } from "../../../utils/budgeting/envelopeCalculations";

describe("useLayoutData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should provide consistent data across components", () => {
    const mockEnvelopes = [{ id: 1, name: "Groceries", currentBalance: 200 }];

    useBudgetData.mockReturnValue({
      envelopes: mockEnvelopes,
      transactions: [],
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useLayoutData());

    expect(result.current.totalBiweeklyNeed).toBeDefined();
    expect(result.current.totalBiweeklyNeed).toBe(500);
    expect(result.current.unassignedCash).toBe(1000);
    expect(result.current.envelopeSummary).toBeDefined();
  });

  it("should handle empty envelopes array", () => {
    useBudgetData.mockReturnValue({
      envelopes: [],
      transactions: [],
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useLayoutData());

    expect(result.current.totalBiweeklyNeed).toBe(0);
    expect(result.current.envelopeSummary.totalAllocated).toBe(0);
  });

  it("should filter out invalid transactions", () => {
    const invalidTransactions = [
      { amount: 100 }, // Valid
      null, // Invalid
      undefined, // Invalid
      { amount: "not a number" }, // Invalid
      { amount: 200 }, // Valid
    ];

    useBudgetData.mockReturnValue({
      envelopes: [],
      transactions: invalidTransactions,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useLayoutData());

    expect(result.current.transactions).toHaveLength(2);
    expect(
      result.current.transactions.every((t) => typeof t.amount === "number"),
    ).toBe(true);
  });

  it("should call all required hooks", () => {
    renderHook(() => useLayoutData());

    expect(useBudgetData).toHaveBeenCalled();
    expect(useUnassignedCash).toHaveBeenCalled();
    expect(useActualBalance).toHaveBeenCalled();
    expect(useBills).toHaveBeenCalled();
  });

  it("should calculate envelope summary using existing utility", () => {
    const mockEnvelopes = [
      { id: 1, name: "Groceries", currentBalance: 200 },
      { id: 2, name: "Gas", currentBalance: 100 },
    ];

    useBudgetData.mockReturnValue({
      envelopes: mockEnvelopes,
      transactions: [],
      isLoading: false,
      error: null,
    });

    renderHook(() => useLayoutData());

    expect(calculateEnvelopeSummary).toHaveBeenCalledWith(
      mockEnvelopes,
      [],
      [],
    );
  });

  it("should handle loading states correctly", () => {
    useBudgetData.mockReturnValue({
      envelopes: [],
      transactions: [],
      isLoading: true,
      error: null,
    });

    useBills.mockReturnValue({
      bills: [],
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useLayoutData());

    expect(result.current.isLoading).toBe(true);
  });

  it("should handle error states correctly", () => {
    useBudgetData.mockReturnValue({
      envelopes: [],
      transactions: [],
      isLoading: false,
      error: new Error("Budget data error"),
    });

    const { result } = renderHook(() => useLayoutData());

    expect(result.current.hasError).toBeTruthy();
  });

  it("should memoize envelope summary calculations", () => {
    const mockEnvelopes = [{ id: 1, name: "Test" }];

    useBudgetData.mockReturnValue({
      envelopes: mockEnvelopes,
      transactions: [],
      isLoading: false,
      error: null,
    });

    const { result, rerender } = renderHook(() => useLayoutData());

    const firstSummary = result.current.envelopeSummary;

    // Rerender with same data
    rerender();

    const secondSummary = result.current.envelopeSummary;

    // Should be the same reference due to memoization
    expect(firstSummary).toBe(secondSummary);
    // The calculation should only be called once due to memoization
    expect(calculateEnvelopeSummary).toHaveBeenCalledTimes(1);
  });
});
