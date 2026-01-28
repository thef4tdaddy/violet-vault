import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOfflineReceiptQueue } from "../useOfflineReceiptQueue";
import { waitFor } from "@testing-library/react";
import useToast from "@/hooks/platform/ux/useToast";

// Mock dependencies
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();

vi.mock("@/hooks/platform/ux/useToast", () => ({
  default: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
  }),
}));

vi.mock("@/utils/core/common/sentry", () => ({
  captureError: vi.fn(),
}));

// Mock DB using vi.hoisted to allow access in tests and mock factory
const { mockDb } = vi.hoisted(() => {
  const store = {
    uploads: [] as any[],
  };

  // Helper to ensure 'this' context works for chaining
  const uploadsMock = {
    add: vi.fn().mockImplementation(async (item) => {
      store.uploads.push(item);
      return item.id;
    }),
    where: vi.fn().mockReturnThis(),
    equals: vi.fn().mockReturnThis(),
    count: vi.fn().mockImplementation(async () => store.uploads.length),
    toArray: vi.fn().mockImplementation(async () => [...store.uploads]),
    delete: vi.fn().mockImplementation(async (id) => {
      const index = store.uploads.findIndex((i) => i.id === id);
      if (index > -1) store.uploads.splice(index, 1);
    }),
    update: vi.fn().mockImplementation(async (id, changes) => {
      const item = store.uploads.find((i) => i.id === id);
      if (item) Object.assign(item, changes);
    }),
    get: vi.fn().mockImplementation(async (id) => store.uploads.find((i) => i.id === id)),
    clear: vi.fn().mockImplementation(async () => {
      store.uploads.length = 0;
    }),
    // Helper to reset store
    _reset: () => {
      store.uploads.length = 0;
    },
  };

  return {
    mockDb: {
      uploads: uploadsMock,
    },
  };
});

vi.mock("@/db/offlineReceiptsDB", () => ({
  db: mockDb,
}));

describe("useOfflineReceiptQueue", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockDb.uploads._reset();

    // Mock crypto.randomUUID
    Object.defineProperty(global, "crypto", {
      value: {
        randomUUID: () => "test-uuid",
      },
      writable: true,
    });

    // Default offline to prevent auto-syncs
    Object.defineProperty(navigator, "onLine", {
      value: false,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should start with count 0", async () => {
    const { result } = renderHook(() => useOfflineReceiptQueue(vi.fn()));
    // Initial render triggers updateCount
    await waitFor(() => expect(mockDb.uploads.count).toHaveBeenCalled());
    expect(result.current.pendingCount).toBe(0);
  });

  it("should add file to queue and update count", async () => {
    // Start offline (default)
    const { result } = renderHook(() => useOfflineReceiptQueue(vi.fn()));
    const file = new File(["test"], "receipt.jpg", { type: "image/jpeg" });

    await act(async () => {
      await result.current.addToQueue(file);
    });

    // Verify DB interaction via side effects (count updated)
    await waitFor(() => expect(result.current.pendingCount).toBe(1));

    expect(mockShowSuccess).toHaveBeenCalledWith("Saved Offline", expect.any(String));
  });

  it("should process queue when retry is called or network recovers", async () => {
    const onUploadMock = vi.fn().mockResolvedValue(true);

    // Seed DB before rendering hook so initial updateCount discovers it
    await mockDb.uploads.add({
      id: "test-id",
      file: new Blob(["test"], { type: "image/jpeg" }),
      filename: "receipt.jpg",
      status: "pending",
      retryCount: 0,
    });

    const { result } = renderHook(() => useOfflineReceiptQueue(onUploadMock));

    // Wait for initial updateCount to discover the item
    await waitFor(() => expect(result.current.pendingCount).toBe(1), { timeout: 5000 });

    // Go Online to trigger auto-sync
    Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
    await act(async () => {
      window.dispatchEvent(new Event("online"));
    });

    // Wait for the sync to happen
    await waitFor(() => expect(onUploadMock).toHaveBeenCalled(), { timeout: 5000 });

    // After success, item is deleted
    expect(mockDb.uploads.delete).toHaveBeenCalledWith("test-id");
    expect(mockShowSuccess).toHaveBeenCalledWith("Sync Complete", expect.any(String));
  });

  it("should handle upload failure during sync", async () => {
    const onUploadMock = vi.fn().mockRejectedValue(new Error("Upload failed"));
    const { result } = renderHook(() => useOfflineReceiptQueue(onUploadMock));

    // Wait for initial updateCount to complete
    await waitFor(() => expect(mockDb.uploads.count).toHaveBeenCalled());

    // Seed DB
    await mockDb.uploads.add({
      id: "fail-id",
      file: new Blob(["test"], { type: "image/jpeg" }),
      filename: "fail.jpg",
      status: "pending",
      retryCount: 0,
    });

    // Wait for the hook to discover the item
    await waitFor(() => expect(result.current.pendingCount).toBe(1), { timeout: 5000 });

    // Go Online to trigger auto-sync
    Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
    await act(async () => {
      window.dispatchEvent(new Event("online"));
    });

    await waitFor(() => expect(onUploadMock).toHaveBeenCalled(), { timeout: 5000 });

    // Verify update called
    expect(mockDb.uploads.update).toHaveBeenCalledWith("fail-id", {
      retryCount: 1,
    });

    expect(mockShowError).toHaveBeenCalledWith("Sync Incomplete", expect.any(String));
  });
});
