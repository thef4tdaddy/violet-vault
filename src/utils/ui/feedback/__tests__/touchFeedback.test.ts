/**
 * @jest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import feedbackUtils, {
  hapticFeedback,
  useTouchFeedback,
  getButtonClasses,
} from "../touchFeedback";
import { renderHook } from "@testing-library/react";

describe("Touch Feedback Utils", () => {
  describe("hapticFeedback", () => {
    let vibrateMock: any;

    beforeEach(() => {
      vibrateMock = vi.fn();
      Object.defineProperty(navigator, "vibrate", {
        value: vibrateMock,
        writable: true,
        configurable: true,
      });

      // Mock matchMedia
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(), // deprecated
          removeListener: vi.fn(), // deprecated
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should vibrate with default pattern", () => {
      const result = hapticFeedback();
      expect(result).toBe(true);
      expect(vibrateMock).toHaveBeenCalledWith([10]);
    });

    it("should vibrate with specific pattern", () => {
      hapticFeedback(10, "success");
      expect(vibrateMock).toHaveBeenCalledWith([20, 10, 20, 10, 30]);
    });

    it("should return false if vibrate is not supported", () => {
      Object.defineProperty(navigator, "vibrate", { value: undefined });
      const result = hapticFeedback();
      expect(result).toBe(false);
    });

    it("should respect reduced motion preference", () => {
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: true, // Reduced motion IS preferred
          media: query,
        })),
      });

      const result = hapticFeedback();
      expect(result).toBe(false);
      expect(vibrateMock).not.toHaveBeenCalled();
    });
  });

  describe("getButtonClasses", () => {
    it("should append touch classes", () => {
      const base = "bg-blue-500 rounded";
      const result = getButtonClasses(base, "primary");
      expect(result).toContain("bg-blue-500 rounded");
      expect(result).toContain("active:scale-95");
    });

    it("should clean existing transition classes", () => {
      const base = "bg-red-500 transition-all duration-300 transform";
      const result = getButtonClasses(base, "primary");
      expect(result).not.toContain("duration-300");
      expect(result).not.toContain("\btransform\b"); // Should be removed from base and added by touch classes
      expect(result).toContain("active:scale-95");
    });
  });

  describe("useTouchFeedback", () => {
    it("should handle touch start", () => {
      const { result } = renderHook(() => useTouchFeedback("tap", "primary"));

      // Just assert it doesn't crash
      result.current.onTouchStart({} as any);
      expect(result.current.className).toContain("active:scale-95");
    });

    it("should handle click on non-touch devices", () => {
      const { result } = renderHook(() => useTouchFeedback("tap", "primary"));
      const spy = vi.fn();

      // Ensure no ontouchstart
      // @ts-ignore
      delete window.ontouchstart;

      const handler = result.current.onClick(spy);
      handler("arg");

      // Verify the original handler is called
      expect(spy).toHaveBeenCalledWith("arg");
    });
  });
});
