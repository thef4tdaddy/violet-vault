import { renderHook, act } from "@testing-library/react";
import { vi, beforeEach, describe, it, expect } from "vitest";
import { usePaydayManager } from "../usePaydayManager";
import { globalToast } from "@/stores/ui/toastStore";
import { predictNextPayday, type PaydayPrediction } from "@/utils/domain/budgeting/paydayPredictor";
import logger from "@/utils/core/common/logger";
import type { PaycheckHistoryItem } from "../types";

// Mock dependencies
vi.mock("@/stores/ui/toastStore", () => ({
  globalToast: {
    showError: vi.fn(),
    showInfo: vi.fn(),
  },
}));

vi.mock("@/utils/domain/budgeting/paydayPredictor", () => ({
  predictNextPayday: vi.fn(),
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe("usePaydayManager", () => {
  let mockSetActiveView: ReturnType<typeof vi.fn>;
  let mockPaycheckHistory: PaycheckHistoryItem[];

  beforeEach(() => {
    vi.clearAllMocks();
    mockSetActiveView = vi.fn();
    mockPaycheckHistory = [
      { id: "1", date: "2023-01-01", amount: 2000, processedAt: "2023-01-01", source: "Work" },
      { id: "2", date: "2023-01-15", amount: 2000, processedAt: "2023-01-15", source: "Work" },
      { id: "3", date: "2023-02-01", amount: 2000, processedAt: "2023-02-01", source: "Work" },
    ];
  });

  describe("payday prediction", () => {
    it("should generate payday prediction with sufficient history", () => {
      const mockPrediction: PaydayPrediction = {
        nextPayday: new Date("2023-02-15"),
        confidence: 95,
        pattern: "biweekly",
        intervalDays: 14,
        message: "High confidence biweekly pattern detected",
      };
      vi.mocked(predictNextPayday).mockReturnValue(mockPrediction);

      const { result } = renderHook(() => usePaydayManager(mockPaycheckHistory, mockSetActiveView));

      expect(result.current.paydayPrediction).toBe(mockPrediction);
      expect(predictNextPayday).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ date: "2023-01-01" }),
          expect.objectContaining({ date: "2023-01-15" }),
          expect.objectContaining({ date: "2023-02-01" }),
        ])
      );
    });

    it("should not generate prediction with insufficient history", () => {
      const { result } = renderHook(() =>
        usePaydayManager(
          [
            {
              id: "1",
              date: "2023-01-01",
              amount: 2000,
              processedAt: "2023-01-01",
              source: "Work",
            },
          ],
          mockSetActiveView
        )
      );

      expect(result.current.paydayPrediction).toBeNull();
      expect(predictNextPayday).not.toHaveBeenCalled();
    });

    it("should handle empty paycheck history", () => {
      const { result } = renderHook(() => usePaydayManager([], mockSetActiveView));

      expect(result.current.paydayPrediction).toBeNull();
      expect(predictNextPayday).not.toHaveBeenCalled();
    });

    it("should normalize paycheck history dates", () => {
      vi.mocked(predictNextPayday).mockReturnValue({
        nextPayday: new Date("2023-02-15"),
        confidence: 85,
        pattern: "biweekly",
        message: "Pattern detected",
      });

      renderHook(() => usePaydayManager(mockPaycheckHistory, mockSetActiveView));

      expect(predictNextPayday).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            date: "2023-01-01",
          }),
        ])
      );
    });

    it("should update prediction when history changes", () => {
      const mockPrediction1: PaydayPrediction = {
        nextPayday: new Date("2023-02-15"),
        confidence: 90,
        pattern: "biweekly",
        message: "Pattern detected",
      };
      const mockPrediction2: PaydayPrediction = {
        nextPayday: new Date("2023-03-01"),
        confidence: 85,
        pattern: "biweekly",
        message: "Pattern detected",
      };

      vi.mocked(predictNextPayday).mockReturnValueOnce(mockPrediction1);

      const { result, rerender } = renderHook(
        ({ history, setView }) => usePaydayManager(history, setView),
        {
          initialProps: {
            history: mockPaycheckHistory,
            setView: mockSetActiveView,
          },
        }
      );

      expect(result.current.paydayPrediction).toBe(mockPrediction1);

      // Add new paycheck
      const newHistory = [
        ...mockPaycheckHistory,
        {
          id: "4",
          date: "2023-02-15",
          amount: 2000,
          processedAt: "2023-02-15",
          source: "Work",
        },
      ];

      vi.mocked(predictNextPayday).mockReturnValueOnce(mockPrediction2);
      rerender({ history: newHistory, setView: mockSetActiveView });

      expect(predictNextPayday).toHaveBeenCalledTimes(2);
    });

    it("should handle default empty history", () => {
      const { result } = renderHook(() => usePaydayManager(undefined, mockSetActiveView));

      expect(result.current.paydayPrediction).toBeNull();
    });
  });

  describe("handleProcessPaycheck", () => {
    it("should handle process paycheck navigation", () => {
      const { result } = renderHook(() => usePaydayManager(mockPaycheckHistory, mockSetActiveView));

      act(() => {
        result.current.handleProcessPaycheck();
      });

      expect(mockSetActiveView).toHaveBeenCalledWith("paycheck");
      expect(mockSetActiveView).toHaveBeenCalledTimes(1);
      expect(vi.mocked(logger.debug)).toHaveBeenCalledWith("Navigating to paycheck processor");
    });

    it("should be callable multiple times", () => {
      const { result } = renderHook(() => usePaydayManager(mockPaycheckHistory, mockSetActiveView));

      act(() => {
        result.current.handleProcessPaycheck();
        result.current.handleProcessPaycheck();
      });

      expect(mockSetActiveView).toHaveBeenCalledTimes(2);
    });

    it("should maintain stable reference", () => {
      const { result, rerender } = renderHook(() =>
        usePaydayManager(mockPaycheckHistory, mockSetActiveView)
      );

      const handler1 = result.current.handleProcessPaycheck;
      rerender();
      const handler2 = result.current.handleProcessPaycheck;

      expect(handler1).toBe(handler2);
    });
  });

  describe("handlePrepareEnvelopes", () => {
    it("should handle envelope preparation", () => {
      const { result } = renderHook(() => usePaydayManager(mockPaycheckHistory, mockSetActiveView));

      act(() => {
        result.current.handlePrepareEnvelopes();
      });

      expect(globalToast.showInfo).toHaveBeenCalledWith(
        "Navigate to envelope management for funding planning!",
        "Funding Planning"
      );
    });

    it("should be callable multiple times", () => {
      const { result } = renderHook(() => usePaydayManager(mockPaycheckHistory, mockSetActiveView));

      act(() => {
        result.current.handlePrepareEnvelopes();
        result.current.handlePrepareEnvelopes();
      });

      expect(globalToast.showInfo).toHaveBeenCalledTimes(2);
    });

    it("should maintain stable reference", () => {
      const { result, rerender } = renderHook(() =>
        usePaydayManager(mockPaycheckHistory, mockSetActiveView)
      );

      const handler1 = result.current.handlePrepareEnvelopes;
      rerender();
      const handler2 = result.current.handlePrepareEnvelopes;

      expect(handler1).toBe(handler2);
    });
  });

  describe("hook lifecycle", () => {
    it("should not cause side effects on mount", () => {
      renderHook(() => usePaydayManager(mockPaycheckHistory, mockSetActiveView));

      expect(mockSetActiveView).not.toHaveBeenCalled();
      expect(globalToast.showInfo).not.toHaveBeenCalled();
    });

    it("should handle rapid rerenders", () => {
      const { rerender } = renderHook(() =>
        usePaydayManager(mockPaycheckHistory, mockSetActiveView)
      );

      for (let i = 0; i < 10; i++) {
        rerender();
      }

      // Should not cause errors or excessive calls
      expect(mockSetActiveView).not.toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("should handle missing dates in paycheck history", () => {
      const historyWithMissingDates = [
        { id: "1", amount: 2000, processedAt: "2023-01-01", source: "Work" },
        { id: "2", date: "2023-01-15", amount: 2000, processedAt: "2023-01-15", source: "Work" },
      ] as PaycheckHistoryItem[];

      const { result } = renderHook(() =>
        usePaydayManager(historyWithMissingDates, mockSetActiveView)
      );

      // Should handle gracefully
      expect(result.current).toBeDefined();
    });

    it("should handle paycheck history with single entry", () => {
      const singleEntry = [
        { id: "1", date: "2023-01-01", amount: 2000, processedAt: "2023-01-01", source: "Work" },
      ];

      const { result } = renderHook(() => usePaydayManager(singleEntry, mockSetActiveView));

      expect(result.current.paydayPrediction).toBeNull();
    });
  });
});
