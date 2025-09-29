/**
 * Helper utilities for supplemental accounts
 * Handles account data formatting, type definitions, and ID generation
 */

// Type definitions for account helpers
export interface AccountType {
  value: string;
  label: string;
  icon: string;
}

export interface User {
  displayName?: string;
  email?: string;
  uid?: string;
}

export interface AccountForm {
  name: string;
  type: string;
  currentBalance: string | number;
  annualContribution?: string | number;
  expirationDate?: string;
  description?: string;
  color: string;
  isActive: boolean;
}

export interface FormattedAccount {
  id: string;
  name: string;
  type: string;
  currentBalance: number;
  annualContribution: number;
  expirationDate: string | null;
  description: string | null;
  color: string;
  isActive: boolean;
  createdBy: string;
  transactions: any[];
  createdAt: string;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  accountId: string | number;
  type: string;
  amount: number;
  description: string;
  relatedEntityId?: string | null;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface TransferForm {
  fromAccount: string;
  toEnvelope: string;
  amount: string | number;
  description: string;
}

/**
 * Account type definitions with icons and labels
 */
export const ACCOUNT_TYPES: AccountType[] = [
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
export const ACCOUNT_COLORS: string[] = [
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
 */
export const getAccountTypeInfo = (type: string): AccountType => {
  return (
    ACCOUNT_TYPES.find((t) => t.value === type) ||
    ACCOUNT_TYPES.find((t) => t.value === "Other")!
  );
};

/**
 * Formats account form data into a complete account object
 */
export const formatAccountData = (accountForm: AccountForm, currentUser: User): FormattedAccount => {
  return {
    id: generateAccountId(),
    name: accountForm.name.trim(),
    type: accountForm.type,
    currentBalance: parseFloat(String(accountForm.currentBalance)) || 0,
    annualContribution: parseFloat(String(accountForm.annualContribution || 0)) || 0,
    expirationDate: accountForm.expirationDate || null,
    description: accountForm.description?.trim() || null,
    color: accountForm.color,
    isActive: accountForm.isActive,
    createdBy: currentUser.displayName || currentUser.email || "Unknown User",
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    transactions: [],
  };
};

/**
 * Generates a unique account ID
 */
let idCounter = 0;
export const generateAccountId = (): string => {
  // Ensure unique IDs even when called in quick succession
  return String(Date.now() + ++idCounter);
};

/**
 * Creates a default account form object
 */
export const createDefaultAccountForm = (): AccountForm => {
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
 */
export const createDefaultTransferForm = (fromAccountName = ""): Partial<TransferForm> => {
  return {
    fromAccount: "",
    toEnvelope: "",
    amount: "",
    description: fromAccountName ? `Transfer from ${fromAccountName}` : "",
  };
};

/**
 * Formats currency amount for display
 */
export const formatCurrency = (amount: number, showDecimals = true): string => {
  if (typeof amount !== "number" || isNaN(amount) || !isFinite(amount)) {
    return "$0.00";
  }

  return showDecimals ? `$${amount.toFixed(2)}` : `$${Math.round(amount)}`;
};

/**
 * Formats date for display
 */
export const formatDate = (dateString: string, options: Intl.DateTimeFormatOptions = {}): string => {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return date.toLocaleDateString("en-US", { ...defaultOptions, ...options });
};

/**
 * Creates a transaction record for account operations
 */
export const createAccountTransaction = ({
  accountId,
  type, // 'transfer_out', 'transfer_in', 'adjustment', 'contribution'
  amount,
  description,
  relatedEntityId = null, // envelope ID for transfers
  metadata = {},
}: {
  accountId: string | number;
  type: string;
  amount: number;
  description: string;
  relatedEntityId?: string | null;
  metadata?: Record<string, any>;
}): Transaction => {
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
 */
export const isValidAccountColor = (color: string): boolean => {
  if (!color || typeof color !== "string") return false;

  // Check if it's a valid hex color
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
};

/**
 * Gets the appropriate icon component name for account type
 */
export const getAccountIconName = (type: string): string => {
  const _typeInfo = getAccountTypeInfo(type);

  // Map account types to Lucide icon names
  const iconMap: Record<string, string> = {
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
 */
export const calculateAccountUtilization = (
  currentBalance: number,
  annualContribution: number,
): number => {
  if (!annualContribution || annualContribution <= 0) return 0;
  if (!currentBalance || currentBalance <= 0) return 0;

  const utilization = (currentBalance / annualContribution) * 100;
  return Math.min(100, Math.max(0, utilization));
};

export interface FilterCriteria {
  activeOnly?: boolean;
  type?: string;
  minBalance?: number;
  expiringSoon?: boolean;
  expirationDays?: number;
  search?: string;
}

type SortCriteria = "name" | "balance" | "type" | "expiration" | "lastUpdated";

/**
 * Sorts accounts by priority criteria
 */
export const sortAccounts = (accounts: FormattedAccount[], sortBy: SortCriteria = "name"): FormattedAccount[] => {
  if (!Array.isArray(accounts)) return [];

  const sortFunctions: Record<SortCriteria, (a: FormattedAccount, b: FormattedAccount) => number> = {
    name: (a, b) => a.name.localeCompare(b.name),
    balance: (a, b) => b.currentBalance - a.currentBalance,
    type: (a, b) => a.type.localeCompare(b.type),
    expiration: (a, b) => {
      if (!a.expirationDate && !b.expirationDate) return 0;
      if (!a.expirationDate) return 1;
      if (!b.expirationDate) return -1;
      return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
    },
    lastUpdated: (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
  };

  return [...accounts].sort(sortFunctions[sortBy] || sortFunctions.name);
};

/**
 * Filters accounts by various criteria
 */
export const filterAccounts = (accounts: FormattedAccount[], filters: FilterCriteria = {}): FormattedAccount[] => {
  if (!Array.isArray(accounts)) return [];

  let filteredAccounts = [...accounts];

  // Filter by active status
  if (filters.activeOnly) {
    filteredAccounts = filteredAccounts.filter((account) => account.isActive);
  }

  // Filter by account type
  if (filters.type) {
    filteredAccounts = filteredAccounts.filter(
      (account) => account.type === filters.type,
    );
  }

  // Filter by minimum balance
  if (filters.minBalance !== undefined) {
    filteredAccounts = filteredAccounts.filter(
      (account) => account.currentBalance >= filters.minBalance!,
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
        account.description?.toLowerCase().includes(searchTerm),
    );
  }

  return filteredAccounts;
};

// Helper function for expiration calculation (imported from validation)
const calculateDaysUntilExpiration = (expirationDate: string): number | null => {
  if (!expirationDate) return null;

  const today = new Date();
  const expiry = new Date(expirationDate);

  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};
