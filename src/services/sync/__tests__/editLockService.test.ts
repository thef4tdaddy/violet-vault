import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { editLockService } from "../editLockService";
import { setDoc, deleteDoc, getDocs, onSnapshot } from "firebase/firestore";
import * as editLockHelpers from "@/utils/features/editLock/editLockHelpers";
import logger from "@/utils/core/common/logger";

// Mock Firebase
vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn((_db, _coll, id) => ({ id })),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn(() => vi.fn()),
  serverTimestamp: vi.fn(() => "mock-timestamp"),
}));

vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({ currentUser: { uid: "test-user-id" } })),
}));

// Mock logger
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock helpers
vi.mock("@/utils/features/editLock/editLockHelpers", () => ({
  validateLockPrerequisites: vi.fn(),
  createLockDocument: vi.fn(),
  handleExistingLock: vi.fn(),
  createExtendedLock: vi.fn(),
  handleLockError: vi.fn(),
}));

describe("EditLockService", () => {
  const mockBudgetId = "test-budget-id";
  const mockUser = { userId: "user-1", userName: "Test User", userColor: "#ffffff" };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    editLockService.cleanup();
    editLockService.initialize(mockBudgetId, mockUser);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initialize", () => {
    it("should set budgetId and currentUser", () => {
      editLockService.initialize("new-budget", { ...mockUser, userName: "New User" });
      expect(editLockService.budgetId).toBe("new-budget");
      expect(editLockService.currentUser?.userName).toBe("New User");
    });
  });

  describe("acquireLock", () => {
    it("should acquire a new lock successfully", async () => {
      vi.mocked(editLockHelpers.validateLockPrerequisites).mockReturnValue({ valid: true });
      vi.mocked(editLockHelpers.handleExistingLock).mockResolvedValue({ action: "acquire_new" });
      vi.mocked(editLockHelpers.createLockDocument).mockReturnValue({
        lockId: "type_id",
        userId: "user-1",
      } as any);

      const result = await editLockService.acquireLock("type", "id");

      expect(result.success).toBe(true);
      expect(setDoc).toHaveBeenCalled();
      expect(editLockService.locks.has("type_id")).toBe(true);
    });

    it("should handle validation failure", async () => {
      vi.mocked(editLockHelpers.validateLockPrerequisites).mockReturnValue({
        valid: false,
        reason: "not_authenticated",
      });

      const result = await editLockService.acquireLock("type", "id");

      expect(result.success).toBe(false);
      expect(result.reason).toBe("not_authenticated");
    });

    it("should handle blocked lock", async () => {
      vi.mocked(editLockHelpers.validateLockPrerequisites).mockReturnValue({ valid: true });
      vi.mocked(editLockHelpers.handleExistingLock).mockResolvedValue({
        action: "blocked",
        result: { success: false, reason: "locked_by_other" },
      });

      const result = await editLockService.acquireLock("type", "id");

      expect(result.success).toBe(false);
      expect(result.reason).toBe("locked_by_other");
    });

    it("should extend existing lock if owned by user", async () => {
      vi.mocked(editLockHelpers.validateLockPrerequisites).mockReturnValue({ valid: true });
      vi.mocked(editLockHelpers.handleExistingLock).mockResolvedValue({
        action: "extend_existing",
      });
      vi.mocked(editLockHelpers.createExtendedLock).mockReturnValue({
        lockId: "type_id",
        extended: true,
        userId: "user-1",
      } as any);

      const result = await editLockService.acquireLock("type", "id");

      expect(result.success).toBe(true);
      expect(result.reason).toBe("extended_existing");
      expect(editLockService.locks.get("type_id")).toMatchObject({ extended: true });
    });

    it("should handle errors using handleLockError", async () => {
      vi.mocked(editLockHelpers.validateLockPrerequisites).mockReturnValue({ valid: true });
      vi.mocked(editLockHelpers.handleExistingLock).mockRejectedValue(new Error("Firebase Error"));
      vi.mocked(editLockHelpers.handleLockError).mockReturnValue({
        success: true,
        reason: "locks_disabled",
      } as any);

      const result = await editLockService.acquireLock("type", "id");

      expect(result.success).toBe(true);
      expect(result.reason).toBe("locks_disabled");
    });
  });

  describe("releaseLock", () => {
    it("should release lock successfully", async () => {
      editLockService.locks.set("type_id", { lockId: "type_id" } as any);
      const result = await editLockService.releaseLock("type", "id");
      expect(result.success).toBe(true);
      expect(deleteDoc).toHaveBeenCalled();
      expect(editLockService.locks.has("type_id")).toBe(false);
    });

    it("should handle permission denied gracefully", async () => {
      vi.mocked(deleteDoc).mockRejectedValue({ code: "permission-denied" });
      const result = await editLockService.releaseLock("type", "id");
      expect(result.success).toBe(true); // Graceful degradation
      expect(editLockService.locks.has("type_id")).toBe(false);
    });

    it("should handle other release errors", async () => {
      vi.mocked(deleteDoc).mockRejectedValue(new Error("Hard failure"));
      const result = await editLockService.releaseLock("type", "id");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Hard failure");
    });
  });

  describe("getLock", () => {
    it("should return found lock", async () => {
      vi.mocked(getDocs).mockResolvedValue({
        empty: false,
        docs: [{ id: "mock-id", data: () => ({ recordType: "type" }) }],
      } as any);

      const lock = await editLockService.getLock("type", "id");
      expect(lock).toMatchObject({ id: "mock-id", recordType: "type" });
    });

    it("should return null if no lock found", async () => {
      vi.mocked(getDocs).mockResolvedValue({ empty: true } as any);
      const lock = await editLockService.getLock("type", "id");
      expect(lock).toBeNull();
    });

    it("should handle permission denied gracefully", async () => {
      vi.mocked(getDocs).mockRejectedValue({ code: "permission-denied" });
      const lock = await editLockService.getLock("type", "id");
      expect(lock).toBeNull();
    });
  });

  describe("watchLock", () => {
    it("should set up a listener", () => {
      const mockCallback = vi.fn();
      editLockService.watchLock("type", "id", mockCallback);

      expect(onSnapshot).toHaveBeenCalled();
      expect(editLockService.lockListeners.has("type_id")).toBe(true);

      // Trigger callback manually via mock call
      const onSnapshotCall = vi.mocked(onSnapshot).mock.calls[0];
      const snapshotCallback = onSnapshotCall[1] as any;

      snapshotCallback({
        docs: [{ id: "mock-id", data: () => ({ recordType: "type" }) }],
      });

      expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining({ id: "mock-id" }));
    });
  });

  describe("heartbeat", () => {
    it("should start and stop heartbeat correctly", async () => {
      editLockService.locks.set("type_id", { lockId: "type_id" } as any);
      editLockService.startHeartbeat("type_id");

      expect(editLockService.heartbeatIntervals.has("type_id")).toBe(true);

      // Advance time and wait for async callback
      vi.advanceTimersByTime(5000);
      await vi.waitFor(() => expect(setDoc).toHaveBeenCalled());

      editLockService.stopHeartbeat("type_id");
      expect(editLockService.heartbeatIntervals.has("type_id")).toBe(false);
    });

    it("should handle heartbeat failure", async () => {
      vi.mocked(setDoc).mockRejectedValue(new Error("Heartbeat failed"));
      editLockService.startHeartbeat("type_id");

      vi.advanceTimersByTime(5000);

      // Should stop heartbeat on failure
      await vi.waitFor(() => expect(editLockService.heartbeatIntervals.has("type_id")).toBe(false));
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("ownsLock", () => {
    it("should return true if user owns the lock", () => {
      editLockService.locks.set("type_id", { userId: "user-1" } as any);
      expect(editLockService.ownsLock("type", "id")).toBe(true);
    });

    it("should return false if someone else owns the lock", () => {
      editLockService.locks.set("type_id", { userId: "other" } as any);
      expect(editLockService.ownsLock("type", "id")).toBe(false);
    });
  });

  describe("cleanup", () => {
    it("should clear everything", () => {
      editLockService.locks.set("type_id", {
        userId: "user-1",
        recordType: "type",
        recordId: "id",
      } as any);
      const mockUnsubscribe = vi.fn();
      editLockService.lockListeners.set("type_id", mockUnsubscribe);
      editLockService.heartbeatIntervals.set(
        "type_id",
        setInterval(() => {}, 1000)
      );

      editLockService.cleanup();

      expect(editLockService.locks.size).toBe(0);
      expect(editLockService.lockListeners.size).toBe(0);
      expect(editLockService.heartbeatIntervals.size).toBe(0);
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });
});
