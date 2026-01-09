import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { offlineRequestQueueService } from "../offlineRequestQueueService";
import { budgetDb } from "@/db/budgetDb";

describe("OfflineRequestQueueService", () => {
  beforeEach(async () => {
    // Clear the queue before each test
    await budgetDb.offlineRequestQueue.clear();

    // Mock navigator.onLine
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: true,
    });
  });

  afterEach(() => {
    // Clean up intervals
    offlineRequestQueueService.stopProcessingInterval();
  });

  describe("enqueue", () => {
    it("should enqueue a request successfully", async () => {
      const requestId = await offlineRequestQueueService.enqueue({
        requestId: "test-request-1",
        url: "https://api.example.com/test",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: "data" }),
        priority: "high",
        maxRetries: 3,
        entityType: "test",
        entityId: "123",
      });

      expect(requestId).toBeTypeOf("number");

      const queueSize = await offlineRequestQueueService.getQueueSize();
      expect(queueSize).toBe(1);
    });

    it("should assign default priority if not specified", async () => {
      await offlineRequestQueueService.enqueue({
        requestId: "test-request-2",
        url: "https://api.example.com/test",
        method: "GET",
        headers: {},
      });

      const requests = await offlineRequestQueueService.getPendingRequests();
      expect(requests[0].priority).toBe("normal");
    });

    it("should generate a UUID if requestId is not provided", async () => {
      await offlineRequestQueueService.enqueue({
        url: "https://api.example.com/test",
        method: "POST",
        headers: {},
      });

      const requests = await offlineRequestQueueService.getPendingRequests();
      // Just check that a requestId was generated (can be mock UUID in tests)
      expect(requests[0].requestId).toBeDefined();
      expect(requests[0].requestId.length).toBeGreaterThan(0);
    });
  });

  describe("getPendingRequests", () => {
    it("should return pending requests sorted by priority", async () => {
      await offlineRequestQueueService.enqueue({
        requestId: "low-priority",
        url: "https://api.example.com/low",
        method: "POST",
        headers: {},
        priority: "low",
      });

      await offlineRequestQueueService.enqueue({
        requestId: "high-priority",
        url: "https://api.example.com/high",
        method: "POST",
        headers: {},
        priority: "high",
      });

      await offlineRequestQueueService.enqueue({
        requestId: "normal-priority",
        url: "https://api.example.com/normal",
        method: "POST",
        headers: {},
        priority: "normal",
      });

      const requests = await offlineRequestQueueService.getPendingRequests();

      expect(requests[0].requestId).toBe("high-priority");
      expect(requests[1].requestId).toBe("normal-priority");
      expect(requests[2].requestId).toBe("low-priority");
    });
  });

  describe("getQueueSize", () => {
    it("should return correct queue size", async () => {
      expect(await offlineRequestQueueService.getQueueSize()).toBe(0);

      await offlineRequestQueueService.enqueue({
        requestId: "test-1",
        url: "https://api.example.com/1",
        method: "POST",
        headers: {},
      });

      expect(await offlineRequestQueueService.getQueueSize()).toBe(1);

      await offlineRequestQueueService.enqueue({
        requestId: "test-2",
        url: "https://api.example.com/2",
        method: "POST",
        headers: {},
      });

      expect(await offlineRequestQueueService.getQueueSize()).toBe(2);
    });

    it("should not count failed requests", async () => {
      await offlineRequestQueueService.enqueue({
        requestId: "test-1",
        url: "https://api.example.com/1",
        method: "POST",
        headers: {},
      });

      const requests = await budgetDb.offlineRequestQueue.toArray();
      if (requests[0].id) {
        await budgetDb.offlineRequestQueue.update(requests[0].id, {
          status: "failed",
        });
      }

      expect(await offlineRequestQueueService.getQueueSize()).toBe(0);
    });
  });

  describe("getStatus", () => {
    it("should return correct status information", async () => {
      await offlineRequestQueueService.enqueue({
        requestId: "test-pending",
        url: "https://api.example.com/pending",
        method: "POST",
        headers: {},
      });

      const status = await offlineRequestQueueService.getStatus();

      expect(status.isOnline).toBe(true);
      expect(status.pendingCount).toBe(1);
      expect(status.failedCount).toBe(0);
      expect(status.processingCount).toBe(0);
      expect(status.requests).toHaveLength(1);
      expect(status.requests[0].requestId).toBe("test-pending");
    });
  });

  describe("clearFailedRequests", () => {
    it("should clear only failed requests", async () => {
      // Add a pending request
      await offlineRequestQueueService.enqueue({
        requestId: "test-pending",
        url: "https://api.example.com/pending",
        method: "POST",
        headers: {},
      });

      // Add a failed request
      await offlineRequestQueueService.enqueue({
        requestId: "test-failed",
        url: "https://api.example.com/failed",
        method: "POST",
        headers: {},
      });

      const requests = await budgetDb.offlineRequestQueue.toArray();
      const failedRequest = requests.find((r) => r.requestId === "test-failed");

      if (failedRequest?.id) {
        await budgetDb.offlineRequestQueue.update(failedRequest.id, {
          status: "failed",
        });
      }

      const clearedCount = await offlineRequestQueueService.clearFailedRequests();

      expect(clearedCount).toBe(1);
      expect(await offlineRequestQueueService.getQueueSize()).toBe(1);

      const status = await offlineRequestQueueService.getStatus();
      expect(status.failedCount).toBe(0);
    });
  });

  describe("retryRequest", () => {
    it("should reset a failed request for retry", async () => {
      await offlineRequestQueueService.enqueue({
        requestId: "test-retry",
        url: "https://api.example.com/retry",
        method: "POST",
        headers: {},
      });

      const requests = await budgetDb.offlineRequestQueue.toArray();
      const request = requests[0];

      if (request.id) {
        await budgetDb.offlineRequestQueue.update(request.id, {
          status: "failed",
          retryCount: 3,
          errorMessage: "Test error",
        });
      }

      await offlineRequestQueueService.retryRequest("test-retry");

      const updatedRequest = await budgetDb.offlineRequestQueue
        .where("requestId")
        .equals("test-retry")
        .first();

      expect(updatedRequest?.status).toBe("pending");
      expect(updatedRequest?.retryCount).toBe(0);
      expect(updatedRequest?.errorMessage).toBeUndefined();
    });

    it("should throw error if request not found", async () => {
      await expect(offlineRequestQueueService.retryRequest("non-existent")).rejects.toThrow(
        "Request not found: non-existent"
      );
    });
  });

  describe("clearAllRequests", () => {
    it("should clear all requests from the queue", async () => {
      await offlineRequestQueueService.enqueue({
        requestId: "test-1",
        url: "https://api.example.com/1",
        method: "POST",
        headers: {},
      });

      await offlineRequestQueueService.enqueue({
        requestId: "test-2",
        url: "https://api.example.com/2",
        method: "POST",
        headers: {},
      });

      expect(await offlineRequestQueueService.getQueueSize()).toBe(2);

      await offlineRequestQueueService.clearAllRequests();

      expect(await offlineRequestQueueService.getQueueSize()).toBe(0);
    });
  });

  describe("online/offline handling", () => {
    it("should update isOnline status on online event", async () => {
      // Set offline
      Object.defineProperty(navigator, "onLine", {
        writable: true,
        value: false,
      });

      // Trigger offline event
      window.dispatchEvent(new Event("offline"));

      let status = await offlineRequestQueueService.getStatus();
      expect(status.isOnline).toBe(false);

      // Set online
      Object.defineProperty(navigator, "onLine", {
        writable: true,
        value: true,
      });

      // Trigger online event
      window.dispatchEvent(new Event("online"));

      // Wait a bit for the event to be processed
      await new Promise((resolve) => setTimeout(resolve, 100));

      status = await offlineRequestQueueService.getStatus();
      expect(status.isOnline).toBe(true);
    });
  });
});
