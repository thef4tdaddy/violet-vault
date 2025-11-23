/**
 * Account validation utilities for supplemental accounts
 * Handles form validation, balance calculations, and data integrity checks
 */

// eslint-disable-next-line complexity
// Type definitions for account objects
interface AccountForm {
  name?: string;
  currentBalance?: string | number;
  annualContribution?: string | number;
  expirationDate?: string;
  description?: string;
}

interface TransferForm {
  envelopeId?: string;
  amount?: string | number;
}

interface Account {
  id: string;
  name: string;
  currentBalance?: number;
  annualContribution?: number;
  expirationDate?: string;
  isActive?: boolean;
}

interface ValidationResult {
  isValid: boolean;
  message: string;
}

interface BalanceUpdateResult extends ValidationResult {
  newBalance?: number;
}

interface TransferEligibilityResult {
  isEligible: boolean;
  reason: string;
}

interface AccountTotalsResult {
  totalValue: number;
  expiringAccounts: Account[];
  totalAnnualContributions: number;
  activeAccountCount: number;
  inactiveAccountCount: number;
}

interface ExpirationStatus {
  text: string;
  color: string;
}

/**
 * Validates account form data
 * @param {Object} accountForm - The account form data
 * @returns {Object} Validation result with isValid flag and message
 */
// eslint-disable-next-line complexity
export const validateAccountForm = (accountForm: AccountForm): ValidationResult => {
  // Required field validation
  if (!accountForm.name?.trim()) {
    return {
      isValid: false,
      message: "Account name is required",
    };
  }

  if (!accountForm.currentBalance && accountForm.currentBalance !== 0) {
    return {
      isValid: false,
      message: "Current balance is required",
    };
  }

  // Numeric validation
  const currentBalanceValue = parseFloat(String(accountForm.currentBalance));
  if (isNaN(currentBalanceValue)) {
    return {
      isValid: false,
      message: "Current balance must be a valid number",
    };
  }

  if (currentBalanceValue < 0) {
    return {
      isValid: false,
      message: "Current balance cannot be negative",
    };
  }

  // Annual contribution validation (if provided)
  if (accountForm.annualContribution) {
    const annualContributionValue = parseFloat(String(accountForm.annualContribution));
    if (isNaN(annualContributionValue) || annualContributionValue < 0) {
      return {
        isValid: false,
        message: "Annual contribution must be a positive number",
      };
    }
  }

  // Date validation (if provided)
  if (accountForm.expirationDate) {
    const expirationDate = new Date(accountForm.expirationDate);
    if (isNaN(expirationDate.getTime())) {
      return {
        isValid: false,
        message: "Invalid expiration date format",
      };
    }
  }

  // Name length validation
  if (accountForm.name.length > 100) {
    return {
      isValid: false,
      message: "Account name must be less than 100 characters",
    };
  }

  // Description length validation
  if (
    accountForm.description &&
    typeof accountForm.description === "string" &&
    accountForm.description.length > 500
  ) {
    return {
      isValid: false,
      message: "Description must be less than 500 characters",
    };
  }

  return {
    isValid: true,
    message: "Valid account form",
  };
};

/**
 * Validates transfer form data
 * @param {Object} transferForm - The transfer form data
 * @param {Object} fromAccount - The account being transferred from
 * @returns {Object} Validation result with isValid flag and message
 */
export const validateTransferForm = (
  transferForm: TransferForm,
  fromAccount: Account
): ValidationResult => {
  // Required field validation
  if (!transferForm.envelopeId) {
    return {
      isValid: false,
      message: "Please select an envelope",
    };
  }

  // Numeric validation
  const transferAmount = parseFloat(String(transferForm.amount || 0));
  if (isNaN(transferAmount)) {
    return {
      isValid: false,
      message: "Amount must be a valid number",
    };
  }

  // Balance validation
  if (!fromAccount || fromAccount.currentBalance === undefined) {
    return {
      isValid: false,
      message: "Source account not found",
    };
  }

  if (transferAmount > Number(fromAccount.currentBalance)) {
    return {
      isValid: false,
      message: "Insufficient balance in account",
    };
  }

  // Reasonable amount validation (prevent accidental large transfers)
  if (transferAmount > 50000) {
    return {
      isValid: false,
      message: "Transfer amount cannot exceed $50,000",
    };
  }

  return {
    isValid: true,
    message: "Valid transfer form",
  };
};

