import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEnvelopes } from "../useEnvelopes";
import { budgetDb } from "@/db/budgetDb";
import { ENVELOPE_TYPES } from "@/constants/categories";

// Mock dependencies
vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    envelopes: {
      toArray: vi.fn(),
      get: vi.fn(),
    },
    getEnvelopesByCategory: vi.fn(),
  },
  VioletVaultDB: vi.fn(),
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useEnvelopes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockEnvelopes = [
    { id: "1", name: "Groceries", category: "Food", currentBalance: 100, type: "standard" },
    { id: "2", name: "Rent", category: "Housing", currentBalance: 1000, type: "standard" },
    { id: "3", name: "Savings", category: "Savings", currentBalance: 500, type: "goal" },
  ];

  it("fetches all envelopes by default", async () => {
    (budgetDb.envelopes.toArray as any).mockResolvedValue(mockEnvelopes);

    const { result } = renderHook(() => useEnvelopes(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isFetching).toBe(false));

    expect(result.current.envelopes).toHaveLength(2); // Savings excluded by default
    expect(result.current.envelopes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Groceries" }),
        expect.objectContaining({ name: "Rent" }),
      ])
    );
  });

  it("filters by category", async () => {
    (budgetDb.getEnvelopesByCategory as any).mockResolvedValue([mockEnvelopes[0]]);

    const { result } = renderHook(() => useEnvelopes({ category: "Food" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isFetching).toBe(false));

    expect(result.current.envelopes).toHaveLength(1);
    expect(result.current.envelopes[0].name).toBe("Groceries");
    expect(budgetDb.getEnvelopesByCategory).toHaveBeenCalledWith("Food");
  });

  it("includes specific envelope types when requested", async () => {
    (budgetDb.envelopes.toArray as any).mockResolvedValue(mockEnvelopes);

    const { result } = renderHook(
      () =>
        useEnvelopes({
          excludeEnvelopeTypes: [], // Don't exclude anything
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isFetching).toBe(false));

    expect(result.current.envelopes).toHaveLength(3);
  });

  it("sorts envelopes", async () => {
    (budgetDb.envelopes.toArray as any).mockResolvedValue(mockEnvelopes);

    const { result } = renderHook(
      () =>
        useEnvelopes({
          sortBy: "currentBalance",
          sortOrder: "desc",
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isFetching).toBe(false));

    // Rent (1000) -> Savings (500) -> Groceries (100)
    // Note: Savings is excluded by default, so Rent (1000) -> Groceries (100)
    expect(result.current.envelopes[0].name).toBe("Rent");
    expect(result.current.envelopes[1].name).toBe("Groceries");
  });

  it("calculates stats correctly", async () => {
    (budgetDb.envelopes.toArray as any).mockResolvedValue(mockEnvelopes);

    const { result } = renderHook(() => useEnvelopes(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isFetching).toBe(false));

    // Total: 1100 (100 + 1000)
    expect(result.current.totalBalance).toBe(1100);
  });

  it("handles empty result", async () => {
    (budgetDb.envelopes.toArray as any).mockResolvedValue([]);

    const { result } = renderHook(() => useEnvelopes(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isFetching).toBe(false));

    expect(result.current.envelopes).toHaveLength(0);
    expect(result.current.totalBalance).toBe(0);
  });
});
