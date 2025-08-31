/**
 * Page Detection Service
 * Handles page identification and route analysis
 * Extracted from contextAnalysisService.js for Issue #513
 */
import logger from "../../utils/common/logger";

export class PageDetectionService {
  /**
   * Identify the current page/view based on URL and DOM
   * @returns {string} Current page identifier
   */
  static identifyCurrentPage() {
    try {
      const path = window.location.pathname;
      const hash = window.location.hash;

      // Check URL path patterns
      if (path.includes("/bills") || hash.includes("bills")) return "bills";
      if (path.includes("/debt") || hash.includes("debt")) return "debt";
      if (path.includes("/envelope") || path.includes("/budget") || hash.includes("envelope"))
        return "envelope";
      if (path.includes("/transaction") || hash.includes("transaction")) return "transaction";
      if (path.includes("/saving") || hash.includes("saving")) return "savings";
      if (path.includes("/analytic") || hash.includes("analytic")) return "analytics";
      if (path.includes("/setting") || hash.includes("setting")) return "settings";
      if (path.includes("/onboard") || hash.includes("onboard")) return "onboarding";

      // Check for active navigation indicators (now with proper aria-current and data attributes)
      const activeNav = document.querySelector('[aria-current="page"]');
      if (activeNav) {
        // First try the data-view attribute (most reliable)
        const viewKey = activeNav.getAttribute("data-view");
        if (viewKey) {
          // Map view keys to standard page names
          const viewMapping = {
            bills: "bills",
            debts: "debt",
            envelopes: "envelope",
            transactions: "transaction",
            savings: "savings",
            analytics: "analytics",
            dashboard: "dashboard",
            supplemental: "supplemental",
            paycheck: "paycheck",
          };
          const mappedView = viewMapping[viewKey];
          if (mappedView) return mappedView;
        }

        // Fallback to text-based detection
        const navText = activeNav.textContent?.toLowerCase().trim();
        if (navText?.includes("bill")) return "bills";
        if (navText?.includes("debt")) return "debt";
        if (navText?.includes("envelope")) return "envelope";
        if (navText?.includes("transaction")) return "transaction";
        if (navText?.includes("saving")) return "savings";
        if (navText?.includes("analytic")) return "analytics";
        if (navText?.includes("dashboard")) return "dashboard";
        if (navText?.includes("supplemental")) return "supplemental";
        if (navText?.includes("paycheck")) return "paycheck";
      }

      // Check document title
      const title = document.title?.toLowerCase();
      if (title?.includes("bill")) return "bills";
      if (title?.includes("debt")) return "debt";
      if (title?.includes("envelope") || title?.includes("budget")) return "envelope";
      if (title?.includes("transaction")) return "transaction";
      if (title?.includes("saving")) return "savings";
      if (title?.includes("analytic")) return "analytics";
      if (title?.includes("setting")) return "settings";

      // Fallback to checking main content areas
      if (document.querySelector('[class*="bill"]')) return "bills";
      if (document.querySelector('[class*="debt"]')) return "debt";
      if (document.querySelector('[class*="envelope"]')) return "envelope";

      return "unknown";
    } catch (error) {
      logger.warn("Error identifying current page", error);
      return "unknown";
    }
  }

  /**
   * Get detailed route information
   * @returns {Object} Route information
   */
  static getRouteInfo() {
    try {
      const url = new URL(window.location.href);

      return {
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
        searchParams: Object.fromEntries(url.searchParams),
        segments: url.pathname.split("/").filter(Boolean),
        currentPage: this.identifyCurrentPage(),
      };
    } catch (error) {
      logger.warn("Error collecting route info", error);
      return {
        pathname: window.location.pathname || "/",
        search: window.location.search || "",
        hash: window.location.hash || "",
        searchParams: {},
        segments: [],
        currentPage: "unknown",
      };
    }
  }

  /**
   * Get screen title and context information
   * @returns {Object} Screen context
   */
  static getScreenContext() {
    try {
      const context = {
        documentTitle: document.title || "Unknown",
        screenTitle: this.extractScreenTitle(),
        breadcrumbs: this.extractBreadcrumbs(),
        mainHeading: this.extractMainHeading(),
      };

      return context;
    } catch (error) {
      logger.warn("Error getting screen context", error);
      return {
        documentTitle: document.title || "Unknown",
        screenTitle: "Unknown",
        breadcrumbs: [],
        mainHeading: null,
      };
    }
  }

  /**
   * Extract the main screen title from DOM
   * @returns {string} Screen title
   */
  static extractScreenTitle() {
    try {
      // Try various selectors for main title
      const titleSelectors = [
        "h1",
        '[class*="title"]',
        '[class*="heading"]',
        '[class*="header"]',
        ".page-title",
        ".screen-title",
      ];

      for (const selector of titleSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent?.trim()) {
          return element.textContent.trim();
        }
      }

      return document.title || "Unknown";
    } catch (error) {
      return "Unknown";
    }
  }

  /**
   * Extract breadcrumb navigation if available
   * @returns {Array} Breadcrumb items
   */
  static extractBreadcrumbs() {
    try {
      const breadcrumbs = [];

      // Look for common breadcrumb patterns
      const breadcrumbSelectors = [
        '[class*="breadcrumb"] a',
        '[role="navigation"] a',
        "nav a[aria-current]",
        ".breadcrumb-item",
      ];

      for (const selector of breadcrumbSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          elements.forEach((el) => {
            const text = el.textContent?.trim();
            if (text) breadcrumbs.push(text);
          });
          break; // Use first matching pattern
        }
      }

      return breadcrumbs;
    } catch (error) {
      return [];
    }
  }

  /**
   * Extract main page heading
   * @returns {string|null} Main heading text
   */
  static extractMainHeading() {
    try {
      const mainHeading = document.querySelector("main h1, section h1, .content h1, h1");
      return mainHeading ? mainHeading.textContent?.trim() : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get user's location within the app with hierarchy
   * @returns {string} User location string
   */
  static getUserLocation() {
    try {
      const currentPage = this.identifyCurrentPage();
      const screenTitle = this.extractScreenTitle();
      const activeModal = this.getActiveModalTitle();

      let location = currentPage;

      if (screenTitle && screenTitle !== document.title && screenTitle !== "Unknown") {
        location += ` > ${screenTitle}`;
      }

      if (activeModal) {
        location += ` > ${activeModal}`;
      }

      return location;
    } catch (error) {
      return "Unknown";
    }
  }

  /**
   * Get active modal title if any
   * @returns {string|null} Active modal title
   */
  static getActiveModalTitle() {
    try {
      const modalSelectors = [
        '[role="dialog"] h1',
        '[role="dialog"] h2',
        '[role="dialog"] [class*="title"]',
        ".modal h1",
        ".modal h2",
        '.modal [class*="title"]',
      ];

      for (const selector of modalSelectors) {
        const element = document.querySelector(selector);
        if (element && element.offsetParent !== null) {
          // visible
          const title = element.textContent?.trim();
          if (title) return title;
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }
}
