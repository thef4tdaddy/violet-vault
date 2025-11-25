import { useCallback, useEffect } from "react";

/**
 * Hook for managing tutorial element highlighting
 * Extracted from OnboardingTutorial.jsx to reduce complexity
 */
export const useTutorialHighlight = () => {
  const highlightElement = useCallback((element: HTMLElement | null) => {
    if (element) {
      // Apply visual highlighting
      element.style.position = "relative";
      element.style.zIndex = "1001";
      element.style.border = "2px solid #a855f7";
      element.style.borderRadius = "8px";
      element.style.boxShadow = "0 0 0 4px rgba(168, 85, 247, 0.2)";

      // Scroll element into view with smooth animation
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });

      // Additional focusing for better accessibility
      if (element.focus) {
        try {
          element.focus({ preventScroll: true });
        } catch {
          // Some elements can't be focused, that's okay
        }
      }
    }
  }, []);

  const removeHighlight = useCallback((element: HTMLElement | null) => {
    if (element) {
      element.style.position = "";
      element.style.zIndex = "";
      element.style.border = "";
      element.style.borderRadius = "";
      element.style.boxShadow = "";
    }
  }, []);

  const useHighlightEffect = (shouldHighlight: boolean, element: HTMLElement | null) => {
    useEffect(() => {
      if (shouldHighlight && element) {
        // Add small delay to allow for route navigation and DOM updates
        const timer = setTimeout(() => {
          highlightElement(element);
        }, 300);

        return () => {
          clearTimeout(timer);
          removeHighlight(element);
        };
      }
    }, [shouldHighlight, element]);
  };

  return {
    highlightElement,
    removeHighlight,
    useHighlightEffect,
  };
};
