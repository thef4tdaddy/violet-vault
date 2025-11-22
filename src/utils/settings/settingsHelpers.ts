/**
 * Reusable Settings Utilities
 * Common calculations, validations, and helper functions for settings
 */

/**
 * Environment Configuration Helpers
 */
export const getLocalOnlyMode = () => {
  return import.meta.env.VITE_LOCAL_ONLY_MODE === "true";
};

export const isDevelopmentMode = () => {
  return (import.meta.env.MODE || import.meta.env.DEV) === "development";
};

export const isProductionMode = () => {
  return (import.meta.env.MODE || import.meta.env.PROD) === "production";
};

/**
 * Settings Validation Utilities
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateCloudSyncSettings = (settings: any) => {
  const errors = [];

  if (!settings) {
    errors.push("Settings object is required");
    return { isValid: false, errors };
  }

  if (typeof settings.enabled !== "boolean") {
    errors.push("Cloud sync enabled must be a boolean");
  }

  if (settings.enabled && !settings.apiEndpoint) {
    errors.push("API endpoint is required when cloud sync is enabled");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateSecuritySettings = (settings: any) => {
  const errors = [];

  if (!settings) {
    errors.push("Security settings object is required");
    return { isValid: false, errors };
  }

  if (
    settings.autoLockTimeout &&
    (settings.autoLockTimeout < 60 || settings.autoLockTimeout > 3600)
  ) {
    errors.push("Auto-lock timeout must be between 60 and 3600 seconds");
  }

  if (
    settings.maxLoginAttempts &&
    (settings.maxLoginAttempts < 3 || settings.maxLoginAttempts > 10)
  ) {
    errors.push("Max login attempts must be between 3 and 10");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Settings Calculations
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const calculateStorageUsage = (data: any) => {
  if (!data) return { bytes: 0, readable: "0 B" };

  const jsonString = JSON.stringify(data);
  const bytes = new Blob([jsonString]).size;

  return {
    bytes,
    readable: formatBytes(bytes),
  };
};

export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

/**
 * Settings State Helpers
 */
export const getDefaultSettingsState = () => ({
  general: {
    theme: "light",
    language: "en",
    autoSave: true,
    localOnlyMode: getLocalOnlyMode(),
  },
  security: {
    autoLockEnabled: false,
    autoLockTimeout: 300, // 5 minutes
    maxLoginAttempts: 5,
    sessionTimeout: 3600, // 1 hour
  },
  sync: {
    enabled: false,
    frequency: "hourly",
    conflictResolution: "prompt",
  },
  backup: {
    autoBackup: true,
    backupFrequency: "daily",
    maxBackups: 30,
  },
});

/**
 * Settings Comparison Utilities
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const compareSettings = (settings1: any, settings2: any) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const changes: any[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const compare = (obj1: any, obj2: any, path = "") => {
    for (const key in obj1) {
      const currentPath = path ? `${path}.${key}` : key;

      if (typeof obj1[key] === "object" && obj1[key] !== null) {
        if (typeof obj2[key] === "object" && obj2[key] !== null) {
          compare(obj1[key], obj2[key], currentPath);
        } else {
          changes.push({
            path: currentPath,
            oldValue: obj2[key],
            newValue: obj1[key],
            type: "modified",
          });
        }
      } else if (obj1[key] !== obj2[key]) {
        changes.push({
          path: currentPath,
          oldValue: obj2[key],
          newValue: obj1[key],
          type: "modified",
        });
      }
    }
  };

  compare(settings1, settings2);
  return changes;
};

/**
 * Settings Export/Import Helpers
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sanitizeSettingsForExport = (settings: any) => {
  // Remove sensitive data before export
  const sanitized = { ...settings };

  // Remove any keys that might contain sensitive data
  const sensitiveKeys = ["encryptionKey", "password", "apiKey", "token"];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const removeSensitiveData = (obj: any) => {
    for (const key in obj) {
      if (sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive.toLowerCase()))) {
        delete obj[key];
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        removeSensitiveData(obj[key]);
      }
    }
  };

  removeSensitiveData(sanitized);
  return sanitized;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateImportedSettings = (importedData: any) => {
  const errors = [];

  if (!importedData || typeof importedData !== "object") {
    errors.push("Invalid settings format - must be a JSON object");
    return { isValid: false, errors };
  }

  // Check for required structure
  const requiredSections = ["general", "security", "sync"];
  for (const section of requiredSections) {
    if (!importedData[section]) {
      errors.push(`Missing required section: ${section}`);
    }
  }

  // Validate each section if present
  if (importedData.security) {
    const securityValidation = validateSecuritySettings(importedData.security);
    if (!securityValidation.isValid) {
      errors.push(...securityValidation.errors);
    }
  }

  if (importedData.sync) {
    const syncValidation = validateCloudSyncSettings(importedData.sync);
    if (!syncValidation.isValid) {
      errors.push(...syncValidation.errors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
