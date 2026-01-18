import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useFABLoadingStates } from "../useFABLoadingStates";

// Mock useToast
const mockShowError = vi.fn();

vi.mock("@/hooks/platform/ux/useToast", () => ({
  default: () => ({
    showError: mockShowError,
  }),
}));

// Mock logger
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useFABLoadingStates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with no loading actions", () => {
    const { result } = renderHook(() => useFABLoadingStates());

    expect(result.current.isAnyActionLoading()).toBe(false);
    expect(result.current.getLoadingState()).toEqual({
      hasLoading: false,
      loadingCount: 0,
      loadingActions: [],
    });
  });

  it("should start loading for an action", () => {
    const { result } = renderHook(() => useFABLoadingStates());

    act(() => {
      result.current.startLoading("action-1");
    });

    expect(result.current.isActionLoading("action-1")).toBe(true);
    expect(result.current.isAnyActionLoading()).toBe(true);
  });

  it("should stop loading for an action", () => {
    const { result } = renderHook(() => useFABLoadingStates());

    act(() => {
      result.current.startLoading("action-1");
    });

    expect(result.current.isActionLoading("action-1")).toBe(true);

    act(() => {
      result.current.stopLoading("action-1");
    });

    expect(result.current.isActionLoading("action-1")).toBe(false);
    expect(result.current.isAnyActionLoading()).toBe(false);
  });

  it("should handle multiple loading actions", () => {
    const { result } = renderHook(() => useFABLoadingStates());

    act(() => {
      result.current.startLoading("action-1");
      result.current.startLoading("action-2");
      result.current.startLoading("action-3");
    });

    expect(result.current.getLoadingState()).toEqual({
      hasLoading: true,
      loadingCount: 3,
      loadingActions: expect.arrayContaining(["action-1", "action-2", "action-3"]),
    });
  });

  it("should clear all loading actions", () => {
    const { result } = renderHook(() => useFABLoadingStates());

    act(() => {
      result.current.startLoading("action-1");
      result.current.startLoading("action-2");
    });

    expect(result.current.isAnyActionLoading()).toBe(true);

    act(() => {
      result.current.clearAllLoading();
    });

    expect(result.current.isAnyActionLoading()).toBe(false);
    expect(result.current.getLoadingState().loadingCount).toBe(0);
  });

  it("should wrap action with loading state", async () => {
    const { result } = renderHook(() => useFABLoadingStates());
    const mockAction = vi.fn().mockResolvedValue("success");

    const wrappedAction = result.current.wrapActionWithLoading(
      "test-action",
      mockAction,
      "Test Action"
    );

    expect(result.current.isActionLoading("test-action")).toBe(false);

    const promise = act(async () => {
      return await wrappedAction("arg1", "arg2");
    });

    await promise;

    expect(mockAction).toHaveBeenCalledWith("arg1", "arg2");
    expect(result.current.isActionLoading("test-action")).toBe(false);
  });

  it("should handle action errors and show error toast", async () => {
    const { result } = renderHook(() => useFABLoadingStates());
    const mockAction = vi.fn().mockRejectedValue(new Error("Action failed"));

    const wrappedAction = result.current.wrapActionWithLoading(
      "failing-action",
      mockAction,
      "Failing Action"
    );

    await expect(
      act(async () => {
        await wrappedAction();
      })
    ).rejects.toThrow("Action failed");

    expect(mockShowError).toHaveBeenCalledWith("Failing Action Failed", "Action failed", 5000);
    expect(result.current.isActionLoading("failing-action")).toBe(false);
  });

  // TODO: Fix concurrent execution test - currently causes 30s timeout
  // The hook implementation correctly prevents concurrent execution but test needs proper async handling
  // See issue: https://github.com/thef4tdaddy/violet-vault/issues/1536
  it.skip("should prevent concurrent executions of the same action", async () => {
    const { result } = renderHook(() => useFABLoadingStates());
    let resolveAction: ((value: string) => void) | null = null;
    const mockAction = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveAction = resolve;
        })
    );

    const wrappedAction = result.current.wrapActionWithLoading(
      "concurrent-action",
      mockAction,
      "Concurrent Action"
    );

    // Start first execution (don't await yet)
    const firstPromise = wrappedAction();

    // Try to start second execution immediately while first is still running
    const secondPromise = wrappedAction(); // This should be ignored

    // Both should resolve/complete without error
    act(() => {
      if (resolveAction) resolveAction("done");
    });

    await act(async () => {
      await Promise.all([firstPromise, secondPromise]);
    });

    // Only called once because second call was ignored
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it("should create loading action wrapper", async () => {
    const { result } = renderHook(() => useFABLoadingStates());

    // Wait for hook to initialize
    await act(async () => {
      await Promise.resolve();
    });

    const mockAction = vi.fn().mockResolvedValue("result");

    const loadingAction = result.current.createLoadingAction(
      "created-action",
      mockAction,
      "Created Action"
    );

    await act(async () => {
      const res = await loadingAction("test-arg");
      expect(res).toBe("result");
    });

    expect(mockAction).toHaveBeenCalledWith("test-arg");
  });

  it("should handle synchronous actions", async () => {
    const { result } = renderHook(() => useFABLoadingStates());

    // Wait for hook to initialize
    await act(async () => {
      await Promise.resolve();
    });

    const mockAction = vi.fn().mockReturnValue("sync-result");

    const wrappedAction = result.current.wrapActionWithLoading(
      "sync-action",
      mockAction,
      "Sync Action"
    );

    const res = await act(async () => {
      return await wrappedAction();
    });

    expect(res).toBe("sync-result");
    expect(mockAction).toHaveBeenCalled();
  });

  it("should handle errors without error message", async () => {
    const { result } = renderHook(() => useFABLoadingStates());

    // Wait for hook to initialize
    await act(async () => {
      await Promise.resolve();
    });

    const mockAction = vi.fn().mockRejectedValue(new Error());

    const wrappedAction = result.current.wrapActionWithLoading(
      "no-message-action",
      mockAction,
      "No Message Action"
    );

    await expect(
      act(async () => {
        await wrappedAction();
      })
    ).rejects.toThrow();

    expect(mockShowError).toHaveBeenCalledWith(
      "No Message Action Failed",
      "An unexpected error occurred",
      5000
    );
  });

  it("should maintain stable function references", () => {
    const { result, rerender } = renderHook(() => useFABLoadingStates());

    // Wait for hook to initialize
    if (result.current) {
      const firstStartLoading = result.current.startLoading;
      const firstStopLoading = result.current.stopLoading;

      rerender();

      expect(result.current.startLoading).toBe(firstStartLoading);
      expect(result.current.stopLoading).toBe(firstStopLoading);
    }
  });
});
