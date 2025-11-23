/**
 * UI State Analysis Service
 * Handles modal detection, form states, and UI element analysis
 * Extracted from contextAnalysisService.js for Issue #513
 */
import logger from "../../utils/common/logger";

// Type definitions
interface ModalInfo {
  title: string;
  type: string;
  hasCloseButton: boolean;
  hasForm: boolean;
  selector: string;
}

interface DrawerInfo {
  title: string;
  position: string;
  selector: string;
}

interface TabInfo {
  title: string;
  isActive: boolean;
  selector: string;
}

interface FormInfo {
  action: string;
  method: string;
  inputCount: number;
  buttonCount: number;
  isValid: boolean | null;
  title: string;
}

interface ButtonState {
  text: string;
  disabled: boolean;
  type: string;
  hasIcon: boolean;
  classes: string;
}

interface InputState {
  type: string;
  name: string;
  placeholder: string;
  hasValue: boolean;
  required: boolean;
  disabled: boolean;
  label: string | null;
}

interface LoadingState {
  type: string;
  selector: string;
  text: string;
}

interface InteractionInfo {
  text: string;
  type: string;
  href: string | null;
}

interface UIState {
  modals: ModalInfo[];
  drawers: DrawerInfo[];
  tabs: TabInfo[];
  forms: FormInfo[];
  buttons: ButtonState[];
  inputs: InputState[];
  loading: LoadingState[];
  interactions: InteractionInfo[];
}

