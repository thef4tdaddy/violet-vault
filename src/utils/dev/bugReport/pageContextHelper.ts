/**
 * Page context detection utilities for bug reports
 * Extracted from useBugReport.js to reduce complexity
 */

export interface PageContext {
  page: string;
  screenTitle: string;
  documentTitle: string;
  userLocation: string;
  visibleModals: (string | null | undefined)[];
  url: string;
  path: string;
  hash: string;
}

/**
 * Detect current page from URL path
 */
const detectPageFromPath = (path: string): string => {
  if (path.includes("/bills") || path.includes("bill")) return "bills";
  if (path.includes("/debt") || path.includes("debt")) return "debt";
  if (path.includes("/envelope") || path.includes("budget")) return "envelope";
  if (path.includes("/transaction")) return "transaction";
  if (path.includes("/saving")) return "savings";
  if (path.includes("/analytic")) return "analytics";
  if (path.includes("/setting")) return "settings";
  return "unknown";
};

/**
 * Get screen title from DOM elements
 */
const getScreenTitle = (): string => {
  const mainHeader = document.querySelector("h1, h2, [class*='title'], [class*='header']");
  return mainHeader?.textContent?.trim() || document.title || "Unknown";
};

/**
 * Detect visible modals and their titles
 */
const getVisibleModals = (): (string | null | undefined)[] => {
  const visibleModals: (string | null | undefined)[] = [];
  const modals = document.querySelectorAll('[role="dialog"], [class*="modal"], [class*="Modal"]');

  modals.forEach((modal) => {
    if ((modal as HTMLElement).offsetParent !== null) {
      const modalTitle = modal.querySelector('h1, h2, h3, [class*="title"]');
      if (modalTitle) {
        visibleModals.push(modalTitle.textContent?.trim());
      }
    }
  });

  return visibleModals;
};

/**
 * Get current page context for better location tracking
 */
export const getCurrentPageContext = (): PageContext => {
  const path = window.location.pathname;
  const hash = window.location.hash;

  const currentPage = detectPageFromPath(path);
  const screenTitle = getScreenTitle();
  const visibleModals = getVisibleModals();

  return {
    page: currentPage,
    screenTitle,
    documentTitle: document.title,
    userLocation: `${currentPage} > ${screenTitle}${visibleModals.length ? ` > ${visibleModals[0]}` : ""}`,
    visibleModals,
    url: window.location.href,
    path,
    hash,
  };
};
