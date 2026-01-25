import { describe, it, expect, vi } from "vitest";
import { withRetry } from "../retry";

describe("Retry Utility", () => {
  it("should return result if first attempt succeeds", async () => {
    const fn = vi.fn().mockResolvedValue("success");
    const result = await withRetry(fn);
    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should retry on failure and eventually succeed", async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error("fail")).mockResolvedValueOnce("success");

    const result = await withRetry(fn, { initialDelay: 1 });
    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("should throw after max attempts", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("fail"));

    await expect(withRetry(fn, { maxAttempts: 2, initialDelay: 1 })).rejects.toThrow("fail");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("should not retry if shouldRetry returns false", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("fail"));
    const shouldRetry = vi.fn().mockReturnValue(false);

    await expect(withRetry(fn, { shouldRetry, initialDelay: 1 })).rejects.toThrow("fail");
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
