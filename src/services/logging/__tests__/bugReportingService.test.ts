import { describe, it, expect, vi, beforeEach } from "vitest";
import BugReportingService from "../bugReportingService";
import { ApiClient } from "@/services/api/client";

// Mock dependencies
vi.mock("@/services/api/client", () => ({
  ApiClient: {
    post: vi.fn(),
  },
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock("html2canvas", () => ({
  default: vi.fn(() =>
    Promise.resolve({
      toDataURL: () => "data:image/jpeg;base64,mock",
    })
  ),
}));

describe("BugReportingService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    BugReportingService.clearLocalReports();
  });

  describe("initialize", () => {
    it("should register event listeners", () => {
      const addEventListenerSpy = vi.spyOn(window, "addEventListener");
      BugReportingService.initialize();
      expect(addEventListenerSpy).toHaveBeenCalledWith("error", expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith("unhandledrejection", expect.any(Function));
    });

    it("should wrap console methods", () => {
      const originalLog = console.log;
      BugReportingService.initialize();
      expect(console.log).not.toBe(originalLog);

      // Restore
      console.log = originalLog;
    });
  });

  describe("submitBugReport", () => {
    it("should submit a bug report successfully", async () => {
      (ApiClient.post as any).mockResolvedValue({
        success: true,
        data: { issueNumber: 123, url: "https://github.com/test/repo/issues/123" },
      });

      const options = {
        title: "Test Bug",
        description: "Steps to reproduce",
        severity: "medium" as const,
      };

      const result = await BugReportingService.submitBugReport(options);

      expect(ApiClient.post).toHaveBeenCalledWith(
        "/api/bug-report",
        expect.objectContaining({
          title: "Test Bug",
          description: "Steps to reproduce",
        })
      );
      expect(result.success).toBe(true);
      expect(result.issueNumber).toBe(123);
    });

    it("should handle submission failure", async () => {
      (ApiClient.post as any).mockResolvedValue({
        success: false,
        error: "Network error",
      });

      const result = await BugReportingService.submitBugReport({ title: "Fail Test" });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error");
    });
  });

  describe("collectSystemInfo", () => {
    it("should collect browser information", () => {
      const info = BugReportingService.collectSystemInfo();
      expect(info).toHaveProperty("appName", "VioletVault");
      expect(info).toHaveProperty("userAgent");
      expect(info).toHaveProperty("viewport");
    });
  });

  describe("diagnostics", () => {
    it("should run diagnostics", () => {
      const diagnostics = BugReportingService.runDiagnostics();
      expect(diagnostics.status).toBe("healthy");
      expect(diagnostics.system).toBeDefined();
    });
  });
});
