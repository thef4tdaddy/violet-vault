/**
 * Account utilities index
 * Centralized exports for account-related utilities
 */

// Validation utilities
export {
  validateAccountForm,
  validateTransferForm,
  calculateAccountTotals,
  calculateDaysUntilExpiration,
  getExpirationStatus,
  validateBalanceUpdate,
  checkTransferEligibility,
} from "./accountValidation";

// Helper utilities
export {
  ACCOUNT_TYPES,
  ACCOUNT_COLORS,
  getAccountTypeInfo,
  formatAccountData,
  generateAccountId,
  createDefaultAccountForm,
  createDefaultTransferForm,
  formatCurrency,
  formatDate,
  createAccountTransaction,
  isValidAccountColor,
  getAccountIconName,
  calculateAccountUtilization,
  sortAccounts,
  filterAccounts,
} from "./accountHelpers";

// Re-export types for external use
export type {
  AccountType,
  User,
  AccountForm,
  FormattedAccount,
  Transaction,
  TransferForm,
  FilterCriteria,
} from "./accountHelpers";
