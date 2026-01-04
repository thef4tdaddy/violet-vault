/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useLoginMutation } from "../useLoginMutations";

// Mock crypto if not available (needed for deterministic salt derivation)
// Mock crypto if not available (needed for deterministic salt derivation)
if (typeof global.crypto === "undefined") {
  (global as any).crypto = {
    subtle: {
      digest: vi.fn(() => Promise.resolve(new Uint8Array(32).buffer)),
    },
  };
} else if (!global.crypto.subtle) {
  (global.crypto as any).subtle = {
    digest: vi.fn(() => Promise.resolve(new Uint8Array(32).buffer)),
  };
} else {
  // Even if it exists, mock digest for consistency
  vi.spyOn(global.crypto.subtle, "digest").mockImplementation(() =>
    Promise.resolve(new Uint8Array(32).buffer)
  );
}

/**
 * Test suite for useLoginMutation
 * TanStack Query mutation for login operations (new user + existing user)
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
    setAuthenticated: vi.fn(),
    setError: vi.fn(),
    setLoading: vi.fn(),
  })),
}));

vi.mock("../../../../utils/security/encryption", () => ({
  encryptionUtils: {
    deriveKeyFromSalt: vi.fn(() =>
      Promise.resolve({
        type: "secret",
        extractable: true,
        algorithm: { name: "AES-GCM" },
        usages: ["encrypt", "decrypt"],
      } as any)
    ),
    generateBudgetId: vi.fn(() => Promise.resolve("budget-id-123")),
    encrypt: vi.fn(() =>
      Promise.resolve({
        data: "encrypted-data-string",
        iv: "iv-value",
      })
    ),
    decrypt: vi.fn(() =>
      Promise.resolve({
        currentUser: {
          userName: "testuser",
          budgetId: "budget-id-123",
          shareCode: "SHARE-123",
        },
        envelopes: [],
        transactions: [],
      })
    ),
  },
}));

vi.mock("../../../../services/storage/localStorageService", () => {
  const mock = {
    getBudgetData: vi.fn(),
    setBudgetData: vi.fn(),
    removeBudgetData: vi.fn(),
    setUserProfile: vi.fn(),
    getUserProfile: vi.fn(),
  };
  return {
    default: mock,
    localStorageService: mock,
  };
});

vi.mock("../../../../utils/common/sentry", () => ({
  identifyUser: vi.fn(),
}));

vi.mock("../../../../stores/ui/uiStore", () => ({
  useBudgetStore: {
    getState: vi.fn(() => ({
      cloudSyncEnabled: false,
      startBackgroundSync: vi.fn(),
    })),
  },
}));

vi.mock("../../../../utils/common/logger", () => ({
  default: {
    auth: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useLoginMutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should provide login mutation", () => {
    const { result } = renderHook(() => useLoginMutation());

    expect(result.current).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
    expect(result.current.isPending).toBeDefined();
  });

  it("should handle new user setup successfully", async () => {
    const userData = {
      userName: "newuser",
      userColor: "#FF5733",
      shareCode: "ABC-123",
    };

    const { result } = renderHook(() => useLoginMutation());

    const loginResult = await result.current.mutateAsync?.({
      password: "newpassword123",
      userData,
    });

    expect(loginResult.success).toBe(true);
    expect(loginResult.user?.userName).toBe("newuser");
    expect(loginResult.user?.budgetId).toBeDefined();
  });

  it("should throw error if share code is missing for new user", async () => {
    const userData = {
      userName: "newuser",
      userColor: "#FF5733",
      // Missing shareCode
    };

    const { result } = renderHook(() => useLoginMutation());

    const loginResult = await result.current.mutateAsync?.({
      password: "newpassword123",
      userData,
    });

    expect(loginResult.success).toBe(false);
    expect(loginResult.error).toContain("Share code missing");
  });

  it("should handle existing user login successfully", async () => {
    const localStorageService = await import("../../../../services/storage/localStorageService");
    vi.mocked(localStorageService.default.getBudgetData).mockReturnValue({
      salt: [9, 10, 11, 12, 13, 14, 15, 16],
      encryptedData: [1, 2, 3],
      iv: [4, 5, 6],
    } as any);
    vi.mocked(localStorageService.default.getUserProfile).mockReturnValue({
      userName: "testuser",
      userColor: "#FFFFFF",
      shareCode: "SHARE-123",
    });

    const { result } = renderHook(() => useLoginMutation());

    const loginResult = await result.current.mutateAsync?.({
      password: "correctpassword",
    });

    expect(loginResult.success).toBe(true);
    expect(loginResult.user?.userName).toBe("testuser");
  });

  it("should return error if password is invalid", async () => {
    const { encryptionUtils } = await import("../../../../utils/security/encryption");
    vi.mocked(encryptionUtils.decrypt).mockRejectedValueOnce(new Error("Decryption failed"));

    const { result } = renderHook(() => useLoginMutation());

    const loginResult = await result.current.mutateAsync?.({
      password: "wrongpassword",
    });

    expect(loginResult.success).toBe(false);
  });

  it("should provide mutation error tracking", () => {
    const { result } = renderHook(() => useLoginMutation());

    expect(result.current.isError).toBeDefined();
    expect(result.current.error).toBeDefined();
  });

  it("should provide mutation reset functionality", () => {
    const { result } = renderHook(() => useLoginMutation());

    expect(result.current.reset).toBeDefined();
  });

  it("should track mutation loading state", () => {
    const { result } = renderHook(() => useLoginMutation());

    expect(result.current.isPending).toBeDefined();
    expect(typeof result.current.isPending).toBe("boolean");
  });
});
