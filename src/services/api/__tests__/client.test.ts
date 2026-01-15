/**
 * API Client Tests
 * Comprehensive tests for the API client module
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ApiClient } from "@/services/api/client";

// Mock logger
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("ApiClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock environment variable to empty string (default case)
    import.meta.env.VITE_API_BASE_URL = "";
  });

  afterEach(() => {
    // Clean up
    vi.clearAllMocks();
  });

  describe("request", () => {
    it("should make a successful GET request with JSON response", async () => {
      const mockData = { success: true, data: { id: 1, name: "Test" } };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
        json: vi.fn().mockResolvedValue(mockData),
      });

      const result = await ApiClient.request("/test", { method: "GET" });

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        "/test",
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );
    });

    it("should make a successful POST request with JSON body", async () => {
      const mockResponse = { success: true, data: { id: 1 } };
      const requestBody = { name: "Test", value: 123 };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await ApiClient.request("/test", {
        method: "POST",
        body: requestBody,
      });

      expect(result).toEqual(mockResponse);
      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toBe("/test");
      expect(fetchCall[1].method).toBe("POST");
      expect(fetchCall[1].body).toBe(JSON.stringify(requestBody));
      expect(fetchCall[1].headers["Content-Type"]).toBe("application/json");
    });

    it("should handle custom headers", async () => {
      const mockResponse = { success: true };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const customHeaders = {
        Authorization: "Bearer token123",
        "X-Custom-Header": "custom-value",
      };

      await ApiClient.request("/test", {
        method: "GET",
        headers: customHeaders,
      });

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[1].headers.Authorization).toBe("Bearer token123");
      expect(fetchCall[1].headers["X-Custom-Header"]).toBe("custom-value");
    });

    it("should handle network errors", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const result = await ApiClient.request("/test", { method: "GET" });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error");
    });

    it("should handle request timeout (AbortError)", async () => {
      const abortError = new Error("The operation was aborted");
      abortError.name = "AbortError";
      global.fetch = vi.fn().mockRejectedValue(abortError);

      const result = await ApiClient.request("/test", { method: "GET" });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Request timeout - please try again");
    });

    it("should handle non-JSON response", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("text/plain"),
        },
        text: vi.fn().mockResolvedValue("Plain text response"),
      });

      const result = await ApiClient.request("/test", { method: "GET" });

      expect(result.success).toBe(true);
    });

    it("should handle HTTP error responses (4xx)", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
        json: vi.fn().mockResolvedValue({
          success: false,
          error: "Resource not found",
        }),
      });

      const result = await ApiClient.request("/test", { method: "GET" });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Resource not found");
    });

    it("should handle HTTP error responses (5xx)", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
        json: vi.fn().mockResolvedValue({
          success: false,
          error: "Server error",
        }),
      });

      const result = await ApiClient.request("/test", { method: "GET" });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Server error");
    });

    it("should handle HTTP error with text response", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        headers: {
          get: vi.fn().mockReturnValue("text/plain"),
        },
        text: vi.fn().mockResolvedValue("Invalid request format"),
      });

      const result = await ApiClient.request("/test", { method: "GET" });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid request format");
    });

    it("should handle FormData body in POST request", async () => {
      const mockResponse = { success: true };
      const formData = new FormData();
      formData.append("file", new Blob(["test"]), "test.txt");
      formData.append("name", "Test File");

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await ApiClient.request("/upload", {
        method: "POST",
        body: formData,
      });

      expect(result).toEqual(mockResponse);
      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toBe("/upload");
      expect(fetchCall[1].method).toBe("POST");
      expect(fetchCall[1].body).toBeInstanceOf(FormData);
      // Verify Content-Type header is NOT set for FormData (browser sets it with boundary)
      expect(fetchCall[1].headers["Content-Type"]).toBeUndefined();
    });

    it("should not add body for GET requests", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
        json: vi.fn().mockResolvedValue({ success: true }),
      });

      await ApiClient.request("/test", {
        method: "GET",
        body: { shouldBeIgnored: true },
      });

      const fetchCall = (global.fetch as any).mock.calls[0][1];
      expect(fetchCall.body).toBeUndefined();
    });

    it("should handle PUT requests with JSON body", async () => {
      const mockResponse = { success: true };
      const requestBody = { id: 1, name: "Updated" };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await ApiClient.request("/test/1", {
        method: "PUT",
        body: requestBody,
      });

      expect(result).toEqual(mockResponse);
      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toBe("/test/1");
      expect(fetchCall[1].method).toBe("PUT");
      expect(fetchCall[1].body).toBe(JSON.stringify(requestBody));
    });
  });

  describe("get", () => {
    it("should make a GET request", async () => {
      const mockResponse = { success: true, data: { items: [] } };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await ApiClient.get("/items");

      expect(result).toEqual(mockResponse);
      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toBe("/items");
      expect(fetchCall[1].method).toBe("GET");
    });

    it("should pass custom options to GET request", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
        json: vi.fn().mockResolvedValue({ success: true }),
      });

      await ApiClient.get("/items", {
        headers: { Authorization: "Bearer token" },
        timeout: 10000,
      });

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toBe("/items");
      expect(fetchCall[1].method).toBe("GET");
      expect(fetchCall[1].headers.Authorization).toBe("Bearer token");
    });
  });

  describe("post", () => {
    it("should make a POST request with JSON body", async () => {
      const mockResponse = { success: true, data: { id: 1 } };
      const postData = { name: "New Item", value: 100 };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await ApiClient.post("/items", postData);

      expect(result).toEqual(mockResponse);
      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toBe("/items");
      expect(fetchCall[1].method).toBe("POST");
      expect(fetchCall[1].body).toBe(JSON.stringify(postData));
    });

    it("should make a POST request with FormData", async () => {
      const mockResponse = { success: true };
      const formData = new FormData();
      formData.append("key", "value");

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await ApiClient.post("/upload", formData);

      expect(result).toEqual(mockResponse);
      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toBe("/upload");
      expect(fetchCall[1].body).toBeInstanceOf(FormData);
    });

    it("should pass custom options to POST request", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
        json: vi.fn().mockResolvedValue({ success: true }),
      });

      await ApiClient.post(
        "/items",
        { data: "test" },
        {
          headers: { "X-Custom": "header" },
          timeout: 15000,
        }
      );

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toBe("/items");
      expect(fetchCall[1].method).toBe("POST");
      expect(fetchCall[1].headers["X-Custom"]).toBe("header");
    });
  });

  describe("put", () => {
    it("should make a PUT request with JSON body", async () => {
      const mockResponse = { success: true, data: { id: 1, updated: true } };
      const updateData = { name: "Updated Item" };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await ApiClient.put("/items/1", updateData);

      expect(result).toEqual(mockResponse);
      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toBe("/items/1");
      expect(fetchCall[1].method).toBe("PUT");
      expect(fetchCall[1].body).toBe(JSON.stringify(updateData));
    });

    it("should pass custom options to PUT request", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
        json: vi.fn().mockResolvedValue({ success: true }),
      });

      await ApiClient.put(
        "/items/1",
        { data: "test" },
        {
          headers: { "If-Match": "etag123" },
        }
      );

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toBe("/items/1");
      expect(fetchCall[1].method).toBe("PUT");
      expect(fetchCall[1].headers["If-Match"]).toBe("etag123");
    });
  });

  describe("delete", () => {
    it("should make a DELETE request", async () => {
      const mockResponse = { success: true };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await ApiClient.delete("/items/1");

      expect(result).toEqual(mockResponse);
      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toBe("/items/1");
      expect(fetchCall[1].method).toBe("DELETE");
    });

    it("should pass custom options to DELETE request", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
        json: vi.fn().mockResolvedValue({ success: true }),
      });

      await ApiClient.delete("/items/1", {
        headers: { Authorization: "Bearer token" },
      });

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toBe("/items/1");
      expect(fetchCall[1].method).toBe("DELETE");
      expect(fetchCall[1].headers.Authorization).toBe("Bearer token");
    });
  });

  describe("isOnline", () => {
    it("should return true when navigator.onLine is true", () => {
      Object.defineProperty(navigator, "onLine", {
        writable: true,
        value: true,
      });

      expect(ApiClient.isOnline()).toBe(true);
    });

    it("should return false when navigator.onLine is false", () => {
      Object.defineProperty(navigator, "onLine", {
        writable: true,
        value: false,
      });

      expect(ApiClient.isOnline()).toBe(false);
    });

    it("should return true when navigator is undefined", () => {
      const originalNavigator = global.navigator;
      try {
        // @ts-expect-error - Testing undefined navigator
        delete (global as any).navigator;

        expect(ApiClient.isOnline()).toBe(true);
      } finally {
        global.navigator = originalNavigator;
      }
    });
  });

  describe("healthCheck", () => {
    it("should return true when health check succeeds", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
        json: vi.fn().mockResolvedValue({ success: true }),
      });

      const result = await ApiClient.healthCheck();

      expect(result).toBe(true);
      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toBe("/api/health");
    });

    it("should return false when health check fails", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: "Service Unavailable",
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
        json: vi.fn().mockResolvedValue({ success: false }),
      });

      const result = await ApiClient.healthCheck();

      expect(result).toBe(false);
    });

    it("should return false when health check throws error", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const result = await ApiClient.healthCheck();

      expect(result).toBe(false);
    });
  });

  describe("combineAbortSignals", () => {
    it("should combine multiple abort signals", () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();

      // Use type assertion to access private method for testing
      const combined = (ApiClient as any).combineAbortSignals([
        controller1.signal,
        controller2.signal,
      ]);

      expect(combined).toBeInstanceOf(AbortSignal);
      expect(combined.aborted).toBe(false);
    });

    it("should abort combined signal when first signal aborts", () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();

      const combined = (ApiClient as any).combineAbortSignals([
        controller1.signal,
        controller2.signal,
      ]);

      controller1.abort();

      expect(combined.aborted).toBe(true);
    });

    it("should abort combined signal when second signal aborts", () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();

      const combined = (ApiClient as any).combineAbortSignals([
        controller1.signal,
        controller2.signal,
      ]);

      controller2.abort();

      expect(combined.aborted).toBe(true);
    });

    it("should handle pre-aborted signal", () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();
      controller1.abort(); // Pre-abort before combining

      const combined = (ApiClient as any).combineAbortSignals([
        controller1.signal,
        controller2.signal,
      ]);

      expect(combined.aborted).toBe(true);
    });

    it("should handle empty signals array", () => {
      const combined = (ApiClient as any).combineAbortSignals([]);

      expect(combined).toBeInstanceOf(AbortSignal);
      expect(combined.aborted).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle empty API_BASE_URL", async () => {
      import.meta.env.VITE_API_BASE_URL = "";

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
        json: vi.fn().mockResolvedValue({ success: true }),
      });

      await ApiClient.get("/test");

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toBe("/test");
    });

    it("should handle response with empty error", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
        json: vi.fn().mockResolvedValue({
          success: false,
          error: "",
        }),
      });

      const result = await ApiClient.get("/test");

      expect(result.success).toBe(false);
      expect(result.error).toContain("HTTP 500");
    });

    it("should handle non-Error object thrown", async () => {
      global.fetch = vi.fn().mockRejectedValue("String error");

      const result = await ApiClient.get("/test");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error");
    });

    it("should handle response with no error text", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
        headers: {
          get: vi.fn().mockReturnValue("text/plain"),
        },
        text: vi.fn().mockResolvedValue(""),
      });

      const result = await ApiClient.get("/test");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unknown error");
    });

    it("should handle custom AbortSignal", async () => {
      const controller = new AbortController();
      const mockResponse = { success: true };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      await ApiClient.request("/test", {
        method: "GET",
        signal: controller.signal,
      });

      expect(global.fetch).toHaveBeenCalled();
      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[1].signal).toBeInstanceOf(AbortSignal);
    });
  });
});
