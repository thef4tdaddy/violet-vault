import { useState, useEffect, useRef } from "react";

/**
 * Hook for smart FAB positioning that avoids virtual keyboard
 * Detects keyboard presence and adjusts FAB position accordingly
 */
export const useFABSmartPositioning = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const originalViewportHeight = useRef(window.innerHeight);

  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      // Debounce resize events
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const currentHeight = window.innerHeight;
        const heightDifference = originalViewportHeight.current - currentHeight;

        // Threshold to detect virtual keyboard (150px seems reasonable)
        const keyboardThreshold = 150;

        if (heightDifference > keyboardThreshold) {
          // Keyboard is likely visible
          setIsKeyboardVisible(true);
          setKeyboardHeight(heightDifference);
        } else {
          // Keyboard is likely hidden
          setIsKeyboardVisible(false);
          setKeyboardHeight(0);
        }
      }, 100);
    };

    const handleFocusIn = () => {
      // Additional check when input fields gain focus
      setTimeout(handleResize, 300); // Delay to allow keyboard animation
    };

    const handleFocusOut = () => {
      // When input fields lose focus, keyboard might hide
      setTimeout(() => {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
      }, 300);
    };

    // Set initial viewport height
    originalViewportHeight.current = window.innerHeight;

    // Event listeners
    window.addEventListener("resize", handleResize);
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    // Cleanup
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  // Calculate adjusted position
  const getAdjustedPosition = () => {
    if (!isKeyboardVisible) {
      return {
        bottom: "1rem", // Default bottom position (16px)
        transform: "none",
        transition: "all 300ms ease-in-out",
      };
    }

    // When keyboard is visible, move FAB up
    const adjustedBottom = Math.max(16, keyboardHeight - 80); // Keep some padding

    return {
      bottom: `${adjustedBottom}px`,
      transform: "none",
      transition: "all 300ms ease-in-out",
    };
  };

  return {
    isKeyboardVisible,
    keyboardHeight,
    adjustedStyle: getAdjustedPosition(),
  };
};
