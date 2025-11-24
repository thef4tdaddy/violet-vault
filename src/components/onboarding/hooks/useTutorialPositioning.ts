import { useCallback } from "react";

interface TutorialStep {
  position?: string;
  [key: string]: unknown;
}

interface TooltipPosition {
  top: string | number;
  left: string | number;
  transform: string;
}

/**
 * Hook for calculating tutorial tooltip positioning
 * Extracted from OnboardingTutorial.jsx to reduce complexity
 */
export const useTutorialPositioning = () => {
  const getTooltipPosition = useCallback(
    (element: Element | null, step: TutorialStep): TooltipPosition => {
      if (!element || step.position === "center") {
        return {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        };
      }

      const rect = element.getBoundingClientRect();
      const position = step.position || "bottom";
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Calculate base position
      let top, left, transform;

      switch (position) {
        case "top":
          top = rect.top - 10;
          left = rect.left + rect.width / 2;
          transform = "translate(-50%, -100%)";
          break;
        case "bottom":
          top = rect.bottom + 10;
          left = rect.left + rect.width / 2;
          transform = "translate(-50%, 0)";
          break;
        case "left":
          top = rect.top + rect.height / 2;
          left = rect.left - 10;
          transform = "translate(-100%, -50%)";
          break;
        case "right":
          top = rect.top + rect.height / 2;
          left = rect.right + 10;
          transform = "translate(0, -50%)";
          break;
        default:
          top = rect.bottom + 10;
          left = rect.left + rect.width / 2;
          transform = "translate(-50%, 0)";
      }

      // Ensure tooltip stays within viewport bounds
      const tooltipWidth = 384; // max-w-md (24rem = 384px)
      const tooltipHeight = 300; // Estimated tooltip height

      // Adjust horizontal position if too close to edges
      if (left - tooltipWidth / 2 < 20) {
        left = tooltipWidth / 2 + 20;
        transform = transform.replace("translate(-50%", "translate(-50%");
      } else if (left + tooltipWidth / 2 > viewportWidth - 20) {
        left = viewportWidth - tooltipWidth / 2 - 20;
        transform = transform.replace("translate(-50%", "translate(-50%");
      }

      // Adjust vertical position if too close to edges
      if (top < 20) {
        top = 20;
        if (position === "top") {
          transform = transform.replace("translate(", "translate(").replace("-100%)", "0%)");
        }
      } else if (top + tooltipHeight > viewportHeight - 20) {
        top = viewportHeight - tooltipHeight - 20;
        if (position === "bottom") {
          transform = transform.replace("translate(", "translate(").replace("0%)", "-100%)");
        }
      }

      return { top, left, transform };
    },
    []
  );

  return {
    getTooltipPosition,
  };
};
