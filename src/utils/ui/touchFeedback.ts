/**
 * Touch Feedback Utilities
 * Enhanced haptic feedback and touch animations for mobile PWA experience
 *
 * Part of Issue #159 - Touch Feedback and Animations to Buttons and Cards
 * Related to Epic #158 - Mobile UI/UX Enhancements
 */

import React from "react";

export type HapticFeedbackType =
  | "light"
  | "medium"
  | "heavy"
  | "tap"
  | "confirm"
  | "error"
  | "success"
  | "warning"
  | "navigation"
  | "select"
  | "longPress";

export type TouchFeedbackType =
  | "primary"
  | "secondary"
  | "card"
  | "small"
  | "tab"
  | "destructive"
  | "success"
  | "fab"
  | "envelope"
  | "navigation"
  | "comprehensive";

/**
 * Provide haptic feedback on mobile devices
 * @param {number} duration - Vibration duration in milliseconds (default: 10)
 * @param {string} type - Type of feedback: 'light', 'medium', 'heavy', 'confirm' (default: 'light')
 */
export const hapticFeedback = (duration = 10, type: HapticFeedbackType = "light"): boolean => {
  // Check if vibration is supported
  if (!("vibrate" in navigator) || typeof navigator.vibrate !== "function") {
    return false;
  }

  // Check if user prefers reduced motion (accessibility)
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    return false;
  }

  // Enhanced patterns for different types of feedback
  const patterns: Record<HapticFeedbackType, number[]> = {
    light: [10],
    medium: [15],
    heavy: [25],
    tap: [8], // Quick tap for general buttons
    confirm: [15, 10, 15], // Double pulse for confirmations
    error: [50, 20, 50], // Error pattern
    success: [20, 10, 20, 10, 30], // Success pattern with rhythm
    warning: [30, 15, 30], // Warning pattern
    navigation: [5], // Subtle navigation feedback
    select: [8, 5, 8], // Selection feedback
    longPress: [15, 20, 25], // Long press feedback
  };

  const pattern = patterns[type] || [duration];

  try {
    navigator.vibrate(pattern);
    return true;
  } catch {
    // Silently fail - haptic feedback is not critical
    return false;
  }
};

/**
 * Enhanced touch feedback classes for buttons and interactive elements
 */
export const touchFeedbackClasses: Record<TouchFeedbackType, string> = {
  // Primary action buttons
  primary:
    "active:scale-95 active:brightness-95 transition-all duration-150 ease-out hover:scale-[1.02] hover:shadow-lg transform",

  // Secondary buttons
  secondary:
    "active:scale-98 active:opacity-90 transition-all duration-150 ease-out hover:scale-[1.01] transform",

  // Cards and interactive areas
  card: "active:scale-[0.98] active:brightness-95 transition-all duration-200 ease-out hover:scale-[1.01] hover:shadow-md transform cursor-pointer",

  // Small buttons and icons
  small:
    "active:scale-90 active:opacity-80 transition-all duration-100 ease-out hover:scale-105 transform",

  // Tab buttons
  tab: "active:scale-95 active:brightness-95 transition-all duration-150 ease-out transform",

  // Destructive actions
  destructive:
    "active:scale-95 active:brightness-90 transition-all duration-150 ease-out hover:scale-[1.02] hover:shadow-lg transform",

  // Success actions
  success:
    "active:scale-95 active:brightness-95 transition-all duration-150 ease-out hover:scale-[1.02] hover:shadow-lg transform",

  // Floating action button
  fab: "active:scale-90 active:shadow-inner transition-all duration-200 ease-out hover:scale-110 hover:shadow-2xl transform",

  // Envelope cards (specific to violet vault)
  envelope:
    "active:scale-[0.97] active:brightness-95 transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-lg transform cursor-pointer",

  // Navigation items
  navigation: "active:scale-98 active:brightness-95 transition-all duration-100 ease-out transform",

  // Comprehensive (recommended for most buttons)
  comprehensive:
    "active:scale-95 active:brightness-95 transition-all duration-150 ease-out hover:scale-[1.02] hover:shadow-lg transform select-none",
};

/**
 * Enhanced button event handlers with haptic feedback
 */
export const withHapticFeedback = <T extends unknown[]>(
  originalHandler: ((...args: T) => void) | undefined,
  feedbackType: HapticFeedbackType = "light"
) => {
  return (...args: T) => {
    hapticFeedback(10, feedbackType);
    if (originalHandler) {
      originalHandler(...args);
    }
  };
};

