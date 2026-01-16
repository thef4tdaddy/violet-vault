import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { offlineRequestQueueService } from "../offlineRequestQueueService";
import { budgetDb } from "@/db/budgetDb";
import logger from "@/utils/core/common/logger";

// Mock dependencies
vi.mock("@/db/budgetDb", () => {
  const mockQuery = {
    where: vi.fn().mockReturnThis(),
    equals: vi.fn().mockReturnThis(),
    count: vi.fn(),
    toArray: vi.fn(),
    sortBy: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    bulkDelete: vi.fn(),
    clear: vi.fn(),
  };
  return {
    budgetDb: {
      offlineRequestQueue: mockQuery,
    },
  };
});

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock crypto.randomUUID
if (!global.crypto) {
  (global as any).crypto = {};
}
(global.crypto as any).randomUUID = () => "test-uuid-123";

describe("Offline Request Queue Service", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    // Default online
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: true,
    });

    // Reset service state
    (offlineRequestQueueService as any).isOnline = true;
    (offlineRequestQueueService as any).processingQueue = false;
    offlineRequestQueueService.stopProcessingInterval();

    // Default DB behavior to avoid "filter of undefined"
    (budgetDb.offlineRequestQueue.toArray as any).mockResolvedValue([]);
    (budgetDb.offlineRequestQueue.sortBy as any).mockResolvedValue([]);
    (budgetDb.offlineRequestQueue.count as any).mockResolvedValue(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initialize", () => {
    it("should initialize and clean up stale tasks", async () => {
      await offlineRequestQueueService.initialize();

      expect(logger.info).toHaveBeenCalledWith("OfflineRequestQueue: Initializing");
      expect(budgetDb.offlineRequestQueue.where).toHaveBeenCalledWith("status");
      expect(budgetDb.offlineRequestQueue.equals).toHaveBeenCalledWith("processing");
    });
  });

  describe("enqueue", () => {
    it("should add request to DB and try to process if online", async () => {
      (budgetDb.offlineRequestQueue.add as any).mockResolvedValue(123);

      const request = {
        url: "/api/test",
        method: "POST",
        body: '{"foo":"bar"}',
        entityType: "transaction",
      };

      await offlineRequestQueueService.enqueue(request);

      expect(budgetDb.offlineRequestQueue.add).toHaveBeenCalled();

      // Should trigger processQueue after timeout
      await vi.advanceTimersByTimeAsync(200);
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("Processing queue"),
        expect.anything()
      );
    });
  });

  describe("processQueue", () => {
    it("should execute pending requests when online", async () => {
      const mockRequest = {
        id: 1,
        requestId: "req-1",
        url: "/api/test",
        method: "POST",
        status: "pending",
        priority: "normal",
        retryCount: 0,
        maxRetries: 3,
      };

      (budgetDb.offlineRequestQueue.sortBy as any).mockResolvedValue([mockRequest]);
      mockFetch.mockResolvedValue({ ok: true });

      await offlineRequestQueueService.processQueue();

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/test",
        expect.objectContaining({
          method: "POST",
        })
      );
      expect(budgetDb.offlineRequestQueue.update).toHaveBeenCalledWith(1, {
        status: "completed",
      });
    });

    it("should handle request failure and retry with delay", async () => {
      const mockRequest = {
        id: 1,
        requestId: "req-1",
        url: "/api/test",
        method: "POST",
        status: "pending",
        priority: "normal",
        retryCount: 0,
        maxRetries: 3,
      };

      (budgetDb.offlineRequestQueue.sortBy as any).mockResolvedValue([mockRequest]);
      mockFetch.mockRejectedValue(new Error("Network Error"));

      await offlineRequestQueueService.processQueue();

      expect(budgetDb.offlineRequestQueue.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          status: "pending",
          retryCount: 1,
        })
      );
    });
  });

  describe("Online/Offline behavior", () => {
    it("should stop processing when offline", async () => {
      (offlineRequestQueueService as any).handleOffline();
      await offlineRequestQueueService.processQueue();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should resume and process queue when coming online", async () => {
      await (offlineRequestQueueService as any).handleOnline();
      await vi.advanceTimersByTimeAsync(1500);
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("Processing queue"),
        expect.anything()
      );
    });
  });
});
