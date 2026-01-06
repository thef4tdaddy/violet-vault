import { renderHook, act } from "@testing-library/react";
import { useSmartCategoryManager } from "../useSmartCategoryManager";
import { vi } from "vitest";

// Mock logger
vi.mock("@/utils/common/logger", () => ({
  default: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("useSmartCategoryManager", () => {
  it("should initialize with default state", () => {
    const { result } = renderHook(() => useSmartCategoryManager());

    expect(result.current.activeTab).toBe("suggestions");
    expect(result.current.showSettings).toBe(false);
    expect(result.current.dismissedSuggestions).toEqual(new Set());
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
    const { result } = renderHook(() => useSmartCategoryManager("3months"));

    expect(result.current.dateRange).toBe("3months");
  });

  it("should handle tab changes", () => {
    const { result } = renderHook(() => useSmartCategoryManager());

    act(() => {
      result.current.handleTabChange("analysis");
    });

    expect(result.current.activeTab).toBe("analysis");

    act(() => {
      result.current.handleTabChange("settings");
    });

    expect(result.current.activeTab).toBe("settings");
  });

  it("should handle date range changes", () => {
    const { result } = renderHook(() => useSmartCategoryManager());

    act(() => {
      result.current.handleDateRangeChange("12months");
    });

    expect(result.current.dateRange).toBe("12months");
  });

  it("should dismiss suggestions", () => {
    const { result } = renderHook(() => useSmartCategoryManager());

    act(() => {
      result.current.handleDismissSuggestion("suggestion-1");
    });

    expect(result.current.dismissedSuggestions.has("suggestion-1")).toBe(true);

    act(() => {
      result.current.handleDismissSuggestion("suggestion-2");
    });

    expect(result.current.dismissedSuggestions.has("suggestion-2")).toBe(true);
    expect(result.current.dismissedSuggestions.size).toBe(2);
  });

  it("should undismiss suggestions", () => {
    const { result } = renderHook(() => useSmartCategoryManager());

    act(() => {
      result.current.handleDismissSuggestion("suggestion-1");
      result.current.handleDismissSuggestion("suggestion-2");
    });

    expect(result.current.dismissedSuggestions.size).toBe(2);

    act(() => {
      result.current.handleUndismissSuggestion("suggestion-1");
    });

    expect(result.current.dismissedSuggestions.has("suggestion-1")).toBe(false);
    expect(result.current.dismissedSuggestions.has("suggestion-2")).toBe(true);
    expect(result.current.dismissedSuggestions.size).toBe(1);
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

  it("should update analysis settings", () => {
    const { result } = renderHook(() => useSmartCategoryManager());

    act(() => {
      result.current.handleSettingsChange({
        minTransactionCount: 10,
        minAmount: 50,
      });
    });

    expect(result.current.analysisSettings).toEqual({
      minTransactionCount: 10,
      minAmount: 50,
      similarityThreshold: 0.7,
      unusedCategoryThreshold: 3,
      consolidationThreshold: 0.8,
    });
  });

  it("should apply transaction suggestions", async () => {
    const { result } = renderHook(() => useSmartCategoryManager());
    const mockOnApplyToTransactions = vi.fn().mockResolvedValue(undefined);

    const mockSuggestion = {
      id: "suggestion-1",
      category: "transaction" as const,
      description: "Test suggestion",
    };

    await act(async () => {
      const success = await result.current.applySuggestion(
        mockSuggestion,
        mockOnApplyToTransactions
      );
      expect(success).toBe(true);
    });

    expect(mockOnApplyToTransactions).toHaveBeenCalledWith(mockSuggestion);
    expect(result.current.dismissedSuggestions.has("suggestion-1")).toBe(true);
  });

  it("should apply bill suggestions", async () => {
    const { result } = renderHook(() => useSmartCategoryManager());
    const mockOnApplyToBills = vi.fn().mockResolvedValue(undefined);

    const mockSuggestion = {
      id: "suggestion-2",
      category: "bill" as const,
      description: "Test bill suggestion",
    };

    await act(async () => {
      const success = await result.current.applySuggestion(
        mockSuggestion,
        undefined,
        mockOnApplyToBills
      );
      expect(success).toBe(true);
    });

    expect(mockOnApplyToBills).toHaveBeenCalledWith(mockSuggestion);
    expect(result.current.dismissedSuggestions.has("suggestion-2")).toBe(true);
  });

  it("should handle apply suggestion errors gracefully", async () => {
    const { result } = renderHook(() => useSmartCategoryManager());
    const mockOnApplyToTransactions = vi.fn().mockRejectedValue(new Error("Apply failed"));

    const mockSuggestion = {
      id: "suggestion-3",
      category: "transaction" as const,
      description: "Test suggestion",
    };

    await act(async () => {
      const success = await result.current.applySuggestion(
        mockSuggestion,
        mockOnApplyToTransactions
      );
      expect(success).toBe(false);
    });

    expect(mockOnApplyToTransactions).toHaveBeenCalledWith(mockSuggestion);
    // Suggestion should not be dismissed on error
    expect(result.current.dismissedSuggestions.has("suggestion-3")).toBe(false);
  });

  it("should maintain stable function references", () => {
    const { result, rerender } = renderHook(() => useSmartCategoryManager());

    const firstHandleTabChange = result.current.handleTabChange;
    const firstToggleSettings = result.current.toggleSettings;
    const firstApplySuggestion = result.current.applySuggestion;

    rerender();

    expect(result.current.handleTabChange).toBe(firstHandleTabChange);
    expect(result.current.toggleSettings).toBe(firstToggleSettings);
    expect(result.current.applySuggestion).toBe(firstApplySuggestion);
  });
});
