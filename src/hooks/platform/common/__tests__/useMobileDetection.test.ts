import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useMobileDetection } from "../useMobileDetection";

describe("useMobileDetection", () => {
  let originalInnerWidth: number;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
  });

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  it("should initialize with correct mobile state based on window width", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 500,
    });

    const { result } = renderHook(() => useMobileDetection());

    expect(result.current).toBe(true);
  });

  it("should return false for desktop width", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useMobileDetection());

    expect(result.current).toBe(false);
  });

  it("should use custom breakpoint when provided", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 800,
    });

    const { result } = renderHook(() => useMobileDetection(768));

    expect(result.current).toBe(false);

    const { result: result2 } = renderHook(() => useMobileDetection(1024));

    expect(result2.current).toBe(true);
  });

  it("should update on window resize", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useMobileDetection());

    expect(result.current).toBe(false);

    // Simulate resize to mobile
    act(() => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 500,
      });
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current).toBe(true);
  });

  it("should handle edge case at exact breakpoint", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 640,
    });

    const { result } = renderHook(() => useMobileDetection(640));

    expect(result.current).toBe(false); // Not less than breakpoint
  });

  it("should clean up event listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useMobileDetection());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });

  it("should handle multiple resize events", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useMobileDetection());

    expect(result.current).toBe(false);

    // First resize
    act(() => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 500,
      });
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current).toBe(true);

    // Second resize back to desktop
    act(() => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1024,
      });
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current).toBe(false);
  });

  it("should update when breakpoint changes", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 700,
    });

    const { result, rerender } = renderHook(({ breakpoint }) => useMobileDetection(breakpoint), {
      initialProps: { breakpoint: 640 },
    });

    expect(result.current).toBe(false);

    // Change breakpoint to higher value
    rerender({ breakpoint: 768 });

    expect(result.current).toBe(true);
  });
});
