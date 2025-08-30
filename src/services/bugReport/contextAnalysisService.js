/**
 * Context Analysis Service
 * Analyzes page context, DOM state, and application state for bug reports
 * Extracted from useBugReport.js for Issue #513
 */
import logger from "../../utils/common/logger";

export class ContextAnalysisService {
  /**
   * Get comprehensive page context for bug reports
   * @returns {Object} Page context information
   */
  static getCurrentPageContext() {
    try {
      const context = {
        page: this.identifyCurrentPage(),
        route: this.getRouteInfo(),
        ui: this.getUIState(),
        data: this.getDataState(),
        interactions: this.getRecentInteractions(),
        performance: this.getPagePerformance(),
        accessibility: this.getAccessibilityInfo(),
      };

      logger.debug("Page context analyzed", context);
      return context;
    } catch (error) {
      logger.error("Failed to analyze page context", error);
      return this.getFallbackContext();
    }
  }

  /**
   * Identify current page/route from URL and DOM
   * @returns {string} Page identifier
   */
  static identifyCurrentPage() {
    try {
      const pathname = window.location.pathname;
      const hash = window.location.hash;

      // Route-based identification
      if (pathname.includes("/dashboard")) return "dashboard";
      if (pathname.includes("/budget")) return "budgeting";
      if (pathname.includes("/envelope")) return "envelope-management";
      if (pathname.includes("/transaction")) return "transactions";
      if (pathname.includes("/automation")) return "automation";
      if (pathname.includes("/settings")) return "settings";
      if (pathname.includes("/reports")) return "reports";
      if (pathname.includes("/bills")) return "bills";

      // Hash-based identification (SPA routing)
      if (hash.includes("dashboard")) return "dashboard";
      if (hash.includes("budget")) return "budgeting";
      if (hash.includes("envelope")) return "envelope-management";

      // DOM-based identification as fallback
      const pageTitle = document.title;
      const mainHeading = document.querySelector("h1, .page-title, [data-page]");

      if (pageTitle.toLowerCase().includes("dashboard")) return "dashboard";
      if (pageTitle.toLowerCase().includes("budget")) return "budgeting";
      if (pageTitle.toLowerCase().includes("envelope")) return "envelope-management";

      if (mainHeading) {
        const headingText = mainHeading.textContent.toLowerCase();
        if (headingText.includes("dashboard")) return "dashboard";
        if (headingText.includes("budget")) return "budgeting";
        if (headingText.includes("envelope")) return "envelope-management";
        if (headingText.includes("transaction")) return "transactions";
        if (headingText.includes("automation")) return "automation";
      }

      // Check for specific page indicators
      if (document.querySelector('[data-testid*="dashboard"]')) return "dashboard";
      if (document.querySelector('[data-testid*="budget"]')) return "budgeting";
      if (document.querySelector('[data-testid*="envelope"]')) return "envelope-management";

      return pathname || "unknown";
    } catch (error) {
      logger.warn("Error identifying current page", error);
      return "unknown";
    }
  }

  /**
   * Get routing information
   * @returns {Object} Route information
   */
  static getRouteInfo() {
    try {
      return {
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
        params: this.parseURLParams(),
        title: document.title,
        meta: this.getMetaTags(),
      };
    } catch (error) {
      logger.warn("Error collecting route info", error);
      return {
        pathname: window.location.pathname || "unknown",
        error: error.message,
      };
    }
  }

  /**
   * Get current UI state
   * @returns {Object} UI state information
   */
  static getUIState() {
    try {
      return {
        modals: this.getActiveModals(),
        drawers: this.getActiveDrawers(),
        tabs: this.getActiveTabs(),
        forms: this.getActiveForms(),
        buttons: this.getButtonStates(),
        inputs: this.getInputStates(),
        loading: this.getLoadingStates(),
        errors: this.getVisibleErrors(),
        notifications: this.getActiveNotifications(),
      };
    } catch (error) {
      logger.warn("Error collecting UI state", error);
      return { error: error.message };
    }
  }

