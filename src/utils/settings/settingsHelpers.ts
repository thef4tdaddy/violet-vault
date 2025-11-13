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
  return import.meta.env.NODE_ENV === "development";
};

export const isProductionMode = () => {
  return import.meta.env.NODE_ENV === "production";
};

/**
 * Settings Validation Utilities
 */

interface CloudSyncSettings {
  enabled: boolean;
  apiEndpoint?: string;
  [key: string]: unknown;
}

interface SecuritySettings {
  autoLockTimeout?: number;
  maxLoginAttempts?: number;
  [key: string]: unknown;
}

interface SettingsObject {
  general?: Record<string, unknown>;
  security?: SecuritySettings;
  sync?: CloudSyncSettings;
  [key: string]: unknown;
}

export const validateCloudSyncSettings = (settings: CloudSyncSettings | null | undefined) => {
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

export const validateSecuritySettings = (settings: SecuritySettings | null | undefined) => {
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
export const calculateStorageUsage = (data: Record<string, unknown> | null | undefined) => {
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

interface SettingsChange {
  path: string;
  oldValue: unknown;
  newValue: unknown;
  type: string;
}

export const compareSettings = (
  settings1: SettingsObject,
  settings2: SettingsObject
): SettingsChange[] => {
  const changes: SettingsChange[] = [];

  const compare = (obj1: Record<string, unknown>, obj2: Record<string, unknown>, path = "") => {
    for (const key in obj1) {
      const currentPath = path ? `${path}.${key}` : key;

      if (typeof obj1[key] === "object" && obj1[key] !== null && !Array.isArray(obj1[key])) {
        if (typeof obj2[key] === "object" && obj2[key] !== null && !Array.isArray(obj2[key])) {
          compare(
            obj1[key] as Record<string, unknown>,
            obj2[key] as Record<string, unknown>,
            currentPath
          );
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
export const sanitizeSettingsForExport = (settings: SettingsObject): SettingsObject => {
  // Remove sensitive data before export
  const sanitized = { ...settings };

  // Remove any keys that might contain sensitive data
  const sensitiveKeys = ["encryptionKey", "password", "apiKey", "token"];

  const removeSensitiveData = (obj: Record<string, unknown>) => {
    for (const key in obj) {
      if (sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive.toLowerCase()))) {
        delete obj[key];
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        removeSensitiveData(obj[key] as Record<string, unknown>);
      }
    }
  };

  removeSensitiveData(sanitized);
  return sanitized;
};

export const validateImportedSettings = (importedData: unknown) => {
  const errors: string[] = [];

  if (!importedData || typeof importedData !== "object") {
    errors.push("Invalid settings format - must be a JSON object");
    return { isValid: false, errors };
  }

  const data = importedData as SettingsObject;

  // Check for required structure
  const requiredSections = ["general", "security", "sync"];
  for (const section of requiredSections) {
    if (!data[section]) {
      errors.push(`Missing required section: ${section}`);
    }
  }

  // Validate each section if present
  if (data.security) {
    const securityValidation = validateSecuritySettings(data.security as SecuritySettings);
    if (!securityValidation.isValid) {
      errors.push(...securityValidation.errors);
    }
  }

  if (data.sync) {
    const syncValidation = validateCloudSyncSettings(data.sync as CloudSyncSettings);
    if (!syncValidation.isValid) {
      errors.push(...syncValidation.errors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
