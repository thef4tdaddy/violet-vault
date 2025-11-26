import React, { useRef, useCallback, useEffect } from "react";
import { useFABSelectors, useFABActions } from "../../stores/ui/fabStore";
import { hapticFeedback } from "../../utils/ui/touchFeedback";

/**
 * Custom hook for long-press detection
 */
const useLongPress = (callback: (event: unknown) => void, threshold = 500) => {
  const isLongPress = useRef(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(
    (event: unknown) => {
      isLongPress.current = false;
      timeout.current = setTimeout(() => {
        isLongPress.current = true;
        callback(event);
      }, threshold);
    },
    [callback, threshold]
  );

  const clear = useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    isLongPress.current = false;
  }, []);

  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchEnd: clear,
    onTouchCancel: clear,
  };
};

/**
 * Hook for keyboard navigation
 */
const useKeyboardNavigation = (
  isExpanded: boolean,
  setExpanded: (expanded: boolean) => void,
  containerRef: React.RefObject<HTMLElement | null>
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isExpanded) return;

      switch (e.key) {
        case "Escape":
          setExpanded(false);
          break;
        case "Tab":
          // Let browser handle tab navigation
          break;
        case "ArrowUp":
        case "ArrowDown": {
          e.preventDefault();
          // Focus management for action buttons
          const actionButtons = containerRef.current?.querySelectorAll('[role="menuitem"]');
          if (actionButtons && actionButtons.length > 0) {
            const currentIndex = Array.from(actionButtons).findIndex(
              (btn) => btn === document.activeElement
            );
            const nextIndex =
              e.key === "ArrowUp"
                ? currentIndex <= 0
                  ? actionButtons.length - 1
                  : currentIndex - 1
                : currentIndex >= actionButtons.length - 1
                  ? 0
                  : currentIndex + 1;
            (actionButtons[nextIndex] as HTMLElement)?.focus();
          }
          break;
        }
        default:
          break;
      }
    };

    if (isExpanded) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded, containerRef]); // setExpanded is stable and shouldn't be in deps
};

/**
 * Hook that provides all FAB behavior logic
 */
export const useFABBehavior = () => {
  const { isExpanded, primaryAction, secondaryActions } = useFABSelectors();
  const { setExpanded } = useFABActions();
  const containerRef = useRef<HTMLElement>(null);

  // Event handlers
  const handlePrimaryClick = useCallback(() => {
    hapticFeedback(15, "medium");
    if (isExpanded) {
      setExpanded(false);
      hapticFeedback(10, "light");
    } else if (primaryAction?.action) {
      primaryAction.action();
    }
  }, [isExpanded, setExpanded, primaryAction]);

  const handleBackdropClick = useCallback(() => {
    setExpanded(false);
  }, [setExpanded]);

  const handleLongPressAction = useCallback(() => {
    if (!isExpanded && secondaryActions.length > 0) {
      hapticFeedback(20, "heavy");
      setExpanded(true);
    }
  }, [isExpanded, secondaryActions.length, setExpanded]);

  // Setup long-press detection
  const handleLongPress = useLongPress(handleLongPressAction, 500);

  // Setup keyboard navigation
  useKeyboardNavigation(isExpanded, setExpanded, containerRef);

  return {
    containerRef,
    handlePrimaryClick,
    handleLongPress,
    handleBackdropClick,
  };
};
