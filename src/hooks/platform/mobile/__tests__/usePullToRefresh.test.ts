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

// Mock mobile detection to always return true
vi.mock("@/hooks/platform/common/useMobileDetection", () => ({
  useMobileDetection: vi.fn(() => true),
}));

// Mock Framer Motion
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

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

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

  it("should start pulling when pan starts at top of container", async () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh), { wrapper });

    // Mock container at top
    const mockContainer = { scrollTop: 0 } as HTMLDivElement;
    result.current.containerRef.current = mockContainer;

    await act(async () => {
      const mockPanInfo: PanInfo = {
        point: { x: 0, y: 0 },
        delta: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
      };
      result.current.dragHandlers.onPanStart(new PointerEvent("pointerdown"), mockPanInfo);
    });

    await waitFor(() => {
      expect(result.current.isPulling).toBe(true);
    });
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
      result.current.dragHandlers.onPanStart(new PointerEvent("pointerdown"), mockPanInfo);
    });

    expect(result.current.isPulling).toBe(false);
  });

  it("should update pull distance during pan", async () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh), { wrapper });

    // Start pull
    const mockContainer = { scrollTop: 0 } as HTMLDivElement;
    result.current.containerRef.current = mockContainer;

    await act(async () => {
      const mockPanInfo: PanInfo = {
        point: { x: 0, y: 0 },
        delta: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
      };
      result.current.dragHandlers.onPanStart(new PointerEvent("pointerdown"), mockPanInfo);
    });

    // Pan down
    await act(async () => {
      const mockPanInfo: PanInfo = {
        point: { x: 0, y: 100 },
        delta: { x: 0, y: 100 },
        offset: { x: 0, y: 100 },
        velocity: { x: 0, y: 5 },
      };
      result.current.dragHandlers.onPan(new PointerEvent("pointermove"), mockPanInfo);
    });

    await waitFor(() => {
      expect(result.current.pullDistance).toBeGreaterThan(0);
      expect(result.current.isPulling).toBe(true);
    });
  });

  it("should calculate pull progress correctly", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh, { threshold: 80 }), {
      wrapper,
    });

    const mockContainer = { scrollTop: 0 } as HTMLDivElement;
    result.current.containerRef.current = mockContainer;

    act(() => {
      const mockPanInfo: PanInfo = {
        point: { x: 0, y: 0 },
        delta: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
      };
      result.current.dragHandlers.onPanStart(new PointerEvent("pointerdown"), mockPanInfo);
    });

    act(() => {
      const mockPanInfo: PanInfo = {
        point: { x: 0, y: 100 },
        delta: { x: 0, y: 100 },
        offset: { x: 0, y: 100 },
        velocity: { x: 0, y: 5 },
      };
      result.current.dragHandlers.onPan(new PointerEvent("pointermove"), mockPanInfo);
    });

    // Pull progress should be between 0 and 1
    expect(result.current.pullProgress).toBeGreaterThanOrEqual(0);
    expect(result.current.pullProgress).toBeLessThanOrEqual(1);
  });

  it("should trigger refresh when pull distance exceeds threshold", async () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh, { threshold: 80 }), {
      wrapper,
    });

    const mockContainer = { scrollTop: 0 } as HTMLDivElement;
    result.current.containerRef.current = mockContainer;

    act(() => {
      const mockPanInfo: PanInfo = {
        point: { x: 0, y: 0 },
        delta: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
      };
      result.current.dragHandlers.onPanStart(new PointerEvent("pointerdown"), mockPanInfo);
    });

    act(() => {
      const mockPanInfo: PanInfo = {
        point: { x: 0, y: 250 },
        delta: { x: 0, y: 250 },
        offset: { x: 0, y: 250 },
        velocity: { x: 0, y: 5 },
      };
      result.current.dragHandlers.onPan(new PointerEvent("pointermove"), mockPanInfo);
    });

    await act(async () => {
      const mockPanInfo: PanInfo = {
        point: { x: 0, y: 250 },
        delta: { x: 0, y: 0 },
        offset: { x: 0, y: 250 },
        velocity: { x: 0, y: 0 },
      };
      await result.current.dragHandlers.onPanEnd(new PointerEvent("pointerup"), mockPanInfo);
    });

    await waitFor(() => {
      expect(mockOnRefresh).toHaveBeenCalled();
    });
  });

  it("should not trigger refresh when pull distance below threshold", async () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh, { threshold: 80 }), {
      wrapper,
    });

    const mockContainer = { scrollTop: 0 } as HTMLDivElement;
    result.current.containerRef.current = mockContainer;

    act(() => {
      const mockPanInfo: PanInfo = {
        point: { x: 0, y: 0 },
        delta: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
      };
      result.current.dragHandlers.onPanStart(new PointerEvent("pointerdown"), mockPanInfo);
    });

    act(() => {
      const mockPanInfo: PanInfo = {
        point: { x: 0, y: 30 },
        delta: { x: 0, y: 30 },
        offset: { x: 0, y: 30 },
        velocity: { x: 0, y: 2 },
      };
      result.current.dragHandlers.onPan(new PointerEvent("pointermove"), mockPanInfo);
    });

    await act(async () => {
      const mockPanInfo: PanInfo = {
        point: { x: 0, y: 30 },
        delta: { x: 0, y: 0 },
        offset: { x: 0, y: 30 },
        velocity: { x: 0, y: 0 },
      };
      await result.current.dragHandlers.onPanEnd(new PointerEvent("pointerup"), mockPanInfo);
    });

    expect(mockOnRefresh).not.toHaveBeenCalled();
  });

  it("should set isRefreshing state during refresh", async () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh, { threshold: 80 }), {
      wrapper,
    });

    const mockContainer = { scrollTop: 0 } as HTMLDivElement;
    result.current.containerRef.current = mockContainer;

    let resolveRefresh: (() => void) | null = null;
    mockOnRefresh.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRefresh = resolve;
        })
    );

    act(() => {
      const mockPanInfo: PanInfo = {
        point: { x: 0, y: 0 },
        delta: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
      };
      result.current.dragHandlers.onPanStart(new PointerEvent("pointerdown"), mockPanInfo);
    });

    act(() => {
      const mockPanInfo: PanInfo = {
        point: { x: 0, y: 250 },
        delta: { x: 0, y: 250 },
        offset: { x: 0, y: 250 },
        velocity: { x: 0, y: 5 },
      };
      result.current.dragHandlers.onPan(new PointerEvent("pointermove"), mockPanInfo);
    });

    const endPromise = act(async () => {
      const mockPanInfo: PanInfo = {
        point: { x: 0, y: 250 },
        delta: { x: 0, y: 0 },
        offset: { x: 0, y: 250 },
        velocity: { x: 0, y: 0 },
      };
      await result.current.dragHandlers.onPanEnd(new PointerEvent("pointerup"), mockPanInfo);
    });

    await waitFor(() => {
      expect(result.current.isRefreshing).toBe(true);
    });

    // Complete refresh
    act(() => {
      if (resolveRefresh) resolveRefresh();
    });

    await endPromise;

    await waitFor(() => {
      expect(result.current.isRefreshing).toBe(false);
    });
  });

  it("should not start pull when disabled", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh, { enabled: false }), {
      wrapper,
    });

    const mockContainer = { scrollTop: 0 } as HTMLDivElement;
    result.current.containerRef.current = mockContainer;

    act(() => {
      const mockPanInfo: PanInfo = {
        point: { x: 0, y: 0 },
        delta: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
      };
      result.current.dragHandlers.onPanStart(new PointerEvent("pointerdown"), mockPanInfo);
    });

    expect(result.current.isPulling).toBe(false);
  });

  it("should handle refresh errors gracefully", async () => {
    mockOnRefresh.mockRejectedValue(new Error("Refresh failed"));

    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh, { threshold: 80 }), {
      wrapper,
    });

    const mockContainer = { scrollTop: 0 } as HTMLDivElement;
    result.current.containerRef.current = mockContainer;

    act(() => {
      const mockPanInfo: PanInfo = {
        point: { x: 0, y: 0 },
        delta: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
      };
      result.current.dragHandlers.onPanStart(new PointerEvent("pointerdown"), mockPanInfo);
    });

    act(() => {
      const mockPanInfo: PanInfo = {
        point: { x: 0, y: 250 },
        delta: { x: 0, y: 250 },
        offset: { x: 0, y: 250 },
        velocity: { x: 0, y: 5 },
      };
      result.current.dragHandlers.onPan(new PointerEvent("pointermove"), mockPanInfo);
    });

    await act(async () => {
      const mockPanInfo: PanInfo = {
        point: { x: 0, y: 250 },
        delta: { x: 0, y: 0 },
        offset: { x: 0, y: 250 },
        velocity: { x: 0, y: 0 },
      };
      await result.current.dragHandlers.onPanEnd(new PointerEvent("pointerup"), mockPanInfo);
    });

    // Should not throw and should reset state
    await waitFor(() => {
      expect(result.current.isRefreshing).toBe(false);
      expect(result.current.isPulling).toBe(false);
    });
  });

  it("should clean up on unmount", () => {
    const { unmount } = renderHook(() => usePullToRefresh(mockOnRefresh), { wrapper });

    expect(() => unmount()).not.toThrow();
  });

  it("should invalidate query cache when refresh is triggered", async () => {
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(
      () => usePullToRefresh(mockOnRefresh, { threshold: 80, invalidateCache: true }),
      { wrapper }
    );

    const mockContainer = { scrollTop: 0 } as HTMLDivElement;
    result.current.containerRef.current = mockContainer;

    act(() => {
      const mockPanInfo: PanInfo = {
        point: { x: 0, y: 0 },
        delta: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
      };
      result.current.dragHandlers.onPanStart(new PointerEvent("pointerdown"), mockPanInfo);
    });

    act(() => {
      const mockPanInfo: PanInfo = {
        point: { x: 0, y: 250 },
        delta: { x: 0, y: 250 },
        offset: { x: 0, y: 250 },
        velocity: { x: 0, y: 5 },
      };
      result.current.dragHandlers.onPan(new PointerEvent("pointermove"), mockPanInfo);
    });

    await act(async () => {
      const mockPanInfo: PanInfo = {
        point: { x: 0, y: 250 },
        delta: { x: 0, y: 0 },
        offset: { x: 0, y: 250 },
        velocity: { x: 0, y: 0 },
      };
      await result.current.dragHandlers.onPanEnd(new PointerEvent("pointerup"), mockPanInfo);
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalled();
    });
  });

  it("should not invalidate cache when invalidateCache is false", async () => {
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(
      () => usePullToRefresh(mockOnRefresh, { threshold: 80, invalidateCache: false }),
      { wrapper }
    );

    const mockContainer = { scrollTop: 0 } as HTMLDivElement;
    result.current.containerRef.current = mockContainer;

    act(() => {
      const mockPanInfo: PanInfo = {
        point: { x: 0, y: 0 },
        delta: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
      };
      result.current.dragHandlers.onPanStart(new PointerEvent("pointerdown"), mockPanInfo);
    });

    act(() => {
      const mockPanInfo: PanInfo = {
        point: { x: 0, y: 250 },
        delta: { x: 0, y: 250 },
        offset: { x: 0, y: 250 },
        velocity: { x: 0, y: 5 },
      };
      result.current.dragHandlers.onPan(new PointerEvent("pointermove"), mockPanInfo);
    });

    await act(async () => {
      const mockPanInfo: PanInfo = {
        point: { x: 0, y: 250 },
        delta: { x: 0, y: 0 },
        offset: { x: 0, y: 250 },
        velocity: { x: 0, y: 0 },
      };
      await result.current.dragHandlers.onPanEnd(new PointerEvent("pointerup"), mockPanInfo);
    });

    await waitFor(() => {
      expect(mockOnRefresh).toHaveBeenCalled();
    });

    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
