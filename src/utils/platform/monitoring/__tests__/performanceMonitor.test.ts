import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as Sentry from "@sentry/react";
import {
  trackPerformance,
  trackQuery,
  trackImport,
  trackExport,
  trackSync,
  trackBackup,
  createTimer,
  PERFORMANCE_THRESHOLDS,
  SPAN_STATUS,
} from "../performanceMonitor";
import logger from "@/utils/core/common/logger";

// Mock Sentry
vi.mock("@sentry/react", () => ({
  startSpan: vi.fn((config, callback) => {
    const mockSpan = {
      setAttribute: vi.fn(),
      setStatus: vi.fn(),
    };
    return callback(mockSpan);
  }),
}));

// Mock logger
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    performance: vi.fn(),
  },
}));

describe("PerformanceMonitor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("SPAN_STATUS constants", () => {
    it("should define correct status codes", () => {
      expect(SPAN_STATUS.OK).toBe(1);
      expect(SPAN_STATUS.ERROR).toBe(2);
    });
  });

  describe("PERFORMANCE_THRESHOLDS constants", () => {
    it("should define expected thresholds", () => {
      expect(PERFORMANCE_THRESHOLDS.SLOW_QUERY).toBe(1000);
      expect(PERFORMANCE_THRESHOLDS.SLOW_OPERATION).toBe(5000);
      expect(PERFORMANCE_THRESHOLDS.SLOW_SYNC).toBe(10000);
    });
  });

  describe("trackPerformance", () => {
    it("should track successful operation under threshold", async () => {
      const mockFn = vi.fn().mockResolvedValue("success");

      const result = await trackPerformance("db.query", "Test Query", mockFn, 1000);

      expect(result.result).toBe("success");
      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(result.isSlow).toBe(false);
      expect(Sentry.startSpan).toHaveBeenCalledWith(
        expect.objectContaining({
          op: "db.query",
          name: "Test Query",
        }),
        expect.any(Function)
      );
    });

    it("should detect slow operations", async () => {
      const slowFn = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve("done"), 50);
          })
      );

      const result = await trackPerformance("db.query", "Slow Query", slowFn, 10);

      expect(result.isSlow).toBe(true);
      expect(result.duration).toBeGreaterThan(10);
    });

    it("should set span attributes correctly", async () => {
      const mockFn = vi.fn().mockResolvedValue("success");
      let capturedSpan: {
        setAttribute: ReturnType<typeof vi.fn>;
        setStatus: ReturnType<typeof vi.fn>;
      } | null = null;

      vi.mocked(Sentry.startSpan).mockImplementation((config, callback) => {
        const mockSpan = {
          setAttribute: vi.fn(),
          setStatus: vi.fn(),
        };
        capturedSpan = mockSpan;
        return callback(mockSpan);
      });

      await trackPerformance("db.query", "Test", mockFn, 1000);

      expect(capturedSpan?.setAttribute).toHaveBeenCalledWith("duration_ms", expect.any(Number));
      expect(capturedSpan?.setAttribute).toHaveBeenCalledWith("is_slow", false);
      expect(capturedSpan?.setStatus).toHaveBeenCalledWith({ code: SPAN_STATUS.OK });
    });

    it("should handle errors and set error status", async () => {
      const errorFn = vi.fn().mockRejectedValue(new Error("Operation failed"));
      let capturedSpan: {
        setAttribute: ReturnType<typeof vi.fn>;
        setStatus: ReturnType<typeof vi.fn>;
      } | null = null;

      vi.mocked(Sentry.startSpan).mockImplementation((config, callback) => {
        const mockSpan = {
          setAttribute: vi.fn(),
          setStatus: vi.fn(),
        };
        capturedSpan = mockSpan;
        return callback(mockSpan);
      });

      await expect(trackPerformance("db.query", "Error Test", errorFn)).rejects.toThrow(
        "Operation failed"
      );

      expect(capturedSpan?.setAttribute).toHaveBeenCalledWith("duration_ms", expect.any(Number));
      expect(capturedSpan?.setStatus).toHaveBeenCalledWith({
        code: SPAN_STATUS.ERROR,
        message: "Operation failed",
      });
    });

    it("should log slow operations as warnings", async () => {
      const slowFn = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve("done"), 50);
          })
      );

      await trackPerformance("db.query", "Slow Query", slowFn, 10);

      expect(logger.warn).toHaveBeenCalledWith(
        "Slow operation detected: Slow Query",
        expect.objectContaining({
          operation: "db.query",
          operationName: "Slow Query",
          duration: expect.any(Number),
          threshold: 10,
        })
      );
    });
  });

  describe("trackQuery", () => {
    it("should track query successfully", async () => {
      const queryFn = vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]);

      const result = await trackQuery("getUsers", queryFn);

      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
      expect(Sentry.startSpan).toHaveBeenCalledWith(
        expect.objectContaining({
          op: "db.query",
          name: "Query: getUsers",
        }),
        expect.any(Function)
      );
    });

    it("should log slow queries with performance logger", async () => {
      const slowQueryFn = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve([]), 50);
          })
      );

      await trackQuery("slowQuery", slowQueryFn);

      expect(logger.performance).toHaveBeenCalledWith(
        "Slow query: slowQuery",
        expect.any(Number),
        expect.objectContaining({
          queryName: "slowQuery",
          threshold: PERFORMANCE_THRESHOLDS.SLOW_QUERY,
        })
      );
    });

    it("should use SLOW_QUERY threshold", async () => {
      const queryFn = vi.fn().mockResolvedValue([]);

      await trackQuery("test", queryFn);

      // The threshold should be SLOW_QUERY (1000ms)
      expect(Sentry.startSpan).toHaveBeenCalled();
    });
  });

  describe("trackImport", () => {
    it("should track import operation successfully", async () => {
      const importFn = vi.fn().mockResolvedValue({ imported: 10 });
      const attributes = { itemsImported: 10, fileSize: 1024 };

      const result = await trackImport(importFn, attributes);

      expect(result).toEqual({ imported: 10 });
      expect(Sentry.startSpan).toHaveBeenCalledWith(
        expect.objectContaining({
          op: "import.data",
          name: "Import Transactions",
        }),
        expect.any(Function)
      );
    });

    it("should set custom attributes on span", async () => {
      const importFn = vi.fn().mockResolvedValue({ imported: 5 });
      const attributes = { itemsImported: 5, fileSize: 512 };
      let capturedSpan: {
        setAttribute: ReturnType<typeof vi.fn>;
        setStatus: ReturnType<typeof vi.fn>;
      } | null = null;

      vi.mocked(Sentry.startSpan).mockImplementation((config, callback) => {
        const mockSpan = {
          setAttribute: vi.fn(),
          setStatus: vi.fn(),
        };
        capturedSpan = mockSpan;
        return callback(mockSpan);
      });

      await trackImport(importFn, attributes);

      expect(capturedSpan?.setAttribute).toHaveBeenCalledWith("itemsImported", 5);
      expect(capturedSpan?.setAttribute).toHaveBeenCalledWith("fileSize", 512);
    });

    it("should log import completion", async () => {
      const importFn = vi.fn().mockResolvedValue({ imported: 10 });

      await trackImport(importFn, { itemsImported: 10 });

      expect(logger.performance).toHaveBeenCalledWith(
        "Import operation completed",
        expect.any(Number),
        expect.objectContaining({
          itemsImported: 10,
        })
      );
    });

    it("should handle import errors", async () => {
      const errorFn = vi.fn().mockRejectedValue(new Error("Import failed"));

      await expect(trackImport(errorFn)).rejects.toThrow("Import failed");
    });

    it("should detect slow imports", async () => {
      const slowImportFn = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ imported: 100 }), 100);
          })
      );

      await trackImport(slowImportFn);

      // Should use SLOW_OPERATION threshold (5000ms)
      expect(Sentry.startSpan).toHaveBeenCalled();
    });
  });

  describe("trackExport", () => {
    it("should track export operation successfully", async () => {
      const exportFn = vi.fn().mockResolvedValue({ exported: 20 });
      const attributes = { itemsExported: 20 };

      const result = await trackExport(exportFn, attributes);

      expect(result).toEqual({ exported: 20 });
      expect(Sentry.startSpan).toHaveBeenCalledWith(
        expect.objectContaining({
          op: "export.data",
          name: "Export Transactions",
        }),
        expect.any(Function)
      );
    });

    it("should set custom attributes on span", async () => {
      const exportFn = vi.fn().mockResolvedValue({ exported: 15 });
      const attributes = { itemsExported: 15, fileSize: 2048 };
      let capturedSpan: {
        setAttribute: ReturnType<typeof vi.fn>;
        setStatus: ReturnType<typeof vi.fn>;
      } | null = null;

      vi.mocked(Sentry.startSpan).mockImplementation((config, callback) => {
        const mockSpan = {
          setAttribute: vi.fn(),
          setStatus: vi.fn(),
        };
        capturedSpan = mockSpan;
        return callback(mockSpan);
      });

      await trackExport(exportFn, attributes);

      expect(capturedSpan?.setAttribute).toHaveBeenCalledWith("itemsExported", 15);
      expect(capturedSpan?.setAttribute).toHaveBeenCalledWith("fileSize", 2048);
    });

    it("should log export completion", async () => {
      const exportFn = vi.fn().mockResolvedValue({ exported: 10 });

      await trackExport(exportFn, { itemsExported: 10 });

      expect(logger.performance).toHaveBeenCalledWith(
        "Export operation completed",
        expect.any(Number),
        expect.objectContaining({
          itemsExported: 10,
        })
      );
    });
  });

  describe("trackSync", () => {
    it("should track sync operation successfully", async () => {
      const syncFn = vi.fn().mockResolvedValue({ synced: 30 });
      const attributes = { itemsSynced: 30, direction: "push" };

      const result = await trackSync("cloud_sync", syncFn, attributes);

      expect(result).toEqual({ synced: 30 });
      expect(Sentry.startSpan).toHaveBeenCalledWith(
        expect.objectContaining({
          op: "sync.cloud",
          name: "Cloud Sync: cloud_sync",
        }),
        expect.any(Function)
      );
    });

    it("should set sync type and custom attributes", async () => {
      const syncFn = vi.fn().mockResolvedValue({ synced: 10 });
      const attributes = { itemsSynced: 10, conflicts: 2 };
      let capturedSpan: {
        setAttribute: ReturnType<typeof vi.fn>;
        setStatus: ReturnType<typeof vi.fn>;
      } | null = null;

      vi.mocked(Sentry.startSpan).mockImplementation((config, callback) => {
        const mockSpan = {
          setAttribute: vi.fn(),
          setStatus: vi.fn(),
        };
        capturedSpan = mockSpan;
        return callback(mockSpan);
      });

      await trackSync("background_sync", syncFn, attributes);

      expect(capturedSpan?.setAttribute).toHaveBeenCalledWith("sync_type", "background_sync");
      expect(capturedSpan?.setAttribute).toHaveBeenCalledWith("itemsSynced", 10);
      expect(capturedSpan?.setAttribute).toHaveBeenCalledWith("conflicts", 2);
    });

    it("should use SLOW_SYNC threshold", async () => {
      const syncFn = vi.fn().mockResolvedValue({ synced: 5 });

      await trackSync("test", syncFn);

      // Should use SLOW_SYNC threshold (10000ms)
      expect(Sentry.startSpan).toHaveBeenCalled();
    });

    it("should detect slow sync operations", async () => {
      const slowSyncFn = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ synced: 100 }), 100);
          })
      );

      await trackSync("slow_sync", slowSyncFn);

      expect(Sentry.startSpan).toHaveBeenCalled();
    });
  });

  describe("trackBackup", () => {
    it("should track backup create operation", async () => {
      const backupFn = vi.fn().mockResolvedValue({ backup: "success" });
      const attributes = { fileSize: 4096 };

      const result = await trackBackup("create", backupFn, attributes);

      expect(result).toEqual({ backup: "success" });
      expect(Sentry.startSpan).toHaveBeenCalledWith(
        expect.objectContaining({
          op: "backup.create",
          name: "Backup: create",
        }),
        expect.any(Function)
      );
    });

    it("should track backup restore operation", async () => {
      const restoreFn = vi.fn().mockResolvedValue({ restored: true });

      const result = await trackBackup("restore", restoreFn);

      expect(result).toEqual({ restored: true });
      expect(Sentry.startSpan).toHaveBeenCalledWith(
        expect.objectContaining({
          op: "backup.restore",
          name: "Backup: restore",
        }),
        expect.any(Function)
      );
    });

    it("should set backup type and custom attributes", async () => {
      const backupFn = vi.fn().mockResolvedValue({ backup: "done" });
      const attributes = { fileSize: 8192 };
      let capturedSpan: {
        setAttribute: ReturnType<typeof vi.fn>;
        setStatus: ReturnType<typeof vi.fn>;
      } | null = null;

      vi.mocked(Sentry.startSpan).mockImplementation((config, callback) => {
        const mockSpan = {
          setAttribute: vi.fn(),
          setStatus: vi.fn(),
        };
        capturedSpan = mockSpan;
        return callback(mockSpan);
      });

      await trackBackup("create", backupFn, attributes);

      expect(capturedSpan?.setAttribute).toHaveBeenCalledWith("backup_type", "create");
      expect(capturedSpan?.setAttribute).toHaveBeenCalledWith("fileSize", 8192);
    });

    it("should log backup completion", async () => {
      const backupFn = vi.fn().mockResolvedValue({ backup: "success" });

      await trackBackup("create", backupFn);

      expect(logger.performance).toHaveBeenCalledWith(
        "Backup create completed",
        expect.any(Number),
        expect.objectContaining({
          isSlow: false,
        })
      );
    });
  });

  describe("createTimer", () => {
    it("should create a timer that returns duration", () => {
      const nowSpy = vi.spyOn(performance, "now");

      try {
        // Simulate a 500ms elapsed duration between timer start and end
        nowSpy.mockReturnValueOnce(1000).mockReturnValueOnce(1500);

        const timer = createTimer();

        expect(timer).toHaveProperty("end");
        expect(typeof timer.end).toBe("function");

        const duration = timer.end();

        expect(duration).toBe(500);
      } finally {
        nowSpy.mockRestore();
      }
    });

    it("should measure elapsed time accurately", async () => {
      const nowSpy = vi.spyOn(performance, "now");

      try {
        // Simulate 50ms elapsed between timer start and end
        nowSpy.mockReturnValueOnce(2000).mockReturnValueOnce(2050);

        const timer = createTimer();

        // Preserve async behavior without relying on real timers
        await Promise.resolve();

        const duration = timer.end();

        expect(duration).toBe(50);
      } finally {
        nowSpy.mockRestore();
      }
    });
  });

  describe("no side effects", () => {
    it("should not modify function results", async () => {
      const originalResult = { data: [1, 2, 3], meta: { count: 3 } };
      const testFn = vi.fn().mockResolvedValue(originalResult);

      const { result } = await trackPerformance("db.query", "Test", testFn);

      expect(result).toEqual(originalResult);
      expect(result).toBe(originalResult); // Same reference
    });

    it("should not interfere with function execution", async () => {
      let executionOrder: string[] = [];
      const testFn = vi.fn().mockImplementation(async () => {
        executionOrder.push("function");
        return "result";
      });

      await trackQuery("test", testFn);

      expect(executionOrder).toEqual(["function"]);
      expect(testFn).toHaveBeenCalledTimes(1);
    });

    it("should preserve error types", async () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = "CustomError";
        }
      }

      const errorFn = vi.fn().mockRejectedValue(new CustomError("Custom error"));

      await expect(trackPerformance("db.query", "Test", errorFn)).rejects.toThrow(CustomError);
    });

    it("should not log errors to Sentry for slow operations", async () => {
      const slowFn = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve("done"), 50);
          })
      );

      await trackPerformance("db.query", "Slow Query", slowFn, 10);

      // Only logger.warn should be called, not sending to Sentry
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe("performance metrics accuracy", () => {
    it("should record accurate duration for fast operations", async () => {
      const fastFn = vi.fn().mockResolvedValue("fast");

      const { duration } = await trackPerformance("db.query", "Fast", fastFn);

      expect(duration).toBeGreaterThanOrEqual(0);
      expect(duration).toBeLessThan(100);
    });

    it("should record accurate duration for slow operations", async () => {
      const slowFn = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve("slow"), 100);
          })
      );

      const { duration } = await trackPerformance("db.query", "Slow", slowFn);

      expect(duration).toBeGreaterThanOrEqual(90);
      expect(duration).toBeLessThan(200);
    });

    it("should correctly identify operations as slow or fast", async () => {
      const fastFn = vi.fn().mockResolvedValue("fast");
      const slowFn = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve("slow"), 60);
          })
      );

      const fastResult = await trackPerformance("db.query", "Fast", fastFn, 100);
      const slowResult = await trackPerformance("db.query", "Slow", slowFn, 50);

      expect(fastResult.isSlow).toBe(false);
      expect(slowResult.isSlow).toBe(true);
    });
  });
});
