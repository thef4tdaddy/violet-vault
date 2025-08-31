/**
 * Performance Information Service
 * Handles performance metrics, storage, and network info
 * Extracted from systemInfoService.js for Issue #513
 */
import logger from "../../utils/common/logger";

export class PerformanceInfoService {
  /**
   * Get performance information
   * @returns {Object} Performance metrics
   */
  static getPerformanceInfo() {
    try {
      const perf = window.performance;
      if (!perf) {
        return { available: false };
      }

      const navigation = perf.getEntriesByType("navigation")[0];
      const memory = perf.memory;

      return {
        available: true,
        timing: {
          navigationStart: navigation?.fetchStart || 0,
          domContentLoaded:
            navigation?.domContentLoadedEventEnd - navigation?.fetchStart || 0,
          loadComplete: navigation?.loadEventEnd - navigation?.fetchStart || 0,
          domInteractive:
            navigation?.domInteractive - navigation?.fetchStart || 0,
        },
        memory: memory
          ? {
              usedJSHeapSize: memory.usedJSHeapSize,
              totalJSHeapSize: memory.totalJSHeapSize,
              jsHeapSizeLimit: memory.jsHeapSizeLimit,
            }
          : null,
        navigation: {
          type: navigation?.type || 0,
          redirectCount: navigation?.redirectCount || 0,
        },
        resourceCount: perf.getEntries?.()?.length || 0,
      };
    } catch (error) {
      logger.warn("Error collecting performance info", error);
      return {
        available: false,
        error: error.message,
      };
    }
  }

  /**
   * Get storage information
   * @returns {Promise<Object>} Storage information
   */
  static async getStorageInfo() {
    try {
      const storageInfo = {
        localStorage: this.getLocalStorageInfo(),
        sessionStorage: this.getSessionStorageInfo(),
        indexedDB: await this.getIndexedDBInfo(),
        quota: await this.getStorageQuota(),
      };

      return storageInfo;
    } catch (error) {
      logger.warn("Error collecting storage info", error);
      return {
        localStorage: { available: false },
        sessionStorage: { available: false },
        indexedDB: { available: false },
        quota: { available: false },
      };
    }
  }

  /**
   * Get localStorage information
   * @returns {Object} localStorage info
   */
  static getLocalStorageInfo() {
    try {
      if (typeof localStorage === "undefined") {
        return { available: false };
      }

      let totalSize = 0;
      let itemCount = 0;

      for (let key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          totalSize += localStorage[key].length + key.length;
          itemCount++;
        }
      }

      return {
        available: true,
        itemCount,
        estimatedSizeBytes: totalSize * 2, // Rough estimate (UTF-16)
      };
    } catch (error) {
      return {
        available: false,
        error: error.message,
      };
    }
  }

  /**
   * Get sessionStorage information
   * @returns {Object} sessionStorage info
   */
  static getSessionStorageInfo() {
    try {
      if (typeof sessionStorage === "undefined") {
        return { available: false };
      }

      let totalSize = 0;
      let itemCount = 0;

      for (let key in sessionStorage) {
        if (Object.prototype.hasOwnProperty.call(sessionStorage, key)) {
          totalSize += sessionStorage[key].length + key.length;
          itemCount++;
        }
      }

      return {
        available: true,
        itemCount,
        estimatedSizeBytes: totalSize * 2,
      };
    } catch (error) {
      return {
        available: false,
        error: error.message,
      };
    }
  }

  /**
   * Get IndexedDB information
   * @returns {Promise<Object>} IndexedDB info
   */
  static async getIndexedDBInfo() {
    try {
      if (!window.indexedDB) {
        return { available: false };
      }

      // We can't easily get size info without opening databases
      // So we just return availability info
      return {
        available: true,
        note: "Available - size info requires database access",
      };
    } catch (error) {
      return {
        available: false,
        error: error.message,
      };
    }
  }

  /**
   * Get storage quota information
   * @returns {Promise<Object>} Storage quota info
   */
  static async getStorageQuota() {
    try {
      if (!navigator.storage || !navigator.storage.estimate) {
        return { available: false };
      }

      const estimate = await navigator.storage.estimate();
      return {
        available: true,
        quota: estimate.quota,
        usage: estimate.usage,
        usageDetails: estimate.usageDetails,
      };
    } catch (error) {
      return {
        available: false,
        error: error.message,
      };
    }
  }

  /**
   * Get network information
   * @returns {Promise<Object>} Network information
   */
  static async getNetworkInfo() {
    try {
      const networkInfo = {
        onLine: navigator.onLine,
        connection: this.getConnectionInfo(),
        effectiveType: null,
        downlink: null,
        rtt: null,
      };

      // Network Information API (if available)
      const connection =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection;
      if (connection) {
        networkInfo.effectiveType = connection.effectiveType;
        networkInfo.downlink = connection.downlink;
        networkInfo.rtt = connection.rtt;
        networkInfo.saveData = connection.saveData;
      }

      return networkInfo;
    } catch (error) {
      logger.warn("Error collecting network info", error);
      return {
        onLine: navigator.onLine || true,
        connection: null,
        effectiveType: null,
        downlink: null,
        rtt: null,
      };
    }
  }

  /**
   * Get connection information
   * @returns {Object|null} Connection info
   */
  static getConnectionInfo() {
    try {
      const connection =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection;
      if (!connection) return null;

      return {
        effectiveType: connection.effectiveType,
        type: connection.type,
        downlink: connection.downlink,
        downlinkMax: connection.downlinkMax,
        rtt: connection.rtt,
        saveData: connection.saveData,
      };
    } catch (error) {
      logger.debug("Error getting connection info", error);
      return null;
    }
  }
}
