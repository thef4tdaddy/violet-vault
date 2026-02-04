/**
 * useAuditTrail Hook Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useAuditTrail } from "../useAuditTrail";
import { auditTrailService } from "@/services/privacy/auditTrailService";

describe("useAuditTrail", () => {
  beforeEach(async () => {
    await auditTrailService.clearLogs();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should load logs on mount", async () => {
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
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.logs).toHaveLength(1);
    expect(result.current.count).toBe(1);
  });

  it("should provide clearLogs function", async () => {
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
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.clearLogs();
    });

    await waitFor(() => expect(result.current.logs).toHaveLength(0));
  });

  it("should provide exportLogs function", async () => {
    const mockLink = { href: "", download: "", click: vi.fn() };
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tagName, options) => {
      if (tagName === "a") return mockLink as unknown as HTMLAnchorElement;
      return originalCreateElement(tagName, options);
    });
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

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
    await waitFor(() => expect(result.current.logs?.length).toBe(1));

    await act(async () => {
      await result.current.exportLogs();
    });

    expect(mockLink.click).toHaveBeenCalled();
  });

  it("should throw and log error in exportLogs if service fails", async () => {
    vi.spyOn(auditTrailService, "downloadCSV").mockRejectedValueOnce(new Error("Export failed"));
    const { result } = renderHook(() => useAuditTrail());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await expect(result.current.exportLogs()).rejects.toThrow("Export failed");
  });

  it("should handle errors gracefully during load", async () => {
    vi.spyOn(auditTrailService, "getLogs").mockRejectedValueOnce(new Error("Test error"));
    const { result } = renderHook(() => useAuditTrail());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.logs).toEqual([]);
  });

  it("should clean up on unmount", async () => {
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");
    const clearIntervalSpy = vi.spyOn(window, "clearInterval");
    const { unmount } = renderHook(() => useAuditTrail());
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it("should handle visibility changes", async () => {
    const getLogsSpy = vi.spyOn(auditTrailService, "getLogs");
    renderHook(() => useAuditTrail());
    await waitFor(() => expect(getLogsSpy).toHaveBeenCalled());
    getLogsSpy.mockClear();

    // 1. Visible -> Should refresh
    Object.defineProperty(document, "hidden", { value: false, writable: true, configurable: true });
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await waitFor(() => expect(getLogsSpy).toHaveBeenCalled());
    getLogsSpy.mockClear();

    // 2. Hidden -> Should NOT refresh
    Object.defineProperty(document, "hidden", { value: true, writable: true, configurable: true });
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(getLogsSpy).not.toHaveBeenCalled();

    // Reset document.hidden
    Object.defineProperty(document, "hidden", { value: false, writable: true, configurable: true });
  });

  it("should handle auto-refresh on interval", async () => {
    const getLogsSpy = vi.spyOn(auditTrailService, "getLogs");
    const setIntervalSpy = vi.spyOn(window, "setInterval");

    renderHook(() => useAuditTrail());

    // Wait for mount load
    await waitFor(() => expect(getLogsSpy).toHaveBeenCalled());
    getLogsSpy.mockClear();

    // Wait for setInterval to be called
    await waitFor(() => expect(setIntervalSpy).toHaveBeenCalled());

    const callback = setIntervalSpy.mock.calls[0][0] as Function;

    // Trigger it
    await act(async () => {
      await callback();
    });

    expect(getLogsSpy).toHaveBeenCalled();
  });

  it("should not start interval if document is hidden", async () => {
    Object.defineProperty(document, "hidden", { value: true, writable: true, configurable: true });
    const setIntervalSpy = vi.spyOn(window, "setInterval");

    renderHook(() => useAuditTrail());

    expect(setIntervalSpy).not.toHaveBeenCalled();
    Object.defineProperty(document, "hidden", { value: false, writable: true, configurable: true });
  });
});