export class UIStateService {
  /**
   * Get comprehensive UI state information
   */
  static getUIState(): UIState {
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
      logger.warn("Error collecting UI state", { error });
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
   */
  static getActiveModals(): ModalInfo[] {
    try {
      const modals: ModalInfo[] = [];
      const modalSelectors = [
        '[role="dialog"]',
        ".modal",
        '[class*="Modal"]',
        '.fixed[class*="z-"]', // Common modal z-index classes
      ];

      modalSelectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          if (element instanceof HTMLElement && element.offsetParent !== null) {
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
      logger.debug("Error getting active modals", { error });
      return [];
    }
  }

  /**
   * Get active drawers/sidebars
   */
  static getActiveDrawers(): DrawerInfo[] {
    try {
      const drawers: DrawerInfo[] = [];
      const drawerSelectors = ['[class*="drawer"]', '[class*="sidebar"]', '[class*="offcanvas"]'];

      drawerSelectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          if (
            element instanceof HTMLElement &&
            element.offsetParent !== null &&
            this.isElementVisible(element)
          ) {
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
      logger.debug("Error getting active drawers", { error });
      return [];
    }
  }

  /**
   * Get active tabs
   */
  static getActiveTabs(): TabInfo[] {
    try {
      const tabs: TabInfo[] = [];
      const tabSelectors = [
        '[role="tab"][aria-selected="true"]',
        ".tab.active",
        '[class*="tab"][class*="active"]',
      ];

      tabSelectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          if (element instanceof HTMLElement && this.isElementVisible(element)) {
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
      logger.debug("Error getting active tabs", { error });
      return [];
    }
  }

  /**
   * Get active forms
   */
  static getActiveForms(): FormInfo[] {
    try {
      const forms: FormInfo[] = [];
      const formElements = document.querySelectorAll("form");

      formElements.forEach((form) => {
        if (form instanceof HTMLFormElement && this.isElementVisible(form)) {
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
      logger.debug("Error getting active forms", { error });
      return [];
    }
  }

  /**
   * Get button states
   */
  static getButtonStates(): ButtonState[] {
    try {
      const buttons: ButtonState[] = [];
      const visibleButtons = document.querySelectorAll('button:not([style*="display: none"])');

      // Limit to prevent overwhelming data
      const buttonSample = Array.from(visibleButtons).slice(0, 20);

      buttonSample.forEach((button) => {
        if (button instanceof HTMLButtonElement && this.isElementVisible(button)) {
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
      logger.debug("Error getting button states", { error });
      return [];
    }
  }

  /**
   * Get input states
   */
  static getInputStates(): InputState[] {
    try {
      const inputs: InputState[] = [];
      const inputElements = document.querySelectorAll("input, textarea, select");

      // Sample to prevent too much data
      const inputSample = Array.from(inputElements).slice(0, 15);

      inputSample.forEach((input) => {
        if (input instanceof HTMLElement && this.isElementVisible(input)) {
          const inputEl = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
          inputs.push({
            type:
              inputEl instanceof HTMLInputElement ? inputEl.type : inputEl.tagName.toLowerCase(),
            name: "name" in inputEl ? inputEl.name || "" : "",
            placeholder: "placeholder" in inputEl ? inputEl.placeholder || "" : "",
            hasValue: !!("value" in inputEl && inputEl.value),
            required: "required" in inputEl ? inputEl.required : false,
            disabled: "disabled" in inputEl ? inputEl.disabled : false,
            label: this.getInputLabel(input),
          });
        }
      });

      return inputs;
    } catch (error) {
      logger.debug("Error getting input states", { error });
      return [];
    }
  }

  /**
   * Get loading states
   */
  static getLoadingStates(): LoadingState[] {
    try {
      const loadingStates: LoadingState[] = [];
      const loadingSelectors = [
        '[class*="loading"]',
        '[class*="spinner"]',
        '[class*="skeleton"]',
        '[aria-busy="true"]',
      ];

      loadingSelectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          if (element instanceof HTMLElement && this.isElementVisible(element)) {
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
      logger.debug("Error getting loading states", { error });
      return [];
    }
  }

  /**
   * Get visible interactive elements
   */
  static getVisibleInteractions(): InteractionInfo[] {
    try {
      const interactions: InteractionInfo[] = [];
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
            if (element instanceof HTMLElement && this.isElementVisible(element)) {
              const anchorEl = element as HTMLAnchorElement;
              interactions.push({
                text:
                  element.textContent?.trim()?.substring(0, 30) ||
                  (element as HTMLImageElement).alt ||
                  "Interactive",
                type: this.getInteractionType(element),
                href: anchorEl.href || null,
              });
            }
          });
      });

      return interactions;
    } catch (error) {
      logger.debug("Error getting visible interactions", { error });
      return [];
    }
  }

  // Helper methods

  /**
   * Check if element is visible
   */
  static isElementVisible(element: Element): boolean {
    if (!(element instanceof HTMLElement)) return false;
    return (
      element &&
      element.offsetParent !== null &&
      !element.hidden &&
      window.getComputedStyle(element).display !== "none"
    );
  }

  /**
   * Extract title from element
   */
  static extractElementTitle(element: Element): string | null {
    // Try various approaches to get element title
    const titleSelectors = ["h1", "h2", "h3", '[class*="title"]', "legend", "label"];

    for (const selector of titleSelectors) {
      const titleEl = element.querySelector(selector);
      if (titleEl?.textContent?.trim()) {
        return titleEl.textContent.trim();
      }
    }

    if (element instanceof HTMLElement) {
      return element.title || element.getAttribute("aria-label") || null;
    }
    return null;
  }

  /**
   * Identify modal type
   */
  static identifyModalType(element: Element): string {
    if (!(element instanceof HTMLElement)) return "modal";
    const classList = element.className.toLowerCase();

    if (classList.includes("confirm")) return "confirmation";
    if (classList.includes("alert")) return "alert";
    if (classList.includes("dialog")) return "dialog";
    if (element.querySelector("form")) return "form";

    return "modal";
  }

  /**
   * Get drawer position
   */
  static getDrawerPosition(element: HTMLElement): string {
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
   */
  static getInputLabel(input: Element): string | null {
    if (!(input instanceof HTMLElement)) return null;

    // Try to find associated label
    if (input.id) {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) return label.textContent?.trim() || null;
    }

    // Try parent label
    const parentLabel = input.closest("label");
    if (parentLabel) return parentLabel.textContent?.trim() || null;

    return input.getAttribute("aria-label") || null;
  }

  /**
   * Identify loading type
   */
  static identifyLoadingType(element: HTMLElement): string {
    const classList = element.className.toLowerCase();

    if (classList.includes("spinner")) return "spinner";
    if (classList.includes("skeleton")) return "skeleton";
    if (classList.includes("progress")) return "progress";
    if (element.getAttribute("aria-busy") === "true") return "busy";

    return "loading";
  }

  /**
   * Get interaction type
   */
  static getInteractionType(element: Element): string {
    if (element.tagName === "A") return "link";
    if (element.tagName === "BUTTON") return "button";
    if (element instanceof HTMLInputElement && element.type === "submit") return "submit";
    if (element.getAttribute("role") === "button") return "button-role";
    if (element instanceof HTMLElement && element.onclick) return "clickable";

    return "interactive";
  }
}
