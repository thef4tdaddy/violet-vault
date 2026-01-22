import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import touchFeedback, {
  hapticFeedback,
  touchFeedbackClasses,
  withHapticFeedback,
  getButtonClasses,
  useTouchFeedback,
  initializeTouchFeedback,
} from "../touchFeedback";

describe("touchFeedback utils", () => {
  const originalNavigator = window.navigator;
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock navigator.vibrate
    Object.defineProperty(window, "navigator", {
      value: {
        ...originalNavigator,
        vibrate: vi.fn().mockReturnValue(true),
      },
      writable: true,
    });

    // Mock matchMedia
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "navigator", {
      value: originalNavigator,
      writable: true,
    });
    Object.defineProperty(window, "matchMedia", {
      value: originalMatchMedia,
      writable: true,
    });
  });

  describe("hapticFeedback", () => {
    it("should return false if vibration is not supported", () => {
      Object.defineProperty(window, "navigator", {
        value: {},
        writable: true,
      });

      expect(hapticFeedback()).toBe(false);
    });

    it("should return false if prefers-reduced-motion is enabled", () => {
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === "(prefers-reduced-motion: reduce)",
          media: query,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      expect(hapticFeedback()).toBe(false);
    });

    it("should trigger vibration with default pattern", () => {
      hapticFeedback();
      expect(window.navigator.vibrate).toHaveBeenCalledWith([10]);
    });

    it("should trigger vibration with specific type pattern", () => {
      hapticFeedback(10, "success");
      // Success pattern: [20, 10, 20, 10, 30]
      expect(window.navigator.vibrate).toHaveBeenCalledWith([20, 10, 20, 10, 30]);
    });

    it("should fallback to duration if type not found", () => {
      hapticFeedback(50, "unknown" as any);
      expect(window.navigator.vibrate).toHaveBeenCalledWith([50]);
    });

    it("should return false if navigator.vibrate throws", () => {
      Object.defineProperty(window, "navigator", {
        value: {
          vibrate: vi.fn().mockImplementation(() => {
            throw new Error("Vibration failed");
          }),
        },
        writable: true,
      });
      expect(hapticFeedback()).toBe(false);
    });
  });

  describe("touchFeedbackClasses", () => {
    it("should export feedback classes", () => {
      expect(touchFeedbackClasses.primary).toBeDefined();
      expect(touchFeedbackClasses.destructive).toBeDefined();
      expect(touchFeedbackClasses.card).toContain("cursor-pointer");
    });
  });

  describe("withHapticFeedback", () => {
    it("should wrap handler with haptic feedback", () => {
      const handler = vi.fn();
      const wrapped = withHapticFeedback(handler, "tap");

      wrapped("arg1", 123);

      expect(window.navigator.vibrate).toHaveBeenCalledWith([8]); // Tap pattern
      expect(handler).toHaveBeenCalledWith("arg1", 123);
    });

    it("should work without original handler", () => {
      const wrapped = withHapticFeedback(undefined, "tap");
      wrapped();
      expect(window.navigator.vibrate).toHaveBeenCalledWith([8]);
    });
  });

  describe("getButtonClasses", () => {
    it("should combine base classes with touch classes", () => {
      const base = "bg-blue-500 text-white p-4";
      const result = getButtonClasses(base, "primary");

      expect(result).toContain("bg-blue-500");
      expect(result).toContain(touchFeedbackClasses.primary);
    });

    it("should clean up conflicting transition classes", () => {
      const base = "bg-red-500 transition-all duration-300 transform hover:scale-110";
      const result = getButtonClasses(base, "destructive");

      expect(result).not.toContain("duration-300");

      expect(result).toContain(touchFeedbackClasses.destructive);
    });
  });

  describe("useTouchFeedback", () => {
    it("should provide handlers and classes", () => {
      const { result } = renderHook(() => useTouchFeedback("tap", "primary"));

      expect(result.current.onTouchStart).toBeDefined();
      expect(result.current.onClick).toBeDefined();
      expect(result.current.className).toBe(touchFeedbackClasses.primary);
    });

    it("should trigger haptic on touch start", () => {
      const { result } = renderHook(() => useTouchFeedback("tap"));

      const event = {} as any;
      result.current.onTouchStart(event);

      expect(window.navigator.vibrate).toHaveBeenCalledWith([8]);
    });

    it("should handle click (wrapping handler)", () => {
      const handler = vi.fn();
      const { result } = renderHook(() => useTouchFeedback("tap"));

      // Ensure we are in a non-touch environment for this test
      const originalOntouchstart = "ontouchstart" in window;
      if (originalOntouchstart) {
        delete (window as any).ontouchstart;
      }

      const wrappedClick = result.current.onClick(handler);
      wrappedClick("test");

      expect(handler).toHaveBeenCalledWith("test");
      // Should vibrate if not on touch device
      expect(window.navigator.vibrate).toHaveBeenCalled();

      // Restore
      if (originalOntouchstart) {
        (window as any).ontouchstart = null;
      }
    });
  });

  describe("initializeTouchFeedback", () => {
    it("should inject style tag", () => {
      // Remove if exists
      const existing = document.getElementById("touch-feedback-styles");
      if (existing) existing.remove();

      initializeTouchFeedback();

      const style = document.getElementById("touch-feedback-styles");
      expect(style).toBeInTheDocument();
      expect(style?.textContent).toContain("-webkit-tap-highlight-color");
    });

    it("should attach listeners to elements", async () => {
      // Setup DOM
      document.body.innerHTML = `
        <button class="bg-blue-500">Primary</button>
        <button class="bg-red-500">Destructive</button>
        <div class="cursor-pointer">Card</div>
      `;

      vi.useFakeTimers();
      initializeTouchFeedback();
      vi.runAllTimers();

      const primaryBtn = document.querySelector(".bg-blue-500");
      expect(primaryBtn?.classList.contains("touch-feedback-enabled")).toBe(true);

      const destructiveBtn = document.querySelector(".bg-red-500");
      expect(destructiveBtn?.classList.contains("touch-feedback-enabled")).toBe(true);

      vi.useRealTimers();
    });

    it("should not double initialize styles", () => {
      // Run once
      initializeTouchFeedback();
      const firstStyle = document.getElementById("touch-feedback-styles");

      // Run again
      initializeTouchFeedback();
      const styles = document.querySelectorAll("#touch-feedback-styles");

      expect(styles.length).toBe(1);
      expect(document.getElementById("touch-feedback-styles")).toBe(firstStyle);
    });
  });

  describe("default export", () => {
    it("should export all utilities", () => {
      expect(touchFeedback.hapticFeedback).toBeDefined();
      expect(touchFeedback.touchFeedbackClasses).toBeDefined();
      expect(touchFeedback.withHapticFeedback).toBeDefined();
      expect(touchFeedback.getButtonClasses).toBeDefined();
      expect(touchFeedback.useTouchFeedback).toBeDefined();
      expect(touchFeedback.initializeTouchFeedback).toBeDefined();
    });
  });
});
