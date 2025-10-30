/**
 * Page Detection Service
 * Handles page identification and route analysis
 * Enhanced with React Router integration for Issue #347
 * Extracted from contextAnalysisService.js for Issue #513
 */
import logger from "../../utils/common/logger";
import { identifyCurrentPage as detectCurrentPage } from "../../utils/pageDetection/pageIdentifier";
import { pathToViewMap } from "../../components/layout/routeConfig";

// Type definitions
interface RouteInfo {
  pathname: string;
  search: string;
  hash: string;
  searchParams: Record<string, string>;
  segments: string[];
  currentPage: string;
  currentView: string;
  isAppRoute: boolean;
  isMarketingRoute: boolean;
  buildTarget: string;
  routeType: string;
}

interface ScreenContext {
  documentTitle: string;
  screenTitle: string;
  breadcrumbs: string[];
  mainHeading: string | null;
}

export class PageDetectionService {
  /**
   * Identify the current page/view based on URL and DOM
   */
  static identifyCurrentPage(): string {
    return detectCurrentPage();
  }

  /**
   * Get detailed route information with React Router awareness
   */
  static getRouteInfo(): RouteInfo {
    try {
      const url = new URL(window.location.href);
      const pathname = url.pathname;

      // Enhanced route analysis using route configuration
      const currentView = pathToViewMap[pathname] || "unknown";
      const isAppRoute =
        Object.keys(pathToViewMap).includes(pathname) || pathname.startsWith("/app");
      const isMarketingRoute = !isAppRoute && !pathname.startsWith("/app");

      // Check build environment for PWA detection
      const isPWA = typeof process !== "undefined" && process.env?.REACT_APP_BUILD_TARGET === "pwa";

      return {
        pathname,
        search: url.search,
        hash: url.hash,
        searchParams: Object.fromEntries(url.searchParams),
        segments: pathname.split("/").filter(Boolean),
        currentPage: this.identifyCurrentPage(),
        // Enhanced router information
        currentView,
        isAppRoute,
        isMarketingRoute,
        buildTarget: isPWA ? "pwa" : "web",
        routeType: isAppRoute ? "app" : "marketing",
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
        currentView: "unknown",
        isAppRoute: false,
        isMarketingRoute: false,
        buildTarget: "web",
        routeType: "unknown",
      };
    }
  }

  /**
   * Get screen title and context information
   */
  static getScreenContext(): ScreenContext {
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
   */
  static extractScreenTitle(): string {
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
   */
  static extractBreadcrumbs(): string[] {
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
   */
  static extractMainHeading(): string | null {
    try {
      const mainHeading = document.querySelector("main h1, section h1, .content h1, h1");
      return mainHeading ? mainHeading.textContent?.trim() : null;
    } catch {
      return null;
    }
  }

  /**
   * Get user's location within the app with hierarchy (Router-enhanced)
   */
  static getUserLocation(): string {
    try {
      const routeInfo = this.getRouteInfo();
      const screenTitle = this.extractScreenTitle();
      const activeModal = this.getActiveModalTitle();

      // Start with router-aware location
      let location;

      if (routeInfo.isMarketingRoute) {
        location = `Marketing: ${routeInfo.pathname}`;
      } else if (routeInfo.isAppRoute) {
        // Convert view to user-friendly name
        const viewNames: Record<string, string> = {
          dashboard: "Dashboard",
          envelopes: "Envelopes",
          savings: "Savings Goals",
          supplemental: "Supplemental Accounts",
          paycheck: "Paycheck Processor",
          bills: "Bills & Payments",
          transactions: "Transaction Ledger",
          debts: "Debt Management",
          analytics: "Analytics & Reports",
          automation: "Automation Rules",
          activity: "Activity History",
        };

        const viewName = viewNames[routeInfo.currentView] || routeInfo.currentView;
        location = routeInfo.buildTarget === "pwa" ? `PWA: ${viewName}` : `App: ${viewName}`;
      } else {
        // Fallback to legacy detection
        location = this.identifyCurrentPage();
      }

      // Add screen title if different
      if (screenTitle && screenTitle !== document.title && screenTitle !== "Unknown") {
        location += ` > ${screenTitle}`;
      }

      // Add modal context
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
   */
  static getActiveModalTitle(): string | null {
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
        if (element && (element as HTMLElement).offsetParent !== null) {
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
