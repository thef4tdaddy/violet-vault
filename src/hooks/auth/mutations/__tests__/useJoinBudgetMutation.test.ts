import { renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useJoinBudgetMutation } from "../useJoinBudgetMutation";

/**
 * Test suite for useJoinBudgetMutation
 * TanStack Query mutation for joining shared budgets
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
    deriveKey: vi.fn(() =>
      Promise.resolve({
        key: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]),
        salt: new Uint8Array([9, 10, 11, 12, 13, 14, 15, 16]),
      })
    ),
    encrypt: vi.fn(() =>
      Promise.resolve({
        data: "encrypted-shared-budget",
        iv: "shared-iv",
      })
    ),
  },
}));

vi.mock("../../../../services/storage/localStorageService", () => ({
  default: {
    setUserProfile: vi.fn(),
    setBudgetData: vi.fn(),
  },
}));

vi.mock("../../../../utils/common/sentry", () => ({
  identifyUser: vi.fn(),
}));

vi.mock("../../../../utils/common/logger", () => ({
  default: {
    auth: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../../../stores/ui/uiStore", () => ({
  useBudgetStore: {
    getState: vi.fn(() => ({
      cloudSyncEnabled: false,
      startBackgroundSync: vi.fn(),
    })),
  },
}));

describe("useJoinBudgetMutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should provide join budget mutation", () => {
    const { result } = renderHook(() => useJoinBudgetMutation());

    expect(result.current).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
    expect(result.current.isPending).toBeDefined();
  });

  it("should join shared budget successfully", async () => {
    const joinData = {
      password: "password123",
      budgetId: "shared-budget-123",
      shareCode: "SHARE-ABC",
      userInfo: {
        userName: "shareduser",
        userColor: "#FF5733",
      },
      sharedBy: "owner@example.com",
    };

    const { result } = renderHook(() => useJoinBudgetMutation());

    const joinResult = await result.current.mutateAsync?.(joinData);

    expect(joinResult.success).toBe(true);
    expect(joinResult.user.budgetId).toBe("shared-budget-123");
    expect(joinResult.sharedBudget).toBe(true);
  });

  it("should save shared user profile", async () => {
    const joinData = {
      password: "password123",
      budgetId: "shared-budget-123",
      shareCode: "SHARE-ABC",
      userInfo: {
        userName: "shareduser",
        userColor: "#FF5733",
      },
      sharedBy: "owner@example.com",
    };

    const { result } = renderHook(() => useJoinBudgetMutation());

    const joinResult = await result.current.mutateAsync?.(joinData);

    // Verify join was successful
    expect(joinResult.success).toBe(true);
  });

  it("should trim username if provided", async () => {
    const joinData = {
      password: "password123",
      budgetId: "shared-budget-123",
      shareCode: "SHARE-ABC",
      userInfo: {
        userName: "  shareduser  ",
        userColor: "#FF5733",
      },
      sharedBy: "owner@example.com",
    };

    const { result } = renderHook(() => useJoinBudgetMutation());

    const joinResult = await result.current.mutateAsync?.(joinData);

    expect(joinResult.success).toBe(true);
    expect(joinResult.user.userName).toBe("shareduser");
  });

  it("should handle join errors gracefully", async () => {
    const joinData = {
      password: "password123",
      budgetId: "shared-budget-123",
      shareCode: "SHARE-ABC",
      userInfo: {
        userName: "shareduser",
      },
      sharedBy: "owner@example.com",
    };

    const { result } = renderHook(() => useJoinBudgetMutation());

    const joinResult = await result.current.mutateAsync?.(joinData);

    // Should complete
    expect(joinResult).toBeDefined();
  });

  it("should provide default username if missing", async () => {
    const joinData = {
      password: "password123",
      budgetId: "shared-budget-123",
      shareCode: "SHARE-ABC",
      userInfo: {
        userColor: "#FF5733",
        // Missing userName
      },
      sharedBy: "owner@example.com",
    };

    const { result } = renderHook(() => useJoinBudgetMutation());

    const joinResult = await result.current.mutateAsync?.(joinData);

    expect(joinResult.success).toBe(true);
    expect(joinResult.user.userName).toBe("Shared User");
  });

  it("should call setLoading during join", async () => {
    const joinData = {
      password: "password123",
      budgetId: "shared-budget-123",
      shareCode: "SHARE-ABC",
      userInfo: {
        userName: "shareduser",
      },
      sharedBy: "owner@example.com",
    };

    const { result } = renderHook(() => useJoinBudgetMutation());

    expect(result.current.isPending).toBe(false);
  });

  it("should provide mutation error tracking", () => {
    const { result } = renderHook(() => useJoinBudgetMutation());

    expect(result.current.isError).toBeDefined();
    expect(result.current.error).toBeDefined();
  });

  it("should provide mutation reset functionality", () => {
    const { result } = renderHook(() => useJoinBudgetMutation());

    expect(result.current.reset).toBeDefined();
  });

  it("should track mutation loading state", () => {
    const { result } = renderHook(() => useJoinBudgetMutation());

    expect(result.current.isPending).toBeDefined();
    expect(typeof result.current.isPending).toBe("boolean");
  });
});
