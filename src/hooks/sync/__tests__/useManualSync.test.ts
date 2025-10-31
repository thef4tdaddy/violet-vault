import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useManualSync } from "../useManualSync";

// Mock cloudSyncService
vi.mock("@/services/cloudSyncService", () => ({
  cloudSyncService: {
    isRunning: true,
    forceSync: vi.fn(),
    getStatus: vi.fn(() => ({
      isRunning: true,
      lastSyncTime: null,
    })),
  },
}));

// Mock queryKeys
vi.mock("@/utils/common/queryClient", () => ({
  queryKeys: {
    envelopes: "envelopes",
    transactions: "transactions",
    bills: "bills",
    debts: "debts",
    budgetMetadata: "budgetMetadata",
    budgetHistory: "budgetHistory",
  },
}));

// Mock logger
vi.mock("@/utils/common/logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useManualSync", () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;
  let mockCloudSyncService: { isRunning: boolean; forceSync: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);

    const cloudSync = await import("@/services/cloudSyncService");
    mockCloudSyncService = cloudSync.cloudSyncService as {
      isRunning: boolean;
      forceSync: ReturnType<typeof vi.fn>;
    };
    mockCloudSyncService.isRunning = true;
    mockCloudSyncService.forceSync.mockResolvedValue({
      success: true,
      direction: "upload",
      counts: { envelopes: 5, transactions: 10 },
    });
  });

  it("should initialize with correct default state", () => {
    const { result } = renderHook(() => useManualSync(), { wrapper });

    expect(result.current.isUploadingSyncInProgress).toBe(false);
    expect(result.current.isDownloadingSyncInProgress).toBe(false);
    expect(result.current.isSyncInProgress).toBe(false);
    expect(result.current.lastSyncTime).toBeNull();
    expect(result.current.syncError).toBeNull();
  });

  it("should provide sync operation functions", () => {
    const { result } = renderHook(() => useManualSync(), { wrapper });

    expect(typeof result.current.forceUploadSync).toBe("function");
    expect(typeof result.current.forceDownloadSync).toBe("function");
    expect(typeof result.current.forceFullSync).toBe("function");
  });

  it("should provide utility functions", () => {
    const { result } = renderHook(() => useManualSync(), { wrapper });

    expect(typeof result.current.getSyncStatus).toBe("function");
    expect(typeof result.current.clearSyncError).toBe("function");
  });

  it("should successfully complete upload sync", async () => {
    const { result } = renderHook(() => useManualSync(), { wrapper });

    let syncResult;
    await act(async () => {
      syncResult = await result.current.forceUploadSync();
    });

    expect(syncResult).toEqual({
      success: true,
      direction: "upload",
      counts: { envelopes: 5, transactions: 10 },
      message: "Local changes uploaded to cloud successfully",
    });
    expect(result.current.lastSyncTime).toBeInstanceOf(Date);
    expect(result.current.syncError).toBeNull();
  });

  it("should set isUploadingSyncInProgress during upload", async () => {
    const { result } = renderHook(() => useManualSync(), { wrapper });

    mockCloudSyncService.forceSync.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                success: true,
                direction: "upload",
                counts: {},
              }),
            100
          );
        })
    );

    let syncPromise;
    act(() => {
      syncPromise = result.current.forceUploadSync();
    });

    // Should be in progress
    expect(result.current.isUploadingSyncInProgress).toBe(true);
    expect(result.current.isSyncInProgress).toBe(true);

    await act(async () => {
      await syncPromise;
    });

    // Should be complete
    expect(result.current.isUploadingSyncInProgress).toBe(false);
    expect(result.current.isSyncInProgress).toBe(false);
  });

  it("should handle upload sync error", async () => {
    const { result } = renderHook(() => useManualSync(), { wrapper });

    mockCloudSyncService.forceSync.mockResolvedValue({
      success: false,
      error: "Upload failed",
    });

    let syncResult;
    await act(async () => {
      syncResult = await result.current.forceUploadSync();
    });

    expect(syncResult).toEqual({
      success: false,
      error: "Upload failed",
    });
    expect(result.current.syncError).toBe("Upload failed");
    expect(result.current.lastSyncTime).toBeNull();
  });

  it("should prevent concurrent upload syncs", async () => {
    const { result } = renderHook(() => useManualSync(), { wrapper });

    let resolveSync: ((value: unknown) => void) | null = null;
    mockCloudSyncService.forceSync.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSync = resolve;
        })
    );

    let firstSync: Promise<unknown>;
    let secondSync: Promise<unknown>;

    // Start first sync
    await act(async () => {
      firstSync = result.current.forceUploadSync();
      // Wait a tick to let the first sync start
      await Promise.resolve();
    });

    // Try to start second sync while first is in progress
    await act(async () => {
      secondSync = result.current.forceUploadSync();
    });

    const secondResult = await secondSync;

    expect(secondResult).toEqual({
      success: false,
      error: "Sync already in progress",
    });

    // Complete first sync
    act(() => {
      if (resolveSync) {
        resolveSync({ success: true, direction: "upload", counts: {} });
      }
    });

    await act(async () => {
      await firstSync;
    });
  });

  it("should successfully complete download sync", async () => {
    const { result } = renderHook(() => useManualSync(), { wrapper });

    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");
    const refetchQueriesSpy = vi.spyOn(queryClient, "refetchQueries");

    let syncResult;
    await act(async () => {
      syncResult = await result.current.forceDownloadSync();
    });

    expect(syncResult).toEqual({
      success: true,
      direction: "upload",
      counts: { envelopes: 5, transactions: 10 },
      message: "Remote changes downloaded and applied successfully",
    });
    expect(result.current.lastSyncTime).toBeInstanceOf(Date);
    expect(invalidateQueriesSpy).toHaveBeenCalled();
    // refetchQueries is called for each query key - might be more than 6 with observers
    expect(refetchQueriesSpy.mock.calls.length).toBeGreaterThanOrEqual(6);
  });

  it("should set isDownloadingSyncInProgress during download", async () => {
    const { result } = renderHook(() => useManualSync(), { wrapper });

    mockCloudSyncService.forceSync.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                success: true,
                direction: "download",
                counts: {},
              }),
            100
          );
        })
    );

    let syncPromise;
    act(() => {
      syncPromise = result.current.forceDownloadSync();
    });

    // Should be in progress
    expect(result.current.isDownloadingSyncInProgress).toBe(true);
    expect(result.current.isSyncInProgress).toBe(true);

    await act(async () => {
      await syncPromise;
    });

    // Should be complete
    expect(result.current.isDownloadingSyncInProgress).toBe(false);
    expect(result.current.isSyncInProgress).toBe(false);
  });

  it("should handle service not running error", async () => {
    const { result } = renderHook(() => useManualSync(), { wrapper });

    mockCloudSyncService.isRunning = false;

    let syncResult;
    await act(async () => {
      syncResult = await result.current.forceUploadSync();
    });

    expect(syncResult?.success).toBe(false);
    expect(syncResult?.error).toContain("Cloud sync service is not running");
    expect(result.current.syncError).toContain("Cloud sync service is not running");
  });

  it("should clear sync error", async () => {
    const { result } = renderHook(() => useManualSync(), { wrapper });

    // Set up error mock
    mockCloudSyncService.forceSync.mockRejectedValue(new Error("Test error"));

    // Try a sync to generate error
    await act(async () => {
      await result.current.forceUploadSync();
    });

    // Verify error was set
    expect(result.current.syncError).toBe("Test error");

    // Clear the error
    act(() => {
      result.current.clearSyncError();
    });

    expect(result.current.syncError).toBeNull();
  });

  it("should return sync status", () => {
    const { result } = renderHook(() => useManualSync(), { wrapper });

    const status = result.current.getSyncStatus();

    expect(status).toHaveProperty("isServiceRunning");
    expect(status).toHaveProperty("serviceStatus");
    expect(status).toHaveProperty("isUploadingSyncInProgress");
    expect(status).toHaveProperty("isDownloadingSyncInProgress");
    expect(status).toHaveProperty("lastSyncTime");
    expect(status).toHaveProperty("syncError");
  });

  it("should successfully complete full sync", async () => {
    const { result } = renderHook(() => useManualSync(), { wrapper });

    let syncResult;
    await act(async () => {
      syncResult = await result.current.forceFullSync();
    });

    expect(syncResult?.success).toBe(true);
    expect(mockCloudSyncService.forceSync).toHaveBeenCalled();
  });

  it("should handle sync errors gracefully", async () => {
    const { result } = renderHook(() => useManualSync(), { wrapper });

    mockCloudSyncService.forceSync.mockRejectedValue(new Error("Network error"));

    let syncResult;
    await act(async () => {
      syncResult = await result.current.forceUploadSync();
    });

    expect(syncResult).toEqual({
      success: false,
      error: "Network error",
    });
    expect(result.current.syncError).toBe("Network error");
  });

  it("should maintain stable function references", () => {
    const { result, rerender } = renderHook(() => useManualSync(), { wrapper });

    const firstUpload = result.current.forceUploadSync;
    const firstDownload = result.current.forceDownloadSync;
    const firstFull = result.current.forceFullSync;

    rerender();

    expect(result.current.forceUploadSync).toBe(firstUpload);
    expect(result.current.forceDownloadSync).toBe(firstDownload);
    expect(result.current.forceFullSync).toBe(firstFull);
  });
});
