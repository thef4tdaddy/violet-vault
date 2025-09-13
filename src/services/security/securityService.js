import logger from "../../utils/common/logger";

/**
 * Security Service
 * Handles security event logging, serialization, and storage
 */
class SecurityService {
  constructor() {
    this.storageKeys = {
      events: "violetVault_securityEvents",
      settings: "violetVault_securitySettings",
    };
  }

  /**
   * Default security settings
   */
  getDefaultSettings() {
    return {
      autoLockEnabled: true,
      autoLockTimeout: 15, // minutes
      clipboardClearTimeout: 30, // seconds
      securityLoggingEnabled: true,
      lockOnPageHide: true,
    };
  }

  /**
   * Load security settings from localStorage
   */
  loadSettings() {
    try {
      const saved = localStorage.getItem(this.storageKeys.settings);
      return saved ? JSON.parse(saved) : this.getDefaultSettings();
    } catch (error) {
      logger.warn("Failed to load security settings, using defaults:", error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Save security settings to localStorage
   */
  saveSettings(settings) {
    try {
      localStorage.setItem(this.storageKeys.settings, JSON.stringify(settings));
    } catch (error) {
      logger.error("Failed to save security settings:", error);
    }
  }

  /**
   * Load security events from localStorage
   */
  loadSecurityEvents() {
    try {
      const saved = localStorage.getItem(this.storageKeys.events);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      logger.warn("Failed to load security events:", error);
      return [];
    }
  }

  /**
   * Save security events to localStorage
   */
  saveSecurityEvents(events) {
    try {
      // Limit to last 100 events to prevent storage bloat
      const limitedEvents = events.slice(-100);
      localStorage.setItem(this.storageKeys.events, JSON.stringify(limitedEvents));
    } catch (error) {
      logger.error("Failed to save security events:", error);
    }
  }

  /**
   * Safely serialize an object, avoiding circular references
   */
  safeSerialize(obj, maxDepth = 3, currentDepth = 0) {
    if (currentDepth >= maxDepth) return "[Max Depth Reached]";

    if (obj === null || obj === undefined) return obj;

    if (typeof obj === "string" || typeof obj === "number" || typeof obj === "boolean") {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.slice(0, 10).map((item) => this.safeSerialize(item, maxDepth, currentDepth + 1));
    }

    if (typeof obj === "object") {
      const safeObj = {};
      let keyCount = 0;

      for (const [key, value] of Object.entries(obj)) {
        if (keyCount >= 20) break; // Limit number of keys

        try {
          safeObj[key] = this.safeSerialize(value, maxDepth, currentDepth + 1);
          keyCount++;
        } catch {
          safeObj[key] = "[Serialization Error]";
        }
      }

      return safeObj;
    }

    return "[Non-serializable]";
  }

  /**
   * Create a security event with safe serialization
   */
  createSecurityEvent(event) {
    try {
      // Safely extract only the primitive values from event to avoid circular references
      const safeEvent = {
        type: typeof event.type === "string" ? event.type : "UNKNOWN",
        description: typeof event.description === "string" ? event.description : "Security event",
      };

      // Create base metadata
      const safeMetadata = {
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        url: window.location.href,
      };

      // Safely add event metadata
      if (event.metadata && typeof event.metadata === "object") {
        const serializedMetadata = this.safeSerialize(event.metadata);
        Object.assign(safeMetadata, serializedMetadata);
      }

      const securityEvent = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        type: safeEvent.type,
        description: safeEvent.description,
        metadata: safeMetadata,
      };

      // Final safety check - try to serialize the entire event
      JSON.stringify(securityEvent);
      return securityEvent;
    } catch (error) {
      logger.warn("Failed to create security event, using minimal version:", error);

      // Use minimal version if serialization fails
      return {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        type: typeof event.type === "string" ? event.type : "UNKNOWN",
        description: typeof event.description === "string" ? event.description : "Security event",
        metadata: { error: "Serialization failed" },
      };
    }
  }

  /**
   * Log a security event
   */
  logSecurityEvent(event, settings) {
    if (!settings?.securityLoggingEnabled) return;

    try {
      const securityEvent = this.createSecurityEvent(event);
      const events = this.loadSecurityEvents();
      events.push(securityEvent);
      this.saveSecurityEvents(events);

      logger.debug("Security event logged:", {
        type: securityEvent.type,
        id: securityEvent.id,
      });
    } catch (error) {
      logger.error("Failed to log security event:", error);
    }
  }

  /**
   * Clear all security events
   */
  clearSecurityEvents() {
    try {
      localStorage.removeItem(this.storageKeys.events);
      logger.debug("Security events cleared");
    } catch (error) {
      logger.error("Failed to clear security events:", error);
    }
  }

  /**
   * Get recent security events
   */
  getRecentSecurityEvents(limit = 50) {
    try {
      const events = this.loadSecurityEvents();
      return events.slice(-limit).reverse(); // Most recent first
    } catch (error) {
      logger.error("Failed to get recent security events:", error);
      return [];
    }
  }

  /**
   * Filter security events by type
   */
  getSecurityEventsByType(type, limit = 50) {
    try {
      const events = this.loadSecurityEvents();
      return events
        .filter((event) => event.type === type)
        .slice(-limit)
        .reverse();
    } catch (error) {
      logger.error("Failed to get security events by type:", error);
      return [];
    }
  }

  /**
   * Get security statistics
   */
  getSecurityStats() {
    try {
      const events = this.loadSecurityEvents();
      const stats = {
        total: events.length,
        today: 0,
        thisWeek: 0,
        byType: {},
      };

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

      events.forEach((event) => {
        const eventDate = new Date(event.timestamp);

        if (eventDate >= todayStart) {
          stats.today++;
        }

        if (eventDate >= weekStart) {
          stats.thisWeek++;
        }

        stats.byType[event.type] = (stats.byType[event.type] || 0) + 1;
      });

      return stats;
    } catch (error) {
      logger.error("Failed to get security statistics:", error);
      return { total: 0, today: 0, thisWeek: 0, byType: {} };
    }
  }
}

export const securityService = new SecurityService();
