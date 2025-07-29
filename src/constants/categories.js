// Transaction categories used across the application
export const TRANSACTION_CATEGORIES = [
  "Food & Dining",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Transportation",
  "Travel",
  "Health & Medical",
  "Education",
  "Personal Care",
  "Gifts & Donations",
  "Business",
  "Other",
];

// Default category for uncategorized transactions
export const DEFAULT_CATEGORY = "Other";

// Categories specifically for expenses
export const EXPENSE_CATEGORIES = TRANSACTION_CATEGORIES;

// Categories that are typically bills/recurring expenses
export const BILL_CATEGORIES = [
  "Bills & Utilities",
  "Health & Medical",
  "Transportation",
  "Education",
];

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
};
