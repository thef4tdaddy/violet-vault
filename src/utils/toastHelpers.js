// src/utils/toastHelpers.js
/**
 * Standardized toast notification helpers
 * Provides consistent toast notifications across the application
 */

import useToast from "../hooks/useToast";

/**
 * Toast helper functions factory
 * Returns standardized toast functions for a component
 */
export const createToastHelpers = (addToast) => ({
  /**
   * Show success toast notification
   * @param {string} message - Main message text
   * @param {string} title - Optional title (defaults to "Success")
   * @param {number} duration - Optional duration in ms (defaults to 5000)
   */
  showSuccessToast: (message, title = "Success", duration = 5000) => {
    addToast({
      type: "success",
      title,
      message,
      duration,
    });
  },

  /**
   * Show error toast notification
   * @param {string} message - Main message text
   * @param {string} title - Optional title (defaults to "Error")
   * @param {number} duration - Optional duration in ms (defaults to 8000)
   */
  showErrorToast: (message, title = "Error", duration = 8000) => {
    addToast({
      type: "error",
      title,
      message,
      duration,
    });
  },

  /**
   * Show warning toast notification
   * @param {string} message - Main message text
   * @param {string} title - Optional title (defaults to "Warning")
   * @param {number} duration - Optional duration in ms (defaults to 6000)
   */
  showWarningToast: (message, title = "Warning", duration = 6000) => {
    addToast({
      type: "warning",
      title,
      message,
      duration,
    });
  },

  /**
   * Show info toast notification
   * @param {string} message - Main message text
   * @param {string} title - Optional title (defaults to "Info")
   * @param {number} duration - Optional duration in ms (defaults to 5000)
   */
  showInfoToast: (message, title = "Info", duration = 5000) => {
    addToast({
      type: "info",
      title,
      message,
      duration,
    });
  },

  /**
   * Show payday-themed toast notification
   * @param {string} message - Main message text
   * @param {string} title - Optional title (defaults to "Payday")
   * @param {number} duration - Optional duration in ms (defaults to 6000)
   */
  showPaydayToast: (message, title = "Payday", duration = 6000) => {
    addToast({
      type: "payday",
      title,
      message,
      duration,
    });
  },
});

/**
 * Hook wrapper for toast helpers
 * Use this in components to get standardized toast functions
 *
 * @returns {Object} Toast helper functions
 * @example
 * const { showSuccessToast, showErrorToast } = useToastHelpers();
 * showSuccessToast("Data saved successfully");
 * showErrorToast("Failed to save data", "Save Error");
 */
export const useToastHelpers = () => {
  const { addToast } = useToast();
  return createToastHelpers(addToast);
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
 * These functions use the standard messages above for consistency
 */
export const quickToast = {
  // Auth toasts
  loginSuccess: (addToast) =>
    createToastHelpers(addToast).showSuccessToast(
      TOAST_MESSAGES.AUTH.LOGIN_SUCCESS,
    ),
  passwordUpdated: (addToast) =>
    createToastHelpers(addToast).showSuccessToast(
      TOAST_MESSAGES.AUTH.PASSWORD_UPDATED,
    ),
  passwordMismatch: (addToast) =>
    createToastHelpers(addToast).showErrorToast(
      TOAST_MESSAGES.AUTH.PASSWORD_MISMATCH,
    ),

  // Data toasts
  exportSuccess: (addToast) =>
    createToastHelpers(addToast).showSuccessToast(
      TOAST_MESSAGES.DATA.EXPORT_SUCCESS,
    ),
  importSuccess: (addToast) =>
    createToastHelpers(addToast).showSuccessToast(
      TOAST_MESSAGES.DATA.IMPORT_SUCCESS,
    ),
  saveSuccess: (addToast) =>
    createToastHelpers(addToast).showSuccessToast(
      TOAST_MESSAGES.DATA.SAVE_SUCCESS,
    ),

  // Sync toasts
  syncSuccess: (addToast) =>
    createToastHelpers(addToast).showSuccessToast(TOAST_MESSAGES.SYNC.SUCCESS),
  syncFailed: (addToast, error) =>
    createToastHelpers(addToast).showErrorToast(
      `${TOAST_MESSAGES.SYNC.FAILED}: ${error}`,
    ),
};

export default {
  createToastHelpers,
  useToastHelpers,
  TOAST_MESSAGES,
  quickToast,
};
