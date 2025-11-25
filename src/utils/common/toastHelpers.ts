// src/utils/toastHelpers.js
/**
 * Standardized toast notification helpers
 * Provides consistent toast notifications across the application
 */

import { useToastStore } from "../../stores/ui/toastStore";

/**
 * Hook wrapper for toast helpers using Zustand store
 * Use this in components to get standardized toast functions
 *
 * @returns {Object} Toast helper functions
 * @example
 * const { showSuccessToast, showErrorToast } = useToastHelpers();
 * showSuccessToast("Data saved successfully");
 * showErrorToast("Failed to save data", "Save Error");
 */
export const useToastHelpers = () => {
  const showSuccess = useToastStore((state) => state.showSuccess);
  const showError = useToastStore((state) => state.showError);
  const showWarning = useToastStore((state) => state.showWarning);
  const showInfo = useToastStore((state) => state.showInfo);
  const showPayday = useToastStore((state) => state.showPayday);

  return {
    showSuccessToast: showSuccess,
    showErrorToast: showError,
    showWarningToast: showWarning,
    showInfoToast: showInfo,
    showPaydayToast: showPayday,
  };
};

/**
 * Standard toast messages for common operations
 */
export const TOAST_MESSAGES = {
  // Authentication
  AUTH: {
    LOGIN_SUCCESS: "Successfully logged in",
    LOGOUT_SUCCESS: "Successfully logged out",
    PASSWORD_UPDATED: "Password updated successfully",
    PASSWORD_MISMATCH: "Passwords do not match",
    SETUP_FAILED: "Account setup failed",
    PASSWORD_CHANGE_FAILED: "Password change failed",
  },

  // Data Operations
  DATA: {
    EXPORT_SUCCESS: "Data exported successfully",
    EXPORT_FAILED: "Failed to export data",
    IMPORT_SUCCESS: "Data imported successfully",
    IMPORT_FAILED: "Failed to import data",
    SAVE_SUCCESS: "Changes saved successfully",
    SAVE_FAILED: "Failed to save changes",
    DELETE_SUCCESS: "Item deleted successfully",
    DELETE_FAILED: "Failed to delete item",
  },

  // Sync Operations
  SYNC: {
    SUCCESS: "Data synced to cloud successfully",
    FAILED: "Sync failed",
    IN_PROGRESS: "Syncing data...",
  },

  // Budget Operations
  BUDGET: {
    ENVELOPE_CREATED: "Envelope created successfully",
    ENVELOPE_UPDATED: "Envelope updated successfully",
    ENVELOPE_DELETED: "Envelope deleted successfully",
    TRANSACTION_ADDED: "Transaction added successfully",
    TRANSACTION_UPDATED: "Transaction updated successfully",
    TRANSACTION_DELETED: "Transaction deleted successfully",
    PAYCHECK_PROCESSED: "Paycheck processed successfully",
    BILL_ADDED: "Bill added successfully",
    BILL_UPDATED: "Bill updated successfully",
    GOAL_CREATED: "Savings goal created successfully",
    GOAL_UPDATED: "Savings goal updated successfully",
  },

  // Validation
  VALIDATION: {
    REQUIRED_FIELDS: "Please fill in all required fields",
    INVALID_AMOUNT: "Please enter a valid amount",
    INVALID_EMAIL: "Please enter a valid email address",
    INVALID_DATE: "Please enter a valid date",
  },

  // General
  GENERAL: {
    OPERATION_SUCCESS: "Operation completed successfully",
    OPERATION_FAILED: "Operation failed",
    NETWORK_ERROR: "Network error - please check your connection",
    UNEXPECTED_ERROR: "An unexpected error occurred",
  },
};

/**
 * Quick toast functions using predefined messages
 * These functions use the global Zustand store for consistency
 */
export const quickToast = {
  // Auth toasts
  loginSuccess: () => useToastStore.getState().showSuccess(TOAST_MESSAGES.AUTH.LOGIN_SUCCESS),
  passwordUpdated: () => useToastStore.getState().showSuccess(TOAST_MESSAGES.AUTH.PASSWORD_UPDATED),
  passwordMismatch: () => useToastStore.getState().showError(TOAST_MESSAGES.AUTH.PASSWORD_MISMATCH),

  // Data toasts
  exportSuccess: () => useToastStore.getState().showSuccess(TOAST_MESSAGES.DATA.EXPORT_SUCCESS),
  importSuccess: () => useToastStore.getState().showSuccess(TOAST_MESSAGES.DATA.IMPORT_SUCCESS),
  saveSuccess: () => useToastStore.getState().showSuccess(TOAST_MESSAGES.DATA.SAVE_SUCCESS),

  // Sync toasts
  syncSuccess: () => useToastStore.getState().showSuccess(TOAST_MESSAGES.SYNC.SUCCESS),
  syncFailed: (error: string) =>
    useToastStore.getState().showError(`${TOAST_MESSAGES.SYNC.FAILED}: ${error}`),
};

export default {
  useToastHelpers,
  TOAST_MESSAGES,
  quickToast,
};
