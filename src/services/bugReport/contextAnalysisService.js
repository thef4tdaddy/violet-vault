/**
 * Context Analysis Service - Refactored
 * Main orchestrator for page context analysis
 * Split into focused services for Issue #513
 */
import logger from "../../utils/common/logger";
import { PageDetectionService } from "./pageDetectionService";
import { UIStateService } from "./uiStateService";

export class ContextAnalysisService {
  /**
   * Get comprehensive page context for bug reports
   * @returns {Object} Page context information
   */
  static getCurrentPageContext() {
    try {
      const context = {
        page: PageDetectionService.identifyCurrentPage(),
        route: PageDetectionService.getRouteInfo(),
        screen: PageDetectionService.getScreenContext(),
        userLocation: PageDetectionService.getUserLocation(),
        ui: UIStateService.getUIState(),
        performance: this.getPagePerformance(),
        accessibility: this.getAccessibilityInfo(),
        data: this.getDataState(),
        interactions: this.getRecentInteractions(),
      };

      logger.debug("Page context analyzed", context);
      return context;
    } catch (error) {
      logger.error("Failed to analyze page context", error);
      return this.getFallbackContext();
    }
  }

  /**
   * Get fallback context when analysis fails
   * @returns {Object} Minimal context information
   */
  static getFallbackContext() {
    return {
      page: "unknown",
      route: { currentPage: "unknown", pathname: window.location.pathname },
      screen: { documentTitle: document.title || "Unknown" },
      userLocation: "unknown",
      ui: { modals: [], forms: [], buttons: [], inputs: [] },
      performance: { available: false },
      accessibility: { available: false },
      data: { available: false },
      interactions: [],
      fallback: true,
    };
  }

  /**
   * Get page performance information
   * @returns {Object} Performance metrics
   */
  static getPagePerformance() {
    try {
      const perf = window.performance;
      if (!perf) return { available: false };

      const navigation = perf.getEntriesByType("navigation")[0];
      const paintEntries = perf.getEntriesByType("paint");

      return {
        available: true,
        domContentLoaded: navigation
          ? navigation.domContentLoadedEventEnd - navigation.fetchStart
          : null,
        loadComplete: navigation
          ? navigation.loadEventEnd - navigation.fetchStart
          : null,
        firstPaint:
          paintEntries.find((entry) => entry.name === "first-paint")
            ?.startTime || null,
        firstContentfulPaint:
          paintEntries.find((entry) => entry.name === "first-contentful-paint")
            ?.startTime || null,
        resourceCount: perf.getEntries?.()?.length || 0,
      };
    } catch (error) {
      logger.debug("Error getting page performance", error);
      return { available: false, error: error.message };
    }
  }

  /**
   * Get accessibility information
   * @returns {Object} Accessibility state
   */
  static getAccessibilityInfo() {
    try {
      const a11yInfo = {
        available: true,
        focusedElement: document.activeElement
          ? {
              tagName: document.activeElement.tagName,
              role: document.activeElement.getAttribute("role"),
              ariaLabel: document.activeElement.getAttribute("aria-label"),
            }
          : null,
        headingStructure: this.getHeadingStructure(),
        landmarksCount: document.querySelectorAll(
          '[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]',
        ).length,
        formLabels: this.checkFormLabels(),
        altTexts: this.checkImageAltTexts(),
      };

      return a11yInfo;
    } catch (error) {
      logger.debug("Error getting accessibility info", error);
      return { available: false, error: error.message };
    }
  }

  /**
   * Get data state information
   * @returns {Object} Data state
   */
  static getDataState() {
    try {
      return {
        available: true,
        formsWithData: document.querySelectorAll(
          'form input[value]:not([value=""]), form textarea:not(:empty), form select option:checked',
        ).length,
        tablesWithData: document.querySelectorAll("table tbody tr").length,
        listsWithData: document.querySelectorAll("ul li, ol li").length,
        loadingStates: document.querySelectorAll(
          '[aria-busy="true"], [class*="loading"]',
        ).length,
      };
    } catch (error) {
      logger.debug("Error getting data state", error);
      return { available: false, error: error.message };
    }
  }

  /**
   * Get recent interaction information
   * @returns {Array} Recent interactions
   */
  static getRecentInteractions() {
    try {
      // Simple interaction tracking - could be enhanced with actual event monitoring
      return {
        availableActions: UIStateService.getVisibleInteractions(),
        hasActiveForm: !!document.querySelector("form:focus-within"),
        hasOpenModal: !!document.querySelector(
          '[role="dialog"]:not([style*="display: none"])',
        ),
        keyboardNavigable: document.querySelectorAll(
          "[tabindex], button, input, select, textarea, a[href]",
        ).length,
      };
    } catch (error) {
      logger.debug("Error getting recent interactions", error);
      return [];
    }
  }

  // Helper methods

  /**
   * Get heading structure for accessibility
   * @returns {Object} Heading structure information
   */
  static getHeadingStructure() {
    try {
      const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
      const structure = {};

      headings.forEach((heading) => {
        const level = heading.tagName.toLowerCase();
        structure[level] = (structure[level] || 0) + 1;
      });

      return {
        counts: structure,
        total: headings.length,
        hasH1: !!document.querySelector("h1"),
      };
    } catch (error) {
      return { counts: {}, total: 0, hasH1: false };
    }
  }

  /**
   * Check form label associations
   * @returns {Object} Form label information
   */
  static checkFormLabels() {
    try {
      const inputs = document.querySelectorAll("input, textarea, select");
      let labeled = 0;
      let unlabeled = 0;

      inputs.forEach((input) => {
        const hasLabel = !!(
          (input.id && document.querySelector(`label[for="${input.id}"]`)) ||
          input.closest("label") ||
          input.getAttribute("aria-label") ||
          input.getAttribute("aria-labelledby")
        );

        if (hasLabel) labeled++;
        else unlabeled++;
      });

      return {
        total: inputs.length,
        labeled,
        unlabeled,
        labelPercentage:
          inputs.length > 0 ? Math.round((labeled / inputs.length) * 100) : 0,
      };
    } catch (error) {
      return { total: 0, labeled: 0, unlabeled: 0, labelPercentage: 0 };
    }
  }

  /**
   * Check image alt text coverage
   * @returns {Object} Image alt text information
   */
  static checkImageAltTexts() {
    try {
      const images = document.querySelectorAll("img");
      let withAlt = 0;
      let withoutAlt = 0;

      images.forEach((img) => {
        if (img.alt !== undefined && img.alt !== "") withAlt++;
        else withoutAlt++;
      });

      return {
        total: images.length,
        withAlt,
        withoutAlt,
        altPercentage:
          images.length > 0 ? Math.round((withAlt / images.length) * 100) : 0,
      };
    } catch (error) {
      return { total: 0, withAlt: 0, withoutAlt: 0, altPercentage: 0 };
    }
  }
}

// Maintain backward compatibility by re-exporting sub-services
export { PageDetectionService, UIStateService };
