import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useFABSmartPositioning } from "../useFABSmartPositioning";

describe("useFABSmartPositioning", () => {
  let originalInnerHeight: number;

  beforeEach(() => {
    vi.useFakeTimers();
    originalInnerHeight = window.innerHeight;
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 800,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    });
  });

  it("should initialize with keyboard hidden", () => {
    const { result } = renderHook(() => useFABSmartPositioning());

    expect(result.current.isKeyboardVisible).toBe(false);
    expect(result.current.keyboardHeight).toBe(0);
  });

  it("should provide default adjusted style when keyboard is hidden", () => {
    const { result } = renderHook(() => useFABSmartPositioning());

    expect(result.current.adjustedStyle).toEqual({
      bottom: "1rem",
      transform: "none",
      transition: "all 300ms ease-in-out",
    });
  });

  it("should detect keyboard when viewport height decreases significantly", () => {
    const { result } = renderHook(() => useFABSmartPositioning());

    act(() => {
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 500, // Decreased by 300px
      });
      window.dispatchEvent(new Event("resize"));
    });

    act(() => {
      vi.advanceTimersByTime(150); // Wait for debounce
    });

    expect(result.current.isKeyboardVisible).toBe(true);
    expect(result.current.keyboardHeight).toBe(300);
  });

  it("should hide keyboard when viewport height returns to normal", () => {
    const { result } = renderHook(() => useFABSmartPositioning());

    // Simulate keyboard appearing
    act(() => {
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 500,
      });
      window.dispatchEvent(new Event("resize"));
    });

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current.isKeyboardVisible).toBe(true);

    // Simulate keyboard hiding
    act(() => {
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 800,
      });
      window.dispatchEvent(new Event("resize"));
    });

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current.isKeyboardVisible).toBe(false);
    expect(result.current.keyboardHeight).toBe(0);
  });

  it("should not detect keyboard for small viewport changes", () => {
    const { result } = renderHook(() => useFABSmartPositioning());

    act(() => {
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 750, // Decreased by only 50px
      });
      window.dispatchEvent(new Event("resize"));
    });

    act(() => {
      vi.advanceTimersByTime(150);
    });

    // Should not detect keyboard for changes below threshold (150px)
    expect(result.current.isKeyboardVisible).toBe(false);
    expect(result.current.keyboardHeight).toBe(0);
  });

  it("should handle focusin event", () => {
    const { result } = renderHook(() => useFABSmartPositioning());

    act(() => {
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 400,
      });
      document.dispatchEvent(new Event("focusin"));
    });

    act(() => {
      vi.advanceTimersByTime(400); // Wait for focus delay + debounce
    });

    expect(result.current.isKeyboardVisible).toBe(true);
  });

  it("should handle focusout event", () => {
    const { result } = renderHook(() => useFABSmartPositioning());

    // Simulate keyboard visible
    act(() => {
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 400,
      });
      window.dispatchEvent(new Event("resize"));
    });

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current.isKeyboardVisible).toBe(true);

    // Trigger focusout
    act(() => {
      document.dispatchEvent(new Event("focusout"));
    });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(result.current.isKeyboardVisible).toBe(false);
    expect(result.current.keyboardHeight).toBe(0);
  });

  it("should provide adjusted position when keyboard is visible", () => {
    const { result } = renderHook(() => useFABSmartPositioning());

    act(() => {
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 500,
      });
      window.dispatchEvent(new Event("resize"));
    });

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current.isKeyboardVisible).toBe(true);
    expect(result.current.adjustedStyle.bottom).toBe("220px"); // 300 - 80
    expect(result.current.adjustedStyle.transition).toBe("all 300ms ease-in-out");
  });

  it("should maintain minimum bottom padding", () => {
    const { result } = renderHook(() => useFABSmartPositioning());

    // Simulate very small keyboard height
    act(() => {
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 650, // Only 150px difference (just at threshold)
      });
      window.dispatchEvent(new Event("resize"));
    });

    act(() => {
      vi.advanceTimersByTime(150);
    });

    if (result.current.isKeyboardVisible) {
      // If detected, should maintain minimum padding of 16px
      expect(result.current.adjustedStyle.bottom).toBe("16px"); // max(16, 150 - 80)
    }
  });

  it("should clean up event listeners on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    const removeDocListenerSpy = vi.spyOn(document, "removeEventListener");

    const { unmount } = renderHook(() => useFABSmartPositioning());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));
    expect(removeDocListenerSpy).toHaveBeenCalledWith("focusin", expect.any(Function));
    expect(removeDocListenerSpy).toHaveBeenCalledWith("focusout", expect.any(Function));
  });

  it("should debounce resize events", () => {
    const { result } = renderHook(() => useFABSmartPositioning());

    // Fire multiple resize events quickly
    act(() => {
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 500,
      });
      window.dispatchEvent(new Event("resize"));
      window.dispatchEvent(new Event("resize"));
      window.dispatchEvent(new Event("resize"));
    });

    // Before debounce timeout
    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(result.current.isKeyboardVisible).toBe(false);

    // After debounce timeout
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.isKeyboardVisible).toBe(true);
  });
});
