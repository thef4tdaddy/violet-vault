/**
 * Touch feedback utilities for mobile interactions
 */

/**
 * Provide haptic feedback on mobile devices
 * @param {number} duration - Vibration duration in milliseconds (default: 10)
 * @param {string} type - Type of feedback: 'light', 'medium', 'heavy', 'confirm' (default: 'light')
 */
export const hapticFeedback = (duration = 10, type = "light") => {
  // Check if vibration is supported
  if (!("vibrate" in navigator)) {
    return;
  }

  // Different patterns for different types of feedback
  const patterns = {
    light: [10],
    medium: [15],
    heavy: [25],
    confirm: [10, 50, 10], // Double pulse for confirmations
    error: [50, 100, 50], // Error pattern
    success: [10, 30, 10, 30, 20], // Success pattern
  };

  const pattern = patterns[type] || [duration];

  try {
    navigator.vibrate(pattern);
  } catch {
    // Silently fail if vibration is not supported or blocked
  }
};

/**
 * Standard touch feedback classes for buttons
 */
export const touchFeedbackClasses = {
  // Primary action buttons
  primary: "active:scale-95 transition-all duration-300 transform",

  // Secondary buttons
  secondary: "active:scale-98 transition-all duration-200 transform",

  // Cards and interactive areas
  card: "active:scale-[0.98] transition-all duration-200 transform",

  // Small buttons and icons
  small: "active:scale-90 transition-all duration-150 transform",

  // Tab buttons
  tab: "active:scale-95 transition-all duration-200 transform",
};

/**
 * Enhanced button event handlers with haptic feedback
 */
export const withHapticFeedback = (originalHandler, feedbackType = "light") => {
  return (event) => {
    hapticFeedback(10, feedbackType);
    if (originalHandler) {
      originalHandler(event);
    }
  };
};

/**
 * Get complete button classes with touch feedback
 * @param {string} baseClasses - Base button classes
 * @param {string} touchType - Type of touch feedback (primary, secondary, card, small, tab)
 * @returns {string} Complete class string with touch feedback
 */
export const getButtonClasses = (baseClasses, touchType = "primary") => {
  const touchClasses =
    touchFeedbackClasses[touchType] || touchFeedbackClasses.primary;

  // Ensure transition classes are not duplicated
  const cleanedBaseClasses = baseClasses
    .replace(/\btransition-[\w-]*\b/g, "")
    .replace(/\bduration-[\w-]*\b/g, "")
    .replace(/\btransform\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return `${cleanedBaseClasses} ${touchClasses}`;
};

export default {
  hapticFeedback,
  touchFeedbackClasses,
  withHapticFeedback,
  getButtonClasses,
};
