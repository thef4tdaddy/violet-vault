import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { usePullToRefresh } from "../usePullToRefresh";

// Mock hapticFeedback
vi.mock("@/utils/ui/feedback/touchFeedback", () => ({
  hapticFeedback: vi.fn(),
}));

// Mock framer-motion unique values
const mockMotionValue = {
  get: () => 0,
  set: vi.fn(),
  onChange: vi.fn(),
  on: vi.fn(),
  destroy: vi.fn(),
};

vi.mock("framer-motion", () => ({
  useMotionValue: () => mockMotionValue,
  useSpring: (source: any) => source,
  useTransform: (value: any) => value,
}));

// Mock useQueryClient
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

// Mock useMobileDetection - REMOVED, using window resize instead

describe("usePullToRefresh", () => {
  let mockOnRefresh: Mock<() => Promise<void>>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnRefresh = vi.fn().mockResolvedValue(undefined);

    // Simulate mobile device
    window.innerWidth = 375;
    window.dispatchEvent(new Event("resize"));
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh));

    expect(result.current.isPulling).toBe(false);
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.pullDistance).toBe(0);
    expect(result.current.pullProgress).toBe(0);
    expect(result.current.isReady).toBe(false);
  });

  it("should provide drag handlers", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh));

    expect(typeof result.current.dragHandlers.onPanStart).toBe("function");
    expect(typeof result.current.dragHandlers.onPan).toBe("function");
    expect(typeof result.current.dragHandlers.onPanEnd).toBe("function");
  });

  it("should provide containerRef", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh));

    expect(result.current.containerRef).toBeDefined();
    expect(result.current.containerRef.current).toBeNull();
  });

  it("should start pulling when pan starts at top of container", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh));

    // Mock container at top
    const mockContainer = { scrollTop: 0 };
    result.current.containerRef.current = mockContainer as unknown as HTMLDivElement;

    act(() => {
      const event = {} as PointerEvent;
      const info = { offset: { x: 0, y: 0 } } as any;
      result.current.dragHandlers.onPanStart(event, info);
    });

    expect(result.current.isPulling).toBe(true);
  });

  it("should not start pulling when not at top of container", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh));

    // Mock container scrolled down
    const mockContainer = { scrollTop: 50 };
    result.current.containerRef.current = mockContainer as unknown as HTMLDivElement;

    act(() => {
      const event = {} as PointerEvent;
      const info = { offset: { x: 0, y: 0 } } as any;
      result.current.dragHandlers.onPanStart(event, info);
    });

    expect(result.current.isPulling).toBe(false);
  });

  it("should update pull distance during pan", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh));

    // Start pull
    const mockContainer = { scrollTop: 0 };
    result.current.containerRef.current = mockContainer as unknown as HTMLDivElement;

    act(() => {
      const event = {} as PointerEvent;
      const info = { offset: { x: 0, y: 0 } } as any;
      result.current.dragHandlers.onPanStart(event, info);
    });

    // Move finger down
    act(() => {
      const event = {} as PointerEvent;
      const info = { offset: { x: 0, y: 100 } } as any;
      result.current.dragHandlers.onPan(event, info);
    });

    expect(result.current.pullDistance).toBeGreaterThan(0);
    expect(result.current.isPulling).toBe(true);
  });

  it("should calculate pull progress correctly", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh, { threshold: 80 }));

    const mockContainer = { scrollTop: 0 };
    result.current.containerRef.current = mockContainer as unknown as HTMLDivElement;

    act(() => {
      result.current.dragHandlers.onPanStart({} as PointerEvent, {} as any);
    });

    act(() => {
      result.current.dragHandlers.onPan({} as PointerEvent, { offset: { x: 0, y: 100 } } as any);
    });

    // Pull progress should be between 0 and 1
    expect(result.current.pullProgress).toBeGreaterThanOrEqual(0);
    expect(result.current.pullProgress).toBeLessThanOrEqual(1);
  });

  it("should trigger refresh when pull distance exceeds threshold", async () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh, { threshold: 80 }));

    const mockContainer = { scrollTop: 0 };
    result.current.containerRef.current = mockContainer as unknown as HTMLDivElement;

    act(() => {
      result.current.dragHandlers.onPanStart({} as PointerEvent, {} as any);
    });

    act(() => {
      // Pull down significantly to ensure threshold is crossed
      // Resistance is 2.5, so 400px pull results in 160px distance (> 80)
      result.current.dragHandlers.onPan({} as PointerEvent, { offset: { x: 0, y: 400 } } as any);
    });

    await act(async () => {
      await result.current.dragHandlers.onPanEnd({} as PointerEvent, {} as any);
    });

    expect(mockOnRefresh).toHaveBeenCalled();
  });

  it("should not trigger refresh when pull distance below threshold", async () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh, { threshold: 80 }));

    const mockContainer = { scrollTop: 0 };
    result.current.containerRef.current = mockContainer as unknown as HTMLDivElement;

    act(() => {
      result.current.dragHandlers.onPanStart({} as PointerEvent, {} as any);
    });

    act(() => {
      // Pull down a little bit
      result.current.dragHandlers.onPan({} as PointerEvent, { offset: { x: 0, y: 50 } } as any);
    });

    await act(async () => {
      await result.current.dragHandlers.onPanEnd({} as PointerEvent, {} as any);
    });

    expect(mockOnRefresh).not.toHaveBeenCalled();
  });

  it("should not start pull when disabled", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh, { enabled: false }));

    const mockContainer = { scrollTop: 0 };
    result.current.containerRef.current = mockContainer as unknown as HTMLDivElement;

    act(() => {
      result.current.dragHandlers.onPanStart({} as PointerEvent, {} as any);
    });

    expect(result.current.isPulling).toBe(false);
  });

  it("should provide motion values", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh));

    expect(result.current.motionY).toBeDefined();
    expect(result.current.springY).toBeDefined();
    expect(result.current.pullRotation).toBeDefined();
  });

  it("should handle refresh errors gracefully", async () => {
    mockOnRefresh.mockRejectedValue(new Error("Refresh failed"));

    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh, { threshold: 80 }));

    const mockContainer = { scrollTop: 0 };
    result.current.containerRef.current = mockContainer as unknown as HTMLDivElement;

    act(() => {
      result.current.dragHandlers.onPanStart({} as PointerEvent, {} as any);
    });

    act(() => {
      result.current.dragHandlers.onPan({} as PointerEvent, { offset: { x: 0, y: 400 } } as any);
    });

    await act(async () => {
      await result.current.dragHandlers.onPanEnd({} as PointerEvent, {} as any);
    });

    // Should not throw and should reset state
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.isPulling).toBe(false);
  });

  it("should clean up on unmount", () => {
    const { unmount } = renderHook(() => usePullToRefresh(mockOnRefresh));

    expect(() => unmount()).not.toThrow();
  });
});
