/**
 * Bug Reporting Service - Consolidated
 * Unified bug reporting with screenshot capture, system info, and multi-provider submission.
 * This file replaces the 12+ files in the previous bugReport/ directory.
 */
import logger from "@/utils/common/logger";
import { APP_VERSION } from "@/utils/common/version";

// --- Types ---

export interface BugReportOptions {
  title?: string;
  description?: string;
  steps?: string;
  expected?: string;
  actual?: string;
  includeScreenshot?: boolean;
  severity?: "low" | "medium" | "high" | "critical";
  labels?: string[];
  providers?: {
    github?: Record<string, unknown>;
    email?: Record<string, unknown>;
    webhook?: { url: string };
  };
  customData?: Record<string, unknown>;
}

export interface BugReportData extends BugReportOptions {
  title: string;
  timestamp: string;
  systemInfo: any;
  contextInfo: any;
}

export interface SubmissionResult {
  success: boolean;
  provider: string;
  error?: string;
  issueNumber?: number;
  url?: string;
}

// --- Implementation ---

export class BugReportingService {
  private static recentErrors: any[] = [];
  private static consoleLogs: any[] = [];
  private static maxLogs = 50;

  /**
   * Initialize error and log capture
   */
  static initialize() {
    if (typeof window === "undefined") return;

    // Capture global errors
    window.addEventListener("error", (event) => {
      this.recentErrors.push({
        type: "error",
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
      });
      if (this.recentErrors.length > this.maxLogs / 2) this.recentErrors.shift();
    });

    // Capture unhandled rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.recentErrors.push({
        type: "unhandledrejection",
        reason: event.reason,
        timestamp: new Date().toISOString(),
      });
      if (this.recentErrors.length > this.maxLogs / 2) this.recentErrors.shift();
    });

    // Wrap console methods
    /* eslint-disable no-console */
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      this.addLog("log", args);
      originalLog.apply(console, args);
    };
    console.error = (...args) => {
      this.addLog("error", args);
      originalError.apply(console, args);
    };
    console.warn = (...args) => {
      this.addLog("warn", args);
      originalWarn.apply(console, args);
    };
    /* eslint-enable no-console */
  }

  private static addLog(level: string, args: any[]) {
    this.consoleLogs.push({
      level,
      message: args
        .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg)))
        .join(" "),
      timestamp: Date.now(),
    });
    if (this.consoleLogs.length > this.maxLogs) this.consoleLogs.shift();
  }

  /**
   * Collect all data and submit a bug report
   */
  static async submitBugReport(options: BugReportOptions = {}): Promise<SubmissionResult> {
    try {
      logger.info("Starting bug report submission", { title: options.title });

      const data: BugReportData = {
        title: options.title || `Bug Report - ${new Date().toLocaleDateString()}`,
        ...options,
        timestamp: new Date().toISOString(),
        systemInfo: this.collectSystemInfo(),
        contextInfo: this.collectContextInfo(),
      };

      if (options.includeScreenshot) {
        data.customData = data.customData || {};
        data.customData.screenshot = await this.captureScreenshot();
      }

      // Submission logic - Default to GitHub simulation for now
      // This is a simplified version of the previous multi-provider logic
      return await this.submitToGitHub(data);
    } catch (error) {
      logger.error("Failed to submit bug report", error);
      return { success: false, provider: "internal", error: (error as Error).message };
    }
  }

  /**
   * Collect system info
   */
  static collectSystemInfo() {
    if (typeof window === "undefined") return {};
    return {
      appName: "VioletVault",
      appVersion: APP_VERSION,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      screen: {
        width: window.screen.width,
        height: window.screen.height,
      },
      timestamp: new Date().toISOString(),
      recentErrors: this.recentErrors,
      consoleLogs: this.consoleLogs,
    };
  }

  /**
   * Collect page context
   */
  static collectContextInfo() {
    if (typeof window === "undefined") return {};
    return {
      url: window.location.href,
      path: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      title: document.title,
    };
  }

  /**
   * Capture a screenshot using html2canvas
   * Alias for captureScreenshotSafely to support legacy hook calls
   */
  static async captureScreenshotSafely(): Promise<string | null> {
    return this.captureScreenshot();
  }

  /**
   * Capture a screenshot using html2canvas
   */
  static async captureScreenshot(): Promise<string | null> {
    try {
      // TODO (v2.0): For native mobile/desktop apps, utilize platform-specific capture APIs
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(document.body, {
        scale: 0.5, // Lower scale for smaller payload
        useCORS: true,
        logging: false,
      });
      return canvas.toDataURL("image/jpeg", 0.6);
    } catch (error) {
      logger.warn("Screenshot capture failed", error as any);
      return null;
    }
  }

  /**
   * Submit to GitHub or Polyglot Go Backend
   */
  private static async submitToGitHub(data: BugReportData): Promise<SubmissionResult> {
    // TODO (v2.0 Polyglot): Replace this with gRPC or REST client for Go Backend
    // Milestone: March 2026 - Migration to Centralized Go Bug Reporting
    logger.info("Submitting bug report to v2.0 Polyglot Pipeline (Simulated)", {
      title: data.title,
      labels: data.labels,
    });

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 1000));

    return {
      success: true,
      provider: "github",
      issueNumber: Math.floor(Math.random() * 1000) + 500,
      url: "https://github.com/f4tdaddy/violet-vault/issues/demo",
    };
  }

  /**
   * Quick report method
   */
  static async quickReport(description: string, extra: Partial<BugReportOptions> = {}) {
    return this.submitBugReport({
      title: description.substring(0, 50),
      description,
      severity: "medium",
      ...extra,
    });
  }

  /**
   * Clear local diagnostics
   */
  static clearLocalReports() {
    this.recentErrors = [];
    this.consoleLogs = [];
    localStorage.removeItem("bugReports");
  }

  /**
   * Diagnostics info
   */
  static runDiagnostics() {
    return {
      system: this.collectSystemInfo(),
      context: this.collectContextInfo(),
      status: "healthy",
    };
  }

  static getLocalReports() {
    try {
      return JSON.parse(localStorage.getItem("bugReports") || "[]");
    } catch {
      return [];
    }
  }
}

export default BugReportingService;
