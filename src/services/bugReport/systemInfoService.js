/**
 * System Information Service - Refactored
 * Main orchestrator for system information collection
 * Split into focused services for Issue #513
 */
import logger from "../../utils/common/logger";
import { BrowserInfoService } from "./browserInfoService";
import { PerformanceInfoService } from "./performanceInfoService";
import { ErrorTrackingService } from "./errorTrackingService";

export class SystemInfoService {
  /**
   * Collect comprehensive system information for bug reports
   * @returns {Promise<Object>} System information object
   */
  static async collectSystemInfo() {
    try {
      const systemInfo = {
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
   * @returns {Object} Minimal system information
   */
  static getFallbackSystemInfo() {
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
  static initializeErrorCapture() {
    ErrorTrackingService.initializeErrorCapture();
  }

  /**
   * Get recent errors - convenience method
   * @returns {Object} Recent errors and logs
   */
  static getRecentErrors() {
    return ErrorTrackingService.getRecentErrors();
  }

  /**
   * Clear captured error data - convenience method
   */
  static clearCapturedData() {
    ErrorTrackingService.clearCapturedData();
  }

  /**
   * Get error statistics - convenience method
   * @returns {Object} Error statistics
   */
  static getErrorStats() {
    return ErrorTrackingService.getErrorStats();
  }

  /**
   * Cleanup system info services
   */
  static cleanup() {
    ErrorTrackingService.cleanup();
  }
}

// Maintain backward compatibility by re-exporting sub-services
export { BrowserInfoService, PerformanceInfoService, ErrorTrackingService };
