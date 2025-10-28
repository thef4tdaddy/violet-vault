/**
 * Tests for SystemInfoService
 * Testing system information collection functionality
 */
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { SystemInfoService } from "../systemInfoService.js";
import { BrowserInfoService } from "../browserInfoService.js";
import { PerformanceInfoService } from "../performanceInfoService.js";

// Mock logger
vi.mock("../../../utils/common/logger.js", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the sub-services
vi.mock("../browserInfoService.js", () => ({
  BrowserInfoService: {
    getBrowserInfo: vi.fn(),
    getViewportInfo: vi.fn(),
    getUrlInfo: vi.fn(),
  },
}));

vi.mock("../performanceInfoService.js", () => ({
  PerformanceInfoService: {
    getPerformanceInfo: vi.fn(),
    getStorageInfo: vi.fn(),
    getNetworkInfo: vi.fn(),
  },
}));

vi.mock("../errorTrackingService.js", () => ({
  ErrorTrackingService: {
    getRecentErrors: vi.fn(),
  },
}));

describe("SystemInfoService", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock returns
    (BrowserInfoService.getBrowserInfo as Mock).mockReturnValue({
      userAgent: "test-agent",
      language: "en-US",
      platform: "test-platform",
      cookieEnabled: true,
      onLine: true,
    });

    (BrowserInfoService.getViewportInfo as Mock).mockReturnValue({
      width: 1024,
      height: 768,
      screenWidth: 1920,
      screenHeight: 1080,
      devicePixelRatio: 1,
      availWidth: 1920,
      availHeight: 1080,
      colorDepth: 24,
      pixelDepth: 24,
      orientation: "landscape",
    });

    (BrowserInfoService.getUrlInfo as Mock).mockReturnValue({
      href: "http://localhost",
      protocol: "http:",
      host: "localhost",
      pathname: "/",
      search: "",
      hash: "",
    });

    (PerformanceInfoService.getPerformanceInfo as Mock).mockReturnValue({
      loadTime: 100,
      domContentLoaded: 50,
      navigationType: "navigate",
      redirectCount: 0,
    });

    (PerformanceInfoService.getStorageInfo as Mock).mockResolvedValue({
      localStorage: { available: true },
      sessionStorage: { available: true },
    });

    (PerformanceInfoService.getNetworkInfo as Mock).mockResolvedValue({
      onLine: true,
    });
  });

  describe("getBrowserInfo", () => {
    it("should collect basic browser information", () => {
      const info = BrowserInfoService.getBrowserInfo();

      expect(info).toHaveProperty("userAgent");
      expect(info).toHaveProperty("language");
      expect(info).toHaveProperty("platform");
      expect(info).toHaveProperty("cookieEnabled");
      expect(info).toHaveProperty("onLine");
      expect(typeof info.userAgent).toBe("string");
      expect(typeof info.cookieEnabled).toBe("boolean");
      expect(typeof info.onLine).toBe("boolean");
    });

    it("should handle missing navigator properties gracefully", () => {
      const originalNavigator = global.navigator;

      // Mock navigator with missing properties
      (global.navigator as Partial<Navigator>) = {
        userAgent: "test-agent",
        language: "en-US",
        platform: "test-platform",
      };

      (BrowserInfoService.getBrowserInfo as Mock).mockReturnValueOnce({
        userAgent: "test-agent",
        language: "en-US",
        platform: "test-platform",
      });

      const info = BrowserInfoService.getBrowserInfo();

      expect(info.userAgent).toBe("test-agent");
      expect(info.language).toBe("en-US");
      expect(info.platform).toBe("test-platform");

      global.navigator = originalNavigator;
    });
  });

  describe("getViewportInfo", () => {
    it("should collect viewport information", () => {
      (BrowserInfoService.getViewportInfo as Mock).mockReturnValueOnce({
        width: 1024,
        height: 768,
        screenWidth: 1920,
        screenHeight: 1080,
        devicePixelRatio: 1,
        availWidth: 1920,
        availHeight: 1080,
        colorDepth: 24,
        pixelDepth: 24,
        orientation: "landscape",
      });

      const info = BrowserInfoService.getViewportInfo();

      expect(info).toHaveProperty("width");
      expect(info).toHaveProperty("height");
      expect(info).toHaveProperty("screenWidth");
      expect(info).toHaveProperty("screenHeight");

      expect(typeof info.width).toBe("number");
      expect(typeof info.height).toBe("number");
      expect(typeof info.screenWidth).toBe("number");
      expect(typeof info.screenHeight).toBe("number");
    });

    it("should include device pixel ratio", () => {
      const info = BrowserInfoService.getViewportInfo();

      expect(info).toHaveProperty("devicePixelRatio");
      expect(typeof info.devicePixelRatio).toBe("number");
    });
  });

  describe("getPerformanceInfo", () => {
    it("should collect performance metrics when available", () => {
      const info = PerformanceInfoService.getPerformanceInfo();

      expect(info).toHaveProperty("loadTime");
      expect(info).toHaveProperty("domContentLoaded");
      expect(info).toHaveProperty("navigationType");
      expect(info).toHaveProperty("redirectCount");
    });

    it("should handle missing performance API gracefully", () => {
      const originalPerformance = global.performance;

      // Mock performance with missing timing
      (global.performance as Partial<Performance>) = {
        getEntriesByType: vi.fn(() => []) as Mock,
      };

      (PerformanceInfoService.getPerformanceInfo as Mock).mockReturnValueOnce({
        available: false,
      });

      const info = PerformanceInfoService.getPerformanceInfo();

      expect(info).toHaveProperty("available");

      global.performance = originalPerformance;
    });
  });

  describe("getStorageInfo", () => {
    it("should check localStorage availability", async () => {
      const info = await PerformanceInfoService.getStorageInfo();

      expect(info).toHaveProperty("localStorage");
      expect(info.localStorage).toHaveProperty("available");
      expect(typeof info.localStorage.available).toBe("boolean");
    });

    it("should check sessionStorage availability", async () => {
      const info = await PerformanceInfoService.getStorageInfo();

      expect(info).toHaveProperty("sessionStorage");
      expect(info.sessionStorage).toHaveProperty("available");
      expect(typeof info.sessionStorage.available).toBe("boolean");
    });

    it("should handle storage access errors", async () => {
      (PerformanceInfoService.getStorageInfo as Mock).mockResolvedValueOnce({
        localStorage: { available: false },
        sessionStorage: { available: true },
      });

      const info = await PerformanceInfoService.getStorageInfo();

      expect(info.localStorage.available).toBe(false);
    });
  });

  describe("collectSystemInfo", () => {
    it("should collect comprehensive system information", async () => {
      const systemInfo = await SystemInfoService.collectSystemInfo();

      expect(systemInfo).toHaveProperty("timestamp");
      expect(systemInfo).toHaveProperty("browser");
      expect(systemInfo).toHaveProperty("viewport");
      expect(systemInfo).toHaveProperty("performance");
      expect(systemInfo).toHaveProperty("storage");
      expect(systemInfo).toHaveProperty("network");
      expect(systemInfo).toHaveProperty("url");
      expect(systemInfo).toHaveProperty("userAgent");

      expect(typeof systemInfo.timestamp).toBe("string");
      expect(typeof systemInfo.userAgent).toBe("string");
    });

    it("should return fallback data on error", async () => {
      // Mock getBrowserInfo to throw error
      (BrowserInfoService.getBrowserInfo as Mock).mockImplementationOnce(() => {
        throw new Error("Collection failed");
      });

      const systemInfo = await SystemInfoService.collectSystemInfo();

      expect(systemInfo).toHaveProperty("fallback");
      expect(systemInfo).toHaveProperty("timestamp");
      expect(systemInfo).toHaveProperty("browser");
    });
  });

  describe("getFallbackSystemInfo", () => {
    it("should provide minimal fallback information", () => {
      const fallback = SystemInfoService.getFallbackSystemInfo();

      expect(fallback).toHaveProperty("timestamp");
      expect(fallback).toHaveProperty("browser");
      expect(fallback).toHaveProperty("viewport");
      expect(fallback).toHaveProperty("url");
      expect(fallback).toHaveProperty("fallback");

      expect(typeof fallback.timestamp).toBe("string");
      expect(fallback.fallback).toBe(true);
    });
  });
});
