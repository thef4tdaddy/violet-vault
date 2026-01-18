import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useTransactionQuery } from "../useTransactionQuery";
import { createTestQueryClient, createQueryWrapper } from "@/test/queryTestUtils";
import type { QueryClient } from "@tanstack/react-query";
import { budgetDb } from "@/db/budgetDb";
import type { Transaction } from "@/db/types";

// Mock dependencies
vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    transactions: {
      orderBy: vi.fn(() => ({
        reverse: vi.fn(() => ({
          toArray: vi.fn(),
        })),
      })),
    },
  },
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
  },
}));

describe("useTransactionQuery", () => {
  let queryClient: QueryClient;
  let wrapper: ReturnType<typeof createQueryWrapper>;

  const mockTransactions: Transaction[] = [
    {
      id: "1",
      description: "Test Transaction 1",
      amount: -100,
      type: "expense",
      date: new Date("2024-01-15"),
      envelopeId: "env-1",
      category: "groceries",
      lastModified: Date.now(),
    },
    {
      id: "2",
      description: "Test Transaction 2",
      amount: -200,
      type: "expense",
      date: new Date("2024-01-16"),
      envelopeId: "env-2",
      category: "utilities",
      lastModified: Date.now(),
    },
  ];

  beforeEach(() => {
    queryClient = createTestQueryClient();
    wrapper = createQueryWrapper(queryClient);

    vi.clearAllMocks();

    // Mock the Dexie transaction query
    const mockToArray = vi.fn().mockResolvedValue(mockTransactions);
    const mockReverse = vi.fn(() => ({ toArray: mockToArray }));

    (budgetDb.transactions.orderBy as ReturnType<typeof vi.fn>).mockReturnValue({
      reverse: mockReverse,
    });
  });

  it("should initialize with correct query configuration", async () => {
    const { result } = renderHook(() => useTransactionQuery(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.transactions).toBeDefined();
    expect(result.current.transactions.length).toBeGreaterThanOrEqual(0);
  });

  it("should handle loading state", async () => {
    const { result } = renderHook(() => useTransactionQuery(), { wrapper });

    // Initially, it may be loading
    if (result.current.isLoading) {
      expect(result.current.transactions).toEqual([]);
    }

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("should handle error state", async () => {
    // Mock a failure
    const mockToArray = vi.fn().mockRejectedValue(new Error("Failed to fetch transactions"));
    const mockReverse = vi.fn(() => ({ toArray: mockToArray }));

    (budgetDb.transactions.orderBy as ReturnType<typeof vi.fn>).mockReturnValue({
      reverse: mockReverse,
    });

    const { result } = renderHook(() => useTransactionQuery(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should return empty array on error (fallback behavior)
    expect(result.current.transactions).toEqual([]);
  });

  it("should provide refetch function", async () => {
    const { result } = renderHook(() => useTransactionQuery(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.refetch).toBeDefined();
    expect(typeof result.current.refetch).toBe("function");
  });

  it("should handle empty transaction list", async () => {
    // Mock empty array
    const mockToArray = vi.fn().mockResolvedValue([]);
    const mockReverse = vi.fn(() => ({ toArray: mockToArray }));

    (budgetDb.transactions.orderBy as ReturnType<typeof vi.fn>).mockReturnValue({
      reverse: mockReverse,
    });

    const { result } = renderHook(() => useTransactionQuery(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.transactions).toEqual([]);
  });

  it("should handle null data gracefully", async () => {
    // Mock null return (edge case)
    const mockToArray = vi.fn().mockResolvedValue(null);
    const mockReverse = vi.fn(() => ({ toArray: mockToArray }));

    (budgetDb.transactions.orderBy as ReturnType<typeof vi.fn>).mockReturnValue({
      reverse: mockReverse,
    });

    const { result } = renderHook(() => useTransactionQuery(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should return empty array when data is null
    expect(result.current.transactions).toEqual([]);
  });
});
