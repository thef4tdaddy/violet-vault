import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAnalytics } from "../useAnalytics";
import { AllProviders } from "../../../test/test-utils";
import { AnalyticsResponse } from "@/domain/schemas";
import { clearCircuitBreakers } from "@/utils/core/api/circuitBreaker";
import { setTestRetryOptions } from "@/utils/core/api/client";

const mockAnalyticsResponse: AnalyticsResponse = {
  success: true,
  spendingVelocity: {
    velocityScore: 85,
    dailyRate: 50.0,
    projectedTotal: 1500.0,
    budgetAllocated: 2000.0,
    willExceedBudget: false,
    daysUntilExceeded: null,
    recommendation: "Good job",
    severity: "success",
  },
  billPredictions: {
    predictedBills: [],
    totalPredictedAmount: 0,
    nextBillDate: null,
    message: "No bills",
  },
  budgetHealth: {
    overallScore: 90,
    breakdown: {
      spendingPace: 90,
      billPreparedness: 90,
      savingsHealth: 90,
      budgetUtilization: 90,
    },
    grade: "A",
    summary: "Great",
    recommendations: [],
    strengths: [],
    concerns: [],
  },
  error: null,
};

describe("useAnalytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCircuitBreakers();
    setTestRetryOptions({ maxAttempts: 1, initialDelay: 0 });

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => mockAnalyticsResponse,
      }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    setTestRetryOptions({});
  });

  it("successfully fetches analytics data", async () => {
    const { result } = renderHook(() => useAnalytics(), {
      wrapper: AllProviders,
    });

    result.current.fetchAnalytics({
      spendingStats: {
        totalSpent: 500,
        budgetAllocated: 1000,
        daysElapsed: 15,
        daysRemaining: 15,
      },
    });

    await waitFor(
      () => {
        expect(result.current.data).toEqual(mockAnalyticsResponse);
      },
      { timeout: 10000 }
    );
  });

  it("handles API errors gracefully", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      }))
    );

    const { result } = renderHook(() => useAnalytics(), {
      wrapper: AllProviders,
    });

    try {
      await result.current.fetchAnalyticsAsync({
        spendingStats: {
          totalSpent: 500,
          budgetAllocated: 1000,
          daysElapsed: 15,
          daysRemaining: 15,
        },
      });
    } catch (e) {
      // Expected catch, but we need to wait for the hook state to update
    }

    await waitFor(
      () => {
        expect(result.current.error).not.toBeNull();
      },
      { timeout: 10000 }
    );

    expect(result.current.error?.message).toContain("API Request to py-analytics/ failed");
  });
});
