import logger from "../common/logger";

/**
 * Service Worker Diagnostics
 * Monitor cache health, sync status, and PWA performance
 */

class ServiceWorkerDiagnostics {
  constructor() {
    this.isInitialized = false;
    this.cacheNames = [
      "app-shell-cache",
      "firebase-api-cache",
      "firebase-auth-cache",
      "images-cache",
      "static-resources",
      "google-fonts",
      "cdn-cache",
      "docs-cache",
    ];
  }

  /**
   * Initialize diagnostics system
   */
  async initialize() {
    if (this.isInitialized) return;

    // Check if service worker and cache APIs are available
    if ("serviceWorker" in navigator && "caches" in window) {
      this.isInitialized = true;
      logger.info("🔧 Service Worker Diagnostics initialized");
    } else {
      logger.warn("⚠️ Service Worker or Cache API not available");
      return false;
    }

    return true;
  }

  /**
   * Get comprehensive cache health report
   */
  async getCacheHealth() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const report = {
      totalCaches: 0,
      totalEntries: 0,
      totalSize: 0,
      cacheDetails: {},
      recommendations: [],
      lastUpdated: new Date().toISOString(),
    };

    try {
      const cacheNames = await caches.keys();
      report.totalCaches = cacheNames.length;

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();

        let cacheSize = 0;
        const entries = [];

        // Sample a few entries to estimate size
        const sampleKeys = keys.slice(0, Math.min(5, keys.length));
        for (const request of sampleKeys) {
          try {
            const response = await cache.match(request);
            if (response) {
              const blob = await response.blob();
              cacheSize += blob.size;
              entries.push({
                url: request.url,
                size: blob.size,
                type: response.headers.get("content-type") || "unknown",
              });
            }
          } catch (error) {
            logger.warn(`Failed to analyze cache entry: ${request.url}`, error);
          }
        }

        // Estimate total cache size
        const estimatedSize = keys.length > 0 ? (cacheSize / sampleKeys.length) * keys.length : 0;

        report.cacheDetails[cacheName] = {
          entries: keys.length,
          estimatedSize,
          sampleEntries: entries,
          isKnownCache: this.cacheNames.includes(cacheName),
        };

        report.totalEntries += keys.length;
        report.totalSize += estimatedSize;
      }

      // Generate recommendations
      this.generateRecommendations(report);

      logger.info("📊 Cache health report generated", {
        totalCaches: report.totalCaches,
        totalEntries: report.totalEntries,
        totalSizeMB: Math.round((report.totalSize / 1024 / 1024) * 100) / 100,
      });

