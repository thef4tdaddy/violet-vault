// Standardized categories used across the entire application
// Used for envelopes, bills, transactions, and all other categorized items
export const STANDARD_CATEGORIES = [
  // Essential/Fixed Categories
  "Housing",
  "Transportation",
  "Insurance",
  "Bills & Utilities",

  // Variable/Lifestyle Categories
  "Food & Dining",
  "Entertainment",
  "Shopping",
  "Health & Medical",
  "Personal Care",

  // Growth/Future Categories
  "Education",
  "Savings",
  "Emergency",

  // Social/Business/Other
  "Travel",
  "Gifts & Donations",
  "Business",
  "Other",
];

// Legacy transaction categories - kept for backwards compatibility
export const TRANSACTION_CATEGORIES = STANDARD_CATEGORIES;

// Default category for uncategorized transactions
export const DEFAULT_CATEGORY = "Other";

// Categories specifically for expenses
export const EXPENSE_CATEGORIES = STANDARD_CATEGORIES;

// Categories specifically for envelope creation
export const ENVELOPE_CATEGORIES = STANDARD_CATEGORIES;

// Categories specifically for bills
export const BILL_CATEGORIES_EXTENDED = [
  "Housing",
  "Bills & Utilities",
  "Insurance",
  "Transportation",
  "Health & Medical",
  "Education",
];

// Categories that are typically bills/recurring expenses
export const BILL_CATEGORIES = [
  "Bills & Utilities",
  "Health & Medical",
  "Transportation",
  "Education",
];

// Envelope types for classification
export const ENVELOPE_TYPES = {
  BILL: "bill",
  VARIABLE: "variable",
  SAVINGS: "savings",
};

// Default envelope type for new envelopes
export const DEFAULT_ENVELOPE_TYPE = ENVELOPE_TYPES.VARIABLE;

// Envelope type definitions with properties
export const ENVELOPE_TYPE_CONFIG = {
  [ENVELOPE_TYPES.BILL]: {
    name: "Bill Envelope",
    description: "Fixed recurring amounts (rent, insurance, phone bills)",
    color: "blue",
    borderColor: "border-blue-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    icon: "FileText",
    fundingMethod: "biweekly", // Uses biweeklyAllocation
    displayFormat: "Due: ${amount}/biweekly",
  },
  [ENVELOPE_TYPES.VARIABLE]: {
    name: "Variable Expense Envelope",
    description: "Regular but flexible spending (gas, groceries, medical, pet expenses)",
    color: "orange",
    borderColor: "border-orange-500",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    icon: "TrendingUp",
    fundingMethod: "monthly", // Uses monthlyBudget
    displayFormat: "Budget: ${amount}/month",
  },
  [ENVELOPE_TYPES.SAVINGS]: {
    name: "Savings Goal Envelope",
    description: "Long-term savings targets",
    color: "green",
    borderColor: "border-green-500",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    icon: "Target",
    fundingMethod: "target", // Uses targetAmount
    displayFormat: "Target: ${amount}",
  },
};

// Auto-classify envelope type based on category
export const AUTO_CLASSIFY_ENVELOPE_TYPE = (category) => {
  // Categories that are typically bills/recurring expenses
  const billCategories = ["Housing", "Bills & Utilities", "Insurance"];
  if (billCategories.includes(category)) {
    return ENVELOPE_TYPES.BILL;
  }

  // Categories that are typically savings goals
  const savingsCategories = [
    "Savings",
    "Emergency",
    "Travel", // Often saved for over time
  ];
  if (savingsCategories.includes(category)) {
    return ENVELOPE_TYPES.SAVINGS;
  }

  // Categories that are typically variable expenses
  const variableCategories = [
    "Food & Dining",
    "Transportation",
    "Health & Medical",
    "Personal Care",
    "Entertainment",
    "Shopping",
    "Education",
    "Gifts & Donations",
    "Business",
  ];
  if (variableCategories.includes(category)) {
    return ENVELOPE_TYPES.VARIABLE;
  }

  // Default to variable for unknown categories
  return ENVELOPE_TYPES.VARIABLE;
};

// Merchant pattern mapping to categories for smart suggestions
export const MERCHANT_CATEGORY_PATTERNS = {
  "Food & Dining":
    /grocery|market|food|kroger|safeway|walmart|target|costco|whole foods|restaurant|cafe|coffee|pizza|burger|taco|starbucks|mcdonalds/i,
  Transportation:
    /gas|fuel|shell|exxon|chevron|bp|mobil|uber|lyft|taxi|car|auto|registration|license|parking/i,
  Entertainment: /movie|theater|netflix|spotify|game|entertainment|concert/i,
  Shopping: /amazon|store|shop|mall|online|retail|ebay/i,
  "Health & Medical":
    /pharmacy|medical|doctor|hospital|cvs|walgreens|clinic|insurance|health|auto|home|life/i,
  "Bills & Utilities":
    /electric|water|gas|sewer|internet|cable|phone|utility|bill|subscription|monthly|annual|membership/i,
  Business: /bank|atm|fee|transfer|interest|loan|credit|finance/i,
  Travel: /hotel|flight|airline|travel|vacation/i,
  Housing: /rent|mortgage|property|hoa|maintenance|repair|utilities/i,
  Insurance: /insurance|premium|policy|coverage/i,
  Emergency: /emergency|urgent|unexpected/i,
  Savings: /saving|investment|retirement|401k|ira/i,
};

/**
 * Get all standard categories for use in UI components
 * @returns {Array<string>} Array of category names
 */
export function getStandardCategories() {
  return [...STANDARD_CATEGORIES];
}

/**
 * Get categories appropriate for bills
 * @returns {Array<string>} Array of bill-appropriate category names
 */
export function getBillCategories() {
  return [...BILL_CATEGORIES_EXTENDED];
}

/**
 * Get categories appropriate for envelopes
 * @returns {Array<string>} Array of envelope-appropriate category names
 */
export function getEnvelopeCategories() {
  return [...ENVELOPE_CATEGORIES];
}
