import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import useEditLock from "../useEditLock";
import type { LockDocument } from "@/types/editLock";

// Mock the editLockService
vi.mock("@/services/sync/editLockService", () => ({
  editLockService: {
    watchLock: vi.fn(),
    acquireLock: vi.fn(),
    releaseLock: vi.fn(),
    currentUser: { id: "user-123", userName: "Test User" },
  },
}));

// Import the mocked service after mocking
const { editLockService } = await import("@/services/sync/editLockService");

// Mock useToast hook
const mockAddToast = vi.fn();
vi.mock("../useToast", () => ({
  default: () => ({
    addToast: mockAddToast,
  }),
}));

// Mock logger
vi.mock("@/utils/common/logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("useEditLock", () => {
  const mockRecordType = "envelope";
  const mockRecordId = "env-123";
  const mockLockDoc: LockDocument = {
    id: "lock-123",
    recordType: mockRecordType,
    recordId: mockRecordId,
    userId: "user-123",
    userName: "Test User",
    budgetId: "budget-123",
    expiresAt: new Date(Date.now() + 60000),
    acquiredAt: new Date(),
    lastActivity: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementations
    vi.mocked(editLockService.watchLock).mockImplementation((_recordType, _recordId, callback) => {
      callback(null);
      return vi.fn();
    });
    vi.mocked(editLockService.acquireLock).mockResolvedValue({ success: true });
    vi.mocked(editLockService.releaseLock).mockResolvedValue({ success: true });
  });

  describe("initialization", () => {
    it("should initialize with default values when no lock exists", () => {
      const { result } = renderHook(() => useEditLock(mockRecordType, mockRecordId));

      expect(result.current.lock).toBeNull();
      expect(result.current.isLocked).toBe(false);
      expect(result.current.isOwnLock).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.canEdit).toBe(true);
      expect(result.current.lockedBy).toBeUndefined();
      expect(result.current.isExpired).toBe(false);
    });

    it("should not watch for locks when recordType is null", () => {
      renderHook(() => useEditLock(null, mockRecordId));
      expect(editLockService.watchLock).not.toHaveBeenCalled();
    });

    it("should not watch for locks when recordId is null", () => {
      renderHook(() => useEditLock(mockRecordType, null));
      expect(editLockService.watchLock).not.toHaveBeenCalled();
    });

    it("should watch for lock changes when recordType and recordId are provided", () => {
      renderHook(() => useEditLock(mockRecordType, mockRecordId));
      expect(editLockService.watchLock).toHaveBeenCalledWith(
        mockRecordType,
        mockRecordId,
        expect.any(Function)
      );
    });
  });

  describe("acquireLock", () => {
    it("should successfully acquire a lock", async () => {
      vi.mocked(editLockService.acquireLock).mockResolvedValue({
        success: true,
        lockDoc: mockLockDoc,
      });

      const { result } = renderHook(() => useEditLock(mockRecordType, mockRecordId));

      let acquireResult;
      await act(async () => {
        acquireResult = await result.current.acquireLock();
      });

      expect(editLockService.acquireLock).toHaveBeenCalledWith(mockRecordType, mockRecordId);
      expect(acquireResult).toEqual({ success: true, lockDoc: mockLockDoc });
      expect(mockAddToast).toHaveBeenCalledWith({
        type: "success",
        title: "Edit Lock Acquired",
        message: expect.stringContaining(mockRecordType),
        duration: 3000,
      });
    });

    it("should handle lock acquisition failure when locked by another user", async () => {
      vi.mocked(editLockService.acquireLock).mockResolvedValue({
        success: false,
        reason: "locked_by_other",
        expiresAt: new Date(Date.now() + 30000),
        lockedBy: "Other User",
      });

      const { result } = renderHook(() => useEditLock(mockRecordType, mockRecordId));

      let acquireResult;
      await act(async () => {
        acquireResult = await result.current.acquireLock();
      });

      expect(acquireResult).toMatchObject({
        success: false,
        reason: "locked_by_other",
      });
      expect(mockAddToast).toHaveBeenCalledWith({
        type: "warning",
        title: "Currently Being Edited",
        message: expect.stringContaining("Other User"),
        duration: 5000,
      });
    });

    it("should not acquire lock when recordType is null", async () => {
      const { result } = renderHook(() => useEditLock(null, mockRecordId));

      let acquireResult;
      await act(async () => {
        acquireResult = await result.current.acquireLock();
      });

      expect(acquireResult).toEqual({ success: false });
      expect(editLockService.acquireLock).not.toHaveBeenCalled();
    });

    it("should not acquire lock when recordId is null", async () => {
      const { result } = renderHook(() => useEditLock(mockRecordType, null));

      let acquireResult;
      await act(async () => {
        acquireResult = await result.current.acquireLock();
      });

      expect(acquireResult).toEqual({ success: false });
      expect(editLockService.acquireLock).not.toHaveBeenCalled();
    });

    it("should not show toast when showToasts is false", async () => {
      vi.mocked(editLockService.acquireLock).mockResolvedValue({
        success: true,
        lockDoc: mockLockDoc,
      });

      const { result } = renderHook(() =>
        useEditLock(mockRecordType, mockRecordId, { showToasts: false })
      );

      await act(async () => {
        await result.current.acquireLock();
      });

      expect(mockAddToast).not.toHaveBeenCalled();
    });
  });

  describe("autoAcquire option", () => {
    it("should not automatically acquire lock when autoAcquire is false", async () => {
      renderHook(() => useEditLock(mockRecordType, mockRecordId, { autoAcquire: false }));

      // Wait a bit to ensure acquireLock is not called
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(editLockService.acquireLock).not.toHaveBeenCalled();
    });

    it("should not auto-acquire when recordType is null", async () => {
      renderHook(() => useEditLock(null, mockRecordId, { autoAcquire: true }));

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(editLockService.acquireLock).not.toHaveBeenCalled();
    });

    it("should not auto-acquire when recordId is null", async () => {
      renderHook(() => useEditLock(mockRecordType, null, { autoAcquire: true }));

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(editLockService.acquireLock).not.toHaveBeenCalled();
    });
  });

  describe("releaseLock", () => {
    it("should successfully release a lock", async () => {
      vi.mocked(editLockService.releaseLock).mockResolvedValue({ success: true });

      const { result } = renderHook(() => useEditLock(mockRecordType, mockRecordId));

      let releaseResult;
      await act(async () => {
        releaseResult = await result.current.releaseLock();
      });

      expect(editLockService.releaseLock).toHaveBeenCalledWith(mockRecordType, mockRecordId);
      expect(releaseResult).toEqual({ success: true });
      expect(mockAddToast).toHaveBeenCalledWith({
        type: "info",
        title: "Edit Lock Released",
        message: expect.stringContaining(mockRecordType),
        duration: 2000,
      });
    });

    it("should not release lock when recordType is null", async () => {
      const { result } = renderHook(() => useEditLock(null, mockRecordId));

      let releaseResult;
      await act(async () => {
        releaseResult = await result.current.releaseLock();
      });

      expect(releaseResult).toEqual({ success: false });
      expect(editLockService.releaseLock).not.toHaveBeenCalled();
    });

    it("should not release lock when recordId is null", async () => {
      const { result } = renderHook(() => useEditLock(mockRecordType, null));

      let releaseResult;
      await act(async () => {
        releaseResult = await result.current.releaseLock();
      });

      expect(releaseResult).toEqual({ success: false });
      expect(editLockService.releaseLock).not.toHaveBeenCalled();
    });
  });

  describe("breakLock", () => {
    it("should not break lock when no lock exists", async () => {
      const { result } = renderHook(() => useEditLock(mockRecordType, mockRecordId));

      let breakResult;
      await act(async () => {
        breakResult = await result.current.breakLock();
      });

      expect(breakResult).toEqual({ success: false });
      expect(editLockService.releaseLock).not.toHaveBeenCalled();
    });

    it("should not break lock when recordType is null", async () => {
      const { result } = renderHook(() => useEditLock(null, mockRecordId));

      let breakResult;
      await act(async () => {
        breakResult = await result.current.breakLock();
      });

      expect(breakResult).toEqual({ success: false });
      expect(editLockService.releaseLock).not.toHaveBeenCalled();
    });

    it("should not break lock when recordId is null", async () => {
      const { result } = renderHook(() => useEditLock(mockRecordType, null));

      let breakResult;
      await act(async () => {
        breakResult = await result.current.breakLock();
      });

      expect(breakResult).toEqual({ success: false });
      expect(editLockService.releaseLock).not.toHaveBeenCalled();
    });
  });

  describe("callback stability", () => {
    it("should maintain stable references for acquireLock", () => {
      const { result, rerender } = renderHook(() => useEditLock(mockRecordType, mockRecordId));

      const firstReference = result.current.acquireLock;
      rerender();
      const secondReference = result.current.acquireLock;

      expect(firstReference).toBe(secondReference);
    });

    it("should maintain stable references for releaseLock", () => {
      const { result, rerender } = renderHook(() => useEditLock(mockRecordType, mockRecordId));

      const firstReference = result.current.releaseLock;
      rerender();
      const secondReference = result.current.releaseLock;

      expect(firstReference).toBe(secondReference);
    });

    it("should maintain stable references for breakLock", () => {
      const { result, rerender } = renderHook(() => useEditLock(mockRecordType, mockRecordId));

      const firstReference = result.current.breakLock;
      rerender();
      const secondReference = result.current.breakLock;

      expect(firstReference).toBe(secondReference);
    });
  });
});
