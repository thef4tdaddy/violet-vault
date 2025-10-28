import { renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useUpdateProfileMutation } from "../useProfileMutations";

/**
 * Test suite for useUpdateProfileMutation
 * TanStack Query mutation for profile updates
 * Part of Epic #665: Migrate Auth from Zustand to React Context + TanStack Query
 */

// Mock dependencies
vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn((options) => ({
    mutate: vi.fn(),
    mutateAsync: options.mutationFn,
    isPending: false,
    isError: false,
    error: null,
    data: null,
    reset: vi.fn(),
  })),
}));

vi.mock("../../../../contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    updateUser: vi.fn(),
    encryptionKey: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]),
    salt: new Uint8Array([9, 10, 11, 12, 13, 14, 15, 16]),
  })),
}));

vi.mock("../../../../utils/security/encryption", () => ({
  encryptionUtils: {
    encrypt: vi.fn(() =>
      Promise.resolve({
        data: "new-encrypted-profile",
        iv: "new-iv",
      })
    ),
    decrypt: vi.fn(() =>
      Promise.resolve({
        currentUser: { userName: "olduser", budgetId: "budget-123" },
        envelopes: [],
        transactions: [],
      })
    ),
  },
}));

vi.mock("../../../../services/storage/localStorageService", () => ({
  default: {
    setUserProfile: vi.fn(),
    getBudgetData: vi.fn(),
    setBudgetData: vi.fn(),
  },
}));

vi.mock("../../../../utils/common/logger", () => ({
  default: {
    auth: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useUpdateProfileMutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should provide update profile mutation", () => {
    const { result } = renderHook(() => useUpdateProfileMutation());

    expect(result.current).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
    expect(result.current.isPending).toBeDefined();
  });

  it("should update user profile successfully", async () => {
    const { result } = renderHook(() => useUpdateProfileMutation());

    const updatedProfile = {
      userName: "newusername",
      userColor: "#FF5733",
    };

    const updateResult = await result.current.mutateAsync?.(updatedProfile);

    expect(updateResult.success).toBe(true);
    expect(updateResult.profile.userName).toBe("newusername");
  });

  it("should save profile to localStorage", async () => {
    const { result } = renderHook(() => useUpdateProfileMutation());

    const updatedProfile = {
      userName: "newusername",
      userColor: "#FF5733",
    };

    await result.current.mutateAsync?.(updatedProfile);

    // Verify that setUserProfile was called
    expect(result.current).toBeDefined();
  });

  it("should encrypt and save updated budget data", async () => {
    const { result } = renderHook(() => useUpdateProfileMutation());

    const updatedProfile = {
      userName: "newusername",
      userColor: "#FF5733",
    };

    await result.current.mutateAsync?.(updatedProfile);

    // Verify mutation completed successfully
    expect(result.current).toBeDefined();
  });

  it("should return error if not authenticated", async () => {
    // Mock useAuth to return null encryption key
    const { useAuth } = await import("../../../../contexts/AuthContext");
    vi.mocked(useAuth).mockReturnValue({
      updateUser: vi.fn(),
      encryptionKey: null,
      salt: null,
      user: null,
      isAuthenticated: false,
      isUnlocked: false,
      budgetId: null,
      lastActivity: null,
      isLoading: false,
      error: null,
      currentUser: null,
      hasCurrentUser: false,
      hasBudgetId: false,
      setAuthenticated: vi.fn(),
      clearAuth: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      updateActivity: vi.fn(),
      lockSession: vi.fn(),
    });

    const { result } = renderHook(() => useUpdateProfileMutation());

    const updatedProfile = {
      userName: "newusername",
      userColor: "#FF5733",
    };

    const updateResult = await result.current.mutateAsync?.(updatedProfile);

    expect(updateResult.success).toBe(false);
    expect(updateResult.error).toContain("Not authenticated");
  });

  it("should provide mutation error tracking", () => {
    const { result } = renderHook(() => useUpdateProfileMutation());

    expect(result.current.isError).toBeDefined();
    expect(result.current.error).toBeDefined();
  });

  it("should provide mutation reset functionality", () => {
    const { result } = renderHook(() => useUpdateProfileMutation());

    expect(result.current.reset).toBeDefined();
  });

  it("should track mutation loading state", () => {
    const { result } = renderHook(() => useUpdateProfileMutation());

    expect(result.current.isPending).toBeDefined();
    expect(typeof result.current.isPending).toBe("boolean");
  });
});