/**
 * Calculates account totals and identifies expiring accounts
 * @param {Array} accounts - Array of supplemental accounts
 * @returns {Object} Calculated totals and expiring accounts
 */
export const calculateAccountTotals = (accounts: Account[] = []): AccountTotalsResult => {
  const activeAccounts = accounts.filter((account) => account.isActive === true);

  const totalValue = activeAccounts.reduce(
    (sum, account) => sum + Number(account.currentBalance || 0),
    0
  );

  const expiringAccounts = accounts.filter((account) => {
    if (!account.expirationDate) return false;
    const daysUntilExp = calculateDaysUntilExpiration(account.expirationDate);
    return daysUntilExp !== null && daysUntilExp <= 30 && daysUntilExp >= 0;
  });

  const totalAnnualContributions = activeAccounts.reduce(
    (sum, account) => sum + (account.annualContribution || 0),
    0
  );

  return {
    totalValue,
    expiringAccounts,
    totalAnnualContributions,
    activeAccountCount: activeAccounts.length,
    inactiveAccountCount: accounts.length - activeAccounts.length,
  };
};

/**
 * Calculates days until expiration
 * @param {string} expirationDate - ISO date string
 * @returns {number|null} Days until expiration, null if no date
 */
export const calculateDaysUntilExpiration = (expirationDate: string | undefined): number | null => {
  if (!expirationDate) return null;

  const today = new Date();
  const expiry = new Date(expirationDate);

  // Reset time to start of day for accurate day calculation
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Gets expiration status with color coding
 * @param {number|null} daysUntil - Days until expiration
 * @returns {Object} Status text and color class
 */
export const getExpirationStatus = (daysUntil: number | null): ExpirationStatus => {
  if (daysUntil === null) return { text: "", color: "text-gray-500" };
  if (daysUntil < 0) return { text: "Expired", color: "text-red-600" };
  if (daysUntil === 0) return { text: "Expires Today", color: "text-red-600" };
  if (daysUntil <= 30) return { text: `${daysUntil} days left`, color: "text-orange-600" };
  if (daysUntil <= 90) return { text: `${daysUntil} days left`, color: "text-yellow-600" };
  return { text: `${daysUntil} days left`, color: "text-green-600" };
};

/**
 * Validates account balance update
 * @param {number} currentBalance - Current account balance
 * @param {number} changeAmount - Amount to add/subtract
 * @returns {Object} Validation result
 */
export const validateBalanceUpdate = (
  currentBalance: number,
  changeAmount: number
): BalanceUpdateResult => {
  const newBalance = currentBalance + changeAmount;

  if (newBalance < 0) {
    return {
      isValid: false,
      message: "Balance cannot go negative",
      newBalance: currentBalance,
    };
  }

  if (newBalance > 1000000) {
    return {
      isValid: false,
      message: "Balance cannot exceed $1,000,000",
      newBalance: currentBalance,
    };
  }

  return {
    isValid: true,
    message: "Balance update valid",
    newBalance,
  };
};

/**
 * Checks if account is eligible for transfer
 * @param {Object} account - Account object
 * @returns {Object} Eligibility result
 */
export const checkTransferEligibility = (account: Account): TransferEligibilityResult => {
  if (!account) {
    return {
      isEligible: false,
      reason: "Account not found",
    };
  }

  if (!account.isActive) {
    return {
      isEligible: false,
      reason: "Account is inactive",
    };
  }

  if (account.currentBalance === undefined || account.currentBalance <= 0) {
    return {
      isEligible: false,
      reason: "No balance available for transfer",
    };
  }

  // Check if account is expired
  const daysUntilExpiration = calculateDaysUntilExpiration(account.expirationDate);
  if (daysUntilExpiration !== null && daysUntilExpiration < 0) {
    return {
      isEligible: false,
      reason: "Account has expired",
    };
  }

  return {
    isEligible: true,
    reason: "Account eligible for transfer",
  };
};
