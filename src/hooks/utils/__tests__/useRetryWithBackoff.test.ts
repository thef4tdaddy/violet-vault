import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRetryWithBackoff } from "../useRetryWithBackoff";
import * as sentryModule from "@/utils/core/common/sentry";

// Mock generic Sentry capture
vi.mock("@/utils/core/common/sentry", () => ({
  captureError: vi.fn(),
}));

describe("useRetryWithBackoff", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("should execute successful function without retry", async () => {
    const { result } = renderHook(() => useRetryWithBackoff());
    const mockFn = vi.fn().mockResolvedValue("success");

    await act(async () => {
      const promise = result.current.execute(mockFn);
      await expect(promise).resolves.toBe("success");
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBeNull();
    expect(result.current.isRetrying).toBe(false);
  });

  it("should retry on failure up to maxRetries", async () => {
    const { result } = renderHook(() =>
      useRetryWithBackoff({ maxRetries: 2, initialDelay: 100, backoffFactor: 2 })
    );

    const mockFn = vi
      .fn()
      .mockRejectedValueOnce(new Error("Fail 1"))
      .mockRejectedValueOnce(new Error("Fail 2"))
      .mockResolvedValue("Success on 3");

    let promise: Promise<any>;
    await act(async () => {
      promise = result.current.execute(mockFn);
    });

    // First attempt failed
    expect(mockFn).toHaveBeenCalledTimes(1);

    // Fast-forward for first retry
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    // Need to await microtasks for the async function to proceed
    // Using a loop to ensure promise resolution
    // In actual run, advanceTimers usually triggers the timeout callback,
    // but the async/await generic loop needs to cycle.

    // Second attempt failed
    await act(async () => {
      vi.advanceTimersByTime(200); // Backoff 100 * 2
    });

    // Third attempt succeeds
    await expect(promise!).resolves.toBe("Success on 3");

    expect(mockFn).toHaveBeenCalledTimes(3);
    expect(result.current.error).toBeNull();
  });

  it("should throw error and capture to Sentry when retries exhausted", async () => {
    const { result } = renderHook(() => useRetryWithBackoff({ maxRetries: 2, initialDelay: 100 }));

    const mockFn = vi.fn().mockRejectedValue(new Error("Persistent Failure"));

    let executePromise: Promise<any>;
    await act(async () => {
      executePromise = result.current.execute(mockFn);
      // Suppress unhandled rejection as we handle it later with rejects.toThrow
      executePromise.catch(() => {});
    });

    // 1st Attempt
    expect(mockFn).toHaveBeenCalledTimes(1);

    // 1st Retry
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    // 2nd Retry
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(mockFn).toHaveBeenCalledTimes(3); // Initial + 2 retries

    // Should fail now
    await expect(executePromise!).rejects.toThrow("Persistent Failure");

    expect(sentryModule.captureError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: expect.objectContaining({ retry_exhausted: "true" }),
      })
    );
  });
});
