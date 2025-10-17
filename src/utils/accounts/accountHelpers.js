/**
 * Helper utilities for supplemental accounts
 * Handles account data formatting, type definitions, and ID generation
 */

/**
 * Account type definitions with icons and labels
 */
export const ACCOUNT_TYPES = [
  { value: "FSA", label: "FSA (Flexible Spending Account)", icon: "🏥" },
  { value: "HSA", label: "HSA (Health Savings Account)", icon: "💊" },
  { value: "Dependent Care FSA", label: "Dependent Care FSA", icon: "👶" },
  { value: "Commuter Benefits", label: "Commuter Benefits", icon: "🚌" },
  { value: "Gift Cards", label: "Gift Cards", icon: "🎁" },
  { value: "Store Credit", label: "Store Credit", icon: "🏪" },
  { value: "Cashback/Points", label: "Cashback/Rewards Points", icon: "⭐" },
  { value: "Other", label: "Other", icon: "💳" },
];

/**
 * Available color options for accounts
 */
export const ACCOUNT_COLORS = [
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#8b5cf6", // violet
  "#f59e0b", // amber
  "#ef4444", // red
  "#14b8a6", // teal
  "#6366f1", // indigo
  "#84cc16", // lime
  "#f97316", // orange
  "#ec4899", // pink
];

/**
 * Gets account type information by value
 * @param {string} type - Account type value
 * @returns {Object} Account type info with icon and label
 */
export const getAccountTypeInfo = (type) => {
  return (
    ACCOUNT_TYPES.find((t) => t.value === type) || ACCOUNT_TYPES.find((t) => t.value === "Other")
  );
};

/**
 * Formats account form data into a complete account object
 * @param {Object} accountForm - Form data
 * @param {Object} currentUser - Current user info
 * @returns {Object} Formatted account data
 */
export const formatAccountData = (accountForm, currentUser) => {
  return {
    name: accountForm.name.trim(),
    type: accountForm.type,
    currentBalance: parseFloat(accountForm.currentBalance) || 0,
    annualContribution: parseFloat(accountForm.annualContribution) || 0,
    expirationDate: accountForm.expirationDate || null,
    description: accountForm.description?.trim() || null,
    color: accountForm.color,
    isActive: accountForm.isActive,
    createdBy: currentUser.userName,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    transactions: [],
  };
};

/**
 * Generates a unique account ID
 * @returns {number} Timestamp-based ID
 */
let idCounter = 0;
export const generateAccountId = () => {
  // Ensure unique IDs even when called in quick succession
  return Date.now() + ++idCounter;
};

/**
 * Creates a default account form object
 * @returns {Object} Default form data
 */
export const createDefaultAccountForm = () => {
  return {
    name: "",
    type: "FSA",
    currentBalance: "",
    annualContribution: "",
    expirationDate: "",
    description: "",
    color: ACCOUNT_COLORS[0],
    isActive: true,
  };
};

/**
 * Creates a default transfer form object
 * @param {string} fromAccountName - Name of source account
 * @returns {Object} Default transfer form data
 */
export const createDefaultTransferForm = (fromAccountName = "") => {
  return {
    envelopeId: "",
    amount: "",
    description: fromAccountName ? `Transfer from ${fromAccountName}` : "",
  };
};

/**
 * Formats currency amount for display
 * @param {number} amount - Amount to format
 * @param {boolean} showDecimals - Whether to show decimal places
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, showDecimals = true) => {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "$0.00";
  }

  return showDecimals ? `$${amount.toFixed(2)}` : `$${Math.round(amount)}`;
};

/**
 * Formats date for display
 * @param {string} dateString - ISO date string
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";

  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return date.toLocaleDateString("en-US", { ...defaultOptions, ...options });
};

/**
 * Creates a transaction record for account operations
 * @param {Object} params - Transaction parameters
 * @returns {Object} Transaction record
 */
