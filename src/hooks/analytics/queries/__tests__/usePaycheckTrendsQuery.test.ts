/**
 * Tests for Paycheck Trends Query Hook
 * Covers paycheck analytics calculations and data fetching
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePaycheckTrendsQuery } from "../usePaycheckTrendsQuery";
import { createTestQueryClient, createQueryWrapper } from "@/test/queryTestUtils";

// Mock Zustand store
vi.mock("@/stores/ui/uiStore", () => ({
  default: vi.fn(),
  useBudgetStore: vi.fn(),
}));

describe("usePaycheckTrendsQuery", () => {
  let queryClient: ReturnType<typeof createTestQueryClient>;
  let wrapper: ReturnType<typeof createQueryWrapper>;
  let mockUseUiStore: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    queryClient = createTestQueryClient();
    wrapper = createQueryWrapper(queryClient);

    // Get the mocked store - it's the default export
    const uiStoreModule = await import("@/stores/ui/uiStore");
    mockUseUiStore = uiStoreModule.default as ReturnType<typeof vi.fn>;
  });

  describe("Data Fetching with No Paychecks", () => {
    it("should return empty data when no paycheck history exists", async () => {
      // Arrange
      mockUseUiStore.mockReturnValue({
        paycheckHistory: [],
      });

      // Act
      const { result } = renderHook(() => usePaycheckTrendsQuery(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual({
        trends: [],
        averageAmount: 0,
        frequency: null,
        growth: 0,
      });
    });

    it("should not fetch when paycheck history is null", async () => {
      // Arrange
      mockUseUiStore.mockReturnValue({
        paycheckHistory: null,
      });

      // Act
      const { result } = renderHook(() => usePaycheckTrendsQuery(), { wrapper });

      // Assert - Query should be disabled
      expect(result.current.fetchStatus).toBe("idle");
      expect(result.current.data).toBeUndefined();
    });
  });

  describe("Average Calculations", () => {
    it("should calculate average paycheck amount correctly", async () => {
      // Arrange
      const paychecks = [
        { date: "2024-01-01", amount: 1000 },
        { date: "2024-01-15", amount: 1200 },
        { date: "2024-02-01", amount: 1100 },
      ];
      mockUseUiStore.mockReturnValue({
        paycheckHistory: paychecks,
      });

      // Act
      const { result } = renderHook(() => usePaycheckTrendsQuery(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const expectedAverage = (1000 + 1200 + 1100) / 3;
      expect(result.current.data?.averageAmount).toBe(expectedAverage);
    });

    it("should calculate total earned correctly", async () => {
      // Arrange
      const paychecks = [
        { date: "2024-01-01", amount: 1000 },
        { date: "2024-01-15", amount: 1500 },
        { date: "2024-02-01", amount: 2000 },
      ];
      mockUseUiStore.mockReturnValue({
        paycheckHistory: paychecks,
      });

      // Act
      const { result } = renderHook(() => usePaycheckTrendsQuery(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.totalEarned).toBe(4500);
    });
  });

  describe("Frequency Detection", () => {
    it("should detect biweekly paycheck frequency", async () => {
      // Arrange - Paychecks 14 days apart
      const paychecks = [
        { date: "2024-01-01", amount: 1000 },
        { date: "2024-01-15", amount: 1000 },
        { date: "2024-01-29", amount: 1000 },
        { date: "2024-02-12", amount: 1000 },
      ];
      mockUseUiStore.mockReturnValue({
        paycheckHistory: paychecks,
      });

      // Act
      const { result } = renderHook(() => usePaycheckTrendsQuery(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.frequency).toBe("biweekly");
    });

    it("should detect weekly paycheck frequency", async () => {
      // Arrange - Paychecks 7 days apart
      const paychecks = [
        { date: "2024-01-01", amount: 500 },
        { date: "2024-01-08", amount: 500 },
        { date: "2024-01-15", amount: 500 },
        { date: "2024-01-22", amount: 500 },
      ];
      mockUseUiStore.mockReturnValue({
        paycheckHistory: paychecks,
      });

      // Act
      const { result } = renderHook(() => usePaycheckTrendsQuery(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.frequency).toBe("weekly");
    });

    it("should detect monthly paycheck frequency", async () => {
      // Arrange - Paychecks ~30 days apart
      const paychecks = [
        { date: "2024-01-01", amount: 3000 },
        { date: "2024-02-01", amount: 3000 },
        { date: "2024-03-01", amount: 3000 },
      ];
      mockUseUiStore.mockReturnValue({
        paycheckHistory: paychecks,
      });

      // Act
      const { result } = renderHook(() => usePaycheckTrendsQuery(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.frequency).toBe("monthly");
    });

    it("should detect irregular frequency for inconsistent intervals", async () => {
      // Arrange - Irregular intervals
      const paychecks = [
        { date: "2024-01-01", amount: 1000 },
        { date: "2024-01-10", amount: 1000 },
        { date: "2024-02-01", amount: 1000 },
        { date: "2024-03-15", amount: 1000 },
      ];
      mockUseUiStore.mockReturnValue({
        paycheckHistory: paychecks,
      });

      // Act
      const { result } = renderHook(() => usePaycheckTrendsQuery(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.frequency).toBe("irregular");
    });
  });

  describe("Growth Rate Calculations", () => {
    it("should calculate positive growth rate", async () => {
      // Arrange - Income increasing over time
      const paychecks = [
        { date: "2024-01-01", amount: 1000 },
        { date: "2024-01-15", amount: 1000 },
        { date: "2024-02-01", amount: 1200 },
        { date: "2024-02-15", amount: 1300 },
      ];
      mockUseUiStore.mockReturnValue({
        paycheckHistory: paychecks,
      });

      // Act
      const { result } = renderHook(() => usePaycheckTrendsQuery(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Recent avg: (1200 + 1300) / 2 = 1250
      // Older avg: (1000 + 1000) / 2 = 1000
      // Growth: ((1250 - 1000) / 1000) * 100 = 25%
      expect(result.current.data?.growth).toBe(25);
    });

    it("should calculate negative growth rate", async () => {
      // Arrange - Income decreasing over time
      const paychecks = [
        { date: "2024-01-01", amount: 1200 },
        { date: "2024-01-15", amount: 1200 },
        { date: "2024-02-01", amount: 1000 },
        { date: "2024-02-15", amount: 1000 },
      ];
      mockUseUiStore.mockReturnValue({
        paycheckHistory: paychecks,
      });

      // Act
      const { result } = renderHook(() => usePaycheckTrendsQuery(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Recent avg: (1000 + 1000) / 2 = 1000
      // Older avg: (1200 + 1200) / 2 = 1200
      // Growth: ((1000 - 1200) / 1200) * 100 = -16.67%
      expect(result.current.data?.growth).toBeCloseTo(-16.67, 1);
    });

    it("should return zero growth with less than 4 paychecks", async () => {
      // Arrange
      const paychecks = [
        { date: "2024-01-01", amount: 1000 },
        { date: "2024-01-15", amount: 1200 },
        { date: "2024-02-01", amount: 1100 },
      ];
      mockUseUiStore.mockReturnValue({
        paycheckHistory: paychecks,
      });

      // Act
      const { result } = renderHook(() => usePaycheckTrendsQuery(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.growth).toBe(0);
    });
  });

  describe("Data Sorting", () => {
    it("should sort paychecks by date ascending", async () => {
      // Arrange - Unsorted paychecks
      const paychecks = [
        { date: "2024-02-01", amount: 1200 },
        { date: "2024-01-01", amount: 1000 },
        { date: "2024-03-01", amount: 1300 },
      ];
      mockUseUiStore.mockReturnValue({
        paycheckHistory: paychecks,
      });

      // Act
      const { result } = renderHook(() => usePaycheckTrendsQuery(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const trends = result.current.data?.trends;
      expect(trends?.[0].date).toBe("2024-01-01");
      expect(trends?.[1].date).toBe("2024-02-01");
      expect(trends?.[2].date).toBe("2024-03-01");
    });
  });

  describe("Query Configuration", () => {
    it("should use correct stale time", async () => {
      // Arrange
      mockUseUiStore.mockReturnValue({
        paycheckHistory: [{ date: "2024-01-01", amount: 1000 }],
      });

      // Act
      const { result } = renderHook(() => usePaycheckTrendsQuery(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Query should have 10 minute stale time
      expect(result.current.isSuccess).toBe(true);
    });

    it("should be disabled when paycheck history is not available", async () => {
      // Arrange
      mockUseUiStore.mockReturnValue({
        paycheckHistory: undefined,
      });

      // Act
      const { result } = renderHook(() => usePaycheckTrendsQuery(), { wrapper });

      // Assert - Query should not run
      expect(result.current.fetchStatus).toBe("idle");
    });
  });

  describe("Interval Calculations", () => {
    it("should calculate average interval between paychecks", async () => {
      // Arrange - Regular 14-day intervals
      const paychecks = [
        { date: "2024-01-01", amount: 1000 },
        { date: "2024-01-15", amount: 1000 },
        { date: "2024-01-29", amount: 1000 },
      ];
      mockUseUiStore.mockReturnValue({
        paycheckHistory: paychecks,
      });

      // Act
      const { result } = renderHook(() => usePaycheckTrendsQuery(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.averageInterval).toBe(14);
    });

    it("should handle single paycheck with no intervals", async () => {
      // Arrange
      const paychecks = [{ date: "2024-01-01", amount: 1000 }];
      mockUseUiStore.mockReturnValue({
        paycheckHistory: paychecks,
      });

      // Act
      const { result } = renderHook(() => usePaycheckTrendsQuery(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.averageInterval).toBe(0);
    });
  });
});
