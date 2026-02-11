/**
 * Reusable Settings Utilities
 * Common calculations, validations, and helper functions for settings
 */

interface CloudSyncSettings {
  enabled: boolean;
  apiEndpoint?: string;
}

interface SecuritySettings {
  autoLockTimeout?: number;
  maxLoginAttempts?: number;
}

interface SettingsChange {
  path: string;
  oldValue: unknown;
  newValue: unknown;
  type: "modified";
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface StorageUsage {
  bytes: number;
  readable: string;
}

/**
 * Environment Configuration Helpers
 */
export const getLocalOnlyMode = (): boolean => {
  return import.meta.env.VITE_LOCAL_ONLY_MODE === "true";
};

export const isDevelopmentMode = (): boolean => {
  return import.meta.env.NODE_ENV === "development";
};

export const isProductionMode = (): boolean => {
  return import.meta.env.NODE_ENV === "production";
};

/**
 * Settings Validation Utilities
 */
export const validateCloudSyncSettings = (settings: unknown): ValidationResult => {
  const errors: string[] = [];

  if (!settings || typeof settings !== "object") {
    errors.push("Settings object is required");
    return { isValid: false, errors };
  }

  const settingsObj = settings as CloudSyncSettings;

  if (typeof settingsObj.enabled !== "boolean") {
    errors.push("Cloud sync enabled must be a boolean");
  }

  if (settingsObj.enabled && !settingsObj.apiEndpoint) {
    errors.push("API endpoint is required when cloud sync is enabled");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateSecuritySettings = (settings: unknown): ValidationResult => {
  const errors: string[] = [];

  if (!settings || typeof settings !== "object") {
    errors.push("Security settings object is required");
    return { isValid: false, errors };
  }

  const settingsObj = settings as SecuritySettings;

  if (
    settingsObj.autoLockTimeout &&
    (settingsObj.autoLockTimeout < 60 || settingsObj.autoLockTimeout > 3600)
  ) {
    errors.push("Auto-lock timeout must be between 60 and 3600 seconds");
  }

  if (
    settingsObj.maxLoginAttempts &&
    (settingsObj.maxLoginAttempts < 3 || settingsObj.maxLoginAttempts > 10)
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
export const calculateStorageUsage = (data: unknown): StorageUsage => {
  if (!data) return { bytes: 0, readable: "0 B" };

  const jsonString = JSON.stringify(data);
  const bytes = new Blob([jsonString]).size;

  return {
    bytes,
    readable: formatBytes(bytes),
  };
};

export const formatBytes = (bytes: number, decimals = 2): string => {
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
export const compareSettings = (
  settings1: Record<string, unknown>,
  settings2: Record<string, unknown>
): SettingsChange[] => {
  const changes: SettingsChange[] = [];

  const compare = (
    obj1: Record<string, unknown>,
    obj2: Record<string, unknown>,
    path = ""
  ): void => {
    for (const key in obj1) {
      const currentPath = path ? `${path}.${key}` : key;

      if (typeof obj1[key] === "object" && obj1[key] !== null) {
        if (typeof obj2[key] === "object" && obj2[key] !== null) {
          const val1 = obj1[key] as Record<string, unknown>;
          const val2 = obj2[key] as Record<string, unknown>;
          compare(val1, val2, currentPath);
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
export const sanitizeSettingsForExport = (
  settings: Record<string, unknown>
): Record<string, unknown> => {
  // Remove sensitive data before export
  const sanitized = { ...settings };

  // Remove any keys that might contain sensitive data
  const sensitiveKeys = ["encryptionKey", "password", "apiKey", "token"];

  const removeSensitiveData = (obj: Record<string, unknown>): void => {
    for (const key in obj) {
      if (sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive.toLowerCase()))) {
        delete obj[key];
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        const nestedObj = obj[key] as Record<string, unknown>;
        removeSensitiveData(nestedObj);
      }
    }
  };

  removeSensitiveData(sanitized);
  return sanitized;
};

export const validateImportedSettings = (importedData: unknown): ValidationResult => {
  const errors: string[] = [];

  if (!importedData || typeof importedData !== "object" || importedData === null) {
    errors.push("Invalid settings format - must be a JSON object");
    return { isValid: false, errors };
  }

  const dataObj = importedData as Record<string, unknown>;

  // Check for required structure
  const requiredSections = ["general", "security", "sync"];
  for (const section of requiredSections) {
    if (!dataObj[section]) {
      errors.push(`Missing required section: ${section}`);
    }
  }

  // Validate each section if present
  if (dataObj.security) {
    const securityValidation = validateSecuritySettings(dataObj.security);
    if (!securityValidation.isValid) {
      errors.push(...securityValidation.errors);
    }
  }

  if (dataObj.sync) {
    const syncValidation = validateCloudSyncSettings(dataObj.sync);
    if (!syncValidation.isValid) {
      errors.push(...syncValidation.errors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
