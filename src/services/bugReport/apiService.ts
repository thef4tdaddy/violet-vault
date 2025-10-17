/**
 * Bug Report API Service - Refactored
 * Main orchestrator for bug report submissions
 * Split into focused services for Issue #513
 */
import logger from "../../utils/common/logger";
import { GitHubAPIService } from "./githubApiService";
import { ReportSubmissionService } from "./reportSubmissionService";

export class BugReportAPIService {
  /**
   * Submit bug report to GitHub Issues API
   * @param {Object} reportData - Bug report data
   * @returns {Promise<Object>} Submission result
   */
  static async submitToGitHub(reportData) {
    const validation = this.validateReportData(reportData);
    if (!validation.isValid) {
      logger.error("Invalid report data for submission", validation);
      return {
        success: false,
        error: "Invalid report data",
        validationErrors: validation.errors,
      };
    }

    return GitHubAPIService.submitToGitHub(reportData);
  }

  /**
   * Submit bug report to webhook
   * @param {Object} reportData - Bug report data
   * @param {string} webhookUrl - Webhook URL
   * @returns {Promise<Object>} Submission result
   */
  static async submitToWebhook(reportData, webhookUrl) {
    return ReportSubmissionService.submitToWebhook(reportData, webhookUrl);
  }

  /**
   * Submit bug report to email
   * @param {Object} reportData - Bug report data
   * @param {Object} emailConfig - Email configuration
   * @returns {Promise<Object>} Submission result
   */
  static async submitToEmail(reportData, emailConfig) {
    return ReportSubmissionService.submitToEmail(reportData, emailConfig);
  }

  /**
   * Submit bug report with fallback providers
   * @param {Object} reportData - Bug report data
   * @param {Array} providers - Array of provider configurations
   * @returns {Promise<Object>} Submission result
   */
  static async submitWithFallbacks(reportData, providers = []) {
    const validation = this.validateReportData(reportData);
    if (!validation.isValid) {
      logger.error("Invalid report data for submission", validation);
      return {
        overallSuccess: false,
        error: "Invalid report data",
        validationErrors: validation.errors,
        attempts: 0,
        results: [],
      };
    }

    return ReportSubmissionService.submitWithFallbacks(reportData, providers);
  }

  /**
   * Validate bug report data
   * @param {Object} reportData - Report data to validate
   * @returns {Object} Validation result
   */
  static validateReportData(reportData) {
    const errors = [];
    const warnings = [];

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
   * @param {Object} reportData - Bug report data
   * @returns {string} Formatted issue body
   */
  static formatGitHubIssueBody(reportData) {
    return GitHubAPIService.formatGitHubIssueBody(reportData);
  }

  /**
   * Format console logs for GitHub - delegate to GitHubAPIService
   * @param {Array} errors - Error array
   * @returns {string} Formatted error information
   */
  static formatConsoleLogsForGitHub(errors) {
    return GitHubAPIService.formatConsoleLogsForGitHub(errors);
  }

  /**
   * Get submission statistics - delegate to ReportSubmissionService
   * @returns {Object} Submission statistics
   */
  static getSubmissionStats() {
    return ReportSubmissionService.getSubmissionStats();
  }

  /**
   * Clear stored bug reports - delegate to ReportSubmissionService
   */
  static clearStoredReports() {
    return ReportSubmissionService.clearStoredReports();
  }

  /**
   * Get supported providers
   * @returns {Array} Array of supported provider types
   */
  static getSupportedProviders() {
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
