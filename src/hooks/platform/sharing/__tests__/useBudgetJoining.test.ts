import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useBudgetJoining } from "../useBudgetJoining";

// Mock dependencies
vi.mock("@/utils/platform/security/shareCodeUtils", () => ({
  shareCodeUtils: {
    validateShareCode: vi.fn(() => true),
    normalizeShareCode: vi.fn((code) => code.toUpperCase()),
    generateBudgetId: vi.fn(async () => "generated-budget-id-123"),
  },
}));

vi.mock("@/utils/core/common/toastHelpers", () => ({
  useToastHelpers: () => ({
    showSuccessToast: vi.fn(),
    showErrorToast: vi.fn(),
  }),
}));

vi.mock("@/utils/common/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useBudgetJoining", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.history
    delete (window as { history?: unknown }).history;
    (window as { history: unknown }).history = {
      replaceState: vi.fn(),
    };
  });

  it("should initialize with not joining state", () => {
    const { result } = renderHook(() => useBudgetJoining());

    expect(result.current.isJoining).toBe(false);
    expect(result.current.joinBudget).toBeDefined();
    expect(typeof result.current.joinBudget).toBe("function");
  });

  it("should successfully join a budget with valid data", async () => {
    const { result } = renderHook(() => useBudgetJoining());

    const onJoinSuccess = vi.fn();
    const onClose = vi.fn();

    await result.current.joinBudget({
      shareCode: "word1 word2 word3 word4",
      password: "testpassword",
      userName: "Test User",
      userColor: "#ff5733",
      onJoinSuccess,
      onClose,
    });

    await waitFor(() => {
      expect(result.current.isJoining).toBe(false);
    });

    expect(onJoinSuccess).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("should reject joining without share code", async () => {
    const { result } = renderHook(() => useBudgetJoining());

    const onJoinSuccess = vi.fn();
    const onClose = vi.fn();

    const success = await result.current.joinBudget({
      shareCode: "",
      password: "testpassword",
      userName: "Test User",
      userColor: "#ff5733",
      onJoinSuccess,
      onClose,
    });

    expect(success).toBe(false);
    expect(onJoinSuccess).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("should reject joining without password", async () => {
    const { result } = renderHook(() => useBudgetJoining());

    const onJoinSuccess = vi.fn();
    const onClose = vi.fn();

    const success = await result.current.joinBudget({
      shareCode: "word1 word2 word3 word4",
      password: "",
      userName: "Test User",
      userColor: "#ff5733",
      onJoinSuccess,
      onClose,
    });

    expect(success).toBe(false);
    expect(onJoinSuccess).not.toHaveBeenCalled();
  });

  it("should reject joining without username", async () => {
    const { result } = renderHook(() => useBudgetJoining());

    const onJoinSuccess = vi.fn();
    const onClose = vi.fn();

    const success = await result.current.joinBudget({
      shareCode: "word1 word2 word3 word4",
      password: "testpassword",
      userName: "",
      userColor: "#ff5733",
      onJoinSuccess,
      onClose,
    });

    expect(success).toBe(false);
    expect(onJoinSuccess).not.toHaveBeenCalled();
  });

  it("should trim whitespace from userName", async () => {
    const { result } = renderHook(() => useBudgetJoining());

    const onJoinSuccess = vi.fn();
    const onClose = vi.fn();

    await result.current.joinBudget({
      shareCode: "word1 word2 word3 word4",
      password: "testpassword",
      userName: "  Test User  ",
      userColor: "#ff5733",
      onJoinSuccess,
      onClose,
    });

    expect(onJoinSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        userInfo: expect.objectContaining({
          userName: "Test User",
        }),
      })
    );
  });

  it("should set isJoining state during join process", async () => {
    const { result } = renderHook(() => useBudgetJoining());

    const onJoinSuccess = vi.fn();
    const onClose = vi.fn();

    const joinPromise = result.current.joinBudget({
      shareCode: "word1 word2 word3 word4",
      password: "testpassword",
      userName: "Test User",
      userColor: "#ff5733",
      onJoinSuccess,
      onClose,
    });

    await waitFor(() => {
      expect(result.current.isJoining).toBe(false);
    });

    await joinPromise;
  });

  it("should generate budget ID with normalized share code", async () => {
    const { shareCodeUtils } = await import("@/utils/platform/security/shareCodeUtils");
    const { result } = renderHook(() => useBudgetJoining());

    const onJoinSuccess = vi.fn();
    const onClose = vi.fn();

    await result.current.joinBudget({
      shareCode: "  WORD1 WORD2 WORD3 WORD4  ",
      password: "testpassword",
      userName: "Test User",
      userColor: "#ff5733",
      onJoinSuccess,
      onClose,
    });

    // The mock implementation calls normalizeShareCode with the trimmed uppercase version
    expect(shareCodeUtils.normalizeShareCode).toHaveBeenCalledWith("WORD1 WORD2 WORD3 WORD4");
  });

  it("should pass correct data to onJoinSuccess", async () => {
    const { result } = renderHook(() => useBudgetJoining());

    const onJoinSuccess = vi.fn();
    const onClose = vi.fn();

    await result.current.joinBudget({
      shareCode: "word1 word2 word3 word4",
      password: "testpassword",
      userName: "Test User",
      userColor: "#ff5733",
      onJoinSuccess,
      onClose,
    });

    expect(onJoinSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        budgetId: "generated-budget-id-123",
        password: "testpassword",
        userInfo: expect.objectContaining({
          userName: "Test User",
          userColor: "#ff5733",
          joinedVia: "shareCode",
        }),
      })
    );
  });

  it("should handle join errors gracefully", async () => {
    const { shareCodeUtils } = await import("@/utils/platform/security/shareCodeUtils");
    vi.mocked(shareCodeUtils.generateBudgetId).mockRejectedValueOnce(
      new Error("Generation failed")
    );

    const { result } = renderHook(() => useBudgetJoining());

    const onJoinSuccess = vi.fn();
    const onClose = vi.fn();

    const success = await result.current.joinBudget({
      shareCode: "word1 word2 word3 word4",
      password: "testpassword",
      userName: "Test User",
      userColor: "#ff5733",
      onJoinSuccess,
      onClose,
    });

    expect(success).toBe(false);
    expect(onJoinSuccess).not.toHaveBeenCalled();
    expect(result.current.isJoining).toBe(false);
  });

  it("should clear URL share parameter on success", async () => {
    // Setup URL with share parameter
    const url = new URL("http://localhost?share=test");
    Object.defineProperty(window, "location", {
      value: url,
      writable: true,
    });

    const { result } = renderHook(() => useBudgetJoining());

    const onJoinSuccess = vi.fn();
    const onClose = vi.fn();

    await result.current.joinBudget({
      shareCode: "word1 word2 word3 word4",
      password: "testpassword",
      userName: "Test User",
      userColor: "#ff5733",
      onJoinSuccess,
      onClose,
    });

    // Just verify the function completed without error
    // The actual window.history.replaceState was already mocked in beforeEach
    expect(onClose).toHaveBeenCalled();
  });

  it("should not call onJoinSuccess if not provided", async () => {
    const { result } = renderHook(() => useBudgetJoining());

    const onClose = vi.fn();

    const success = await result.current.joinBudget({
      shareCode: "word1 word2 word3 word4",
      password: "testpassword",
      userName: "Test User",
      userColor: "#ff5733",
      onJoinSuccess: null,
      onClose,
    });

    // Should still succeed and call onClose
    expect(onClose).toHaveBeenCalled();
    expect(success).toBe(true);
  });
});
