import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { usePullToRefresh } from "../usePullToRefresh";
import type { PanInfo } from "framer-motion";

// Mock dependencies
vi.mock("@/utils/ui/feedback/touchFeedback", () => ({
  hapticFeedback: vi.fn(),
}));

vi.mock("@/hooks/platform/common/useMobileDetection", () => ({
  useMobileDetection: vi.fn(() => true),
}));

vi.mock("framer-motion", () => ({
  useMotionValue: vi.fn((initialValue: number) => {
    let value = initialValue;
    return {
      get: () => value,
      set: (newValue: number) => {
        value = newValue;
      },
    };
  }),
  useSpring: vi.fn((motionValue) => motionValue),
  useTransform: vi.fn(() => ({
    get: () => 0,
  })),
}));

describe("usePullToRefresh - Framer Motion Implementation", () => {
  let mockOnRefresh: ReturnType<typeof vi.fn>;
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnRefresh = vi.fn().mockResolvedValue(undefined);
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("should initialize with default state", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh), { wrapper });

    expect(result.current.isPulling).toBe(false);
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.pullDistance).toBe(0);
    expect(result.current.pullProgress).toBe(0);
    expect(result.current.isReady).toBe(false);
    expect(result.current.isEnabled).toBe(true); // Mobile by default
  });

  it("should provide Framer Motion drag handlers", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh), { wrapper });

    expect(typeof result.current.dragHandlers.onPanStart).toBe("function");
    expect(typeof result.current.dragHandlers.onPan).toBe("function");
    expect(typeof result.current.dragHandlers.onPanEnd).toBe("function");
  });

  it("should provide containerRef", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh), { wrapper });

    expect(result.current.containerRef).toBeDefined();
    expect(result.current.containerRef.current).toBeNull();
  });

  it("should provide Framer Motion values", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh), { wrapper });

    expect(result.current.motionY).toBeDefined();
    expect(result.current.springY).toBeDefined();
    expect(result.current.pullRotation).toBeDefined();
  });

  it("should start pulling when pan starts at top of container", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh), { wrapper });

    // Mock container at top
    const mockContainer = { scrollTop: 0 } as HTMLDivElement;
    result.current.containerRef.current = mockContainer;

    act(() => {
      const mockPanInfo: PanInfo = {
        point: { x: 0, y: 0 },
        delta: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
      };
      result.current.dragHandlers.onPanStart(
        new PointerEvent("pointerdown"),
        mockPanInfo
      );
    });

    expect(result.current.isPulling).toBe(true);
  });

  it("should not start pulling when not at top of container", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh), { wrapper });

    // Mock container scrolled down
    const mockContainer = { scrollTop: 50 } as HTMLDivElement;
    result.current.containerRef.current = mockContainer;

    act(() => {
      const mockPanInfo: PanInfo = {
        point: { x: 0, y: 0 },
        delta: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
      };
      result.current.dragHandlers.onPanStart(
        new PointerEvent("pointerdown"),
        mockPanInfo
      );

    expect(result.current.pullDistance).toBeGreaterThan(0);
    expect(result.current.isPulling).toBe(true);
  });

  it("should calculate pull progress correctly", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh, { threshold: 80 }));

    const mockContainer = { scrollTop: 0 };
    result.current.containerRef.current = mockContainer as HTMLElement;

    act(() => {
      result.current.touchHandlers.onTouchStart({
        touches: [{ clientY: 100 }],
      } as unknown as React.TouchEvent);
    });

    act(() => {
      result.current.touchHandlers.onTouchMove({
        touches: [{ clientY: 200 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent);
    });

    // Pull progress should be between 0 and 1
    expect(result.current.pullProgress).toBeGreaterThanOrEqual(0);
    expect(result.current.pullProgress).toBeLessThanOrEqual(1);
  });

  it("should trigger refresh when pull distance exceeds threshold", async () => {
    const { result } = renderHook(() =>
      usePullToRefresh(mockOnRefresh, { threshold: 80, resistance: 1 })
    );

    const mockContainer = { scrollTop: 0 };
    result.current.containerRef.current = mockContainer as HTMLElement;

    act(() => {
      result.current.touchHandlers.onTouchStart({
        touches: [{ clientY: 100 }],
      } as unknown as React.TouchEvent);
    });

    act(() => {
      result.current.touchHandlers.onTouchMove({
        touches: [{ clientY: 200 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent);
    });

    await act(async () => {
      await result.current.touchHandlers.onTouchEnd();
    });

    expect(mockOnRefresh).toHaveBeenCalled();
  });

  it("should not trigger refresh when pull distance below threshold", async () => {
    const { result } = renderHook(() =>
      usePullToRefresh(mockOnRefresh, { threshold: 80, resistance: 5 })
    );

    const mockContainer = { scrollTop: 0 };
    result.current.containerRef.current = mockContainer as HTMLElement;

    act(() => {
      result.current.touchHandlers.onTouchStart({
        touches: [{ clientY: 100 }],
      } as unknown as React.TouchEvent);
    });

    act(() => {
      result.current.touchHandlers.onTouchMove({
        touches: [{ clientY: 130 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent);
    });

    await act(async () => {
      await result.current.touchHandlers.onTouchEnd();
    });

    expect(mockOnRefresh).not.toHaveBeenCalled();
  });

  it("should set isRefreshing state during refresh", async () => {
    const { result } = renderHook(() =>
      usePullToRefresh(mockOnRefresh, { threshold: 80, resistance: 1 })
    );

    const mockContainer = { scrollTop: 0 };
    result.current.containerRef.current = mockContainer as HTMLElement;

    let resolveRefresh: (() => void) | null = null;
    mockOnRefresh.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRefresh = resolve;
        })
    );

    act(() => {
      result.current.touchHandlers.onTouchStart({
        touches: [{ clientY: 100 }],
      } as unknown as React.TouchEvent);
    });

    act(() => {
      result.current.touchHandlers.onTouchMove({
        touches: [{ clientY: 200 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent);
    });

    // Start the touch end which will trigger refresh
    const endPromise = result.current.touchHandlers.onTouchEnd();

    // The implementation sets isRefreshing synchronously before awaiting onRefresh
    // Wait a tick for React state to update
    await act(async () => {
      await Promise.resolve();
    });

    // Verify isRefreshing is true during the refresh operation
    expect(result.current.isRefreshing).toBe(true);

    // Complete refresh
    act(() => {
      if (resolveRefresh) resolveRefresh();
    });

    await act(async () => {
      await endPromise;
    });

    // After refresh completes, state should be reset
    expect(result.current.isRefreshing).toBe(false);
  });

  it("should not start pull when disabled", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh, { enabled: false }));

    const mockContainer = { scrollTop: 0 };
    result.current.containerRef.current = mockContainer as HTMLElement;

    act(() => {
      result.current.touchHandlers.onTouchStart({
        touches: [{ clientY: 100 }],
      } as unknown as React.TouchEvent);
    });

    expect(result.current.isPulling).toBe(false);
  });

  it("should provide pull styles", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh));

    expect(result.current.pullStyles).toBeDefined();
    expect(result.current.pullStyles).toHaveProperty("transform");
    expect(result.current.pullStyles).toHaveProperty("transition");
  });

  it("should provide pull rotation", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh));

    expect(typeof result.current.pullRotation).toBe("number");
    expect(result.current.pullRotation).toBe(0); // Initial state
  });

  it("should handle refresh errors gracefully", async () => {
    mockOnRefresh.mockRejectedValue(new Error("Refresh failed"));

    const { result } = renderHook(() =>
      usePullToRefresh(mockOnRefresh, { threshold: 80, resistance: 1 })
    );

    const mockContainer = { scrollTop: 0 };
    result.current.containerRef.current = mockContainer as HTMLElement;

    act(() => {
      result.current.touchHandlers.onTouchStart({
        touches: [{ clientY: 100 }],
      } as unknown as React.TouchEvent);
    });

    act(() => {
      result.current.touchHandlers.onTouchMove({
        touches: [{ clientY: 200 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent);
    });

    await act(async () => {
      await result.current.touchHandlers.onTouchEnd();
    });

    // Should not throw and should reset state
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.isPulling).toBe(false);
  });

  it("should clean up on unmount", () => {
    const { unmount } = renderHook(() => usePullToRefresh(mockOnRefresh));

    expect(() => unmount()).not.toThrow();
  });

  it("should handle touch cancel same as touch end", async () => {
    const { result } = renderHook(() =>
      usePullToRefresh(mockOnRefresh, { threshold: 80, resistance: 1 })
    );

    const mockContainer = { scrollTop: 0 };
    result.current.containerRef.current = mockContainer as HTMLElement;

    act(() => {
      result.current.touchHandlers.onTouchStart({
        touches: [{ clientY: 100 }],
      } as unknown as React.TouchEvent);
    });

    act(() => {
      result.current.touchHandlers.onTouchMove({
        touches: [{ clientY: 200 }],
        preventDefault: vi.fn(),
      } as unknown as React.TouchEvent);
    });

    await act(async () => {
      await result.current.touchHandlers.onTouchCancel();
    });

    expect(result.current.isPulling).toBe(false);
    expect(result.current.pullDistance).toBe(0);
  });
});
