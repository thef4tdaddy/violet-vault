import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getCurrentUserId,
  isOwnLock,
  isLockExpired,
  getLockExpiresDate,
  calculateTimeRemaining,
  logLockStateChange,
} from "../useEditLockHelpers";
import logger from "@/utils/common/logger";
import type { LockDocument } from "@/types/editLock";

// Mock logger
vi.mock("@/utils/common/logger", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("useEditLockHelpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCurrentUserId", () => {
    it("should return user id when id is present", () => {
      const user = { id: "user-123", budgetId: "budget-456", userName: "testuser" };
      expect(getCurrentUserId(user)).toBe("user-123");
    });

    it("should fallback to budgetId when id is not present", () => {
      const user = { budgetId: "budget-456", userName: "testuser" };
      expect(getCurrentUserId(user)).toBe("budget-456");
    });

    it("should fallback to sanitized userName when id and budgetId are not present", () => {
      const user = { userName: "Test User@123" };
      expect(getCurrentUserId(user)).toBe("user_test_user_123");
    });

    it("should convert userName to lowercase and replace special characters", () => {
      const user = { userName: "John-Doe!@#$%^&*()" };
      // Each special character is replaced with underscore
      expect(getCurrentUserId(user)).toBe("user_john_doe__________");
    });

    it("should return 'anonymous' when no user data is provided", () => {
      expect(getCurrentUserId(undefined)).toBe("anonymous");
      expect(getCurrentUserId({})).toBe("anonymous");
    });

    it("should return 'anonymous' when user has empty fields", () => {
      const user = { id: "", budgetId: "", userName: "" };
      expect(getCurrentUserId(user)).toBe("anonymous");
    });

    it("should handle userName with only special characters", () => {
      const user = { userName: "!@#$%^&*()" };
      // Each special character is replaced with underscore
      expect(getCurrentUserId(user)).toBe("user___________");
    });

    it("should handle userName with spaces", () => {
      const user = { userName: "Test  User  Name" };
      expect(getCurrentUserId(user)).toBe("user_test__user__name");
    });
  });

  describe("isOwnLock", () => {
    it("should return true when lock belongs to current user", () => {
      const lockDoc: LockDocument = {
        userId: "user-123",
        recordType: "envelope",
        recordId: "rec-123",
      };
      expect(isOwnLock(lockDoc, "user-123")).toBe(true);
    });

    it("should return false when lock belongs to different user", () => {
      const lockDoc: LockDocument = {
        userId: "user-456",
        recordType: "envelope",
        recordId: "rec-123",
      };
      expect(isOwnLock(lockDoc, "user-123")).toBe(false);
    });

    it("should return false when lock document is null", () => {
      expect(isOwnLock(null, "user-123")).toBe(false);
    });

    it("should return false when lockDoc userId is missing", () => {
      const lockDoc: LockDocument = {
        recordType: "envelope",
        recordId: "rec-123",
      };
      expect(isOwnLock(lockDoc, "user-123")).toBe(false);
    });

    it("should return false when currentUserId is empty", () => {
      const lockDoc: LockDocument = {
        userId: "user-123",
        recordType: "envelope",
        recordId: "rec-123",
      };
      expect(isOwnLock(lockDoc, "")).toBe(false);
    });

    it("should return false when both lockDoc and currentUserId are falsy", () => {
      expect(isOwnLock(null, "")).toBe(false);
    });

    it("should handle lockDoc with empty userId", () => {
      const lockDoc: LockDocument = {
        userId: "",
        recordType: "envelope",
        recordId: "rec-123",
      };
      expect(isOwnLock(lockDoc, "user-123")).toBe(false);
    });
  });

  describe("isLockExpired", () => {
    beforeEach(() => {
      // Use a fixed date for consistent testing
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return true for expired lock with Date object", () => {
      const lockDoc: LockDocument = {
        userId: "user-123",
        expiresAt: new Date("2024-01-15T11:00:00Z"), // 1 hour ago
      };
      expect(isLockExpired(lockDoc)).toBe(true);
    });

    it("should return false for non-expired lock with Date object", () => {
      const lockDoc: LockDocument = {
        userId: "user-123",
        expiresAt: new Date("2024-01-15T13:00:00Z"), // 1 hour from now
      };
      expect(isLockExpired(lockDoc)).toBe(false);
    });

    it("should return true for expired lock with number timestamp", () => {
      const lockDoc: LockDocument = {
        userId: "user-123",
        expiresAt: new Date("2024-01-15T11:00:00Z").getTime(),
      };
      expect(isLockExpired(lockDoc)).toBe(true);
    });

    it("should return false for non-expired lock with number timestamp", () => {
      const lockDoc: LockDocument = {
        userId: "user-123",
        expiresAt: new Date("2024-01-15T13:00:00Z").getTime(),
      };
      expect(isLockExpired(lockDoc)).toBe(false);
    });

    it("should return true for expired lock with string date", () => {
      const lockDoc: LockDocument = {
        userId: "user-123",
        expiresAt: "2024-01-15T11:00:00Z",
      };
      expect(isLockExpired(lockDoc)).toBe(true);
    });

    it("should return false for non-expired lock with string date", () => {
      const lockDoc: LockDocument = {
        userId: "user-123",
        expiresAt: "2024-01-15T13:00:00Z",
      };
      expect(isLockExpired(lockDoc)).toBe(false);
    });

    it("should handle Firestore Timestamp-like object (expired)", () => {
      const lockDoc: LockDocument = {
        userId: "user-123",
        expiresAt: {
          toDate: () => new Date("2024-01-15T11:00:00Z"),
        },
      };
      expect(isLockExpired(lockDoc)).toBe(true);
    });

    it("should handle Firestore Timestamp-like object (not expired)", () => {
      const lockDoc: LockDocument = {
        userId: "user-123",
        expiresAt: {
          toDate: () => new Date("2024-01-15T13:00:00Z"),
        },
      };
      expect(isLockExpired(lockDoc)).toBe(false);
    });

    it("should return false when lock is null", () => {
      expect(isLockExpired(null)).toBe(false);
    });

    it("should return false when expiresAt is missing", () => {
      const lockDoc: LockDocument = {
        userId: "user-123",
      };
      expect(isLockExpired(lockDoc)).toBe(false);
    });

    it("should return false when expiresAt is undefined", () => {
      const lockDoc: LockDocument = {
        userId: "user-123",
        expiresAt: undefined,
      };
      expect(isLockExpired(lockDoc)).toBe(false);
    });

    it("should handle lock expiring exactly now", () => {
      const lockDoc: LockDocument = {
        userId: "user-123",
        expiresAt: new Date("2024-01-15T12:00:00Z"), // exactly now
      };
      expect(isLockExpired(lockDoc)).toBe(true); // Should be expired (<=)
    });
  });

  describe("getLockExpiresDate", () => {
    it("should return Date object when passed a Date", () => {
      const date = new Date("2024-01-15T12:00:00Z");
      const result = getLockExpiresDate(date);
      expect(result).toEqual(date);
      expect(result).toBeInstanceOf(Date);
    });

    it("should convert number timestamp to Date", () => {
      const timestamp = new Date("2024-01-15T12:00:00Z").getTime();
      const result = getLockExpiresDate(timestamp);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBe(timestamp);
    });

    it("should convert string to Date", () => {
      const dateString = "2024-01-15T12:00:00Z";
      const result = getLockExpiresDate(dateString);
      expect(result).toBeInstanceOf(Date);
      // ISO string adds .000Z for milliseconds
      expect(result?.toISOString()).toBe("2024-01-15T12:00:00.000Z");
    });

    it("should handle Firestore Timestamp-like object with toDate method", () => {
      const expectedDate = new Date("2024-01-15T12:00:00Z");
      const firestoreTimestamp = {
        toDate: () => expectedDate,
      };
      const result = getLockExpiresDate(firestoreTimestamp);
      expect(result).toEqual(expectedDate);
    });

    it("should return undefined when input is undefined", () => {
      expect(getLockExpiresDate(undefined)).toBeUndefined();
    });

    it("should return undefined when input is null", () => {
      expect(getLockExpiresDate()).toBeUndefined();
    });

    it("should handle zero timestamp", () => {
      const result = getLockExpiresDate(0);
      // Zero is falsy, so it returns undefined
      expect(result).toBeUndefined();
    });

    it("should handle negative timestamp", () => {
      const result = getLockExpiresDate(-1000);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBe(-1000);
    });
  });

  describe("calculateTimeRemaining", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should calculate positive time remaining for future date", () => {
      const futureDate = new Date("2024-01-15T12:01:00Z"); // 1 minute from now
      const remaining = calculateTimeRemaining(futureDate);
      expect(remaining).toBe(60000); // 60 seconds in milliseconds
    });

    it("should return 0 for past dates", () => {
      const pastDate = new Date("2024-01-15T11:00:00Z"); // 1 hour ago
      const remaining = calculateTimeRemaining(pastDate);
      expect(remaining).toBe(0);
    });

    it("should return 0 for current time", () => {
      const currentDate = new Date("2024-01-15T12:00:00Z");
      const remaining = calculateTimeRemaining(currentDate);
      expect(remaining).toBe(0);
    });

    it("should handle number timestamp", () => {
      const futureTimestamp = new Date("2024-01-15T13:00:00Z").getTime(); // 1 hour from now
      const remaining = calculateTimeRemaining(futureTimestamp);
      expect(remaining).toBe(3600000); // 1 hour in milliseconds
    });

    it("should handle string date", () => {
      const futureDateString = "2024-01-15T12:30:00Z"; // 30 minutes from now
      const remaining = calculateTimeRemaining(futureDateString);
      expect(remaining).toBe(1800000); // 30 minutes in milliseconds
    });

    it("should handle Firestore Timestamp-like object", () => {
      const firestoreTimestamp = {
        toDate: () => new Date("2024-01-15T12:05:00Z"), // 5 minutes from now
      };
      const remaining = calculateTimeRemaining(firestoreTimestamp);
      expect(remaining).toBe(300000); // 5 minutes in milliseconds
    });

    it("should return 0 when input is undefined", () => {
      expect(calculateTimeRemaining(undefined)).toBe(0);
    });

    it("should return 0 when input is null", () => {
      expect(calculateTimeRemaining()).toBe(0);
    });

    it("should handle very large time remaining", () => {
      const farFuture = new Date("2025-01-15T12:00:00Z"); // 1 year from now
      const remaining = calculateTimeRemaining(farFuture);
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBe(farFuture.getTime() - Date.now());
    });

    it("should never return negative values", () => {
      const veryPastDate = new Date("2020-01-15T12:00:00Z");
      const remaining = calculateTimeRemaining(veryPastDate);
      expect(remaining).toBe(0);
      expect(remaining).toBeGreaterThanOrEqual(0);
    });
  });

  describe("logLockStateChange", () => {
    const currentUserId = "user-123";
    const recordType = "envelope";
    const recordId = "rec-123";

    it("should log lock state with complete lock data", () => {
      const lockDoc: LockDocument = {
        userId: "user-456",
        userName: "Other User",
        expiresAt: new Date("2024-01-15T13:00:00Z"),
        recordType: "envelope",
        recordId: "rec-123",
      };

      logLockStateChange(true, recordType, recordId, lockDoc, currentUserId);

      expect(logger.debug).toHaveBeenCalledWith("🔐 Lock state updated", {
        recordType,
        recordId,
        hasLock: true,
        lockUserId: "user-456",
        currentUserId,
        lockUserName: "Other User",
        lockExpiresAt: lockDoc.expiresAt,
        isOwnLock: false,
      });
    });

    it("should log lock state when lock is null", () => {
      logLockStateChange(false, recordType, recordId, null, currentUserId);

      expect(logger.debug).toHaveBeenCalledWith("🔐 Lock state updated", {
        recordType,
        recordId,
        hasLock: false,
        lockUserId: undefined,
        currentUserId,
        lockUserName: undefined,
        lockExpiresAt: undefined,
        isOwnLock: false,
      });
    });

    it("should log lock state when user owns the lock", () => {
      const lockDoc: LockDocument = {
        userId: currentUserId,
        userName: "Current User",
        expiresAt: new Date("2024-01-15T13:00:00Z"),
      };

      logLockStateChange(true, recordType, recordId, lockDoc, currentUserId);

      expect(logger.debug).toHaveBeenCalledWith("🔐 Lock state updated", {
        recordType,
        recordId,
        hasLock: true,
        lockUserId: currentUserId,
        currentUserId,
        lockUserName: "Current User",
        lockExpiresAt: lockDoc.expiresAt,
        isOwnLock: true,
      });
    });

    it("should log with minimal lock data", () => {
      const lockDoc: LockDocument = {
        userId: "user-789",
      };

      logLockStateChange(true, recordType, recordId, lockDoc, currentUserId);

      expect(logger.debug).toHaveBeenCalledWith("🔐 Lock state updated", {
        recordType,
        recordId,
        hasLock: true,
        lockUserId: "user-789",
        currentUserId,
        lockUserName: undefined,
        lockExpiresAt: undefined,
        isOwnLock: false,
      });
    });

    it("should log when lock state is false", () => {
      const lockDoc: LockDocument = {
        userId: "user-456",
        userName: "Other User",
      };

      logLockStateChange(false, recordType, recordId, lockDoc, currentUserId);

      expect(logger.debug).toHaveBeenCalledWith("🔐 Lock state updated", {
        recordType,
        recordId,
        hasLock: false,
        lockUserId: "user-456",
        currentUserId,
        lockUserName: "Other User",
        lockExpiresAt: undefined,
        isOwnLock: false,
      });
    });

    it("should call logger.debug exactly once", () => {
      const lockDoc: LockDocument = {
        userId: "user-456",
      };

      logLockStateChange(true, recordType, recordId, lockDoc, currentUserId);

      expect(logger.debug).toHaveBeenCalledTimes(1);
    });

    it("should handle empty strings in parameters", () => {
      logLockStateChange(false, "", "", null, "");

      expect(logger.debug).toHaveBeenCalledWith("🔐 Lock state updated", {
        recordType: "",
        recordId: "",
        hasLock: false,
        lockUserId: undefined,
        currentUserId: "",
        lockUserName: undefined,
        lockExpiresAt: undefined,
        isOwnLock: false,
      });
    });

    it("should handle Firestore Timestamp in expiresAt", () => {
      const lockDoc: LockDocument = {
        userId: "user-456",
        userName: "Test User",
        expiresAt: {
          toDate: () => new Date("2024-01-15T13:00:00Z"),
        },
      };

      logLockStateChange(true, recordType, recordId, lockDoc, currentUserId);

      expect(logger.debug).toHaveBeenCalledWith("🔐 Lock state updated", {
        recordType,
        recordId,
        hasLock: true,
        lockUserId: "user-456",
        currentUserId,
        lockUserName: "Test User",
        lockExpiresAt: lockDoc.expiresAt,
        isOwnLock: false,
      });
    });
  });
});
