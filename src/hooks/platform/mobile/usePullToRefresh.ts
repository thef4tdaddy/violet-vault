import React, { useState, useEffect, useRef, useCallback } from "react";
import { useMotionValue, useSpring, useTransform, PanInfo, MotionValue } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { hapticFeedback } from "@/utils/ui/feedback/touchFeedback";
import { useMobileDetection } from "@/hooks/platform/common/useMobileDetection";

/**
 * Pull-to-refresh hook options
 */
interface UsePullToRefreshOptions {
  /** Pull distance threshold to trigger refresh (default: 80px) */
  threshold?: number;
  /** Enable/disable pull-to-refresh functionality (default: true) */
  enabled?: boolean;
  /** Invalidate all TanStack Query cache on refresh (default: true) */
  invalidateCache?: boolean;
  /** Spring physics configuration */
  springConfig?: {
    stiffness?: number;
    damping?: number;
  };
}

/**
 * Pull-to-refresh hook return type
 */
interface UsePullToRefreshReturn {
  /** Whether user is currently pulling */
  isPulling: boolean;
  /** Whether refresh is in progress */
  isRefreshing: boolean;
  /** Current pull distance in pixels */
  pullDistance: number;
  /** Pull progress as a percentage (0-1) */
  pullProgress: number;
  /** Whether pull distance exceeds threshold */
  isReady: boolean;
  /** Framer Motion Y position motion value */
  motionY: MotionValue<number>;
  /** Smooth spring animation for Y position */
  springY: MotionValue<number>;
  /** Rotation value based on pull progress (0-180 degrees) */
  pullRotation: MotionValue<number>;
  /** Framer Motion drag handlers */
  dragHandlers: {
    onPanStart: (event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => void;
    onPan: (event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => void;
    onPanEnd: (event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => void;
  };
  /** Container ref for scroll detection */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Whether pull-to-refresh is enabled (mobile only) */
  isEnabled: boolean;
}

/**
 * Modern pull-to-refresh hook using Framer Motion spring physics.
 *
 * Provides buttery-smooth pull-to-refresh interaction on mobile devices with:
 * - Physics-based spring animations via Framer Motion
 * - Haptic feedback at refresh threshold
 * - TanStack Query cache invalidation
 * - Mobile-only activation (disabled on desktop)
 *
 * @param onRefresh - Async function to call when refresh is triggered
 * @param options - Configuration options
 * @returns Pull-to-refresh state, handlers, and motion values
 *
 * @example
 * ```tsx
 * const { dragHandlers, motionY, isRefreshing, containerRef } = usePullToRefresh(
 *   async () => {
 *     // Refresh dashboard data
 *     await fetchData();
 *   }
 * );
 *
 * return (
 *   <motion.div
 *     ref={containerRef}
 *     style={{ y: motionY }}
 *     {...dragHandlers}
 *   >
 *     {isRefreshing && <LoadingSpinner />}
 *     <DashboardContent />
 *   </motion.div>
 * );
 * ```
 */
export const usePullToRefresh = (
  onRefresh: () => Promise<void> | void,
  options: UsePullToRefreshOptions = {}
): UsePullToRefreshReturn => {
  const {
    threshold = 80,
    enabled = true,
    invalidateCache = true,
    springConfig = { stiffness: 300, damping: 30 },
  } = options;

  // Mobile detection - only enable on mobile devices
  const isMobile = useMobileDetection();
  const isEnabled = enabled && isMobile;

  // TanStack Query client for cache invalidation
  const queryClient = useQueryClient();

  // State management
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startScrollTop = useRef(0);

  // Framer Motion values
  const motionY = useMotionValue(0);
  const springY = useSpring(motionY, {
    stiffness: springConfig.stiffness,
    damping: springConfig.damping,
  });

  // Calculate pull progress (0-1)
  const pullProgress = Math.min(pullDistance / threshold, 1);

  // Transform pull progress to rotation (0-180 degrees)
  const pullRotation = useTransform(motionY, [0, threshold], [0, 180]);

  // Determine if pull is ready to refresh
  const isReady = pullDistance >= threshold;

  /**
   * Handle pan start - Initialize pull gesture
   */
  const handlePanStart = useCallback(
    (_event: PointerEvent | MouseEvent | TouchEvent, _info: PanInfo) => {
      if (!isEnabled || isRefreshing) return;

      const container = containerRef.current;
      if (container) {
        startScrollTop.current = container.scrollTop;
        // Only start pulling if at top of container
        if (startScrollTop.current === 0) {
          setIsPulling(true);
        }
      }
    },
    [isEnabled, isRefreshing]
  );

  /**
   * Handle pan - Update pull distance with resistance
   */
  const handlePan = useCallback(
    (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
      if (!isEnabled || !isPulling || isRefreshing) return;

      const { offset } = info;
      const pullY = offset.y;

      // Only pull down, not up
      if (pullY > 0) {
        // Apply resistance curve for natural feel
        const resistance = 2.5;
        const distance = Math.min(pullY / resistance, threshold * 1.5);

        setPullDistance(distance);
        motionY.set(distance);

        // Trigger haptic feedback at threshold
        if (distance >= threshold && pullDistance < threshold) {
          hapticFeedback(15, "medium");
        }
      }
    },
    [isEnabled, isPulling, isRefreshing, threshold, pullDistance, motionY]
  );

  /**
   * Handle pan end - Trigger refresh if threshold exceeded
   */
  const handlePanEnd = useCallback(
    async (_event: PointerEvent | MouseEvent | TouchEvent, _info: PanInfo) => {
      if (!isEnabled || !isPulling || isRefreshing) return;

      const shouldRefresh = pullDistance >= threshold;

      if (shouldRefresh) {
        setIsRefreshing(true);
        hapticFeedback(15, "medium");

        try {
          // Invalidate TanStack Query cache if enabled
          if (invalidateCache) {
            await queryClient.invalidateQueries();
          }

          // Execute custom refresh function
          await onRefresh();
        } catch {
          // Error handled silently - logged if needed in onRefresh
        } finally {
          setIsRefreshing(false);
        }
      }

      // Reset state with spring animation
      setIsPulling(false);
      setPullDistance(0);
      motionY.set(0);
      startScrollTop.current = 0;
    },
    [
      isEnabled,
      isPulling,
      isRefreshing,
      pullDistance,
      threshold,
      invalidateCache,
      queryClient,
      onRefresh,
      motionY,
    ]
  );

  // Drag handlers for Framer Motion
  const dragHandlers = {
    onPanStart: handlePanStart,
    onPan: handlePan,
    onPanEnd: handlePanEnd,
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      setIsPulling(false);
      setPullDistance(0);
      setIsRefreshing(false);
      motionY.set(0);
    };
  }, [motionY]);

  return {
    // State
    isPulling,
    isRefreshing,
    pullDistance,
    pullProgress,
    isReady,
    isEnabled,

    // Framer Motion values
    motionY,
    springY,
    pullRotation,

    // Handlers
    dragHandlers,
    containerRef,
  };
};

export default usePullToRefresh;
