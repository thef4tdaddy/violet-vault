/**
 * System Information Collection Service
 * Collects browser, DOM, and application state information
 * Extracted from useBugReport.js for Issue #513
 */
import logger from "../../utils/common/logger";

export class SystemInfoService {
  /**
   * Collect comprehensive system information for bug reports
   * @returns {Promise<Object>} System information object
   */
  static async collectSystemInfo() {
    try {
      const systemInfo = {
        timestamp: new Date().toISOString(),
        browser: this.getBrowserInfo(),
        viewport: this.getViewportInfo(),
        performance: this.getPerformanceInfo(),
        storage: this.getStorageInfo(),
        network: await this.getNetworkInfo(),
        errors: this.getRecentErrors(),
        url: this.getUrlInfo(),
        userAgent: navigator.userAgent,
      };

      logger.debug("System information collected successfully", systemInfo);
      return systemInfo;
    } catch (error) {
      logger.error("Failed to collect system information", error);
      return this.getFallbackSystemInfo();
    }
  }

  /**
   * Get browser information
   * @returns {Object}
   */
  static getBrowserInfo() {
    try {
      // Parse browser name and version from user agent
      const userAgent = navigator.userAgent;
      let browserName = "Unknown";
      let browserVersion = "";
      let engine = "Unknown";
      
      if (userAgent.includes("Chrome/") && !userAgent.includes("Edg/")) {
        browserName = "Chrome";
        const match = userAgent.match(/Chrome\/([0-9.]+)/);
        browserVersion = match ? match[1] : "";
        engine = "Blink";
      } else if (userAgent.includes("Firefox/")) {
        browserName = "Firefox";
        const match = userAgent.match(/Firefox\/([0-9.]+)/);
        browserVersion = match ? match[1] : "";
        engine = "Gecko";
      } else if (userAgent.includes("Safari/") && !userAgent.includes("Chrome/")) {
        browserName = "Safari";
        const match = userAgent.match(/Version\/([0-9.]+)/);
        browserVersion = match ? match[1] : "";
        engine = "WebKit";
      } else if (userAgent.includes("Edg/")) {
        browserName = "Edge";
        const match = userAgent.match(/Edg\/([0-9.]+)/);
        browserVersion = match ? match[1] : "";
        engine = "Blink";
      }
      
      return {
        name: browserName,
        version: browserVersion,
        engine: engine,
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: navigator.languages || [],
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        hardwareConcurrency: navigator.hardwareConcurrency || "unknown",
        deviceMemory: navigator.deviceMemory || "unknown",
        connection: navigator.connection
          ? {
              effectiveType: navigator.connection.effectiveType,
              downlink: navigator.connection.downlink,
              rtt: navigator.connection.rtt,
            }
          : null,
        permissions: this.getPermissionStates(),
      };
    } catch (error) {
      logger.warn("Error collecting browser info", error);
      return {
        userAgent: navigator.userAgent || "unknown",
        language: navigator.language || "unknown",
        platform: navigator.platform || "unknown",
      };
    }
  }

  /**
   * Get viewport and screen information
   * @returns {Object}
   */
  static getViewportInfo() {
    try {
      return {
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        screen: {
          width: screen.width,
          height: screen.height,
          availWidth: screen.availWidth,
          availHeight: screen.availHeight,
          colorDepth: screen.colorDepth,
          pixelDepth: screen.pixelDepth,
        },
        devicePixelRatio: window.devicePixelRatio || 1,
        orientation: screen.orientation
          ? {
              angle: screen.orientation.angle,
              type: screen.orientation.type,
            }
          : null,
      };
    } catch (error) {
      logger.warn("Error collecting viewport info", error);
      return {
        viewport: {
          width: window.innerWidth || 0,
          height: window.innerHeight || 0,
        },
        screen: {
          width: screen.width || 0,
          height: screen.height || 0,
        },
      };
    }
  }