      return report;
    } catch (error) {
      logger.error("❌ Failed to generate cache health report", error);
      return { ...report, error: error.message };
    }
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations(report) {
    const sizeLimitMB = 50; // Conservative limit for mobile devices
    const entryLimit = 500;

    if (report.totalSize > sizeLimitMB * 1024 * 1024) {
      report.recommendations.push({
        type: "warning",
        message: `Total cache size (${Math.round(report.totalSize / 1024 / 1024)}MB) exceeds recommended limit (${sizeLimitMB}MB)`,
        action: "Consider reducing cache expiration times or clearing old caches",
      });
    }

    if (report.totalEntries > entryLimit) {
      report.recommendations.push({
        type: "warning",
        message: `Total cache entries (${report.totalEntries}) exceeds recommended limit (${entryLimit})`,
        action: "Review cache strategies and consider more aggressive cleanup",
      });
    }

    // Check for unknown caches
    const unknownCaches = Object.keys(report.cacheDetails).filter(
      (name) => !report.cacheDetails[name].isKnownCache
    );

    if (unknownCaches.length > 0) {
      report.recommendations.push({
        type: "info",
        message: `Found ${unknownCaches.length} unknown cache(s): ${unknownCaches.join(", ")}`,
        action: "Review if these caches are needed",
      });
    }

    // Performance recommendations
    if (report.totalCaches > 10) {
      report.recommendations.push({
        type: "optimization",
        message: "Large number of caches detected",
        action: "Consider consolidating related caches for better performance",
      });
    }
  }

  /**
   * Clear specific cache by name
   */
  async clearCache(cacheName) {
    try {
      const success = await caches.delete(cacheName);
      if (success) {
        logger.info(`🧹 Cleared cache: ${cacheName}`);
      } else {
        logger.warn(`⚠️ Cache not found: ${cacheName}`);
      }
      return success;
    } catch (error) {
      logger.error(`❌ Failed to clear cache: ${cacheName}`, error);
      return false;
    }
  }

  /**
   * Clear all caches
   */
  async clearAllCaches() {
    try {
      const cacheNames = await caches.keys();
      const results = await Promise.allSettled(cacheNames.map((name) => caches.delete(name)));

      const successful = results.filter((r) => r.status === "fulfilled" && r.value).length;
      const failed = results.length - successful;

      logger.info(`🧹 Cache cleanup completed: ${successful} cleared, ${failed} failed`);

      return {
        total: results.length,
        successful,
        failed,
        details: results.map((result, index) => ({
          cacheName: cacheNames[index],
          success: result.status === "fulfilled" && result.value,
          error: result.status === "rejected" ? result.reason?.message : null,
        })),
      };
    } catch (error) {
      logger.error("❌ Failed to clear all caches", error);
      throw error;
    }
  }

  /**
   * Get service worker status
   */
  async getServiceWorkerStatus() {
    if (!("serviceWorker" in navigator)) {
      return { supported: false };
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();

      if (!registration) {
        return {
          supported: true,
          registered: false,
          message: "Service worker not registered",
        };
      }

      const status = {
        supported: true,
        registered: true,
        scope: registration.scope,
        updateViaCache: registration.updateViaCache,
        installing: !!registration.installing,
        waiting: !!registration.waiting,
        active: !!registration.active,
        controlsPage: !!navigator.serviceWorker.controller,
      };

      if (registration.active) {
        status.activeState = registration.active.state;
        status.activeScriptURL = registration.active.scriptURL;
      }

      if (registration.waiting) {
        status.waitingState = registration.waiting.state;
      }

      if (registration.installing) {
        status.installingState = registration.installing.state;
      }

      return status;
    } catch (error) {
      logger.error("❌ Failed to get service worker status", error);
      return {
        supported: true,
        error: error.message,
      };
    }
  }

  /**
   * Test cache performance
   */
  async testCachePerformance() {
    const testUrl = window.location.origin + "/test-cache-performance";
    const testData = new Response("test data for cache performance", {
      headers: { "Content-Type": "text/plain" },
    });

    const results = {
      writeTime: 0,
      readTime: 0,
      deleteTime: 0,
      success: false,
    };

    try {
      // Test cache write
      const writeStart = performance.now();
      const cache = await caches.open("performance-test-cache");
      await cache.put(testUrl, testData.clone());
      results.writeTime = performance.now() - writeStart;

      // Test cache read
      const readStart = performance.now();
      const cachedResponse = await cache.match(testUrl);
      await cachedResponse.text(); // Read the response
      results.readTime = performance.now() - readStart;

      // Test cache delete
      const deleteStart = performance.now();
      await caches.delete("performance-test-cache");
      results.deleteTime = performance.now() - deleteStart;

      results.success = true;
      results.totalTime = results.writeTime + results.readTime + results.deleteTime;

      logger.info("⚡ Cache performance test completed", {
        writeMs: Math.round(results.writeTime * 100) / 100,
        readMs: Math.round(results.readTime * 100) / 100,
        deleteMs: Math.round(results.deleteTime * 100) / 100,
        totalMs: Math.round(results.totalTime * 100) / 100,
      });
    } catch (error) {
      logger.error("❌ Cache performance test failed", error);
      results.error = error.message;
    }

    return results;
  }

  /**
   * Get comprehensive diagnostics report
   */
  async getFullDiagnostics() {
    const [cacheHealth, swStatus, performance] = await Promise.allSettled([
      this.getCacheHealth(),
      this.getServiceWorkerStatus(),
      this.testCachePerformance(),
    ]);

    return {
      timestamp: new Date().toISOString(),
      cacheHealth:
        cacheHealth.status === "fulfilled"
          ? cacheHealth.value
          : { error: cacheHealth.reason?.message },
      serviceWorker:
        swStatus.status === "fulfilled" ? swStatus.value : { error: swStatus.reason?.message },
      performance:
        performance.status === "fulfilled"
          ? performance.value
          : { error: performance.reason?.message },
      userAgent: navigator.userAgent,
      online: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled,
      storageQuota: await this.getStorageQuota(),
    };
  }

  /**
   * Get storage quota information
   */
  async getStorageQuota() {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          quota: estimate.quota,
          usage: estimate.usage,
          available: estimate.quota - estimate.usage,
          usagePercent: Math.round((estimate.usage / estimate.quota) * 100),
        };
      } catch (error) {
        return { error: error.message };
      }
    }
    return { supported: false };
  }
}

// Create singleton instance
const swDiagnostics = new ServiceWorkerDiagnostics();

// Expose to window for debugging
if (typeof window !== "undefined") {
  window.swDiagnostics = swDiagnostics;
}

export default swDiagnostics;
