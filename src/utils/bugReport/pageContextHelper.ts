/**
 * Page context detection utilities for bug reports
 * Extracted from useBugReport.js to reduce complexity
 */

/**
 * Get current page context for better location tracking
 */
export const getCurrentPageContext = () => {
  const path = window.location.pathname;
  const hash = window.location.hash;

  // Detect active view from navigation or URL
  let currentPage = "unknown";
  let screenTitle = document.title || "Unknown";

  // Detect from URL path
  if (path.includes("/bills") || path.includes("bill")) currentPage = "bills";
  else if (path.includes("/debt") || path.includes("debt")) currentPage = "debt";
  else if (path.includes("/envelope") || path.includes("budget")) currentPage = "envelope";
  else if (path.includes("/transaction")) currentPage = "transaction";
  else if (path.includes("/saving")) currentPage = "savings";
  else if (path.includes("/analytic")) currentPage = "analytics";
  else if (path.includes("/setting")) currentPage = "settings";

  // Try to get more specific screen info
  const mainHeader = document.querySelector("h1, h2, [class*='title'], [class*='header']");
  if (mainHeader) {
    screenTitle = mainHeader.textContent?.trim() || screenTitle;
  }

  // Detect visible modals
  const visibleModals = [];
  const modals = document.querySelectorAll('[role="dialog"], [class*="modal"], [class*="Modal"]');
  modals.forEach((modal) => {
    if (modal.offsetParent !== null) {
      // visible
      const modalTitle = modal.querySelector('h1, h2, h3, [class*="title"]');
      if (modalTitle) {
        visibleModals.push(modalTitle.textContent?.trim());
      }
    }
  });

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
