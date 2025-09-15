/**
 * Browser Information Service
 * Handles browser detection, capabilities, and environment info
 * Extracted from systemInfoService.js for Issue #513
 */
import logger from "../../utils/common/logger";

export class BrowserInfoService {
  /**
   * Get comprehensive browser information
   * @returns {Object} Browser information
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
        engine,
        userAgent,
        platform: navigator.platform || "Unknown",
        language: navigator.language || "Unknown",
        languages: navigator.languages || [],
        cookieEnabled: navigator.cookieEnabled || false,
        onLine: navigator.onLine || false,
        hardwareConcurrency: navigator.hardwareConcurrency || 0,
        permissions: this.getPermissionStates(),
      };
    } catch (error) {
      logger.warn("Error collecting browser info", error);
      return {
        name: "Unknown",
        version: "Unknown",
        engine: "Unknown",
        userAgent: navigator.userAgent || "Unknown",
        platform: "Unknown",
        language: "Unknown",
        languages: [],
        cookieEnabled: false,
        onLine: true,
        hardwareConcurrency: 0,
        permissions: {},
      };
    }
  }

  /**
   * Get permission states for various APIs
   * @returns {Object} Permission states
   */
  static getPermissionStates() {
    const permissions = {};

    try {
      // Check for permissions API support
      if ("permissions" in navigator) {
        // Note: We can't query all permissions synchronously, so we check what we can
        const permissionsToCheck = ["clipboard-write", "camera", "microphone", "notifications"];

        // This would need to be async to actually query, but for bug reports we just note availability
        permissions.apiSupported = true;
        permissions.available = permissionsToCheck;
      } else {
        permissions.apiSupported = false;
      }

      // Check specific API availability
      permissions.clipboard = "clipboard" in navigator;
      permissions.serviceWorker = "serviceWorker" in navigator;
      permissions.geolocation = "geolocation" in navigator;
      permissions.mediaDevices = "mediaDevices" in navigator;
      permissions.notification = "Notification" in window;
    } catch (error) {
      logger.debug("Error checking permissions", error);
    }

    return permissions;
  }

  /**
   * Get viewport and display information
   * @returns {Object} Viewport information
   */
  static getViewportInfo() {
    try {
      return {
        width: window.innerWidth || 0,
        height: window.innerHeight || 0,
        devicePixelRatio: window.devicePixelRatio || 1,
        screenWidth: window.screen?.width || 0,
        screenHeight: window.screen?.height || 0,
        availWidth: window.screen?.availWidth || 0,
        availHeight: window.screen?.availHeight || 0,
        colorDepth: window.screen?.colorDepth || 0,
        pixelDepth: window.screen?.pixelDepth || 0,
        orientation: window.screen?.orientation?.type || "Unknown",
      };
    } catch (error) {
      logger.warn("Error collecting viewport info", error);
      return {
        width: 0,
        height: 0,
        devicePixelRatio: 1,
        screenWidth: 0,
        screenHeight: 0,
        availWidth: 0,
        availHeight: 0,
        colorDepth: 0,
        pixelDepth: 0,
        orientation: "Unknown",
      };
    }
  }

  /**
   * Get URL and location information
   * @returns {Object} URL information
   */
  static getUrlInfo() {
    try {
      const url = new URL(window.location.href);
      return {
        href: window.location.href,
        protocol: url.protocol,
        host: url.host,
        hostname: url.hostname,
        port: url.port,
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
        origin: url.origin,
      };
    } catch (error) {
      logger.warn("Error collecting URL info", error);
      return {
        href: window.location.href || "Unknown",
        protocol: "Unknown",
        host: "Unknown",
        hostname: "Unknown",
        port: "Unknown",
        pathname: "Unknown",
        search: "",
        hash: "",
        origin: "Unknown",
      };
    }
  }
}
