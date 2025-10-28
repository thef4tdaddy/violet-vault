/**
 * Bug Report API Service - Refactored
 * Main orchestrator for bug report submissions
 * Split into focused services for Issue #513
 */
import logger from "../../utils/common/logger";
import { GitHubAPIService } from "./githubApiService";
import { ReportSubmissionService } from "./reportSubmissionService";

/**
 * System information structure
 */
interface SystemInfo {
  browser?: string;
  version?: string;
  platform?: string;
  userAgent?: string;
  viewport?: {
    width: number;
    height: number;
  };
  performance?: Record<string, unknown>;
  storage?: Record<string, unknown>;
  network?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Bug report data structure
 */
export interface BugReportData {
  title: string;
  description?: string;
  severity?: "low" | "medium" | "high" | "critical";
  labels?: string[];
  systemInfo?: SystemInfo;
  screenshot?: string;
  steps?: string[];
  expectedBehavior?: string;
  actualBehavior?: string;
  [key: string]: unknown;
}

/**
 * Validation result structure
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Submission result structure
 */
export interface SubmissionResult {
  success: boolean;
  error?: string;
  validationErrors?: string[];
  [key: string]: unknown;
}

/**
 * Fallback submission result
 */
export interface FallbackSubmissionResult {
  overallSuccess: boolean;
  error?: string;
  validationErrors?: string[];
  attempts: number;
  results: unknown[];
  success: boolean;
  submissionId?: string;
  primaryProvider?: string;
  screenshotStatus?: {
    captured: boolean;
    size: number;
    uploaded: boolean;
    reason?: string;
  };
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  type: "github" | "webhook" | "email" | "console";
  config?: Record<string, unknown>;
  url?: string;
  primary?: boolean;
}

/**
 * Supported provider information
 */
export interface SupportedProvider {
  type: string;
  name: string;
  description: string;
  available: boolean;
}

export class BugReportAPIService {
  /**
   * Submit bug report to GitHub Issues API
   */
  static async submitToGitHub(reportData: BugReportData): Promise<SubmissionResult> {
    const validation = this.validateReportData(reportData);
    if (!validation.isValid) {
      logger.error("Invalid report data for submission", validation);
      return {
        success: false,
        error: "Invalid report data",
        validationErrors: validation.errors,
      };
    }

    return GitHubAPIService.submitToGitHub(reportData as never);
  }

  /**
   * Submit bug report to webhook
   */
  static async submitToWebhook(
    reportData: BugReportData,
    webhookUrl: string
  ): Promise<SubmissionResult> {
    return ReportSubmissionService.submitToWebhook(reportData, webhookUrl);
  }

  /**
   * Submit bug report to email
   */
  static async submitToEmail(
    reportData: BugReportData,
    emailConfig: Record<string, unknown>
  ): Promise<SubmissionResult> {
    return ReportSubmissionService.submitToEmail(reportData, emailConfig);
  }

  /**
   * Submit bug report with fallback providers
   */
  static async submitWithFallbacks(
    reportData: BugReportData,
    providers: ProviderConfig[] = []
  ): Promise<FallbackSubmissionResult> {
    const validation = this.validateReportData(reportData);
    if (!validation.isValid) {
      logger.error("Invalid report data for submission", validation);
      return {
        success: false,
        overallSuccess: false,
        error: "Invalid report data",
        validationErrors: validation.errors,
        attempts: 0,
        results: [],
      };
    }

    return ReportSubmissionService.submitWithFallbacks(reportData as never, providers);
  }

  /**
   * Validate bug report data
   */
  static validateReportData(reportData: BugReportData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validations
    if (!reportData || typeof reportData !== "object") {
      errors.push("Report data must be an object");
      return { isValid: false, errors, warnings };
    }

    // Required fields
    if (
      !reportData.title ||
      typeof reportData.title !== "string" ||
      reportData.title.trim().length === 0
    ) {
      errors.push("Title is required and must be a non-empty string");
    }

    if (
      !reportData.description ||
      typeof reportData.description !== "string" ||
      reportData.description.trim().length === 0
    ) {
      warnings.push("Description is recommended for better bug reports");
    }

    // Optional field validations
    if (
      reportData.severity &&
      !["low", "medium", "high", "critical"].includes(reportData.severity)
    ) {
      warnings.push("Severity should be one of: low, medium, high, critical");
    }

    if (reportData.labels && !Array.isArray(reportData.labels)) {
      warnings.push("Labels should be an array");
    }

    // Content length checks
    if (reportData.title && reportData.title.length > 500) {
      warnings.push("Title is very long and may be truncated");
    }

    if (reportData.description && reportData.description.length > 10000) {
      warnings.push("Description is very long and may be truncated");
    }

    // System info validation
    if (reportData.systemInfo && typeof reportData.systemInfo !== "object") {
      warnings.push("System info should be an object");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Format GitHub issue body - delegate to GitHubAPIService
   */
  static formatGitHubIssueBody(reportData: BugReportData): string {
    return GitHubAPIService.formatGitHubIssueBody(reportData);
  }

  /**
   * Format console logs for GitHub - delegate to GitHubAPIService
   */
  static formatConsoleLogsForGitHub(errors: unknown[]): string {
    return GitHubAPIService.formatConsoleLogsForGitHub(errors as never);
  }

  /**
   * Get submission statistics - delegate to ReportSubmissionService
   */
  static getSubmissionStats(): Record<string, unknown> {
    return ReportSubmissionService.getSubmissionStats();
  }

  /**
   * Clear stored bug reports - delegate to ReportSubmissionService
   */
  static clearStoredReports(): void {
    ReportSubmissionService.clearStoredReports();
  }

  /**
   * Get supported providers
   */
  static getSupportedProviders(): SupportedProvider[] {
    return [
      {
        type: "github",
        name: "GitHub Issues",
        description: "Submit bug reports as GitHub issues",
        available: true,
      },
      {
        type: "webhook",
        name: "Webhook",
        description: "Submit to custom webhook endpoint",
        available: true,
      },
      {
        type: "email",
        name: "Email",
        description: "Send bug reports via email",
        available: false, // Not yet implemented
      },
      {
        type: "console",
        name: "Console Logging",
        description: "Fallback logging to console and localStorage",
        available: true,
      },
    ];
  }
}

// Maintain backward compatibility by re-exporting sub-services
export { GitHubAPIService, ReportSubmissionService };