  /**
   * Get performance information
   * @returns {Object}
   */
  static getPerformanceInfo() {
    try {
      const timing = performance.timing;
      const navigation = performance.navigation;

      return {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstPaint:
          performance.getEntriesByType("paint").find((entry) => entry.name === "first-paint")
            ?.startTime || null,
        firstContentfulPaint:
          performance
            .getEntriesByType("paint")
            .find((entry) => entry.name === "first-contentful-paint")?.startTime || null,
        navigationType: navigation.type,
        redirectCount: navigation.redirectCount,
        memory: performance.memory
          ? {
              usedJSHeapSize: performance.memory.usedJSHeapSize,
              totalJSHeapSize: performance.memory.totalJSHeapSize,
              jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
            }
          : null,
      };
    } catch (error) {
      logger.warn("Error collecting performance info", error);
      return {
        loadTime: null,
        domContentLoaded: null,
        error: "Performance API not available",
      };
    }
  }

  /**
   * Get storage information
   * @returns {Object}
   */
  static getStorageInfo() {
    try {
      return {
        localStorage: {
          available: this.isStorageAvailable("localStorage"),
          itemCount: localStorage.length,
          estimatedSize: this.estimateStorageSize("localStorage"),
        },
        sessionStorage: {
          available: this.isStorageAvailable("sessionStorage"),
          itemCount: sessionStorage.length,
          estimatedSize: this.estimateStorageSize("sessionStorage"),
        },
        indexedDB: {
          available: "indexedDB" in window,
        },
        webSQL: {
          available: "webkitRequestFileSystem" in window,
        },
      };
    } catch (error) {
      logger.warn("Error collecting storage info", error);
      return {
        localStorage: { available: false, error: error.message },
        sessionStorage: { available: false, error: error.message },
      };
    }
  }

  /**
   * Get network information
   * @returns {Promise<Object>}
   */
  static async getNetworkInfo() {
    try {
      const networkInfo = {
        onLine: navigator.onLine,
        connection: navigator.connection
          ? {
              effectiveType: navigator.connection.effectiveType,
              downlink: navigator.connection.downlink,
              rtt: navigator.connection.rtt,
              saveData: navigator.connection.saveData,
            }
          : null,
        timing: null,
      };

      // Try to measure network timing if possible
      if ("performance" in window && performance.getEntriesByType) {
        const navigationEntries = performance.getEntriesByType("navigation");
        if (navigationEntries.length > 0) {
          const entry = navigationEntries[0];
          networkInfo.timing = {
            dns: entry.domainLookupEnd - entry.domainLookupStart,
            tcp: entry.connectEnd - entry.connectStart,
            request: entry.responseStart - entry.requestStart,
            response: entry.responseEnd - entry.responseStart,
          };
        }
      }

      return networkInfo;
    } catch (error) {
      logger.warn("Error collecting network info", error);
      return {
        onLine: navigator.onLine || false,
        error: error.message,
      };
    }
  }

  /**
   * Get recent JavaScript errors and console logs
   * @returns {Object}
   */
  static getRecentErrors() {
    try {
      const errorData = {
        hasGlobalHandler: typeof window.onerror === "function",
        hasUnhandledRejectionHandler: typeof window.onunhandledrejection === "function",
        recentErrors: this.getStoredErrors(),
        consoleLogs: this.getStoredConsoleLogs(),
      };

      return errorData;
    } catch (error) {
      logger.warn("Error collecting recent errors", error);
      return {
        hasGlobalHandler: false,
        hasUnhandledRejectionHandler: false,
        recentErrors: [],
        consoleLogs: [],
        error: error.message,
      };
    }
  }

