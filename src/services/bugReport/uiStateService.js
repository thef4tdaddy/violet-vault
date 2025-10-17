/**
 * UI State Analysis Service
 * Handles modal detection, form states, and UI element analysis
 * Extracted from contextAnalysisService.js for Issue #513
 */
import logger from "../../utils/common/logger";

export class UIStateService {
  /**
   * Get comprehensive UI state information
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
        interactions: this.getVisibleInteractions(),
      };
    } catch (error) {
      logger.warn("Error collecting UI state", error);
      return {
        modals: [],
        drawers: [],
        tabs: [],
        forms: [],
        buttons: [],
        inputs: [],
        loading: [],
        interactions: [],
      };
    }
  }

  /**
   * Get active modals
   * @returns {Array} Active modal information
   */
  static getActiveModals() {
    try {
      const modals = [];
      const modalSelectors = [
        '[role="dialog"]',
        ".modal",
        '[class*="Modal"]',
        '.fixed[class*="z-"]', // Common modal z-index classes
      ];

      modalSelectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          if (element.offsetParent !== null) {
            // visible
            const title = this.extractElementTitle(element);
            const type = this.identifyModalType(element);

            modals.push({
              title: title || "Untitled Modal",
              type,
              hasCloseButton: !!element.querySelector(
                '[class*="close"], button[aria-label*="close" i]'
              ),
              hasForm: !!element.querySelector("form"),
              selector,
            });
          }
        });
      });

      return modals;
    } catch (error) {
      logger.debug("Error getting active modals", error);
      return [];
    }
  }

  /**
   * Get active drawers/sidebars
   * @returns {Array} Active drawer information
   */
  static getActiveDrawers() {
    try {
      const drawers = [];
      const drawerSelectors = ['[class*="drawer"]', '[class*="sidebar"]', '[class*="offcanvas"]'];

      drawerSelectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          if (element.offsetParent !== null && this.isElementVisible(element)) {
            drawers.push({
              title: this.extractElementTitle(element) || "Drawer",
              position: this.getDrawerPosition(element),
              selector,
            });
          }
        });
      });

      return drawers;
    } catch (error) {
      logger.debug("Error getting active drawers", error);
      return [];
    }
  }

  /**
   * Get active tabs
   * @returns {Array} Active tab information
   */
  static getActiveTabs() {
    try {
      const tabs = [];
      const tabSelectors = [
        '[role="tab"][aria-selected="true"]',
        ".tab.active",
        '[class*="tab"][class*="active"]',
      ];

      tabSelectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          if (this.isElementVisible(element)) {
            tabs.push({
              title: element.textContent?.trim() || "Tab",
              isActive: true,
              selector,
            });
          }
        });
      });

      return tabs;
    } catch (error) {
      logger.debug("Error getting active tabs", error);
      return [];
    }
  }

  /**
   * Get active forms
   * @returns {Array} Active form information
   */
  static getActiveForms() {
    try {
      const forms = [];
      const formElements = document.querySelectorAll("form");

      formElements.forEach((form) => {
        if (this.isElementVisible(form)) {
          const inputs = form.querySelectorAll("input, textarea, select");
          const buttons = form.querySelectorAll('button, input[type="submit"]');

          forms.push({
            action: form.action || "javascript:void(0)",
            method: form.method || "get",
            inputCount: inputs.length,
            buttonCount: buttons.length,
            isValid: form.checkValidity?.() || null,
            title: this.extractElementTitle(form) || `Form with ${inputs.length} inputs`,
          });
        }
      });

      return forms;
    } catch (error) {
      logger.debug("Error getting active forms", error);
      return [];
    }
  }

  /**
   * Get button states
   * @returns {Array} Button state information
   */
  static getButtonStates() {
    try {
      const buttons = [];
      const visibleButtons = document.querySelectorAll('button:not([style*="display: none"])');

      // Limit to prevent overwhelming data
      const buttonSample = Array.from(visibleButtons).slice(0, 20);

      buttonSample.forEach((button) => {
        if (this.isElementVisible(button)) {
          buttons.push({
            text: button.textContent?.trim()?.substring(0, 50) || "Button",
            disabled: button.disabled,
            type: button.type || "button",
            hasIcon: !!button.querySelector('svg, i, [class*="icon"]'),
            classes: button.className,
          });
        }
      });

      return buttons;
    } catch (error) {
      logger.debug("Error getting button states", error);
      return [];
    }
  }

  /**
   * Get input states
   * @returns {Array} Input state information
   */
  static getInputStates() {
    try {
      const inputs = [];
      const inputElements = document.querySelectorAll("input, textarea, select");

      // Sample to prevent too much data
      const inputSample = Array.from(inputElements).slice(0, 15);

      inputSample.forEach((input) => {
        if (this.isElementVisible(input)) {
          inputs.push({
            type: input.type || input.tagName.toLowerCase(),
            name: input.name || "",
            placeholder: input.placeholder || "",
            hasValue: !!input.value,
            required: input.required,
            disabled: input.disabled,
            label: this.getInputLabel(input),
          });
        }
      });

      return inputs;
    } catch (error) {
      logger.debug("Error getting input states", error);
      return [];
    }
  }

  /**
   * Get loading states
   * @returns {Array} Loading indicator information
   */
  static getLoadingStates() {
    try {
      const loadingStates = [];
      const loadingSelectors = [
        '[class*="loading"]',
        '[class*="spinner"]',
        '[class*="skeleton"]',
        '[aria-busy="true"]',
      ];

      loadingSelectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          if (this.isElementVisible(element)) {
            loadingStates.push({
              type: this.identifyLoadingType(element),
              selector,
              text: element.textContent?.trim()?.substring(0, 50) || "",
            });
          }
        });
      });

      return loadingStates;
    } catch (error) {
      logger.debug("Error getting loading states", error);
      return [];
    }
  }

  /**
   * Get visible interactive elements
   * @returns {Array} Interactive element information
   */
  static getVisibleInteractions() {
    try {
      const interactions = [];
      const interactiveSelectors = [
        "button:not([disabled])",
        "a[href]",
        '[role="button"]',
        "[onclick]",
        'input[type="submit"]',
      ];

      interactiveSelectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        // Sample to prevent overwhelming data
        Array.from(elements)
          .slice(0, 10)
          .forEach((element) => {
            if (this.isElementVisible(element)) {
              interactions.push({
                text: element.textContent?.trim()?.substring(0, 30) || element.alt || "Interactive",
                type: this.getInteractionType(element),
                href: element.href || null,
              });
            }
          });
      });

      return interactions;
    } catch (error) {
      logger.debug("Error getting visible interactions", error);
      return [];
    }
  }

  // Helper methods

  /**
   * Check if element is visible
   * @param {Element} element - DOM element
   * @returns {boolean} Whether element is visible
   */
  static isElementVisible(element) {
    return (
      element &&
      element.offsetParent !== null &&
      !element.hidden &&
      window.getComputedStyle(element).display !== "none"
    );
  }

  /**
   * Extract title from element
   * @param {Element} element - DOM element
   * @returns {string|null} Element title
   */
  static extractElementTitle(element) {
    // Try various approaches to get element title
    const titleSelectors = ["h1", "h2", "h3", '[class*="title"]', "legend", "label"];

    for (const selector of titleSelectors) {
      const titleEl = element.querySelector(selector);
      if (titleEl?.textContent?.trim()) {
        return titleEl.textContent.trim();
      }
    }

    return element.title || element.getAttribute("aria-label") || null;
  }

  /**
   * Identify modal type
   * @param {Element} element - Modal element
   * @returns {string} Modal type
   */
  static identifyModalType(element) {
    const classList = element.className.toLowerCase();

    if (classList.includes("confirm")) return "confirmation";
    if (classList.includes("alert")) return "alert";
    if (classList.includes("dialog")) return "dialog";
    if (element.querySelector("form")) return "form";

    return "modal";
  }

  /**
   * Get drawer position
   * @param {Element} element - Drawer element
   * @returns {string} Drawer position
   */
  static getDrawerPosition(element) {
    const style = window.getComputedStyle(element);
    const classList = element.className.toLowerCase();

    if (classList.includes("left") || style.left === "0px") return "left";
    if (classList.includes("right") || style.right === "0px") return "right";
    if (classList.includes("top") || style.top === "0px") return "top";
    if (classList.includes("bottom") || style.bottom === "0px") return "bottom";

    return "unknown";
  }

  /**
   * Get input label
   * @param {Element} input - Input element
   * @returns {string|null} Input label
   */
  static getInputLabel(input) {
    // Try to find associated label
    if (input.id) {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) return label.textContent?.trim();
    }

    // Try parent label
    const parentLabel = input.closest("label");
    if (parentLabel) return parentLabel.textContent?.trim();

    return input.getAttribute("aria-label") || null;
  }

  /**
   * Identify loading type
   * @param {Element} element - Loading element
   * @returns {string} Loading type
   */
  static identifyLoadingType(element) {
    const classList = element.className.toLowerCase();

    if (classList.includes("spinner")) return "spinner";
    if (classList.includes("skeleton")) return "skeleton";
    if (classList.includes("progress")) return "progress";
    if (element.getAttribute("aria-busy") === "true") return "busy";

    return "loading";
  }

  /**
   * Get interaction type
   * @param {Element} element - Interactive element
   * @returns {string} Interaction type
   */
  static getInteractionType(element) {
    if (element.tagName === "A") return "link";
    if (element.tagName === "BUTTON") return "button";
    if (element.type === "submit") return "submit";
    if (element.getAttribute("role") === "button") return "button-role";
    if (element.onclick) return "clickable";

    return "interactive";
  }
}
