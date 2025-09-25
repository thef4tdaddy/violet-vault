/**
 * Local-Only Setup Utilities
 * Constants and utility functions for local-only mode setup
 */

// Available color options for user profile
export const PROFILE_COLORS = [
  { name: "Purple", value: "#a855f7" },
  { name: "Emerald", value: "#10b981" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Pink", value: "#ec4899" },
  { name: "Teal", value: "#14b8a6" },
];

// Default user settings
export const DEFAULT_USER_NAME = "Local User";
export const DEFAULT_USER_COLOR = "#a855f7";

// Setup steps
export const SETUP_STEPS = {
  WELCOME: "welcome",
  CUSTOMIZE: "customize", 
  IMPORT: "import",
};

/**
 * Validates if a file is a valid JSON import file
 * @param {File} file - The file to validate
 * @returns {boolean} - Whether the file appears to be valid
 */
export const isValidImportFile = (file) => {
  if (!file) return false;
  return file.type === "application/json" || file.name.endsWith(".json");
};

/**
 * Formats file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Validates user input for name field
 * @param {string} name - User name to validate
 * @returns {object} - Validation result with isValid and error
 */
export const validateUserName = (name) => {
  if (!name || !name.trim()) {
    return { isValid: false, error: "Name is required" };
  }
  if (name.trim().length > 50) {
    return { isValid: false, error: "Name must be 50 characters or less" };
  }
  return { isValid: true, error: null };
};