/**
 * Get complete button classes with touch feedback
 * @param {string} baseClasses - Base button classes
 * @param {string} touchType - Type of touch feedback (primary, secondary, card, small, tab)
 * @returns {string} Complete class string with touch feedback
 */
export const getButtonClasses = (
  baseClasses: string,
  touchType: TouchFeedbackType = "primary"
): string => {
  const touchClasses = touchFeedbackClasses[touchType] || touchFeedbackClasses.primary;

  // Ensure transition classes are not duplicated
  const cleanedBaseClasses = baseClasses
    .replace(/\btransition-[\w-]*\b/g, "")
    .replace(/\bduration-[\w-]*\b/g, "")
    .replace(/\btransform\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return `${cleanedBaseClasses} ${touchClasses}`;
};

/**
 * React hook for touch feedback
 * @param {string} hapticType - Type of haptic feedback to provide
 * @param {string} touchType - Type of visual touch feedback
 * @returns {Object} Object with touch handlers and classes
 */
export const useTouchFeedback = (
  hapticType: HapticFeedbackType = "tap",
  touchType: TouchFeedbackType = "primary"
) => {
  const handleTouchStart = (_event: React.TouchEvent) => {
    hapticFeedback(10, hapticType);
  };

  const handleClick = <T extends unknown[]>(originalHandler?: (...args: T) => void) => {
    return (...args: T) => {
      // Provide feedback on click for non-touch devices
      if (!("ontouchstart" in window)) {
        hapticFeedback(10, hapticType);
      }

      // Call original handler
      if (originalHandler) {
        originalHandler(...args);
      }
    };
  };

  return {
    onTouchStart: handleTouchStart,
    onClick: handleClick,
    className: touchFeedbackClasses[touchType] || touchFeedbackClasses.primary,
  };
};

/**
 * Initialize touch feedback for the entire app
 * Call this once when the app starts
 */
export const initializeTouchFeedback = () => {
  // Add global styles for touch feedback
  if (!document.head.querySelector("#touch-feedback-styles")) {
    const style = document.createElement("style");
    style.id = "touch-feedback-styles";
    style.textContent = `
      /* Disable default touch highlighting */
      * {
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
      }

      /* Enhanced touch feedback for interactive elements */
      .touch-feedback-enabled {
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
      }

      /* Prevent text selection during touch interactions */
      button, [role="button"], .cursor-pointer {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }

      /* Smooth transitions for all interactive elements */
      button, [role="button"], .cursor-pointer, [data-touch-feedback] {
        transition: transform 150ms ease-out, filter 150ms ease-out, box-shadow 150ms ease-out;
      }
    `;
    document.head.appendChild(style);
  }

  // Auto-enhance buttons with appropriate feedback
  setTimeout(() => {
    // Primary buttons
    document
      .querySelectorAll(
        'button[class*="bg-emerald"], button[class*="bg-blue"], button[class*="bg-purple"]'
      )
      .forEach((button) => {
        if (!button.classList.contains("touch-feedback-enabled")) {
          button.classList.add("touch-feedback-enabled");
          button.classList.add(...touchFeedbackClasses.primary.split(" "));
          button.addEventListener("touchstart", () => hapticFeedback(10, "tap"));
        }
      });

    // Destructive buttons
    document
      .querySelectorAll('button[class*="bg-red"], button[class*="destructive"]')
      .forEach((button) => {
        if (!button.classList.contains("touch-feedback-enabled")) {
          button.classList.add("touch-feedback-enabled");
          button.classList.add(...touchFeedbackClasses.destructive.split(" "));
          button.addEventListener("touchstart", () => hapticFeedback(10, "warning"));
        }
      });

    // Cards and interactive elements
    document
      .querySelectorAll('[class*="cursor-pointer"], .envelope-card, [role="button"]')
      .forEach((element) => {
        if (!element.classList.contains("touch-feedback-enabled")) {
          element.classList.add("touch-feedback-enabled");
          element.classList.add(...touchFeedbackClasses.card.split(" "));
          element.addEventListener("touchstart", () => hapticFeedback(10, "light"));
        }
      });
  }, 100);
};

export default {
  hapticFeedback,
  touchFeedbackClasses,
  withHapticFeedback,
  getButtonClasses,
  useTouchFeedback,
  initializeTouchFeedback,
};
