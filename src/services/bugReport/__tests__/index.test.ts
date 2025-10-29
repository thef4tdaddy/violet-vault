/**
 * Tests for Unified Bug Reporting Service
 * Testing the main BugReportService integration
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import BugReportService, {
  ScreenshotService,
  SystemInfoService,
  BugReportAPIService,
  ContextAnalysisService,
} from "../index.js";
import type { BugReportData } from "../apiService.js";

// Mock all service dependencies
vi.mock("../screenshotService.js", () => ({
  ScreenshotService: {
    captureScreenshot: vi.fn(),
    getScreenshotInfo: vi.fn(),
    autoCompressScreenshot: vi.fn(),
  },
}));

vi.mock("../systemInfoService.js", () => ({
  SystemInfoService: {
    collectSystemInfo: vi.fn(),
    getFallbackSystemInfo: vi.fn(),
  },
}));

vi.mock("../apiService.js", () => ({
  BugReportAPIService: {
    validateReportData: vi.fn(),
    submitWithFallbacks: vi.fn(),
  },
}));

vi.mock("../contextAnalysisService.js", () => ({
  ContextAnalysisService: {
    getCurrentPageContext: vi.fn(),
    getFallbackContext: vi.fn(),
  },
}));

vi.mock("../../../utils/common/logger.js", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../../utils/common/version.js", () => ({
  APP_VERSION: "1.0.0-test",
}));

// Mock environment variables
vi.mock("import.meta.env", () => ({
  env: {
    VITE_BUG_REPORT_ENDPOINT: "https://api.test.com/bug-reports",
  },
}));

// Get mocked versions with proper typing
const mockedScreenshotService = ScreenshotService as unknown as {
  captureScreenshot: ReturnType<typeof vi.fn>;
  getScreenshotInfo: ReturnType<typeof vi.fn>;
  autoCompressScreenshot: ReturnType<typeof vi.fn>;
};
const mockedSystemInfoService = SystemInfoService as unknown as {
  collectSystemInfo: ReturnType<typeof vi.fn>;
  getFallbackSystemInfo: ReturnType<typeof vi.fn>;
};
const mockedBugReportAPIService = BugReportAPIService as unknown as {
  validateReportData: ReturnType<typeof vi.fn>;
  submitWithFallbacks: ReturnType<typeof vi.fn>;
};
const mockedContextAnalysisService = ContextAnalysisService as unknown as {
  getCurrentPageContext: ReturnType<typeof vi.fn>;
  getFallbackContext: ReturnType<typeof vi.fn>;
};

describe("BugReportService", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Set up default mock implementations
    mockedScreenshotService.captureScreenshot.mockResolvedValue("screenshot-data");
    mockedScreenshotService.getScreenshotInfo.mockReturnValue({
      size: 100 * 1024,
      sizeKB: 100,
      format: "png",
      timestamp: new Date().toISOString(),
    });
    mockedScreenshotService.autoCompressScreenshot.mockImplementation((data) =>
      Promise.resolve(data)
    );

    mockedSystemInfoService.collectSystemInfo.mockResolvedValue({
      timestamp: "2023-01-01T00:00:00.000Z",
      browser: {
        userAgent: "test-agent",
        name: "test",
        version: "1.0",
        engine: "test",
        platform: "test",
        language: "en",
        languages: ["en"] as readonly string[],
        cookieEnabled: true,
        onLine: true,
        hardwareConcurrency: 4,
        permissions: { notifications: "default", geolocation: "default" },
      },
      viewport: { width: 1920, height: 1080 },
      url: {
        href: "http://test.com",
        protocol: "http:",
        hostname: "test.com",
        pathname: "/test",
        search: "",
        hash: "",
        host: "test.com",
        port: "",
        origin: "http://test.com",
      },
      performance: {
        timing: {
          navigationStart: 0,
          domContentLoaded: 100,
          loadComplete: 200,
          domInteractive: 50,
        },
        memory: null,
        navigation: null,
        available: true,
      },
      storage: {
        localStorage: { available: true },
      },
      network: {
        effectiveType: "4g",
        downlink: 10,
        rtt: 50,
        saveData: false,
        onLine: true,
        connection: null,
      },
      errors: {
        recentErrors: [],
        consoleLogs: [],
      },
      userAgent: "test-agent",
    });

    mockedContextAnalysisService.getCurrentPageContext.mockReturnValue({
      page: "test-page",
      route: {
        pathname: "/test",
        search: "",
        hash: "",
        searchParams: Object.fromEntries(new URLSearchParams()),
        segments: ["test"],
        query: {},
        isRoot: false,
        isNested: false,
      },
      screen: {
        documentTitle: "Test",
        screenTitle: "Test",
        breadcrumbs: [],
        mainHeading: "Test",
      },
      userLocation: "test",
      ui: {
        modals: [],
        forms: [],
        buttons: [],
        inputs: [],
        drawers: [],
        tabs: [],
        loading: [],
        interactions: [],
      },
      performance: {
        available: true,
      },
      accessibility: {
        available: true,
      },
      data: {
        available: true,
      },
      interactions: [],
    });

    mockedBugReportAPIService.validateReportData.mockReturnValue({
      isValid: true,
      errors: [],
      warnings: [],
    });

    mockedBugReportAPIService.submitWithFallbacks.mockResolvedValue({
      success: true,
      overallSuccess: true,
      submissionId: "test-123",
      primaryProvider: "webhook",
      attempts: 1,
      results: [],
    });
  });

  describe("submitBugReport", () => {
    it("should submit a complete bug report successfully", async () => {
      const options = {
        title: "Test Bug",
        description: "Test description",
        includeScreenshot: true,
        severity: "medium" as const,
      };

      const result = await BugReportService.submitBugReport(options);

      expect(result.success).toBe(true);
      expect(result.submissionId).toBe("test-123");
      expect(mockedSystemInfoService.collectSystemInfo).toHaveBeenCalled();
      expect(mockedContextAnalysisService.getCurrentPageContext).toHaveBeenCalled();
      expect(mockedScreenshotService.captureScreenshot).toHaveBeenCalled();
      expect(mockedBugReportAPIService.submitWithFallbacks).toHaveBeenCalled();
    });

    it("should skip screenshot when not requested", async () => {
      const options = {
        title: "Test Bug",
        description: "Test description",
        includeScreenshot: false,
      };

      await BugReportService.submitBugReport(options);

      expect(mockedScreenshotService.captureScreenshot).not.toHaveBeenCalled();
    });

    it("should handle validation errors", async () => {
      mockedBugReportAPIService.validateReportData.mockReturnValue({
        isValid: false,
        errors: ["Title is required"],
        warnings: [],
      });

      const options = {
        description: "Test description without title",
      };

      await expect(BugReportService.submitBugReport(options)).rejects.toThrow(
        "Invalid report data: Title is required"
      );
    });

    it("should handle submission failures gracefully", async () => {
      mockedBugReportAPIService.submitWithFallbacks.mockRejectedValue(
        new Error("Submission failed")
      );

      const options = {
        title: "Test Bug",
        description: "Test description",
      };

      await expect(BugReportService.submitBugReport(options)).rejects.toThrow("Submission failed");
    });
  });

  describe("collectAllData", () => {
    it("should collect all data in parallel", async () => {
      const options = { includeScreenshot: true };

      const data = await BugReportService.collectAllData(options);

      expect(data).toHaveProperty("screenshot");
      expect(data).toHaveProperty("systemInfo");
      expect(data).toHaveProperty("contextInfo");
      expect(data).toHaveProperty("timestamp");

      expect(mockedScreenshotService.captureScreenshot).toHaveBeenCalled();
      expect(mockedSystemInfoService.collectSystemInfo).toHaveBeenCalled();
      expect(mockedContextAnalysisService.getCurrentPageContext).toHaveBeenCalled();
    });

    it("should handle data collection failures", async () => {
      mockedSystemInfoService.collectSystemInfo.mockRejectedValue(new Error("Collection failed"));
      mockedSystemInfoService.getFallbackSystemInfo.mockReturnValue({
        timestamp: new Date().toISOString(),
        browser: {
          name: "Unknown",
          version: "Unknown",
          userAgent: "test",
          engine: "test",
          platform: "Unknown",
          language: "en",
          languages: ["en"] as readonly string[],
          cookieEnabled: false,
          onLine: false,
          hardwareConcurrency: 0,
          permissions: { notifications: "default", geolocation: "default" },
        },
        viewport: { width: 0, height: 0 },
        url: {
          href: "Unknown",
          protocol: "",
          hostname: "",
          pathname: "",
          search: "",
          hash: "",
          host: "",
          port: "",
          origin: "",
        },
        performance: {
          timing: {
            navigationStart: 0,
            domContentLoaded: 0,
            loadComplete: 0,
            domInteractive: 0,
          },
          memory: null,
          navigation: null,
          available: false,
        },
        storage: { localStorage: { available: false } },
        network: {
          onLine: true,
          effectiveType: "4g",
          downlink: 10,
          rtt: 50,
          saveData: false,
          connection: null,
        },
        errors: { recentErrors: [], consoleLogs: [] },
        userAgent: "Unknown",
        fallback: true,
      });
      mockedContextAnalysisService.getFallbackContext.mockReturnValue({
        page: "Unknown",
        route: {
          pathname: "/",
          search: "",
          hash: "",
          searchParams: {},
          segments: [],
          query: {},
          isRoot: true,
          isNested: false,
        },
        screen: {
          documentTitle: "",
          screenTitle: "",
          breadcrumbs: [],
          mainHeading: "",
        },
        userLocation: "Unknown",
        ui: {
          modals: [],
          forms: [],
          buttons: [],
          inputs: [],
          drawers: [],
          tabs: [],
          loading: [],
          interactions: [],
        },
        performance: { available: false },
        accessibility: { available: false },
        data: { available: false },
        interactions: [],
        fallback: true,
      });

      const options = { includeScreenshot: false };
      const data = await BugReportService.collectAllData(options);

      expect((data.systemInfo as { fallback?: boolean }).fallback).toBe(true);
      expect((data.contextInfo as { fallback?: boolean }).fallback).toBe(true);
      expect(data.collectionError).toBe("Collection failed");
    });
  });

  describe("captureScreenshotSafely", () => {
    it("should capture screenshot and check size", async () => {
      mockedScreenshotService.captureScreenshot.mockResolvedValue("large-screenshot");
      mockedScreenshotService.getScreenshotInfo.mockReturnValue({
        size: 1500 * 1024,
        sizeKB: 1500,
        format: "png",
        timestamp: new Date().toISOString(),
      });

      const screenshot = await BugReportService.captureScreenshotSafely();

      expect(screenshot).toBe("large-screenshot");
      expect(mockedScreenshotService.captureScreenshot).toHaveBeenCalled();
      expect(mockedScreenshotService.getScreenshotInfo).toHaveBeenCalledWith("large-screenshot");
    });

    it("should handle screenshot capture failure", async () => {
      mockedScreenshotService.captureScreenshot.mockRejectedValue(new Error("Capture failed"));

      const screenshot = await BugReportService.captureScreenshotSafely();

      expect(screenshot).toBeNull();
    });
  });

  describe("submitWithProperScreenshotHandling", () => {
    it("should handle large screenshots separately", async () => {
      const reportData: BugReportData = {
        title: "Test Report",
        screenshot: "large-screenshot",
      };
      mockedScreenshotService.getScreenshotInfo.mockReturnValue({
        size: 600 * 1024,
        sizeKB: 600,
        format: "png",
        timestamp: new Date().toISOString(),
      });

      mockedBugReportAPIService.submitWithFallbacks.mockResolvedValue({
        success: true,
        overallSuccess: true,
        submissionId: "test-456",
        attempts: 1,
        results: [],
      });

      const result = await BugReportService.submitWithProperScreenshotHandling(reportData, []);

      expect(result.screenshotStatus).toBeDefined();
      expect(result.screenshotStatus?.captured).toBe(true);
      expect(result.screenshotStatus?.uploaded).toBe(false);
      expect(result.screenshotStatus?.reason).toContain("too large");
    });

    it("should submit normally for small screenshots", async () => {
      const reportData: BugReportData = {
        title: "Test Report",
        screenshot: "small-screenshot",
      };
      mockedScreenshotService.getScreenshotInfo.mockReturnValue({
        size: 100 * 1024,
        sizeKB: 100,
        format: "png",
        timestamp: new Date().toISOString(),
      });

      await BugReportService.submitWithProperScreenshotHandling(reportData, []);

      expect(mockedBugReportAPIService.submitWithFallbacks).toHaveBeenCalledWith(reportData, []);
    });
  });

  describe("quickReport", () => {
    it("should create quick report with minimal options", async () => {
      mockedBugReportAPIService.submitWithFallbacks.mockResolvedValue({
        success: true,
        submissionId: "quick-123",
        timestamp: new Date().toISOString(),
        fallbackUsed: false,
      });

      const result = await BugReportService.quickReport("Quick bug description");

      expect(result.success).toBe(true);
      expect(result.submissionId).toBe("quick-123");
    });
  });

  describe("getProviders", () => {
    it("should return default webhook provider when endpoint configured", () => {
      const providers = BugReportService.getProviders();

      expect(providers).toHaveLength(1);
      expect(providers[0]).toEqual({
        type: "webhook",
        url: "https://api.test.com/bug-reports",
        primary: true,
      });
    });

    it("should add custom providers", () => {
      const customProviders = {
        github: { token: "test-token" },
        email: { to: "bugs@test.com" },
      };

      const providers = BugReportService.getProviders(customProviders);

      expect(providers).toHaveLength(3);
      expect(providers.find((p) => p.type === "github")).toBeDefined();
      expect(providers.find((p) => p.type === "email")).toBeDefined();
    });
  });

  describe("saveReportLocally", () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it("should save report to localStorage", async () => {
      const options = { title: "Local Bug", description: "Local description" };
      const error = new Error("Submission failed");

      await BugReportService.saveReportLocally(options, error);

      const savedReports = JSON.parse(localStorage.getItem("violet-vault-bug-reports"));
      expect(savedReports).toHaveLength(1);
      expect(savedReports[0].title).toBe("Local Bug");
      expect(savedReports[0].error).toBe("Submission failed");
    });

    it("should limit saved reports to 10", async () => {
      // Add 11 reports
      for (let i = 0; i < 11; i++) {
        await BugReportService.saveReportLocally(
          { title: `Bug ${i}`, description: `Description ${i}` },
          new Error("Test error")
        );
      }

      const savedReports = JSON.parse(localStorage.getItem("violet-vault-bug-reports"));
      expect(savedReports).toHaveLength(10);
      expect(savedReports[0].title).toBe("Bug 1"); // First report should be removed
    });
  });

  describe("diagnostic methods", () => {
    it("should test screenshot functionality", async () => {
      mockedScreenshotService.captureScreenshot.mockResolvedValue("test-screenshot");
      mockedScreenshotService.getScreenshotInfo.mockReturnValue({
        size: 100 * 1024,
        sizeKB: 100,
        format: "png",
        timestamp: new Date().toISOString(),
      });

      const result = await BugReportService.testScreenshot();

      expect(result.success).toBe(true);
      expect(result.screenshot).toBe(true);
      expect(result.info).toEqual({ sizeKB: 100 });
    });

    it("should test system info functionality", async () => {
      const result = await BugReportService.testSystemInfo();

      expect(result.success).toBe(true);
      expect(result.systemInfo.browser).toBe(true);
      expect(result.systemInfo.viewport).toBe(true);
    });

    it("should run comprehensive diagnostics", async () => {
      const result = await BugReportService.runDiagnostics();

      expect(result.success).toBe(true);
      expect(result.components).toHaveProperty("screenshot");
      expect(result.components).toHaveProperty("systemInfo");
      expect(result.components).toHaveProperty("contextAnalysis");
      expect(result.timestamp).toBeTruthy();
    });
  });

  describe("local report management", () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it("should retrieve local reports", () => {
      const testReports = [{ title: "Test Report", timestamp: "2023-01-01" }];
      localStorage.setItem("violet-vault-bug-reports", JSON.stringify(testReports));

      const reports = BugReportService.getLocalReports();

      expect(reports).toEqual(testReports);
    });

    it("should clear local reports", () => {
      localStorage.setItem("violet-vault-bug-reports", JSON.stringify([{ title: "Test" }]));

      BugReportService.clearLocalReports();

      expect(localStorage.getItem("violet-vault-bug-reports")).toBeNull();
    });

    it("should handle JSON parse errors", () => {
      localStorage.setItem("violet-vault-bug-reports", "invalid-json");

      const reports = BugReportService.getLocalReports();

      expect(reports).toEqual([]);
    });
  });
});
