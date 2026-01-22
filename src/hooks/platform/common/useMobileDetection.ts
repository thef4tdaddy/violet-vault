import { useState, useEffect } from "react";

/**
 * Custom hook for detecting mobile screen sizes
 * Used by responsive modal components for mobile/desktop rendering
 *
 * @param {number} breakpoint - Screen width breakpoint in pixels (default: 640)
 * @returns {boolean} - True if screen width is below breakpoint
 */
export const useMobileDetection = (breakpoint = 640) => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < breakpoint;
    }
    return false;
  });

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, [breakpoint]);

  return isMobile;
};
