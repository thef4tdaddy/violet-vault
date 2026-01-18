import { describe, it, expect, beforeEach, vi } from "vitest";
import { SyncMutex } from "../SyncMutex";

// Mock logger
vi.mock("../../../core/common/logger", () => ({
  default: {
    warn: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("SyncMutex", () => {
  let syncMutex: any;

  beforeEach(() => {
    syncMutex = new SyncMutex("TestSyncMutex");
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("should create sync mutex with default name", () => {
      const defaultMutex = new SyncMutex() as any;
      expect(defaultMutex.name).toBe("SyncMutex");
      expect(defaultMutex.syncMetrics).toEqual({
        operationsCompleted: 0,
        totalLockTime: 0,
        averageLockTime: 0,
        maxLockTime: 0,
        lastOperationTime: null,
      });
    });

    it("should create sync mutex with custom name", () => {
      expect(syncMutex.name).toBe("TestSyncMutex");
      expect(syncMutex.syncMetrics).toBeDefined();
    });
  });

  describe("metrics tracking", () => {
    it("should update metrics on release", async () => {
      await syncMutex.acquire("test-operation");

      // Wait a bit to ensure duration > 0
      await new Promise((resolve) => setTimeout(resolve, 10));

      syncMutex.release();

      expect(syncMutex.syncMetrics.operationsCompleted).toBe(1);
      expect(syncMutex.syncMetrics.totalLockTime).toBeGreaterThan(0);
      expect(syncMutex.syncMetrics.averageLockTime).toBeGreaterThan(0);
      expect(syncMutex.syncMetrics.maxLockTime).toBeGreaterThan(0);
      expect(syncMutex.syncMetrics.lastOperationTime).toBeTruthy();
    });

    it("should calculate average lock time correctly", async () => {
      // First operation
      await syncMutex.acquire("op1");
      await new Promise((resolve) => setTimeout(resolve, 20));
      syncMutex.release();

      // Second operation
      await syncMutex.acquire("op2");
      await new Promise((resolve) => setTimeout(resolve, 20));
      syncMutex.release();

      expect(syncMutex.syncMetrics.operationsCompleted).toBe(2);
      const expectedAvg = syncMutex.syncMetrics.totalLockTime / 2;
      expect(syncMutex.syncMetrics.averageLockTime).toBe(Math.round(expectedAvg));
    });

    it("should track max lock time correctly", async () => {
      // Short operation
      await syncMutex.acquire("short");
      await new Promise((resolve) => setTimeout(resolve, 10));
      syncMutex.release();
      const firstMax = syncMutex.syncMetrics.maxLockTime;

      // Longer operation
      await syncMutex.acquire("long");
      await new Promise((resolve) => setTimeout(resolve, 30));
      syncMutex.release();

      expect(syncMutex.syncMetrics.maxLockTime).toBeGreaterThan(firstMax);
    });
  });

  describe("slow operation warnings", () => {
    it("should warn on slow operations", async () => {
      const logger = await import("../../../core/common/logger");

      // Mock a slow operation by manually setting lock start time
      await syncMutex.acquire("slow-operation");
      syncMutex.lockStartTime = Date.now() - 35000; // 35 seconds ago

      syncMutex.release();

      expect(logger.default.warn).toHaveBeenCalledWith(
        expect.stringMatching(/⚠️ Slow sync operation detected: 3500\dms/),
        expect.objectContaining({
          operation: "slow-operation",
          metrics: expect.any(Object),
        })
      );
    });

    it("should not warn on normal operations", async () => {
      const logger = await import("../../../core/common/logger");

      await syncMutex.acquire("normal-operation");
      await new Promise((resolve) => setTimeout(resolve, 10));
      syncMutex.release();

      expect(logger.default.warn).not.toHaveBeenCalledWith(
        expect.stringContaining("Slow sync operation detected")
      );
    });
  });

  describe("sync status", () => {
    it("should return sync status with metrics", async () => {
      await syncMutex.acquire("status-test");
      await new Promise((resolve) => setTimeout(resolve, 10));
      syncMutex.release();

      const status = syncMutex.getSyncStatus();

      expect(status).toMatchObject({
        locked: false,
        currentOperation: null,
        queueSize: 0,
        metrics: {
          operationsCompleted: 1,
          totalLockTime: expect.any(Number),
          averageLockTime: expect.any(Number),
          maxLockTime: expect.any(Number),
          lastOperationTime: expect.any(String),
        },
      });
    });
  });

  describe("force release", () => {
    it("should force release and clear queue", async () => {
      const logger = await import("../../../core/common/logger");

      await syncMutex.acquire("first-operation");

      // Queue up operations
      const secondPromise = syncMutex.acquire("second");
      const thirdPromise = syncMutex.acquire("third");

      expect(syncMutex.queue.length).toBe(2);

      syncMutex.forceRelease();

      expect(logger.default.warn).toHaveBeenCalledWith(
        "⚠️ TestSyncMutex: Force releasing sync mutex",
        expect.objectContaining({
          currentOperation: "first-operation",
          metrics: expect.any(Object),
        })
      );

      expect(syncMutex.locked).toBe(false);
      expect(syncMutex.queue.length).toBe(0);

      // Queued operations should resolve
      await expect(secondPromise).resolves.toBeUndefined();
      await expect(thirdPromise).resolves.toBeUndefined();
    });
  });

  describe("integration with execute", () => {
    it("should track metrics when using execute wrapper", async () => {
      const mockFn = vi.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 15));
        return "result";
      });

      const result = await syncMutex.execute(mockFn, "execute-test");

      expect(result).toBe("result");
      expect(syncMutex.syncMetrics.operationsCompleted).toBe(1);
      expect(syncMutex.syncMetrics.totalLockTime).toBeGreaterThan(10);
    });

    it("should handle errors while tracking metrics", async () => {
      const mockFn = vi.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        throw new Error("test error");
      });

      await expect(syncMutex.execute(mockFn, "error-test")).rejects.toThrow("test error");

      expect(syncMutex.syncMetrics.operationsCompleted).toBe(1);
      expect(syncMutex.locked).toBe(false);
    });
  });
});