  /**
   * Get application data state
   * @returns {Object} Data state information
   */
  static getDataState() {
    try {
      return {
        localStorage: this.getSafeLocalStorageData(),
        sessionStorage: this.getSafeSessionStorageData(),
        forms: this.getFormData(),
        tables: this.getTableData(),
        lists: this.getListData(),
        customData: this.getCustomDataAttributes(),
      };
    } catch (error) {
      logger.warn("Error collecting data state", error);
      return { error: error.message };
    }
  }

  /**
   * Get recent user interactions
   * @returns {Object} Interaction information
   */
  static getRecentInteractions() {
    try {
      return {
        lastClick: this.getLastClickInfo(),
        lastInput: this.getLastInputInfo(),
        lastScroll: this.getScrollInfo(),
        lastNavigation: this.getNavigationInfo(),
        activeElement: this.getActiveElementInfo(),
        focusHistory: this.getFocusHistory(),
      };
    } catch (error) {
      logger.warn("Error collecting interaction info", error);
      return { error: error.message };
    }
  }

  /**
   * Get page performance metrics
   * @returns {Object} Performance information
   */
  static getPagePerformance() {
    try {
      return {
        loadTime: this.getLoadTime(),
        renderTime: this.getRenderTime(),
        resourceCount: this.getResourceCount(),
        memoryUsage: this.getMemoryUsage(),
        slowElements: this.detectSlowElements(),
      };
    } catch (error) {
      logger.warn("Error collecting performance info", error);
      return { error: error.message };
    }
  }

  /**
   * Get accessibility information
   * @returns {Object} Accessibility information
   */
  static getAccessibilityInfo() {
    try {
      return {
        ariaAttributes: this.getAriaAttributes(),
        focusableElements: this.getFocusableElements(),
        headingStructure: this.getHeadingStructure(),
        landmarks: this.getLandmarks(),
        colorContrast: this.getColorContrastIssues(),
        altTexts: this.getImageAltTexts(),
      };
    } catch (error) {
      logger.warn("Error collecting accessibility info", error);
      return { error: error.message };
    }
  }

  // Helper methods for UI state analysis

  static getActiveModals() {
    const modals = document.querySelectorAll('[role="dialog"], .modal, [data-modal], .overlay');
    return Array.from(modals)
      .filter((modal) => this.isVisible(modal))
      .map((modal) => ({
        id: modal.id,
        className: modal.className,
        title: modal.querySelector("h1, h2, h3, .modal-title, [data-title]")?.textContent?.trim(),
        visible: true,
      }));
  }

  static getActiveDrawers() {
    const drawers = document.querySelectorAll(".drawer, .sidebar, [data-drawer], [data-sidebar]");
    return Array.from(drawers)
      .filter((drawer) => this.isVisible(drawer))
      .map((drawer) => ({
        id: drawer.id,
        className: drawer.className,
        position: this.getElementPosition(drawer),
        visible: true,
      }));
  }

  static getActiveTabs() {
    const tabs = document.querySelectorAll('[role="tab"], .tab, [data-tab]');
    return Array.from(tabs).map((tab) => ({
      id: tab.id,
      text: tab.textContent?.trim(),
      active:
        tab.getAttribute("aria-selected") === "true" ||
        tab.classList.contains("active") ||
        tab.classList.contains("selected"),
    }));
  }

  static getActiveForms() {
    const forms = document.querySelectorAll("form");
    return Array.from(forms).map((form) => ({
      id: form.id,
      action: form.action,
      method: form.method,
      fieldCount: form.elements.length,
      hasErrors: !!form.querySelector('.error, .invalid, [aria-invalid="true"]'),
    }));
  }

  static getButtonStates() {
    const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"]');
    return Array.from(buttons)
      .slice(0, 10)
      .map((button) => ({
        // Limit to first 10
        text: button.textContent?.trim() || button.value,
        disabled: button.disabled,
        type: button.type,
        className: button.className,
      }));
  }

