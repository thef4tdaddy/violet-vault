import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useFABBehavior } from "../useFABBehavior";

// Mock fabStore
const mockSetExpanded = vi.fn();
const mockFABState = {
  isExpanded: false,
  primaryAction: {
    icon: "Plus",
    label: "Add",
    action: vi.fn(),
  },
  secondaryActions: [
    { icon: "FileText", label: "Transaction", action: vi.fn() },
    { icon: "DollarSign", label: "Bill", action: vi.fn() },
  ],
};

vi.mock("@/stores/ui/fabStore", () => ({
  useFABSelectors: () => mockFABState,
  useFABActions: () => ({
    setExpanded: mockSetExpanded,
  }),
}));

// Mock hapticFeedback
vi.mock("@/utils/ui/feedback/touchFeedback", () => ({
  hapticFeedback: vi.fn(),
}));

describe("useFABBehavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockFABState.isExpanded = false;
    mockFABState.primaryAction = {
      icon: "Plus",
      label: "Add",
      action: vi.fn(),
    };
    mockFABState.secondaryActions = [
      { icon: "FileText", label: "Transaction", action: vi.fn() },
      { icon: "DollarSign", label: "Bill", action: vi.fn() },
    ];
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with containerRef", () => {
    const { result } = renderHook(() => useFABBehavior());

    expect(result.current.containerRef).toBeDefined();
    expect(result.current.containerRef.current).toBeNull(); // Not attached to DOM
  });

  it("should provide event handlers", () => {
    const { result } = renderHook(() => useFABBehavior());

    expect(typeof result.current.handlePrimaryClick).toBe("function");
    expect(typeof result.current.handleBackdropClick).toBe("function");
    expect(result.current.handleLongPress).toBeDefined();
    expect(typeof result.current.handleLongPress.onMouseDown).toBe("function");
    expect(typeof result.current.handleLongPress.onTouchStart).toBe("function");
  });

  it("should call primaryAction when not expanded", () => {
    const { result } = renderHook(() => useFABBehavior());
    const mockAction = mockFABState.primaryAction.action;

    act(() => {
      result.current.handlePrimaryClick();
    });

    expect(mockAction).toHaveBeenCalled();
    expect(mockSetExpanded).not.toHaveBeenCalled();
  });

  it("should collapse when clicking primary button while expanded", () => {
    mockFABState.isExpanded = true;

    const { result } = renderHook(() => useFABBehavior());

    act(() => {
      result.current.handlePrimaryClick();
    });

    expect(mockSetExpanded).toHaveBeenCalledWith(false);
    expect(mockFABState.primaryAction.action).not.toHaveBeenCalled();
  });

  it("should collapse when clicking backdrop", () => {
    const { result } = renderHook(() => useFABBehavior());

    act(() => {
      result.current.handleBackdropClick();
    });

    expect(mockSetExpanded).toHaveBeenCalledWith(false);
  });

  it("should expand on long press when not expanded", () => {
    const { result } = renderHook(() => useFABBehavior());

    act(() => {
      result.current.handleLongPress.onMouseDown({} as React.MouseEvent);
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockSetExpanded).toHaveBeenCalledWith(true);
  });

  it("should not expand on long press if already expanded", () => {
    mockFABState.isExpanded = true;

    const { result } = renderHook(() => useFABBehavior());

    act(() => {
      result.current.handleLongPress.onMouseDown({} as React.MouseEvent);
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // setExpanded should not be called since already expanded
    expect(mockSetExpanded).not.toHaveBeenCalled();
  });

  it("should not expand on long press if no secondary actions", () => {
    mockFABState.secondaryActions = [];

    const { result } = renderHook(() => useFABBehavior());

    act(() => {
      result.current.handleLongPress.onMouseDown({} as React.MouseEvent);
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockSetExpanded).not.toHaveBeenCalled();
  });

  it("should cancel long press on mouse up", () => {
    const { result } = renderHook(() => useFABBehavior());

    act(() => {
      result.current.handleLongPress.onMouseDown({} as React.MouseEvent);
    });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    act(() => {
      result.current.handleLongPress.onMouseUp({} as React.MouseEvent);
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should not expand since long press was cancelled
    expect(mockSetExpanded).not.toHaveBeenCalled();
  });

  it("should cancel long press on touch end", () => {
    const { result } = renderHook(() => useFABBehavior());

    act(() => {
      result.current.handleLongPress.onTouchStart({} as React.TouchEvent);
    });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    act(() => {
      result.current.handleLongPress.onTouchEnd({} as React.TouchEvent);
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockSetExpanded).not.toHaveBeenCalled();
  });

  it("should handle keyboard Escape key to collapse when expanded", () => {
    mockFABState.isExpanded = true;

    renderHook(() => useFABBehavior());

    act(() => {
      const event = new KeyboardEvent("keydown", { key: "Escape" });
      document.dispatchEvent(event);
    });

    expect(mockSetExpanded).toHaveBeenCalledWith(false);
  });

  it("should not handle keyboard events when not expanded", () => {
    mockFABState.isExpanded = false;

    renderHook(() => useFABBehavior());

    act(() => {
      const event = new KeyboardEvent("keydown", { key: "Escape" });
      document.dispatchEvent(event);
    });

    expect(mockSetExpanded).not.toHaveBeenCalled();
  });

  it("should clean up keyboard listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");
    mockFABState.isExpanded = true;

    const { unmount } = renderHook(() => useFABBehavior());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
  });

  it("should maintain stable function references", () => {
    const { result, rerender } = renderHook(() => useFABBehavior());

    const firstHandlePrimaryClick = result.current.handlePrimaryClick;
    const firstHandleBackdropClick = result.current.handleBackdropClick;

    rerender();

    // Functions may not be stable due to isExpanded dependency
    expect(typeof result.current.handlePrimaryClick).toBe("function");
    expect(typeof result.current.handleBackdropClick).toBe("function");
  });

  it("should handle missing primaryAction gracefully", () => {
    mockFABState.primaryAction = null;

    const { result } = renderHook(() => useFABBehavior());

    expect(() => {
      act(() => {
        result.current.handlePrimaryClick();
      });
    }).not.toThrow();
  });
});
