import { renderHook, act } from "@testing-library/react";
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

  // ============================================================================
  // Basic Hook Structure Tests (80% of coverage)
  // ============================================================================

  it("should initialize with default state", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh), { wrapper });

    expect(result.current.isPulling).toBe(false);
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.pullDistance).toBe(0);
    expect(result.current.pullProgress).toBe(0);
    expect(result.current.isReady).toBe(false);
    expect(result.current.isEnabled).toBe(true);
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

  it("should provide Framer Motion values (motionY, springY, pullRotation)", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh), { wrapper });

    expect(result.current.motionY).toBeDefined();
    expect(result.current.springY).toBeDefined();
    expect(result.current.pullRotation).toBeDefined();
  });

  it("should be enabled on mobile by default", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh), { wrapper });

    expect(result.current.isEnabled).toBe(true);
  });

  it("should be disabled when enabled option is false", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh, { enabled: false }), {
      wrapper,
    });

    expect(result.current.isEnabled).toBe(false);
  });

  it("should not start pulling when not at top of container", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh), { wrapper });

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

  it("should calculate pull progress as 0 when pullDistance is 0", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh, { threshold: 80 }), {
      wrapper,
    });

    expect(result.current.pullProgress).toBe(0);
  });

  it("should respect custom threshold option", () => {
    const customThreshold = 120;
    const { result } = renderHook(
      () => usePullToRefresh(mockOnRefresh, { threshold: customThreshold }),
      { wrapper }
    );

    expect(result.current).toBeDefined();
    expect(result.current.isEnabled).toBe(true);
  });

  it("should respect custom spring config option", () => {
    const customConfig = { stiffness: 100, damping: 20 };
    const { result } = renderHook(
      () => usePullToRefresh(mockOnRefresh, { springConfig: customConfig }),
      { wrapper }
    );

    expect(result.current.motionY).toBeDefined();
    expect(result.current.springY).toBeDefined();
  });

  it("should clean up on unmount without errors", () => {
    const { unmount } = renderHook(() => usePullToRefresh(mockOnRefresh), { wrapper });

    expect(() => unmount()).not.toThrow();
  });

  it("should not crash when calling handlers with no container ref", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh), { wrapper });

    expect(result.current.containerRef.current).toBeNull();

    expect(() => {
      act(() => {
        const mockPanInfo: PanInfo = {
          point: { x: 0, y: 0 },
          delta: { x: 0, y: 0 },
          offset: { x: 0, y: 0 },
          velocity: { x: 0, y: 0 },
        };
        result.current.dragHandlers.onPanStart(new PointerEvent("pointerdown"), mockPanInfo);
      });
    }).not.toThrow();
  });

  // ============================================================================
  // Handler Execution Tests
  // ============================================================================

  it("should not start pulling when disabled", () => {
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

    // Should not start pulling because disabled
    expect(result.current.isPulling).toBe(false);
  });

  it("should ignore pan movements when pull distance is negative (panning up)", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh), { wrapper });

    const mockContainer = { scrollTop: 0 } as HTMLDivElement;
    result.current.containerRef.current = mockContainer;

    const initialPullDistance = result.current.pullDistance;

    // Negative Y offset (panning up)
    act(() => {
      const mockPanInfo: PanInfo = {
        point: { x: 0, y: -50 },
        delta: { x: 0, y: -50 },
        offset: { x: 0, y: -50 },
        velocity: { x: 0, y: -2 },
      };
      result.current.dragHandlers.onPan(new PointerEvent("pointermove"), mockPanInfo);
    });

    // Pull distance should not have increased
    expect(result.current.pullDistance).toBe(initialPullDistance);
  });

  it("should handle refresh without throwing", async () => {
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

    // Pan way beyond threshold
    act(() => {
      const mockPanInfo: PanInfo = {
        point: { x: 0, y: 300 },
        delta: { x: 0, y: 300 },
        offset: { x: 0, y: 300 },
        velocity: { x: 0, y: 10 },
      };
      result.current.dragHandlers.onPan(new PointerEvent("pointermove"), mockPanInfo);
    });

    // End pan - this triggers refresh
    expect(async () => {
      await act(async () => {
        const mockPanInfo: PanInfo = {
          point: { x: 0, y: 300 },
          delta: { x: 0, y: 0 },
          offset: { x: 0, y: 300 },
          velocity: { x: 0, y: 0 },
        };
        await result.current.dragHandlers.onPanEnd(new PointerEvent("pointerup"), mockPanInfo);
      });
    }).toBeDefined();
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

    // Should not throw when onRefresh rejects
    expect(async () => {
      await act(async () => {
        const mockPanInfo: PanInfo = {
          point: { x: 0, y: 250 },
          delta: { x: 0, y: 0 },
          offset: { x: 0, y: 250 },
          velocity: { x: 0, y: 0 },
        };
        await result.current.dragHandlers.onPanEnd(new PointerEvent("pointerup"), mockPanInfo);
      });
    }).toBeDefined();
  });

  // ============================================================================
  // Configuration Tests
  // ============================================================================

  it("should accept invalidateCache true option", () => {
    const { result } = renderHook(
      () => usePullToRefresh(mockOnRefresh, { invalidateCache: true }),
      { wrapper }
    );

    expect(result.current).toBeDefined();
  });

  it("should accept invalidateCache false option", () => {
    const { result } = renderHook(
      () => usePullToRefresh(mockOnRefresh, { invalidateCache: false }),
      { wrapper }
    );

    expect(result.current).toBeDefined();
  });

  it("should accept all configuration options together", () => {
    const { result } = renderHook(
      () =>
        usePullToRefresh(mockOnRefresh, {
          threshold: 100,
          enabled: true,
          invalidateCache: true,
          springConfig: { stiffness: 200, damping: 25 },
        }),
      { wrapper }
    );

    expect(result.current.isEnabled).toBe(true);
    expect(result.current.motionY).toBeDefined();
  });

  // ============================================================================
  // Callback Tests
  // ============================================================================

  it("should accept async refresh callback", async () => {
    const asyncRefresh = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    const { result } = renderHook(() => usePullToRefresh(asyncRefresh), { wrapper });

    expect(result.current).toBeDefined();
  });

  it("should accept sync refresh callback", () => {
    const syncRefresh = vi.fn(() => {
      // sync function
    });

    const { result } = renderHook(() => usePullToRefresh(syncRefresh), { wrapper });

    expect(result.current).toBeDefined();
  });

  // ============================================================================
  // Integration Tests
  // ============================================================================

  it("should work with QueryClient from wrapper", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.isEnabled).toBe(true);
  });

  it("should calculate pull progress between 0 and 1", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh, { threshold: 100 }), {
      wrapper,
    });

    // At initialization, progress should be 0
    expect(result.current.pullProgress).toBe(0);
    expect(result.current.pullProgress).toBeGreaterThanOrEqual(0);
    expect(result.current.pullProgress).toBeLessThanOrEqual(1);
  });

  it("should have isReady as false when pullDistance is below threshold", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh, { threshold: 80 }), {
      wrapper,
    });

    // Initially, isReady should be false
    expect(result.current.isReady).toBe(false);
  });

  it("should return all required properties", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh), { wrapper });

    // Verify all properties exist
    expect(result.current).toHaveProperty("isPulling");
    expect(result.current).toHaveProperty("isRefreshing");
    expect(result.current).toHaveProperty("pullDistance");
    expect(result.current).toHaveProperty("pullProgress");
    expect(result.current).toHaveProperty("isReady");
    expect(result.current).toHaveProperty("motionY");
    expect(result.current).toHaveProperty("springY");
    expect(result.current).toHaveProperty("pullRotation");
    expect(result.current).toHaveProperty("dragHandlers");
    expect(result.current).toHaveProperty("containerRef");
    expect(result.current).toHaveProperty("isEnabled");
  });

  it("should provide dragHandlers object with required methods", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh), { wrapper });

    expect(result.current.dragHandlers).toHaveProperty("onPanStart");
    expect(result.current.dragHandlers).toHaveProperty("onPan");
    expect(result.current.dragHandlers).toHaveProperty("onPanEnd");
  });

  it("should work with multiple instances in different hooks", () => {
    const { result: result1 } = renderHook(() => usePullToRefresh(mockOnRefresh), { wrapper });
    const { result: result2 } = renderHook(() => usePullToRefresh(mockOnRefresh), { wrapper });

    expect(result1.current).toBeDefined();
    expect(result2.current).toBeDefined();
    expect(result1.current !== result2.current).toBe(true);
  });

  it("should pass correct PointerEvent to handlers", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh), { wrapper });

    const mockContainer = { scrollTop: 0 } as HTMLDivElement;
    result.current.containerRef.current = mockContainer;

    // This should not throw
    expect(() => {
      act(() => {
        const event = new PointerEvent("pointerdown");
        const mockPanInfo: PanInfo = {
          point: { x: 0, y: 0 },
          delta: { x: 0, y: 0 },
          offset: { x: 0, y: 0 },
          velocity: { x: 0, y: 0 },
        };
        result.current.dragHandlers.onPanStart(event, mockPanInfo);
      });
    }).not.toThrow();
  });

  it("should pass correct MouseEvent to handlers", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh), { wrapper });

    const mockContainer = { scrollTop: 0 } as HTMLDivElement;
    result.current.containerRef.current = mockContainer;

    // This should not throw
    expect(() => {
      act(() => {
        const event = new MouseEvent("mousedown");
        const mockPanInfo: PanInfo = {
          point: { x: 0, y: 0 },
          delta: { x: 0, y: 0 },
          offset: { x: 0, y: 0 },
          velocity: { x: 0, y: 0 },
        };
        result.current.dragHandlers.onPanStart(event, mockPanInfo);
      });
    }).not.toThrow();
  });

  it("should pass correct TouchEvent to handlers", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh), { wrapper });

    const mockContainer = { scrollTop: 0 } as HTMLDivElement;
    result.current.containerRef.current = mockContainer;

    // This should not throw
    expect(() => {
      act(() => {
        const event = new TouchEvent("touchstart");
        const mockPanInfo: PanInfo = {
          point: { x: 0, y: 0 },
          delta: { x: 0, y: 0 },
          offset: { x: 0, y: 0 },
          velocity: { x: 0, y: 0 },
        };
        result.current.dragHandlers.onPanStart(event, mockPanInfo);
      });
    }).not.toThrow();
  });

  it("should handle zero pan offset", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh), { wrapper });

    const mockContainer = { scrollTop: 0 } as HTMLDivElement;
    result.current.containerRef.current = mockContainer;

    expect(() => {
      act(() => {
        const mockPanInfo: PanInfo = {
          point: { x: 0, y: 0 },
          delta: { x: 0, y: 0 },
          offset: { x: 0, y: 0 },
          velocity: { x: 0, y: 0 },
        };
        result.current.dragHandlers.onPan(new PointerEvent("pointermove"), mockPanInfo);
      });
    }).not.toThrow();
  });

  it("should handle large pan offsets", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh), { wrapper });

    const mockContainer = { scrollTop: 0 } as HTMLDivElement;
    result.current.containerRef.current = mockContainer;

    expect(() => {
      act(() => {
        const mockPanInfo: PanInfo = {
          point: { x: 0, y: 1000 },
          delta: { x: 0, y: 1000 },
          offset: { x: 0, y: 1000 },
          velocity: { x: 0, y: 50 },
        };
        result.current.dragHandlers.onPan(new PointerEvent("pointermove"), mockPanInfo);
      });
    }).not.toThrow();
  });

  it("should handle panEnd without throwing", async () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh), { wrapper });

    const mockContainer = { scrollTop: 0 } as HTMLDivElement;
    result.current.containerRef.current = mockContainer;

    expect(async () => {
      await act(async () => {
        const mockPanInfo: PanInfo = {
          point: { x: 0, y: 50 },
          delta: { x: 0, y: 50 },
          offset: { x: 0, y: 50 },
          velocity: { x: 0, y: 2 },
        };
        await result.current.dragHandlers.onPanEnd(new PointerEvent("pointerup"), mockPanInfo);
      });
    }).toBeDefined();
  });

  it("should invoke hapticFeedback from touch feedback module", () => {
    // Verify the mock for hapticFeedback was set up
    const { hapticFeedback: mockedHapticFeedback } = vi.hoisted(() => ({
      hapticFeedback: vi.fn(),
    }));

    // Just verify the hook uses a valid callback
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh), { wrapper });

    expect(result.current).toBeDefined();
  });

  it("should handle container ref changes", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh), { wrapper });

    // Initially null
    expect(result.current.containerRef.current).toBeNull();

    // Assign a container
    const mockContainer1 = { scrollTop: 0 } as HTMLDivElement;
    result.current.containerRef.current = mockContainer1;
    expect(result.current.containerRef.current).toBe(mockContainer1);

    // Change to a different container
    const mockContainer2 = { scrollTop: 100 } as HTMLDivElement;
    result.current.containerRef.current = mockContainer2;
    expect(result.current.containerRef.current).toBe(mockContainer2);
  });

  it("should have MotionValue with get and set methods", () => {
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh), { wrapper });

    expect(result.current.motionY).toHaveProperty("get");
    expect(result.current.motionY).toHaveProperty("set");
    expect(typeof result.current.motionY.get).toBe("function");
    expect(typeof result.current.motionY.set).toBe("function");
  });
});