  static getInputStates() {
    const inputs = document.querySelectorAll("input, textarea, select");
    return Array.from(inputs)
      .slice(0, 10)
      .map((input) => ({
        // Limit to first 10
        name: input.name,
        type: input.type,
        hasValue: !!input.value,
        required: input.required,
        invalid: input.matches(":invalid") || input.getAttribute("aria-invalid") === "true",
        placeholder: input.placeholder,
      }));
  }

  static getLoadingStates() {
    const loadingElements = document.querySelectorAll(
      '.loading, .spinner, [data-loading], [aria-busy="true"]'
    );
    return Array.from(loadingElements).map((el) => ({
      className: el.className,
      visible: this.isVisible(el),
      text: el.textContent?.trim(),
    }));
  }

  static getVisibleErrors() {
    const errorElements = document.querySelectorAll(
      '.error, .alert-error, .text-red, [role="alert"], [data-error]'
    );
    return Array.from(errorElements)
      .filter((el) => this.isVisible(el))
      .map((el) => ({
        text: el.textContent?.trim(),
        className: el.className,
        role: el.getAttribute("role"),
      }));
  }

  static getActiveNotifications() {
    const notifications = document.querySelectorAll(
      '.notification, .toast, .alert, [role="status"], [data-notification]'
    );
    return Array.from(notifications)
      .filter((el) => this.isVisible(el))
      .map((el) => ({
        text: el.textContent?.trim(),
        className: el.className,
        type: el.className.includes("error")
          ? "error"
          : el.className.includes("success")
            ? "success"
            : el.className.includes("warning")
              ? "warning"
              : "info",
      }));
  }

  // Helper methods for data state analysis

