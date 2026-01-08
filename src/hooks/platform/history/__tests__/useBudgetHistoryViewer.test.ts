import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  useBudgetHistoryViewerUI,
  useBudgetHistoryRestore,
  useBudgetHistoryUIHelpers,
} from "../useBudgetHistoryViewer";
import { useConfirm } from "@/hooks/common/useConfirm";
import { usePrompt } from "@/hooks/common/usePrompt";

// Mock dependencies
vi.mock("@/hooks/common/useConfirm", () => ({
  useConfirm: vi.fn(() => vi.fn()),
}));

vi.mock("@/hooks/common/usePrompt", () => ({
  usePrompt: vi.fn(() => vi.fn()),
}));

vi.mock("@/utils/common/logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

describe("useBudgetHistoryViewerUI", () => {
  it("should initialize with default state", () => {
    const { result } = renderHook(() => useBudgetHistoryViewerUI());

    expect(result.current.selectedCommit).toBeNull();
    expect(result.current.expandedCommits).toEqual(new Set());
    expect(result.current.filter).toEqual({ author: "all", limit: 50 });
    expect(result.current.showIntegrityDetails).toBe(false);
  });

  it("should handle commit selection", () => {
    const { result } = renderHook(() => useBudgetHistoryViewerUI());

    act(() => {
      result.current.handleCommitSelection("commit-hash-123");
    });

    expect(result.current.selectedCommit).toBe("commit-hash-123");
  });

  it("should toggle commit expansion", () => {
    const { result } = renderHook(() => useBudgetHistoryViewerUI());

    // Expand commit
    act(() => {
      result.current.toggleCommitExpanded("commit-hash-123");
    });

    expect(result.current.expandedCommits.has("commit-hash-123")).toBe(true);

    // Collapse commit
    act(() => {
      result.current.toggleCommitExpanded("commit-hash-123");
    });

    expect(result.current.expandedCommits.has("commit-hash-123")).toBe(false);
  });

  it("should update filter", () => {
    const { result } = renderHook(() => useBudgetHistoryViewerUI());

    act(() => {
      result.current.updateFilter({ author: "user", limit: 25 });
    });

    expect(result.current.filter).toEqual({ author: "user", limit: 25 });

    // Test partial update
    act(() => {
      result.current.updateFilter({ author: "system" });
    });

    expect(result.current.filter).toEqual({ author: "system", limit: 25 });
  });

  it("should toggle integrity details", () => {
    const { result } = renderHook(() => useBudgetHistoryViewerUI());

    act(() => {
      result.current.toggleIntegrityDetails();
    });

    expect(result.current.showIntegrityDetails).toBe(true);

    act(() => {
      result.current.toggleIntegrityDetails();
    });

    expect(result.current.showIntegrityDetails).toBe(false);
  });
});

describe("useBudgetHistoryRestore", () => {
  let mockConfirm;
  let mockPrompt;
  let mockRestore;

  beforeEach(() => {
    mockConfirm = vi.fn();
    mockPrompt = vi.fn();
    mockRestore = vi.fn();

    vi.mocked(useConfirm).mockReturnValue(mockConfirm);
    vi.mocked(usePrompt).mockReturnValue(mockPrompt);
  });

  it("should handle restore cancellation at confirmation", async () => {
    mockConfirm.mockResolvedValue(false);

    const { result } = renderHook(() => useBudgetHistoryRestore(mockRestore));

    await act(async () => {
      await result.current.handleRestoreFromHistory("commit-hash-123");
    });

    expect(mockConfirm).toHaveBeenCalledWith({
      title: "Restore from History",
      message: expect.stringContaining("This will restore your budget"),
      confirmLabel: "Restore",
      cancelLabel: "Cancel",
      destructive: true,
    });
    expect(mockPrompt).not.toHaveBeenCalled();
    expect(mockRestore).not.toHaveBeenCalled();
  });

  it("should handle restore cancellation at password prompt", async () => {
    mockConfirm.mockResolvedValue(true);
    mockPrompt.mockResolvedValue(null);

    const { result } = renderHook(() => useBudgetHistoryRestore(mockRestore));

    await act(async () => {
      await result.current.handleRestoreFromHistory("commit-hash-123");
    });

    expect(mockConfirm).toHaveBeenCalled();
    expect(mockPrompt).toHaveBeenCalledWith({
      title: "Password Required",
      message: "Enter your password to restore from history:",
      inputType: "password",
      placeholder: "Enter your password...",
      isRequired: true,
      validation: expect.any(Function),
    });
    expect(mockRestore).not.toHaveBeenCalled();
  });

  it("should validate password requirements", async () => {
    mockConfirm.mockResolvedValue(true);

    const { result } = renderHook(() => useBudgetHistoryRestore(mockRestore));

    // Trigger the function to get access to validation
    await act(async () => {
      result.current.handleRestoreFromHistory("commit-hash-123");
    });

    const promptCall = mockPrompt.mock.calls[0][0];
    const validation = promptCall.validation;

    // Test empty password
    expect(validation("")).toEqual({
      valid: false,
      error: "Password is required",
    });

    // Test short password
    expect(validation("123")).toEqual({
      valid: false,
      error: "Password must be at least 6 characters",
    });

    // Test valid password
    expect(validation("validpassword")).toEqual({
      valid: true,
    });
  });

  it("should handle successful restore", async () => {
    mockConfirm.mockResolvedValue(true);
    mockPrompt.mockResolvedValue("validpassword");
    mockRestore.mockResolvedValue();

    const { result } = renderHook(() => useBudgetHistoryRestore(mockRestore));

    await act(async () => {
      await result.current.handleRestoreFromHistory("commit-hash-123");
    });

    expect(mockRestore).toHaveBeenCalledWith({
      commitHash: "commit-hash-123",
      password: "validpassword",
    });
  });

  it("should handle restore errors", async () => {
    const logger = await import("@/utils/common/logger");

    mockConfirm.mockResolvedValue(true);
    mockPrompt.mockResolvedValue("validpassword");
    mockRestore.mockRejectedValue(new Error("Restore failed"));

    const { result } = renderHook(() => useBudgetHistoryRestore(mockRestore));

    await act(async () => {
      await result.current.handleRestoreFromHistory("commit-hash-123");
    });

    expect(logger.default.error).toHaveBeenCalledWith(
      "Failed to restore from history:",
      expect.any(Error)
    );
  });
});

describe("useBudgetHistoryUIHelpers", () => {
  it("should return correct change icons", () => {
    const { result } = renderHook(() => useBudgetHistoryUIHelpers());

    // Test each icon type
    const addIcon = result.current.getChangeIcon("add");
    const deleteIcon = result.current.getChangeIcon("delete");
    const modifyIcon = result.current.getChangeIcon("modify");
    const defaultIcon = result.current.getChangeIcon("unknown");

    // Check that icons are JSX elements with correct classes
    expect(addIcon.props.className).toContain("text-green-600");
    expect(deleteIcon.props.className).toContain("text-red-600");
    expect(modifyIcon.props.className).toContain("text-blue-600");
    expect(defaultIcon.props.className).toContain("text-gray-600");
  });

  it("should return correct author colors", () => {
    const { result } = renderHook(() => useBudgetHistoryUIHelpers());

    expect(result.current.getAuthorColor("system")).toBe("bg-gray-100 text-gray-700");
    expect(result.current.getAuthorColor("user")).toBe("bg-blue-100 text-blue-700");
    expect(result.current.getAuthorColor("unknown")).toBe("bg-purple-100 text-purple-700");
  });

  it("should format commit hashes correctly", () => {
    const { result } = renderHook(() => useBudgetHistoryUIHelpers());

    expect(result.current.formatCommitHash("abcdef1234567890")).toBe("abcdef12");
    expect(result.current.formatCommitHash("short")).toBe("short");
    expect(result.current.formatCommitHash(null)).toBe("");
    expect(result.current.formatCommitHash(undefined)).toBe("");
  });

  it("should format timestamps correctly", () => {
    const { result } = renderHook(() => useBudgetHistoryUIHelpers());

    const timestamp = "2023-01-01T12:00:00.000Z";
    const formatted = result.current.formatTimestamp(timestamp);

    expect(formatted).toBeTruthy();
  });

  it("should format dates correctly", () => {
    const { result } = renderHook(() => useBudgetHistoryUIHelpers());

    const date = "2023-01-01";
    const formatted = result.current.formatDate(date);

    expect(formatted).toBeTruthy();
  });
});
