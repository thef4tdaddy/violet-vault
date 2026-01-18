import { useState } from "react";
import { useSwipeable, type SwipeEventData } from "react-swipeable";
import { hapticFeedback } from "@/utils/ui/feedback/touchFeedback";

/**
 * Swipe state interface
 */
interface SwipeState {
  isSwipeActive: boolean;
  swipeDirection: "left" | "right" | null;
  swipeProgress: number;
}

/**
 * Swipe gesture hook props
 */
interface UseEnvelopeSwipeGesturesProps {
  envelopeId: string;
  unassignedCash?: number;
  onQuickFund?: (envelopeId: string, amount: number) => void;
  onViewHistory?: (envelopeId: string) => void;
}

/**
 * Swipe gesture hook return type
 */
interface UseEnvelopeSwipeGesturesReturn {
  swipeState: SwipeState;
  swipeHandlers: ReturnType<typeof useSwipeable>;
  swipeStyles: {
    transform: string;
    opacity: number;
    transition: string;
  };
}

/**
 * Custom hook for envelope swipe gesture handling
 * Provides enhanced swipe interactions with haptic feedback
 *
 * Part of Issue #160 - Swipe gestures for envelope interactions
 * Related to Epic #158 - Mobile UI/UX Enhancements
 */
export const useEnvelopeSwipeGestures = ({
  envelopeId,
  unassignedCash = 0,
  onQuickFund,
  onViewHistory,
}: UseEnvelopeSwipeGesturesProps): UseEnvelopeSwipeGesturesReturn => {
  const [swipeState, setSwipeState] = useState<SwipeState>({
    isSwipeActive: false,
    swipeDirection: null,
    swipeProgress: 0,
  });

  const handleSwipeStart = (): void => {
    setSwipeState((prev) => ({ ...prev, isSwipeActive: true }));
    hapticFeedback(8, "light"); // Light feedback on swipe start
  };

  const handleSwipeMove = (eventData: SwipeEventData): void => {
    if (!swipeState.isSwipeActive) return;

    const threshold = 100; // pixels to trigger action
    const progress = Math.min(Math.abs(eventData.deltaX) / threshold, 1);
    const direction: "left" | "right" = eventData.deltaX > 0 ? "right" : "left";

    // Provide haptic feedback at threshold points
    if (progress >= 0.5 && swipeState.swipeProgress < 0.5) {
      hapticFeedback(12, "medium"); // Threshold feedback
    }

    setSwipeState((prev) => ({
      ...prev,
      swipeDirection: direction,
      swipeProgress: progress,
    }));
  };

  const handleSwipeEnd = (eventData: SwipeEventData): void => {
    const threshold = 100;
    const isSignificantSwipe = Math.abs(eventData.deltaX) > threshold;
    const direction: "left" | "right" = eventData.deltaX > 0 ? "right" : "left";

    if (isSignificantSwipe) {
      if (unassignedCash > 0) {
        // Right swipe: Quick fund
        if (direction === "right") {
          const swipeIntensity = Math.min(Math.abs(eventData.deltaX) / 200, 1);
          const baseAmount = Math.min(unassignedCash * 0.1, 50);
          const suggestedAmount = Math.max(baseAmount * (0.5 + swipeIntensity), 5);

          hapticFeedback(20, "success"); // Success feedback for funding
          onQuickFund?.(envelopeId, Math.round(suggestedAmount * 100) / 100);
        }
        // Left swipe: View history/details
        else if (direction === "left") {
          hapticFeedback(15, "navigation"); // Navigation feedback
          onViewHistory?.(envelopeId);
        }
      } else {
        // No cash available - error feedback
        hapticFeedback(30, "error");
      }
    } else {
      // Incomplete swipe - light feedback
      hapticFeedback(8, "light");
    }

    // Reset swipe state
    setSwipeState({
      isSwipeActive: false,
      swipeDirection: null,
      swipeProgress: 0,
    });
  };

  const swipeHandlers = useSwipeable({
    onSwipeStart: handleSwipeStart,
    onSwiping: handleSwipeMove,
    onSwiped: handleSwipeEnd,
    preventScrollOnSwipe: true,
    trackMouse: true, // Enable mouse support for testing
  });

  // Dynamic styles based on swipe state
  const swipeStyles = swipeState.isSwipeActive
    ? {
        transform: `translateX(${
          swipeState.swipeDirection === "right"
            ? swipeState.swipeProgress * 15
            : -swipeState.swipeProgress * 15
        }px)`,
        opacity: 1 - swipeState.swipeProgress * 0.1,
        transition: "none",
      }
    : {
        transform: "translateX(0)",
        opacity: 1,
        transition: "all 0.3s ease-out",
      };

  return {
    swipeState,
    swipeHandlers,
    swipeStyles,
  };
};
