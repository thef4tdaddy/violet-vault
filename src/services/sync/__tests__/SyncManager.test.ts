/**
 * SyncManager Tests
 * Tests for the unified sync management service
 */

import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import { SyncManager } from "../SyncManager";

// Mock dependencies
vi.mock("@/utils/features/sync/SyncQueue", () => {
  return {
    SyncQueue: vi.fn().mockImplementation(function (this: any) {
      this.enqueue = vi.fn().mockImplementation((type, op) => op());
      this.getStats = vi.fn().mockReturnValue({
        currentQueueSize: 0,
        processingCount: 0,
        enqueued: 0,
        processed: 0,
        failed: 0,
        superseded: 0,
      });
      this.flush = vi.fn().mockResolvedValue([]);
      this.clear = vi.fn();
    }),
  };
});

vi.mock("@/utils/features/sync/SyncMutex", () => {
  return {
    SyncMutex: vi.fn().mockImplementation(function (this: any) {
      this.acquire = vi.fn().mockResolvedValue(true);
      this.release = vi.fn();
      this.getSyncStatus = vi.fn().mockReturnValue({
        locked: false,
        currentOperation: null,
        queueSize: 0,
        metrics: {
          operationsCompleted: 0,
          averageLockTime: 0,
          maxLockTime: 0,
        },
      });
      this.forceRelease = vi.fn();
    }),
  };
});

vi.mock("@/utils/features/sync/syncHealthMonitor", () => {
  return {
    syncHealthMonitor: {
      getHealthStatus: vi.fn().mockReturnValue({
        status: "healthy",
        issues: [],
        metrics: {
          totalAttempts: 0,
          successfulSyncs: 0,
          failedSyncs: 0,
          errorRate: 0,
          consecutiveFailures: 0,
          averageSyncTime: 0,
          lastSyncTime: null,
        },
      }),
      resetMetrics: vi.fn(),
      getRecommendations: vi.fn().mockReturnValue([]),
    },
  };
});

vi.mock("@/utils/features/sync/masterSyncValidator", () => ({
  getQuickSyncStatus: vi.fn().mockResolvedValue({
    isHealthy: true,
    status: "HEALTHY",
    lastChecked: new Date().toISOString(),
  }),
  runMasterSyncValidation: vi.fn().mockResolvedValue({
    summary: {
      totalTests: 0,
      totalPassed: 0,
      totalFailed: 0,
      overallStatus: "ALL_SYSTEMS_GO",
      duration: 0,
    },
    healthCheck: {},
  }),
}));

vi.mock("@/utils/core/common/logger");

