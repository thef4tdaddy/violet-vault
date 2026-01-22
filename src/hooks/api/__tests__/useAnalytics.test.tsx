import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAnalytics } from "../useAnalytics";
import { AllProviders } from "../../../test/test-utils";
import { AnalyticsResponse } from "@/domain/schemas";

// Mock fetch global
global.fetch = vi.fn();

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
  });

  it("successfully fetches analytics data", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockAnalyticsResponse,
    });

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

    await waitFor(() => {
      expect(result.current.data).toEqual(mockAnalyticsResponse);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/analytics"),
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );
  });

  it("handles API errors", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

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

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.error?.message).toContain("Analytics API error: 500");
  });

  it("handles schema validation errors", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ invalid: "data" }),
    });

    const { result } = renderHook(() => useAnalytics(), {
      wrapper: AllProviders,
    });

    result.current.fetchAnalytics({
      spendingStats: { totalSpent: 0, budgetAllocated: 0, daysElapsed: 1, daysRemaining: 1 },
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.error?.message).toContain("Analytics API schema validation failed");
  });
});
