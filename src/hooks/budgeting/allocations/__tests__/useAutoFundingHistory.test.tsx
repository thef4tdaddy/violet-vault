import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAutoFundingHistory } from "../useAutoFundingHistory";
import { budgetDb } from "@/db/budgetDb";
import React from "react";

// Mock dependencies
vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    autoFundingHistory: {
      toArray: vi.fn(),
      add: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
      orderBy: vi.fn().mockReturnThis(),
      reverse: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    },
  },
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock useUiStore
vi.mock("@/stores/ui/uiStore", () => ({
  default: vi.fn((selector) =>
    selector({
      budget: {
        transferFunds: vi.fn(),
      },
    })
  ),
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

describe("useAutoFundingHistory", () => {
  const mockExecution = {
    id: "exec1",
    trigger: "manual",
    executedAt: "2023-01-01T00:00:00.000Z",
    rulesExecuted: 1,
    totalFunded: 100,
    success: true,
    results: [
      {
        ruleId: "rule1",
        success: true,
        amount: 100,
        targetEnvelopes: ["env1"],
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch history on mount", async () => {
    vi.mocked(budgetDb.autoFundingHistory.toArray).mockResolvedValue([mockExecution] as any);

    const { result } = renderHook(() => useAutoFundingHistory(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.executionHistory).toHaveLength(1);
    expect(result.current.executionHistory[0].totalFunded).toBe(100);
  });

  it("should add execution to history", async () => {
    vi.mocked(budgetDb.autoFundingHistory.toArray).mockResolvedValue([] as any);
    const { result } = renderHook(() => useAutoFundingHistory(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await result.current.addToHistory({
      trigger: "manual",
      executedAt: "2023-01-02T00:00:00.000Z",
      rulesExecuted: 2,
      totalFunded: 200,
      id: "temp-id-ignored",
      timestamp: "2023-01-02T00:00:00.000Z",
    });

    expect(budgetDb.autoFundingHistory.add).toHaveBeenCalled();
  });

  it("should calculate execution statistics correctly", async () => {
    vi.mocked(budgetDb.autoFundingHistory.toArray).mockResolvedValue([
      { ...mockExecution, totalFunded: 100, success: true },
      { ...mockExecution, id: "exec2", totalFunded: 50, success: true },
      { ...mockExecution, id: "exec3", success: false, totalFunded: 0 },
    ] as any);

    const { result } = renderHook(() => useAutoFundingHistory(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const stats = result.current.getExecutionStatistics();
    expect(stats.totalExecutions).toBe(3);
    expect(stats.successfulExecutions).toBe(2);
    expect(stats.failedExecutions).toBe(1);
    expect(stats.totalFunded).toBe(150);
  });

  it("should provide compatibilty getHistory function", async () => {
    vi.mocked(budgetDb.autoFundingHistory.toArray).mockResolvedValue([
      mockExecution,
      mockExecution,
    ] as any);
    const { result } = renderHook(() => useAutoFundingHistory(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Test getHistory with limit
    const limited = result.current.getHistory(1);
    expect(limited).toHaveLength(1);

    // Test getHistory without limit
    const all = result.current.getHistory();
    expect(all).toHaveLength(2);
  });
});
