import { describe, it, expect, vi, beforeEach } from "vitest";
import { CircuitBreaker } from "../circuitBreaker";

describe("Circuit Breaker", () => {
  const options = {
    failureThreshold: 2,
    resetTimeout: 100, // Short timeout for testing
  };

  it("should execute successfully when closed", async () => {
    const cb = new CircuitBreaker("test", options);
    const fn = vi.fn().mockResolvedValue("success");

    const result = await cb.execute(fn);
    expect(result).toBe("success");
    expect(cb.getState()).toBe("CLOSED");
  });

  it("should open after failures", async () => {
    const cb = new CircuitBreaker("test", options);
    const fn = vi.fn().mockRejectedValue(new Error("fail"));

    await expect(cb.execute(fn)).rejects.toThrow();
    await expect(cb.execute(fn)).rejects.toThrow();

    expect(cb.getState()).toBe("OPEN");
    await expect(cb.execute(fn)).rejects.toThrow(/Requests blocked/);
  });

  it("should transition to half-open after timeout", async () => {
    const cb = new CircuitBreaker("test", options);
    const fn = vi.fn().mockRejectedValue(new Error("fail"));

    await expect(cb.execute(fn)).rejects.toThrow();
    await expect(cb.execute(fn)).rejects.toThrow();

    // Manual wait
    await new Promise((r) => setTimeout(r, 150));

    expect(cb.getState()).toBe("HALF_OPEN");
  });
});
