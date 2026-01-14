/**
 * Main page identification logic
 * Extracted from pageDetectionService.js to reduce complexity
 */
import {
  checkUrlPatterns,
  checkTitlePatterns,
  checkDomClassPatterns,
  PageType,
} from "./pagePatterns.js";
import { detectFromActiveNavigation } from "./navigationDetector.js";
import logger from "../common/logger.js";

/**
 * Identify current page using multiple detection strategies
 */
export const identifyCurrentPage = (): PageType => {
  try {
    // Strategy 1: URL path patterns (most reliable)
    const urlResult = checkUrlPatterns(window.location.pathname, window.location.hash);
    if (urlResult) return urlResult;

    // Strategy 2: Active navigation indicators
    const navResult = detectFromActiveNavigation();
    if (navResult) return navResult;

    // Strategy 3: Document title analysis
    const titleResult = checkTitlePatterns(document.title);
    if (titleResult) return titleResult;

    // Strategy 4: DOM class patterns (fallback)
    const domResult = checkDomClassPatterns();
    if (domResult) return domResult;

    return "unknown";
  } catch (_error) {
    logger.warn("Error identifying current page", _error as Record<string, unknown>);
    return "unknown";
  }
};
