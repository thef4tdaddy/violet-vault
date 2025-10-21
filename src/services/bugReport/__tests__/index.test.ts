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
    prepareReportData: vi.fn(),
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
vi.mock(
  "import.meta.env",
  () => ({
    env: {
      VITE_BUG_REPORT_ENDPOINT: "https://api.test.com/bug-reports",
    },
  }),
  { virtual: true }
);

describe("BugReportService", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Set up default mock implementations
    ScreenshotService.captureScreenshot.mockResolvedValue("screenshot-data");
    ScreenshotService.getScreenshotInfo.mockReturnValue({ sizeKB: 100 });
    ScreenshotService.autoCompressScreenshot.mockImplementation((data) => Promise.resolve(data));

    SystemInfoService.collectSystemInfo.mockResolvedValue({
      browser: { userAgent: "test-agent" },
      viewport: { width: 1920, height: 1080 },
      timestamp: "2023-01-01T00:00:00.000Z",
    });

    ContextAnalysisService.getCurrentPageContext.mockReturnValue({
      page: "test-page",
      route: { pathname: "/test" },
    });

    BugReportAPIService.validateReportData.mockReturnValue({
      isValid: true,
      errors: [],
      warnings: [],
    });

    BugReportAPIService.prepareReportData.mockImplementation((data) => data);

    BugReportAPIService.submitWithFallbacks.mockResolvedValue({
      success: true,
      submissionId: "test-123",
      primaryProvider: "webhook",
    });
  });

  describe("submitBugReport", () => {
    it("should submit a complete bug report successfully", async () => {
      const options = {
        title: "Test Bug",
        description: "Test description",
        includeScreenshot: true,
        severity: "medium",
      };

      const result = await BugReportService.submitBugReport(options);

      expect(result.success).toBe(true);
      expect(result.submissionId).toBe("test-123");
      expect(SystemInfoService.collectSystemInfo).toHaveBeenCalled();
      expect(ContextAnalysisService.getCurrentPageContext).toHaveBeenCalled();
      expect(ScreenshotService.captureScreenshot).toHaveBeenCalled();
      expect(BugReportAPIService.submitWithFallbacks).toHaveBeenCalled();
    });

    it("should skip screenshot when not requested", async () => {
      const options = {
        title: "Test Bug",
        description: "Test description",
        includeScreenshot: false,
      };

      await BugReportService.submitBugReport(options);

      expect(ScreenshotService.captureScreenshot).not.toHaveBeenCalled();
    });

    it("should handle validation errors", async () => {
      BugReportAPIService.validateReportData.mockReturnValue({
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
      BugReportAPIService.submitWithFallbacks.mockRejectedValue(new Error("Submission failed"));

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

      expect(ScreenshotService.captureScreenshot).toHaveBeenCalled();
      expect(SystemInfoService.collectSystemInfo).toHaveBeenCalled();
      expect(ContextAnalysisService.getCurrentPageContext).toHaveBeenCalled();
    });

    it("should handle data collection failures", async () => {
      SystemInfoService.collectSystemInfo.mockRejectedValue(new Error("Collection failed"));
      SystemInfoService.getFallbackSystemInfo.mockReturnValue({
        fallback: true,
      });
      ContextAnalysisService.getFallbackContext.mockReturnValue({
        fallback: true,
      });

      const options = { includeScreenshot: false };
      const data = await BugReportService.collectAllData(options);

      expect(data.systemInfo).toEqual({ fallback: true });
      expect(data.contextInfo).toEqual({ fallback: true });
      expect(data.collectionError).toBe("Collection failed");
    });
  });

  describe("captureScreenshotSafely", () => {
    it("should capture screenshot and check size", async () => {
      ScreenshotService.captureScreenshot.mockResolvedValue("large-screenshot");
      ScreenshotService.getScreenshotInfo.mockReturnValue({ sizeKB: 1500 });

      const screenshot = await BugReportService.captureScreenshotSafely();

      expect(screenshot).toBe("large-screenshot");
      expect(ScreenshotService.captureScreenshot).toHaveBeenCalled();
      expect(ScreenshotService.getScreenshotInfo).toHaveBeenCalledWith("large-screenshot");
    });

    it("should handle screenshot capture failure", async () => {
      ScreenshotService.captureScreenshot.mockRejectedValue(new Error("Capture failed"));

      const screenshot = await BugReportService.captureScreenshotSafely();

      expect(screenshot).toBeNull();
    });
  });

  describe("submitWithProperScreenshotHandling", () => {
    it("should handle large screenshots separately", async () => {
      const reportData = { screenshot: "large-screenshot" };
      ScreenshotService.getScreenshotInfo.mockReturnValue({ sizeKB: 600 });

      BugReportAPIService.submitWithFallbacks.mockResolvedValue({
        success: true,
        submissionId: "test-456",
      });

      const result = await BugReportService.submitWithProperScreenshotHandling(reportData, []);

      expect(result.screenshotStatus).toBeDefined();
      expect(result.screenshotStatus.captured).toBe(true);
      expect(result.screenshotStatus.uploaded).toBe(false);
      expect(result.screenshotStatus.reason).toContain("too large");
    });

    it("should submit normally for small screenshots", async () => {
      const reportData = { screenshot: "small-screenshot" };
      ScreenshotService.getScreenshotInfo.mockReturnValue({ sizeKB: 100 });

      await BugReportService.submitWithProperScreenshotHandling(reportData, []);

      expect(BugReportAPIService.submitWithFallbacks).toHaveBeenCalledWith(reportData, []);
    });
  });

  describe("quickReport", () => {
    it("should create quick report with minimal options", async () => {
      BugReportAPIService.submitWithFallbacks.mockResolvedValue({
        success: true,
        submissionId: "quick-123",
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
      ScreenshotService.captureScreenshot.mockResolvedValue("test-screenshot");
      ScreenshotService.getScreenshotInfo.mockReturnValue({ sizeKB: 100 });

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