  /**
   * Get stored errors from session storage
   * @returns {Array}
   */
  static getStoredErrors() {
    try {
      const stored = sessionStorage.getItem("violet-vault-errors");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get stored console logs from session storage
   * @returns {Array}
   */
  static getStoredConsoleLogs() {
    try {
      const stored = sessionStorage.getItem("violet-vault-console-logs");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Initialize console log and error capture
   * Should be called early in app initialization
   */
  static initializeErrorCapture() {
    try {
      // Store original console methods
      if (!window.originalConsoleLog) {
        window.originalConsoleLog = console.log;
        window.originalConsoleError = console.error;
        window.originalConsoleWarn = console.warn;
      }

      // Array to store recent logs (max 50)
      const maxLogs = 50;

      // Intercept console.log
      console.log = (...args) => {
        window.originalConsoleLog(...args);
        this.storeConsoleLog("log", args);
      };

      // Intercept console.error
      console.error = (...args) => {
        window.originalConsoleError(...args);
        this.storeConsoleLog("error", args);
        this.storeError("console.error", args);
      };

      // Intercept console.warn
      console.warn = (...args) => {
        window.originalConsoleWarn(...args);
        this.storeConsoleLog("warn", args);
      };

      // Global error handler
      window.onerror = (message, source, lineno, colno, error) => {
        this.storeError("javascript", {
          message,
          source,
          lineno,
          colno,
          stack: error?.stack,
        });
        return false; // Don't prevent default error handling
      };

      // Unhandled promise rejection handler
      window.onunhandledrejection = (event) => {
        this.storeError("unhandledrejection", {
          reason: event.reason,
          stack: event.reason?.stack,
        });
      };

      logger.info("Console and error capture initialized");
    } catch (error) {
      logger.error("Failed to initialize error capture", error);
    }
  }

  /**
   * Store console log entry
   * @param {string} level - Log level (log, error, warn)
   * @param {Array} args - Console arguments
   */
  static storeConsoleLog(level, args) {
    try {
      const logs = this.getStoredConsoleLogs();
      const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        message: args
          .map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
          .join(" "),
        args: args.length,
      };

      logs.push(logEntry);

      // Keep only recent logs
      if (logs.length > 50) {
        logs.splice(0, logs.length - 50);
      }

      sessionStorage.setItem("violet-vault-console-logs", JSON.stringify(logs));
    } catch (error) {
      // Silently fail to avoid infinite loops
    }
  }

  /**
   * Store error entry
   * @param {string} type - Error type
   * @param {Object} errorData - Error details
   */
  static storeError(type, errorData) {
    try {
      const errors = this.getStoredErrors();
      const errorEntry = {
        timestamp: new Date().toISOString(),
        type,
        data: errorData,
      };

      errors.push(errorEntry);

      // Keep only recent errors
      if (errors.length > 20) {
        errors.splice(0, errors.length - 20);
      }

      sessionStorage.setItem("violet-vault-errors", JSON.stringify(errors));
    } catch (error) {
      // Silently fail to avoid infinite loops
    }
  }

  /**
   * Get URL and route information
   * @returns {Object}
   */
  static getUrlInfo() {
    try {
      return {
        href: window.location.href,
        protocol: window.location.protocol,
        host: window.location.host,
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
        origin: window.location.origin,
        referrer: document.referrer || null,
        title: document.title || null,
      };
    } catch (error) {
      logger.warn("Error collecting URL info", error);
      return {
        href: "unknown",
        error: error.message,
      };
    }
  }

  /**
   * Get permission states for relevant APIs
   * @returns {Object}
   */
  static getPermissionStates() {
    const permissions = {};

    if ("permissions" in navigator && navigator.permissions.query) {
      const permissionNames = [
        "camera",
        "microphone",
        "geolocation",
        "notifications",
        "clipboard-read",
        "clipboard-write",
      ];

      // Note: This would be async in real implementation
      // For now, just indicate support
      permissions.supported = true;
      permissions.available = permissionNames;
    } else {
      permissions.supported = false;
    }

    return permissions;
  }

  /**
   * Check if storage type is available
   * @param {string} type - 'localStorage' or 'sessionStorage'
   * @returns {boolean}
   */
  static isStorageAvailable(type) {
    try {
      const storage = window[type];
      const testKey = "__storage_test__";
      storage.setItem(testKey, "test");
      storage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Estimate storage size
   * @param {string} type - 'localStorage' or 'sessionStorage'
   * @returns {number}
   */
  static estimateStorageSize(type) {
    try {
      const storage = window[type];
      let total = 0;

      for (let key in storage) {
        if (Object.prototype.hasOwnProperty.call(storage, key)) {
          total += key.length + (storage[key]?.length || 0);
        }
      }

      return total;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Clear stored logs and errors (for privacy)
   */
  static clearStoredLogs() {
    try {
      sessionStorage.removeItem("violet-vault-errors");
      sessionStorage.removeItem("violet-vault-console-logs");
      logger.info("Stored logs and errors cleared");
    } catch (error) {
      logger.warn("Failed to clear stored logs", error);
    }
  }

  /**
   * Get fallback system info when collection fails
   * @returns {Object}
   */
  static getFallbackSystemInfo() {
    return {
      timestamp: new Date().toISOString(),
      browser: {
        userAgent: navigator.userAgent || "unknown",
        language: navigator.language || "unknown",
      },
      viewport: {
        width: window.innerWidth || 0,
        height: window.innerHeight || 0,
      },
      url: {
        href: window.location.href || "unknown",
        pathname: window.location.pathname || "unknown",
      },
      error: "System info collection failed - using fallback data",
    };
  }

  /**
   * Get DOM-specific information
   * @returns {Object}
   */
  static getDOMInfo() {
    try {
      return {
        documentReadyState: document.readyState,
        activeElement: document.activeElement?.tagName || null,
        visibilityState: document.visibilityState,
        elementCount: document.querySelectorAll("*").length,
        scriptCount: document.scripts.length,
        styleSheetCount: document.styleSheets.length,
        imageCount: document.images.length,
        linkCount: document.links.length,
        formCount: document.forms.length,
      };
    } catch (error) {
      logger.warn("Error collecting DOM info", error);
      return {
        error: error.message,
      };
    }
  }

  /**
   * Get application-specific state information
   * @param {Object} customData - Application-specific data to include
   * @returns {Object}
   */
  static getApplicationInfo(customData = {}) {
    try {
      return {
        timestamp: new Date().toISOString(),
        customData,
        localStorage: this.getSafeLocalStorageSnapshot(),
        sessionData: this.getSafeSessionStorageSnapshot(),
        reactDevTools: typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined",
      };
    } catch (error) {
      logger.warn("Error collecting application info", error);
      return {
        error: error.message,
        customData,
      };
    }
  }

  /**
   * Get safe localStorage snapshot (without sensitive data)
   * @returns {Object}
   */
  static getSafeLocalStorageSnapshot() {
    try {
      const snapshot = {};
      const sensitiveKeys = ["token", "password", "secret", "key", "auth"];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))) {
          try {
            const value = localStorage.getItem(key);
            snapshot[key] =
              value?.length > 100
                ? `${value.substring(0, 100)}... (truncated, length: ${value.length})`
                : value;
          } catch (error) {
            snapshot[key] = "[Error reading value]";
          }
        }
      }

      return snapshot;
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Get safe sessionStorage snapshot (without sensitive data)
   * @returns {Object}
   */
  static getSafeSessionStorageSnapshot() {
    try {
      const snapshot = {};
      const sensitiveKeys = ["token", "password", "secret", "key", "auth"];

      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && !sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))) {
          try {
            const value = sessionStorage.getItem(key);
            snapshot[key] =
              value?.length > 100
                ? `${value.substring(0, 100)}... (truncated, length: ${value.length})`
                : value;
          } catch (error) {
            snapshot[key] = "[Error reading value]";
          }
        }
      }

      return snapshot;
    } catch (error) {
      return { error: error.message };
    }
  }
}
