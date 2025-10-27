/**
 * Context Analysis Service - Refactored
 * Main orchestrator for page context analysis
 * Split into focused services for Issue #513
 */
import logger from "../../utils/common/logger";
import { PageDetectionService } from "./pageDetectionService";
import { UIStateService } from "./uiStateService";

// Type definitions
interface PagePerformance {
  available: boolean;
  domContentLoaded?: number | null;
  loadComplete?: number | null;
  firstPaint?: number | null;
  firstContentfulPaint?: number | null;
  resourceCount?: number;
  error?: string;
}

interface AccessibilityInfo {
  available: boolean;
  focusedElement?: {
    tagName: string;
    role: string | null;
    ariaLabel: string | null;
  } | null;
  headingStructure?: HeadingStructure;
  landmarksCount?: number;
  formLabels?: FormLabels;
  altTexts?: ImageAltTexts;
  error?: string;
}

interface HeadingStructure {
  counts: Record<string, number>;
  total: number;
  hasH1: boolean;
}

interface FormLabels {
  total: number;
  labeled: number;
  unlabeled: number;
  labelPercentage: number;
}

interface ImageAltTexts {
  total: number;
  withAlt: number;
  withoutAlt: number;
  altPercentage: number;
}

interface DataState {
  available: boolean;
  formsWithData?: number;
  tablesWithData?: number;
  listsWithData?: number;
  loadingStates?: number;
  error?: string;
}

interface RecentInteractions {
  availableActions?: ReturnType<typeof UIStateService.getVisibleInteractions>;
  hasActiveForm?: boolean;
  hasOpenModal?: boolean;
  keyboardNavigable?: number;
}

export interface PageContext {
  page: string;
  route: ReturnType<typeof PageDetectionService.getRouteInfo>;
  screen: ReturnType<typeof PageDetectionService.getScreenContext>;
  userLocation: string;
  ui: ReturnType<typeof UIStateService.getUIState>;
  performance: PagePerformance;
  accessibility: AccessibilityInfo;
  data: DataState;
  interactions: RecentInteractions | unknown[];
  fallback?: boolean;
}

export class ContextAnalysisService {
  /**
   * Get comprehensive page context for bug reports
   */
  static getCurrentPageContext(): PageContext {
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
   */
  static getFallbackContext(): PageContext {
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
   */
  static getPagePerformance(): PagePerformance {
    try {
      const perf = window.performance;
      if (!perf) return { available: false };

      const navigation = perf.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      const paintEntries = perf.getEntriesByType("paint");

      return {
        available: true,
        domContentLoaded: navigation
          ? navigation.domContentLoadedEventEnd - navigation.fetchStart
          : null,
        loadComplete: navigation ? navigation.loadEventEnd - navigation.fetchStart : null,
        firstPaint: paintEntries.find((entry) => entry.name === "first-paint")?.startTime || null,
        firstContentfulPaint:
          paintEntries.find((entry) => entry.name === "first-contentful-paint")?.startTime || null,
        resourceCount: perf.getEntries?.()?.length || 0,
      };
    } catch (error) {
      logger.debug("Error getting page performance", error);
      return { available: false, error: (error as Error).message };
    }
  }

  /**
   * Get accessibility information
   */
  static getAccessibilityInfo(): AccessibilityInfo {
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
          '[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]'
        ).length,
        formLabels: this.checkFormLabels(),
        altTexts: this.checkImageAltTexts(),
      };

      return a11yInfo;
    } catch (error) {
      logger.debug("Error getting accessibility info", error);
      return { available: false, error: (error as Error).message };
    }
  }

  /**
   * Get data state information
   */
  static getDataState(): DataState {
    try {
      return {
        available: true,
        formsWithData: document.querySelectorAll(
          'form input[value]:not([value=""]), form textarea:not(:empty), form select option:checked'
        ).length,
        tablesWithData: document.querySelectorAll("table tbody tr").length,
        listsWithData: document.querySelectorAll("ul li, ol li").length,
        loadingStates: document.querySelectorAll('[aria-busy="true"], [class*="loading"]').length,
      };
    } catch (error) {
      logger.debug("Error getting data state", error);
      return { available: false, error: (error as Error).message };
    }
  }

  /**
   * Get recent interaction information
   */
  static getRecentInteractions(): RecentInteractions | unknown[] {
    try {
      // Simple interaction tracking - could be enhanced with actual event monitoring
      return {
        availableActions: UIStateService.getVisibleInteractions(),
        hasActiveForm: !!document.querySelector("form:focus-within"),
        hasOpenModal: !!document.querySelector('[role="dialog"]:not([style*="display: none"])'),
        keyboardNavigable: document.querySelectorAll(
          "[tabindex], button, input, select, textarea, a[href]"
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
   */
  static getHeadingStructure(): HeadingStructure {
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
    } catch {
      return { counts: {}, total: 0, hasH1: false };
    }
  }

  /**
   * Check form label associations
   */
  static checkFormLabels(): FormLabels {
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
        labelPercentage: inputs.length > 0 ? Math.round((labeled / inputs.length) * 100) : 0,
      };
    } catch {
      return { total: 0, labeled: 0, unlabeled: 0, labelPercentage: 0 };
    }
  }

  /**
   * Check image alt text coverage
   */
  static checkImageAltTexts(): ImageAltTexts {
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
        altPercentage: images.length > 0 ? Math.round((withAlt / images.length) * 100) : 0,
      };
    } catch {
      return { total: 0, withAlt: 0, withoutAlt: 0, altPercentage: 0 };
    }
  }
}

// Maintain backward compatibility by re-exporting sub-services
export { PageDetectionService, UIStateService };
