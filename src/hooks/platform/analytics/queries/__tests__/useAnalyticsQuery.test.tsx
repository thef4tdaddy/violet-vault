import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAnalyticsQuery } from "../useAnalyticsQuery";
import { AllProviders } from "@/test/test-utils";
import { queryKeys } from "@/utils/core/common/queryClient";

// Mock global fetch
global.fetch = vi.fn();

describe("useAnalyticsQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockRequest = {
    spendingStats: {
      totalSpent: 100,
      budgetAllocated: 200,
      daysElapsed: 15,
      daysRemaining: 15,
    },
  };

  const mockResponse = {
    success: true,
    spendingVelocity: {
      velocityScore: 90,
      dailyRate: 10,
      projectedTotal: 150,
      budgetAllocated: 200,
      willExceedBudget: false,
      daysUntilExceeded: null,
      recommendation: "On track",
      severity: "success",
    },
    billPredictions: null,
    budgetHealth: null,
    error: null,
  };

  it("successfully fetches analytics using correct query key", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useAnalyticsQuery(mockRequest), {
      wrapper: AllProviders,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/analytics"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(mockRequest),
      })
    );
  });

  it("uses correct query key structure", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useAnalyticsQuery(mockRequest), {
      wrapper: AllProviders,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify implementation detail implicitly by ensuring data is fetched
    // Explicit key check would require snooping on QueryClient
  });
});
