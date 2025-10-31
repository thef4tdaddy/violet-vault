import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useSyncHealthMonitor } from "../useSyncHealthMonitor";

// Mock syncHealthMonitor
vi.mock("@/utils/sync/syncHealthMonitor", () => ({
  syncHealthMonitor: {
    getHealthStatus: vi.fn(),
  },
}));

describe("useSyncHealthMonitor", () => {
  let mockGetHealthStatus: ReturnType<typeof vi.fn>;

  const mockHealthData = {
    status: "healthy" as const,
    issues: [],
    metrics: {
      totalAttempts: 10,
      successfulSyncs: 9,
      failedSyncs: 1,
      averageSyncTime: 1500,
      lastSyncTime: Date.now(),
      errorRate: 0.1,
      consecutiveFailures: 0,
      sessionStartTime: Date.now() - 3600000,
    },
    recentSyncs: [
      {
        id: "sync-1",
        type: "upload",
        startTime: Date.now() - 60000,
        stage: "completed",
        endTime: Date.now() - 59000,
        duration: 1000,
        success: true,
      },
    ],
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    const syncHealthMonitor = await import("@/utils/sync/syncHealthMonitor");
    mockGetHealthStatus = syncHealthMonitor.syncHealthMonitor.getHealthStatus as ReturnType<
      typeof vi.fn
    >;
    mockGetHealthStatus.mockReturnValue(mockHealthData);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with health data", () => {
    const { result } = renderHook(() => useSyncHealthMonitor());

    expect(result.current.healthData).toEqual(mockHealthData);
    expect(mockGetHealthStatus).toHaveBeenCalledTimes(1);
  });

  it("should provide refreshHealthData function", () => {
    const { result } = renderHook(() => useSyncHealthMonitor());

    expect(typeof result.current.refreshHealthData).toBe("function");
  });

  it("should refresh health data when refreshHealthData is called", () => {
    const { result } = renderHook(() => useSyncHealthMonitor());

    const updatedHealthData = {
      ...mockHealthData,
      status: "degraded" as const,
      issues: ["High error rate"],
    };

    mockGetHealthStatus.mockReturnValue(updatedHealthData);

    act(() => {
      result.current.refreshHealthData();
    });

    expect(result.current.healthData).toEqual(updatedHealthData);
    expect(mockGetHealthStatus).toHaveBeenCalledTimes(2); // Initial + manual refresh
  });

  it("should not auto-refresh when autoRefresh is false", () => {
    renderHook(() => useSyncHealthMonitor(false));

    expect(mockGetHealthStatus).toHaveBeenCalledTimes(1); // Only initial call

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(mockGetHealthStatus).toHaveBeenCalledTimes(1); // Still only initial call
  });

  it("should auto-refresh when autoRefresh is true", () => {
    renderHook(() => useSyncHealthMonitor(true, 5000));

    expect(mockGetHealthStatus).toHaveBeenCalledTimes(1); // Initial call

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(mockGetHealthStatus).toHaveBeenCalledTimes(2); // Initial + first refresh

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(mockGetHealthStatus).toHaveBeenCalledTimes(3); // Initial + two refreshes
  });

  it("should use custom refresh interval", () => {
    renderHook(() => useSyncHealthMonitor(true, 3000));

    expect(mockGetHealthStatus).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(mockGetHealthStatus).toHaveBeenCalledTimes(2);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(mockGetHealthStatus).toHaveBeenCalledTimes(3);
  });

  it("should clear interval on unmount", () => {
    const { unmount } = renderHook(() => useSyncHealthMonitor(true, 5000));

    const clearIntervalSpy = vi.spyOn(global, "clearInterval");

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it("should restart interval when autoRefresh changes", () => {
    const { rerender } = renderHook(
      ({ autoRefresh, interval }) => useSyncHealthMonitor(autoRefresh, interval),
      {
        initialProps: { autoRefresh: false, interval: 5000 },
      }
    );

    expect(mockGetHealthStatus).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(mockGetHealthStatus).toHaveBeenCalledTimes(1); // No auto-refresh

    // Enable auto-refresh
    rerender({ autoRefresh: true, interval: 5000 });

    expect(mockGetHealthStatus).toHaveBeenCalledTimes(2); // Re-initialization

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(mockGetHealthStatus).toHaveBeenCalledTimes(3); // Auto-refresh working
  });

  it("should restart interval when interval changes", () => {
    const { rerender } = renderHook(({ interval }) => useSyncHealthMonitor(true, interval), {
      initialProps: { interval: 5000 },
    });

    expect(mockGetHealthStatus).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(mockGetHealthStatus).toHaveBeenCalledTimes(2);

    // Change interval
    rerender({ interval: 2000 });

    expect(mockGetHealthStatus).toHaveBeenCalledTimes(3); // Re-initialization

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(mockGetHealthStatus).toHaveBeenCalledTimes(4); // New interval working
  });

  it("should handle unhealthy status", () => {
    const unhealthyData = {
      ...mockHealthData,
      status: "unhealthy" as const,
      issues: ["Multiple sync failures", "High error rate", "Consecutive failures"],
      metrics: {
        ...mockHealthData.metrics,
        errorRate: 0.8,
        consecutiveFailures: 5,
      },
    };

    mockGetHealthStatus.mockReturnValue(unhealthyData);

    const { result } = renderHook(() => useSyncHealthMonitor());

    expect(result.current.healthData?.status).toBe("unhealthy");
    expect(result.current.healthData?.issues.length).toBe(3);
    expect(result.current.healthData?.metrics.consecutiveFailures).toBe(5);
  });

  it("should handle empty recent syncs", () => {
    const emptyData = {
      ...mockHealthData,
      recentSyncs: [],
    };

    mockGetHealthStatus.mockReturnValue(emptyData);

    const { result } = renderHook(() => useSyncHealthMonitor());

    expect(result.current.healthData?.recentSyncs).toEqual([]);
  });

  it("should handle null health data from monitor", () => {
    mockGetHealthStatus.mockReturnValue(null);

    const { result } = renderHook(() => useSyncHealthMonitor());

    expect(result.current.healthData).toBeNull();
  });
});
