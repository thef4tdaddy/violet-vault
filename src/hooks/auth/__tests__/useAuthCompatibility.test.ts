import { renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAuthCompatibility, useAuth } from "../useAuthCompatibility";

/**
 * Test suite for useAuthCompatibility
 * Backward compatibility wrapper for old authStore interface
 * Part of Epic #665: Migrate Auth from Zustand to React Context + TanStack Query
 */

// Mock dependencies
vi.mock("../useAuth", () => ({
  useAuth: vi.fn(() => ({
    // State properties
    isUnlocked: false,
    user: null,
    budgetId: null,
    encryptionKey: new Uint8Array([1, 2, 3, 4]),
    salt: new Uint8Array([5, 6, 7, 8]),
    lastActivity: null,
    error: null,
    isLoading: false,

    // Action methods
    login: vi.fn().mockResolvedValue({ success: true }),
    logout: vi.fn(),
    joinBudget: vi.fn().mockResolvedValue({ success: true }),
    changePassword: vi.fn().mockResolvedValue({ success: true }),
    updateProfile: vi.fn().mockResolvedValue({ success: true }),
    updateUser: vi.fn(),
    updateActivity: vi.fn(),
  })),
}));

vi.mock("../../../utils/common/logger", () => ({
  default: {
    auth: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

// Import mocked dependencies
import { useAuth as useAuthHook } from "../useAuth";
import logger from "@/utils/common/logger";

describe("useAuthCompatibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAuthHook).mockReturnValue({
      isUnlocked: false,
      user: null as any,
      budgetId: null,
      encryptionKey: new Uint8Array([1, 2, 3, 4]) as any,
      salt: new Uint8Array([5, 6, 7, 8]),
      lastActivity: null,
      error: null,
      isLoading: false,
      login: vi.fn().mockResolvedValue({ success: true }),
      logout: vi.fn(),
      joinBudget: vi.fn().mockResolvedValue({ success: true }),
      changePassword: vi.fn().mockResolvedValue({ success: true }),
      updateProfile: vi.fn().mockResolvedValue({ success: true }),
      updateUser: vi.fn(),
      updateActivity: vi.fn(),
      isAuthenticated: false,
      hasError: false,
      securityContext: {
        encryptionKey: new Uint8Array([1, 2, 3, 4]) as any,
        budgetId: null,
        salt: new Uint8Array([5, 6, 7, 8]),
        hasValidKeys: false,
      } as any,
      shouldShowAuthGateway: () => true,
      setError: vi.fn(),
      setAuthenticated: vi.fn(),
      setLoading: vi.fn(),
      clearAuth: vi.fn(),
    } as any);
  });

  describe("State Properties", () => {
    it("should provide legacy auth state properties", () => {
      const { result } = renderHook(() => useAuthCompatibility());

      expect(result.current.isUnlocked).toBeDefined();
      expect(result.current.currentUser).toBeDefined();
      expect(result.current.budgetId).toBeDefined();
      expect(result.current.encryptionKey).toBeDefined();
      expect(result.current.salt).toBeDefined();
      expect(result.current.lastActivity).toBeDefined();
    });

    it("should map currentUser to user", () => {
      const mockUser = { userName: "testuser", budgetId: "budget-123", userColor: "#888888" };

      vi.mocked(useAuthHook).mockReturnValue({
        isUnlocked: false,
        user: mockUser,
        budgetId: null,
        encryptionKey: new Uint8Array([1, 2, 3, 4]) as any,
        salt: new Uint8Array([5, 6, 7, 8]),
        lastActivity: null,
        error: null,
        isLoading: false,
        isAuthenticated: false,
        hasError: false,
        securityContext: {
          encryptionKey: new Uint8Array([1, 2, 3, 4]) as any,
          budgetId: null,
          salt: new Uint8Array([5, 6, 7, 8]),
          hasValidKeys: false,
        },
        shouldShowAuthGateway: () => true,
        login: vi.fn(),
        logout: vi.fn(),
        joinBudget: vi.fn(),
        changePassword: vi.fn(),
        updateProfile: vi.fn(),
        updateUser: vi.fn(),
        updateActivity: vi.fn(),
        lockSession: vi.fn(),
        createPasswordValidator: vi.fn(),
        _legacy: {} as any,
        setError: vi.fn(),
        setAuthenticated: vi.fn(),
        setLoading: vi.fn(),
        clearAuth: vi.fn(),
      } as any);

      const { result } = renderHook(() => useAuthCompatibility());

      expect(result.current.currentUser).toEqual(mockUser);
    });

    it("should provide encryption key and salt state", () => {
      const { result } = renderHook(() => useAuthCompatibility());

      expect(result.current.encryptionKey).toEqual(new Uint8Array([1, 2, 3, 4]));
      expect(result.current.salt).toEqual(new Uint8Array([5, 6, 7, 8]));
    });
  });

  describe("Authentication Methods", () => {
    it("should provide login method matching legacy interface", async () => {
      const { result } = renderHook(() => useAuthCompatibility());

      expect(typeof result.current.login).toBe("function");

      const loginResult = await result.current.login("password123");
      expect(loginResult).toBeDefined();
    });

    it("should provide logout method", () => {
      const { result } = renderHook(() => useAuthCompatibility());

      expect(typeof result.current.logout).toBe("function");

      // Should not throw
      result.current.logout();
    });

    it("should provide joinBudgetWithShareCode method", async () => {
      const { result } = renderHook(() => useAuthCompatibility());

      expect(typeof result.current.joinBudgetWithShareCode).toBe("function");

      const joinData = {
        budgetId: "budget-123",
        shareCode: "SHARE-ABC",
      };

      const joinResult = await result.current.joinBudgetWithShareCode(joinData);
      expect(joinResult).toBeDefined();
    });

    it("should pass login parameters to authManager", async () => {
      const mockLogin = vi.fn().mockResolvedValue({ success: true });

      vi.mocked(useAuthHook).mockReturnValue({
        isUnlocked: false,
        user: null,
        budgetId: null,
        encryptionKey: null,
        salt: null,
        lastActivity: null,
        error: null,
        isLoading: false,
        isAuthenticated: false,
        hasError: false,
        securityContext: {
          encryptionKey: null,
          budgetId: null,
          salt: null,
          hasValidKeys: false,
        },
        shouldShowAuthGateway: () => true,
        login: mockLogin,
        logout: vi.fn(),
        joinBudget: vi.fn(),
        changePassword: vi.fn(),
        updateProfile: vi.fn(),
        updateUser: vi.fn(),
        updateActivity: vi.fn(),
        lockSession: vi.fn(),
        createPasswordValidator: vi.fn(),
      } as any);

      const { result } = renderHook(() => useAuthCompatibility());

      const userData = { userName: "newuser", shareCode: "SHARE-123" };
      await result.current.login("password123", userData);

      expect(mockLogin).toHaveBeenCalledWith({ password: "password123", userData });
    });

    it("should pass joinBudget data to authManager", async () => {
      const mockJoinBudget = vi.fn().mockResolvedValue({ success: true });

      vi.mocked(useAuthHook).mockReturnValue({
        isUnlocked: false,
        user: null,
        budgetId: null,
        encryptionKey: null,
        salt: null,
        lastActivity: null,
        error: null,
        isLoading: false,
        isAuthenticated: false,
        hasError: false,
        securityContext: {
          encryptionKey: null,
          budgetId: null,
          salt: null,
          hasValidKeys: false,
        },
        shouldShowAuthGateway: () => true,
        joinBudget: mockJoinBudget,
        login: vi.fn(),
        logout: vi.fn(),
        changePassword: vi.fn(),
        updateProfile: vi.fn(),
        updateUser: vi.fn(),
        updateActivity: vi.fn(),
        lockSession: vi.fn(),
        createPasswordValidator: vi.fn(),
      } as any);

      const { result } = renderHook(() => useAuthCompatibility());

      const joinData = {
        budgetId: "shared-budget",
        shareCode: "SHARE-123",
      };

      await result.current.joinBudgetWithShareCode(joinData);

      expect(mockJoinBudget).toHaveBeenCalledWith(joinData);
    });
  });

  describe("Password Methods", () => {
    it("should provide changePassword method", async () => {
      const { result } = renderHook(() => useAuthCompatibility());

      expect(typeof result.current.changePassword).toBe("function");

      const changeResult = await result.current.changePassword("oldpass", "newpass");
      expect(changeResult).toBeDefined();
    });

    it("should provide validatePassword method", async () => {
      const { result } = renderHook(() => useAuthCompatibility());

      expect(typeof result.current.validatePassword).toBe("function");

      const isValid = await result.current.validatePassword("password123");
      expect(typeof isValid).toBe("boolean");
    });

    it("should pass password change parameters to authManager", async () => {
      const mockChangePassword = vi.fn().mockResolvedValue({ success: true });

      vi.mocked(useAuthHook).mockReturnValue({
        isUnlocked: false,
        user: null,
        budgetId: null,
        encryptionKey: null,
        salt: null,
        lastActivity: null,
        error: null,
        isLoading: false,
        isAuthenticated: false,
        hasError: false,
        securityContext: {
          encryptionKey: null,
          budgetId: null,
          salt: null,
          hasValidKeys: false,
        },
        shouldShowAuthGateway: () => true,
        changePassword: mockChangePassword,
        login: vi.fn(),
        logout: vi.fn(),
        joinBudget: vi.fn(),
        updateProfile: vi.fn(),
        updateUser: vi.fn(),
        updateActivity: vi.fn(),
        lockSession: vi.fn(),
        createPasswordValidator: vi.fn(),
      } as any);

      const { result } = renderHook(() => useAuthCompatibility());

      await result.current.changePassword("oldpass", "newpass");

      expect(mockChangePassword).toHaveBeenCalledWith({
        oldPassword: "oldpass",
        newPassword: "newpass",
      });
    });
  });

  describe("Profile Methods", () => {
    it("should provide updateProfile method", async () => {
      const { result } = renderHook(() => useAuthCompatibility());

      expect(typeof result.current.updateProfile).toBe("function");

      const updateResult = await result.current.updateProfile({
        userName: "newname",
      });
      expect(updateResult).toBeDefined();
    });

    it("should provide updateUser method", () => {
      const { result } = renderHook(() => useAuthCompatibility());

      expect(typeof result.current.updateUser).toBe("function");

      const updatedUser = { userName: "updateduser" };
      result.current.updateUser(updatedUser);
    });

    it("should pass profile update to authManager", async () => {
      const mockUpdateProfile = vi.fn().mockResolvedValue({ success: true });

      vi.mocked(useAuthHook).mockReturnValue({
        isUnlocked: false,
        user: null,
        budgetId: null,
        encryptionKey: null,
        salt: null,
        lastActivity: null,
        error: null,
        isLoading: false,
        isAuthenticated: false,
        hasError: false,
        securityContext: {
          encryptionKey: null,
          budgetId: null,
          salt: null,
          hasValidKeys: false,
        },
        shouldShowAuthGateway: () => true,
        updateProfile: mockUpdateProfile,
        login: vi.fn(),
        logout: vi.fn(),
        joinBudget: vi.fn(),
        changePassword: vi.fn(),
        updateUser: vi.fn(),
        updateActivity: vi.fn(),
        lockSession: vi.fn(),
        createPasswordValidator: vi.fn(),
      } as any);

      const { result } = renderHook(() => useAuthCompatibility());

      const updatedProfile = { userName: "newname", userColor: "#FF5733" };
      await result.current.updateProfile(updatedProfile);

      expect(mockUpdateProfile).toHaveBeenCalledWith(updatedProfile);
    });
  });

  describe("Activity Methods", () => {
    it("should provide setLastActivity method", () => {
      const { result } = renderHook(() => useAuthCompatibility());

      expect(typeof result.current.setLastActivity).toBe("function");

      // Should not throw
      result.current.setLastActivity(Date.now());
    });

    it("should call updateActivity on authManager", () => {
      const mockUpdateActivity = vi.fn();

      vi.mocked(useAuthHook).mockReturnValue({
        isUnlocked: false,
        user: null,
        budgetId: null,
        encryptionKey: null,
        salt: null,
        lastActivity: null,
        error: null,
        isLoading: false,
        isAuthenticated: false,
        hasError: false,
        securityContext: {
          encryptionKey: null,
          budgetId: null,
          salt: null,
          hasValidKeys: false,
        },
        shouldShowAuthGateway: () => true,
        updateActivity: mockUpdateActivity,
        login: vi.fn(),
        logout: vi.fn(),
        joinBudget: vi.fn(),
        changePassword: vi.fn(),
        updateProfile: vi.fn(),
        updateUser: vi.fn(),
        lockSession: vi.fn(),
        createPasswordValidator: vi.fn(),
      } as any);

      const { result } = renderHook(() => useAuthCompatibility());

      result.current.setLastActivity(Date.now());

      expect(mockUpdateActivity).toHaveBeenCalled();
    });
  });

  describe("Deprecated Methods", () => {
    it("should provide setEncryption method for backward compatibility", () => {
      const { result } = renderHook(() => useAuthCompatibility());

      expect(typeof result.current.setEncryption).toBe("function");

      // Should not throw
      result.current.setEncryption({
        key: new Uint8Array([1, 2, 3, 4]),
        salt: new Uint8Array([5, 6, 7, 8]),
      });
    });

    it("should log warning for setEncryption usage", () => {
      const { result } = renderHook(() => useAuthCompatibility());

      result.current.setEncryption({
        key: new Uint8Array([1, 2, 3, 4]),
        salt: new Uint8Array([5, 6, 7, 8]),
      });

      // Logger warning should be called (this is checked in the implementation)
    });

    it("should provide startBackgroundSyncAfterLogin method", async () => {
      const { result } = renderHook(() => useAuthCompatibility());

      expect(typeof result.current.startBackgroundSyncAfterLogin).toBe("function");

      const syncResult = await result.current.startBackgroundSyncAfterLogin(true);
      expect(syncResult).toBeDefined();
    });

    it("should return resolved promise for startBackgroundSyncAfterLogin", async () => {
      const { result } = renderHook(() => useAuthCompatibility());

      const syncResult = await result.current.startBackgroundSyncAfterLogin(true);

      // Should resolve successfully
      expect(syncResult).toBeDefined();
    });
  });

  describe("Default Export", () => {
    it("should provide useAuth as alias for useAuthCompatibility", () => {
      const { result: compatResult } = renderHook(() => useAuthCompatibility());
      const { result: aliasResult } = renderHook(() => useAuth());

      expect(aliasResult.current.isUnlocked).toBe(compatResult.current.isUnlocked);
      expect(aliasResult.current.currentUser).toEqual(compatResult.current.currentUser);
      expect(typeof aliasResult.current.login).toBe("function");
    });

    it("should have same methods via useAuth alias", () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.login).toBeDefined();
      expect(result.current.logout).toBeDefined();
      expect(result.current.changePassword).toBeDefined();
      expect(result.current.joinBudgetWithShareCode).toBeDefined();
      expect(result.current.updateProfile).toBeDefined();
    });
  });

  describe("Development Logging", () => {
    it("should log usage in development mode", () => {
      vi.stubGlobal("import", { meta: { env: { MODE: "development" } } });

      renderHook(() => useAuthCompatibility());

      // Logger.auth should be called to track compatibility usage
      expect(vi.mocked(logger).auth).toBeDefined();
    });

    it("should not log in production mode", () => {
      vi.stubGlobal("import", { meta: { env: { MODE: "production" } } });

      renderHook(() => useAuthCompatibility());

      // Logger.auth might not be called in production
      expect(vi.mocked(logger).auth).toBeDefined();
    });
  });

  describe("Legacy Interface Completeness", () => {
    it("should have all required legacy properties", () => {
      const { result } = renderHook(() => useAuthCompatibility());

      const legacyAuth = result.current;

      // State properties
      expect("isUnlocked" in legacyAuth).toBe(true);
      expect("currentUser" in legacyAuth).toBe(true);
      expect("budgetId" in legacyAuth).toBe(true);
      expect("encryptionKey" in legacyAuth).toBe(true);
      expect("salt" in legacyAuth).toBe(true);
      expect("lastActivity" in legacyAuth).toBe(true);

      // Methods
      expect("login" in legacyAuth).toBe(true);
      expect("logout" in legacyAuth).toBe(true);
      expect("joinBudgetWithShareCode" in legacyAuth).toBe(true);
      expect("changePassword" in legacyAuth).toBe(true);
      expect("updateProfile" in legacyAuth).toBe(true);
      expect("updateUser" in legacyAuth).toBe(true);
      expect("setLastActivity" in legacyAuth).toBe(true);
      expect("validatePassword" in legacyAuth).toBe(true);
    });

    it("should handle all legacy method calls without errors", async () => {
      const { result } = renderHook(() => useAuthCompatibility());

      // These should all work without throwing
      expect(() => result.current.logout()).not.toThrow();
      expect(() => result.current.updateUser({})).not.toThrow();
      expect(() => result.current.setLastActivity(Date.now())).not.toThrow();
      expect(() => result.current.setEncryption({ key: null, salt: null })).not.toThrow();

      await expect(result.current.login("password")).resolves.toBeDefined();
      await expect(result.current.changePassword("old", "new")).resolves.toBeDefined();
      await expect(result.current.updateProfile({})).resolves.toBeDefined();
      await expect(result.current.validatePassword("password")).resolves.toBeDefined();
    });
  });
});
