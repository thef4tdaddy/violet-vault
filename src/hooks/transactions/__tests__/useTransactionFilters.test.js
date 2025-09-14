import { renderHook, act } from "@testing-library/react";
import { useTransactionFilters } from "../useTransactionFilters";

// Mock dependencies
jest.mock("../../../utils/transactions/filterHelpers", () => ({
  applyDateFilter: jest.fn(),
  applyTypeFilter: jest.fn(),
  applyEnvelopeFilter: jest.fn(),
  applySearchFilter: jest.fn(),
  applySorting: jest.fn(),
}));

const {
  applyDateFilter,
  applyTypeFilter,
  applyEnvelopeFilter,
  applySearchFilter,
  applySorting,
} = require("../../../utils/transactions/filterHelpers");

describe("useTransactionFilters", () => {
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
    dateFilter: "all",
    typeFilter: "all",
    envelopeFilter: "all",
    searchTerm: "",
    sortBy: "date",
    sortOrder: "desc",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock implementations
    applyDateFilter.mockImplementation((transactions) => transactions);
    applyTypeFilter.mockImplementation((transactions) => transactions);
    applyEnvelopeFilter.mockImplementation((transactions) => transactions);
    applySearchFilter.mockImplementation((transactions) => transactions);
    applySorting.mockImplementation((transactions) => transactions);
  });

  it("should return transactions when no filters applied", () => {
    const { result } = renderHook(() =>
      useTransactionFilters(mockTransactions, defaultFilters),
    );

    expect(result.current).toEqual(mockTransactions);
    expect(applyDateFilter).toHaveBeenCalledWith(mockTransactions, "all");
    expect(applyTypeFilter).toHaveBeenCalled();
    expect(applyEnvelopeFilter).toHaveBeenCalled();
    expect(applySearchFilter).toHaveBeenCalled();
    expect(applySorting).toHaveBeenCalled();
  });

  it("should apply date filter correctly", () => {
    const filtered = [mockTransactions[0], mockTransactions[1]];
    applyDateFilter.mockReturnValue(filtered);

    const { result } = renderHook(() =>
      useTransactionFilters(mockTransactions, {
        ...defaultFilters,
        dateFilter: "month",
      }),
    );

    expect(applyDateFilter).toHaveBeenCalledWith(mockTransactions, "month");
    expect(result.current).toEqual(filtered);
  });

  it("should apply type filter correctly", () => {
    const filtered = [mockTransactions[1]]; // Only income
    applyDateFilter.mockReturnValue(mockTransactions);
    applyTypeFilter.mockReturnValue(filtered);

    const { result } = renderHook(() =>
      useTransactionFilters(mockTransactions, {
        ...defaultFilters,
        typeFilter: "income",
      }),
    );

    expect(applyTypeFilter).toHaveBeenCalledWith(mockTransactions, "income");
    expect(result.current).toEqual(filtered);
  });

  it("should apply envelope filter correctly", () => {
    const filtered = [mockTransactions[0]]; // Only env1
    applyDateFilter.mockReturnValue(mockTransactions);
    applyTypeFilter.mockReturnValue(mockTransactions);
    applyEnvelopeFilter.mockReturnValue(filtered);

    const { result } = renderHook(() =>
      useTransactionFilters(mockTransactions, {
        ...defaultFilters,
        envelopeFilter: "env1",
      }),
    );

    expect(applyEnvelopeFilter).toHaveBeenCalledWith(mockTransactions, "env1");
    expect(result.current).toEqual(filtered);
  });

  it("should apply search filter correctly", () => {
    const filtered = [mockTransactions[0]]; // Only grocery
    applyDateFilter.mockReturnValue(mockTransactions);
    applyTypeFilter.mockReturnValue(mockTransactions);
    applyEnvelopeFilter.mockReturnValue(mockTransactions);
    applySearchFilter.mockReturnValue(filtered);

    const { result } = renderHook(() =>
      useTransactionFilters(mockTransactions, {
        ...defaultFilters,
        searchTerm: "grocery",
      }),
    );

    expect(applySearchFilter).toHaveBeenCalledWith(mockTransactions, "grocery");
    expect(result.current).toEqual(filtered);
  });

  it("should apply sorting correctly", () => {
    const sorted = [...mockTransactions].reverse();
    applyDateFilter.mockReturnValue(mockTransactions);
    applyTypeFilter.mockReturnValue(mockTransactions);
    applyEnvelopeFilter.mockReturnValue(mockTransactions);
    applySearchFilter.mockReturnValue(mockTransactions);
    applySorting.mockReturnValue(sorted);

    const { result } = renderHook(() =>
      useTransactionFilters(mockTransactions, {
        ...defaultFilters,
        sortBy: "amount",
        sortOrder: "asc",
      }),
    );

    expect(applySorting).toHaveBeenCalledWith(
      mockTransactions,
      "amount",
      "asc",
    );
    expect(result.current).toEqual(sorted);
  });

  it("should chain all filters correctly", () => {
    // Mock the filter chain
    const afterDate = [mockTransactions[0], mockTransactions[1]];
    const afterType = [mockTransactions[0]];
    const afterEnvelope = [mockTransactions[0]];
    const afterSearch = [mockTransactions[0]];
    const final = [mockTransactions[0]];

    applyDateFilter.mockReturnValue(afterDate);
    applyTypeFilter.mockReturnValue(afterType);
    applyEnvelopeFilter.mockReturnValue(afterEnvelope);
    applySearchFilter.mockReturnValue(afterSearch);
    applySorting.mockReturnValue(final);

    const { result } = renderHook(() =>
      useTransactionFilters(mockTransactions, {
        dateFilter: "week",
        typeFilter: "expense",
        envelopeFilter: "env1",
        searchTerm: "grocery",
        sortBy: "date",
        sortOrder: "desc",
      }),
    );

    expect(applyDateFilter).toHaveBeenCalledWith(mockTransactions, "week");
    expect(applyTypeFilter).toHaveBeenCalledWith(afterDate, "expense");
    expect(applyEnvelopeFilter).toHaveBeenCalledWith(afterType, "env1");
    expect(applySearchFilter).toHaveBeenCalledWith(afterEnvelope, "grocery");
    expect(applySorting).toHaveBeenCalledWith(afterSearch, "date", "desc");
    expect(result.current).toEqual(final);
  });

  it("should handle empty transactions array", () => {
    const { result } = renderHook(() =>
      useTransactionFilters([], defaultFilters),
    );

    expect(result.current).toEqual([]);
    expect(applyDateFilter).toHaveBeenCalledWith([], "all");
  });

  it("should handle null/undefined transactions", () => {
    const { result } = renderHook(() =>
      useTransactionFilters(null, defaultFilters),
    );

    expect(result.current).toEqual([]);
    expect(applyDateFilter).toHaveBeenCalledWith([], "all");
  });

  it("should memoize results for same inputs", () => {
    applyDateFilter.mockReturnValue(mockTransactions);
    applyTypeFilter.mockReturnValue(mockTransactions);
    applyEnvelopeFilter.mockReturnValue(mockTransactions);
    applySearchFilter.mockReturnValue(mockTransactions);
    applySorting.mockReturnValue(mockTransactions);

    const { result, rerender } = renderHook(
      ({ transactions, filters }) =>
        useTransactionFilters(transactions, filters),
      {
        initialProps: {
          transactions: mockTransactions,
          filters: defaultFilters,
        },
      },
    );

    const firstResult = result.current;

    // Rerender with same props
    rerender({
      transactions: mockTransactions,
      filters: defaultFilters,
    });

    expect(result.current).toBe(firstResult); // Same reference (memoized)
  });

  it("should recalculate when transactions change", () => {
    applyDateFilter.mockReturnValue(mockTransactions);
    applyTypeFilter.mockReturnValue(mockTransactions);
    applyEnvelopeFilter.mockReturnValue(mockTransactions);
    applySearchFilter.mockReturnValue(mockTransactions);
    applySorting.mockReturnValue(mockTransactions);

    const { result, rerender } = renderHook(
      ({ transactions, filters }) =>
        useTransactionFilters(transactions, filters),
      {
        initialProps: {
          transactions: mockTransactions,
          filters: defaultFilters,
        },
      },
    );

    const firstResult = result.current;

    // Rerender with different transactions
    const newTransactions = [
      ...mockTransactions,
      {
        id: "4",
        description: "New Transaction",
        amount: -10.0,
        date: "2023-09-02",
        envelopeId: "",
        type: "expense",
      },
    ];

    rerender({
      transactions: newTransactions,
      filters: defaultFilters,
    });

    expect(result.current).not.toBe(firstResult); // Different reference
  });

  it("should recalculate when filters change", () => {
    applyDateFilter.mockReturnValue(mockTransactions);
    applyTypeFilter.mockReturnValue(mockTransactions);
    applyEnvelopeFilter.mockReturnValue(mockTransactions);
    applySearchFilter.mockReturnValue(mockTransactions);
    applySorting.mockReturnValue(mockTransactions);

    const { result, rerender } = renderHook(
      ({ transactions, filters }) =>
        useTransactionFilters(transactions, filters),
      {
        initialProps: {
          transactions: mockTransactions,
          filters: defaultFilters,
        },
      },
    );

    const firstResult = result.current;

    // Rerender with different filters
    const newFilters = {
      ...defaultFilters,
      typeFilter: "income",
    };

    rerender({
      transactions: mockTransactions,
      filters: newFilters,
    });

    expect(result.current).not.toBe(firstResult); // Different reference
  });
});
