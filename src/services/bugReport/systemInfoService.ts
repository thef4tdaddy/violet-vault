/**
 * System Information Service - Refactored
 * Main orchestrator for system information collection
 * Split into focused services for Issue #513
 */
import logger from "../../utils/common/logger";
import { BrowserInfoService } from "./browserInfoService";
import { PerformanceInfoService } from "./performanceInfoService";
import { ErrorTrackingService } from "./errorTrackingService";

/**
 * Browser information
 */
interface BrowserInfo {
  name: string;
  version: string;
  [key: string]: unknown;
}

/**
 * URL information
 */
interface UrlInfo {
  href: string;
  [key: string]: unknown;
}

/**
 * Performance information
 */
interface PerformanceInfo {
  available: boolean;
  [key: string]: unknown;
}

/**
 * Storage information
 */
interface StorageInfo {
  localStorage: {
    available: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Network information
 */
interface NetworkInfo {
  onLine: boolean;
  [key: string]: unknown;
}

/**
 * Error information
 */
interface ErrorInfo {
  recentErrors: unknown[];
  consoleLogs: unknown[];
  [key: string]: unknown;
}

/**
 * System information structure
 */
export interface SystemInfo {
  timestamp: string;
  browser: BrowserInfo;
  viewport: {
    width: number;
    height: number;
  };
  url: UrlInfo;
  performance: PerformanceInfo;
  storage: StorageInfo;
  network: NetworkInfo;
  errors: ErrorInfo;
  userAgent: string;
  fallback?: boolean;
}

export class SystemInfoService {
  /**
   * Collect comprehensive system information for bug reports
   */
  static async collectSystemInfo(): Promise<SystemInfo> {
    try {
      const systemInfo: SystemInfo = {
        timestamp: new Date().toISOString(),
        browser: BrowserInfoService.getBrowserInfo(),
        viewport: BrowserInfoService.getViewportInfo(),
        url: BrowserInfoService.getUrlInfo(),
        performance: PerformanceInfoService.getPerformanceInfo(),
        storage: await PerformanceInfoService.getStorageInfo(),
        network: await PerformanceInfoService.getNetworkInfo(),
        errors: ErrorTrackingService.getRecentErrors(),
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
   * Get fallback system information when collection fails
   */
  static getFallbackSystemInfo(): SystemInfo {
    return {
      timestamp: new Date().toISOString(),
      browser: { name: "Unknown", version: "Unknown" },
      viewport: { width: 0, height: 0 },
      url: { href: window.location.href || "Unknown" },
      performance: { available: false },
      storage: { localStorage: { available: false } },
      network: { onLine: navigator.onLine || true },
      errors: { recentErrors: [], consoleLogs: [] },
      userAgent: navigator.userAgent || "Unknown",
      fallback: true,
    };
  }

  /**
   * Initialize error capture system
   * Delegates to ErrorTrackingService
   */
  static initializeErrorCapture(): void {
    ErrorTrackingService.initializeErrorCapture();
  }

  /**
   * Get recent errors - convenience method
   */
  static getRecentErrors(): ReturnType<typeof ErrorTrackingService.getRecentErrors> {
    return ErrorTrackingService.getRecentErrors();
  }

  /**
   * Clear captured error data - convenience method
   */
  static clearCapturedData(): void {
    ErrorTrackingService.clearCapturedData();
  }

  /**
   * Get error statistics - convenience method
   */
  static getErrorStats(): ReturnType<typeof ErrorTrackingService.getErrorStats> {
    return ErrorTrackingService.getErrorStats();
  }

  /**
   * Cleanup system info services
   */
  static cleanup(): void {
    ErrorTrackingService.cleanup();
  }
}

// Maintain backward compatibility by re-exporting sub-services
export { BrowserInfoService, PerformanceInfoService, ErrorTrackingService };
