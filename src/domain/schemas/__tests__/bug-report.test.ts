import { describe, it, expect } from "vitest";
import {
  BugReportSchema,
  BugSeveritySchema,
  SystemInfoSchema,
  ContextInfoSchema,
  validateBugReport,
  validateBugReportSafe,
  validateBugReportPartial,
  type BugReport,
  type BugSeverity,
  type SystemInfo,
} from "../bug-report";

describe("BugReportSchema", () => {
  describe("BugSeveritySchema", () => {
    it("should validate valid severity levels", () => {
      expect(BugSeveritySchema.parse("low")).toBe("low");
      expect(BugSeveritySchema.parse("medium")).toBe("medium");
      expect(BugSeveritySchema.parse("high")).toBe("high");
      expect(BugSeveritySchema.parse("critical")).toBe("critical");
    });

    it("should reject invalid severity levels", () => {
      expect(() => BugSeveritySchema.parse("invalid")).toThrow();
      expect(() => BugSeveritySchema.parse("")).toThrow();
    });
  });

  describe("SystemInfoSchema", () => {
    it("should validate complete system info", () => {
      const validSystemInfo = {
        browser: "Chrome",
        version: "120.0",
        platform: "Windows",
        userAgent: "Mozilla/5.0...",
        viewport: {
          width: 1920,
          height: 1080,
        },
        performance: { loadTime: 123 },
        storage: { localStorage: true },
        network: { online: true },
        timestamp: "2024-01-01T00:00:00.000Z",
        fallback: false,
      };

      const result = SystemInfoSchema.parse(validSystemInfo);
      expect(result).toEqual(validSystemInfo);
    });

    it("should accept minimal system info", () => {
      const minimalSystemInfo = {};
      const result = SystemInfoSchema.parse(minimalSystemInfo);
      expect(result).toEqual(minimalSystemInfo);
    });

    it("should reject invalid viewport dimensions", () => {
      const invalidViewport = {
        viewport: {
          width: -1,
          height: 1080,
        },
      };

      expect(() => SystemInfoSchema.parse(invalidViewport)).toThrow();
    });
  });

  describe("ContextInfoSchema", () => {
    it("should validate complete context info", () => {
      const validContext = {
        page: "Dashboard",
        route: "/dashboard",
        ui: { modal: "open" },
        data: { user: "test" },
      };

      const result = ContextInfoSchema.parse(validContext);
      expect(result).toEqual(validContext);
    });

    it("should accept empty context info", () => {
      const emptyContext = {};
      const result = ContextInfoSchema.parse(emptyContext);
      expect(result).toEqual(emptyContext);
    });
  });

  describe("BugReportSchema", () => {
    it("should validate a complete bug report", () => {
      const validReport = {
        title: "Test bug report",
        description: "Detailed description of the bug",
        steps: ["Step 1", "Step 2", "Step 3"],
        expectedBehavior: "Should work correctly",
        actualBehavior: "Does not work",
        severity: "high" as BugSeverity,
        labels: ["bug", "ui", "critical"],
        systemInfo: {
          browser: "Chrome",
          version: "120.0",
          userAgent: "Mozilla/5.0...",
        },
        contextInfo: {
          page: "Dashboard",
          route: "/dashboard",
        },
        screenshot: "data:image/png;base64,iVBORw0KGgoAAAANS...",
        appVersion: "2.0.0",
        timestamp: "2024-01-01T00:00:00.000Z",
        reportSource: "violet-vault-bug-reporter",
        reportVersion: "2.0.0",
        customData: { custom: "value" },
      };

      const result = BugReportSchema.parse(validReport);
      expect(result.title).toBe(validReport.title);
      expect(result.severity).toBe("high");
      expect(result.labels).toEqual(validReport.labels);
    });

    it("should validate minimal bug report", () => {
      const minimalReport = {
        title: "Simple bug",
      };

      const result = BugReportSchema.parse(minimalReport);
      expect(result.title).toBe("Simple bug");
      expect(result.severity).toBe("medium"); // Default value
      expect(result.labels).toEqual([]); // Default value
      expect(result.customData).toEqual({}); // Default value
    });

    it("should require title", () => {
      const reportWithoutTitle = {
        description: "Bug description",
      };

      expect(() => BugReportSchema.parse(reportWithoutTitle)).toThrow();
    });

    it("should reject empty title", () => {
      const reportWithEmptyTitle = {
        title: "",
      };

      expect(() => BugReportSchema.parse(reportWithEmptyTitle)).toThrow(
        "Bug report title is required"
      );
    });

    it("should reject title longer than 200 characters", () => {
      const reportWithLongTitle = {
        title: "x".repeat(201),
      };

      expect(() => BugReportSchema.parse(reportWithLongTitle)).toThrow(
        "Title must be 200 characters or less"
      );
    });

    it("should reject description longer than 5000 characters", () => {
      const reportWithLongDescription = {
        title: "Test bug",
        description: "x".repeat(5001),
      };

      expect(() => BugReportSchema.parse(reportWithLongDescription)).toThrow(
        "Description must be 5000 characters or less"
      );
    });

    it("should reject expectedBehavior longer than 1000 characters", () => {
      const reportWithLongExpected = {
        title: "Test bug",
        expectedBehavior: "x".repeat(1001),
      };

      expect(() => BugReportSchema.parse(reportWithLongExpected)).toThrow(
        "Expected behavior must be 1000 characters or less"
      );
    });

    it("should reject actualBehavior longer than 1000 characters", () => {
      const reportWithLongActual = {
        title: "Test bug",
        actualBehavior: "x".repeat(1001),
      };

      expect(() => BugReportSchema.parse(reportWithLongActual)).toThrow(
        "Actual behavior must be 1000 characters or less"
      );
    });

    it("should validate steps array", () => {
      const reportWithSteps = {
        title: "Test bug",
        steps: ["First step", "Second step", "Third step"],
      };

      const result = BugReportSchema.parse(reportWithSteps);
      expect(result.steps).toEqual(reportWithSteps.steps);
    });

    it("should validate labels array", () => {
      const reportWithLabels = {
        title: "Test bug",
        labels: ["bug", "ui", "high-priority"],
      };

      const result = BugReportSchema.parse(reportWithLabels);
      expect(result.labels).toEqual(reportWithLabels.labels);
    });
  });

  describe("validateBugReport", () => {
    it("should validate and return bug report", () => {
      const data = {
        title: "Test bug",
        description: "Test description",
      };

      const result = validateBugReport(data);
      expect(result.title).toBe("Test bug");
      expect(result.description).toBe("Test description");
    });

    it("should throw on invalid data", () => {
      const invalidData = {
        description: "Missing title",
      };

      expect(() => validateBugReport(invalidData)).toThrow();
    });
  });

  describe("validateBugReportSafe", () => {
    it("should return success for valid data", () => {
      const data = {
        title: "Test bug",
      };

      const result = validateBugReportSafe(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("Test bug");
      }
    });

    it("should return error for invalid data", () => {
      const invalidData = {
        title: "",
      };

      const result = validateBugReportSafe(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it("should provide detailed error information", () => {
      const invalidData = {
        title: "x".repeat(201),
        description: "x".repeat(5001),
      };

      const result = validateBugReportSafe(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe("validateBugReportPartial", () => {
    it("should validate partial bug report", () => {
      const partialData = {
        description: "Updated description",
      };

      const result = validateBugReportPartial(partialData);
      expect(result.description).toBe("Updated description");
    });

    it("should accept empty object for partial", () => {
      const result = validateBugReportPartial({});
      // Default values are still applied even in partial schemas
      expect(result.severity).toBe("medium");
      expect(result.labels).toEqual([]);
      expect(result.customData).toEqual({});
    });

    it("should still validate field constraints for provided fields", () => {
      const invalidPartial = {
        title: "x".repeat(201),
      };

      expect(() => validateBugReportPartial(invalidPartial)).toThrow();
    });
  });

  describe("Type exports", () => {
    it("should properly infer BugReport type", () => {
      const report: BugReport = {
        title: "Type test",
        severity: "medium",
        labels: [],
        customData: {},
      };

      expect(report.title).toBe("Type test");
    });

    it("should properly infer BugSeverity type", () => {
      const severity: BugSeverity = "high";
      expect(severity).toBe("high");
    });

    it("should properly infer SystemInfo type", () => {
      const systemInfo: SystemInfo = {
        browser: "Firefox",
        version: "119.0",
      };

      expect(systemInfo.browser).toBe("Firefox");
    });
  });
});
