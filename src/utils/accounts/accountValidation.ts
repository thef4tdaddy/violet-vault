/**
 * Account validation utilities for supplemental accounts
 * Handles form validation, balance calculations, and data integrity checks
 */

/**
 * Validates account form data
 * @param {Object} accountForm - The account form data
 * @returns {Object} Validation result with isValid flag and message
 */
export const validateAccountForm = (accountForm) => {
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
  const currentBalance = parseFloat(accountForm.currentBalance);
  if (isNaN(currentBalance)) {
    return {
      isValid: false,
      message: "Current balance must be a valid number",
    };
  }

  if (currentBalance < 0) {
    return {
      isValid: false,
      message: "Current balance cannot be negative",
    };
  }

  // Annual contribution validation (if provided)
  if (accountForm.annualContribution) {
    const annualContribution = parseFloat(accountForm.annualContribution);
    if (isNaN(annualContribution) || annualContribution < 0) {
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
  if (accountForm.description && accountForm.description.length > 500) {
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
export const validateTransferForm = (transferForm, fromAccount) => {
  // Required field validation
  if (!transferForm.envelopeId) {
    return {
      isValid: false,
      message: "Please select an envelope",
    };
  }

  if (!transferForm.amount || transferForm.amount <= 0) {
    return {
      isValid: false,
      message: "Please enter a valid amount greater than 0",
    };
  }

  // Numeric validation
  const amount = parseFloat(transferForm.amount);
  if (isNaN(amount)) {
    return {
      isValid: false,
      message: "Amount must be a valid number",
    };
  }

  // Balance validation
  if (!fromAccount) {
    return {
      isValid: false,
      message: "Source account not found",
    };
  }

  if (amount > fromAccount.currentBalance) {
    return {
      isValid: false,
      message: "Insufficient balance in account",
    };
  }

  // Reasonable amount validation (prevent accidental large transfers)
  if (amount > 50000) {
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
export const calculateAccountTotals = (accounts = []) => {
  const activeAccounts = accounts.filter((account) => account.isActive);

  const totalValue = activeAccounts.reduce(
    (sum, account) => sum + (account.currentBalance || 0),
    0
  );

  const expiringAccounts = accounts.filter((account) => {
    const days = calculateDaysUntilExpiration(account.expirationDate);
    return days !== null && days <= 30 && days >= 0;
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
export const calculateDaysUntilExpiration = (expirationDate) => {
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
export const getExpirationStatus = (daysUntil) => {
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
export const validateBalanceUpdate = (currentBalance, changeAmount) => {
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
export const checkTransferEligibility = (account) => {
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

  if (account.currentBalance <= 0) {
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
