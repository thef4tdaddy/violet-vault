/**
 * Browser Information Service
 * Handles browser detection, capabilities, and environment info
 * Extracted from systemInfoService.js for Issue #513
 */
import logger from "../../utils/common/logger";

/**
 * Browser information structure
 */
export interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
  userAgent: string;
  platform: string;
  language: string;
  languages: readonly string[];
  cookieEnabled: boolean;
  onLine: boolean;
  hardwareConcurrency: number;
  permissions: PermissionStates;
}

/**
 * Permission states structure
 */
export interface PermissionStates {
  apiSupported?: boolean;
  available?: string[];
  clipboard?: boolean;
  serviceWorker?: boolean;
  geolocation?: boolean;
  mediaDevices?: boolean;
  notification?: boolean;
}

/**
 * Viewport information structure
 */
export interface ViewportInfo {
  width: number;
  height: number;
  devicePixelRatio: number;
  screenWidth: number;
  screenHeight: number;
  availWidth: number;
  availHeight: number;
  colorDepth: number;
  pixelDepth: number;
  orientation: string;
}

/**
 * URL information structure
 */
export interface UrlInfo {
  href: string;
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  origin: string;
}

export class BrowserInfoService {
  /**
   * Get comprehensive browser information
   */
  static getBrowserInfo(): BrowserInfo {
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
      logger.warn("Error collecting browser info", {
        error: error instanceof Error ? error.message : String(error),
      });
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
   */
  static getPermissionStates(): PermissionStates {
    const permissions: PermissionStates = {};

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
      logger.debug("Error checking permissions", {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return permissions;
  }

  /**
   * Get viewport and display information
   */
  static getViewportInfo(): ViewportInfo {
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
      logger.warn("Error collecting viewport info", {
        error: error instanceof Error ? error.message : String(error),
      });
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
   */
  static getUrlInfo(): UrlInfo {
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
      logger.warn("Error collecting URL info", {
        error: error instanceof Error ? error.message : String(error),
      });
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
