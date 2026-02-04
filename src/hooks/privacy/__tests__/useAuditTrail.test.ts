/**
 * useAuditTrail Hook Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAuditTrail } from "../useAuditTrail";
import { auditTrailService } from "@/services/privacy/auditTrailService";

// Mock fake-indexeddb for testing

describe("useAuditTrail", () => {
  beforeEach(async () => {
    // Clear logs before each test
    await auditTrailService.clearLogs();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should load logs on mount", async () => {
    // Add some test logs
    await auditTrailService.logApiCall({
      timestamp: Date.now(),
      endpoint: "/api/test",
      method: "POST",
      encryptedPayloadSize: 100,
      responseTimeMs: 10,
      success: true,
      encrypted: true,
    });

    const { result } = renderHook(() => useAuditTrail());

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for logs to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.logs).toHaveLength(1);
    expect(result.current.logs[0].endpoint).toBe("/api/test");
    expect(result.current.count).toBe(1);
  });

  it("should provide clearLogs function", async () => {
    // Add a test log
    await auditTrailService.logApiCall({
      timestamp: Date.now(),
      endpoint: "/api/test",
      method: "POST",
      encryptedPayloadSize: 100,
      responseTimeMs: 10,
      success: true,
      encrypted: true,
    });

    const { result } = renderHook(() => useAuditTrail());

    await waitFor(() => {
      expect(result.current.logs).toHaveLength(1);
    });

    // Clear logs
    await result.current.clearLogs();

    await waitFor(() => {
      expect(result.current.logs).toHaveLength(0);
    });
  });

  it("should provide exportLogs function", async () => {
    // Mock document.createElement and click
    const mockLink = {
      href: "",
      download: "",
      click: vi.fn(),
    };
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tagName, options) => {
      if (tagName === "a") {
        return mockLink as unknown as HTMLAnchorElement;
      }
      return originalCreateElement(tagName, options);
    });
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    // Add a test log
    await auditTrailService.logApiCall({
      timestamp: Date.now(),
      endpoint: "/api/test",
      method: "POST",
      encryptedPayloadSize: 100,
      responseTimeMs: 10,
      success: true,
      encrypted: true,
    });

    const { result } = renderHook(() => useAuditTrail());

    await waitFor(() => {
      expect(result.current.logs?.length).toBe(1);
    });

    // Export logs
    await result.current.exportLogs();

    expect(mockLink.click).toHaveBeenCalled();
    expect(mockLink.download).toContain("analytics-audit-log");
  });

  it("should provide refresh function", async () => {
    const { result } = renderHook(() => useAuditTrail());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.logs).toHaveLength(0);

    // Add a log after hook initialization
    await auditTrailService.logApiCall({
      timestamp: Date.now(),
      endpoint: "/api/test",
      method: "POST",
      encryptedPayloadSize: 100,
      responseTimeMs: 10,
      success: true,
      encrypted: true,
    });

    // Manually refresh
    await result.current.refresh();

    await waitFor(() => {
      expect(result.current.logs).toHaveLength(1);
    });
  });

  it("should handle errors gracefully", async () => {
    // Mock getLogs to throw an error
    vi.spyOn(auditTrailService, "getLogs").mockRejectedValueOnce(new Error("Test error"));

    const { result } = renderHook(() => useAuditTrail());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should return empty array on error
    expect(result.current.logs).toEqual([]);
    expect(result.current.count).toBe(0);
  });
});
