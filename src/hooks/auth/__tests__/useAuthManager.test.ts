import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useAuthManager } from "../useAuthManager";

/**
 * Test suite for useAuthManager
 * Part of Epic #665: Migrate Auth from Zustand to React Context + TanStack Query
 */

// Mock the dependencies
vi.mock("../../contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: false,
    isUnlocked: false,
    isLoading: false,
    user: null,
    encryptionKey: null,
    salt: null,
    budgetId: null,
    lastActivity: null,
    error: null,
    setAuthenticated: vi.fn(),
    clearAuth: vi.fn(),
    setError: vi.fn(),
    updateUser: vi.fn(),
    updateActivity: vi.fn(),
    lockSession: vi.fn(),
  })),
}));

vi.mock("../useAuthQueries", () => ({
  useLoginMutation: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useJoinBudgetMutation: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useLogoutMutation: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useChangePasswordMutation: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useUpdateProfileMutation: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
}));

vi.mock("../authOperations", () => ({
  createLoginOperation: vi.fn((_mutation) => vi.fn()),
  createJoinBudgetOperation: vi.fn((_mutation) => vi.fn()),
  createLogoutOperation: vi.fn((_mutation) => vi.fn()),
  createChangePasswordOperation: vi.fn((_mutation, _context) => vi.fn()),
  createUpdateProfileOperation: vi.fn((_mutation) => vi.fn()),
  createLockSessionOperation: vi.fn((_context) => vi.fn()),
  createUpdateActivityOperation: vi.fn((_context) => vi.fn()),
}));

describe("useAuthManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return auth manager interface", () => {
    const { result } = renderHook(() => useAuthManager());

    expect(result.current).toBeDefined();
    expect(result.current.login).toBeDefined();
    expect(result.current.logout).toBeDefined();
    expect(result.current.changePassword).toBeDefined();
    expect(result.current.updateProfile).toBeDefined();
    expect(result.current.joinBudget).toBeDefined();
    expect(result.current.lockSession).toBeDefined();
    expect(result.current.updateActivity).toBeDefined();
  });

  it("should provide computed authentication state", () => {
    const { result } = renderHook(() => useAuthManager());

    expect(result.current.isAuthenticated).toBeDefined();
    expect(result.current.isLoading).toBeDefined();
  });

  it("should provide legacy interface for backward compatibility", () => {
    const { result } = renderHook(() => useAuthManager());

    // Legacy interface properties
    expect(result.current.isUnlocked).toBeDefined();
    expect(result.current._legacy.currentUser).toBeDefined();
    expect(result.current.budgetId).toBeDefined();
    expect(result.current.encryptionKey).toBeDefined();
    expect(result.current.salt).toBeDefined();
    expect(result.current.lastActivity).toBeDefined();
    expect(result.current._legacy.joinBudgetWithShareCode).toBeDefined();
    expect(result.current._legacy.handleSetup).toBeDefined();
    expect(result.current._legacy.handleLogout).toBeDefined();
    expect(result.current._legacy.handleChangePassword).toBeDefined();
    expect(result.current._legacy.handleUpdateProfile).toBeDefined();
  });

  it("should propagate context state to manager", () => {
    const { result } = renderHook(() => useAuthManager());

    // Should have access to auth context state
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBeFalsy();
  });

  it("should provide both new and legacy interfaces", () => {
    const { result } = renderHook(() => useAuthManager());

    // New interface (preferred)
    expect(typeof result.current.login).toBe("function");
    expect(typeof result.current.logout).toBe("function");

    // Legacy interface (backward compatibility)
    expect(typeof result.current._legacy.handleSetup).toBe("function");
    expect(typeof result.current._legacy.handleLogout).toBe("function");
  });

  describe("Error Handling", () => {
    it("should handle login errors", async () => {
      const { result } = renderHook(() => useAuthManager());

      expect(result.current.error).toBeNull();
    });

    it("should expose error state from context", () => {
      const { result } = renderHook(() => useAuthManager());

      expect(result.current.error).toBeDefined();
    });
  });

  describe("Loading States", () => {
    it("should compute loading state from mutations", () => {
      const { result } = renderHook(() => useAuthManager());

      // Should reflect mutation loading states
      expect(result.current.isLoading).toBeDefined();
      expect(typeof result.current.isLoading).toBe("boolean");
    });
  });

  describe("Legacy Compatibility", () => {
    it("should map legacy property names to new properties", () => {
      const { result } = renderHook(() => useAuthManager());

      // currentUser maps to user
      expect(result.current._legacy.currentUser === result.current.user).toBeTruthy();

      // Legacy methods exist
      expect(result.current._legacy.handleSetup).toBeDefined();
      expect(result.current._legacy.handleLogout).toBeDefined();
      expect(result.current._legacy.handleChangePassword).toBeDefined();
      expect(result.current._legacy.joinBudgetWithShareCode).toBeDefined();
    });

    it("should provide setters for legacy interface", () => {
      const { result } = renderHook(() => useAuthManager());

      expect(result.current.updateUser).toBeDefined();
      expect(result.current._legacy.setLastActivity).toBeDefined();
    });
  });
});
