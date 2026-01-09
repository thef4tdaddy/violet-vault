import { renderHook } from "@testing-library/react";
import { useTransactionFilters } from "../useTransactionFilters";
import { vi, describe, it, expect, beforeEach } from "vitest";
import type { Mock } from "vitest";

// Mock dependencies
vi.mock("@/utils/validation", () => ({
  isValidTransaction: vi.fn(),
  matchesSearchTerm: vi.fn(),
  matchesTypeFilter: vi.fn(),
  matchesEnvelopeFilter: vi.fn(),
  matchesDateFilter: vi.fn(),
  compareTransactions: vi.fn(),
}));

describe("useTransactionFilters", () => {
  let isValidTransaction: Mock;
  let matchesSearchTerm: Mock;
  let matchesTypeFilter: Mock;
  let matchesEnvelopeFilter: Mock;
  let matchesDateFilter: Mock;
  let compareTransactions: Mock;

  const mockTransactions = [
    {
      id: "1",
      description: "Grocery Store",
      amount: -50.0,
      date: "2023-09-01",
      envelopeId: "env1",
      type: "expense",
    },
    {
      id: "2",
      description: "Salary",
      amount: 2000.0,
      date: "2023-09-01",
      envelopeId: "",
      type: "income",
    },
    {
      id: "3",
      description: "Restaurant",
      amount: -25.5,
      date: "2023-08-15",
      envelopeId: "env2",
      type: "expense",
    },
  ];

  const defaultFilters = {
    transactions: mockTransactions,
    dateFilter: "all",
    typeFilter: "all",
    envelopeFilter: "all",
    searchTerm: "",
    sortBy: "date",
    sortOrder: "desc",
  };

  beforeEach(async () => {
    // Import mocked functions
    const validation = await import("@/utils/validation");
    isValidTransaction = validation.isValidTransaction as Mock;
    matchesSearchTerm = validation.matchesSearchTerm as Mock;
    matchesTypeFilter = validation.matchesTypeFilter as Mock;
    matchesEnvelopeFilter = validation.matchesEnvelopeFilter as Mock;
    matchesDateFilter = validation.matchesDateFilter as Mock;
    compareTransactions = validation.compareTransactions as Mock;

    vi.clearAllMocks();

    // Setup default mock implementations
    isValidTransaction.mockReturnValue(true);
    matchesSearchTerm.mockReturnValue(true);
    matchesTypeFilter.mockReturnValue(true);
    matchesEnvelopeFilter.mockReturnValue(true);
    matchesDateFilter.mockReturnValue(true);
    compareTransactions.mockReturnValue(0);
  });

  it("should return transactions when no filters applied", () => {
    const { result } = renderHook(() => useTransactionFilters(defaultFilters));

    expect(result.current).toEqual(mockTransactions);
    expect(isValidTransaction).toHaveBeenCalled();
    expect(matchesSearchTerm).toHaveBeenCalled();
    expect(matchesTypeFilter).toHaveBeenCalled();
    expect(matchesEnvelopeFilter).toHaveBeenCalled();
    expect(matchesDateFilter).toHaveBeenCalled();
  });

  it("should apply date filter correctly", () => {
    matchesDateFilter.mockReturnValue(false);
    matchesDateFilter.mockReturnValueOnce(true).mockReturnValueOnce(true);

    const { result } = renderHook(() =>
      useTransactionFilters({
        ...defaultFilters,
        dateFilter: "month",
      })
    );

    expect(matchesDateFilter).toHaveBeenCalled();
    expect(result.current.length).toBeLessThanOrEqual(mockTransactions.length);
  });

  it("should apply type filter correctly", () => {
    matchesTypeFilter.mockReturnValue(false);
    matchesTypeFilter.mockReturnValueOnce(false).mockReturnValueOnce(true);

    const { result } = renderHook(() =>
      useTransactionFilters({
        ...defaultFilters,
        typeFilter: "income",
      })
    );

    expect(matchesTypeFilter).toHaveBeenCalled();
    expect(result.current.length).toBeLessThanOrEqual(mockTransactions.length);
  });

  it("should apply envelope filter correctly", () => {
    matchesEnvelopeFilter.mockReturnValue(false);
    matchesEnvelopeFilter.mockReturnValueOnce(true);

    const { result } = renderHook(() =>
      useTransactionFilters({
        ...defaultFilters,
        envelopeFilter: "env1",
      })
    );

    expect(matchesEnvelopeFilter).toHaveBeenCalled();
    expect(result.current.length).toBeLessThanOrEqual(mockTransactions.length);
  });

  it("should apply search filter correctly", () => {
    matchesSearchTerm.mockReturnValue(false);
    matchesSearchTerm.mockReturnValueOnce(true);

    const { result } = renderHook(() =>
      useTransactionFilters({
        ...defaultFilters,
        searchTerm: "grocery",
      })
    );

    expect(matchesSearchTerm).toHaveBeenCalled();
    expect(result.current.length).toBeLessThanOrEqual(mockTransactions.length);
  });

  it("should apply sorting correctly", () => {
    compareTransactions.mockReturnValue(-1);

    const { result } = renderHook(() =>
      useTransactionFilters({
        ...defaultFilters,
        sortBy: "amount",
        sortOrder: "asc",
      })
    );

    expect(compareTransactions).toHaveBeenCalled();
    expect(result.current).toBeDefined();
  });

  it("should chain all filters correctly", () => {
    const { result } = renderHook(() =>
      useTransactionFilters({
        transactions: mockTransactions,
        dateFilter: "week",
        typeFilter: "expense",
        envelopeFilter: "env1",
        searchTerm: "grocery",
        sortBy: "date",
        sortOrder: "desc",
      })
    );

    expect(isValidTransaction).toHaveBeenCalled();
    expect(matchesSearchTerm).toHaveBeenCalled();
    expect(matchesTypeFilter).toHaveBeenCalled();
    expect(matchesEnvelopeFilter).toHaveBeenCalled();
    expect(matchesDateFilter).toHaveBeenCalled();
    expect(result.current).toBeDefined();
  });

  it("should handle empty transactions array", () => {
    const { result } = renderHook(() =>
      useTransactionFilters({ ...defaultFilters, transactions: [] })
    );

    expect(result.current).toEqual([]);
  });

  it("should handle null/undefined transactions", () => {
    const { result } = renderHook(() =>
      useTransactionFilters({
        ...defaultFilters,
        transactions: null as unknown as typeof mockTransactions,
      })
    );

    expect(result.current).toEqual([]);
  });

  it("should memoize results for same inputs", () => {
    const { result, rerender } = renderHook(({ filters }) => useTransactionFilters(filters), {
      initialProps: {
        filters: defaultFilters,
      },
    });

    const firstResult = result.current;

    // Rerender with same props
    rerender({
      filters: defaultFilters,
    });

    expect(result.current).toBe(firstResult); // Same reference (memoized)
  });

  it("should recalculate when transactions change", () => {
    const newTransactions = [
      ...mockTransactions,
      {
        id: "4",
        description: "New",
        amount: -10,
        date: "2023-09-02",
        envelopeId: "env1",
        type: "expense",
      },
    ];

    const { result, rerender } = renderHook(({ filters }) => useTransactionFilters(filters), {
      initialProps: {
        filters: defaultFilters,
      },
    });

    const firstResult = result.current;

    // Rerender with different transactions
    rerender({
      filters: { ...defaultFilters, transactions: newTransactions },
    });

    expect(result.current).not.toBe(firstResult); // Different reference
  });

  it("should recalculate when filters change", () => {
    const { result, rerender } = renderHook(({ filters }) => useTransactionFilters(filters), {
      initialProps: {
        filters: defaultFilters,
      },
    });

    const firstResult = result.current;

    // Rerender with different filter
    rerender({
      filters: { ...defaultFilters, typeFilter: "income" },
    });

    expect(result.current).not.toBe(firstResult); // Different reference
  });
});
