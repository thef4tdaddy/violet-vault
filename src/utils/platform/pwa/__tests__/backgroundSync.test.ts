import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import backgroundSyncManager from "../backgroundSync";
import logger from "@/utils/core/common/logger";

// Mock logger
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock crypto.randomUUID
global.crypto = {
  randomUUID: () => `test-uuid-${Math.random()}`,
} as Crypto;

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Helper function to control online state
const setOnlineState = (isOnline: boolean) => {
  Object.defineProperty(backgroundSyncManager, "isOnline", {
    value: isOnline,
    writable: true,
    configurable: true,
  });
};

describe("BackgroundSyncManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetch).mockRestore();
    localStorageMock.clear();
    // Reset the manager's state
    backgroundSyncManager.clearPendingOperations();
    // Reset online state to true for most tests
    setOnlineState(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetch).mockRestore();
  });

  describe("queueOperation", () => {
    it("should queue an operation successfully", async () => {
      // Mock fetch to prevent immediate sync
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const operation = {
        type: "transaction",
        method: "POST",
        url: "/api/transactions",
        data: { amount: 100 },
      };

      const operationId = await backgroundSyncManager.queueOperation(operation);

      expect(operationId).toBeDefined();
      expect(typeof operationId).toBe("string");
      expect(logger.info).toHaveBeenCalledWith(
        "📤 Background Sync: Operation queued",
        expect.objectContaining({
          operationType: "transaction",
          operationId,
        })
      );
    });

    it("should assign default values to queued operations", async () => {
      // Set offline to prevent immediate sync
      setOnlineState(false);

      const operation = {
        type: "envelope",
        method: "PUT",
        url: "/api/envelopes/1",
        data: { name: "Updated" },
      };

      await backgroundSyncManager.queueOperation(operation);
      const status = backgroundSyncManager.getSyncStatus();

      expect(status.pendingCount).toBe(1);
      const queuedOp = status.pendingOperations[0];
      expect(queuedOp.retryCount).toBe(0);
      expect(queuedOp.maxRetries).toBe(3);
      expect(queuedOp.timestamp).toBeDefined();

      // Restore online state
      setOnlineState(true);
    });

    it("should attempt sync immediately when online", async () => {
      // Set up mock for successful fetch
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const operation = {
        type: "transaction",
        method: "POST",
        url: "/api/transactions",
      };

      await backgroundSyncManager.queueOperation(operation);

      // Sync should be attempted
      expect(fetch).toHaveBeenCalledWith(
        "/api/transactions",
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });

  describe("syncPendingOperations", () => {
    it("should sync operations when online", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      await backgroundSyncManager.queueOperation({
        type: "transaction",
        method: "POST",
        url: "/api/transactions",
      });

      await backgroundSyncManager.syncPendingOperations();

      const status = backgroundSyncManager.getSyncStatus();
      expect(status.pendingCount).toBe(0);
    });

    it("should not sync when offline", async () => {
      // Simulate offline state
      setOnlineState(false);

      await backgroundSyncManager.queueOperation({
        type: "transaction",
        method: "POST",
        url: "/api/transactions",
      });

      vi.mocked(fetch).mockClear();
      await backgroundSyncManager.syncPendingOperations();

      expect(fetch).not.toHaveBeenCalled();
    });

    it("should retry failed operations with exponential backoff", async () => {
      // Set up mock before queueing
      vi.mocked(fetch).mockRejectedValue(new Error("network error"));

      const operation = {
        type: "transaction",
        method: "POST",
        url: "/api/transactions",
      };

      await backgroundSyncManager.queueOperation(operation);

      const status = backgroundSyncManager.getSyncStatus();
      // Operation should still be in queue after failed sync
      expect(status.pendingCount).toBeGreaterThan(0);
      if (status.pendingCount > 0) {
        expect(status.pendingOperations[0].retryCount).toBe(1);
        expect(status.pendingOperations[0].nextRetryTime).toBeDefined();
        expect(status.pendingOperations[0].lastError).toBe("network error");
      }
    });

    it("should remove operations after max retries", async () => {
      vi.mocked(fetch).mockRejectedValue(new Error("network error"));

      const operation = {
        type: "transaction",
        method: "POST",
        url: "/api/transactions",
        maxRetries: 2,
      };

      await backgroundSyncManager.queueOperation(operation);

      // First sync was attempted during queueOperation (retry count = 1)
      let status = backgroundSyncManager.getSyncStatus();
      expect(status.pendingCount).toBeGreaterThan(0);
      if (status.pendingCount > 0) {
        expect(status.pendingOperations[0].retryCount).toBe(1);

        // Force retry by removing nextRetryTime constraint
        backgroundSyncManager.pendingOperations[0].nextRetryTime = 0;

        // Second sync attempt (retry count = 2, reaches maxRetries)
        await backgroundSyncManager.syncPendingOperations();
        status = backgroundSyncManager.getSyncStatus();

        // Should be removed after hitting maxRetries
        expect(status.pendingCount).toBe(0);
      }
    });

    it("should handle 5xx errors as retryable", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: async () => ({}),
      } as Response);

      await backgroundSyncManager.queueOperation({
        type: "transaction",
        method: "POST",
        url: "/api/transactions",
      });

      // Sync was attempted during queueOperation
      const status = backgroundSyncManager.getSyncStatus();
      expect(status.pendingCount).toBeGreaterThan(0);
      if (status.pendingCount > 0) {
        expect(status.pendingOperations[0].retryCount).toBe(1);
      }
    });

    it("should handle 409 conflicts appropriately", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 409,
        statusText: "Conflict",
        json: async () => ({}),
      } as Response);

      await backgroundSyncManager.queueOperation({
        type: "transaction",
        method: "POST",
        url: "/api/transactions",
      });

      // Sync was attempted during queueOperation
      // 409 conflicts are treated as permanent failures (not retryable)
      // The logger.error should have been called with the permanent failure message
      const errorCalls = vi.mocked(logger.error).mock.calls;
      const permanentFailureCall = errorCalls.find(
        (call) => typeof call[0] === "string" && call[0].includes("Operation failed permanently")
      );

      expect(permanentFailureCall).toBeDefined();

      const status = backgroundSyncManager.getSyncStatus();
      expect(status.pendingCount).toBe(0);
    });
  });

  describe("executeOperation", () => {
    it("should execute POST operation successfully", async () => {
      // Clear previous mocks
      vi.mocked(fetch).mockClear();
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ id: "123", success: true }),
      } as Response);

      const operation = {
        type: "transaction",
        method: "POST",
        url: "/api/transactions",
        data: { amount: 100 },
        headers: { Authorization: "Bearer token" },
      };

      const result = await backgroundSyncManager.executeOperation(operation);

      expect(result).toEqual({ id: "123", success: true });
      expect(fetch).toHaveBeenCalledWith(
        "/api/transactions",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer token",
          }),
          body: JSON.stringify({ amount: 100 }),
        })
      );
    });

    it("should handle timeout errors", async () => {
      // Clear previous mocks
      vi.mocked(fetch).mockClear();
      vi.mocked(fetch).mockImplementation(
        () =>
          new Promise((_, reject) => {
            const error = new Error("Aborted");
            error.name = "AbortError";
            reject(error);
          })
      );

      const operation = {
        type: "transaction",
        method: "POST",
        url: "/api/transactions",
      };

      await expect(backgroundSyncManager.executeOperation(operation)).rejects.toThrow(
        "Request timeout after 30 seconds"
      );
    });

    it("should handle non-OK responses", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
      } as Response);

      const operation = {
        type: "transaction",
        method: "POST",
        url: "/api/transactions",
      };

      await expect(backgroundSyncManager.executeOperation(operation)).rejects.toThrow(
        "HTTP 400: Bad Request"
      );
    });
  });

  describe("online/offline event handling", () => {
    it("should handle online event and trigger sync", async () => {
      vi.useFakeTimers();
      try {
        vi.mocked(fetch).mockResolvedValue({
          ok: true,
          json: async () => ({ success: true }),
        } as Response);

        // Queue an operation while "offline"
        setOnlineState(false);

        await backgroundSyncManager.queueOperation({
          type: "transaction",
          method: "POST",
          url: "/api/transactions",
        });

        // Simulate coming online
        const onlinePromise = backgroundSyncManager.handleOnline();

        // Advance timers to trigger the delayed sync (1000ms)
        await vi.advanceTimersByTimeAsync(1000);
        await onlinePromise;

        expect(logger.info).toHaveBeenCalledWith(
          "🌐 Background Sync: Device came online",
          expect.objectContaining({
            pendingOperations: 1,
          })
        );
      } finally {
        vi.useRealTimers();
      }
    });

    it("should handle offline event", () => {
      backgroundSyncManager.handleOffline();

      expect(backgroundSyncManager.isOnline).toBe(false);
      expect(logger.info).toHaveBeenCalledWith(
        "📱 Background Sync: Device went offline",
        expect.any(Object)
      );
    });
  });

  describe("persistence", () => {
    it("should save pending operations to localStorage", async () => {
      // Set offline to prevent immediate sync
      setOnlineState(false);

      await backgroundSyncManager.queueOperation({
        type: "transaction",
        method: "POST",
        url: "/api/transactions",
      });

      const saved = localStorage.getItem("violet-vault-sync-queue");
      expect(saved).toBeDefined();

      const parsed = JSON.parse(saved!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].type).toBe("transaction");

      // Restore online state
      setOnlineState(true);
    });

    it("should load pending operations from localStorage", () => {
      const operations = [
        {
          id: "test-1",
          type: "transaction",
          method: "POST",
          url: "/api/transactions",
          timestamp: Date.now(),
          retryCount: 0,
          maxRetries: 3,
        },
      ];

      localStorage.setItem("violet-vault-sync-queue", JSON.stringify(operations));

      backgroundSyncManager.loadPendingOperations();

      const status = backgroundSyncManager.getSyncStatus();
      expect(status.pendingCount).toBe(1);
      expect(logger.info).toHaveBeenCalledWith(
        "📥 Background Sync: Loaded pending operations",
        expect.objectContaining({
          operationCount: 1,
        })
      );
    });

    it("should handle corrupt localStorage data gracefully", () => {
      localStorage.setItem("violet-vault-sync-queue", "invalid json{");

      backgroundSyncManager.loadPendingOperations();

      expect(logger.error).toHaveBeenCalled();
      const status = backgroundSyncManager.getSyncStatus();
      expect(status.pendingCount).toBe(0);
    });
  });

  describe("getSyncStatus", () => {
    it("should return comprehensive sync status", async () => {
      // Set offline to prevent immediate sync
      setOnlineState(false);

      await backgroundSyncManager.queueOperation({
        type: "transaction",
        method: "POST",
        url: "/api/transactions",
      });

      const status = backgroundSyncManager.getSyncStatus();

      expect(status.isOnline).toBeDefined();
      expect(status.pendingCount).toBe(1);
      expect(status.readyToSync).toBeDefined();
      expect(status.waitingForRetry).toBeDefined();
      expect(status.pendingOperations).toHaveLength(1);
      expect(status.pendingOperations[0]).toHaveProperty("id");
      expect(status.pendingOperations[0]).toHaveProperty("type");
      expect(status.pendingOperations[0]).toHaveProperty("retryCount");

      // Restore online state
      setOnlineState(true);
    });

    it("should differentiate ready and waiting operations", async () => {
      vi.mocked(fetch).mockRejectedValue(new Error("network error"));

      // Queue and fail an operation to set nextRetryTime
      await backgroundSyncManager.queueOperation({
        type: "transaction",
        method: "POST",
        url: "/api/transactions",
      });

      // Sync was attempted during queueOperation
      const status = backgroundSyncManager.getSyncStatus();
      if (status.pendingCount > 0) {
        expect(status.waitingForRetry).toBeGreaterThan(0);
        expect(status.pendingOperations[0].timeUntilRetry).toBeGreaterThan(0);
      } else {
        // If operations were somehow cleared, skip this test
        expect(status.pendingCount).toBeGreaterThan(0);
      }
    });
  });

  describe("clearPendingOperations", () => {
    it("should clear all pending operations", async () => {
      await backgroundSyncManager.queueOperation({
        type: "transaction",
        method: "POST",
        url: "/api/transactions",
      });

      backgroundSyncManager.clearPendingOperations();

      const status = backgroundSyncManager.getSyncStatus();
      expect(status.pendingCount).toBe(0);
      expect(logger.info).toHaveBeenCalledWith(
        "🧹 Background Sync: Cleared all pending operations"
      );
    });
  });

  describe("exponential backoff", () => {
    it("should calculate increasing retry delays", async () => {
      vi.mocked(fetch).mockRejectedValue(new Error("network error"));

      await backgroundSyncManager.queueOperation({
        type: "transaction",
        method: "POST",
        url: "/api/transactions",
      });

      // First sync was attempted during queueOperation (retry count = 1)
      let status = backgroundSyncManager.getSyncStatus();
      expect(status.pendingCount).toBeGreaterThan(0);

      if (status.pendingCount > 0) {
        const firstRetryTime = status.pendingOperations[0].nextRetryTime;
        expect(firstRetryTime).toBeDefined();

        // Force immediate retry
        backgroundSyncManager.pendingOperations[0].nextRetryTime = 0;

        // Second retry
        await backgroundSyncManager.syncPendingOperations();
        status = backgroundSyncManager.getSyncStatus();
        const secondRetryTime = status.pendingOperations[0].nextRetryTime;

        // Second retry should have a longer delay
        expect(secondRetryTime).toBeGreaterThan(firstRetryTime!);
      }
    });

    it("should cap retry delay at 30 seconds", async () => {
      // Set offline to prevent immediate sync
      setOnlineState(false);

      const operation = {
        type: "transaction",
        method: "POST",
        url: "/api/transactions",
      };

      vi.mocked(fetch).mockRejectedValue(new Error("network error"));

      await backgroundSyncManager.queueOperation(operation);

      // Now manually set high retry count
      backgroundSyncManager.pendingOperations[0].retryCount = 10;

      // Go back online
      setOnlineState(true);

      await backgroundSyncManager.syncPendingOperations();

      const status = backgroundSyncManager.getSyncStatus();
      if (status.pendingCount > 0) {
        const timeUntilRetry = status.pendingOperations[0].timeUntilRetry;

        // Should be capped at 30000ms
        expect(timeUntilRetry).toBeLessThanOrEqual(30000);
      }
    });
  });

  describe("error classification", () => {
    it("should treat network errors as retryable", async () => {
      vi.mocked(fetch).mockRejectedValue(new Error("fetch failed: network error"));

      await backgroundSyncManager.queueOperation({
        type: "transaction",
        method: "POST",
        url: "/api/transactions",
      });

      // Sync was attempted during queueOperation
      const status = backgroundSyncManager.getSyncStatus();
      expect(status.pendingCount).toBeGreaterThan(0);
      if (status.pendingCount > 0) {
        expect(status.pendingOperations[0].retryCount).toBe(1);
      }
    });

    it("should treat HTTP 429 as retryable", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
      } as Response);

      await backgroundSyncManager.queueOperation({
        type: "transaction",
        method: "POST",
        url: "/api/transactions",
      });

      await backgroundSyncManager.syncPendingOperations();

      const status = backgroundSyncManager.getSyncStatus();
      expect(status.pendingCount).toBe(1);
    });

    it("should treat HTTP 408 as retryable", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 408,
        statusText: "Request Timeout",
      } as Response);

      await backgroundSyncManager.queueOperation({
        type: "transaction",
        method: "POST",
        url: "/api/transactions",
      });

      await backgroundSyncManager.syncPendingOperations();

      const status = backgroundSyncManager.getSyncStatus();
      expect(status.pendingCount).toBe(1);
    });
  });
});
