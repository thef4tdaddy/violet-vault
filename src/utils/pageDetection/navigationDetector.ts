/**
 * Navigation-based page detection utilities
 * Extracted from pageDetectionService.js to reduce complexity
 */
import { VIEW_KEY_MAPPING, checkNavTextPatterns } from "./pagePatterns.ts";

/**
 * Detect page from active navigation element
 */
export const detectFromActiveNavigation = () => {
  const activeNav = document.querySelector('[aria-current="page"]');
  if (!activeNav) return null;

  // First try the data-view attribute (most reliable)
  const viewKey = activeNav.getAttribute("data-view");
  if (viewKey && VIEW_KEY_MAPPING[viewKey]) {
    return VIEW_KEY_MAPPING[viewKey];
  }

  // Fallback to text-based detection
  const navText = activeNav.textContent?.toLowerCase().trim();
  return checkNavTextPatterns(navText);
};

/**
 * Get active navigation element info
 */
export const getActiveNavigationInfo = () => {
  const activeNav = document.querySelector('[aria-current="page"]');
  if (!activeNav) return null;

  return {
    element: activeNav,
    viewKey: activeNav.getAttribute("data-view"),
    text: activeNav.textContent?.toLowerCase().trim(),
  };
};
