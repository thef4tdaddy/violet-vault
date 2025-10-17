import { renderHook, act, waitFor } from "@testing-library/react";
import { useSyncHealthIndicator } from "../useSyncHealthIndicator";

// Mock dependencies
jest.mock("../../../utils/sync/masterSyncValidator", () => ({
  getQuickSyncStatus: jest.fn(),
}));

jest.mock("../../../services/cloudSyncService", () => ({
  cloudSyncService: {
    isRunning: false,
    activeSyncPromise: null,
  },
}));

jest.mock("../../../utils/common/logger", () => ({
  default: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

const { getQuickSyncStatus } = require("../../../utils/sync/masterSyncValidator");

describe("useSyncHealthIndicator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("should initialize with loading state", () => {
    const { result } = renderHook(() => useSyncHealthIndicator());

    expect(result.current.syncStatus).toEqual({
      isHealthy: null,
      status: "CHECKING",
      lastChecked: null,
      isLoading: true,
    });
    expect(result.current.showDetails).toBe(false);
    expect(result.current.isBackgroundSyncing).toBe(false);
    expect(result.current.isRecovering).toBe(false);
    expect(result.current.recoveryResult).toBe(null);
  });

  it("should check sync health on mount", async () => {
    const mockHealthData = {
      isHealthy: true,
      status: "HEALTHY",
      lastChecked: "2023-09-05T12:00:00.000Z",
    };

    getQuickSyncStatus.mockResolvedValue(mockHealthData);

    const { result } = renderHook(() => useSyncHealthIndicator());

    await waitFor(() => {
      expect(result.current.syncStatus.isLoading).toBe(false);
    });

    expect(result.current.syncStatus).toEqual({
      ...mockHealthData,
      isLoading: false,
    });
  });

  it("should handle sync health check errors", async () => {
    const mockError = new Error("Sync check failed");
    getQuickSyncStatus.mockRejectedValue(mockError);

    const { result } = renderHook(() => useSyncHealthIndicator());

    await waitFor(() => {
      expect(result.current.syncStatus.isLoading).toBe(false);
    });

    expect(result.current.syncStatus.status).toBe("ERROR");
    expect(result.current.syncStatus.isHealthy).toBe(false);
    expect(result.current.syncStatus.error).toBe("Sync check failed");
  });

  it("should toggle details visibility", () => {
    const { result } = renderHook(() => useSyncHealthIndicator());

    act(() => {
      result.current.setShowDetails(true);
    });

    expect(result.current.showDetails).toBe(true);

    act(() => {
      result.current.setShowDetails(false);
    });

    expect(result.current.showDetails).toBe(false);
  });

  it("should monitor background sync activity", () => {
    const cloudSyncService = require("../../../services/cloudSyncService").cloudSyncService;

    const { result } = renderHook(() => useSyncHealthIndicator());

    // Initially not syncing
    expect(result.current.isBackgroundSyncing).toBe(false);

    // Simulate sync starting
    act(() => {
      cloudSyncService.isRunning = true;
      cloudSyncService.activeSyncPromise = Promise.resolve();
    });

    // Fast-forward the interval
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.isBackgroundSyncing).toBe(true);

    // Simulate sync ending
    act(() => {
      cloudSyncService.isRunning = false;
      cloudSyncService.activeSyncPromise = null;
    });

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.isBackgroundSyncing).toBe(false);
  });

  it("should run full validation when available", async () => {
    const mockResults = {
      summary: {
        overallStatus: "ALL_SYSTEMS_GO",
        totalFailed: 0,
      },
    };

    // Mock window.runMasterSyncValidation
    global.window.runMasterSyncValidation = jest.fn().mockResolvedValue(mockResults);

    const { result } = renderHook(() => useSyncHealthIndicator());

    await act(async () => {
      await result.current.runFullValidation();
    });

    expect(global.window.runMasterSyncValidation).toHaveBeenCalled();
    expect(result.current.syncStatus.status).toBe("HEALTHY");
    expect(result.current.syncStatus.isHealthy).toBe(true);
    expect(result.current.syncStatus.failedTests).toBe(0);

    // Cleanup
    delete global.window.runMasterSyncValidation;
  });

  it("should handle cloud data reset", async () => {
    const mockResult = {
      success: true,
      message: "Cloud data reset successfully",
    };

    global.window.forceCloudDataReset = jest.fn().mockResolvedValue(mockResult);
    getQuickSyncStatus.mockResolvedValue({
      isHealthy: true,
      status: "HEALTHY",
    });

    const { result } = renderHook(() => useSyncHealthIndicator());

    await act(async () => {
      await result.current.resetCloudData();
    });

    expect(result.current.isRecovering).toBe(false);
    expect(result.current.recoveryResult).toEqual(mockResult);
    expect(global.window.forceCloudDataReset).toHaveBeenCalled();

    // Should refresh health status after reset
    await waitFor(() => {
      expect(getQuickSyncStatus).toHaveBeenCalledTimes(2); // Once on mount, once after reset
    });

    // Cleanup
    delete global.window.forceCloudDataReset;
  });

  it("should set up periodic health checks", () => {
    getQuickSyncStatus.mockResolvedValue({
      isHealthy: true,
      status: "HEALTHY",
    });

    renderHook(() => useSyncHealthIndicator());

    // Should check immediately on mount
    expect(getQuickSyncStatus).toHaveBeenCalledTimes(1);

    // Fast-forward 2 minutes (120000ms)
    act(() => {
      jest.advanceTimersByTime(120000);
    });

    // Should check again after interval
    expect(getQuickSyncStatus).toHaveBeenCalledTimes(2);
  });

  it("should provide dropdown ref for outside click handling", () => {
    const { result } = renderHook(() => useSyncHealthIndicator());

    expect(result.current.dropdownRef).toBeDefined();
    expect(result.current.dropdownRef.current).toBe(null); // Initially null
  });
});
