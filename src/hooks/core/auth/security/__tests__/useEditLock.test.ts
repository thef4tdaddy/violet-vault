import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import useEditLock from "../useEditLock";
import { editLockService } from "@/services/sync/editLockService";
import useToast from "@/hooks/platform/ux/useToast";
import logger from "@/utils/common/logger";
import * as helpers from "../useEditLockHelpers";
import type { LockDocument } from "@/types/editLock";

// Mock dependencies
vi.mock("@/services/sync/editLockService");
vi.mock("@/hooks/platform/ux/useToast");
vi.mock("@/utils/common/logger");
vi.mock("../useEditLockHelpers");

describe("useEditLock", () => {
  let mockAddToast: ReturnType<typeof vi.fn>;
  let mockWatchLock: ReturnType<typeof vi.fn>;
  let mockAcquireLock: ReturnType<typeof vi.fn>;
  let mockReleaseLock: ReturnType<typeof vi.fn>;

  const mockLockDoc: LockDocument = {
    id: "lock-123",
    recordType: "envelope",
    recordId: "rec-123",
    budgetId: "budget-123",
    userId: "user-123",
    userName: "Test User",
    acquiredAt: new Date().getTime(),
    expiresAt: new Date(Date.now() + 60000).getTime(),
    lastActivity: new Date().getTime(),
    lockId: "envelope_rec-123",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useToast
    mockAddToast = vi.fn();
    (useToast as ReturnType<typeof vi.fn>).mockReturnValue({
      addToast: mockAddToast,
    });

    // Mock editLockService
    mockWatchLock = vi.fn((_, __, callback) => {
      // Initially no lock
      callback(null);
      return vi.fn(); // unsubscribe function
    });
    mockAcquireLock = vi.fn().mockResolvedValue({ success: true });
    mockReleaseLock = vi.fn().mockResolvedValue({ success: true });

    (
      editLockService as unknown as {
        watchLock: ReturnType<typeof vi.fn>;
        acquireLock: ReturnType<typeof vi.fn>;
        releaseLock: ReturnType<typeof vi.fn>;
        currentUser?: { id?: string; budgetId?: string; userName?: string };
      }
    ).watchLock = mockWatchLock;
    (
      editLockService as unknown as {
        watchLock: ReturnType<typeof vi.fn>;
        acquireLock: ReturnType<typeof vi.fn>;
        releaseLock: ReturnType<typeof vi.fn>;
      }
    ).acquireLock = mockAcquireLock;
    (
      editLockService as unknown as {
        watchLock: ReturnType<typeof vi.fn>;
        acquireLock: ReturnType<typeof vi.fn>;
        releaseLock: ReturnType<typeof vi.fn>;
      }
    ).releaseLock = mockReleaseLock;

    // Mock logger
    (logger.debug as ReturnType<typeof vi.fn>) = vi.fn();
    (logger.info as ReturnType<typeof vi.fn>) = vi.fn();
    (logger.error as ReturnType<typeof vi.fn>) = vi.fn();

    // Mock helpers
    (helpers.getCurrentUserId as ReturnType<typeof vi.fn>) = vi.fn().mockReturnValue("user-123");
    (helpers.isOwnLock as ReturnType<typeof vi.fn>) = vi.fn().mockReturnValue(false);
    (helpers.isLockExpired as ReturnType<typeof vi.fn>) = vi.fn().mockReturnValue(false);
    (helpers.getLockExpiresDate as ReturnType<typeof vi.fn>) = vi
      .fn()
      .mockReturnValue(new Date(Date.now() + 60000));
    (helpers.calculateTimeRemaining as ReturnType<typeof vi.fn>) = vi.fn().mockReturnValue(60000);
    (helpers.logLockStateChange as ReturnType<typeof vi.fn>) = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize with default state", () => {
      const { result } = renderHook(() => useEditLock("envelope", "rec-123"));

      expect(result.current.lock).toBeNull();
      expect(result.current.isLocked).toBe(false);
      expect(result.current.isOwnLock).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.canEdit).toBe(true);
      expect(result.current.lockedBy).toBeUndefined();
    });

    it("should not watch lock when recordType is null", () => {
      renderHook(() => useEditLock(null, "rec-123"));

      expect(mockWatchLock).not.toHaveBeenCalled();
    });

    it("should not watch lock when recordId is null", () => {
      renderHook(() => useEditLock("envelope", null));

      expect(mockWatchLock).not.toHaveBeenCalled();
    });

    it("should watch lock when both recordType and recordId are provided", () => {
      renderHook(() => useEditLock("envelope", "rec-123"));

      expect(mockWatchLock).toHaveBeenCalledWith("envelope", "rec-123", expect.any(Function));
    });

    it("should unsubscribe from lock watch on unmount", () => {
      const unsubscribe = vi.fn();
      mockWatchLock.mockReturnValue(unsubscribe);

      const { unmount } = renderHook(() => useEditLock("envelope", "rec-123"));

      unmount();

      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  describe("Lock State Updates", () => {
    it("should update state when lock is acquired by another user", () => {
      let lockCallback: ((lock: LockDocument | null) => void) | undefined;
      mockWatchLock.mockImplementation((_, __, callback) => {
        lockCallback = callback;
        callback(null);
        return vi.fn();
      });

      const { result } = renderHook(() => useEditLock("envelope", "rec-123"));

      expect(result.current.isLocked).toBe(false);

      // Simulate lock acquired by another user
      act(() => {
        lockCallback?.(mockLockDoc);
      });

      expect(result.current.lock).toEqual(mockLockDoc);
      expect(result.current.isLocked).toBe(true);
      expect(helpers.isOwnLock).toHaveBeenCalledWith(mockLockDoc, "user-123");
    });

    it("should update state when lock is released", () => {
      let lockCallback: ((lock: LockDocument | null) => void) | undefined;
      mockWatchLock.mockImplementation((_, __, callback) => {
        lockCallback = callback;
        callback(mockLockDoc);
        return vi.fn();
      });

      const { result } = renderHook(() => useEditLock("envelope", "rec-123"));

      expect(result.current.isLocked).toBe(true);

      // Simulate lock released
      act(() => {
        lockCallback?.(null);
      });

      expect(result.current.lock).toBeNull();
      expect(result.current.isLocked).toBe(false);
    });

    it("should identify own lock correctly", () => {
      (helpers.isOwnLock as ReturnType<typeof vi.fn>).mockReturnValue(true);

      let lockCallback: ((lock: LockDocument | null) => void) | undefined;
      mockWatchLock.mockImplementation((_, __, callback) => {
        lockCallback = callback;
        callback(null);
        return vi.fn();
      });

      const { result } = renderHook(() => useEditLock("envelope", "rec-123"));

      act(() => {
        lockCallback?.(mockLockDoc);
      });

      expect(result.current.isOwnLock).toBe(true);
      expect(result.current.canEdit).toBe(true);
    });
  });

  describe("acquireLock", () => {
    it("should successfully acquire lock", async () => {
      const { result } = renderHook(() => useEditLock("envelope", "rec-123"));

      let acquireResult;
      await act(async () => {
        acquireResult = await result.current.acquireLock();
      });

      expect(acquireResult).toEqual({ success: true });
      expect(mockAcquireLock).toHaveBeenCalledWith("envelope", "rec-123");
      expect(mockAddToast).toHaveBeenCalledWith({
        type: "success",
        title: "Edit Lock Acquired",
        message: "You now have exclusive editing access to this envelope.",
        duration: 3000,
      });
    });

    it("should not acquire lock when recordType is null", async () => {
      const { result } = renderHook(() => useEditLock(null, "rec-123"));

      let acquireResult;
      await act(async () => {
        acquireResult = await result.current.acquireLock();
      });

      expect(acquireResult).toEqual({ success: false });
      expect(mockAcquireLock).not.toHaveBeenCalled();
    });

    it("should not acquire lock when recordId is null", async () => {
      const { result } = renderHook(() => useEditLock("envelope", null));

      let acquireResult;
      await act(async () => {
        acquireResult = await result.current.acquireLock();
      });

      expect(acquireResult).toEqual({ success: false });
      expect(mockAcquireLock).not.toHaveBeenCalled();
    });

    it("should handle lock failure with locked_by_other reason", async () => {
      mockAcquireLock.mockResolvedValue({
        success: false,
        reason: "locked_by_other",
        expiresAt: new Date(Date.now() + 30000).getTime(),
        lockedBy: "Another User",
      });

      const { result } = renderHook(() => useEditLock("envelope", "rec-123"));

      await act(async () => {
        await result.current.acquireLock();
      });

      expect(mockAddToast).toHaveBeenCalledWith({
        type: "warning",
        title: "Currently Being Edited",
        message: expect.stringContaining("Another User is editing this envelope"),
        duration: 5000,
      });
    });

    it("should set loading state during acquisition", async () => {
      let resolveAcquire: ((value: { success: boolean }) => void) | undefined;
      mockAcquireLock.mockReturnValue(
        new Promise((resolve) => {
          resolveAcquire = resolve;
        })
      );

      const { result } = renderHook(() => useEditLock("envelope", "rec-123"));

      act(() => {
        result.current.acquireLock();
      });

      // Should be loading
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Complete the acquisition
      await act(async () => {
        resolveAcquire?.({ success: true });
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isLoading).toBe(false);
    });

    it("should not show toast when showToasts is false", async () => {
      const { result } = renderHook(() =>
        useEditLock("envelope", "rec-123", { showToasts: false })
      );

      await act(async () => {
        await result.current.acquireLock();
      });

      expect(mockAddToast).not.toHaveBeenCalled();
    });
  });

  describe("releaseLock", () => {
    it("should successfully release lock", async () => {
      const { result } = renderHook(() => useEditLock("envelope", "rec-123"));

      let releaseResult;
      await act(async () => {
        releaseResult = await result.current.releaseLock();
      });

      expect(releaseResult).toEqual({ success: true });
      expect(mockReleaseLock).toHaveBeenCalledWith("envelope", "rec-123");
      expect(mockAddToast).toHaveBeenCalledWith({
        type: "info",
        title: "Edit Lock Released",
        message: "Other users can now edit this envelope.",
        duration: 2000,
      });
    });

    it("should not release lock when recordType is null", async () => {
      const { result } = renderHook(() => useEditLock(null, "rec-123"));

      let releaseResult;
      await act(async () => {
        releaseResult = await result.current.releaseLock();
      });

      expect(releaseResult).toEqual({ success: false });
      expect(mockReleaseLock).not.toHaveBeenCalled();
    });

    it("should not release lock when recordId is null", async () => {
      const { result } = renderHook(() => useEditLock("envelope", null));

      let releaseResult;
      await act(async () => {
        releaseResult = await result.current.releaseLock();
      });

      expect(releaseResult).toEqual({ success: false });
      expect(mockReleaseLock).not.toHaveBeenCalled();
    });

    it("should not show toast when showToasts is false", async () => {
      const { result } = renderHook(() =>
        useEditLock("envelope", "rec-123", { showToasts: false })
      );

      await act(async () => {
        await result.current.releaseLock();
      });

      expect(mockReleaseLock).toHaveBeenCalledWith("envelope", "rec-123");
      expect(mockAddToast).not.toHaveBeenCalled();
    });
  });

  describe("breakLock", () => {
    it("should break expired lock", async () => {
      (helpers.isLockExpired as ReturnType<typeof vi.fn>).mockReturnValue(true);

      let lockCallback: ((lock: LockDocument | null) => void) | undefined;
      mockWatchLock.mockImplementation((_, __, callback) => {
        lockCallback = callback;
        callback(mockLockDoc);
        return vi.fn();
      });

      const { result } = renderHook(() => useEditLock("envelope", "rec-123"));

      let breakResult;
      await act(async () => {
        breakResult = await result.current.breakLock();
      });

      expect(breakResult).toEqual({ success: true });
      expect(mockReleaseLock).toHaveBeenCalledWith("envelope", "rec-123");
      expect(mockAddToast).toHaveBeenCalledWith({
        type: "info",
        title: "Lock Broken",
        message: "Expired lock removed. You can now acquire the lock.",
        duration: 3000,
      });
    });

    it("should not break lock when no lock exists", async () => {
      const { result } = renderHook(() => useEditLock("envelope", "rec-123"));

      let breakResult;
      await act(async () => {
        breakResult = await result.current.breakLock();
      });

      expect(breakResult).toEqual({ success: false });
      expect(mockReleaseLock).not.toHaveBeenCalled();
    });

    it("should not break own lock", async () => {
      (helpers.isOwnLock as ReturnType<typeof vi.fn>).mockReturnValue(true);

      let lockCallback: ((lock: LockDocument | null) => void) | undefined;
      mockWatchLock.mockImplementation((_, __, callback) => {
        lockCallback = callback;
        callback(mockLockDoc);
        return vi.fn();
      });

      const { result } = renderHook(() => useEditLock("envelope", "rec-123"));

      let breakResult;
      await act(async () => {
        breakResult = await result.current.breakLock();
      });

      expect(breakResult).toEqual({ success: false });
      expect(mockReleaseLock).not.toHaveBeenCalled();
    });

    it("should not break lock when not expired", async () => {
      (helpers.isLockExpired as ReturnType<typeof vi.fn>).mockReturnValue(false);

      let lockCallback: ((lock: LockDocument | null) => void) | undefined;
      mockWatchLock.mockImplementation((_, __, callback) => {
        lockCallback = callback;
        callback(mockLockDoc);
        return vi.fn();
      });

      const { result } = renderHook(() => useEditLock("envelope", "rec-123"));

      let breakResult;
      await act(async () => {
        breakResult = await result.current.breakLock();
      });

      expect(breakResult).toEqual({ success: false, reason: "not_expired" });
      expect(mockReleaseLock).not.toHaveBeenCalled();
      expect(mockAddToast).toHaveBeenCalledWith({
        type: "warning",
        title: "Lock Still Active",
        message: "Cannot break lock - it hasn't expired yet.",
        duration: 3000,
      });
    });

    it("should not break lock when recordType is null", async () => {
      const { result } = renderHook(() => useEditLock(null, "rec-123"));

      let breakResult;
      await act(async () => {
        breakResult = await result.current.breakLock();
      });

      expect(breakResult).toEqual({ success: false });
      expect(mockReleaseLock).not.toHaveBeenCalled();
    });

    it("should not break lock when recordId is null", async () => {
      const { result } = renderHook(() => useEditLock("envelope", null));

      let breakResult;
      await act(async () => {
        breakResult = await result.current.breakLock();
      });

      expect(breakResult).toEqual({ success: false });
      expect(mockReleaseLock).not.toHaveBeenCalled();
    });

    it("should not show toast when showToasts is false", async () => {
      (helpers.isLockExpired as ReturnType<typeof vi.fn>).mockReturnValue(true);

      let lockCallback: ((lock: LockDocument | null) => void) | undefined;
      mockWatchLock.mockImplementation((_, __, callback) => {
        lockCallback = callback;
        callback(mockLockDoc);
        return vi.fn();
      });

      const { result } = renderHook(() =>
        useEditLock("envelope", "rec-123", { showToasts: false })
      );

      await act(async () => {
        await result.current.breakLock();
      });

      expect(mockReleaseLock).toHaveBeenCalledWith("envelope", "rec-123");
      expect(mockAddToast).not.toHaveBeenCalled();
    });
  });

  describe("Auto-acquire behavior", () => {
    it("should auto-acquire lock when autoAcquire is true", async () => {
      renderHook(() => useEditLock("envelope", "rec-123", { autoAcquire: true }));

      await waitFor(() => {
        expect(mockAcquireLock).toHaveBeenCalledWith("envelope", "rec-123");
      });
    });

    it("should not auto-acquire when autoAcquire is false", async () => {
      renderHook(() => useEditLock("envelope", "rec-123", { autoAcquire: false }));

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockAcquireLock).not.toHaveBeenCalled();
    });

    it("should not auto-acquire when recordType is null", async () => {
      renderHook(() => useEditLock(null, "rec-123", { autoAcquire: true }));

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockAcquireLock).not.toHaveBeenCalled();
    });

    it("should not auto-acquire when recordId is null", async () => {
      renderHook(() => useEditLock("envelope", null, { autoAcquire: true }));

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockAcquireLock).not.toHaveBeenCalled();
    });
  });

  describe("Auto-release behavior", () => {
    it("should auto-release lock on unmount when autoRelease is true", () => {
      (helpers.isOwnLock as ReturnType<typeof vi.fn>).mockReturnValue(true);

      let lockCallback: ((lock: LockDocument | null) => void) | undefined;
      mockWatchLock.mockImplementation((_, __, callback) => {
        lockCallback = callback;
        callback(mockLockDoc);
        return vi.fn();
      });

      const { unmount } = renderHook(() =>
        useEditLock("envelope", "rec-123", { autoRelease: true })
      );

      unmount();

      expect(mockReleaseLock).toHaveBeenCalledWith("envelope", "rec-123");
    });

    it("should not auto-release lock on unmount when autoRelease is false", () => {
      (helpers.isOwnLock as ReturnType<typeof vi.fn>).mockReturnValue(true);

      let lockCallback: ((lock: LockDocument | null) => void) | undefined;
      mockWatchLock.mockImplementation((_, __, callback) => {
        lockCallback = callback;
        callback(mockLockDoc);
        return vi.fn();
      });

      const { unmount } = renderHook(() =>
        useEditLock("envelope", "rec-123", { autoRelease: false })
      );

      unmount();

      expect(mockReleaseLock).not.toHaveBeenCalled();
    });

    it("should not auto-release lock if not own lock", () => {
      (helpers.isOwnLock as ReturnType<typeof vi.fn>).mockReturnValue(false);

      let lockCallback: ((lock: LockDocument | null) => void) | undefined;
      mockWatchLock.mockImplementation((_, __, callback) => {
        lockCallback = callback;
        callback(mockLockDoc);
        return vi.fn();
      });

      const { unmount } = renderHook(() =>
        useEditLock("envelope", "rec-123", { autoRelease: true })
      );

      unmount();

      expect(mockReleaseLock).not.toHaveBeenCalled();
    });
  });

  describe("Computed values", () => {
    it("should compute canEdit as true when not locked", () => {
      const { result } = renderHook(() => useEditLock("envelope", "rec-123"));

      expect(result.current.canEdit).toBe(true);
    });

    it("should compute canEdit as false when locked by another user", () => {
      (helpers.isOwnLock as ReturnType<typeof vi.fn>).mockReturnValue(false);

      let lockCallback: ((lock: LockDocument | null) => void) | undefined;
      mockWatchLock.mockImplementation((_, __, callback) => {
        lockCallback = callback;
        callback(null);
        return vi.fn();
      });

      const { result } = renderHook(() => useEditLock("envelope", "rec-123"));

      act(() => {
        lockCallback?.(mockLockDoc);
      });

      expect(result.current.canEdit).toBe(false);
    });

    it("should compute canEdit as true when locked by current user", () => {
      (helpers.isOwnLock as ReturnType<typeof vi.fn>).mockReturnValue(true);

      let lockCallback: ((lock: LockDocument | null) => void) | undefined;
      mockWatchLock.mockImplementation((_, __, callback) => {
        lockCallback = callback;
        callback(null);
        return vi.fn();
      });

      const { result } = renderHook(() => useEditLock("envelope", "rec-123"));

      act(() => {
        lockCallback?.(mockLockDoc);
      });

      expect(result.current.canEdit).toBe(true);
    });

    it("should return lockedBy userName", () => {
      let lockCallback: ((lock: LockDocument | null) => void) | undefined;
      mockWatchLock.mockImplementation((_, __, callback) => {
        lockCallback = callback;
        callback(null);
        return vi.fn();
      });

      const { result } = renderHook(() => useEditLock("envelope", "rec-123"));

      act(() => {
        lockCallback?.(mockLockDoc);
      });

      expect(result.current.lockedBy).toBe("Test User");
    });

    it("should return expiresAt date", () => {
      const mockDate = new Date(Date.now() + 60000);
      (helpers.getLockExpiresDate as ReturnType<typeof vi.fn>).mockReturnValue(mockDate);

      let lockCallback: ((lock: LockDocument | null) => void) | undefined;
      mockWatchLock.mockImplementation((_, __, callback) => {
        lockCallback = callback;
        callback(null);
        return vi.fn();
      });

      const { result } = renderHook(() => useEditLock("envelope", "rec-123"));

      act(() => {
        lockCallback?.(mockLockDoc);
      });

      expect(result.current.expiresAt).toEqual(mockDate);
      expect(helpers.getLockExpiresDate).toHaveBeenCalledWith(mockLockDoc.expiresAt);
    });

    it("should return timeRemaining", () => {
      (helpers.calculateTimeRemaining as ReturnType<typeof vi.fn>).mockReturnValue(45000);

      let lockCallback: ((lock: LockDocument | null) => void) | undefined;
      mockWatchLock.mockImplementation((_, __, callback) => {
        lockCallback = callback;
        callback(null);
        return vi.fn();
      });

      const { result } = renderHook(() => useEditLock("envelope", "rec-123"));

      act(() => {
        lockCallback?.(mockLockDoc);
      });

      expect(result.current.timeRemaining).toBe(45000);
      expect(helpers.calculateTimeRemaining).toHaveBeenCalledWith(mockLockDoc.expiresAt);
    });

    it("should return isExpired status", () => {
      (helpers.isLockExpired as ReturnType<typeof vi.fn>).mockReturnValue(true);

      let lockCallback: ((lock: LockDocument | null) => void) | undefined;
      mockWatchLock.mockImplementation((_, __, callback) => {
        lockCallback = callback;
        callback(null);
        return vi.fn();
      });

      const { result } = renderHook(() => useEditLock("envelope", "rec-123"));

      act(() => {
        lockCallback?.(mockLockDoc);
      });

      expect(result.current.isExpired).toBe(true);
      expect(helpers.isLockExpired).toHaveBeenCalledWith(mockLockDoc);
    });
  });

  describe("Edge cases", () => {
    it("should handle changing recordType and recordId", () => {
      const unsubscribe1 = vi.fn();
      const unsubscribe2 = vi.fn();
      let callCount = 0;
      mockWatchLock.mockImplementation(() => {
        callCount++;
        return callCount === 1 ? unsubscribe1 : unsubscribe2;
      });

      const { rerender } = renderHook(
        ({ recordType, recordId }) => useEditLock(recordType, recordId),
        {
          initialProps: { recordType: "envelope", recordId: "rec-123" },
        }
      );

      expect(mockWatchLock).toHaveBeenCalledWith("envelope", "rec-123", expect.any(Function));

      // Change recordId
      rerender({ recordType: "envelope", recordId: "rec-456" });

      expect(unsubscribe1).toHaveBeenCalled();
      expect(mockWatchLock).toHaveBeenCalledWith("envelope", "rec-456", expect.any(Function));
    });

    it("should handle null to non-null transition", () => {
      const { rerender } = renderHook(
        ({ recordType, recordId }) => useEditLock(recordType, recordId),
        {
          initialProps: { recordType: null as string | null, recordId: "rec-123" },
        }
      );

      expect(mockWatchLock).not.toHaveBeenCalled();

      // Transition to non-null
      rerender({ recordType: "envelope", recordId: "rec-123" });

      expect(mockWatchLock).toHaveBeenCalledWith("envelope", "rec-123", expect.any(Function));
    });

    it("should handle acquire lock with missing expiresAt in error response", async () => {
      mockAcquireLock.mockResolvedValue({
        success: false,
        reason: "locked_by_other",
        // No expiresAt or lockedBy
      });

      const { result } = renderHook(() => useEditLock("envelope", "rec-123"));

      await act(async () => {
        await result.current.acquireLock();
      });

      expect(mockAddToast).toHaveBeenCalledWith({
        type: "warning",
        title: "Currently Being Edited",
        message: expect.stringContaining("Another user is editing this envelope"),
        duration: 5000,
      });
    });

    it("should handle acquire lock failure with non-locked_by_other reason", async () => {
      mockAcquireLock.mockResolvedValue({
        success: false,
        reason: "some_other_reason",
      });

      const { result } = renderHook(() => useEditLock("envelope", "rec-123"));

      await act(async () => {
        await result.current.acquireLock();
      });

      // Should not show toast for other failure reasons
      expect(mockAddToast).not.toHaveBeenCalled();
    });
  });
});