  static getSafeLocalStorageData() {
    const data = {};
    const sensitiveKeys = ["token", "password", "secret", "key", "auth"];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))) {
          const value = localStorage.getItem(key);
          data[key] = value?.length > 50 ? `${value.substring(0, 50)}...` : value;
        }
      }
    } catch (error) {
      data.error = error.message;
    }

    return data;
  }

  static getSafeSessionStorageData() {
    const data = {};
    const sensitiveKeys = ["token", "password", "secret", "key", "auth"];

    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && !sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))) {
          const value = sessionStorage.getItem(key);
          data[key] = value?.length > 50 ? `${value.substring(0, 50)}...` : value;
        }
      }
    } catch (error) {
      data.error = error.message;
    }

    return data;
  }

  static getFormData() {
    const forms = document.querySelectorAll("form");
    return Array.from(forms).map((form) => {
      const fields = {};
      const formData = new FormData(form);

      for (const [key, value] of formData.entries()) {
        // Only include non-sensitive field names and lengths
        if (!["password", "token", "secret"].includes(key.toLowerCase())) {
          fields[key] = `[${typeof value === "string" ? value.length : 0} chars]`;
        }
      }

      return {
        id: form.id,
        fields,
        fieldCount: Object.keys(fields).length,
      };
    });
  }

  // Utility methods

  static isVisible(element) {
    return (
      element.offsetParent !== null &&
      window.getComputedStyle(element).display !== "none" &&
      window.getComputedStyle(element).visibility !== "hidden"
    );
  }

  static getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };
  }

  static parseURLParams() {
    const params = {};
    const searchParams = new URLSearchParams(window.location.search);

    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }

    return params;
  }

  static getMetaTags() {
    const metaTags = {};
    const metas = document.querySelectorAll("meta[name], meta[property]");

    Array.from(metas).forEach((meta) => {
      const name = meta.getAttribute("name") || meta.getAttribute("property");
      const content = meta.getAttribute("content");
      if (name && content) {
        metaTags[name] = content;
      }
    });

    return metaTags;
  }

  static getFallbackContext() {
    return {
      page: "unknown",
      route: {
        pathname: window.location.pathname,
        title: document.title,
      },
      error: "Context analysis failed - using fallback data",
      timestamp: new Date().toISOString(),
    };
  }

  // Placeholder methods for interaction tracking
  // These would be implemented with proper event listeners in a full system

  static getLastClickInfo() {
    return { note: "Click tracking requires event listener setup" };
  }

  static getLastInputInfo() {
    return { note: "Input tracking requires event listener setup" };
  }

  static getScrollInfo() {
    return {
      x: window.scrollX,
      y: window.scrollY,
      maxX: document.body.scrollWidth - window.innerWidth,
      maxY: document.body.scrollHeight - window.innerHeight,
    };
  }

  static getNavigationInfo() {
    return {
      referrer: document.referrer,
      loadTime: performance.timing?.loadEventEnd - performance.timing?.navigationStart,
    };
  }

  static getActiveElementInfo() {
    const activeEl = document.activeElement;
    return activeEl
      ? {
          tagName: activeEl.tagName,
          className: activeEl.className,
          id: activeEl.id,
          type: activeEl.type,
        }
      : null;
  }

  static getFocusHistory() {
    return { note: "Focus history requires event listener setup" };
  }

  // Performance analysis methods

  static getLoadTime() {
    return performance.timing
      ? performance.timing.loadEventEnd - performance.timing.navigationStart
      : null;
  }

  static getRenderTime() {
    const paintEntries = performance.getEntriesByType("paint");
    return paintEntries.length > 0 ? paintEntries[0].startTime : null;
  }

  static getResourceCount() {
    return {
      total: performance.getEntriesByType("resource").length,
      scripts: document.scripts.length,
      stylesheets: document.styleSheets.length,
      images: document.images.length,
    };
  }

  static getMemoryUsage() {
    return performance.memory
      ? {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit,
        }
      : null;
  }

  static detectSlowElements() {
    // This would require performance observer setup
    return { note: "Slow element detection requires performance observer setup" };
  }

  // Accessibility analysis methods

  static getAriaAttributes() {
    const elements = document.querySelectorAll("[aria-label], [aria-describedby], [role]");
    return Array.from(elements)
      .slice(0, 10)
      .map((el) => ({
        tagName: el.tagName,
        ariaLabel: el.getAttribute("aria-label"),
        role: el.getAttribute("role"),
        ariaDescribedby: el.getAttribute("aria-describedby"),
      }));
  }

  static getFocusableElements() {
    const focusable = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    return {
      count: focusable.length,
      hasTabindex: Array.from(focusable).some((el) => el.hasAttribute("tabindex")),
    };
  }

  static getHeadingStructure() {
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    return Array.from(headings).map((h) => ({
      level: parseInt(h.tagName[1]),
      text: h.textContent?.trim().substring(0, 50),
    }));
  }

  static getLandmarks() {
    const landmarks = document.querySelectorAll(
      '[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], main, nav, header, footer'
    );
    return Array.from(landmarks).map((el) => ({
      tagName: el.tagName,
      role: el.getAttribute("role") || el.tagName.toLowerCase(),
    }));
  }

  static getColorContrastIssues() {
    return { note: "Color contrast analysis requires complex DOM computation" };
  }

  static getImageAltTexts() {
    const images = document.querySelectorAll("img");
    return Array.from(images)
      .slice(0, 5)
      .map((img) => ({
        src: img.src?.substring(0, 50),
        alt: img.alt,
        hasAlt: !!img.alt,
      }));
  }

  static getTableData() {
    const tables = document.querySelectorAll("table");
    return Array.from(tables).map((table) => ({
      rows: table.rows.length,
      headers: table.querySelectorAll("th").length,
      caption: table.caption?.textContent?.trim(),
    }));
  }

  static getListData() {
    const lists = document.querySelectorAll("ul, ol, dl");
    return Array.from(lists)
      .slice(0, 5)
      .map((list) => ({
        type: list.tagName.toLowerCase(),
        items: list.children.length,
        className: list.className,
      }));
  }

  static getCustomDataAttributes() {
    const elements = document.querySelectorAll("[data-testid], [data-cy], [data-qa]");
    return Array.from(elements)
      .slice(0, 10)
      .map((el) => ({
        tagName: el.tagName,
        testId: el.getAttribute("data-testid"),
        cy: el.getAttribute("data-cy"),
        qa: el.getAttribute("data-qa"),
      }));
  }
}
