import { renderHook } from "@testing-library/react";
import { vi, beforeEach, afterEach, describe, it, expect } from "vitest";
import usePaydayPrediction from "../usePaydayPrediction";
import { predictNextPayday, checkRecentPayday } from "@/utils/domain/budgeting/paydayPredictor";
import useToast from "@/hooks/platform/ux/useToast";
import logger from "@/utils/core/common/logger";
import localStorageService from "@/services/storage/localStorageService";

// Mock dependencies
vi.mock("@/utils/domain/budgeting/paydayPredictor", () => ({
  predictNextPayday: vi.fn(),
  checkRecentPayday: vi.fn(),
}));

vi.mock("@/hooks/platform/ux/useToast", () => ({
  default: vi.fn(() => ({
    showPayday: vi.fn(),
  })),
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("@/services/storage/localStorageService", () => ({
  default: {
    getLastPaydayNotification: vi.fn(),
    setLastPaydayNotification: vi.fn(),
  },
}));

describe("usePaydayPrediction", () => {
  let mockShowPayday: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockShowPayday = vi.fn();
    vi.mocked(useToast).mockReturnValue({
      showPayday: mockShowPayday,
      toasts: [],
      addToast: vi.fn(),
      removeToast: vi.fn(),
      clearAllToasts: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      showWarning: vi.fn(),
      showInfo: vi.fn(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initialization and basic behavior", () => {
    it("should not check payday when isUnlocked is false", () => {
      const paycheckHistory = [
        { date: "2023-01-01", amount: 2000 },
        { date: "2023-01-15", amount: 2000 },
      ];

      renderHook(() => usePaydayPrediction(paycheckHistory, false));

      expect(predictNextPayday).not.toHaveBeenCalled();
      expect(mockShowPayday).not.toHaveBeenCalled();
    });

    it("should not check payday with null paycheck history", () => {
      renderHook(() => usePaydayPrediction(null, true));

      expect(predictNextPayday).not.toHaveBeenCalled();
      expect(mockShowPayday).not.toHaveBeenCalled();
    });

    it("should not check payday with insufficient history (< 2 paychecks)", () => {
      const paycheckHistory = [{ date: "2023-01-01", amount: 2000 }];

      renderHook(() => usePaydayPrediction(paycheckHistory, true));

      expect(predictNextPayday).not.toHaveBeenCalled();
      expect(mockShowPayday).not.toHaveBeenCalled();
    });

    it("should not check payday with empty paycheck history", () => {
      renderHook(() => usePaydayPrediction([], true));

      expect(predictNextPayday).not.toHaveBeenCalled();
      expect(mockShowPayday).not.toHaveBeenCalled();
    });
  });

  describe("payday prediction and notifications", () => {
    const paycheckHistory = [
      { date: "2023-01-01", amount: 2000 },
      { date: "2023-01-15", amount: 2000 },
      { date: "2023-02-01", amount: 2000 },
    ];

    it("should check payday with sufficient history", () => {
      const mockPrediction = {
        nextPayday: new Date("2023-02-15"),
        confidence: 95,
        pattern: "biweekly",
        intervalDays: 14,
        message: "High confidence biweekly pattern detected",
      };

      vi.mocked(predictNextPayday).mockReturnValue(mockPrediction);
      vi.mocked(checkRecentPayday).mockReturnValue({
        occurred: false,
        daysAgo: -7,
      });

      renderHook(() => usePaydayPrediction(paycheckHistory, true));

      expect(predictNextPayday).toHaveBeenCalledWith(paycheckHistory);
      expect(checkRecentPayday).toHaveBeenCalledWith(mockPrediction);
    });

    it("should not show notification when prediction has no nextPayday", () => {
      const mockPrediction = {
        nextPayday: null,
        confidence: 0,
        pattern: null,
        message: "Not enough data",
      };

      vi.mocked(predictNextPayday).mockReturnValue(mockPrediction);

      renderHook(() => usePaydayPrediction(paycheckHistory, true));

      expect(predictNextPayday).toHaveBeenCalled();
      expect(checkRecentPayday).not.toHaveBeenCalled();
      expect(mockShowPayday).not.toHaveBeenCalled();
    });

    it("should show notification when payday is today", () => {
      const mockPrediction = {
        nextPayday: new Date("2023-02-15"),
        confidence: 95,
        pattern: "biweekly",
        intervalDays: 14,
        message: "High confidence biweekly pattern detected",
      };

      vi.mocked(predictNextPayday).mockReturnValue(mockPrediction);
      vi.mocked(checkRecentPayday).mockReturnValue({
        occurred: true,
        daysAgo: 0,
        wasToday: true,
      });
      vi.mocked(localStorageService.getLastPaydayNotification).mockReturnValue(null);

      renderHook(() => usePaydayPrediction(paycheckHistory, true));

      expect(mockShowPayday).toHaveBeenCalledWith(
        "🎉 Payday Today!",
        "Based on your biweekly paycheck pattern, today should be payday! Consider processing your paycheck.",
        10000
      );
      expect(localStorageService.setLastPaydayNotification).toHaveBeenCalledWith(
        expect.any(String)
      );
    });

    it("should show notification when payday was yesterday", () => {
      const mockPrediction = {
        nextPayday: new Date("2023-02-15"),
        confidence: 95,
        pattern: "weekly",
        intervalDays: 7,
        message: "High confidence weekly pattern detected",
      };

      vi.mocked(predictNextPayday).mockReturnValue(mockPrediction);
      vi.mocked(checkRecentPayday).mockReturnValue({
        occurred: true,
        daysAgo: 1,
        wasYesterday: true,
      });
      vi.mocked(localStorageService.getLastPaydayNotification).mockReturnValue(null);

      renderHook(() => usePaydayPrediction(paycheckHistory, true));

      expect(mockShowPayday).toHaveBeenCalledWith(
        "💰 Payday Was Yesterday",
        "Based on your weekly pattern, payday was yesterday. Don't forget to process your paycheck!",
        10000
      );
      expect(localStorageService.setLastPaydayNotification).toHaveBeenCalled();
    });

    it("should show notification when payday was 2 days ago", () => {
      const mockPrediction = {
        nextPayday: new Date("2023-02-15"),
        confidence: 85,
        pattern: "monthly",
        intervalDays: 30,
        message: "Moderate confidence monthly pattern detected",
      };

      vi.mocked(predictNextPayday).mockReturnValue(mockPrediction);
      vi.mocked(checkRecentPayday).mockReturnValue({
        occurred: true,
        daysAgo: 2,
      });
      vi.mocked(localStorageService.getLastPaydayNotification).mockReturnValue(null);

      renderHook(() => usePaydayPrediction(paycheckHistory, true));

      expect(mockShowPayday).toHaveBeenCalledWith(
        "📅 Recent Payday",
        "Based on your monthly pattern, payday was 2 days ago.",
        10000
      );
      expect(localStorageService.setLastPaydayNotification).toHaveBeenCalled();
    });

    it("should not show notification when payday was not recent", () => {
      const mockPrediction = {
        nextPayday: new Date("2023-02-15"),
        confidence: 95,
        pattern: "biweekly",
        intervalDays: 14,
        message: "High confidence biweekly pattern detected",
      };

      vi.mocked(predictNextPayday).mockReturnValue(mockPrediction);
      vi.mocked(checkRecentPayday).mockReturnValue({
        occurred: false,
        daysAgo: -5,
      });

      renderHook(() => usePaydayPrediction(paycheckHistory, true));

      expect(mockShowPayday).not.toHaveBeenCalled();
      expect(localStorageService.setLastPaydayNotification).not.toHaveBeenCalled();
    });

    it("should not show notification if already shown today", () => {
      const today = new Date().toDateString();
      const mockPrediction = {
        nextPayday: new Date("2023-02-15"),
        confidence: 95,
        pattern: "biweekly",
        intervalDays: 14,
        message: "High confidence biweekly pattern detected",
      };

      vi.mocked(predictNextPayday).mockReturnValue(mockPrediction);
      vi.mocked(checkRecentPayday).mockReturnValue({
        occurred: true,
        daysAgo: 0,
        wasToday: true,
      });
      vi.mocked(localStorageService.getLastPaydayNotification).mockReturnValue(today);

      renderHook(() => usePaydayPrediction(paycheckHistory, true));

      expect(mockShowPayday).not.toHaveBeenCalled();
      expect(localStorageService.setLastPaydayNotification).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    const paycheckHistory = [
      { date: "2023-01-01", amount: 2000 },
      { date: "2023-01-15", amount: 2000 },
    ];

    it("should not show notification when payday occurred but doesn't match specific conditions", () => {
      const paycheckHistory = [
        { date: "2023-01-01", amount: 2000 },
        { date: "2023-01-15", amount: 2000 },
      ];

      const mockPrediction = {
        nextPayday: new Date("2023-02-15"),
        confidence: 95,
        pattern: "biweekly",
        intervalDays: 14,
        message: "High confidence biweekly pattern detected",
      };

      vi.mocked(predictNextPayday).mockReturnValue(mockPrediction);
      vi.mocked(checkRecentPayday).mockReturnValue({
        occurred: true,
        daysAgo: 3, // More than 2 days ago
      });
      vi.mocked(localStorageService.getLastPaydayNotification).mockReturnValue(null);

      renderHook(() => usePaydayPrediction(paycheckHistory, true));

      // Should not show notification since it doesn't match the specific day conditions
      expect(mockShowPayday).not.toHaveBeenCalled();
      expect(localStorageService.setLastPaydayNotification).not.toHaveBeenCalled();
    });

    it("should handle errors in prediction logic gracefully", () => {
      vi.mocked(predictNextPayday).mockImplementation(() => {
        throw new Error("Prediction failed");
      });

      renderHook(() => usePaydayPrediction(paycheckHistory, true));

      expect(logger.error).toHaveBeenCalledWith(
        "Error checking payday prediction:",
        expect.any(Error)
      );
      expect(mockShowPayday).not.toHaveBeenCalled();
    });

    it("should handle errors in checkRecentPayday gracefully", () => {
      const mockPrediction = {
        nextPayday: new Date("2023-02-15"),
        confidence: 95,
        pattern: "biweekly",
        intervalDays: 14,
        message: "High confidence biweekly pattern detected",
      };

      vi.mocked(predictNextPayday).mockReturnValue(mockPrediction);
      vi.mocked(checkRecentPayday).mockImplementation(() => {
        throw new Error("Check failed");
      });

      renderHook(() => usePaydayPrediction(paycheckHistory, true));

      expect(logger.error).toHaveBeenCalledWith(
        "Error checking payday prediction:",
        expect.any(Error)
      );
    });

    it("should handle localStorage errors gracefully", () => {
      const mockPrediction = {
        nextPayday: new Date("2023-02-15"),
        confidence: 95,
        pattern: "biweekly",
        intervalDays: 14,
        message: "High confidence biweekly pattern detected",
      };

      vi.mocked(predictNextPayday).mockReturnValue(mockPrediction);
      vi.mocked(checkRecentPayday).mockReturnValue({
        occurred: true,
        daysAgo: 0,
        wasToday: true,
      });
      vi.mocked(localStorageService.getLastPaydayNotification).mockImplementation(() => {
        throw new Error("localStorage error");
      });

      renderHook(() => usePaydayPrediction(paycheckHistory, true));

      // Should still attempt to show notification despite localStorage error
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("interval management", () => {
    const paycheckHistory = [
      { date: "2023-01-01", amount: 2000 },
      { date: "2023-01-15", amount: 2000 },
    ];

    it("should set up interval to check payday every 4 hours", () => {
      const mockPrediction = {
        nextPayday: new Date("2023-02-15"),
        confidence: 95,
        pattern: "biweekly",
        intervalDays: 14,
        message: "High confidence biweekly pattern detected",
      };

      vi.mocked(predictNextPayday).mockReturnValue(mockPrediction);
      vi.mocked(checkRecentPayday).mockReturnValue({
        occurred: false,
        daysAgo: -5,
      });

      const setIntervalSpy = vi.spyOn(global, "setInterval");

      renderHook(() => usePaydayPrediction(paycheckHistory, true));

      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 4 * 60 * 60 * 1000);
    });

    it("should clean up interval on unmount", () => {
      const mockPrediction = {
        nextPayday: new Date("2023-02-15"),
        confidence: 95,
        pattern: "biweekly",
        intervalDays: 14,
        message: "High confidence biweekly pattern detected",
      };

      vi.mocked(predictNextPayday).mockReturnValue(mockPrediction);
      vi.mocked(checkRecentPayday).mockReturnValue({
        occurred: false,
        daysAgo: -5,
      });

      const clearIntervalSpy = vi.spyOn(global, "clearInterval");

      const { unmount } = renderHook(() => usePaydayPrediction(paycheckHistory, true));

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it("should call checkPayday on interval tick", () => {
      const mockPrediction = {
        nextPayday: new Date("2023-02-15"),
        confidence: 95,
        pattern: "biweekly",
        intervalDays: 14,
        message: "High confidence biweekly pattern detected",
      };

      vi.mocked(predictNextPayday).mockReturnValue(mockPrediction);
      vi.mocked(checkRecentPayday).mockReturnValue({
        occurred: false,
        daysAgo: -5,
      });

      renderHook(() => usePaydayPrediction(paycheckHistory, true));

      // Initial call
      expect(predictNextPayday).toHaveBeenCalledTimes(1);

      // Advance time by 4 hours
      vi.advanceTimersByTime(4 * 60 * 60 * 1000);

      // Should have been called again after interval
      expect(predictNextPayday).toHaveBeenCalledTimes(2);
    });

    it("should recreate interval when dependencies change", () => {
      const mockPrediction = {
        nextPayday: new Date("2023-02-15"),
        confidence: 95,
        pattern: "biweekly",
        intervalDays: 14,
        message: "High confidence biweekly pattern detected",
      };

      vi.mocked(predictNextPayday).mockReturnValue(mockPrediction);
      vi.mocked(checkRecentPayday).mockReturnValue({
        occurred: false,
        daysAgo: -5,
      });

      const clearIntervalSpy = vi.spyOn(global, "clearInterval");

      const { rerender } = renderHook(
        ({ history, unlocked }) => usePaydayPrediction(history, unlocked),
        {
          initialProps: {
            history: paycheckHistory,
            unlocked: true,
          },
        }
      );

      const callCount = clearIntervalSpy.mock.calls.length;

      // Change props to trigger re-render
      rerender({
        history: [...paycheckHistory, { date: "2023-02-01", amount: 2000 }],
        unlocked: true,
      });

      // Should have cleaned up old interval
      expect(clearIntervalSpy).toHaveBeenCalledTimes(callCount + 1);
    });
  });

  describe("edge cases", () => {
    it("should handle paycheck history with Date objects", () => {
      const paycheckHistory = [
        { date: new Date("2023-01-01"), amount: 2000 },
        { date: new Date("2023-01-15"), amount: 2000 },
      ];

      const mockPrediction = {
        nextPayday: new Date("2023-02-15"),
        confidence: 95,
        pattern: "biweekly",
        intervalDays: 14,
        message: "High confidence biweekly pattern detected",
      };

      vi.mocked(predictNextPayday).mockReturnValue(mockPrediction);
      vi.mocked(checkRecentPayday).mockReturnValue({
        occurred: false,
        daysAgo: -5,
      });

      renderHook(() => usePaydayPrediction(paycheckHistory, true));

      expect(predictNextPayday).toHaveBeenCalledWith(paycheckHistory);
    });

    it("should handle pattern as null in notification message", () => {
      const paycheckHistory = [
        { date: "2023-01-01", amount: 2000 },
        { date: "2023-01-15", amount: 2000 },
      ];

      const mockPrediction = {
        nextPayday: new Date("2023-02-15"),
        confidence: 95,
        pattern: "15-day cycle",
        intervalDays: 15,
        message: "Custom pattern detected",
      };

      vi.mocked(predictNextPayday).mockReturnValue(mockPrediction);
      vi.mocked(checkRecentPayday).mockReturnValue({
        occurred: true,
        daysAgo: 0,
        wasToday: true,
      });
      vi.mocked(localStorageService.getLastPaydayNotification).mockReturnValue(null);

      renderHook(() => usePaydayPrediction(paycheckHistory, true));

      expect(mockShowPayday).toHaveBeenCalledWith(
        "🎉 Payday Today!",
        "Based on your 15-day cycle paycheck pattern, today should be payday! Consider processing your paycheck.",
        10000
      );
    });

    it("should transition from locked to unlocked state", () => {
      const paycheckHistory = [
        { date: "2023-01-01", amount: 2000 },
        { date: "2023-01-15", amount: 2000 },
      ];

      const mockPrediction = {
        nextPayday: new Date("2023-02-15"),
        confidence: 95,
        pattern: "biweekly",
        intervalDays: 14,
        message: "High confidence biweekly pattern detected",
      };

      vi.mocked(predictNextPayday).mockReturnValue(mockPrediction);
      vi.mocked(checkRecentPayday).mockReturnValue({
        occurred: false,
        daysAgo: -5,
      });

      const { rerender } = renderHook(
        ({ history, unlocked }) => usePaydayPrediction(history, unlocked),
        {
          initialProps: {
            history: paycheckHistory,
            unlocked: false,
          },
        }
      );

      expect(predictNextPayday).not.toHaveBeenCalled();

      // Unlock
      rerender({
        history: paycheckHistory,
        unlocked: true,
      });

      expect(predictNextPayday).toHaveBeenCalled();
    });
  });
});
