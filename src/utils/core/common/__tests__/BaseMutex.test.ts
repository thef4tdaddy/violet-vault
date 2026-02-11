import { describe, it, expect, beforeEach, vi } from "vitest";
import { BaseMutex } from "../BaseMutex";

describe("BaseMutex", () => {
  let mutex;

  beforeEach(() => {
    mutex = new BaseMutex("TestMutex");
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("should create mutex with default name", () => {
      const defaultMutex = new BaseMutex();
      expect(defaultMutex.name).toBe("BaseMutex");
      expect(defaultMutex.locked).toBe(false);
    });

    it("should create mutex with custom name", () => {
      expect(mutex.name).toBe("TestMutex");
      expect(mutex.locked).toBe(false);
    });
  });

  describe("acquire and release", () => {
    it("should acquire lock when available", async () => {
      await mutex.acquire("test-operation");
      expect(mutex.locked).toBe(true);
      expect(mutex.currentOperation).toBe("test-operation");
    });

    it("should release lock correctly", async () => {
      await mutex.acquire("test-operation");
      mutex.release();
      expect(mutex.locked).toBe(false);
      expect(mutex.currentOperation).toBe(null);
    });

    it("should queue operations when locked", async () => {
      await mutex.acquire("first-operation");

      const secondOperation = mutex.acquire("second-operation");
      expect(mutex.queue.length).toBe(1);

      mutex.release();
      await secondOperation;
      expect(mutex.currentOperation).toBe("second-operation");
    });

    it("should handle multiple queued operations", async () => {
      await mutex.acquire("first-operation");

      const secondPromise = mutex.acquire("second-operation");
      const thirdPromise = mutex.acquire("third-operation");

      expect(mutex.queue.length).toBe(2);

      mutex.release();
      await secondPromise;

      expect(mutex.currentOperation).toBe("second-operation");

      mutex.release();
      await thirdPromise;

      expect(mutex.currentOperation).toBe("third-operation");
      mutex.release();
    });
  });

  describe("execute wrapper", () => {
    it("should execute function with mutex protection", async () => {
      const mockFn = vi.fn().mockResolvedValue("result");

      const result = await mutex.execute(mockFn, "wrapper-operation");

      expect(result).toBe("result");
      expect(mockFn).toHaveBeenCalledOnce();
      expect(mutex.locked).toBe(false);
    });

    it("should release mutex even if function throws", async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error("test error"));

      await expect(mutex.execute(mockFn, "error-operation")).rejects.toThrow("test error");
      expect(mutex.locked).toBe(false);
    });

    it("should prevent concurrent execution", async () => {
      const results = [];
      const slowFn = async (value) => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        results.push(value);
        return value;
      };

      const promises = [
        mutex.execute(() => slowFn(1), "op1"),
        mutex.execute(() => slowFn(2), "op2"),
        mutex.execute(() => slowFn(3), "op3"),
      ];

      await Promise.all(promises);
      expect(results).toEqual([1, 2, 3]);
    });
  });

  describe("status and metrics", () => {
    it("should return correct status", async () => {
      let status = mutex.getStatus();
      expect(status.locked).toBe(false);
      expect(status.currentOperation).toBe(null);
      expect(status.queueLength).toBe(0);

      await mutex.acquire("status-test");
      status = mutex.getStatus();
      expect(status.locked).toBe(true);
      expect(status.currentOperation).toBe("status-test");
    });

    it("should track queue size correctly", async () => {
      await mutex.acquire("first");

      mutex.acquire("second");
      mutex.acquire("third");

      const status = mutex.getStatus();
      expect(status.queueLength).toBe(2);

      mutex.release();
    });
  });

  describe("error handling", () => {
    it("should handle double release gracefully", () => {
      expect(() => mutex.release()).not.toThrow();
    });

    it("should handle acquire without operation name", async () => {
      await mutex.acquire();
      expect(mutex.currentOperation).toBe("unknown");
    });

    it("should clear queue on error", async () => {
      await mutex.acquire("first");

      const secondPromise = mutex.acquire("second");
      // Queue a third promise (will be cleared)
      mutex.acquire("third");

      // Force clear queue
      mutex.queue.length = 0;
      mutex.release();

      // These should timeout since queue was cleared
      await expect(
        Promise.race([
          secondPromise,
          new Promise((resolve) => setTimeout(() => resolve("timeout"), 100)),
        ])
      ).resolves.toBe("timeout");
    }, 10000);
  });
});
