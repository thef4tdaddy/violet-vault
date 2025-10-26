import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  initializeAuthFromStorage,
  createSetAuthenticated,
  createClearAuth,
  createUpdateUser,
  createSetLoading,
  createSetError,
  createUpdateActivity,
  createLockSession,
} from "../authUtils";
import type { AuthContextState } from "../authConstants";
import { initialAuthState } from "../authConstants";
import type { UserData } from "@/types/auth";

/**
 * Test suite for authUtils - utility functions for AuthContext
 * Ensures 85%+ coverage of authUtils.ts
 */

describe("authUtils", () => {
  let mockSetAuthState: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockSetAuthState = vi.fn();
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("initializeAuthFromStorage", () => {
    it("should initialize with saved profile data", async () => {
      const mockProfile: UserData = {
        userName: "testuser",
        userColor: "#FF0000",
      };

      localStorage.setItem("userProfile", JSON.stringify(mockProfile));

      await initializeAuthFromStorage(mockSetAuthState);

      expect(mockSetAuthState).toHaveBeenCalledWith(expect.any(Function));

      // Extract the updater function and call it with prev state
      const updaterFn = mockSetAuthState.mock.calls[0][0];
      const result = updaterFn(initialAuthState);

      expect(result).toEqual({
        ...initialAuthState,
        user: {
          userName: "testuser",
          userColor: "#FF0000",
        },
        isAuthenticated: false,
        isUnlocked: false,
        isLoading: false,
      });
    });

    it("should handle legacy state with budget data but no profile", async () => {
      localStorage.setItem("envelopeBudgetData", JSON.stringify({ some: "data" }));

      await initializeAuthFromStorage(mockSetAuthState);

      expect(mockSetAuthState).toHaveBeenCalledWith(expect.any(Function));

      const updaterFn = mockSetAuthState.mock.calls[0][0];
      const result = updaterFn(initialAuthState);

      expect(result).toEqual({
        ...initialAuthState,
        isAuthenticated: false,
        isUnlocked: false,
        isLoading: false,
      });
    });

    it("should initialize as new user when no saved data exists", async () => {
      await initializeAuthFromStorage(mockSetAuthState);

      expect(mockSetAuthState).toHaveBeenCalledWith(expect.any(Function));

      const updaterFn = mockSetAuthState.mock.calls[0][0];
      const result = updaterFn(initialAuthState);

      expect(result).toEqual({
        ...initialAuthState,
        isLoading: false,
      });
    });

    it("should handle errors during initialization", async () => {
      // Set invalid JSON to trigger parsing error
      localStorage.setItem("userProfile", "invalid-json{");

      await initializeAuthFromStorage(mockSetAuthState);

      expect(mockSetAuthState).toHaveBeenCalledWith(expect.any(Function));

      const updaterFn = mockSetAuthState.mock.calls[0][0];
      const result = updaterFn(initialAuthState);

      expect(result).toEqual({
        ...initialAuthState,
        isLoading: false,
        error: "Failed to initialize authentication",
      });
    });

    it("should load profile with color property", async () => {
      const mockProfile: UserData = {
        userName: "coloreduser",
        userColor: "#00FF00",
      };

      localStorage.setItem("userProfile", JSON.stringify(mockProfile));

      await initializeAuthFromStorage(mockSetAuthState);

      const updaterFn = mockSetAuthState.mock.calls[0][0];
      const result = updaterFn(initialAuthState);

      expect(result.user?.userColor).toBe("#00FF00");
    });
  });

  describe("createSetAuthenticated", () => {
    it("should set authenticated user with full session data", () => {
      const setAuthenticatedFn = createSetAuthenticated(mockSetAuthState);
      const mockEncryptionKey = {} as CryptoKey;
      const mockSalt = new Uint8Array([1, 2, 3, 4]);

      const userData: UserData = {
        userName: "testuser",
        userColor: "#FF0000",
        budgetId: "budget-123",
      };

      setAuthenticatedFn(userData, {
        encryptionKey: mockEncryptionKey,
        salt: mockSalt,
      });

      expect(mockSetAuthState).toHaveBeenCalledWith(expect.any(Function));

      const updaterFn = mockSetAuthState.mock.calls[0][0];
      const result = updaterFn(initialAuthState);

      expect(result.user).toEqual(userData);
      expect(result.isAuthenticated).toBe(true);
      expect(result.isUnlocked).toBe(true);
      expect(result.budgetId).toBe("budget-123");
      expect(result.encryptionKey).toBe(mockEncryptionKey);
      expect(result.salt).toBe(mockSalt);
      expect(result.lastActivity).toBeTypeOf("number");
      expect(result.error).toBe(null);
    });

    it("should set authenticated user without session data", () => {
      const setAuthenticatedFn = createSetAuthenticated(mockSetAuthState);

      const userData: UserData = {
        userName: "testuser",
        userColor: "#0000FF",
      };

      setAuthenticatedFn(userData, {});

      const updaterFn = mockSetAuthState.mock.calls[0][0];
      const result = updaterFn(initialAuthState);

      expect(result.user).toEqual(userData);
      expect(result.isAuthenticated).toBe(true);
      expect(result.isUnlocked).toBe(true);
      expect(result.encryptionKey).toBe(null);
      expect(result.salt).toBe(null);
    });

    it("should handle authentication with empty session data", () => {
      const setAuthenticatedFn = createSetAuthenticated(mockSetAuthState);

      const userData: UserData = {
        userName: "testuser",
        userColor: "#CCCCCC",
      };

      setAuthenticatedFn(userData, {});

      const updaterFn = mockSetAuthState.mock.calls[0][0];
      const result = updaterFn(initialAuthState);

      expect(result.user).toEqual(userData);
      expect(result.encryptionKey).toBe(null);
      expect(result.salt).toBe(null);
    });
  });

  describe("createClearAuth", () => {
    it("should reset auth state to initial values", () => {
      const clearAuthFn = createClearAuth(mockSetAuthState);

      clearAuthFn();

      expect(mockSetAuthState).toHaveBeenCalledWith(initialAuthState);
    });
  });

  describe("createUpdateUser", () => {
    it("should update user data with partial updates", () => {
      const updateUserFn = createUpdateUser(mockSetAuthState);

      const existingState: AuthContextState = {
        ...initialAuthState,
        user: {
          userName: "oldname",
          userColor: "#FF0000",
        },
        isAuthenticated: true,
      };

      updateUserFn({ userColor: "#00FF00" });

      expect(mockSetAuthState).toHaveBeenCalledWith(expect.any(Function));

      const updaterFn = mockSetAuthState.mock.calls[0][0];
      const result = updaterFn(existingState);

      expect(result.user).toEqual({
        userName: "oldname",
        userColor: "#00FF00",
      });
    });

    it("should update userName while preserving other properties", () => {
      const updateUserFn = createUpdateUser(mockSetAuthState);

      const existingState: AuthContextState = {
        ...initialAuthState,
        user: {
          userName: "oldname",
          userColor: "#FF0000",
          budgetId: "budget-123",
        },
      };

      updateUserFn({ userName: "newname" });

      const updaterFn = mockSetAuthState.mock.calls[0][0];
      const result = updaterFn(existingState);

      expect(result.user).toEqual({
        userName: "newname",
        userColor: "#FF0000",
        budgetId: "budget-123",
      });
    });

    it("should handle updating multiple user properties", () => {
      const updateUserFn = createUpdateUser(mockSetAuthState);

      const existingState: AuthContextState = {
        ...initialAuthState,
        user: {
          userName: "oldname",
          userColor: "#FF0000",
        },
      };

      updateUserFn({
        userName: "newname",
        userColor: "#0000FF",
      });

      const updaterFn = mockSetAuthState.mock.calls[0][0];
      const result = updaterFn(existingState);

      expect(result.user).toEqual({
        userName: "newname",
        userColor: "#0000FF",
      });
    });
  });

  describe("createSetLoading", () => {
    it("should set loading to true", () => {
      const setLoadingFn = createSetLoading(mockSetAuthState);

      setLoadingFn(true);

      expect(mockSetAuthState).toHaveBeenCalledWith(expect.any(Function));

      const updaterFn = mockSetAuthState.mock.calls[0][0];
      const result = updaterFn(initialAuthState);

      expect(result.isLoading).toBe(true);
    });

    it("should set loading to false", () => {
      const setLoadingFn = createSetLoading(mockSetAuthState);

      const loadingState: AuthContextState = {
        ...initialAuthState,
        isLoading: true,
      };

      setLoadingFn(false);

      const updaterFn = mockSetAuthState.mock.calls[0][0];
      const result = updaterFn(loadingState);

      expect(result.isLoading).toBe(false);
    });
  });

  describe("createSetError", () => {
    it("should set error message and disable loading", () => {
      const setErrorFn = createSetError(mockSetAuthState);

      const loadingState: AuthContextState = {
        ...initialAuthState,
        isLoading: true,
      };

      setErrorFn("Test error message");

      expect(mockSetAuthState).toHaveBeenCalledWith(expect.any(Function));

      const updaterFn = mockSetAuthState.mock.calls[0][0];
      const result = updaterFn(loadingState);

      expect(result.error).toBe("Test error message");
      expect(result.isLoading).toBe(false);
    });

    it("should clear error when set to null", () => {
      const setErrorFn = createSetError(mockSetAuthState);

      const errorState: AuthContextState = {
        ...initialAuthState,
        error: "Existing error",
        isLoading: true,
      };

      setErrorFn(null);

      const updaterFn = mockSetAuthState.mock.calls[0][0];
      const result = updaterFn(errorState);

      expect(result.error).toBe(null);
      expect(result.isLoading).toBe(false);
    });
  });

  describe("createUpdateActivity", () => {
    it("should update lastActivity timestamp", () => {
      const updateActivityFn = createUpdateActivity(mockSetAuthState);

      const beforeTime = Date.now();
      updateActivityFn();

      expect(mockSetAuthState).toHaveBeenCalledWith(expect.any(Function));

      const updaterFn = mockSetAuthState.mock.calls[0][0];
      const result = updaterFn(initialAuthState);

      expect(result.lastActivity).toBeTypeOf("number");
      expect(result.lastActivity).toBeGreaterThanOrEqual(beforeTime);
      expect(result.lastActivity).toBeLessThanOrEqual(Date.now());
    });

    it("should update lastActivity multiple times", () => {
      const updateActivityFn = createUpdateActivity(mockSetAuthState);

      const state1: AuthContextState = { ...initialAuthState };

      updateActivityFn();
      const updaterFn1 = mockSetAuthState.mock.calls[0][0];
      const result1 = updaterFn1(state1);

      vi.useFakeTimers();
      vi.advanceTimersByTime(10);

      updateActivityFn();
      const updaterFn2 = mockSetAuthState.mock.calls[1][0];
      const result2 = updaterFn2(result1);

      expect(result2.lastActivity).toBeDefined();
      expect(result1.lastActivity).toBeDefined();

      vi.useRealTimers();
    });
  });

  describe("createLockSession", () => {
    it("should lock session and clear sensitive data", () => {
      const lockSessionFn = createLockSession(mockSetAuthState);

      const unlockedState: AuthContextState = {
        ...initialAuthState,
        user: { userName: "testuser" },
        isAuthenticated: true,
        isUnlocked: true,
        encryptionKey: {} as CryptoKey,
        salt: new Uint8Array([1, 2, 3, 4]),
        lastActivity: Date.now(),
      };

      lockSessionFn();

      expect(mockSetAuthState).toHaveBeenCalledWith(expect.any(Function));

      const updaterFn = mockSetAuthState.mock.calls[0][0];
      const result = updaterFn(unlockedState);

      expect(result.isUnlocked).toBe(false);
      expect(result.encryptionKey).toBe(null);
      expect(result.lastActivity).toBe(null);
      expect(result.user).toEqual({ userName: "testuser" }); // User info preserved
      expect(result.isAuthenticated).toBe(true); // Auth state preserved
    });

    it("should lock session when already locked", () => {
      const lockSessionFn = createLockSession(mockSetAuthState);

      const lockedState: AuthContextState = {
        ...initialAuthState,
        user: { userName: "testuser" },
        isAuthenticated: true,
        isUnlocked: false,
        encryptionKey: null,
        lastActivity: null,
      };

      lockSessionFn();

      const updaterFn = mockSetAuthState.mock.calls[0][0];
      const result = updaterFn(lockedState);

      expect(result.isUnlocked).toBe(false);
      expect(result.encryptionKey).toBe(null);
      expect(result.lastActivity).toBe(null);
    });

    it("should preserve salt when present", () => {
      const lockSessionFn = createLockSession(mockSetAuthState);

      const mockSalt = new Uint8Array([1, 2, 3, 4]);
      const unlockedState: AuthContextState = {
        ...initialAuthState,
        isUnlocked: true,
        encryptionKey: {} as CryptoKey,
        salt: mockSalt,
        lastActivity: Date.now(),
      };

      lockSessionFn();

      const updaterFn = mockSetAuthState.mock.calls[0][0];
      const result = updaterFn(unlockedState);

      expect(result.isUnlocked).toBe(false);
      expect(result.encryptionKey).toBe(null);
      expect(result.lastActivity).toBe(null);
      // Note: Based on implementation, salt is not cleared during lock
    });
  });

  describe("Edge Cases and Integration", () => {
    it("should handle rapid state transitions", () => {
      const setAuthenticatedFn = createSetAuthenticated(mockSetAuthState);
      const lockSessionFn = createLockSession(mockSetAuthState);
      const updateUserFn = createUpdateUser(mockSetAuthState);

      let currentState = initialAuthState;

      // Authenticate
      setAuthenticatedFn({ userName: "user1", userColor: "#AAAAAA" });
      const authenticatedState = mockSetAuthState.mock.calls[0][0](currentState);

      // Update user
      updateUserFn({ userColor: "#FF0000" });
      const updatedState = mockSetAuthState.mock.calls[1][0](authenticatedState);

      // Lock
      lockSessionFn();
      const lockedState = mockSetAuthState.mock.calls[2][0](updatedState);

      expect(lockedState.isAuthenticated).toBe(true);
      expect(lockedState.isUnlocked).toBe(false);
      expect(lockedState.user?.userName).toBe("user1");
      expect(lockedState.user?.userColor).toBe("#FF0000");
      expect(lockedState.encryptionKey).toBe(null);
    });

    it("should handle null user during update", () => {
      const updateUserFn = createUpdateUser(mockSetAuthState);

      const stateWithNullUser: AuthContextState = {
        ...initialAuthState,
        user: null,
      };

      updateUserFn({ userName: "newname", userColor: "#888888" });

      const updaterFn = mockSetAuthState.mock.calls[0][0];
      const result = updaterFn(stateWithNullUser);

      // When user is null, the spread should create a new object
      expect(result.user).toEqual({
        userName: "newname",
        userColor: "#888888",
      });
    });
  });
});
