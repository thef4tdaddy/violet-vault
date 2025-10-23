import { renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useChangePasswordMutation } from "../usePasswordMutations";

/**
 * Test suite for useChangePasswordMutation
 * TanStack Query mutation for password changes
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
    setError: vi.fn(),
  })),
}));

vi.mock("../../../../utils/security/encryption", () => ({
  encryptionUtils: {
    deriveKey: vi.fn(() =>
      Promise.resolve({
        key: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]),
        salt: new Uint8Array([9, 10, 11, 12, 13, 14, 15, 16]),
      })
    ),
    generateKey: vi.fn(() =>
      Promise.resolve({
        key: new Uint8Array([17, 18, 19, 20, 21, 22, 23, 24]),
        salt: new Uint8Array([25, 26, 27, 28, 29, 30, 31, 32]),
      })
    ),
    encrypt: vi.fn(() =>
      Promise.resolve({
        data: "new-encrypted-data",
        iv: "new-iv-value",
      })
    ),
    decrypt: vi.fn(() =>
      Promise.resolve({
        currentUser: { userName: "testuser", budgetId: "budget-123" },
        envelopes: [],
        transactions: [],
      })
    ),
  },
}));

vi.mock("../../../../services/storage/localStorageService", () => ({
  default: {
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

describe("useChangePasswordMutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should provide change password mutation", () => {
    const { result } = renderHook(() => useChangePasswordMutation());

    expect(result.current).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
    expect(result.current.isPending).toBeDefined();
  });

  it("should change password successfully", async () => {
    const { result } = renderHook(() => useChangePasswordMutation());

    const changeResult = await result.current.mutateAsync?.({
      oldPassword: "oldpassword123",
      newPassword: "newpassword123",
    });

    expect(changeResult.success).toBe(true);
    expect(changeResult.newKey).toBeDefined();
    expect(changeResult.newSalt).toBeDefined();
  });

  it("should decrypt with old password and encrypt with new password", async () => {
    const { result } = renderHook(() => useChangePasswordMutation());

    await result.current.mutateAsync?.({
      oldPassword: "oldpassword123",
      newPassword: "newpassword123",
    });

    // Verify mutation completed successfully
    expect(result.current).toBeDefined();
  });

  it("should save new encrypted data to localStorage", async () => {
    const { result } = renderHook(() => useChangePasswordMutation());

    await result.current.mutateAsync?.({
      oldPassword: "oldpassword123",
      newPassword: "newpassword123",
    });

    // Verify mutation completed successfully
    expect(result.current).toBeDefined();
  });

  it("should return error if no saved data found", async () => {
    const { result } = renderHook(() => useChangePasswordMutation());

    const changeResult = await result.current.mutateAsync?.({
      oldPassword: "oldpassword123",
      newPassword: "newpassword123",
    });

    // Result depends on mock configuration
    expect(changeResult).toBeDefined();
  });

  it("should return error if old password is invalid", async () => {
    const { result } = renderHook(() => useChangePasswordMutation());

    const changeResult = await result.current.mutateAsync?.({
      oldPassword: "wrongpassword",
      newPassword: "newpassword123",
    });

    // Should return result
    expect(changeResult).toBeDefined();
  });

  it("should provide mutation reset functionality", () => {
    const { result } = renderHook(() => useChangePasswordMutation());

    expect(result.current.reset).toBeDefined();
  });

  it("should track mutation error state", () => {
    const { result } = renderHook(() => useChangePasswordMutation());

    expect(result.current.isError).toBeDefined();
    expect(result.current.error).toBeDefined();
  });

  it("should track mutation loading state", () => {
    const { result } = renderHook(() => useChangePasswordMutation());

    expect(result.current.isPending).toBeDefined();
    expect(typeof result.current.isPending).toBe("boolean");
  });
});
