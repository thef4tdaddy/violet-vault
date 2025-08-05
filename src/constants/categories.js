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

// Envelope types for classification
export const ENVELOPE_TYPES = {
  BILL: "bill",
  VARIABLE: "variable", 
  SAVINGS: "savings"
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
    displayFormat: "Due: ${amount}/biweekly"
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
    displayFormat: "Budget: ${amount}/month"
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
    displayFormat: "Target: ${amount}"
  }
};

// Auto-classify envelope type based on category
export const AUTO_CLASSIFY_ENVELOPE_TYPE = (category) => {
  if (BILL_CATEGORIES.includes(category)) {
    return ENVELOPE_TYPES.BILL;
  }
  
  // Categories that are typically variable expenses
  const variableCategories = ["Food & Dining", "Transportation", "Health & Medical", "Personal Care"];
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
};
