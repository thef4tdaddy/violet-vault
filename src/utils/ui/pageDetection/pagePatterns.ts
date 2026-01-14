/**
 * Page detection patterns and utilities
 * Extracted from pageDetectionService.js to reduce complexity
 */

export type PageType =
  | "bills"
  | "debt"
  | "envelope"
  | "transaction"
  | "savings"
  | "analytics"
  | "settings"
  | "onboarding"
  | "dashboard"
  | "supplemental"
  | "paycheck"
  | "unknown";

interface PagePattern {
  patterns: string[];
  page: PageType;
}

interface NavPattern {
  keywords: string[];
  page: PageType;
}

interface TitlePattern {
  keywords: string[];
  page: PageType;
}

interface DomPattern {
  selector: string;
  page: PageType;
}

/**
 * Page pattern mapping for URL detection
 */
export const PAGE_URL_PATTERNS: PagePattern[] = [
  { patterns: ["/bills", "bills"], page: "bills" },
  { patterns: ["/debt", "debt"], page: "debt" },
  { patterns: ["/envelope", "/budget", "envelope"], page: "envelope" },
  { patterns: ["/transaction", "transaction"], page: "transaction" },
  { patterns: ["/saving", "saving"], page: "savings" },
  { patterns: ["/analytic", "analytic"], page: "analytics" },
  { patterns: ["/setting", "setting"], page: "settings" },
  { patterns: ["/onboard", "onboard"], page: "onboarding" },
];

/**
 * View key mapping for navigation detection
 */
export const VIEW_KEY_MAPPING: Record<string, PageType> = {
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

/**
 * Navigation text patterns for fallback detection
 */
export const NAV_TEXT_PATTERNS: NavPattern[] = [
  { keywords: ["bill"], page: "bills" },
  { keywords: ["debt"], page: "debt" },
  { keywords: ["envelope"], page: "envelope" },
  { keywords: ["transaction"], page: "transaction" },
  { keywords: ["saving"], page: "savings" },
  { keywords: ["analytic"], page: "analytics" },
  { keywords: ["dashboard"], page: "dashboard" },
  { keywords: ["supplemental"], page: "supplemental" },
  { keywords: ["paycheck"], page: "paycheck" },
];

/**
 * Document title patterns for detection
 */
export const TITLE_PATTERNS: TitlePattern[] = [
  { keywords: ["bill"], page: "bills" },
  { keywords: ["debt"], page: "debt" },
  { keywords: ["envelope", "budget"], page: "envelope" },
  { keywords: ["transaction"], page: "transaction" },
  { keywords: ["saving"], page: "savings" },
  { keywords: ["analytic"], page: "analytics" },
  { keywords: ["setting"], page: "settings" },
];

/**
 * DOM class patterns for fallback detection
 */
export const DOM_CLASS_PATTERNS: DomPattern[] = [
  { selector: '[class*="bill"]', page: "bills" },
  { selector: '[class*="debt"]', page: "debt" },
  { selector: '[class*="envelope"]', page: "envelope" },
];

/**
 * Check URL patterns against current location
 */
export const checkUrlPatterns = (path: string, hash: string): PageType | null => {
  for (const { patterns, page } of PAGE_URL_PATTERNS) {
    if (patterns.some((pattern) => path.includes(pattern) || hash.includes(pattern))) {
      return page;
    }
  }
  return null;
};

/**
 * Check navigation text patterns
 */
export const checkNavTextPatterns = (navText: string | null): PageType | null => {
  if (!navText) return null;

  const lowerText = navText.toLowerCase().trim();
  for (const { keywords, page } of NAV_TEXT_PATTERNS) {
    if (keywords.some((keyword) => lowerText.includes(keyword))) {
      return page;
    }
  }
  return null;
};

/**
 * Check document title patterns
 */
export const checkTitlePatterns = (title: string | null): PageType | null => {
  if (!title) return null;

  const lowerTitle = title.toLowerCase();
  for (const { keywords, page } of TITLE_PATTERNS) {
    if (keywords.some((keyword) => lowerTitle.includes(keyword))) {
      return page;
    }
  }
  return null;
};

/**
 * Check DOM class patterns
 */
export const checkDomClassPatterns = (): PageType | null => {
  for (const { selector, page } of DOM_CLASS_PATTERNS) {
    if (document.querySelector(selector)) {
      return page;
    }
  }
  return null;
};
