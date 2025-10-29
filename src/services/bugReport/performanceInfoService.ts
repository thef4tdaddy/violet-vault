/**
 * Performance Information Service
 * Handles performance metrics, storage, and network info
 * Extracted from systemInfoService.js for Issue #513
 */
import logger from "../../utils/common/logger";

/**
 * Extended Navigator interface for non-standard browser APIs
 */
interface NavigatorWithConnection extends Navigator {
  connection?: {
    effectiveType?: string;
    type?: string;
    downlink?: number;
    downlinkMax?: number;
    rtt?: number;
    saveData?: boolean;
  };
  mozConnection?: {
    effectiveType?: string;
    type?: string;
    downlink?: number;
    downlinkMax?: number;
    rtt?: number;
    saveData?: boolean;
  };
  webkitConnection?: {
    effectiveType?: string;
    type?: string;
    downlink?: number;
    downlinkMax?: number;
    rtt?: number;
    saveData?: boolean;
  };
}

/**
 * Extended StorageEstimate for usage details
 * Note: StorageEstimate is a browser API type from lib.dom.d.ts
 */
interface ExtendedStorageEstimate {
  quota?: number;
  usage?: number;
  usageDetails?: Record<string, number>;
}

/**
 * Performance timing information
 */
interface PerformanceTiming {
  navigationStart: number;
  domContentLoaded: number;
  loadComplete: number;
  domInteractive: number;
}

/**
 * Memory information
 */
interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

/**
 * Navigation information
 */
interface NavigationInfo {
  type: number;
  redirectCount: number;
}

/**
 * Performance information structure
 */
export interface PerformanceInfo {
  available: boolean;
  timing?: PerformanceTiming;
  memory?: MemoryInfo | null;
  navigation?: NavigationInfo;
  resourceCount?: number;
  error?: string;
}

/**
 * Storage info for localStorage/sessionStorage
 */
interface StorageInfo {
  available: boolean;
  itemCount?: number;
  estimatedSizeBytes?: number;
  error?: string;
}

/**
 * IndexedDB information
 */
interface IndexedDBInfo {
  available: boolean;
  note?: string;
  error?: string;
}

/**
 * Storage quota information
 */
interface StorageQuotaInfo {
  available: boolean;
  quota?: number;
  usage?: number;
  usageDetails?: Record<string, number>;
  error?: string;
}

/**
 * Complete storage information
 */
export interface StorageInformation {
  localStorage: StorageInfo;
  sessionStorage: StorageInfo;
  indexedDB: IndexedDBInfo;
  quota: StorageQuotaInfo;
}

/**
 * Connection information
 */
interface ConnectionInfo {
  effectiveType?: string;
  type?: string;
  downlink?: number;
  downlinkMax?: number;
  rtt?: number;
  saveData?: boolean;
}

/**
 * Network information structure
 */
export interface NetworkInfo {
  onLine: boolean;
  connection: ConnectionInfo | null;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
  saveData?: boolean;
}

export class PerformanceInfoService {
  /**
   * Get performance information
   */
  static getPerformanceInfo(): PerformanceInfo {
    try {
      const perf = window.performance;
      if (!perf) {
        return { available: false };
      }

      const navigation = perf.getEntriesByType("navigation")[0] as
        | PerformanceNavigationTiming
        | undefined;
      const memory = (
        perf as {
          memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number };
        }
      ).memory;

      return {
        available: true,
        timing: {
          navigationStart: navigation?.fetchStart || 0,
          domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.fetchStart || 0,
          loadComplete: navigation?.loadEventEnd - navigation?.fetchStart || 0,
          domInteractive: navigation?.domInteractive - navigation?.fetchStart || 0,
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
        error: (error as Error).message,
      };
    }
  }

  /**
   * Get storage information
   */
  static async getStorageInfo(): Promise<StorageInformation> {
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
   */
  static getLocalStorageInfo(): StorageInfo {
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
        error: (error as Error).message,
      };
    }
  }

  /**
   * Get sessionStorage information
   */
  static getSessionStorageInfo(): StorageInfo {
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
        error: (error as Error).message,
      };
    }
  }

  /**
   * Get IndexedDB information
   */
  static async getIndexedDBInfo(): Promise<IndexedDBInfo> {
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
        error: (error as Error).message,
      };
    }
  }

  /**
   * Get storage quota information
   */
  static async getStorageQuota(): Promise<StorageQuotaInfo> {
    try {
      if (!navigator.storage || !navigator.storage.estimate) {
        return { available: false };
      }

      const estimate = (await navigator.storage.estimate()) as ExtendedStorageEstimate;
      return {
        available: true,
        quota: estimate.quota,
        usage: estimate.usage,
        usageDetails: estimate.usageDetails,
      };
    } catch (error) {
      return {
        available: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Get network information
   */
  static async getNetworkInfo(): Promise<NetworkInfo> {
    try {
      const networkInfo: NetworkInfo = {
        onLine: navigator.onLine,
        connection: this.getConnectionInfo(),
        effectiveType: null,
        downlink: null,
        rtt: null,
      };

      // Network Information API (if available)
      const nav = navigator as NavigatorWithConnection;
      const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
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
   */
  static getConnectionInfo(): ConnectionInfo | null {
    try {
      const nav = navigator as NavigatorWithConnection;
      const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
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
