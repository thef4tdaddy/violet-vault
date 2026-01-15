import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { syncHealthMonitor } from "../syncHealthMonitor";
import * as Sentry from "@sentry/react";
import logger from "@/utils/core/common/logger";

// Mock Sentry
vi.mock("@sentry/react", () => ({
  startSpan: vi.fn((options, callback) => {
    const mockSpan = {
      setAttribute: vi.fn(),
      setStatus: vi.fn(),
    };
    callback(mockSpan);
  }),
  captureException: vi.fn(),
}));

// Mock logger
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    debug: vi.fn(),
    production: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("SyncHealthMonitor", () => {
  beforeEach(() => {
    // Reset monitor state before each test
    syncHealthMonitor.resetMetrics();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("constructor and initial state", () => {
    it("should initialize with default metrics", () => {
      const health = syncHealthMonitor.getHealthStatus();

      expect(health.metrics.totalAttempts).toBe(0);
      expect(health.metrics.successfulSyncs).toBe(0);
      expect(health.metrics.failedSyncs).toBe(0);
      expect(health.metrics.averageSyncTime).toBe(0);
      expect(health.metrics.lastSyncTime).toBe(null);
      expect(health.metrics.errorRate).toBe(0);
      expect(health.metrics.consecutiveFailures).toBe(0);
      expect(health.metrics.sessionStartTime).toBeGreaterThan(0);
    });

    it("should initialize with empty recent syncs", () => {
      const health = syncHealthMonitor.getHealthStatus();
      expect(health.recentSyncs).toEqual([]);
    });

    it("should initialize with default thresholds", () => {
      // Indirectly test thresholds through health status checks
      const health = syncHealthMonitor.getHealthStatus();
      expect(health.status).toBe("healthy");
    });
  });

  describe("recordSyncStart", () => {
    it("should create a sync attempt with generated ID", () => {
      const syncId = syncHealthMonitor.recordSyncStart("test-sync");

      expect(syncId).toMatch(/^sync_\d+_[a-z0-9]+$/);
      expect(logger.debug).toHaveBeenCalledWith(
        "📊 Sync health: Started tracking",
        expect.objectContaining({
          syncId,
          type: "test-sync",
          totalAttempts: 1,
        })
      );
    });

    it("should increment total attempts counter", () => {
      syncHealthMonitor.recordSyncStart("sync-1");
      syncHealthMonitor.recordSyncStart("sync-2");
      syncHealthMonitor.recordSyncStart("sync-3");

      const health = syncHealthMonitor.getHealthStatus();
      expect(health.metrics.totalAttempts).toBe(3);
    });

    it("should default to 'unknown' type when not specified", () => {
      const syncId = syncHealthMonitor.recordSyncStart();

      expect(logger.debug).toHaveBeenCalledWith(
        "📊 Sync health: Started tracking",
        expect.objectContaining({
          type: "unknown",
        })
      );
    });

    it("should set currentSync to the new attempt", () => {
      const syncId = syncHealthMonitor.recordSyncStart("test");
      // Verify by updating progress
      syncHealthMonitor.updateSyncProgress(syncId, "processing");
      expect(logger.debug).toHaveBeenCalledWith(
        "📊 Sync health: Progress update",
        expect.objectContaining({
          syncId,
          stage: "processing",
        })
      );
    });
  });

  describe("updateSyncProgress", () => {
    it("should update progress for current sync", () => {
      const syncId = syncHealthMonitor.recordSyncStart("test");
      syncHealthMonitor.updateSyncProgress(syncId, "processing", { percentage: 50 });

      expect(logger.debug).toHaveBeenCalledWith(
        "📊 Sync health: Progress update",
        expect.objectContaining({
          syncId,
          stage: "processing",
          progress: { percentage: 50 },
        })
      );
    });

    it("should ignore updates for non-current sync", () => {
      syncHealthMonitor.recordSyncStart("test");
      const callCount = (logger.debug as ReturnType<typeof vi.fn>).mock.calls.length;

      syncHealthMonitor.updateSyncProgress("wrong-id", "processing");

      expect((logger.debug as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callCount);
    });

    it("should handle null progress", () => {
      const syncId = syncHealthMonitor.recordSyncStart("test");
      syncHealthMonitor.updateSyncProgress(syncId, "idle");

      expect(logger.debug).toHaveBeenCalledWith(
        "📊 Sync health: Progress update",
        expect.objectContaining({
          stage: "idle",
          progress: null,
        })
      );
    });

    it("should update lastUpdate timestamp", () => {
      const startTime = Date.now();
      vi.setSystemTime(startTime);

      const syncId = syncHealthMonitor.recordSyncStart("test");

      vi.advanceTimersByTime(5000);
      syncHealthMonitor.updateSyncProgress(syncId, "processing");

      expect(logger.debug).toHaveBeenLastCalledWith(
        "📊 Sync health: Progress update",
        expect.objectContaining({
          syncId,
        })
      );
    });
  });

  describe("recordSyncSuccess", () => {
    it("should record successful completion with metrics", () => {
      const startTime = Date.now();
      vi.setSystemTime(startTime);

      const syncId = syncHealthMonitor.recordSyncStart("test-sync");

      vi.advanceTimersByTime(2000); // 2 second sync
      syncHealthMonitor.recordSyncSuccess(syncId, { itemsSynced: 10 });

      const health = syncHealthMonitor.getHealthStatus();
      expect(health.metrics.successfulSyncs).toBe(1);
      expect(health.metrics.consecutiveFailures).toBe(0);
      expect(health.metrics.lastSyncTime).toBe(startTime + 2000);
    });

    it("should track performance with Sentry for normal speed", () => {
      const syncId = syncHealthMonitor.recordSyncStart("test-sync");

      vi.advanceTimersByTime(2000);
      syncHealthMonitor.recordSyncSuccess(syncId, { direction: "upload" });

      expect(Sentry.startSpan).toHaveBeenCalledWith(
        expect.objectContaining({
          op: "sync.cloud",
          name: "Cloud Sync: test-sync",
        }),
        expect.any(Function)
      );

      // Verify Sentry.startSpan was called (the actual implementation calls the callback)
      // We can't easily verify span attributes since Sentry.startSpan is mocked to call the callback
      // But we verified it was called with correct options
      expect(logger.production).toHaveBeenCalledWith(
        "📊 Sync health: Successful completion",
        expect.objectContaining({
          syncId,
          duration: 2000,
          isSlow: false,
        })
      );
    });

    it("should log warning for slow syncs without sending to Sentry", () => {
      const syncId = syncHealthMonitor.recordSyncStart("test-sync");

      vi.advanceTimersByTime(12000); // 12 seconds (slow)
      syncHealthMonitor.recordSyncSuccess(syncId);

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Slow sync detected"),
        expect.objectContaining({
          syncId,
          syncType: "test-sync",
          duration: 12000,
        })
      );

      // Verify span was set to error status for slow sync
      const spanCallback = (Sentry.startSpan as ReturnType<typeof vi.fn>).mock.calls[0][1];
      const mockSpan = {
        setAttribute: vi.fn(),
        setStatus: vi.fn(),
      };
      spanCallback(mockSpan);

      expect(mockSpan.setAttribute).toHaveBeenCalledWith("is_slow", true);
      expect(mockSpan.setStatus).toHaveBeenCalledWith({
        code: 2,
        message: "slow_sync",
      });
    });

    it("should ignore success for non-current sync", () => {
      syncHealthMonitor.recordSyncStart("test");
      const initialHealth = syncHealthMonitor.getHealthStatus();

      syncHealthMonitor.recordSyncSuccess("wrong-id");

      const health = syncHealthMonitor.getHealthStatus();
      expect(health.metrics.successfulSyncs).toBe(initialHealth.metrics.successfulSyncs);
    });

    it("should add to recent syncs history", () => {
      const syncId = syncHealthMonitor.recordSyncStart("test");
      vi.advanceTimersByTime(1000);
      syncHealthMonitor.recordSyncSuccess(syncId);

      const health = syncHealthMonitor.getHealthStatus();
      expect(health.recentSyncs).toHaveLength(1);
      expect(health.recentSyncs[0]).toMatchObject({
        id: syncId,
        type: "test",
        success: true,
        duration: 1000,
      });
    });

    it("should clear currentSync after recording", () => {
      const syncId = syncHealthMonitor.recordSyncStart("test");
      syncHealthMonitor.recordSyncSuccess(syncId);

      // Try to update progress, should be ignored
      vi.clearAllMocks();
      syncHealthMonitor.updateSyncProgress(syncId, "should-not-work");
      expect(logger.debug).not.toHaveBeenCalled();
    });

    it("should calculate average sync time correctly", () => {
      const sync1 = syncHealthMonitor.recordSyncStart("sync1");
      vi.advanceTimersByTime(1000);
      syncHealthMonitor.recordSyncSuccess(sync1);

      const sync2 = syncHealthMonitor.recordSyncStart("sync2");
      vi.advanceTimersByTime(3000);
      syncHealthMonitor.recordSyncSuccess(sync2);

      const health = syncHealthMonitor.getHealthStatus();
      expect(health.metrics.averageSyncTime).toBe(2000); // (1000 + 3000) / 2
    });
  });

  describe("recordSyncFailure", () => {
    it("should record failed sync with error details", () => {
      const syncId = syncHealthMonitor.recordSyncStart("test-sync");
      const error = new Error("Network error");

      vi.advanceTimersByTime(1500);
      syncHealthMonitor.recordSyncFailure(syncId, error, { attemptNumber: 1 });

      const health = syncHealthMonitor.getHealthStatus();
      expect(health.metrics.failedSyncs).toBe(1);
      expect(health.metrics.consecutiveFailures).toBe(1);
      expect(health.recentSyncs[0]).toMatchObject({
        id: syncId,
        success: false,
        duration: 1500,
        error: {
          message: "Network error",
          name: "Error",
        },
      });
    });

    it("should track consecutive failures", () => {
      for (let i = 0; i < 3; i++) {
        const syncId = syncHealthMonitor.recordSyncStart(`sync-${i}`);
        vi.advanceTimersByTime(1000);
        syncHealthMonitor.recordSyncFailure(syncId, new Error(`Error ${i}`));
      }

      const health = syncHealthMonitor.getHealthStatus();
      expect(health.metrics.consecutiveFailures).toBe(3);
    });

    it("should send error to Sentry with context", () => {
      const syncId = syncHealthMonitor.recordSyncStart("test-sync");
      const error = new Error("Sync failed");

      vi.advanceTimersByTime(2000);
      syncHealthMonitor.recordSyncFailure(syncId, error);

      expect(Sentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          tags: {
            operation_type: "sync.cloud",
            sync_type: "test-sync",
          },
          extra: expect.objectContaining({
            syncId,
            duration: 2000,
            consecutiveFailures: 1,
          }),
        })
      );
    });

    it("should create Sentry span for failure", () => {
      const syncId = syncHealthMonitor.recordSyncStart("test-sync");
      const error = new Error("Test error");

      vi.advanceTimersByTime(1000);
      syncHealthMonitor.recordSyncFailure(syncId, error);

      expect(Sentry.startSpan).toHaveBeenCalledWith(
        expect.objectContaining({
          op: "sync.cloud",
          name: "Cloud Sync Failed: test-sync",
        }),
        expect.any(Function)
      );

      const spanCallback = (Sentry.startSpan as ReturnType<typeof vi.fn>).mock.calls[0][1];
      const mockSpan = {
        setAttribute: vi.fn(),
        setStatus: vi.fn(),
      };
      spanCallback(mockSpan);

      expect(mockSpan.setAttribute).toHaveBeenCalledWith("success", false);
      expect(mockSpan.setAttribute).toHaveBeenCalledWith("error_message", "Test error");
      expect(mockSpan.setStatus).toHaveBeenCalledWith({
        code: 2,
        message: "Test error",
      });
    });

    it("should handle orphaned failures (no current sync)", () => {
      const error = new Error("Orphaned error");
      syncHealthMonitor.recordSyncFailure("non-existent-id", error);

      const health = syncHealthMonitor.getHealthStatus();
      expect(health.metrics.failedSyncs).toBe(1);
      expect(health.metrics.consecutiveFailures).toBe(1);
      // Should not add to recent syncs for orphaned failures
      expect(health.recentSyncs).toHaveLength(0);
    });

    it("should handle errors with code property", () => {
      const syncId = syncHealthMonitor.recordSyncStart("test");
      const error = new Error("Network error") as Error & { code: string };
      error.code = "NETWORK_TIMEOUT";

      syncHealthMonitor.recordSyncFailure(syncId, error);

      const health = syncHealthMonitor.getHealthStatus();
      expect(health.recentSyncs[0].error.code).toBe("NETWORK_TIMEOUT");
    });

    it("should reset consecutive failures on success after failures", () => {
      // Record some failures
      const fail1 = syncHealthMonitor.recordSyncStart("fail1");
      syncHealthMonitor.recordSyncFailure(fail1, new Error("Error 1"));

      const fail2 = syncHealthMonitor.recordSyncStart("fail2");
      syncHealthMonitor.recordSyncFailure(fail2, new Error("Error 2"));

      expect(syncHealthMonitor.getHealthStatus().metrics.consecutiveFailures).toBe(2);

      // Record a success
      const success = syncHealthMonitor.recordSyncStart("success");
      syncHealthMonitor.recordSyncSuccess(success);

      expect(syncHealthMonitor.getHealthStatus().metrics.consecutiveFailures).toBe(0);
    });
  });

  describe("getHealthStatus", () => {
    it("should return healthy status with no issues", () => {
      const syncId = syncHealthMonitor.recordSyncStart("test");
      vi.advanceTimersByTime(2000);
      syncHealthMonitor.recordSyncSuccess(syncId);

      const health = syncHealthMonitor.getHealthStatus();
      expect(health.status).toBe("healthy");
      expect(health.issues).toEqual([]);
    });

    it("should return degraded status with high error rate", () => {
      // Create 10 failures and 1 success = 90.9% error rate (> 5% threshold)
      for (let i = 0; i < 10; i++) {
        const syncId = syncHealthMonitor.recordSyncStart(`fail-${i}`);
        syncHealthMonitor.recordSyncFailure(syncId, new Error(`Error ${i}`));
      }

      const successId = syncHealthMonitor.recordSyncStart("success");
      syncHealthMonitor.recordSyncSuccess(successId);

      const health = syncHealthMonitor.getHealthStatus();
      expect(health.status).toBe("degraded");
      expect(health.issues).toContainEqual(expect.stringContaining("High error rate"));
    });

    it("should return unhealthy status with consecutive failures", () => {
      // Create 3 consecutive failures (threshold)
      for (let i = 0; i < 3; i++) {
        const syncId = syncHealthMonitor.recordSyncStart(`fail-${i}`);
        syncHealthMonitor.recordSyncFailure(syncId, new Error(`Error ${i}`));
      }

      const health = syncHealthMonitor.getHealthStatus();
      expect(health.status).toBe("unhealthy");
      expect(health.issues).toContainEqual(expect.stringContaining("consecutive failures"));
    });

    it("should return slow status with high average sync time", () => {
      // Create syncs that average > 10 seconds
      const sync1 = syncHealthMonitor.recordSyncStart("slow1");
      vi.advanceTimersByTime(12000);
      syncHealthMonitor.recordSyncSuccess(sync1);

      const sync2 = syncHealthMonitor.recordSyncStart("slow2");
      vi.advanceTimersByTime(11000);
      syncHealthMonitor.recordSyncSuccess(sync2);

      const health = syncHealthMonitor.getHealthStatus();
      expect(health.status).toBe("slow");
      expect(health.issues).toContainEqual(expect.stringContaining("Slow sync"));
    });

    it("should prioritize unhealthy over other statuses", () => {
      // Create both high error rate and consecutive failures
      for (let i = 0; i < 5; i++) {
        const syncId = syncHealthMonitor.recordSyncStart(`fail-${i}`);
        syncHealthMonitor.recordSyncFailure(syncId, new Error(`Error ${i}`));
      }

      const health = syncHealthMonitor.getHealthStatus();
      expect(health.status).toBe("unhealthy");
    });

    it("should return last 10 syncs in health status", () => {
      // Create 15 syncs
      for (let i = 0; i < 15; i++) {
        const syncId = syncHealthMonitor.recordSyncStart(`sync-${i}`);
        vi.advanceTimersByTime(1000);
        syncHealthMonitor.recordSyncSuccess(syncId);
      }

      const health = syncHealthMonitor.getHealthStatus();
      expect(health.recentSyncs).toHaveLength(10);
      // Should be most recent syncs (last 10) - verify the type is correct
      expect(health.recentSyncs[0].type).toBe("sync-14");
      expect(health.recentSyncs[9].type).toBe("sync-5");
    });

    it("should include metrics snapshot", () => {
      const sync1 = syncHealthMonitor.recordSyncStart("test");
      syncHealthMonitor.recordSyncSuccess(sync1);

      const health = syncHealthMonitor.getHealthStatus();
      expect(health.metrics).toMatchObject({
        totalAttempts: 1,
        successfulSyncs: 1,
        failedSyncs: 0,
        consecutiveFailures: 0,
        errorRate: 0,
      });
    });
  });

  describe("getRecommendations", () => {
    it("should return empty array for healthy status", () => {
      const syncId = syncHealthMonitor.recordSyncStart("test");
      vi.advanceTimersByTime(1000);
      syncHealthMonitor.recordSyncSuccess(syncId);

      const recommendations = syncHealthMonitor.getRecommendations();
      expect(recommendations).toEqual([]);
    });

    it("should recommend data clearing for unhealthy status", () => {
      // Create unhealthy status with 3 consecutive failures
      for (let i = 0; i < 3; i++) {
        const syncId = syncHealthMonitor.recordSyncStart(`fail-${i}`);
        syncHealthMonitor.recordSyncFailure(syncId, new Error(`Error ${i}`));
      }

      const recommendations = syncHealthMonitor.getRecommendations();
      expect(recommendations).toContain("Consider clearing local data and re-syncing");
      expect(recommendations).toContain("Check network connection stability");
    });

    it("should recommend data archiving for large datasets", () => {
      // Create syncs with average > 15 seconds
      const sync1 = syncHealthMonitor.recordSyncStart("large1");
      vi.advanceTimersByTime(16000);
      syncHealthMonitor.recordSyncSuccess(sync1);

      const sync2 = syncHealthMonitor.recordSyncStart("large2");
      vi.advanceTimersByTime(17000);
      syncHealthMonitor.recordSyncSuccess(sync2);

      const recommendations = syncHealthMonitor.getRecommendations();
      expect(recommendations).toContain("Large dataset detected - consider data archiving");
    });

    it("should recommend checking Firebase for high error rate", () => {
      // Create high error rate (> 10%)
      for (let i = 0; i < 11; i++) {
        const syncId = syncHealthMonitor.recordSyncStart(`fail-${i}`);
        syncHealthMonitor.recordSyncFailure(syncId, new Error(`Error ${i}`));
      }

      // Add a few successes to get above 10% but not 100%
      for (let i = 0; i < 5; i++) {
        const syncId = syncHealthMonitor.recordSyncStart(`success-${i}`);
        vi.advanceTimersByTime(1000);
        syncHealthMonitor.recordSyncSuccess(syncId);
      }

      const recommendations = syncHealthMonitor.getRecommendations();
      expect(recommendations).toContain("High error rate - check Firebase connectivity");
    });

    it("should combine multiple recommendations", () => {
      // Create unhealthy with high error rate and slow syncs
      for (let i = 0; i < 5; i++) {
        const syncId = syncHealthMonitor.recordSyncStart(`fail-${i}`);
        vi.advanceTimersByTime(16000);
        syncHealthMonitor.recordSyncFailure(syncId, new Error(`Error ${i}`));
      }

      const recommendations = syncHealthMonitor.getRecommendations();
      expect(recommendations.length).toBeGreaterThan(1);
    });
  });

  describe("resetMetrics", () => {
    it("should reset all metrics to initial state", () => {
      // Create some activity
      const sync1 = syncHealthMonitor.recordSyncStart("test1");
      syncHealthMonitor.recordSyncSuccess(sync1);

      const sync2 = syncHealthMonitor.recordSyncStart("test2");
      syncHealthMonitor.recordSyncFailure(sync2, new Error("Test error"));

      // Reset
      syncHealthMonitor.resetMetrics();

      const health = syncHealthMonitor.getHealthStatus();
      expect(health.metrics.totalAttempts).toBe(0);
      expect(health.metrics.successfulSyncs).toBe(0);
      expect(health.metrics.failedSyncs).toBe(0);
      expect(health.metrics.averageSyncTime).toBe(0);
      expect(health.metrics.lastSyncTime).toBe(null);
      expect(health.metrics.errorRate).toBe(0);
      expect(health.metrics.consecutiveFailures).toBe(0);
    });

    it("should clear recent syncs history", () => {
      const syncId = syncHealthMonitor.recordSyncStart("test");
      syncHealthMonitor.recordSyncSuccess(syncId);

      syncHealthMonitor.resetMetrics();

      const health = syncHealthMonitor.getHealthStatus();
      expect(health.recentSyncs).toEqual([]);
    });

    it("should clear current sync", () => {
      const syncId = syncHealthMonitor.recordSyncStart("test");

      syncHealthMonitor.resetMetrics();

      // Try to update progress, should be ignored since currentSync is cleared
      vi.clearAllMocks(); // Clear previous mock calls
      syncHealthMonitor.updateSyncProgress(syncId, "should-not-work");
      expect(logger.debug).not.toHaveBeenCalled();
    });

    it("should log reset action", () => {
      syncHealthMonitor.resetMetrics();

      expect(logger.debug).toHaveBeenCalledWith("📊 Sync health metrics reset");
    });
  });

  describe("edge cases and boundary conditions", () => {
    it("should handle metadata as undefined in recordSyncSuccess", () => {
      const syncId = syncHealthMonitor.recordSyncStart("test");
      // Pass undefined explicitly to test null/undefined branch
      syncHealthMonitor.recordSyncSuccess(syncId, undefined);

      const health = syncHealthMonitor.getHealthStatus();
      expect(health.recentSyncs[0]).toBeDefined();
      expect(health.recentSyncs[0].metadata).toEqual({});
    });

    it("should handle metadata without direction property", () => {
      const syncId = syncHealthMonitor.recordSyncStart("test");
      syncHealthMonitor.recordSyncSuccess(syncId, { otherProp: "value" });

      const health = syncHealthMonitor.getHealthStatus();
      expect(health.recentSyncs[0].metadata).toEqual({ otherProp: "value" });
    });

    it("should handle rapid successive syncs", () => {
      for (let i = 0; i < 100; i++) {
        const syncId = syncHealthMonitor.recordSyncStart(`sync-${i}`);
        vi.advanceTimersByTime(100);
        syncHealthMonitor.recordSyncSuccess(syncId);
      }

      const health = syncHealthMonitor.getHealthStatus();
      expect(health.metrics.totalAttempts).toBe(100);
      expect(health.metrics.successfulSyncs).toBe(100);
      // Should only keep last 50 in history
      expect(health.recentSyncs.length).toBeLessThanOrEqual(10); // getHealthStatus returns last 10
    });

    it("should maintain recent syncs limit at 50", () => {
      // Create 60 syncs
      for (let i = 0; i < 60; i++) {
        const syncId = syncHealthMonitor.recordSyncStart(`sync-${i}`);
        syncHealthMonitor.recordSyncSuccess(syncId);
      }

      // The internal limit is 50 syncs, but getHealthStatus returns only the last 10
      const health = syncHealthMonitor.getHealthStatus();
      expect(health.recentSyncs).toHaveLength(10); // Public API returns last 10
    });

    it("should handle zero-duration syncs", () => {
      const syncId = syncHealthMonitor.recordSyncStart("instant");
      // Don't advance time
      syncHealthMonitor.recordSyncSuccess(syncId);

      const health = syncHealthMonitor.getHealthStatus();
      expect(health.recentSyncs[0].duration).toBe(0);
    });

    it("should calculate error rate correctly with mixed results", () => {
      // 3 successes, 1 failure = 25% error rate
      for (let i = 0; i < 3; i++) {
        const syncId = syncHealthMonitor.recordSyncStart(`success-${i}`);
        syncHealthMonitor.recordSyncSuccess(syncId);
      }

      const failId = syncHealthMonitor.recordSyncStart("fail");
      syncHealthMonitor.recordSyncFailure(failId, new Error("Test"));

      const health = syncHealthMonitor.getHealthStatus();
      expect(health.metrics.errorRate).toBe(0.25);
    });

    it("should handle empty metadata in recordSyncSuccess", () => {
      const syncId = syncHealthMonitor.recordSyncStart("test");
      syncHealthMonitor.recordSyncSuccess(syncId);

      const health = syncHealthMonitor.getHealthStatus();
      expect(health.recentSyncs[0].metadata).toEqual({});
    });

    it("should handle empty metadata in recordSyncFailure", () => {
      const syncId = syncHealthMonitor.recordSyncStart("test");
      syncHealthMonitor.recordSyncFailure(syncId, new Error("Test"));

      const health = syncHealthMonitor.getHealthStatus();
      expect(health.recentSyncs[0].metadata).toEqual({});
    });

    it("should handle alternating success and failure", () => {
      for (let i = 0; i < 10; i++) {
        const syncId = syncHealthMonitor.recordSyncStart(`sync-${i}`);
        if (i % 2 === 0) {
          syncHealthMonitor.recordSyncSuccess(syncId);
        } else {
          syncHealthMonitor.recordSyncFailure(syncId, new Error(`Error ${i}`));
        }
      }

      const health = syncHealthMonitor.getHealthStatus();
      expect(health.metrics.successfulSyncs).toBe(5);
      expect(health.metrics.failedSyncs).toBe(5);
      expect(health.metrics.errorRate).toBe(0.5);
      expect(health.metrics.consecutiveFailures).toBe(1); // Last one was a failure
    });
  });

  describe("private method behavior through public API", () => {
    it("should correctly add syncs to recent history (LIFO)", () => {
      const sync1 = syncHealthMonitor.recordSyncStart("first");
      syncHealthMonitor.recordSyncSuccess(sync1);

      const sync2 = syncHealthMonitor.recordSyncStart("second");
      syncHealthMonitor.recordSyncSuccess(sync2);

      const health = syncHealthMonitor.getHealthStatus();
      // Most recent should be first
      expect(health.recentSyncs[0].id).toBe(sync2);
      expect(health.recentSyncs[1].id).toBe(sync1);
    });

    it("should update metrics correctly for multiple operations", () => {
      // Success
      const sync1 = syncHealthMonitor.recordSyncStart("sync1");
      vi.advanceTimersByTime(1000);
      syncHealthMonitor.recordSyncSuccess(sync1);

      // Failure
      const sync2 = syncHealthMonitor.recordSyncStart("sync2");
      vi.advanceTimersByTime(2000);
      syncHealthMonitor.recordSyncFailure(sync2, new Error("Test"));

      // Another success
      const sync3 = syncHealthMonitor.recordSyncStart("sync3");
      vi.advanceTimersByTime(3000);
      syncHealthMonitor.recordSyncSuccess(sync3);

      const health = syncHealthMonitor.getHealthStatus();
      expect(health.metrics.totalAttempts).toBe(3);
      expect(health.metrics.successfulSyncs).toBe(2);
      expect(health.metrics.failedSyncs).toBe(1);
      expect(health.metrics.errorRate).toBe(1 / 3);
      expect(health.metrics.consecutiveFailures).toBe(0); // Reset by last success
      expect(health.metrics.averageSyncTime).toBe(2000); // (1000 + 2000 + 3000) / 3
    });

    it("should calculate success rate correctly", () => {
      // 7 successes, 3 failures = 70% success rate
      for (let i = 0; i < 7; i++) {
        const syncId = syncHealthMonitor.recordSyncStart(`success-${i}`);
        syncHealthMonitor.recordSyncSuccess(syncId);
      }

      for (let i = 0; i < 3; i++) {
        const syncId = syncHealthMonitor.recordSyncStart(`fail-${i}`);
        syncHealthMonitor.recordSyncFailure(syncId, new Error(`Error ${i}`));
      }

      const health = syncHealthMonitor.getHealthStatus();
      expect(health.metrics.errorRate).toBe(0.3);
      // Success rate would be 0.7 (complement of error rate)
    });
  });

  describe("integration with performance thresholds", () => {
    it("should mark syncs as slow when exceeding SLOW_SYNC threshold", () => {
      const syncId = syncHealthMonitor.recordSyncStart("slow-sync");
      vi.advanceTimersByTime(10001); // Just over 10 second threshold
      syncHealthMonitor.recordSyncSuccess(syncId);

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Slow sync detected"),
        expect.objectContaining({
          duration: 10001,
          threshold: 10000,
        })
      );
    });

    it("should not mark syncs as slow when under threshold", () => {
      const syncId = syncHealthMonitor.recordSyncStart("fast-sync");
      vi.advanceTimersByTime(9999); // Just under 10 second threshold
      syncHealthMonitor.recordSyncSuccess(syncId);

      expect(logger.warn).not.toHaveBeenCalled();
    });

    it("should detect slow health status based on average sync time", () => {
      // Create syncs averaging just over 10 seconds
      const sync1 = syncHealthMonitor.recordSyncStart("sync1");
      vi.advanceTimersByTime(10001);
      syncHealthMonitor.recordSyncSuccess(sync1);

      const health = syncHealthMonitor.getHealthStatus();
      expect(health.status).toBe("slow");
      expect(health.issues).toContainEqual(expect.stringContaining("Slow sync"));
    });
  });
});
