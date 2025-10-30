import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useCorruptionDetection } from "../useCorruptionDetection";

// Mock logger
vi.mock("@/utils/common/logger", () => ({
  default: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("useCorruptionDetection", () => {
  let eventListenerMap: Record<string, EventListener>;

  beforeEach(() => {
    vi.clearAllMocks();
    eventListenerMap = {};

    // Mock addEventListener and removeEventListener
    vi.spyOn(window, "addEventListener").mockImplementation((event, handler) => {
      eventListenerMap[event] = handler as EventListener;
    });

    vi.spyOn(window, "removeEventListener").mockImplementation((event) => {
      delete eventListenerMap[event];
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize with showCorruptionModal as false", () => {
    const { result } = renderHook(() => useCorruptionDetection());

    expect(result.current.showCorruptionModal).toBe(false);
  });

  it("should add event listener on mount", () => {
    renderHook(() => useCorruptionDetection());

    expect(window.addEventListener).toHaveBeenCalledWith(
      "syncCorruptionDetected",
      expect.any(Function)
    );
  });

  it("should set showCorruptionModal to true when syncCorruptionDetected event is fired", () => {
    const { result } = renderHook(() => useCorruptionDetection());

    expect(result.current.showCorruptionModal).toBe(false);

    // Fire the custom event
    act(() => {
      const event = new CustomEvent("syncCorruptionDetected", {
        detail: { message: "Test corruption detected" },
      });
      eventListenerMap["syncCorruptionDetected"](event);
    });

    expect(result.current.showCorruptionModal).toBe(true);
  });

  it("should allow manually setting showCorruptionModal", () => {
    const { result } = renderHook(() => useCorruptionDetection());

    expect(result.current.showCorruptionModal).toBe(false);

    act(() => {
      result.current.setShowCorruptionModal(true);
    });

    expect(result.current.showCorruptionModal).toBe(true);

    act(() => {
      result.current.setShowCorruptionModal(false);
    });

    expect(result.current.showCorruptionModal).toBe(false);
  });

  it("should remove event listener on unmount", () => {
    const { unmount } = renderHook(() => useCorruptionDetection());

    expect(eventListenerMap["syncCorruptionDetected"]).toBeDefined();

    unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith(
      "syncCorruptionDetected",
      expect.any(Function)
    );
  });

  it("should handle multiple event firings", () => {
    const { result } = renderHook(() => useCorruptionDetection());

    // Fire event multiple times
    act(() => {
      const event1 = new CustomEvent("syncCorruptionDetected", {
        detail: { message: "First corruption" },
      });
      eventListenerMap["syncCorruptionDetected"](event1);
    });

    expect(result.current.showCorruptionModal).toBe(true);

    // Reset manually
    act(() => {
      result.current.setShowCorruptionModal(false);
    });

    expect(result.current.showCorruptionModal).toBe(false);

    // Fire again
    act(() => {
      const event2 = new CustomEvent("syncCorruptionDetected", {
        detail: { message: "Second corruption" },
      });
      eventListenerMap["syncCorruptionDetected"](event2);
    });

    expect(result.current.showCorruptionModal).toBe(true);
  });
});
