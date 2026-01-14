import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { usePerformanceMonitor } from "../usePerformanceMonitor";
import logger from "@/utils/core/common/logger";
import * as performanceMetricsUtils from "../utils/performanceMetricsUtils";
import * as alertsUtils from "../utils/alertsUtils";
import type { AnalyticsData, BalanceData } from "@/types/analytics";

// Mock the logger
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock the utility functions
vi.mock("../utils/performanceMetricsUtils", async () => {
  const actual = await vi.importActual<typeof performanceMetricsUtils>(
    "../utils/performanceMetricsUtils"
  );
  return {
    ...actual,
    calculateBudgetAdherence: vi.fn(),
    calculateSavingsRate: vi.fn(),
    calculateSpendingEfficiency: vi.fn(),
    calculateBalanceStability: vi.fn(),
  };
});

vi.mock("../utils/alertsUtils", async () => {
  const actual = await vi.importActual<typeof alertsUtils>("../utils/alertsUtils");
  return {
    ...actual,
    generateAlerts: vi.fn(),
    generateRecommendations: vi.fn(),
  };
});

describe("usePerformanceMonitor", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    // Setup default mock implementations
    vi.mocked(performanceMetricsUtils.calculateBudgetAdherence).mockReturnValue(80);
    vi.mocked(performanceMetricsUtils.calculateSavingsRate).mockReturnValue(75);
    vi.mocked(performanceMetricsUtils.calculateSpendingEfficiency).mockReturnValue(70);
    vi.mocked(performanceMetricsUtils.calculateBalanceStability).mockReturnValue(85);
    vi.mocked(alertsUtils.generateAlerts).mockReturnValue([]);
    vi.mocked(alertsUtils.generateRecommendations).mockReturnValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initial state", () => {
    it("should initialize with default state values", () => {
      const { result } = renderHook(() => usePerformanceMonitor(null, null));

      expect(result.current.alertsEnabled).toBe(true);
      expect(result.current.selectedMetric).toBe("overview");
      expect(result.current.performanceHistory).toEqual([]);
    });

    it("should initialize with zero metrics when data is null", () => {
      const { result } = renderHook(() => usePerformanceMonitor(null, null));

      expect(result.current.performanceMetrics).toEqual({
        overallScore: 0,
        budgetAdherence: 0,
        savingsRate: 0,
        spendingEfficiency: 0,
        balanceStability: 0,
        alerts: [],
        recommendations: [],
      });
    });

    it("should initialize with zero metrics when data is undefined", () => {
      const { result } = renderHook(() => usePerformanceMonitor(undefined, undefined));

      expect(result.current.performanceMetrics).toEqual({
        overallScore: 0,
        budgetAdherence: 0,
        savingsRate: 0,
        spendingEfficiency: 0,
        balanceStability: 0,
        alerts: [],
        recommendations: [],
      });
    });
  });

  describe("performanceMetrics calculation", () => {
    const mockAnalyticsData: AnalyticsData = {
      filteredTransactions: [],
      monthlyTrends: [],
      envelopeSpending: [],
      categoryBreakdown: [],
      weeklyPatterns: [],
      envelopeHealth: [],
      budgetVsActual: [],
      metrics: {},
      totalIncome: 5000,
    };

    const mockBalanceData: BalanceData = {
      envelopeAnalysis: [
        { name: "Groceries", spent: 450, monthlyBudget: 500 },
        { name: "Gas", spent: 120, monthlyBudget: 150 },
      ],
      actualBalance: 10000,
      virtualBalance: 10050,
      savingsGoals: [{ currentAmount: 1000 }],
    };

    it("should calculate performance metrics with valid data", () => {
      const { result } = renderHook(() =>
        usePerformanceMonitor(mockAnalyticsData, mockBalanceData)
      );

      expect(result.current.performanceMetrics.budgetAdherence).toBe(80);
      expect(result.current.performanceMetrics.savingsRate).toBe(75);
      expect(result.current.performanceMetrics.spendingEfficiency).toBe(70);
      expect(result.current.performanceMetrics.balanceStability).toBe(85);
    });

    it("should calculate overall score using weighted formula", () => {
      const { result } = renderHook(() =>
        usePerformanceMonitor(mockAnalyticsData, mockBalanceData)
      );

      // Expected: 80 * 0.3 + 75 * 0.25 + 70 * 0.25 + 85 * 0.2 = 77.25 -> 77
      expect(result.current.performanceMetrics.overallScore).toBe(77);
    });

    it("should call utility functions with correct parameters", () => {
      renderHook(() => usePerformanceMonitor(mockAnalyticsData, mockBalanceData));

      expect(performanceMetricsUtils.calculateBudgetAdherence).toHaveBeenCalledWith(
        mockAnalyticsData,
        mockBalanceData
      );
      expect(performanceMetricsUtils.calculateSavingsRate).toHaveBeenCalledWith(
        mockAnalyticsData,
        mockBalanceData
      );
      expect(performanceMetricsUtils.calculateSpendingEfficiency).toHaveBeenCalledWith(
        mockAnalyticsData
      );
      expect(performanceMetricsUtils.calculateBalanceStability).toHaveBeenCalledWith(
        mockBalanceData
      );
    });

    it("should generate alerts with correct parameters", () => {
      renderHook(() => usePerformanceMonitor(mockAnalyticsData, mockBalanceData));

      expect(alertsUtils.generateAlerts).toHaveBeenCalledWith(
        mockAnalyticsData,
        mockBalanceData,
        expect.objectContaining({
          budgetAdherence: 80,
          savingsRate: 75,
          balanceStability: 85,
        })
      );
    });

    it("should generate recommendations with correct parameters", () => {
      renderHook(() => usePerformanceMonitor(mockAnalyticsData, mockBalanceData));

      expect(alertsUtils.generateRecommendations).toHaveBeenCalledWith(
        expect.objectContaining({
          budgetAdherence: 80,
          savingsRate: 75,
          balanceStability: 85,
          overallScore: 77,
        })
      );
    });

    it("should return alerts from generateAlerts", () => {
      const mockAlerts = [
        {
          id: "alert-1",
          type: "warning" as const,
          title: "Test Alert",
          message: "Test message",
          severity: "warning" as const,
          date: new Date().toISOString(),
        },
      ];
      vi.mocked(alertsUtils.generateAlerts).mockReturnValue(mockAlerts);

      const { result } = renderHook(() =>
        usePerformanceMonitor(mockAnalyticsData, mockBalanceData)
      );

      expect(result.current.performanceMetrics.alerts).toEqual(mockAlerts);
    });

    it("should return recommendations from generateRecommendations", () => {
      const mockRecommendations = [
        {
          id: "rec-1",
          type: "saving" as const,
          title: "Test Recommendation",
          description: "Test description",
          impact: "High",
          message: "Test message",
        },
      ];
      vi.mocked(alertsUtils.generateRecommendations).mockReturnValue(mockRecommendations);

      const { result } = renderHook(() =>
        usePerformanceMonitor(mockAnalyticsData, mockBalanceData)
      );

      expect(result.current.performanceMetrics.recommendations).toEqual(mockRecommendations);
    });

    it("should recalculate metrics when analyticsData changes", () => {
      const { result, rerender } = renderHook(
        ({ analytics, balance }) => usePerformanceMonitor(analytics, balance),
        {
          initialProps: { analytics: mockAnalyticsData, balance: mockBalanceData },
        }
      );

      const firstScore = result.current.performanceMetrics.overallScore;

      // Change mock return values
      vi.mocked(performanceMetricsUtils.calculateBudgetAdherence).mockReturnValue(90);
      vi.mocked(performanceMetricsUtils.calculateSavingsRate).mockReturnValue(85);

      // Update with new data
      const newAnalyticsData = { ...mockAnalyticsData, totalIncome: 6000 };
      rerender({ analytics: newAnalyticsData, balance: mockBalanceData });

      // Expected: 90 * 0.3 + 85 * 0.25 + 70 * 0.25 + 85 * 0.2 = 83.75 -> 83 (Math.round)
      expect(result.current.performanceMetrics.overallScore).toBe(83);
      expect(result.current.performanceMetrics.overallScore).not.toBe(firstScore);
    });

    it("should recalculate metrics when balanceData changes", () => {
      const { result, rerender } = renderHook(
        ({ analytics, balance }) => usePerformanceMonitor(analytics, balance),
        {
          initialProps: { analytics: mockAnalyticsData, balance: mockBalanceData },
        }
      );

      const firstScore = result.current.performanceMetrics.overallScore;

      // Change mock return values
      vi.mocked(performanceMetricsUtils.calculateBalanceStability).mockReturnValue(95);

      // Update with new data
      const newBalanceData = { ...mockBalanceData, actualBalance: 12000 };
      rerender({ analytics: mockAnalyticsData, balance: newBalanceData });

      // Expected: 80 * 0.3 + 75 * 0.25 + 70 * 0.25 + 95 * 0.2 = 79.25 -> 79
      expect(result.current.performanceMetrics.overallScore).toBe(79);
      expect(result.current.performanceMetrics.overallScore).not.toBe(firstScore);
    });
  });

  describe("state setters", () => {
    it("should update alertsEnabled when setAlertsEnabled is called", () => {
      const { result } = renderHook(() => usePerformanceMonitor(null, null));

      expect(result.current.alertsEnabled).toBe(true);

      act(() => {
        result.current.setAlertsEnabled(false);
      });

      expect(result.current.alertsEnabled).toBe(false);

      act(() => {
        result.current.setAlertsEnabled(true);
      });

      expect(result.current.alertsEnabled).toBe(true);
    });

    it("should update selectedMetric when setSelectedMetric is called", () => {
      const { result } = renderHook(() => usePerformanceMonitor(null, null));

      expect(result.current.selectedMetric).toBe("overview");

      act(() => {
        result.current.setSelectedMetric("budget");
      });

      expect(result.current.selectedMetric).toBe("budget");

      act(() => {
        result.current.setSelectedMetric("savings");
      });

      expect(result.current.selectedMetric).toBe("savings");
    });
  });

  describe("performanceHistory updates", () => {
    const mockAnalyticsData: AnalyticsData = {
      filteredTransactions: [],
      monthlyTrends: [],
      envelopeSpending: [],
      categoryBreakdown: [],
      weeklyPatterns: [],
      envelopeHealth: [],
      budgetVsActual: [],
      metrics: {},
      totalIncome: 5000,
    };

    const mockBalanceData: BalanceData = {
      envelopeAnalysis: [],
      actualBalance: 10000,
      virtualBalance: 10050,
      savingsGoals: [],
    };

    it("should add entry to performanceHistory after 60 seconds", () => {
      const { result } = renderHook(() =>
        usePerformanceMonitor(mockAnalyticsData, mockBalanceData)
      );

      expect(result.current.performanceHistory).toHaveLength(0);

      // Advance timer by 60 seconds
      act(() => {
        vi.advanceTimersByTime(60000);
      });

      expect(result.current.performanceHistory).toHaveLength(1);

      const entry = result.current.performanceHistory[0];
      expect(entry).toHaveProperty("month");
      expect(entry).toHaveProperty("timestamp");
      expect(entry).toHaveProperty("score");
      expect(entry).toHaveProperty("change");
      expect(entry).toHaveProperty("budgetAdherence");
      expect(entry).toHaveProperty("savingsRate");
    });

    it("should add multiple entries as time passes", () => {
      const { result } = renderHook(() =>
        usePerformanceMonitor(mockAnalyticsData, mockBalanceData)
      );

      // Add 3 entries
      act(() => {
        vi.advanceTimersByTime(60000); // First entry
      });

      act(() => {
        vi.advanceTimersByTime(60000); // Second entry
      });

      act(() => {
        vi.advanceTimersByTime(60000); // Third entry
      });

      expect(result.current.performanceHistory.length).toBeGreaterThanOrEqual(3);
    });

    it("should calculate change based on previous score", () => {
      const { result } = renderHook(() =>
        usePerformanceMonitor(mockAnalyticsData, mockBalanceData)
      );

      // First entry
      act(() => {
        vi.advanceTimersByTime(60000);
      });

      expect(result.current.performanceHistory).toHaveLength(1);

      const firstEntry = result.current.performanceHistory[0];
      expect(firstEntry.change).toBe(firstEntry.score); // Change from 0

      // Second entry
      act(() => {
        vi.advanceTimersByTime(60000);
      });

      expect(result.current.performanceHistory.length).toBeGreaterThanOrEqual(2);

      const secondEntry = result.current.performanceHistory[1];
      expect(secondEntry.change).toBe(secondEntry.score - firstEntry.score);
    });

    it("should limit history to 50 entries", () => {
      const { result } = renderHook(() =>
        usePerformanceMonitor(mockAnalyticsData, mockBalanceData)
      );

      // Add 52 entries (more than the limit)
      act(() => {
        vi.advanceTimersByTime(60000 * 52);
      });

      expect(result.current.performanceHistory.length).toBeLessThanOrEqual(50);
    });

    it("should include current metrics in performance entry", () => {
      const { result } = renderHook(() =>
        usePerformanceMonitor(mockAnalyticsData, mockBalanceData)
      );

      const currentScore = result.current.performanceMetrics.overallScore;
      const currentBudgetAdherence = result.current.performanceMetrics.budgetAdherence;
      const currentSavingsRate = result.current.performanceMetrics.savingsRate;

      act(() => {
        vi.advanceTimersByTime(60000);
      });

      expect(result.current.performanceHistory).toHaveLength(1);

      const entry = result.current.performanceHistory[0];
      expect(entry.score).toBe(currentScore);
      expect(entry.budgetAdherence).toBe(currentBudgetAdherence);
      expect(entry.savingsRate).toBe(currentSavingsRate);
    });

    it("should clean up interval on unmount", () => {
      const { unmount } = renderHook(() =>
        usePerformanceMonitor(mockAnalyticsData, mockBalanceData)
      );

      const clearIntervalSpy = vi.spyOn(global, "clearInterval");

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe("logger integration", () => {
    const mockAnalyticsData: AnalyticsData = {
      filteredTransactions: [],
      monthlyTrends: [],
      envelopeSpending: [],
      categoryBreakdown: [],
      weeklyPatterns: [],
      envelopeHealth: [],
      budgetVsActual: [],
      metrics: {},
      totalIncome: 5000,
    };

    const mockBalanceData: BalanceData = {
      envelopeAnalysis: [],
      actualBalance: 10000,
      virtualBalance: 10050,
      savingsGoals: [],
    };

    it("should log debug message when metrics are calculated", () => {
      renderHook(() => usePerformanceMonitor(mockAnalyticsData, mockBalanceData));

      expect(logger.debug).toHaveBeenCalledWith(
        "Performance metrics updated",
        expect.objectContaining({
          overallScore: 77,
          alertCount: 0,
          recommendationCount: 0,
        })
      );
    });

    it("should not log when overallScore is 0", () => {
      vi.clearAllMocks();
      renderHook(() => usePerformanceMonitor(null, null));

      expect(logger.debug).not.toHaveBeenCalled();
    });

    it("should log with correct alert and recommendation counts", () => {
      const mockAlerts = [
        {
          id: "alert-1",
          type: "warning" as const,
          title: "Test",
          message: "Test",
          severity: "warning" as const,
          date: "2024-01-01",
        },
        {
          id: "alert-2",
          type: "critical" as const,
          title: "Test",
          message: "Test",
          severity: "critical" as const,
          date: "2024-01-01",
        },
      ];
      const mockRecommendations = [
        {
          id: "rec-1",
          type: "saving" as const,
          title: "Test",
          description: "Test",
          impact: "High",
          message: "Test",
        },
      ];

      vi.mocked(alertsUtils.generateAlerts).mockReturnValue(mockAlerts);
      vi.mocked(alertsUtils.generateRecommendations).mockReturnValue(mockRecommendations);

      renderHook(() => usePerformanceMonitor(mockAnalyticsData, mockBalanceData));

      expect(logger.debug).toHaveBeenCalledWith(
        "Performance metrics updated",
        expect.objectContaining({
          overallScore: 77,
          alertCount: 2,
          recommendationCount: 1,
        })
      );
    });

    it("should log again when metrics change", () => {
      vi.clearAllMocks();

      const { rerender } = renderHook(
        ({ analytics, balance }) => usePerformanceMonitor(analytics, balance),
        {
          initialProps: { analytics: mockAnalyticsData, balance: mockBalanceData },
        }
      );

      expect(logger.debug).toHaveBeenCalledTimes(1);

      // Change metrics
      vi.mocked(performanceMetricsUtils.calculateBudgetAdherence).mockReturnValue(90);

      const newAnalyticsData = { ...mockAnalyticsData, totalIncome: 6000 };
      rerender({ analytics: newAnalyticsData, balance: mockBalanceData });

      expect(logger.debug).toHaveBeenCalledTimes(2);
    });
  });

  describe("edge cases", () => {
    it("should handle zero scores in weighted calculation", () => {
      vi.mocked(performanceMetricsUtils.calculateBudgetAdherence).mockReturnValue(0);
      vi.mocked(performanceMetricsUtils.calculateSavingsRate).mockReturnValue(0);
      vi.mocked(performanceMetricsUtils.calculateSpendingEfficiency).mockReturnValue(0);
      vi.mocked(performanceMetricsUtils.calculateBalanceStability).mockReturnValue(0);

      const mockAnalyticsData: AnalyticsData = {
        filteredTransactions: [],
        monthlyTrends: [],
        envelopeSpending: [],
        categoryBreakdown: [],
        weeklyPatterns: [],
        envelopeHealth: [],
        budgetVsActual: [],
        metrics: {},
        totalIncome: 5000,
      };

      const mockBalanceData: BalanceData = {
        envelopeAnalysis: [],
        actualBalance: 10000,
        virtualBalance: 10050,
        savingsGoals: [],
      };

      const { result } = renderHook(() =>
        usePerformanceMonitor(mockAnalyticsData, mockBalanceData)
      );

      expect(result.current.performanceMetrics.overallScore).toBe(0);
    });

    it("should handle maximum scores in weighted calculation", () => {
      vi.mocked(performanceMetricsUtils.calculateBudgetAdherence).mockReturnValue(100);
      vi.mocked(performanceMetricsUtils.calculateSavingsRate).mockReturnValue(100);
      vi.mocked(performanceMetricsUtils.calculateSpendingEfficiency).mockReturnValue(100);
      vi.mocked(performanceMetricsUtils.calculateBalanceStability).mockReturnValue(100);

      const mockAnalyticsData: AnalyticsData = {
        filteredTransactions: [],
        monthlyTrends: [],
        envelopeSpending: [],
        categoryBreakdown: [],
        weeklyPatterns: [],
        envelopeHealth: [],
        budgetVsActual: [],
        metrics: {},
        totalIncome: 5000,
      };

      const mockBalanceData: BalanceData = {
        envelopeAnalysis: [],
        actualBalance: 10000,
        virtualBalance: 10050,
        savingsGoals: [],
      };

      const { result } = renderHook(() =>
        usePerformanceMonitor(mockAnalyticsData, mockBalanceData)
      );

      expect(result.current.performanceMetrics.overallScore).toBe(100);
    });

    it("should handle empty envelopeAnalysis", () => {
      const mockAnalyticsData: AnalyticsData = {
        filteredTransactions: [],
        monthlyTrends: [],
        envelopeSpending: [],
        categoryBreakdown: [],
        weeklyPatterns: [],
        envelopeHealth: [],
        budgetVsActual: [],
        metrics: {},
        totalIncome: 5000,
      };

      const mockBalanceData: BalanceData = {
        envelopeAnalysis: [],
        actualBalance: 10000,
        virtualBalance: 10050,
        savingsGoals: [],
      };

      const { result } = renderHook(() =>
        usePerformanceMonitor(mockAnalyticsData, mockBalanceData)
      );

      expect(result.current.performanceMetrics).toBeDefined();
      expect(typeof result.current.performanceMetrics.overallScore).toBe("number");
    });

    it("should handle missing optional properties in balanceData", () => {
      const mockAnalyticsData: AnalyticsData = {
        filteredTransactions: [],
        monthlyTrends: [],
        envelopeSpending: [],
        categoryBreakdown: [],
        weeklyPatterns: [],
        envelopeHealth: [],
        budgetVsActual: [],
        metrics: {},
        totalIncome: 5000,
      };

      const mockBalanceData: BalanceData = {
        // Only required properties
      };

      const { result } = renderHook(() =>
        usePerformanceMonitor(mockAnalyticsData, mockBalanceData)
      );

      expect(result.current.performanceMetrics).toBeDefined();
      expect(typeof result.current.performanceMetrics.overallScore).toBe("number");
    });
  });
});
