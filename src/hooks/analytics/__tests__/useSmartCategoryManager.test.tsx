import { renderHook, act } from "@testing-library/react";
import { useSmartCategoryManager } from "../useSmartCategoryManager";
import { vi } from "vitest";

// Mock dependencies
vi.mock("@/utils/common/logger", () => ({
  default: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("useSmartCategoryManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useSmartCategoryManager());

    expect(result.current.activeTab).toBe("suggestions");
    expect(result.current.showSettings).toBe(false);
    expect(result.current.dismissedSuggestions).toBeInstanceOf(Set);
    expect(result.current.dismissedSuggestions.size).toBe(0);
    expect(result.current.dateRange).toBe("6months");
    expect(result.current.analysisSettings).toEqual({
      minTransactionCount: 5,
      minAmount: 25,
      similarityThreshold: 0.7,
      unusedCategoryThreshold: 3,
      consolidationThreshold: 0.8,
    });
  });

  it("should initialize with custom date range", () => {
    const { result } = renderHook(() => useSmartCategoryManager("1year"));

    expect(result.current.dateRange).toBe("1year");
  });

  it("should handle tab change", () => {
    const { result } = renderHook(() => useSmartCategoryManager());

    act(() => {
      result.current.handleTabChange("patterns");
    });

    expect(result.current.activeTab).toBe("patterns");
  });

  it("should toggle settings visibility", () => {
    const { result } = renderHook(() => useSmartCategoryManager());

    expect(result.current.showSettings).toBe(false);

    act(() => {
      result.current.toggleSettings();
    });

    expect(result.current.showSettings).toBe(true);

    act(() => {
      result.current.toggleSettings();
    });

    expect(result.current.showSettings).toBe(false);
  });

  it("should handle date range change", () => {
    const { result } = renderHook(() => useSmartCategoryManager());

    act(() => {
      result.current.handleDateRangeChange("3months");
    });

    expect(result.current.dateRange).toBe("3months");
  });

  it("should dismiss suggestions", () => {
    const { result } = renderHook(() => useSmartCategoryManager());

    act(() => {
      result.current.handleDismissSuggestion("sugg1");
    });

    expect(result.current.dismissedSuggestions.has("sugg1")).toBe(true);

    act(() => {
      result.current.handleDismissSuggestion("sugg2");
    });

    expect(result.current.dismissedSuggestions.has("sugg1")).toBe(true);
    expect(result.current.dismissedSuggestions.has("sugg2")).toBe(true);
    expect(result.current.dismissedSuggestions.size).toBe(2);
  });

  it("should undismiss suggestions", () => {
    const { result } = renderHook(() => useSmartCategoryManager());

    act(() => {
      result.current.handleDismissSuggestion("sugg1");
      result.current.handleDismissSuggestion("sugg2");
    });

    expect(result.current.dismissedSuggestions.size).toBe(2);

    act(() => {
      result.current.handleUndismissSuggestion("sugg1");
    });

    expect(result.current.dismissedSuggestions.has("sugg1")).toBe(false);
    expect(result.current.dismissedSuggestions.has("sugg2")).toBe(true);
    expect(result.current.dismissedSuggestions.size).toBe(1);
  });

  it("should update analysis settings", () => {
    const { result } = renderHook(() => useSmartCategoryManager());

    act(() => {
      result.current.handleSettingsChange({ minTransactionCount: 10 });
    });

    expect(result.current.analysisSettings.minTransactionCount).toBe(10);
    expect(result.current.analysisSettings.minAmount).toBe(25); // unchanged

    act(() => {
      result.current.handleSettingsChange({
        minAmount: 50,
        similarityThreshold: 0.9,
      });
    });

    expect(result.current.analysisSettings.minTransactionCount).toBe(10);
    expect(result.current.analysisSettings.minAmount).toBe(50);
    expect(result.current.analysisSettings.similarityThreshold).toBe(0.9);
  });

  it("should apply suggestion and dismiss it", async () => {
    const { result } = renderHook(() => useSmartCategoryManager());
    const mockOnApplyToTransactions = vi.fn().mockResolvedValue(undefined);

    const suggestion = {
      id: "sugg1",
      category: "transaction",
      data: { amount: 100 },
    };

    let applied = false;
    await act(async () => {
      applied = await result.current.applySuggestion(
        suggestion,
        mockOnApplyToTransactions,
        undefined
      );
    });

    expect(applied).toBe(true);
    expect(mockOnApplyToTransactions).toHaveBeenCalledWith(suggestion);
    expect(result.current.dismissedSuggestions.has("sugg1")).toBe(true);
  });

  it("should apply bill suggestion correctly", async () => {
    const { result } = renderHook(() => useSmartCategoryManager());
    const mockOnApplyToBills = vi.fn().mockResolvedValue(undefined);

    const suggestion = {
      id: "sugg2",
      category: "bill",
      data: { amount: 200 },
    };

    let applied = false;
    await act(async () => {
      applied = await result.current.applySuggestion(
        suggestion,
        undefined,
        mockOnApplyToBills
      );
    });

    expect(applied).toBe(true);
    expect(mockOnApplyToBills).toHaveBeenCalledWith(suggestion);
    expect(result.current.dismissedSuggestions.has("sugg2")).toBe(true);
  });

  it("should handle apply suggestion errors gracefully", async () => {
    const { result } = renderHook(() => useSmartCategoryManager());
    const mockOnApplyToTransactions = vi.fn().mockRejectedValue(new Error("Apply failed"));

    const suggestion = {
      id: "sugg3",
      category: "transaction",
      data: { amount: 100 },
    };

    let applied = false;
    await act(async () => {
      applied = await result.current.applySuggestion(
        suggestion,
        mockOnApplyToTransactions,
        undefined
      );
    });

    expect(applied).toBe(false);
    expect(mockOnApplyToTransactions).toHaveBeenCalledWith(suggestion);
    // Should not dismiss on error
    expect(result.current.dismissedSuggestions.has("sugg3")).toBe(false);
  });
});
