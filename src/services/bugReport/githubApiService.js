/**
 * GitHub API Service
 * Handles GitHub Issues integration for bug reports
 * Extracted from apiService.js for Issue #513
 */
import logger from "../../utils/common/logger";

export class GitHubAPIService {
  /**
   * Submit bug report to GitHub Issues API
   * @param {Object} reportData - Bug report data
   * @returns {Promise<Object>} Submission result
   */
  static async submitToGitHub(reportData) {
    try {
      logger.debug("Submitting bug report to GitHub", {
        title: reportData.title,
      });

      const issueBody = this.formatGitHubIssueBody(reportData);
      const labels = [...(reportData.labels || []), "bug", "automated-report"];

      const payload = {
        title: reportData.title,
        body: issueBody,
        labels: labels,
      };

      // Note: This would typically require GitHub API credentials
      // For now, we'll simulate the API call and return success
      const result = await this.makeGitHubAPICall(payload);

      if (result.success) {
        logger.info("Bug report submitted successfully to GitHub", {
          issueNumber: result.issueNumber,
          url: result.url,
        });

        return {
          success: true,
          issueNumber: result.issueNumber,
          url: result.url,
          provider: "github",
        };
      } else {
        logger.error("GitHub bug report submission failed", result);
        return {
          success: false,
          error: result.error,
          provider: "github",
        };
      }
    } catch (error) {
      logger.error("GitHub API submission error", error);
      return {
        success: false,
        error: error.message,
        provider: "github",
      };
    }
  }

  /**
   * Format bug report data into GitHub issue body
   * @param {Object} reportData - Bug report data
   * @returns {string} Formatted issue body
   */
  static formatGitHubIssueBody(reportData) {
    const sections = [
      "## Bug Description",
      reportData.description || "No description provided",
      "",
      "## Steps to Reproduce",
      reportData.steps || "No steps provided",
      "",
      "## Expected Behavior",
      reportData.expected || "No expected behavior specified",
      "",
      "## Actual Behavior",
      reportData.actual || "No actual behavior specified",
      "",
      "## System Information",
      "```json",
      JSON.stringify(reportData.systemInfo, null, 2),
      "```",
      "",
      "## Console Logs & Errors",
      this.formatConsoleLogsForGitHub(reportData.systemInfo?.errors),
      "",
    ];

    if (reportData.logs && reportData.logs.length > 0) {
      sections.push(
        "## Console Logs",
        "```",
        reportData.logs.slice(-20).join("\n"), // Last 20 log entries
        "```",
        "",
      );
    }

    if (reportData.screenshot) {
      // GitHub Issues can't display base64 data URLs directly
      // Instead, provide information about the screenshot
      const screenshotInfo = reportData.screenshot.includes("data:image")
        ? "Screenshot captured (base64 data - view in bug report tool)"
        : reportData.screenshot;

      sections.push(
        "## Screenshot",
        reportData.screenshot.startsWith("data:image")
          ? `📸 Screenshot captured (${reportData.screenshot.length} chars) - available in original bug report data`
          : `![Bug Screenshot](${reportData.screenshot})`,
        "",
      );
    }

    if (reportData.sessionUrl) {
      sections.push(
        "## Session Replay",
        `[View Session Recording](${reportData.sessionUrl})`,
        "",
        "**Note:** Session replay may contain sensitive information. Review before sharing.",
        "",
      );
    }

    sections.push(
      "---",
      `**Severity:** ${reportData.severity || "Medium"}`,
      `**Reporter:** Automated Bug Reporter`,
      `**Timestamp:** ${new Date().toISOString()}`,
      "",
      "_This issue was automatically generated from a user bug report._",
    );

    return sections.join("\n");
  }

  /**
   * Format console logs and errors for GitHub
   * @param {Array} errors - Error array from system info
   * @returns {string} Formatted error information
   */
  static formatConsoleLogsForGitHub(errors) {
    if (!errors || errors.length === 0) {
      return "No recent errors captured.";
    }

    const errorSections = ["### Recent JavaScript Errors", ""];

    // Show last 5 errors to avoid overwhelming the issue
    const recentErrors = errors.slice(-5);

    recentErrors.forEach((error, index) => {
      errorSections.push(
        `**Error ${index + 1}:**`,
        "```javascript",
        `Message: ${error.message || "Unknown error"}`,
        `Stack: ${error.stack || "No stack trace"}`,
        `File: ${error.filename || "Unknown"} (Line: ${error.lineno || "?"})`,
        `Timestamp: ${error.timestamp || "Unknown"}`,
        "```",
        "",
      );
    });

    if (errors.length > 5) {
      errorSections.push(`_... and ${errors.length - 5} more errors_`);
    }

    return errorSections.join("\n");
  }

  /**
   * Make actual GitHub API call
   * @param {Object} payload - Issue payload
   * @returns {Promise<Object>} API response
   */
  static async makeGitHubAPICall(payload) {
    try {
      // This is a placeholder for actual GitHub API integration
      // In a real implementation, you would:
      // 1. Set up GitHub App or Personal Access Token
      // 2. Make authenticated request to GitHub Issues API
      // 3. Handle rate limiting and errors properly

      logger.debug("GitHub API call payload", payload);

      // Simulate API call with delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate successful response
      const simulatedResponse = {
        success: true,
        issueNumber: Math.floor(Math.random() * 1000) + 100,
        url: `https://github.com/your-repo/issues/${Math.floor(Math.random() * 1000) + 100}`,
      };

      logger.info("GitHub API call completed", simulatedResponse);
      return simulatedResponse;
    } catch (error) {
      logger.error("GitHub API call failed", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Validate GitHub-specific report data
   * @param {Object} reportData - Report data to validate
   * @returns {Object} Validation result
   */
  static validateReportData(reportData) {
    const errors = [];
    const warnings = [];

    // Required fields for GitHub
    if (!reportData.title || reportData.title.trim().length === 0) {
      errors.push("Title is required for GitHub issues");
    }

    if (!reportData.description || reportData.description.trim().length === 0) {
      warnings.push("Description is recommended for better issue quality");
    }

    // GitHub-specific validations
    if (reportData.title && reportData.title.length > 256) {
      warnings.push("Title is very long and may be truncated");
    }

    if (reportData.labels && reportData.labels.length > 10) {
      warnings.push("Too many labels may clutter the issue");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      provider: "github",
    };
  }
}