export const createAccountTransaction = ({
  accountId,
  type, // 'transfer_out', 'transfer_in', 'adjustment', 'contribution'
  amount,
  description,
  relatedEntityId = null, // envelope ID for transfers
  metadata = {},
}) => {
  return {
    id: generateAccountId(),
    accountId,
    type,
    amount,
    description,
    relatedEntityId,
    metadata,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Validates account color
 * @param {string} color - Hex color string
 * @returns {boolean} Whether color is valid
 */
export const isValidAccountColor = (color) => {
  if (!color || typeof color !== "string") return false;

  // Check if it's a valid hex color
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
};

/**
 * Gets the appropriate icon component name for account type
 * @param {string} type - Account type
 * @returns {string} Icon component name
 */
export const getAccountIconName = (type) => {
  const _typeInfo = getAccountTypeInfo(type);

  // Map account types to Lucide icon names
  const iconMap = {
    FSA: "Heart",
    HSA: "Shield",
    "Dependent Care FSA": "Baby",
    "Commuter Benefits": "Bus",
    "Gift Cards": "Gift",
    "Store Credit": "ShoppingBag",
    "Cashback/Points": "Star",
    Other: "CreditCard",
  };

  return iconMap[type] || "CreditCard";
};

/**
 * Calculates account utilization percentage
 * @param {number} currentBalance - Current balance
 * @param {number} annualContribution - Annual contribution limit
 * @returns {number} Utilization percentage (0-100)
 */
export const calculateAccountUtilization = (currentBalance, annualContribution) => {
  if (!annualContribution || annualContribution <= 0) return 0;
  if (!currentBalance || currentBalance <= 0) return 0;

  const utilization = (currentBalance / annualContribution) * 100;
  return Math.min(100, Math.max(0, utilization));
};

/**
 * Sorts accounts by priority criteria
 * @param {Array} accounts - Array of accounts
 * @param {string} sortBy - Sort criteria
 * @returns {Array} Sorted accounts
 */
export const sortAccounts = (accounts, sortBy = "name") => {
  if (!Array.isArray(accounts)) return [];

  const sortFunctions = {
    name: (a, b) => a.name.localeCompare(b.name),
    balance: (a, b) => b.currentBalance - a.currentBalance,
    type: (a, b) => a.type.localeCompare(b.type),
    expiration: (a, b) => {
      if (!a.expirationDate && !b.expirationDate) return 0;
      if (!a.expirationDate) return 1;
      if (!b.expirationDate) return -1;
      return new Date(a.expirationDate) - new Date(b.expirationDate);
    },
    lastUpdated: (a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated),
  };

  return [...accounts].sort(sortFunctions[sortBy] || sortFunctions.name);
};

/**
 * Filters accounts by various criteria
 * @param {Array} accounts - Array of accounts
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered accounts
 */
export const filterAccounts = (accounts, filters = {}) => {
  if (!Array.isArray(accounts)) return [];

  let filteredAccounts = [...accounts];

  // Filter by active status
  if (filters.activeOnly) {
    filteredAccounts = filteredAccounts.filter((account) => account.isActive);
  }

  // Filter by account type
  if (filters.type) {
    filteredAccounts = filteredAccounts.filter((account) => account.type === filters.type);
  }

  // Filter by minimum balance
  if (filters.minBalance !== undefined) {
    filteredAccounts = filteredAccounts.filter(
      (account) => account.currentBalance >= filters.minBalance
    );
  }

  // Filter by expiring soon
  if (filters.expiringSoon) {
    const daysThreshold = filters.expirationDays || 30;
    filteredAccounts = filteredAccounts.filter((account) => {
      if (!account.expirationDate) return false;
      const days = calculateDaysUntilExpiration(account.expirationDate);
      return days !== null && days <= daysThreshold && days >= 0;
    });
  }

  // Search by name
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredAccounts = filteredAccounts.filter(
      (account) =>
        account.name.toLowerCase().includes(searchTerm) ||
        account.description?.toLowerCase().includes(searchTerm)
    );
  }

  return filteredAccounts;
};

// Helper function for expiration calculation (imported from validation)
const calculateDaysUntilExpiration = (expirationDate) => {
  if (!expirationDate) return null;

  const today = new Date();
  const expiry = new Date(expirationDate);

  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};
