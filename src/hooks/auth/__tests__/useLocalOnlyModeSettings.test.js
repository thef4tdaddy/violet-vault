import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useLocalOnlyModeSettings } from "../useLocalOnlyModeSettings";

// Mock the dependencies
vi.mock("../../common/useLocalOnlyMode", () => ({
  useLocalOnlyMode: vi.fn(() => ({
    loading: false,
    error: null,
    clearError: vi.fn(),
    exitLocalOnlyModeAndClear: vi.fn(),
    exportData: vi.fn(),
    importData: vi.fn(),
    getStats: vi.fn().mockResolvedValue({
      totalEnvelopes: 5,
      totalTransactions: 25,
      storageSizeFormatted: "1.2 MB",
      totalBills: 3,
    }),
    clearAllData: vi.fn(),
    validateImportFile: vi.fn().mockReturnValue({ valid: true }),
  })),
}));

vi.mock("../../../stores/ui/toastStore", () => ({
  globalToast: {
    showError: vi.fn(),
    showSuccess: vi.fn(),
  },
}));

vi.mock("../../../utils/common/logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

describe("useLocalOnlyModeSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with correct default state", () => {
    const { result } = renderHook(() => useLocalOnlyModeSettings());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.stats).toBe(null);
    expect(result.current.importFile).toBe(null);
    expect(result.current.fileInputRef).toBeDefined();
    expect(typeof result.current.loadStats).toBe("function");
    expect(typeof result.current.handleExportData).toBe("function");
    expect(typeof result.current.handleImportData).toBe("function");
    expect(typeof result.current.handleModeSwitch).toBe("function");
    expect(typeof result.current.handleClearAllData).toBe("function");
    expect(typeof result.current.resetStates).toBe("function");
  });

  it("should load stats successfully", async () => {
    const { result } = renderHook(() => useLocalOnlyModeSettings());

    await act(async () => {
      await result.current.loadStats();
    });

    expect(result.current.stats).toEqual({
      totalEnvelopes: 5,
      totalTransactions: 25,
      storageSizeFormatted: "1.2 MB",
      totalBills: 3,
    });
  });

  it("should reset states correctly", () => {
    const { result } = renderHook(() => useLocalOnlyModeSettings());

    act(() => {
      result.current.resetStates();
    });

    expect(result.current.stats).toBe(null);
    expect(result.current.importFile).toBe(null);
  });

  it("should provide all required functions and state", () => {
    const { result } = renderHook(() => useLocalOnlyModeSettings());

    // Verify all expected properties are present
    const expectedProperties = [
      "loading",
      "error", 
      "stats",
      "importFile",
      "fileInputRef",
      "loadStats",
      "handleExportData",
      "handleImportData",
      "handleModeSwitch",
      "handleClearAllData",
      "resetStates",
      "clearError",
    ];

    expectedProperties.forEach((prop) => {
      expect(result.current).toHaveProperty(prop);
    });
  });
});