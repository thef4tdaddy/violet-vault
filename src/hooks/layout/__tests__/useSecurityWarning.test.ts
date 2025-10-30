import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useSecurityWarning } from "../useSecurityWarning";

describe("useSecurityWarning", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should initialize with showSecurityWarning as false", () => {
    const { result } = renderHook(() =>
      useSecurityWarning({
        isUnlocked: false,
        currentUser: null,
        isOnboarded: false,
        hasAcknowledged: false,
      })
    );

    expect(result.current.showSecurityWarning).toBe(false);
  });

  it("should not show warning when user is not unlocked", () => {
    const { result } = renderHook(() =>
      useSecurityWarning({
        isUnlocked: false,
        currentUser: { id: "user1" },
        isOnboarded: true,
        hasAcknowledged: false,
      })
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.showSecurityWarning).toBe(false);
  });

  it("should not show warning when there is no current user", () => {
    const { result } = renderHook(() =>
      useSecurityWarning({
        isUnlocked: true,
        currentUser: null,
        isOnboarded: true,
        hasAcknowledged: false,
      })
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.showSecurityWarning).toBe(false);
  });

  it("should not show warning when user is not onboarded", () => {
    const { result } = renderHook(() =>
      useSecurityWarning({
        isUnlocked: true,
        currentUser: { id: "user1" },
        isOnboarded: false,
        hasAcknowledged: false,
      })
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.showSecurityWarning).toBe(false);
  });

  it("should not show warning when user has already acknowledged", () => {
    const { result } = renderHook(() =>
      useSecurityWarning({
        isUnlocked: true,
        currentUser: { id: "user1" },
        isOnboarded: true,
        hasAcknowledged: true,
      })
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.showSecurityWarning).toBe(false);
  });

  it("should show warning after 1 second when all conditions are met", () => {
    const { result } = renderHook(() =>
      useSecurityWarning({
        isUnlocked: true,
        currentUser: { id: "user1" },
        isOnboarded: true,
        hasAcknowledged: false,
      })
    );

    expect(result.current.showSecurityWarning).toBe(false);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.showSecurityWarning).toBe(false);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.showSecurityWarning).toBe(true);
  });

  it("should allow manually setting showSecurityWarning", () => {
    const { result } = renderHook(() =>
      useSecurityWarning({
        isUnlocked: false,
        currentUser: null,
        isOnboarded: false,
        hasAcknowledged: false,
      })
    );

    expect(result.current.showSecurityWarning).toBe(false);

    act(() => {
      result.current.setShowSecurityWarning(true);
    });

    expect(result.current.showSecurityWarning).toBe(true);

    act(() => {
      result.current.setShowSecurityWarning(false);
    });

    expect(result.current.showSecurityWarning).toBe(false);
  });

  it("should clear timer on unmount", () => {
    const { unmount } = renderHook(() =>
      useSecurityWarning({
        isUnlocked: true,
        currentUser: { id: "user1" },
        isOnboarded: true,
        hasAcknowledged: false,
      })
    );

    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it("should reset timer when dependencies change", () => {
    const { result, rerender } = renderHook((props) => useSecurityWarning(props), {
      initialProps: {
        isUnlocked: true,
        currentUser: { id: "user1" },
        isOnboarded: true,
        hasAcknowledged: false,
      },
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.showSecurityWarning).toBe(false);

    // Change props to reset timer
    rerender({
      isUnlocked: true,
      currentUser: { id: "user2" },
      isOnboarded: true,
      hasAcknowledged: false,
    });

    // Timer should be reset, so advancing 500ms more shouldn't trigger it yet
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.showSecurityWarning).toBe(false);

    // Now advance full 1000ms from the reset
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.showSecurityWarning).toBe(true);
  });
});
