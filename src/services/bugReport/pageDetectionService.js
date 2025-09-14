/**
 * Page Detection Service
 * Handles page identification and route analysis
 * Extracted from contextAnalysisService.js for Issue #513
 */
import logger from "../../utils/common/logger";
import { identifyCurrentPage as detectCurrentPage } from "../../utils/pageDetection/pageIdentifier";

export class PageDetectionService {
  /**
   * Identify the current page/view based on URL and DOM
   * @returns {string} Current page identifier
   */
  static identifyCurrentPage() {
    return detectCurrentPage();
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
    } catch {
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
    } catch {
      return [];
    }
  }

  /**
   * Extract main page heading
   * @returns {string|null} Main heading text
   */
  static extractMainHeading() {
    try {
      const mainHeading = document.querySelector(
        "main h1, section h1, .content h1, h1",
      );
      return mainHeading ? mainHeading.textContent?.trim() : null;
    } catch {
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

      if (
        screenTitle &&
        screenTitle !== document.title &&
        screenTitle !== "Unknown"
      ) {
        location += ` > ${screenTitle}`;
      }

      if (activeModal) {
        location += ` > ${activeModal}`;
      }

      return location;
    } catch {
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
    } catch {
      return null;
    }
  }
}
