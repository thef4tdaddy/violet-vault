/**
 * Category pattern matching utilities
 * Extracted from useSmartCategoryAnalysis.js to reduce complexity
 */

/**
 * Bill category pattern mappings
 */
export const BILL_CATEGORY_PATTERNS = {
  Utilities: ["electric", "power", "utility", "gas", "heating", "water", "sewer"],
  Communications: ["internet", "cable", "phone"],
  Insurance: ["insurance"],
  Housing: ["loan", "mortgage", "rent"],
  Entertainment: ["netflix", "spotify", "subscription"],
};

/**
 * Extract merchant name from transaction description
 */
export const extractMerchantName = (description: string | null | undefined): string => {
  const sanitizedDescription = description?.trim();

  if (!sanitizedDescription) {
    return "";
  }

  const desc = sanitizedDescription.toLowerCase();
  const merchantMatch = desc.match(/^([a-zA-Z\s&'-]+)/);
  return merchantMatch ? merchantMatch[1].trim() : desc;
};

/**
 * Suggest bill category based on name patterns
 * Simplified from complex if-chain to pattern matching
 */
export const suggestBillCategory = (billName: string): string | null => {
  const name = billName.toLowerCase();

  for (const [category, patterns] of Object.entries(BILL_CATEGORY_PATTERNS)) {
    if (patterns.some((pattern) => name.includes(pattern))) {
      return category;
    }
  }

  return null;
};

/**
 * Calculate date ranges for transaction filtering
 */
export const getDateRanges = () => {
  const now = new Date();
  return {
    7: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    30: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    90: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
    "6months": new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
  };
};
