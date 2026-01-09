import { renderHook, act } from "@testing-library/react";
import { vi, beforeEach, describe, it, expect } from "vitest";
import { usePaydayManager } from "../usePaydayManager";
import { globalToast } from "@/stores/ui/toastStore";
import { predictNextPayday } from "@/utils/budgeting/paydayPredictor";
import logger from "@/utils/common/logger";
import type { PaycheckHistoryItem } from "../types";

// Mock dependencies
vi.mock("@/stores/ui/toastStore", () => ({
  globalToast: {
    showError: vi.fn(),
    showInfo: vi.fn(),
  },
}));

vi.mock("@/utils/budgeting/paydayPredictor", () => ({
  predictNextPayday: vi.fn(),
}));

vi.mock("@/utils/common/logger", () => ({
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
    mockSetActiveView = vi.fn();
    mockPaycheckHistory = [
      { id: "1", date: "2023-01-01", amount: 2000, processedAt: "2023-01-01", source: "Work" },
      { id: "2", date: "2023-01-15", amount: 2000, processedAt: "2023-01-15", source: "Work" },
      { id: "3", date: "2023-02-01", amount: 2000, processedAt: "2023-02-01", source: "Work" },
    ];
  });

  it("should generate payday prediction with sufficient history", () => {
    const mockPrediction = {
      nextPayday: "2023-02-15",
      confidence: 0.95,
      frequency: "semimonthly",
      daysUntil: 14,
    };
    vi.mocked(predictNextPayday).mockReturnValue(mockPrediction);

    const { result } = renderHook(() => usePaydayManager(mockPaycheckHistory, mockSetActiveView));

    expect(result.current.paydayPrediction).toBe(mockPrediction);
    expect(predictNextPayday).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ date: "2023-01-01", processedAt: "2023-01-01" }),
        expect.objectContaining({ date: "2023-01-15", processedAt: "2023-01-15" }),
        expect.objectContaining({ date: "2023-02-01", processedAt: "2023-02-01" }),
      ])
    );
  });

  it("should not generate prediction with insufficient history", () => {
    const { result } = renderHook(() =>
      usePaydayManager(
        [{ id: "1", date: "2023-01-01", amount: 2000, processedAt: "2023-01-01", source: "Work" }],
        mockSetActiveView
      )
    );

    expect(result.current.paydayPrediction).toBeNull();
  });

  it("should handle process paycheck navigation", () => {
    const { result } = renderHook(() => usePaydayManager(mockPaycheckHistory, mockSetActiveView));

    act(() => {
      result.current.handleProcessPaycheck();
    });

    expect(mockSetActiveView).toHaveBeenCalledWith("paycheck");
    expect(vi.mocked(logger.debug)).toHaveBeenCalledWith("Navigating to paycheck processor");
  });

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
});
