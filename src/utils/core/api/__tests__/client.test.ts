import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { APIClient, setTestRetryOptions } from "../client";
import { clearCircuitBreakers } from "../circuitBreaker";
import { serialize } from "../messagePack";

describe("APIClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCircuitBreakers();
    // Use 0ms delays for tests to prevent timeouts
    setTestRetryOptions({ initialDelay: 0, maxDelay: 0 });

    // Default success response
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ data: "test" }),
        arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
      }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    setTestRetryOptions({}); // Reset
  });

  it("should perform a standard GET request", async () => {
    const client = new APIClient("go-backend");
    const result = await client.get("/test");
    expect(result).toEqual({ data: "test" });
  });

  it("should handle MessagePack responses with valid data", async () => {
    const client = new APIClient("go-backend");
    const validBuffer = serialize({ foo: "bar" });

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        arrayBuffer: async () =>
          validBuffer.buffer.slice(
            validBuffer.byteOffset,
            validBuffer.byteOffset + validBuffer.byteLength
          ),
      }))
    );

    const result = await client.get("/test", { useMsgPack: true });
    expect(result).toEqual({ foo: "bar" });
  });

  it("should retry and eventually succeed without delay", async () => {
    const client = new APIClient("go-backend");

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockRejectedValueOnce(new Error("fail"))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: "ok" }),
        })
    );

    const result = await client.get("/test", { maxAttempts: 2 });
    expect(result).toEqual({ data: "ok" });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