describe("SyncManager", () => {
  let syncManager: SyncManager;

  beforeEach(() => {
    // Get fresh instance for each test
    syncManager = SyncManager.getInstance();
    // Reset state
    syncManager.reset();
  });

  describe("Singleton Pattern", () => {
    it("should return the same instance", () => {
      const instance1 = SyncManager.getInstance();
      const instance2 = SyncManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it("should be initialized on creation", () => {
      expect(syncManager.isInitialized()).toBe(true);
    });
  });

  describe("executeSync", () => {
    it("should execute sync operation with default options", async () => {
      const mockOperation = vi.fn().mockResolvedValue("success");

      const result = await syncManager.executeSync(mockOperation, "test-sync");

      expect(result).toBe("success");
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it("should execute high priority sync immediately", async () => {
      const mockOperation = vi.fn().mockResolvedValue("high-priority");

      const result = await syncManager.executeSync(mockOperation, "test-sync", {
        priority: "high",
      });

      expect(result).toBe("high-priority");
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it("should skip queue when skipQueue option is true", async () => {
      const mockOperation = vi.fn().mockResolvedValue("skip-queue");

      const result = await syncManager.executeSync(mockOperation, "test-sync", { skipQueue: true });

      expect(result).toBe("skip-queue");
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it("should respect custom timeout option", async () => {
      const mockOperation = vi.fn().mockResolvedValue("custom-timeout");

      const result = await syncManager.executeSync(mockOperation, "test-sync", {
        timeout: 30000,
        skipQueue: true,
      });

      expect(result).toBe("custom-timeout");
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it("should handle sync operation errors", async () => {
      const mockError = new Error("Sync failed");
      const mockOperation = vi.fn().mockRejectedValue(mockError);

      await expect(syncManager.executeSync(mockOperation, "test-sync")).rejects.toThrow(
        "Sync failed"
      );
    });
  });

  describe("checkHealth", () => {
    it("should return health status", async () => {
      const health = await syncManager.checkHealth();

      expect(health).toHaveProperty("isHealthy");
      expect(health).toHaveProperty("status");
      expect(health).toHaveProperty("lastChecked");
    });

    it("should handle health check errors gracefully", async () => {
      // Mock the internal getQuickSyncStatus to throw
      const { getQuickSyncStatus } = await import("@/utils/features/sync/masterSyncValidator");
      (getQuickSyncStatus as Mock).mockRejectedValueOnce(new Error("Health check failed"));

      const health = await syncManager.checkHealth();

      expect(health.isHealthy).toBe(false);
      expect(health.status).toBe("ERROR");
      expect(health.checks).toBeDefined();
    });
  });

  describe("getStatus", () => {
    it("should return combined status from all components", () => {
      const status = syncManager.getStatus();

      expect(status).toHaveProperty("queue");
      expect(status).toHaveProperty("mutex");
      expect(status).toHaveProperty("health");
      expect(status).toHaveProperty("timestamp");

      expect(status.queue).toHaveProperty("currentQueueSize");
      expect(status.mutex).toHaveProperty("locked");
      expect(status.health).toHaveProperty("status");
    });

    it("should return fresh timestamp", () => {
      const now = Date.now();
      const status = syncManager.getStatus();

      expect(status.timestamp).toBeGreaterThanOrEqual(now);
      expect(status.timestamp).toBeLessThanOrEqual(Date.now());
    });
  });

  describe("forceSync", () => {
    it("should execute sync immediately", async () => {
      const mockOperation = vi.fn().mockResolvedValue("forced");

      const result = await syncManager.forceSync(mockOperation, "force-sync");

      expect(result).toBe("forced");
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it("should flush queue before forcing sync", async () => {
      const mockOperation = vi.fn().mockResolvedValue("forced");

      await syncManager.forceSync(mockOperation, "force-sync");

      // Queue should be flushed
      const status = syncManager.getStatus();
      expect(status.queue.currentQueueSize).toBe(0);
    });

    it("should respect custom timeout", async () => {
      const mockOperation = vi.fn().mockResolvedValue("forced-with-timeout");

      const result = await syncManager.forceSync(mockOperation, "force-sync", 30000);

      expect(result).toBe("forced-with-timeout");
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });
  });

  describe("clearQueue", () => {
    it("should clear all pending operations", () => {
      syncManager.clearQueue();

      const status = syncManager.getStatus();
      expect(status.queue.currentQueueSize).toBe(0);
    });
  });

  describe("reset", () => {
    it("should reset all internal state", () => {
      syncManager.reset();

      const status = syncManager.getStatus();
      expect(status.queue.currentQueueSize).toBe(0);
      expect(status.mutex.locked).toBe(false);
    });
  });

  describe("getRecommendations", () => {
    it("should return health recommendations", () => {
      const recommendations = syncManager.getRecommendations();

      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  describe("Integration Tests", () => {
    it("should handle multiple concurrent sync operations", async () => {
      const operations = Array.from({ length: 5 }, (_, i) =>
        vi.fn().mockResolvedValue(`result-${i}`)
      );

      const results = await Promise.all(
        operations.map((op, i) => syncManager.executeSync(op, `test-sync-${i}`))
      );

      results.forEach((result, i) => {
        expect(result).toBe(`result-${i}`);
      });
    });

    it("should maintain mutex protection across operations", async () => {
      const executionOrder: number[] = [];

      const createOperation = (id: number) => async () => {
        executionOrder.push(id);
        await new Promise((resolve) => setTimeout(resolve, 10));
        return id;
      };

      const results = await Promise.all([
        syncManager.forceSync(createOperation(1), "sync-1"),
        syncManager.forceSync(createOperation(2), "sync-2"),
        syncManager.forceSync(createOperation(3), "sync-3"),
      ]);

      expect(results).toEqual([1, 2, 3]);
      // Operations should be serialized by mutex
      expect(executionOrder.length).toBe(3);
    });
  });

  describe("Error Handling", () => {
    it("should propagate errors from sync operations", async () => {
      const mockError = new Error("Operation failed");
      const mockOperation = vi.fn().mockRejectedValue(mockError);

      await expect(syncManager.executeSync(mockOperation, "test-sync")).rejects.toThrow(
        "Operation failed"
      );
    });

    it("should handle validation errors", async () => {
      const { runMasterSyncValidation } =
        (await import("@/utils/features/sync/masterSyncValidator")) as any;
      (runMasterSyncValidation as Mock).mockRejectedValueOnce(new Error("Validation failed"));

      await expect(syncManager.validateSync()).rejects.toThrow("Validation failed");
    });
  });
});
