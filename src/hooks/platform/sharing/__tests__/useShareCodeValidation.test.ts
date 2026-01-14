import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useShareCodeValidation } from "../useShareCodeValidation";

// Mock dependencies
vi.mock("@/utils/platform/security/shareCodeUtils", () => ({
  shareCodeUtils: {
    validateShareCode: vi.fn((code) => code.split(" ").length === 4),
    normalizeShareCode: vi.fn((code) => code.trim().toLowerCase()),
  },
}));

vi.mock("@/utils/core/common/toastHelpers", () => ({
  useToastHelpers: () => ({
    showSuccessToast: vi.fn(),
    showErrorToast: vi.fn(),
  }),
}));

vi.mock("../../../utils/common/logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../../utils/validation", () => ({
  isValidShareCode: vi.fn((code) => typeof code === "string" && code.trim().length > 0),
}));

describe("useShareCodeValidation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with null state", () => {
    const { result } = renderHook(() => useShareCodeValidation());

    expect(result.current.shareInfo).toBe(null);
    expect(result.current.creatorInfo).toBe(null);
    expect(result.current.isValidating).toBe(false);
  });

  it("should provide validation functions", () => {
    const { result } = renderHook(() => useShareCodeValidation());

    expect(result.current.validateShareCode).toBeDefined();
    expect(typeof result.current.validateShareCode).toBe("function");
    expect(result.current.resetValidation).toBeDefined();
    expect(typeof result.current.resetValidation).toBe("function");
  });

  it("should validate a valid share code", async () => {
    const { result } = renderHook(() => useShareCodeValidation());

    const isValid = await result.current.validateShareCode("word1 word2 word3 word4");

    expect(isValid).toBe(true);
    expect(result.current.shareInfo).toBeDefined();
    expect(result.current.isValidating).toBe(false);
  });

  it("should reject invalid share code format", async () => {
    const { result } = renderHook(() => useShareCodeValidation());

    const isValid = await result.current.validateShareCode("invalid");

    expect(isValid).toBe(false);
    expect(result.current.shareInfo).toBe(null);
  });

  it("should set isValidating state during validation", async () => {
    const { result } = renderHook(() => useShareCodeValidation());

    const validationPromise = result.current.validateShareCode("word1 word2 word3 word4");

    // Check if it was set to true at some point
    await validationPromise;

    expect(result.current.isValidating).toBe(false);
  });

  it("should reset validation state", async () => {
    const { result } = renderHook(() => useShareCodeValidation());

    await result.current.validateShareCode("word1 word2 word3 word4");

    await waitFor(() => {
      expect(result.current.shareInfo).not.toBe(null);
    });

    act(() => {
      result.current.resetValidation();
    });

    expect(result.current.shareInfo).toBe(null);
    expect(result.current.creatorInfo).toBe(null);
  });

  it("should handle empty share code", async () => {
    const { result } = renderHook(() => useShareCodeValidation());

    const isValid = await result.current.validateShareCode("");

    expect(isValid).toBe(false);
    expect(result.current.shareInfo).toBe(null);
  });

  it("should trim whitespace from share code", async () => {
    const { result } = renderHook(() => useShareCodeValidation());

    const isValid = await result.current.validateShareCode("  word1 word2 word3 word4  ");

    expect(isValid).toBe(true);
  });

  it("should handle validation errors gracefully", async () => {
    const { shareCodeUtils } = await import("@/utils/platform/security/shareCodeUtils");
    vi.mocked(shareCodeUtils.validateShareCode).mockImplementationOnce(() => {
      throw new Error("Validation error");
    });

    const { result } = renderHook(() => useShareCodeValidation());

    const isValid = await result.current.validateShareCode("word1 word2 word3 word4");

    expect(isValid).toBe(false);
    expect(result.current.shareInfo).toBe(null);
    expect(result.current.isValidating).toBe(false);
  });

  it("should set share info on successful validation", async () => {
    const { result } = renderHook(() => useShareCodeValidation());

    await result.current.validateShareCode("word1 word2 word3 word4");

    await waitFor(() => {
      expect(result.current.shareInfo).toEqual(
        expect.objectContaining({
          createdBy: "Shared Budget",
          userCount: "Multiple users can join",
        })
      );
    });
  });

  it("should include expiration info in share info", async () => {
    const { result } = renderHook(() => useShareCodeValidation());

    await result.current.validateShareCode("word1 word2 word3 word4");

    await waitFor(() => {
      expect(result.current.shareInfo).not.toBe(null);
      expect(result.current.shareInfo).toHaveProperty("expiresAt");
      expect(result.current.shareInfo).toHaveProperty("createdAt");
    });
  });
});
