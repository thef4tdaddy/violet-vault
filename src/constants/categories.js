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
