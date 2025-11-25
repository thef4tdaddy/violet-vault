import React, { useState, useEffect, useRef } from "react";
import { hapticFeedback } from "../../utils/ui/touchFeedback";

/**
 * Custom hook for pull-to-refresh functionality
 * @param {function} onRefresh - Function to call when refresh is triggered
 * @param {object} options - Configuration options
 * @returns {object} - Pull-to-refresh state and handlers
 */
export const usePullToRefresh = (
  onRefresh: () => Promise<void> | void,
  { threshold = 80, resistance = 2.5, enabled = true } = {}
) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const currentY = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enabled || isRefreshing) return;

    const touch = e.touches[0];
    startY.current = touch.clientY;
    currentY.current = touch.clientY;

    // Only start pull if we're at the top of the page
    const container = containerRef.current;
    if (container && container.scrollTop === 0) {
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!enabled || !isPulling || isRefreshing) return;

    const touch = e.touches[0];
    currentY.current = touch.clientY;
    const diff = currentY.current - startY.current;

    if (diff > 0) {
      // Apply resistance to make the pull feel natural
      const distance = Math.min(diff / resistance, threshold * 1.5);
      setPullDistance(distance);

      // Prevent default scroll behavior when pulling down
      e.preventDefault();
    }
  };

  const handleTouchEnd = async () => {
    if (!enabled || !isPulling || isRefreshing) return;

    const shouldRefresh = pullDistance >= threshold;

    if (shouldRefresh) {
      setIsRefreshing(true);
      hapticFeedback(15, "medium"); // Haptic feedback on refresh trigger

      try {
        await onRefresh();
      } catch {
        // Error handled silently to avoid console noise
      } finally {
        setIsRefreshing(false);
      }
    }

    // Reset state
    setIsPulling(false);
    setPullDistance(0);
    startY.current = 0;
    currentY.current = 0;
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      setIsPulling(false);
      setPullDistance(0);
      setIsRefreshing(false);
    };
  }, []);

  // Touch event handlers
  const touchHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchEnd,
  };

  // Calculate pull progress (0-1)
  const pullProgress = Math.min(pullDistance / threshold, 1);

  // Determine if pull is ready to refresh
  const isReady = pullDistance >= threshold;

  return {
    // State
    isPulling,
    isRefreshing,
    pullDistance,
    pullProgress,
    isReady,

    // Handlers
    touchHandlers,
    containerRef,

    // Styles for pull indicator
    pullStyles: {
      transform: `translateY(${pullDistance}px)`,
      transition: isPulling ? "none" : "transform 0.3s ease-out",
    },

    // Helper for pull indicator rotation
    pullRotation: pullProgress * 180,
  };
};

export default usePullToRefresh;
