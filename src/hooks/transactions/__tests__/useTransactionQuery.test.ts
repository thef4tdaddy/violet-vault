import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";
import { useTransactionQuery } from "../useTransactionQuery";

// Mock dependencies
vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as Record<string, unknown>),
    useQuery: vi.fn(),
  };
});

vi.mock("../../../services/budgetDatabaseService", () => ({
  default: {
    getTransactions: vi.fn(),
  },
}));

vi.mock("../../../utils/common/logger", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
  },
}));

describe("useTransactionQuery", () => {
  const mockTransactions = [
    { id: "1", description: "Test Transaction 1", amount: 100 },
    { id: "2", description: "Test Transaction 2", amount: 200 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with correct query configuration", () => {
    const mockQueryResult = {
      data: mockTransactions,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    };

    (useQuery as any).mockReturnValue(mockQueryResult);

    const { result } = renderHook(() => useTransactionQuery());

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: ["transactions"],
      queryFn: expect.any(Function),
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    });

    expect(result.current.transactions).toEqual(mockTransactions);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("should handle loading state", () => {
    const mockQueryResult = {
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    };

    (useQuery as any).mockReturnValue(mockQueryResult);

    const { result } = renderHook(() => useTransactionQuery());

    expect(result.current.transactions).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it("should handle error state", () => {
    const mockError = new Error("Failed to fetch transactions");
    const mockQueryResult = {
      data: undefined,
      isLoading: false,
      error: mockError,
      refetch: vi.fn(),
    };

    (useQuery as any).mockReturnValue(mockQueryResult);

    const { result } = renderHook(() => useTransactionQuery());

    expect(result.current.transactions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(mockError);
  });

  it("should provide refetch function", () => {
    const mockRefetch = vi.fn();
    const mockQueryResult = {
      data: mockTransactions,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    };

    (useQuery as any).mockReturnValue(mockQueryResult);

    const { result } = renderHook(() => useTransactionQuery());

    expect(result.current.refetch).toBe(mockRefetch);
  });

  it("should handle empty transaction list", () => {
    const mockQueryResult = {
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    };

    (useQuery as any).mockReturnValue(mockQueryResult);

    const { result } = renderHook(() => useTransactionQuery());

    expect(result.current.transactions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle null data gracefully", () => {
    const mockQueryResult = {
      data: null,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    };

    (useQuery as any).mockReturnValue(mockQueryResult);

    const { result } = renderHook(() => useTransactionQuery());

    expect(result.current.transactions).toEqual([]);
  });
});
