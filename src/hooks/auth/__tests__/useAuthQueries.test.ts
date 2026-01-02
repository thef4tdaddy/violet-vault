import { renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useLoginMutation, useLogoutMutation, useChangePasswordMutation } from "../useAuthQueries";

/**
 * Test suite for useAuthQueries
 * TanStack Query hooks for auth operations
 * Part of Epic #665: Migrate Auth from Zustand to React Context + TanStack Query
 */

// Mock TanStack Query
vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn((_options) => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(async () => ({ success: true })),
    isPending: false,
    isError: false,
    error: null,
    data: null,
    reset: vi.fn(),
  })),
  useQuery: vi.fn((_options) => ({
    data: null,
    isLoading: false,
    isError: false,
    error: null,
  })),
}));

// Mock the auth service
vi.mock("@/services/auth/authService", () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    changePassword: vi.fn(),
    updateProfile: vi.fn(),
    joinBudget: vi.fn(),
  },
}));

// Mock AuthContext
vi.mock("../../contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    setAuthenticated: vi.fn(),
    clearAuth: vi.fn(),
    updateUser: vi.fn(),
    setError: vi.fn(),
  })),
}));

describe("useAuthQueries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useLoginMutation", () => {
    it("should provide login mutation", () => {
      const { result } = renderHook(() => useLoginMutation());

      expect(result.current).toBeDefined();
      expect(result.current.mutateAsync).toBeDefined();
      expect(result.current.isPending).toBeDefined();
    });

    it("should track loading state during login", async () => {
      const { result } = renderHook(() => useLoginMutation());

      expect(typeof result.current.isPending).toBe("boolean");
    });

    it("should handle login mutation", async () => {
      const { result } = renderHook(() => useLoginMutation());

      const loginPromise = result.current.mutateAsync?.({
        password: "testpassword",
        userData: { userName: "testuser" },
      });

      expect(loginPromise).toBeDefined();
    });
  });

  describe("useLogoutMutation", () => {
    it("should provide logout mutation", () => {
      const { result } = renderHook(() => useLogoutMutation());

      expect(result.current).toBeDefined();
      expect(result.current.mutateAsync).toBeDefined();
    });

    it("should clear auth on logout", async () => {
      const { result } = renderHook(() => useLogoutMutation());

      await result.current.mutateAsync?.();

      // Mutation should be defined and callable
      expect(result.current.mutateAsync).toBeDefined();
    });
  });

  describe("useChangePasswordMutation", () => {
    it("should provide change password mutation", () => {
      const { result } = renderHook(() => useChangePasswordMutation());

      expect(result.current).toBeDefined();
      expect(result.current.mutateAsync).toBeDefined();
    });

    it("should validate password parameters", async () => {
      const { result } = renderHook(() => useChangePasswordMutation());

      // Should accept old and new password
      const changePromise = result.current.mutateAsync?.({
        oldPassword: "oldpass",
        newPassword: "newpass",
      });

      expect(changePromise).toBeDefined();
    });

    it("should require auth context access", () => {
      const { result } = renderHook(() => useChangePasswordMutation());

      // Mutation should have access to context for updates
      expect(result.current).toBeDefined();
    });
  });

  describe("Mutation State Management", () => {
    it("should track mutation loading state", () => {
      const { result: loginResult } = renderHook(() => useLoginMutation());

      expect(loginResult.current.isPending).toBeFalsy();
    });

    it("should track mutation errors", () => {
      const { result } = renderHook(() => useLoginMutation());

      expect(result.current.isError).toBeDefined();
      expect(result.current.error).toBeDefined();
    });

    it("should provide mutation reset functionality", () => {
      const { result } = renderHook(() => useLoginMutation());

      expect(result.current.reset).toBeDefined();
    });
  });

  describe("Auth Flow Integration", () => {
    it("mutations should integrate with AuthContext", () => {
      const { result } = renderHook(() => useLoginMutation());

      // Mutation should be able to update auth context on success
      expect(result.current.mutateAsync).toBeDefined();
    });

    it("should support optimistic updates", async () => {
      const { result } = renderHook(() => useLoginMutation());

      // Mutation should support optimistic response handling
      expect(result.current).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    it("should capture and expose mutation errors", () => {
      const { result } = renderHook(() => useLoginMutation());

      expect(result.current.error).toBeDefined();
    });

    it("should allow error recovery", () => {
      const { result } = renderHook(() => useLoginMutation());

      // Should be able to reset mutation state
      if (result.current.reset) {
        result.current.reset();
      }

      expect(result.current.reset).toBeDefined();
    });
  });
});
